import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { LottoGenerationLogType, LottoGenerateFiltersType } from '@/types';

function bad(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function verifyUid(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  const idToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;
  if (!idToken) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

const COOLDOWN_MS = 5000; // 5s
const HOURLY_CAP = 120; // per user

export async function GET(req: NextRequest) {
  const uid = await verifyUid(req);
  if (!uid) return bad(401, 'auth/missing_or_invalid');
  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get('limit') || 30))
  );
  try {
    const col = adminDb
      .collection('users')
      .doc(uid)
      .collection('lotto_generation_logs');
    const snap = await col.orderBy('ts', 'desc').limit(limit).get();
    const data: LottoGenerationLogType[] = snap.docs.map((d) => {
      const v = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        ts: String(v.ts ?? ''),
        rngType: (v.rngType as 'webcrypto' | 'math') || 'webcrypto',
        seed: (v.seed as string) || undefined,
        filters: (v.filters as LottoGenerateFiltersType) || undefined,
        clickCount: Number(v.clickCount ?? 0),
        ipHash: (v.ipHash as string) || undefined,
        userAgent: (v.userAgent as string) || undefined,
      };
    });
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch {
    return bad(500, 'internal/list_failed');
  }
}

export async function POST(req: NextRequest) {
  const uid = await verifyUid(req);
  if (!uid) return bad(401, 'auth/missing_or_invalid');
  try {
    const body = (await req.json()) as Partial<LottoGenerationLogType>;
    const now = Date.now();
    const metaRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('lotto_generation_meta')
      .doc('rate');
    const logsCol = adminDb
      .collection('users')
      .doc(uid)
      .collection('lotto_generation_logs');

    // rate control in transaction
    await adminDb.runTransaction(async (tx) => {
      const metaSnap = await tx.get(metaRef);
      const meta = (
        metaSnap.exists ? (metaSnap.data() as Record<string, unknown>) : {}
      ) as {
        lastAt?: number;
        hourKey?: number;
        hourCount?: number;
      };
      const lastAt = Number(meta.lastAt ?? 0);
      if (now - lastAt < COOLDOWN_MS) throw new Error('rate/cooldown');
      const hourKey = Math.floor(now / (60 * 60 * 1000));
      const prevKey = Number(meta.hourKey ?? 0);
      const prevCount = Number(meta.hourCount ?? 0);
      const nextCount = hourKey === prevKey ? prevCount + 1 : 1;
      if (nextCount > HOURLY_CAP) throw new Error('rate/hourly_cap');
      tx.set(
        metaRef,
        { lastAt: now, hourKey, hourCount: nextCount },
        { merge: true }
      );
    });

    // write log (outside transaction ok)
    const doc = {
      ts: new Date(now).toISOString(),
      rngType: body.rngType ?? 'webcrypto',
      seed: body.seed ?? null,
      filters: body.filters ?? null,
      clickCount: Number(body.clickCount ?? 0),
      userAgent: req.headers.get('user-agent') || null,
      // optional ip hash: we avoid storing raw IP for privacy. Keep null for now.
      ipHash: null,
    } as const;

    await logsCol.add(doc);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'internal/save_failed';
    if (msg.startsWith('rate/')) return bad(429, msg);
    return bad(500, 'internal/save_failed');
  }
}
