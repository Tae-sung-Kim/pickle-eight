import { LUNAR_TABLE } from '@/constants/lunar-table.constant';
import { fromJulianDayNumber, toJulianDayNumber } from '@/lib/date';
import type {
  CalendarYmdType,
  LunarDateType,
  LunarYearType,
} from '@/types/calendar.type';

/** monthBits에서 윤달 길이를 담은 bit 위치(평달 1~12월은 bit0~bit11) */
const LEAP_MONTH_BIT = 12;
const MONTH_COUNT = 12;

/** 음력 연도 행. 표 범위 밖이면 null (던지지 않는다) */
export function findLunarYearRow(lunarYear: number): LunarYearType | null {
  if (!Number.isInteger(lunarYear) || LUNAR_TABLE.length === 0) {
    return null;
  }
  const row = LUNAR_TABLE[lunarYear - LUNAR_TABLE[0].year];
  return row && row.year === lunarYear ? row : null;
}

/** 행 안의 달 길이. 달·윤달 존재 여부는 호출부가 먼저 확인한다 */
export function readLunarMonthLength(
  row: LunarYearType,
  month: number,
  isLeapMonth: boolean
): 29 | 30 {
  const bit = isLeapMonth ? LEAP_MONTH_BIT : month - 1;
  return (row.monthBits >> bit) & 1 ? 30 : 29;
}

function newYearJdn(row: LunarYearType): number {
  return toJulianDayNumber({
    year: row.year,
    month: Math.floor(row.newYear / 100),
    day: row.newYear % 100,
  });
}

/**
 * 양력 → 음력. 표 범위 밖이면 null.
 * 양력 연도 Y의 날짜는 음력 Y년(설날 이후) 또는 Y-1년(설날 이전)에 속한다.
 */
export function convertSolarToLunar(
  ymd: CalendarYmdType
): LunarDateType | null {
  const jdn = toJulianDayNumber(ymd);
  const solarYear = fromJulianDayNumber(jdn).year;
  const current = findLunarYearRow(solarYear);
  const row =
    current && jdn >= newYearJdn(current)
      ? current
      : findLunarYearRow(solarYear - 1);
  if (!row) {
    return null;
  }

  let offset = jdn - newYearJdn(row);
  if (offset < 0) {
    return null;
  }
  for (let month = 1; month <= MONTH_COUNT; month += 1) {
    const slots: boolean[] = row.leapMonth === month ? [false, true] : [false];
    for (const isLeapMonth of slots) {
      const length = readLunarMonthLength(row, month, isLeapMonth);
      if (offset < length) {
        return { year: row.year, month, day: offset + 1, isLeapMonth };
      }
      offset -= length;
    }
  }
  return null;
}
