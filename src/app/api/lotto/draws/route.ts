import { NextResponse } from 'next/server';
import { LottoDrawType } from '@/types';
import { lottoRepository } from '@/services/lotto-repository';
import {
  LOTTO_MAX_HISTORY_RANGE,
  LOTTO_RATE_LIMIT_MAX,
  LOTTO_RATE_LIMIT_WINDOW_MS,
  LOTTO_ARTIFICIAL_DELAY_MS,
} from '@/constants';

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
    rateMap.set(ip, { count: 1, resetAt: now + LOTTO_RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (rec.count >= LOTTO_RATE_LIMIT_MAX) return false;
  rec.count += 1;
  return true;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    // Allow up to LOTTO_MAX_HISTORY_RANGE difference (inclusive upper bound)
    const diff = to - from; // e.g., 400..900 => 500
    if (diff > LOTTO_MAX_HISTORY_RANGE) {
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
  const latest = await lottoRepository.getLatestDrawNumber();
  return NextResponse.json(
    {
      data: { lastDrawNumber: latest ?? 0 },
      meta: { type: 'latest' as const },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'Surrogate-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    }
  );
}

async function handleSingle(drwNo: number): Promise<NextResponse> {
  const data = await lottoRepository.getDrawByNumber(drwNo);
  if (!data) {
    return NextResponse.json(
      { error: 'Not Found. Please sync this draw first.' },
      {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
  return NextResponse.json(
    { data, meta: { type: 'single' as const } },
    {
      status: 200,
      headers: {
        'Cache-Control':
          'public, s-maxage=86400, stale-while-revalidate=604800, immutable',
        'CDN-Cache-Control':
          'public, s-maxage=86400, stale-while-revalidate=604800, immutable',
        'Surrogate-Control':
          'public, s-maxage=86400, stale-while-revalidate=604800, immutable',
      },
    }
  );
}

async function handleRange(from: number, to: number): Promise<NextResponse> {
  // Clamp upper bound to latest stored draw
  const latest = (await lottoRepository.getLatestDrawNumber()) ?? 0;
  const safeTo = Math.min(to, latest);
  const safeFrom = Math.max(1, Math.min(from, safeTo));

  const results: LottoDrawType[] = await lottoRepository.getDrawsRange(
    safeFrom,
    safeTo
  );
  const requestedCount = safeTo - safeFrom + 1;
  const partial = results.length !== requestedCount;
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
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
        'CDN-Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
        'Surrogate-Control': 'public, s-maxage=600, stale-while-revalidate=300',
      },
    }
  );
}

// ===== Route =====
export async function GET(request: Request) {
  try {
    if (!checkRate(request)) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        {
          status: 429,
          headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' },
        }
      );
    }

    // Intentional small delay to deter bursty scraping and reduce hot-spotting on Firestore
    if (LOTTO_ARTIFICIAL_DELAY_MS > 0) {
      await sleep(LOTTO_ARTIFICIAL_DELAY_MS);
    }

    const query = parseQuery(request.url);
    if ('error' in query) {
      return NextResponse.json(
        { error: query.error },
        { status: query.status, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (query.kind === 'latest') return handleLatest();
    if (query.kind === 'single') return handleSingle(query.drwNo);
    return handleRange(query.from, query.to);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
