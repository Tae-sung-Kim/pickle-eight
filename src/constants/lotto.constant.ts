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
