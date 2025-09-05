import { NextResponse } from 'next/server';
import type { LottoDrawType } from '@/types';
import { lottoRepository } from '@/services/lotto-repository';

const RATE_LIMIT_WINDOW_MS = 60_000 as const; // 1 minute
const RATE_LIMIT_MAX = 20 as const; // max requests per IP per window

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

function toCsvRow(draw: LottoDrawType): string {
  const [n1, n2, n3, n4, n5, n6] = draw.numbers;
  const cells = [
    draw.drawNumber,
    `"${draw.drawDate}"`,
    n1,
    n2,
    n3,
    n4,
    n5,
    n6,
    draw.bonusNumber,
    draw.firstWinCount ?? '',
    draw.firstPrizeAmount ?? '',
    draw.totalSalesAmount ?? '',
  ];
  return cells.join(',');
}

function csvHeader(): string {
  return [
    'drawNumber',
    'drawDate',
    'no1',
    'no2',
    'no3',
    'no4',
    'no5',
    'no6',
    'bonus',
    'firstWinCount',
    'firstPrizeAmount',
    'totalSalesAmount',
  ].join(',');
}

export async function GET(request: Request) {
  try {
    if (!checkRate(request)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': '60' },
      });
    }

    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    let from: number;
    let to: number;

    const latest = (await lottoRepository.getLatestDrawNumber()) ?? 0;
    if (latest === 0) {
      return new NextResponse('No data', { status: 404 });
    }

    if (fromParam && toParam) {
      from = Number(fromParam);
      to = Number(toParam);
      if (
        !Number.isInteger(from) ||
        !Number.isInteger(to) ||
        from <= 0 ||
        to < from
      ) {
        return new NextResponse('Invalid from/to', { status: 400 });
      }
    } else {
      from = 1;
      to = latest;
    }

    // 안전 상한: 한번에 너무 큰 CSV를 방지 (예: 3000회차 이내)
    const MAX_RANGE = 3000 as const;
    if (to - from + 1 > MAX_RANGE) {
      return new NextResponse(`Range too large. Max ${MAX_RANGE}`, {
        status: 400,
      });
    }

    const items = await lottoRepository.getDrawsRange(
      from,
      Math.min(to, latest)
    );
    if (!items.length) {
      return new NextResponse('No data in range', { status: 404 });
    }

    const lines: string[] = [csvHeader(), ...items.map((d) => toCsvRow(d))];
    const csv = lines.join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="lotto_draws_${from}_${Math.min(
          to,
          latest
        )}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new NextResponse(message, { status: 500 });
  }
}
