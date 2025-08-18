/**
 * Advanced Lotto generator utilities.
 * One export per file: `LottoGenerator`.
 */

import type { LottoDraw, LottoTicket } from '@/types/lotto';

export type GenerateFilters = {
  readonly sumMin?: number;
  readonly sumMax?: number;
  readonly maxConsecutive?: number; // 0=금지, 1=허용, 2=최대 2연속 ...
  readonly desiredOddCount?: number; // 0..6, 비우면 제한 없음
  readonly minBucketSpread?: number; // 서로 다른 구간(01-10..41-45) 최소 개수
  readonly excludeRecentNumbers?: readonly number[]; // 최근 회차에서 제외할 번호들
};

export type WeightingOptions = {
  /** frequency[1..45], 가중치로 사용 */
  readonly frequency?: Readonly<Record<number, number>>;
  /** 0(완전랜덤) ~ 1(빈도에 완전 의존) */
  readonly hotColdAlpha?: number;
};

const BUCKETS: ReadonlyArray<[number, number, string]> = [
  [1, 10, '01-10'],
  [11, 20, '11-20'],
  [21, 30, '21-30'],
  [31, 40, '31-40'],
  [41, 45, '41-45'],
] as const;

function bucketOf(n: number): string {
  for (const [lo, hi, label] of BUCKETS) {
    if (n >= lo && n <= hi) return label;
  }
  return 'unknown';
}

function hasTooLongConsecutive(
  nums: readonly number[],
  maxConsecutive: number
): boolean {
  if (maxConsecutive < 0) return false;
  let streak = 1;
  for (let i = 1; i < nums.length; i += 1) {
    if (nums[i] === nums[i - 1] + 1) {
      streak += 1;
      if (streak > maxConsecutive) return true;
    } else {
      streak = 1;
    }
  }
  return false;
}

function passesFilters(
  nums: readonly number[],
  filters?: GenerateFilters
): boolean {
  if (!filters) return true;
  const sum = nums.reduce((a, b) => a + b, 0);
  if (filters.sumMin !== undefined && sum < filters.sumMin) return false;
  if (filters.sumMax !== undefined && sum > filters.sumMax) return false;
  if (
    filters.maxConsecutive !== undefined &&
    hasTooLongConsecutive(nums, filters.maxConsecutive)
  )
    return false;
  if (filters.desiredOddCount !== undefined) {
    const odd = nums.filter((n) => n % 2 === 1).length;
    if (odd !== filters.desiredOddCount) return false;
  }
  if (filters.minBucketSpread !== undefined) {
    const s = new Set(nums.map((n) => bucketOf(n)));
    if (s.size < filters.minBucketSpread) return false;
  }
  if (filters.excludeRecentNumbers && filters.excludeRecentNumbers.length > 0) {
    for (const n of nums)
      if (filters.excludeRecentNumbers.includes(n)) return false;
  }
  return true;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedSample(
  uniquePool: readonly number[],
  weights?: Readonly<Record<number, number>>,
  alpha: number = 1
): number {
  if (!weights || alpha <= 0) {
    const idx = randomInt(0, uniquePool.length - 1);
    return uniquePool[idx];
  }
  const norm = uniquePool.map((n) =>
    Math.max(0.0001, (weights[n] ?? 0) ** alpha)
  );
  const sum = norm.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < uniquePool.length; i += 1) {
    r -= norm[i];
    if (r <= 0) return uniquePool[i];
  }
  return uniquePool[uniquePool.length - 1];
}

function generateOne(
  filters?: GenerateFilters,
  weighting?: WeightingOptions
): LottoTicket {
  const pool: number[] = [];
  for (let n = 1; n <= 45; n += 1) pool.push(n);
  const selected: number[] = [];

  while (selected.length < 6) {
    const remain = pool.filter((n) => !selected.includes(n));
    const pick = weightedSample(
      remain,
      weighting?.frequency,
      weighting?.hotColdAlpha ?? 0
    );
    selected.push(pick);
    selected.sort((a, b) => a - b);
    if (!passesFilters(selected, filters)) {
      selected.pop();
    }
  }

  return {
    numbers: [
      selected[0],
      selected[1],
      selected[2],
      selected[3],
      selected[4],
      selected[5],
    ],
  } as const;
}

function buildFrequencyFromDraws(
  draws: readonly LottoDraw[]
): Readonly<Record<number, number>> {
  const freq: Record<number, number> = {};
  for (let n = 1; n <= 45; n += 1) freq[n] = 0;
  for (const d of draws) for (const n of d.numbers) freq[n] += 1;
  return freq;
}

export const LottoGenerator = {
  generate(
    count: number,
    filters?: GenerateFilters,
    weighting?: WeightingOptions
  ): readonly LottoTicket[] {
    const out: LottoTicket[] = [];
    for (let i = 0; i < count; i += 1)
      out.push(generateOne(filters, weighting));
    return out;
  },
  frequencyFrom(draws: readonly LottoDraw[]): Readonly<Record<number, number>> {
    return buildFrequencyFromDraws(draws);
  },
};
