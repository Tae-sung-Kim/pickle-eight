import {
  LOTTO_ANALYSIS_VARIANT_ENUM,
  LOTTO_WARNING_TONE_ENUM,
} from '@/constants';
import { ReactNode } from 'react';

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

export type LottoTicketType = {
  /** 선택한 번호 6개, 오름차순 보장 */
  readonly numbers: readonly [number, number, number, number, number, number];
  /** 저장용 식별자 (옵션) */
  readonly id?: string;
  /** 즐겨찾기 여부 (옵션) */
  readonly favorite?: boolean;
};

export type LottoLankType = 0 | 1 | 2 | 3 | 4 | 5;

export type LottoCheckResultType = {
  /** 일치한 번호 개수 */
  readonly matchCount: number;
  /** 보너스 번호 일치 여부 */
  readonly bonusMatch: boolean;
  /** 등수 (1~5), 미당첨은 0 */
  readonly rank: LottoLankType;
  /** 예상 당첨금 (옵션, KRW) */
  readonly estimatedPrize?: number;
};

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
export type DhLottoApiResponseType = {
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

export type LottoWarningToneType =
  (typeof LOTTO_WARNING_TONE_ENUM)[keyof typeof LOTTO_WARNING_TONE_ENUM];

export type LottoCheckResultCardType = {
  readonly draw: LottoDrawType;
  readonly matchesList: Array<{
    readonly matchCount: number;
    readonly bonusMatch: boolean;
    readonly rank: number | null;
  }>;
  readonly tickets: number[][];
};

export type TicketFieldNameType = 'n1' | 'n2' | 'n3' | 'n4' | 'n5' | 'n6';

export type LottoCheckTicketRowType = {
  readonly index: number;
  readonly renderInput: (name: TicketFieldNameType) => ReactNode;
  readonly canRemove: boolean;
  readonly onRemove: () => void;
};

export type LottoAnalysisVariantValueType =
  (typeof LOTTO_ANALYSIS_VARIANT_ENUM)[keyof typeof LOTTO_ANALYSIS_VARIANT_ENUM];

export type LottoWarningAlertSpaceType = 'none' | 'sm' | 'md' | 'lg';

/**
 * Filters for lotto number generation.
 */
export type LottoGenerateFiltersType = {
  /** Minimum allowed sum of the 6 numbers */
  sumMin?: number;
  /** Maximum allowed sum of the 6 numbers */
  sumMax?: number;
  /** Max length of consecutive runs allowed: 0=forbid any consecutive run, 1=allow pairs only, etc. */
  maxConsecutive?: number; // 0=금지, 1=허용, 2=최대 2연속 ...
  /** Desired count of odd numbers (0..6). If omitted, no restriction. */
  desiredOddCount?: number; // 0..6, 비우면 제한 없음
  /** Minimum number of distinct buckets (01-10..41-45) that selected numbers must cover */
  minBucketSpread?: number; // 서로 다른 구간(01-10..41-45) 최소 개수
  /** Explicit numbers to exclude from selection (hard ban) */
  excludeNumbers?: number[];
  /** Explicit numbers that must be included in the final 6; if length>6, invalid */
  fixedNumbers?: number[];
  /** Numbers that appeared in recent draws and should be excluded */
  excludeRecentNumbers?: number[]; // 최근 회차에서 제외할 번호들
};

/**
 * Persisted number set saved by a user.
 */
export type LottoNumberSetType = Readonly<{
  /** Firestore doc id (client-side optional) */
  id?: string;
  /** Six unique ascending numbers */
  numbers: readonly [number, number, number, number, number, number];
  /** Optional label for quick identification */
  label?: string;
  /** Optional tags for grouping/filtering */
  tags?: readonly string[];
  /** Mark as favorite */
  isFavorite?: boolean;
  /** ISO-8601 created timestamp string or Firestore Timestamp serialized */
  createdAt?: string;
  /** ISO-8601 updated timestamp string or Firestore Timestamp serialized */
  updatedAt?: string;
}>;

/**
 * Generation fairness/audit log for lotto number creation attempts.
 */
export type LottoGenerationLogType = Readonly<{
  id?: string;
  /** ISO-8601 timestamp or Firestore Timestamp serialized */
  ts: string;
  /** RNG type used */
  rngType: 'webcrypto' | 'math';
  /** Optional seed string for reproducibility */
  seed?: string;
  /** Filters applied during generation */
  filters?: LottoGenerateFiltersType;
  /** User interaction count (e.g., clicks/tries) */
  clickCount?: number;
  /** Optional privacy-preserving identifiers */
  ipHash?: string;
  userAgent?: string;
}>;

/**
 * Saved constraint preset for generator.
 */
export type LottoConstraintPresetType = Readonly<{
  id?: string;
  name: string;
  filters: LottoGenerateFiltersType;
  createdAt?: string;
}>;

/**
 * Monthly budget settings and progress for responsible use.
 */
export type LottoBudgetDocType = Readonly<{
  id?: string;
  /** e.g., '2025-09' */
  currentMonth: string;
  /** Monthly cap in KRW (client-side validation only; server is source of truth) */
  monthlyCap: number;
  /** Accumulated spend this month (client-estimated; server updates authoritative) */
  spent: number;
  /** Warning checkpoints shown, e.g., ['50%','80%','100%'] */
  warningsShown?: readonly string[];
  updatedAt?: string;
}>;

export type LottoDrawCardType = {
  readonly drawNumber: number;
  readonly drawDate: string;
  readonly numbers: readonly number[];
  readonly bonusNumber?: number;
  readonly firstWinCount?: number;
  readonly firstPrizeAmount?: number;
  readonly totalSalesAmount?: number;
};

export type LottoGenerateControlsType = {
  readonly count: number;
  readonly filters: LottoGenerateFiltersType;
  readonly onChangeCount: (next: number) => void;
  readonly onChangeFilters: (
    updater: (prev: LottoGenerateFiltersType) => LottoGenerateFiltersType
  ) => void;
};

export type LottoGeneratedItemType = {
  readonly numbers: readonly [number, number, number, number, number, number];
};

export type LottoGeneratedListType = {
  readonly items: ReadonlyArray<LottoGeneratedItemType>;
};

export type LottoWeightingControlsType = {
  readonly useWeight: boolean;
  readonly loading: boolean;
  readonly from: number;
  readonly to: number;
  readonly excludeLatest: boolean;
  readonly onToggleUseWeight: (next: boolean) => void;
  readonly onChangeFrom: (next: number) => void;
  readonly onChangeTo: (next: number) => void;
  readonly onToggleExcludeLatest: (next: boolean) => void;
};

/**
 * Weighting options for generator internals (hot/cold frequency).
 */
export type LottoWeightingOptionsType = Readonly<{
  /** frequency[1..45], used as weights */
  readonly frequency?: Readonly<Record<number, number>>;
  /** 0 (pure random) .. 1 (follow weights strongly) */
  readonly hotColdAlpha?: number;
}>;

export type LottoAnalysisControlsType = {
  readonly from: number;
  readonly to: number;
  readonly setFrom: (v: number) => void;
  readonly setTo: (v: number) => void;
  readonly isFetching: boolean;
  readonly onAnalyze: () => void;
  readonly headerAction?: ReactNode;
};

export type LottoAgeGateDialogType = Readonly<{
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>;

export type LottoClientCsvButtonType = {
  readonly className?: string;
  readonly headers: readonly string[];
  readonly rows: ReadonlyArray<readonly (string | number)[]>;
  readonly filename?: string;
  readonly baseLabel?: string;
};

export type LottoSimulatorControlsComponentType = Readonly<{
  ticketCount: number;
  drawCount: number;
  running: boolean;
  mode: 'random' | 'custom';
  onModeChange: (m: 'random' | 'custom') => void;
  onTicketCountChange: (value: number) => void;
  onDrawCountChange: (value: number) => void;
  onRun: () => void;
  canRun?: boolean;
}>;

export type LottoAgeGateModeType = 'always' | 'session' | 'ttl';
