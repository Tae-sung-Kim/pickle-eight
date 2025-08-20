export type LottoGeneratorControlsPropsType = {
  orderCount: number;
  isGenerating: boolean;
  onOrderCountChange: (value: number) => void;
  onGenerate: () => void;
};

export type LottoNumberListPropsType = {
  numbersList: number[][];
  title?: string;
};

export type LottoBallPropsType = {
  number: number;
  index: number;
  isBonus?: boolean;
};

export type LottoDrawType = {
  /** 회차 번호 */
  readonly drawNumber: number;
  /** 추첨일(ISO-8601, YYYY-MM-DD) */
  readonly drawDate: string;
  /** 당첨 번호 6개, 오름차순 보장 */
  readonly numbers: readonly [number, number, number, number, number, number];
  /** 보너스 번호 */
  readonly bonusNumber: number;
  /** 1등 당첨자 수 (옵션) */
  readonly firstWinCount?: number;
  /** 1등 1인당 당첨금 (옵션, KRW) */
  readonly firstPrizeAmount?: number;
  /** 총 판매금액 (옵션, KRW) */
  readonly totalSalesAmount?: number;
  /** 마지막 회차 번호 */
  readonly lastDrawNumber?: number;
};

/**
 * Lotto ticket: user-selected 6 numbers.
 */
export type LottoTicketType = {
  /** 선택한 번호 6개, 오름차순 보장 */
  readonly numbers: readonly [number, number, number, number, number, number];
  /** 저장용 식별자 (옵션) */
  readonly id?: string;
  /** 즐겨찾기 여부 (옵션) */
  readonly favorite?: boolean;
};

/**
 * Result of checking a ticket against a particular draw.
 */
export type LottoCheckResultType = {
  /** 일치한 번호 개수 */
  readonly matchCount: number;
  /** 보너스 번호 일치 여부 */
  readonly bonusMatch: boolean;
  /** 등수 (1~5), 미당첨은 0 */
  readonly rank: 0 | 1 | 2 | 3 | 4 | 5;
  /** 예상 당첨금 (옵션, KRW) */
  readonly estimatedPrize?: number;
};

/**
 * Aggregated statistics over a set of draws.
 */
export type LottoStatsType = {
  /** 번호(1~45)별 출현 빈도 */
  readonly frequencyByNumber: Readonly<Record<number, number>>;
  /** 구간별(1-10, 11-20, ...) 분포 */
  readonly bucketDistribution: Readonly<Record<string, number>>;
  /** 홀/짝 분포 */
  readonly oddEvenDistribution: { readonly odd: number; readonly even: number };
  /** 합계 범위 분포 */
  readonly sumDistribution: Readonly<Record<string, number>>;
  /** 연속수 발생 횟수 */
  readonly consecutiveCount: number;
};

/**
 * DH Lottery raw API response for a single draw. Fields are optional for safety.
 */
export type DhLottoApiResponse = {
  returnValue?: 'success' | 'fail';
  drwNo?: number; // 회차
  drwNoDate?: string; // yyyy-mm-dd
  drwtNo1?: number;
  drwtNo2?: number;
  drwtNo3?: number;
  drwtNo4?: number;
  drwtNo5?: number;
  drwtNo6?: number;
  bnusNo?: number;
  /** 총 판매금액 */
  totSellamnt?: number;
  /** 1등 총 당첨금? (API 명세에 따라 다름) */
  firstAccumamnt?: number;
  /** 1등 당첨자 수 */
  firstPrzwnerCo?: number;
  /** 1등 1인당 당첨금 */
  firstWinamnt?: number;
};

/**
 * Helpers for type guards.
 */
export const LottoTypes = {
  /** Ensure a value is an integer within [min, max]. */
  isIntInRange(value: unknown, min: number, max: number): value is number {
    if (typeof value !== 'number' || !Number.isInteger(value)) return false;
    return value >= min && value <= max;
  },
};

export type LottoDrawsParamsType = {
  readonly from: number;
  readonly to: number;
  readonly enabled?: boolean;
};

export type LottoWarningToneType = 'warning' | 'danger' | 'muted';
