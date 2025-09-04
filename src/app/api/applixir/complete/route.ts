import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyToken } from '@/lib/server-token';
import { CREDIT_POLICY } from '@/constants';

function todayMidnightTs(now: number = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { token }: { token?: string } = await req.json();
    if (!token)
      return NextResponse.json(
        { ok: false, error: 'bad_request' },
        { status: 400 }
      );

    // Read AID from httpOnly cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const aidCookie = cookieHeader
      .split(';')
      .map((v) => v.trim())
      .find((v) => v.startsWith('aid='));
    const aidFromCookie = aidCookie
      ? decodeURIComponent(aidCookie.split('=')[1] || '')
      : '';
    if (!aidFromCookie)
      return NextResponse.json(
        { ok: false, error: 'aid_cookie_missing' },
        { status: 400 }
      );

    const payload = verifyToken(token); // throws on invalid/expired

    // Aid must match the one bound to this browser via cookie
    if (payload.aid !== aidFromCookie) {
      return NextResponse.json(
        { ok: false, error: 'aid_mismatch' },
        { status: 400 }
      );
    }

    // Ensure nonce is still issued and unused
    const nonceRef = adminDb.collection('applixir_nonces').doc(token);
    const nonceSnap = await nonceRef.get();
    if (!nonceSnap.exists)
      return NextResponse.json(
        { ok: false, error: 'nonce_not_found' },
        { status: 400 }
      );
    const nonce = nonceSnap.data() as {
      status?: string;
      ip?: string | null;
      ua?: string | null;
      origin?: string | null;
      referer?: string | null;
      baselineEarned?: number;
      baselineResetAt?: number;
    };
    if (nonce.status !== 'issued')
      return NextResponse.json(
        { ok: false, error: 'nonce_consumed' },
        { status: 409 }
      );

    // Context validation (anti-token-theft)
    const currIp = req.headers.get('x-forwarded-for') || null;
    const currUa = req.headers.get('user-agent') || null;
    const currOrigin = req.headers.get('origin') || null;
    const currReferer = req.headers.get('referer') || null;
    const mismatch =
      (nonce.ip && currIp && nonce.ip !== currIp) ||
      (nonce.ua && currUa && nonce.ua !== currUa) ||
      (nonce.origin && currOrigin && nonce.origin !== currOrigin) ||
      (nonce.referer && currReferer && nonce.referer !== currReferer);
    if (mismatch) {
      return NextResponse.json(
        { ok: false, error: 'context_mismatch' },
        { status: 409 }
      );
    }

    const aidRef = adminDb.collection('applixir_counters').doc(payload.aid);
    const now = Date.now();
    const resetKey = todayMidnightTs(now);

    // Mark nonce redeemed and update counters atomically, with fresh reads inside tx
    const capResult = await adminDb.runTransaction(async (tx) => {
      const n = await tx.get(nonceRef);
      if (!n.exists) throw new Error('nonce_missing');
      if (n.data()?.status !== 'issued') throw new Error('nonce_already_used');

      // Read counters fresh
      const cs = await tx.get(aidRef);
      let todayEarned = 0;
      let lastEarnedAt = 0;
      let lastResetAt = resetKey;
      if (cs.exists) {
        const d = cs.data() as {
          todayEarned?: number;
          lastEarnedAt?: number;
          lastResetAt?: number;
        };
        todayEarned = d.todayEarned ?? 0;
        lastEarnedAt = d.lastEarnedAt ?? 0;
        lastResetAt = d.lastResetAt ?? resetKey;
      }
      if (lastResetAt !== resetKey) {
        todayEarned = 0;
        lastEarnedAt = 0;
        lastResetAt = resetKey;
      }

      const since = now - (lastEarnedAt || 0);
      const overCap = todayEarned >= CREDIT_POLICY.dailyCap;
      const allowOverCapOnce =
        (nonce.baselineResetAt ?? resetKey) === resetKey &&
        (nonce.baselineEarned ?? 0) <= CREDIT_POLICY.dailyCap;
      if (since < CREDIT_POLICY.cooldownMs) {
        return {
          ok: false,
          error: 'cooldown' as const,
          msToNext: CREDIT_POLICY.cooldownMs - since,
        };
      }
      if (overCap && !allowOverCapOnce) {
        return {
          ok: false,
          error: 'daily_cap' as const,
          debug: {
            todayEarned,
            dailyCap: CREDIT_POLICY.dailyCap,
            baselineEarned: nonce.baselineEarned ?? null,
            baselineResetAt: nonce.baselineResetAt ?? null,
            resetKey,
          },
        };
      }

      // Proceed to redeem
      tx.update(nonceRef, { status: 'redeemed', redeemedAt: now });
      const willEarn = CREDIT_POLICY.rewardAmount;
      tx.set(
        aidRef,
        { todayEarned: todayEarned + willEarn, lastEarnedAt: now, lastResetAt },
        { merge: true }
      );
      const events = adminDb.collection('applixir_events');
      tx.set(events.doc(), {
        ts: now,
        kind: 'reward_granted',
        aid: payload.aid,
        cid: payload.cid,
        token,
        amount: willEarn,
      });
      return { ok: true as const };
    });

    if (!capResult.ok) {
      if (capResult.error === 'cooldown') {
        return NextResponse.json(
          { ok: false, error: 'cooldown', msToNext: capResult.msToNext },
          { status: 429 }
        );
      }
      // daily_cap with debug information
      return NextResponse.json(
        {
          ok: false,
          error: 'daily_cap',
          ...(capResult.debug ? { debug: capResult.debug } : {}),
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/applixir/complete] error', e);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
