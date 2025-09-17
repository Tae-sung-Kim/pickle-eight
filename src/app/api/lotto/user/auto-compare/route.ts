import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { lottoRepository } from '@/services/lotto-repository';
import type { LottoCheckResultType, LottoDrawType, LottoNumberSetType } from "@/types/lotto.type";
import { LottoUtils } from '@/utils/lotto.util';
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
  const { searchParams } = new URL(req.url);
  const fromRaw = Number(searchParams.get('from'));
  const toRaw = Number(searchParams.get('to'));
  if (
    !Number.isInteger(fromRaw) ||
    !Number.isInteger(toRaw) ||
    fromRaw <= 0 ||
    toRaw < fromRaw
  ) {
    return bad(400, 'invalid/from_to');
  }

  try {
    // Load user's saved number sets
    const setsSnap = await adminDb
      .collection('users')
      .doc(uid)
      .collection('lotto_number_sets')
      .get();
    const sets: LottoNumberSetType[] = setsSnap.docs.map((d) => {
      const v = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        numbers: (v.numbers as number[])
          .slice(0, 6)
          .sort((a, b) => a - b) as unknown as LottoNumberSetType['numbers'],
        label: (v.label as string) || undefined,
        isFavorite: Boolean(v.isFavorite),
      };
    });

    if (sets.length === 0) {
      return NextResponse.json({ ok: true, data: [] }, { status: 200 });
    }

    // Clamp to latest
    const latest = (await lottoRepository.getLatestDrawNumber()) ?? 0;
    const safeTo = Math.min(toRaw, latest);
    const safeFrom = Math.max(1, Math.min(fromRaw, safeTo));
    const draws: LottoDrawType[] = await lottoRepository.getDrawsRange(
      safeFrom,
      safeTo
    );

    const results = sets.map((set) => {
      const perDraw = draws.map((draw) => {
        const res: LottoCheckResultType = LottoUtils.checkTicket(draw, {
          numbers: set.numbers,
        });
        return {
          drawNumber: draw.drawNumber,
          matchCount: res.matchCount,
          bonusMatch: res.bonusMatch,
          rank: res.rank,
        } as const;
      });
      return {
        id: set.id,
        label: set.label ?? null,
        numbers: set.numbers,
        results: perDraw,
      } as const;
    });

    return NextResponse.json(
      {
        ok: true,
        data: results,
        meta: { from: safeFrom, to: safeTo, count: draws.length },
      },
      { status: 200 }
    );
  } catch (e) {
    return bad(500, 'internal/auto_compare_failed _' + e);
  }
}
