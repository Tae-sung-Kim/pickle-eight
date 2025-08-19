import type {
  LottoCheckResultType,
  LottoDrawType,
  LottoStatsType,
  LottoTicketType,
} from '@/types';

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
): LottoCheckResultType['rank'] {
  if (matchCount === 6) return 1;
  if (matchCount === 5 && bonusMatch) return 2;
  if (matchCount === 5) return 3;
  if (matchCount === 4) return 4;
  if (matchCount === 3) return 5;
  return 0;
}

function checkTicket(
  draw: LottoDrawType,
  ticket: LottoTicketType
): LottoCheckResultType {
  validateRangeSix(ticket.numbers);
  const set = new Set(draw.numbers);
  const matchCount = ticket.numbers.filter((n) => set.has(n)).length;
  const bonusMatch = ticket.numbers.includes(draw.bonusNumber);
  const rank = computeRank(matchCount, bonusMatch);
  return { matchCount, bonusMatch, rank };
}

function frequencyByNumber(
  draws: readonly LottoDrawType[]
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

function computeStats(draws: readonly LottoDrawType[]): LottoStatsType {
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
  toTicket(numbers: number[]): LottoTicketType {
    const normalized = uniqueSortedSix(numbers);
    validateRangeSix(normalized);
    return { numbers: normalized };
  },
  checkTicket,
  computeStats,
};

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
  const isComplete = nums.length === 6;
  const sum = nums.reduce((a, b) => a + b, 0);
  if (isComplete && filters.sumMin !== undefined && sum < filters.sumMin)
    return false;
  if (isComplete && filters.sumMax !== undefined && sum > filters.sumMax)
    return false;
  if (
    filters.maxConsecutive !== undefined &&
    hasTooLongConsecutive(nums, filters.maxConsecutive)
  )
    return false;
  if (isComplete && filters.desiredOddCount !== undefined) {
    const odd = nums.filter((n) => n % 2 === 1).length;
    if (odd !== filters.desiredOddCount) return false;
  }
  if (isComplete && filters.minBucketSpread !== undefined) {
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
): LottoTicketType {
  const pool: number[] = [];
  for (let n = 1; n <= 45; n += 1) pool.push(n);
  const selected: number[] = [];
  const MAX_ATTEMPTS = 5000;
  let attempts = 0;

  while (selected.length < 6) {
    attempts += 1;
    if (attempts > MAX_ATTEMPTS) {
      const remain = pool.filter(
        (n) =>
          !selected.includes(n) && !filters?.excludeRecentNumbers?.includes(n)
      );
      while (selected.length < 6 && remain.length > 0) {
        const idx = Math.floor(Math.random() * remain.length);
        const pick = remain.splice(idx, 1)[0]!;
        selected.push(pick);
        selected.sort((a, b) => a - b);
      }
      break;
    }
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
  draws: readonly LottoDrawType[]
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
  ): readonly LottoTicketType[] {
    const out: LottoTicketType[] = [];
    for (let i = 0; i < count; i += 1)
      out.push(generateOne(filters, weighting));
    return out;
  },
  frequencyFrom(
    draws: readonly LottoDrawType[]
  ): Readonly<Record<number, number>> {
    return buildFrequencyFromDraws(draws);
  },
};

// 로또 랜덤 번호 추출
export function generateLottoNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// 로또 번호에 따른 색상 클래스 반환
export function getNumberColor(num: number): string {
  if (num <= 10) return 'bg-red-100 text-red-800';
  if (num <= 20) return 'bg-blue-100 text-blue-800';
  if (num <= 30) return 'bg-yellow-100 text-yellow-800';
  if (num <= 40) return 'bg-gray-100 text-gray-800';
  return 'bg-green-100 text-green-800';
}
