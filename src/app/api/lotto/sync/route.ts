import { NextResponse } from 'next/server';
import { DhLottoApiResponseType, LottoDrawType } from '@/types';
import { lottoRepository } from '@/services/lotto-repository';
import { DH_LOTTO_ENDPOINT } from '@/constants';

function requireCronSecret(req: Request): void {
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

function mapToLottoDraw(raw: DhLottoApiResponseType): LottoDrawType {
  if (raw.returnValue !== 'success') throw new Error('DH API returned fail');
  const numbers = [
    raw.drwtNo1,
    raw.drwtNo2,
    raw.drwtNo3,
    raw.drwtNo4,
    raw.drwtNo5,
    raw.drwtNo6,
  ];
  const sorted = (numbers as number[]).slice().sort((a, b) => a - b) as [
    number,
    number,
    number,
    number,
    number,
    number
  ];
  return {
    drawNumber: raw.drwNo ?? 0,
    drawDate: raw.drwNoDate ?? '',
    numbers: sorted,
    bonusNumber: raw.bnusNo ?? 0,
    firstWinCount: raw.firstPrzwnerCo,
    firstPrizeAmount: raw.firstWinamnt,
    totalSalesAmount: raw.totSellamnt,
  };
}

async function fetchDhDraw(drwNo: number): Promise<LottoDrawType | null> {
  const url = `${DH_LOTTO_ENDPOINT}&drwNo=${encodeURIComponent(String(drwNo))}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = (await res.json()) as DhLottoApiResponseType;
  if (json.returnValue !== 'success') return null;
  return mapToLottoDraw(json);
}

async function syncSingle(drwNo: number): Promise<{ upserted: number }> {
  const data = await fetchDhDraw(drwNo);
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

    const drwNoParam = searchParams.get('drwNo');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const forwardParam = searchParams.get('forward');

    if (drwNoParam) {
      const drwNo = Number(drwNoParam);
      if (!Number.isInteger(drwNo) || drwNo <= 0)
        return NextResponse.json({ error: 'Invalid drwNo' }, { status: 400 });
      const res = await syncSingle(drwNo);
      return NextResponse.json({ mode: 'single', ...res });
    }

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

    // default: forward sync
    const res = await syncForwardFromLatestStored();
    return NextResponse.json({ mode: 'forward', ...res });
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
