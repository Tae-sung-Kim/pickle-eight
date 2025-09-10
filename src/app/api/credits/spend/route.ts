import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import {
  CREDIT_POLICY,
  CREDIT_REFILL_INTERVAL_MS,
  CREDIT_REFILL_AMOUNT,
} from '@/constants';
import { currentResetKey } from '@/utils';

type UserCreditDoc = {
  credits?: number;
  lastResetAt?: number;
  lastRefillAt?: number;
  refillArmed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

function ensureReset(
  doc: Required<UserCreditDoc>,
  now: number
): Required<UserCreditDoc> {
  const key = currentResetKey(now);
  if (doc.lastResetAt !== key) {
    return {
      credits: CREDIT_POLICY.baseDaily,
      lastResetAt: key,
      lastRefillAt: 0,
      refillArmed: false,
      createdAt: doc.createdAt,
      updatedAt: new Date(now),
    };
  }
  return doc;
}

function ensureRefill(
  doc: Required<UserCreditDoc>,
  now: number
): Required<UserCreditDoc> {
  if (CREDIT_REFILL_INTERVAL_MS <= 0) return doc;
  if (!doc.refillArmed) return doc;
  if (typeof doc.lastRefillAt !== 'number' || doc.lastRefillAt <= 0) return doc;
  if ((doc.credits ?? 0) >= CREDIT_POLICY.dailyCap) {
    return { ...doc, lastRefillAt: 0, refillArmed: false };
  }
  const elapsed = now - doc.lastRefillAt;
  if (elapsed < CREDIT_REFILL_INTERVAL_MS) return doc;
  const steps = Math.floor(elapsed / CREDIT_REFILL_INTERVAL_MS);
  if (steps <= 0) return doc;
  const add = steps * CREDIT_REFILL_AMOUNT;
  const nextCredits = Math.min(
    CREDIT_POLICY.dailyCap,
    (doc.credits ?? 0) + add
  );
  const backToCap = nextCredits >= CREDIT_POLICY.dailyCap;
  return {
    ...doc,
    credits: nextCredits,
    lastRefillAt: backToCap
      ? 0
      : doc.lastRefillAt + steps * CREDIT_REFILL_INTERVAL_MS,
    refillArmed: backToCap ? false : doc.refillArmed,
    updatedAt: new Date(now),
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get('authorization');
    const idToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;
    if (!idToken) {
      return NextResponse.json(
        { ok: false, code: 'auth/missing' },
        { status: 401 }
      );
    }
    let uid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json(
        { ok: false, code: 'auth/invalid' },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => null)) as {
      amount?: number;
    } | null;
    const amount =
      typeof body?.amount === 'number' ? Math.floor(body.amount) : NaN;
    if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000) {
      return NextResponse.json(
        { ok: false, code: 'bad-request' },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection('users').doc(uid);
    const result = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      const now = Date.now();
      let base: Required<UserCreditDoc>;
      if (!snap.exists) {
        base = {
          credits: CREDIT_POLICY.baseDaily,
          lastResetAt: currentResetKey(now),
          lastRefillAt: 0,
          refillArmed: false,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        };
      } else {
        const data = (snap.data() as UserCreditDoc) || {};
        base = {
          credits: Math.max(0, Math.floor(data.credits ?? 0)),
          lastResetAt:
            typeof data.lastResetAt === 'number' ? data.lastResetAt : 0,
          lastRefillAt:
            typeof data.lastRefillAt === 'number' ? data.lastRefillAt : 0,
          refillArmed: Boolean(data.refillArmed),
          createdAt: data.createdAt ?? new Date(now),
          updatedAt: new Date(now),
        };
      }

      // Apply reset then refill
      let doc = ensureReset(base, now);
      doc = ensureRefill(doc, now);

      if ((doc.credits ?? 0) < amount) {
        // Persist ensured doc state before returning
        tx.set(userRef, doc, { merge: true });
        return {
          ok: false,
          code: 'insufficient',
          credits: doc.credits ?? 0,
          lastRefillAt:
            typeof doc.lastRefillAt === 'number' ? doc.lastRefillAt : 0,
          refillArmed: Boolean(doc.refillArmed),
        } as const;
      }

      // Spend
      const nextCredits = (doc.credits ?? 0) - amount;
      const fallingBelowCap = nextCredits < CREDIT_POLICY.dailyCap;
      const next: Required<UserCreditDoc> = {
        ...doc,
        credits: nextCredits,
        // arm refill when below cap
        refillArmed: fallingBelowCap ? true : false,
        lastRefillAt: fallingBelowCap
          ? doc.lastRefillAt && doc.lastRefillAt > 0
            ? doc.lastRefillAt
            : now
          : 0,
        updatedAt: new Date(now),
      };
      tx.set(userRef, next, { merge: true });
      return {
        ok: true,
        credits: next.credits ?? 0,
        lastRefillAt:
          typeof next.lastRefillAt === 'number' ? next.lastRefillAt : 0,
        refillArmed: Boolean(next.refillArmed),
      } as const;
    });

    const status = result.ok ? 200 : 409;
    return NextResponse.json(result, { status });
  } catch (e) {
    return NextResponse.json(
      { ok: false, code: 'internal', message: 'Unexpected error_' + e },
      { status: 500 }
    );
  }
}
