import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { LottoNumberSetType } from "@/types/lotto.type";
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

export async function GET(req: NextRequest) {
  const uid = await verifyUid(req);
  if (!uid) return bad(401, 'auth/missing_or_invalid');
  try {
    const snap = await adminDb
      .collection('users')
      .doc(uid)
      .collection('lotto_number_sets')
      .orderBy('updatedAt', 'desc')
      .get();
    const data: LottoNumberSetType[] = snap.docs.map((d) => {
      const v = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        numbers: (v.numbers as number[])
          .slice(0, 6)
          .sort((a, b) => a - b) as unknown as LottoNumberSetType['numbers'],
        label: (v.label as string) || undefined,
        tags: (Array.isArray(v.tags) ? (v.tags as string[]) : undefined) as
          | readonly string[]
          | undefined,
        isFavorite: Boolean(v.isFavorite),
        createdAt: (v.createdAt as unknown as Date | string | undefined)
          ? String(v.createdAt)
          : undefined,
        updatedAt: (v.updatedAt as unknown as Date | string | undefined)
          ? String(v.updatedAt)
          : undefined,
      } satisfies LottoNumberSetType;
    });
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (e) {
    return bad(500, 'internal/list_failed' + e);
  }
}

export async function POST(req: NextRequest) {
  const uid = await verifyUid(req);
  if (!uid) return bad(401, 'auth/missing_or_invalid');
  try {
    const body = (await req.json()) as Partial<LottoNumberSetType>;
    const numbers = Array.isArray(body.numbers) ? body.numbers.map(Number) : [];
    if (numbers.length !== 6) return bad(400, 'invalid/numbers');
    const docData = {
      numbers: numbers.slice(0, 6).sort((a, b) => a - b),
      label: body.label ?? null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      isFavorite: Boolean(body.isFavorite),
      updatedAt: new Date(),
      ...(body.id ? {} : { createdAt: new Date() }),
    } as const;

    const col = adminDb
      .collection('users')
      .doc(uid)
      .collection('lotto_number_sets');
    let id = body.id;
    if (id) {
      await col.doc(id).set(docData, { merge: true });
    } else {
      const ref = await col.add(docData);
      id = ref.id;
    }
    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch (e) {
    return bad(500, 'internal/save_failed _' + e);
  }
}

export async function DELETE(req: NextRequest) {
  const uid = await verifyUid(req);
  if (!uid) return bad(401, 'auth/missing_or_invalid');
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return bad(400, 'invalid/id');
  try {
    await adminDb
      .collection('users')
      .doc(uid)
      .collection('lotto_number_sets')
      .doc(id)
      .delete();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return bad(500, 'internal/delete_failed_' + e);
  }
}
