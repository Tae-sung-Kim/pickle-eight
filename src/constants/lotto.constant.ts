import { LottoWarningToneType } from '@/types';

export const LOTTO_MAX_HISTORY_RANGE = 500 as const;

export const LOTTO_ANALYSIS_CHART_BUCKET_COLORS: Readonly<
  Record<string, string>
> = {
  '01-10': 'from-[var(--color-chart-1)] to-[var(--color-chart-1)]',
  '11-20': 'from-[var(--color-chart-2)] to-[var(--color-chart-2)]',
  '21-30': 'from-[var(--color-chart-3)] to-[var(--color-chart-3)]',
  '31-40': 'from-[var(--color-chart-4)] to-[var(--color-chart-4)]',
  '41-45': 'from-[var(--color-chart-5)] to-[var(--color-chart-5)]',
};

/**
 * default: 기존 primary 색상
 * byNumber: 라벨이 숫자(01~45)일 때 1~10/11~20/21~30/31~40/41~45 구간별 색상
 * byBucket: 라벨이 '01-10' 같은 구간일 때 구간별 색상
 *  */
export enum LOTTO_ANALYSIS_VARIANT_ENUM {
  DEFAULT = 'default',
  BY_NUMBER = 'byNumber',
  BY_BUCKET = 'byBucket',
}

// Use theme tokens instead of raw Tailwind colors for consistency
export const LOTTO_ANALYSIS_ODD_EVEN_COLOR_MAP: Readonly<
  Record<string, string>
> = {
  홀수: 'from-[var(--color-chart-1)] to-[var(--color-chart-1)]',
  짝수: 'from-[var(--color-chart-2)] to-[var(--color-chart-2)]',
};

export const LOTTO_ANALYSIS_SUM_COLOR_MAP: Readonly<Record<string, string>> = {
  '<=100': 'from-[var(--color-chart-1)] to-[var(--color-chart-1)]',
  '101-150': 'from-[var(--color-chart-2)] to-[var(--color-chart-2)]',
  '151-200': 'from-[var(--color-chart-3)] to-[var(--color-chart-3)]',
  '201-255': 'from-[var(--color-chart-4)] to-[var(--color-chart-4)]',
};

// token-like style map for tones
export const LOTTO_ALERT_TONE_STYLES: Record<
  LottoWarningToneType,
  { container: string; icon: string }
> = {
  danger: {
    container: 'border-red-200 bg-red-50 text-red-900',
    icon: 'text-red-600',
  },
  warning: {
    container: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: 'text-amber-600',
  },
  muted: {
    container: 'border-gray-200 bg-gray-50 text-gray-900',
    icon: 'text-gray-600',
  },
} as const;

export const LOTTO_WARNING_SPACING: Record<string, string> = {
  none: 'my-0',
  sm: 'mt-2 mb-4',
  md: 'mt-4 mb-6',
  lg: 'mt-6 mb-8',
} as const;

// use horizontal PADDING on a wrapper to avoid overflow beyond rounded containers
export const LOTTO_WARNING_X_PADDING: Record<string, string> = {
  none: 'px-0',
  sm: 'px-2',
  md: 'px-4',
  lg: 'px-6',
} as const;

export const LOTTO_MAX_CUSTOM_TICKETS = 50 as const;

export enum LOTTO_WARNING_TONE_ENUM {
  WARNING = 'warning',
  DANGER = 'danger',
  MUTED = 'muted',
}

// ===== Constants =====
// External endpoint is no longer called on user path; data must be pre-synced via /api/lotto/sync.
export const LOTTO_RATE_LIMIT_WINDOW_MS = 60_000 as const; // 1 minute
export const LOTTO_RATE_LIMIT_MAX = 60 as const; // max requests per IP per window
export const DH_LOTTO_ENDPOINT =
  'https://www.dhlottery.co.kr/common.do?method=getLottoNumber' as const;
