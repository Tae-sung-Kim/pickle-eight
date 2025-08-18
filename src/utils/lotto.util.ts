/**
 * Lotto utility functions.
 * One export per file: `LottoUtils`.
 */

import type {
  CheckResult,
  LottoDraw,
  LottoStats,
  LottoTicket,
} from '@/types/lotto';

function uniqueSortedSix(
  numbers: number[]
): readonly [number, number, number, number, number, number] {
  const arr = Array.from(new Set(numbers)).filter((n) =>
    Number.isInteger(n)
  ) as number[];
  if (arr.length !== 6) throw new Error('Exactly 6 unique integers required');
  arr.sort((a, b) => a - b);
  return [arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]] as const;
}

function validateRangeSix(nums: readonly number[]): void {
  for (const n of nums) {
    if (n < 1 || n > 45) throw new Error('Numbers must be within 1..45');
  }
}

function computeRank(
  matchCount: number,
  bonusMatch: boolean
): CheckResult['rank'] {
  if (matchCount === 6) return 1;
  if (matchCount === 5 && bonusMatch) return 2;
  if (matchCount === 5) return 3;
  if (matchCount === 4) return 4;
  if (matchCount === 3) return 5;
  return 0;
}

function checkTicket(draw: LottoDraw, ticket: LottoTicket): CheckResult {
  validateRangeSix(ticket.numbers);
  const set = new Set(draw.numbers);
  const matchCount = ticket.numbers.filter((n) => set.has(n)).length;
  const bonusMatch = ticket.numbers.includes(draw.bonusNumber);
  const rank = computeRank(matchCount, bonusMatch);
  return { matchCount, bonusMatch, rank };
}

function frequencyByNumber(
  draws: readonly LottoDraw[]
): Readonly<Record<number, number>> {
  const freq: Record<number, number> = {};
  for (let n = 1; n <= 45; n += 1) freq[n] = 0;
  for (const d of draws) {
    for (const n of d.numbers) freq[n] += 1;
  }
  return freq;
}

function bucketLabel(n: number): string {
  if (n <= 10) return '01-10';
  if (n <= 20) return '11-20';
  if (n <= 30) return '21-30';
  if (n <= 40) return '31-40';
  return '41-45';
}

function computeStats(draws: readonly LottoDraw[]): LottoStats {
  const frequency = frequencyByNumber(draws);

  const bucket: Record<string, number> = {
    '01-10': 0,
    '11-20': 0,
    '21-30': 0,
    '31-40': 0,
    '41-45': 0,
  };
  let odd = 0;
  let even = 0;
  const sumDist: Record<string, number> = {
    '<=100': 0,
    '101-150': 0,
    '151-200': 0,
    '201-255': 0,
  };
  let consecutiveCount = 0;

  for (const d of draws) {
    let hasConsecutive = false;
    let sum = 0;
    for (let i = 0; i < d.numbers.length; i += 1) {
      const n = d.numbers[i];
      bucket[bucketLabel(n)] += 1;
      if (n % 2 === 0) even += 1;
      else odd += 1;
      sum += n;
      if (i > 0 && d.numbers[i - 1] + 1 === n) hasConsecutive = true;
    }
    if (sum <= 100) sumDist['<=100'] += 1;
    else if (sum <= 150) sumDist['101-150'] += 1;
    else if (sum <= 200) sumDist['151-200'] += 1;
    else sumDist['201-255'] += 1;
    if (hasConsecutive) consecutiveCount += 1;
  }

  return {
    frequencyByNumber: frequency,
    bucketDistribution: bucket,
    oddEvenDistribution: { odd, even },
    sumDistribution: sumDist,
    consecutiveCount,
  };
}

export const LottoUtils = {
  toTicket(numbers: number[]): LottoTicket {
    const normalized = uniqueSortedSix(numbers);
    validateRangeSix(normalized);
    return { numbers: normalized };
  },
  checkTicket,
  computeStats,
};
