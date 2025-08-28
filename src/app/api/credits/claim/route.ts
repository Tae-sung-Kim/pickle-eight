import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID, createHmac } from 'crypto';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { DocumentSnapshot } from 'firebase-admin/firestore';

const CREDIT_AMOUNT = 5 as const; // 하루 기본 지급 크레딧
const MAX_PER_IP_PER_DAY = 3 as const;
const MAX_PER_DEVICE_PER_DAY = 1 as const;
const DEVICE_COOKIE = 'did' as const;

const dateKey = (): string => {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
};

const getClientIp = (req: NextRequest): string | null => {
  const h = req.headers;
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    null
  );
};

const sign = (val: string): string => {
  const secret = process.env.DEVICE_COOKIE_SECRET || 'dev-secret';
  return createHmac('sha256', secret).update(val).digest('hex');
};

/**
 * Verify existing device cookie signature; if invalid or missing, issue a new signed value.
 */
const parseOrIssueDeviceId = async (): Promise<{
  deviceId: string;
  set?: string;
}> => {
  const store = await cookies();
  const existing = store.get(DEVICE_COOKIE)?.value;
  if (existing) {
    const [raw, sig] = existing.split('.');
    if (raw && sig && sign(raw) === sig) {
      return { deviceId: existing };
    }
  }
  const raw = randomUUID();
  const signed = `${raw}.${sign(raw)}`;
  return { deviceId: signed, set: signed };
};

type CountDoc = { readonly count?: number };
const getCountFromSnap = (snap: DocumentSnapshot): number => {
  if (!snap.exists) return 0;
  const data = snap.data() as CountDoc | undefined;
  return typeof data?.count === 'number' ? data.count : 0;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify Firebase ID token (anonymous allowed)
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

    const ip = getClientIp(req);
    const ua = req.headers.get('user-agent') ?? 'unknown';
    const day = dateKey();
    const { deviceId, set } = await parseOrIssueDeviceId();

    const userRef = adminDb.collection('users').doc(uid);
    const dailyClaimRef = adminDb
      .collection('credit-claims')
      .doc(`${uid}_${day}`);
    const deviceDailyRef = adminDb
      .collection('device-claims')
      .doc(`${deviceId}_${day}`);
    const ipDailyRef = ip
      ? adminDb.collection('ip-claims').doc(`${ip}_${day}`)
      : null;

    const result = await adminDb.runTransaction(async (tx) => {
      const [userSnap, dailySnap, deviceSnap, ipSnap] = await Promise.all([
        tx.get(userRef),
        tx.get(dailyClaimRef),
        tx.get(deviceDailyRef),
        ipDailyRef ? tx.get(ipDailyRef) : Promise.resolve(null),
      ]);

      // 멱등성: 이미 오늘 수령했으면 차단
      if (dailySnap.exists) {
        return { ok: true, already: true } as const;
      }

      // 장치 제한
      const deviceCount = getCountFromSnap(deviceSnap);
      if (deviceCount >= MAX_PER_DEVICE_PER_DAY) {
        return { ok: false, code: 'limit/device' } as const;
      }

      // IP 제한
      const ipCount = ipSnap ? getCountFromSnap(ipSnap) : 0;
      if (ipCount >= MAX_PER_IP_PER_DAY) {
        return { ok: false, code: 'limit/ip' } as const;
      }

      const now = new Date();
      // 유저 문서
      if (!userSnap.exists) {
        tx.set(userRef, {
          credits: CREDIT_AMOUNT,
          createdAt: now,
          updatedAt: now,
          lastClaimDate: day,
        });
      } else {
        const prev = userSnap.data();
        const credits = (prev?.credits as number) + CREDIT_AMOUNT;
        tx.update(userRef, { credits, updatedAt: now, lastClaimDate: day });
      }

      // 클레임 기록
      tx.set(dailyClaimRef, {
        uid,
        day,
        ip: ip ?? 'unknown',
        ua,
        deviceId,
        amount: CREDIT_AMOUNT,
        createdAt: now,
      });

      // 디바이스/IP 카운팅
      tx.set(
        deviceDailyRef,
        { deviceId, day, count: deviceCount + 1, updatedAt: now },
        { merge: true }
      );
      if (ipDailyRef) {
        tx.set(
          ipDailyRef,
          { ip, day, count: ipCount + 1, updatedAt: now },
          { merge: true }
        );
      }

      return { ok: true, already: false } as const;
    });

    const res = NextResponse.json(result, { status: 200 });
    if (set) {
      res.cookies.set(DEVICE_COOKIE, set, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: 60 * 60 * 24 * 365, // 1y
        path: '/',
      });
    }
    return res;
  } catch (e) {
    return NextResponse.json(
      { ok: false, code: 'internal', message: 'Unexpected error_' + e },
      { status: 500 }
    );
  }
}
