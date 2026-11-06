import { FORTUNE_LUNAR_TABLE } from '@/features/fortune/constants/calendar/lunar-table.constant';
import type {
  FortuneBirthErrorType,
  FortuneBirthResolvedType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import type { FortuneLunarYearType } from '@/features/fortune/types/fortune-calendar.type';
import {
  fromJulianDayNumber,
  toJulianDayNumber,
} from '@/features/fortune/utils/fortune-date.util';

/** monthBits에서 윤달 길이를 담은 bit 위치(평달 1~12월은 bit0~bit11) */
const LEAP_MONTH_BIT = 12;
const MONTH_MIN = 1;
const MONTH_MAX = 12;

function fail(error: FortuneBirthErrorType): FortuneBirthResolvedType {
  return { ok: false, error };
}

/** 표에서 음력 연도 행을 찾는다. 표 범위 밖이면 null (예외를 던지지 않는다) */
function findLunarYear(lunarYear: number): FortuneLunarYearType | null {
  if (!Number.isInteger(lunarYear) || FORTUNE_LUNAR_TABLE.length === 0) {
    return null;
  }
  const row = FORTUNE_LUNAR_TABLE[lunarYear - FORTUNE_LUNAR_TABLE[0].year];
  return row && row.year === lunarYear ? row : null;
}

/** 행 안에서 달 길이를 읽는다. 달·윤달 존재 여부는 호출부가 먼저 확인한다 */
function readMonthLength(
  row: FortuneLunarYearType,
  month: number,
  isLeapMonth: boolean
): 29 | 30 {
  const bit = isLeapMonth ? LEAP_MONTH_BIT : month - 1;
  return (row.monthBits >> bit) & 1 ? 30 : 29;
}

/** 그 음력 연도의 윤달 번호(1~12). 없으면 0, 표 범위 밖이면 null */
export function getLunarLeapMonth(lunarYear: number): number | null {
  const row = findLunarYear(lunarYear);
  return row ? row.leapMonth : null;
}

/** 그 음력 달의 날 수(29 | 30). 없는 달(윤달 없음)·표 범위 밖이면 null */
export function getLunarMonthLength(
  lunarYear: number,
  month: number,
  isLeapMonth: boolean
): 29 | 30 | null {
  const row = findLunarYear(lunarYear);
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
  return readMonthLength(row, month, isLeapMonth);
}

function toNewYearYmd(row: FortuneLunarYearType): FortuneYmdType {
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
  const row = findLunarYear(solarYear);
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
  const row = findLunarYear(year);
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
  if (day > readMonthLength(row, month, isLeapMonth)) {
    return fail('lunar-invalid-day');
  }

  let offsetDays = 0;
  for (let m = MONTH_MIN; m < month; m += 1) {
    offsetDays += readMonthLength(row, m, false);
    if (row.leapMonth === m) {
      offsetDays += readMonthLength(row, m, true);
    }
  }
  if (isLeapMonth) {
    offsetDays += readMonthLength(row, month, false);
  }
  offsetDays += day - 1;

  const solar = fromJulianDayNumber(
    toJulianDayNumber(toNewYearYmd(row)) + offsetDays
  );
  return { ok: true, solar, isFromLunar: true };
}
