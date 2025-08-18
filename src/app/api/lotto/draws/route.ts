import { NextResponse } from 'next/server';
import type { DhLottoApiResponse, LottoDraw } from '@/types/lotto';

const DH_LOTTO_ENDPOINT =
  'https://www.dhlottery.co.kr/common.do?method=getLottoNumber';
const REVALIDATE_SECONDS = 60 * 60 * 24; // 1 day
const MAX_RANGE = 200; // safety guard

/**
 * Map DH Lottery API response to LottoDraw. Throws on invalid payload.
 */
function mapToLottoDraw(raw: DhLottoApiResponse): LottoDraw {
  if (raw.returnValue !== 'success') throw new Error('DH API returned fail');
  const drawNumber = raw.drwNo ?? 0;
  const drawDate = raw.drwNoDate ?? '';
  const numbers = [
    raw.drwtNo1,
    raw.drwtNo2,
    raw.drwtNo3,
    raw.drwtNo4,
    raw.drwtNo5,
    raw.drwtNo6,
  ];
  const bonusNumber = raw.bnusNo ?? 0;
  if (numbers.some((n) => typeof n !== 'number'))
    throw new Error('Invalid numbers');
  if (typeof bonusNumber !== 'number') throw new Error('Invalid bonus number');
  const sorted = (numbers as number[]).slice().sort((a, b) => a - b) as [
    number,
    number,
    number,
    number,
    number,
    number
  ];
  return {
    drawNumber,
    drawDate,
    numbers: sorted,
    bonusNumber,
    firstWinCount: raw.firstPrzwnerCo,
    firstPrizeAmount: raw.firstWinamnt,
    totalSalesAmount: raw.totSellamnt,
  };
}

async function fetchDhDraw(drwNo: number): Promise<LottoDraw> {
  const url = `${DH_LOTTO_ENDPOINT}&drwNo=${encodeURIComponent(String(drwNo))}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`Failed to fetch draw ${drwNo}`);
  const json = (await res.json()) as DhLottoApiResponse;
  return mapToLottoDraw(json);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const drwNoParam = searchParams.get('drwNo');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    if (drwNoParam) {
      const drwNo = Number(drwNoParam);
      if (!Number.isInteger(drwNo) || drwNo <= 0) {
        return NextResponse.json({ error: 'Invalid drwNo' }, { status: 400 });
      }
      const data = await fetchDhDraw(drwNo);
      return NextResponse.json(
        { data, meta: { type: 'single' } },
        { status: 200 }
      );
    }

    if (fromParam && toParam) {
      const from = Number(fromParam);
      const to = Number(toParam);
      if (
        !Number.isInteger(from) ||
        !Number.isInteger(to) ||
        from <= 0 ||
        to < from
      ) {
        return NextResponse.json({ error: 'Invalid from/to' }, { status: 400 });
      }
      const count = to - from + 1;
      if (count > MAX_RANGE) {
        return NextResponse.json(
          { error: `Range too large. Max ${MAX_RANGE}` },
          { status: 400 }
        );
      }
      const tasks: Promise<LottoDraw>[] = [];
      for (let n = from; n <= to; n += 1) tasks.push(fetchDhDraw(n));
      const list = await Promise.all(tasks);
      return NextResponse.json(
        { data: list, meta: { type: 'range', count } },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Provide drwNo or from/to' },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
