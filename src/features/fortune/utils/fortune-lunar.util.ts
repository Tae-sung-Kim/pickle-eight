import type {
  FortuneBirthErrorType,
  FortuneBirthResolvedType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import {
  fromJulianDayNumber,
  toJulianDayNumber,
} from '@/features/fortune/utils/fortune-date.util';
import { findLunarYearRow, readLunarMonthLength } from '@/lib/lunar-calendar';
import type { LunarYearType } from '@/types/calendar.type';

const MONTH_MIN = 1;
const MONTH_MAX = 12;

function fail(error: FortuneBirthErrorType): FortuneBirthResolvedType {
  return { ok: false, error };
}

/** 그 음력 연도의 윤달 번호(1~12). 없으면 0, 표 범위 밖이면 null */
export function getLunarLeapMonth(lunarYear: number): number | null {
  const row = findLunarYearRow(lunarYear);
  return row ? row.leapMonth : null;
}

/** 그 음력 달의 날 수(29 | 30). 없는 달(윤달 없음)·표 범위 밖이면 null */
export function getLunarMonthLength(
  lunarYear: number,
  month: number,
  isLeapMonth: boolean
): 29 | 30 | null {
  const row = findLunarYearRow(lunarYear);
  if (
    !row ||
    !Number.isInteger(month) ||
    month < MONTH_MIN ||
    month > MONTH_MAX
  ) {
    return null;
  }
  if (isLeapMonth && row.leapMonth !== month) {
    return null;
  }
  return readLunarMonthLength(row, month, isLeapMonth);
}

function toNewYearYmd(row: LunarYearType): FortuneYmdType {
  return {
    year: row.year,
    month: Math.floor(row.newYear / 100),
    day: row.newYear % 100,
  };
}

/**
 * 그 양력 연도의 설날(음력 1월 1일) 양력 날짜.
 * 표 범위(1919~2049) 밖이면 RangeError. 호출부는 지원 범위(1920~2028) 안에서만 부른다
 */
export function getSeollalDate(solarYear: number): FortuneYmdType {
  const row = findLunarYearRow(solarYear);
  if (!row) {
    throw new RangeError('음력 표 범위 밖 연도입니다.');
  }
  return toNewYearYmd(row);
}

/**
 * 음력 → 양력. 윤달은 같은 번호 평달 바로 뒤에 온다.
 * 순서: 표 범위 → 달·일 형식(invalid-date) → 윤달 존재(lunar-no-leap) → 일 범위(lunar-invalid-day).
 * 1920-01-01 이전·2028-12-31 이후 판정은 하지 않는다(resolveFortuneBirth가 양력 환산 날짜로 한다)
 */
export function convertLunarToSolar(
  year: number,
  month: number,
  day: number,
  isLeapMonth: boolean
): FortuneBirthResolvedType {
  const row = findLunarYearRow(year);
  if (!row) {
    return fail('out-of-table');
  }
  if (
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < MONTH_MIN ||
    month > MONTH_MAX ||
    day < 1
  ) {
    return fail('invalid-date');
  }
  if (isLeapMonth && row.leapMonth !== month) {
    return fail('lunar-no-leap');
  }
  if (day > readLunarMonthLength(row, month, isLeapMonth)) {
    return fail('lunar-invalid-day');
  }

  let offsetDays = 0;
  for (let m = MONTH_MIN; m < month; m += 1) {
    offsetDays += readLunarMonthLength(row, m, false);
    if (row.leapMonth === m) {
      offsetDays += readLunarMonthLength(row, m, true);
    }
  }
  if (isLeapMonth) {
    offsetDays += readLunarMonthLength(row, month, false);
  }
  offsetDays += day - 1;

  const solar = fromJulianDayNumber(
    toJulianDayNumber(toNewYearYmd(row)) + offsetDays
  );
  return { ok: true, solar, isFromLunar: true };
}
