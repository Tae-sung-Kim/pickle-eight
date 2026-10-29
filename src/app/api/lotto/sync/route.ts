import { NextResponse } from 'next/server';
import { DH_LOTTO_ENDPOINT } from '@/features/lotto/constants/lotto.constant';
import { lottoRepository } from '@/features/lotto/services/lotto-repository';
import type {
  DhLottoApiResponseType,
  LottoDrawType,
} from '@/features/lotto/types/lotto.type';

function requireCronSecret(req: Request): void {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  const configured = process.env.CRON_SECRET;
  if (!configured) {
    throw new Error('Unauthorized');
  }
  const headerSecret = req.headers.get('x-cron-secret');
  const auth =
    req.headers.get('authorization') || req.headers.get('Authorization');
  const bearer = auth?.startsWith('Bearer ')
    ? auth.slice('Bearer '.length)
    : null;
  if (headerSecret !== configured && bearer !== configured) {
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
    number,
  ];
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

async function fetchDhDraw(drwNo?: number): Promise<LottoDrawType | null> {
  const url =
    drwNo === undefined
      ? DH_LOTTO_ENDPOINT
      : `${DH_LOTTO_ENDPOINT}?srchLtEpsd=${drwNo}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) return null;
  const json = (await res.json()) as DhLottoApiResponseType;

  if (json.resultCode !== null || json.resultMessage !== null) {
    console.error('API error:', json.resultCode, json.resultMessage);
    return null;
  }

  const raw = json.data?.list?.[0];
  if (!raw) return null;
  if (drwNo !== undefined && raw.ltEpsd !== drwNo) return null;
  return mapToLottoDraw(raw);
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
    const item = await fetchDhDraw(n);
    if (!item) continue;
    await lottoRepository.upsertDraw(item);
    upserted += 1;
    last = n;
    await new Promise((r) => setTimeout(r, 50));
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
  for (;;) {
    const item = await fetchDhDraw(current);
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
  return POST(request);
}
