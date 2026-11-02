import { NextResponse } from 'next/server';
import { lottoRepository } from '@/features/lotto/services/lotto-repository';
import { computeHotCold } from '@/features/lotto/utils/hot-cold.util';
import { supabaseAdmin } from '@/lib/supabase-server';

const STATS_KEY = 'hot-cold-latest' as const;

export async function GET() {
  try {
    const latest = (await lottoRepository.getLatestDrawNumber()) ?? 0;
    if (latest <= 0) {
      return NextResponse.json(
        { ok: true, data: null, meta: { latest: 0 } },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // 새 회차가 저장되기 전까지는 통계가 바뀌지 않으므로 회차 번호로 캐시를 판단한다
    const { data: cached, error: cacheError } = await supabaseAdmin
      .from('lotto_stats')
      .select('payload, updated_at, last_computed_draw_no')
      .eq('key', STATS_KEY)
      .maybeSingle();
    if (cacheError) throw cacheError;
    if (cached && cached.last_computed_draw_no >= latest) {
      return NextResponse.json(
        {
          ok: true,
          data: cached.payload,
          meta: {
            cached: true,
            updatedAt: new Date(cached.updated_at).getTime(),
          },
        },
        { status: 200, headers: { 'Cache-Control': 'public, s-maxage=600' } }
      );
    }

    const all = await lottoRepository.getDrawsRange(1, latest);
    const payload = computeHotCold(all, { from: 1, to: latest });

    const { error: saveError } = await supabaseAdmin.from('lotto_stats').upsert(
      {
        key: STATS_KEY,
        payload,
        last_computed_draw_no: latest,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
    if (saveError) throw saveError;

    return NextResponse.json(
      { ok: true, data: payload, meta: { cached: false } },
      { status: 200, headers: { 'Cache-Control': 'public, s-maxage=600' } }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `internal/hot_cold_failed _${e}` },
      { status: 500 }
    );
  }
}
