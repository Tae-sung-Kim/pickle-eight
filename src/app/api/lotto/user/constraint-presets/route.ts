import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type {
  LottoConstraintPresetType,
  LottoGenerateFiltersType,
} from '@/types';

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
      .collection('lotto_constraint_presets')
      .orderBy('createdAt', 'desc')
      .get();
    const data: LottoConstraintPresetType[] = snap.docs.map((d) => {
      const v = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        name: (v.name as string) || 'Preset',
        filters: (v.filters as LottoGenerateFiltersType) || {},
        createdAt: (v.createdAt as unknown as Date | string | undefined)
          ? String(v.createdAt)
          : undefined,
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
    const body = (await req.json()) as Partial<LottoConstraintPresetType>;
    const name = (body.name ?? '').toString().trim() || 'Preset';
    const filters = (body.filters ?? {}) as LottoGenerateFiltersType;
    const docData = {
      name,
      filters,
      createdAt: new Date(),
    } as const;
    const col = adminDb
      .collection('users')
      .doc(uid)
      .collection('lotto_constraint_presets');
    let id = body.id;
    if (id) {
      await col.doc(id).set({ name, filters }, { merge: true });
    } else {
      const ref = await col.add(docData);
      id = ref.id;
    }
    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch {
    return bad(500, 'internal/save_failed');
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
      .collection('lotto_constraint_presets')
      .doc(id)
      .delete();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return bad(500, 'internal/delete_failed');
  }
}
