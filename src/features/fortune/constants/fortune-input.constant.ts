export const FORTUNE_MIN_BIRTH = { year: 1920, month: 1, day: 1 } as const;
/** 절기 표 마지막 연도와 같아야 한다(17장 검사). F-1로 표를 늘리면 함께 올린다 */
export const FORTUNE_SUPPORTED_MAX_YEAR = 2028;
export const FORTUNE_MAX_BIRTH = {
  year: FORTUNE_SUPPORTED_MAX_YEAR,
  month: 12,
  day: 31,
} as const;
/** 절기 표 만료 경보 시작일(17장 만료 감시 테스트). F-1 기한 */
export const FORTUNE_SOLAR_TERM_RENEW_BY = '2028-12-01';
export const FORTUNE_MIN_AGE = 14;

/** 입력 범위. 연도는 지원 범위 상수에서 만든다(상한은 화면에서 KST 오늘 연도와 비교해 줄인다) */
export const FORTUNE_BIRTH_YEAR_MIN = FORTUNE_MIN_BIRTH.year;
export const FORTUNE_BIRTH_YEAR_MAX = FORTUNE_MAX_BIRTH.year;
export const FORTUNE_BIRTH_MONTH_MIN = 1;
export const FORTUNE_BIRTH_MONTH_MAX = 12;
export const FORTUNE_BIRTH_DAY_MIN = 1;
export const FORTUNE_BIRTH_DAY_MAX = 31;
