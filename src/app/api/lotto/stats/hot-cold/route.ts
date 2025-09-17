import { adminDb } from '@/lib/firebase-admin';
import { lottoRepository } from '@/services/lotto-repository';
import type { LottoDrawType } from "@/types/lotto.type";
import { NextResponse } from 'next/server';

const DOC_ID = 'hot-cold-latest' as const;
const COLLECTION = 'lotto_stats' as const;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h

export async function GET() {
  try {
    // 1) Try cache
    const ref = adminDb.collection(COLLECTION).doc(DOC_ID);
    const snap = await ref.get();
    const now = Date.now();
    if (snap.exists) {
      const data = snap.data() as Record<string, unknown>;
      const updatedAt = Number(new Date(String(data.updatedAt)).getTime());
      if (Number.isFinite(updatedAt) && now - updatedAt < CACHE_TTL_MS) {
        return NextResponse.json(
          { ok: true, data: data.payload, meta: { cached: true, updatedAt } },
          { status: 200, headers: { 'Cache-Control': 'public, s-maxage=600' } }
        );
      }
    }

    // 2) Recompute from draws
    const latest = (await lottoRepository.getLatestDrawNumber()) ?? 0;
    if (latest <= 0) {
      return NextResponse.json(
        { ok: true, data: null, meta: { latest: 0 } },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    const all: LottoDrawType[] = await lottoRepository.getDrawsRange(1, latest);

    // frequency 1..45
    const freq: Record<number, number> = {};
    for (let n = 1; n <= 45; n += 1) freq[n] = 0;
    for (const d of all) for (const n of d.numbers) freq[n] += 1;

    // last seen drawNo for each number (overdue)
    const lastSeen: Record<number, number> = {};
    for (let n = 1; n <= 45; n += 1) lastSeen[n] = 0;
    for (const d of all) {
      for (const n of d.numbers) lastSeen[n] = d.drawNumber;
    }
    const overdue: Record<number, number> = {};
    for (let n = 1; n <= 45; n += 1)
      overdue[n] = lastSeen[n] > 0 ? latest - lastSeen[n] : latest;

    // recent momentum: frequency in last K draws
    const K = Math.min(50, latest);
    const recentFrom = Math.max(1, latest - K + 1);
    const recent: Record<number, number> = {};
    for (let n = 1; n <= 45; n += 1) recent[n] = 0;
    const recentDraws = all.filter((d) => d.drawNumber >= recentFrom);
    for (const d of recentDraws) for (const n of d.numbers) recent[n] += 1;

    const payload = {
      latest,
      frequency: freq,
      overdue,
      recentWindow: K,
      recentFrequency: recent,
    } as const;

    await ref.set(
      { payload, updatedAt: new Date(), lastComputedDrawNo: latest },
      { merge: true }
    );

    return NextResponse.json(
      { ok: true, data: payload, meta: { cached: false } },
      { status: 200, headers: { 'Cache-Control': 'public, s-maxage=600' } }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'internal/hot_cold_failed _' + e },
      { status: 500 }
    );
  }
}
