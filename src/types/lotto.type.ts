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

export type LottoGenerateFiltersType = {
  readonly sumMin?: number;
  readonly sumMax?: number;
  readonly maxConsecutive?: number; // 0=금지, 1=허용, 2=최대 2연속 ...
  readonly desiredOddCount?: number; // 0..6, 비우면 제한 없음
  readonly minBucketSpread?: number; // 서로 다른 구간(01-10..41-45) 최소 개수
  readonly excludeRecentNumbers?: readonly number[]; // 최근 회차에서 제외할 번호들
};

export type LottoWeightingOptionsType = {
  /** frequency[1..45], 가중치로 사용 */
  readonly frequency?: Readonly<Record<number, number>>;
  /** 0(완전랜덤) ~ 1(빈도에 완전 의존) */
  readonly hotColdAlpha?: number;
};

export type LottoAgeGateModeType = 'always' | 'session' | 'ttl';

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
