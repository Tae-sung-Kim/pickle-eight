import { NextResponse } from 'next/server';
import type { DhLottoApiResponse, LottoDraw } from '@/types/lotto';

const DH_LOTTO_ENDPOINT =
  'https://www.dhlottery.co.kr/common.do?method=getLottoNumber';
const REVALIDATE_SECONDS = 60 * 60 * 24; // 1 day
const MAX_RANGE = 200; // safety guard
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // max requests per IP per window
const rateMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for') || '';
  const ip = xf.split(',')[0]?.trim();
  return ip || req.headers.get('x-real-ip') || 'unknown';
}

function checkRate(req: Request): boolean {
  const ip = getClientIp(req);
  const now = Date.now();
  const rec = rateMap.get(ip);
  if (!rec || now > rec.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (rec.count >= RATE_LIMIT_MAX) return false;
  rec.count += 1;
  return true;
}

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

async function existsDhDraw(drwNo: number): Promise<boolean> {
  try {
    const url = `${DH_LOTTO_ENDPOINT}&drwNo=${encodeURIComponent(
      String(drwNo)
    )}`;
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return false;
    const json = (await res.json()) as DhLottoApiResponse;
    return json.returnValue === 'success';
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    // Basic per-IP rate limiting
    if (!checkRate(request)) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
    const { searchParams } = new URL(request.url);
    const drwNoParam = searchParams.get('drwNo');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const latestParam = searchParams.get('latest');

    if (latestParam) {
      // Find latest draw number using exponential search to find upper bound, then binary search.
      // Start from 1 and grow until fail to establish [lo, hi) where hi is first missing.
      let lo = 1;
      let hi = 1;
      // eslint-disable-next-line no-await-in-loop
      while (await existsDhDraw(hi)) {
        lo = hi;
        hi *= 2; // 1,2,4,8,... exponential growth
        if (hi > 100000) break; // hard safety
      }
      // Binary search in (lo, hi) for last existing
      let left = lo;
      let right = hi - 1;
      let best = lo;
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        // eslint-disable-next-line no-await-in-loop
        if (await existsDhDraw(mid)) {
          best = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      return NextResponse.json(
        { data: { lastDrawNumber: best }, meta: { type: 'latest' } },
        { status: 200 }
      );
    }

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
      { error: 'Provide drwNo or from/to or latest' },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
