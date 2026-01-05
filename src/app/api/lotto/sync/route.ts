import { DH_LOTTO_ENDPOINT } from '@/constants/lotto.constant';
import { lottoRepository } from '@/services/lotto-repository';
import { DhLottoApiResponseType, LottoDrawType } from '@/types/lotto.type';
import { NextResponse } from 'next/server';

function requireCronSecret(req: Request): void {
  // Skip auth in development for testing
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  const configured = process.env.CRON_SECRET;
  // Option B: Allow Vercel Cron runs without secret by detecting Vercel env + x-vercel-cron header
  const isVercel = !!process.env.VERCEL;
  const xVercelCron = req.headers.get('x-vercel-cron');
  if (isVercel && xVercelCron) {
    return; // permit Vercel Cron invocation
  }
  if (!configured) {
    throw new Error('Unauthorized');
  }
  const headerSecret = req.headers.get('x-cron-secret');
  const auth =
    req.headers.get('authorization') || req.headers.get('Authorization');
  const bearer =
    auth && auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
  const ok = headerSecret === configured || bearer === configured;
  if (!ok) {
    throw new Error('Unauthorized');
  }
}

function mapToLottoDraw(
  raw: DhLottoApiResponseType['data']['list'][0]
): LottoDrawType {
  const numbers = [
    raw.tm1WnNo,
    raw.tm2WnNo,
    raw.tm3WnNo,
    raw.tm4WnNo,
    raw.tm5WnNo,
    raw.tm6WnNo,
  ];
  const sorted = numbers.slice().sort((a, b) => a - b) as [
    number,
    number,
    number,
    number,
    number,
    number
  ];
  // Convert YYYYMMDD to YYYY-MM-DD
  const drawDate = `${raw.ltRflYmd.slice(0, 4)}-${raw.ltRflYmd.slice(
    4,
    6
  )}-${raw.ltRflYmd.slice(6, 8)}`;

  return {
    drawNumber: raw.ltEpsd,
    drawDate,
    numbers: sorted,
    bonusNumber: raw.bnsWnNo,
    firstWinCount: raw.rnk1WnNope,
    firstPrizeAmount: raw.rnk1WnAmt,
    secondWinCount: raw.rnk2WnNope,
    secondPrizeAmount: raw.rnk2WnAmt,
    secondTotalAmount: raw.rnk2SumWnAmt,
    thirdWinCount: raw.rnk3WnNope,
    thirdPrizeAmount: raw.rnk3WnAmt,
    thirdTotalAmount: raw.rnk3SumWnAmt,
    fourthWinCount: raw.rnk4WnNope,
    fourthPrizeAmount: raw.rnk4WnAmt,
    fourthTotalAmount: raw.rnk4SumWnAmt,
    fifthWinCount: raw.rnk5WnNope,
    fifthPrizeAmount: raw.rnk5WnAmt,
    fifthTotalAmount: raw.rnk5SumWnAmt,
    totalWinners: raw.sumWnNope,
    totalSalesAmount: raw.rlvtEpsdSumNtslAmt,
  };
}

async function fetchDhDraw(): Promise<LottoDrawType | null> {
  const res = await fetch(DH_LOTTO_ENDPOINT, { cache: 'no-store' });

  if (!res.ok) return null;
  const json = (await res.json()) as DhLottoApiResponseType;

  if (json.resultCode !== null || json.resultMessage !== null) {
    console.error('API error:', json.resultCode, json.resultMessage);
    return null;
  }

  if (!json.data?.list?.length) return null;

  return mapToLottoDraw(json.data.list[0]);
}

async function syncSingle(): Promise<{ upserted: number }> {
  const data = await fetchDhDraw();
  if (!data) return { upserted: 0 };
  await lottoRepository.upsertDraw(data);
  return { upserted: 1 };
}

async function syncRange(
  from: number,
  to: number
): Promise<{ upserted: number; lastProcessed: number | null }> {
  let upserted = 0;
  let last: number | null = null;
  for (let n = from; n <= to; n += 1) {
    const item = await fetchDhDraw();
    if (!item) continue;
    await lottoRepository.upsertDraw(item);
    upserted += 1;
    last = n;
    await new Promise((r) => setTimeout(r, 50)); // be gentle
  }
  return { upserted, lastProcessed: last };
}

async function syncForwardFromLatestStored(): Promise<{
  upserted: number;
  lastProcessed: number | null;
}> {
  const latestStored = (await lottoRepository.getLatestDrawNumber()) ?? 0;
  let current = latestStored + 1;
  let upserted = 0;
  let last: number | null = null;
  // keep fetching until a miss occurs (no more published draws)
  while (true) {
    const item = await fetchDhDraw();
    if (!item) break;
    await lottoRepository.upsertDraw(item);
    upserted += 1;
    last = current;
    current += 1;
    await new Promise((r) => setTimeout(r, 100));
  }
  return { upserted, lastProcessed: last };
}

export async function POST(request: Request) {
  try {
    requireCronSecret(request);
    const { searchParams } = new URL(request.url);

    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const forwardParam = searchParams.get('forward');

    if (fromParam && toParam) {
      const from = Number(fromParam);
      const to = Number(toParam);
      if (
        !Number.isInteger(from) ||
        !Number.isInteger(to) ||
        from <= 0 ||
        to < from
      )
        return NextResponse.json({ error: 'Invalid from/to' }, { status: 400 });
      const res = await syncRange(from, to);
      return NextResponse.json({ mode: 'range', ...res });
    }

    if (forwardParam !== null) {
      const res = await syncForwardFromLatestStored();
      return NextResponse.json({ mode: 'forward', ...res });
    }

    // default: sync latest draw
    const res = await syncSingle();
    return NextResponse.json({ mode: 'single', ...res });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Vercel Cron uses GET by default. Reuse the POST logic.
  return POST(request);
}
