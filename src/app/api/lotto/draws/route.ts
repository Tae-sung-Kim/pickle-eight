import { NextResponse } from 'next/server';
import type { DhLottoApiResponse, LottoDrawType } from '@/types';
import { LOTTO_MAX_HISTORY_RANGE } from '@/constants';

// ===== Constants =====
const DH_LOTTO_ENDPOINT =
  'https://www.dhlottery.co.kr/common.do?method=getLottoNumber' as const;
// time units (avoid magic numbers)
const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const REVALIDATE_SECONDS = DAY; // 1 day
const RATE_LIMIT_WINDOW_MS = 60_000 as const; // 1 minute
const RATE_LIMIT_MAX = 60 as const; // max requests per IP per window

// ===== Simple in-memory rate limiter =====
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

// ===== Mapping & fetch helpers =====
function mapToLottoDraw(raw: DhLottoApiResponse): LottoDrawType {
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

async function fetchDhDraw(drwNo: number): Promise<LottoDrawType> {
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

async function getLatestDrawNumber(): Promise<number> {
  let lo = 1;
  let hi = 1;
  while (await existsDhDraw(hi)) {
    lo = hi;
    hi *= 2;
    if (hi > 100_000) break;
  }
  let left = lo;
  let right = hi - 1;
  let best = lo;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (await existsDhDraw(mid)) {
      best = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return best;
}

// ===== Query parsing =====
export type GetQuery =
  | { readonly kind: 'latest' }
  | { readonly kind: 'single'; readonly drwNo: number }
  | { readonly kind: 'range'; readonly from: number; readonly to: number };

function parseQuery(url: string): GetQuery | { error: string; status: number } {
  const { searchParams } = new URL(url);
  const drwNoParam = searchParams.get('drwNo');
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const latestParam = searchParams.get('latest');

  if (latestParam) return { kind: 'latest' };

  if (drwNoParam) {
    const drwNo = Number(drwNoParam);
    if (!Number.isInteger(drwNo) || drwNo <= 0) {
      return { error: 'Invalid drwNo', status: 400 };
    }
    return { kind: 'single', drwNo };
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
      return { error: 'Invalid from/to', status: 400 };
    }
    const count = to - from + 1;
    if (count > LOTTO_MAX_HISTORY_RANGE) {
      return {
        error: `Range too large. Max ${LOTTO_MAX_HISTORY_RANGE}`,
        status: 400,
      };
    }
    return { kind: 'range', from, to };
  }

  return { error: 'Provide drwNo or from/to or latest', status: 400 };
}

// ===== Handlers =====
async function handleLatest(): Promise<NextResponse> {
  // Find latest draw number using exponential search to find upper bound, then binary search.
  let lo = 1;
  let hi = 1;
  while (await existsDhDraw(hi)) {
    lo = hi;
    hi *= 2; // 1,2,4,8,... exponential growth
    if (hi > 100_000) break; // hard safety
  }
  // Binary search in (lo, hi) for last existing
  let left = lo;
  let right = hi - 1;
  let best = lo;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (await existsDhDraw(mid)) {
      best = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return NextResponse.json(
    { data: { lastDrawNumber: best }, meta: { type: 'latest' as const } },
    { status: 200 }
  );
}

async function handleSingle(drwNo: number): Promise<NextResponse> {
  const data = await fetchDhDraw(drwNo);
  return NextResponse.json(
    { data, meta: { type: 'single' as const } },
    { status: 200 }
  );
}

async function handleRange(from: number, to: number): Promise<NextResponse> {
  // Clamp upper bound to latest draw to avoid querying non-existing future draws
  const latest = await getLatestDrawNumber();
  const safeTo = Math.min(to, latest);
  const safeFrom = Math.max(1, Math.min(from, safeTo));

  const results: LottoDrawType[] = [];
  let failed = 0;
  // Sequential fetch to avoid hammering external API and reduce flakiness
  for (let n = safeFrom; n <= safeTo; n += 1) {
    try {
      // small spacing to be gentle on remote API (1~2ms ~ event loop tick)
      const item = await fetchDhDraw(n);
      results.push(item);
    } catch {
      failed += 1;
      // continue on individual failure
    }
  }
  const requestedCount = safeTo - safeFrom + 1;
  const partial = failed > 0;
  return NextResponse.json(
    {
      data: results,
      meta: {
        type: 'range' as const,
        count: results.length,
        requested: requestedCount,
        partial,
      },
    },
    { status: 200 }
  );
}

// ===== Route =====
export async function GET(request: Request) {
  try {
    if (!checkRate(request)) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const query = parseQuery(request.url);
    if ('error' in query) {
      return NextResponse.json(
        { error: query.error },
        { status: query.status }
      );
    }

    if (query.kind === 'latest') return handleLatest();
    if (query.kind === 'single') return handleSingle(query.drwNo);
    return handleRange(query.from, query.to);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
