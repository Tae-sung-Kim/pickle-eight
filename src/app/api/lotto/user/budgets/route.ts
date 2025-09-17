import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { LottoBudgetDocType } from "@/types/lotto.type";
import { NextRequest, NextResponse } from 'next/server';

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

function currentMonthStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
}

export async function GET(req: NextRequest) {
  const uid = await verifyUid(req);
  if (!uid) return bad(401, 'auth/missing_or_invalid');
  try {
    const docRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('budgets')
      .doc('lotto');
    const snap = await docRef.get();
    if (!snap.exists) {
      const payload: LottoBudgetDocType = {
        id: 'lotto',
        currentMonth: currentMonthStr(),
        monthlyCap: 0,
        spent: 0,
        warningsShown: [],
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json({ ok: true, data: payload }, { status: 200 });
    }
    const v = snap.data() as Record<string, unknown>;
    const data: LottoBudgetDocType = {
      id: 'lotto',
      currentMonth: String(v.currentMonth ?? currentMonthStr()),
      monthlyCap: Number(v.monthlyCap ?? 0),
      spent: Number(v.spent ?? 0),
      warningsShown: (Array.isArray(v.warningsShown)
        ? (v.warningsShown as string[])
        : []) as readonly string[],
      updatedAt: new Date(String(v.updatedAt ?? new Date())).toISOString(),
    };
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch {
    return bad(500, 'internal/get_failed');
  }
}

export async function POST(req: NextRequest) {
  const uid = await verifyUid(req);
  if (!uid) return bad(401, 'auth/missing_or_invalid');
  try {
    const body = (await req.json()) as Partial<LottoBudgetDocType>;
    const month =
      body.currentMonth && /^[0-9]{4}-[0-9]{2}$/.test(body.currentMonth)
        ? body.currentMonth
        : currentMonthStr();
    const payload = {
      currentMonth: month,
      monthlyCap: Math.max(0, Math.floor(Number(body.monthlyCap ?? 0))),
      spent: Math.max(0, Math.floor(Number(body.spent ?? 0))),
      warningsShown: Array.isArray(body.warningsShown)
        ? body.warningsShown
        : [],
      updatedAt: new Date(),
    } as const;
    const docRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('budgets')
      .doc('lotto');
    await docRef.set(payload, { merge: true });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return bad(500, 'internal/save_failed');
  }
}
