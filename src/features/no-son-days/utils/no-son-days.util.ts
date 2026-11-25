import {
  fromJulianDayNumber,
  getWeekdayIndex,
  toDateKey,
  toJulianDayNumber,
} from '@/lib/date';
import { convertSolarToLunar } from '@/lib/lunar-calendar';
import type { CalendarYmdType } from '@/types/calendar.type';
import {
  NO_SON_DAYS_MAX_YEAR,
  NO_SON_DAYS_MIN_YEAR,
  NO_SON_LUNAR_LAST_DIGITS,
} from '../constants/no-son-days-route.constant';
import type {
  NoSonDayInfoType,
  NoSonMonthCursorType,
  NoSonMonthType,
  NoSonTodayStatusType,
  NoSonYearType,
} from '../types/no-son-days.type';

const RANGE_START: CalendarYmdType = {
  year: NO_SON_DAYS_MIN_YEAR,
  month: 1,
  day: 1,
};
const RANGE_END: CalendarYmdType = {
  year: NO_SON_DAYS_MAX_YEAR,
  month: 12,
  day: 31,
};
const RANGE_START_JDN = toJulianDayNumber(RANGE_START);
const RANGE_END_JDN = toJulianDayNumber(RANGE_END);

/** 음력 날짜 끝자리가 9 또는 0 (9, 10, 19, 20, 29, 30일) */
export function isNoSonLunarDay(lunarDay: number): boolean {
  return NO_SON_LUNAR_LAST_DIGITS.includes(lunarDay % 10);
}

/** 표시 범위(2026-01-01~2049-12-31) 안인지 */
export function isWithinNoSonRange(ymd: CalendarYmdType): boolean {
  const jdn = toJulianDayNumber(ymd);
  return jdn >= RANGE_START_JDN && jdn <= RANGE_END_JDN;
}

function infoFromJdn(jdn: number): NoSonDayInfoType | null {
  if (jdn < RANGE_START_JDN || jdn > RANGE_END_JDN) return null;
  const solar = fromJulianDayNumber(jdn);
  const lunar = convertSolarToLunar(solar);
  if (!lunar) return null;
  return {
    dateKey: toDateKey(solar),
    solar,
    weekday: getWeekdayIndex(solar),
    lunar,
    isNoSonDay: isNoSonLunarDay(lunar.day),
  };
}

/** 범위 밖이면 null */
export function getNoSonDayInfo(ymd: CalendarYmdType): NoSonDayInfoType | null {
  return infoFromJdn(toJulianDayNumber(ymd));
}

function daysInMonth(year: number, month: number): number {
  const first = toJulianDayNumber({ year, month, day: 1 });
  const nextFirst = toJulianDayNumber(
    month === 12
      ? { year: year + 1, month: 1, day: 1 }
      : { year, month: month + 1, day: 1 }
  );
  return nextFirst - first;
}

function isValidMonth(year: number, month: number): boolean {
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    year >= NO_SON_DAYS_MIN_YEAR &&
    year <= NO_SON_DAYS_MAX_YEAR &&
    month >= 1 &&
    month <= 12
  );
}

/** 범위 밖 연·월이면 null */
export function buildNoSonMonth(
  year: number,
  month: number
): NoSonMonthType | null {
  if (!isValidMonth(year, month)) return null;
  const length = daysInMonth(year, month);
  const days: NoSonDayInfoType[] = [];
  for (let day = 1; day <= length; day += 1) {
    const info = getNoSonDayInfo({ year, month, day });
    if (!info) return null;
    days.push(info);
  }
  return {
    year,
    month,
    leadingBlankCount: getWeekdayIndex({ year, month, day: 1 }),
    days,
  };
}

/** 2026~2049 밖이면 null */
export function buildNoSonYear(year: number): NoSonYearType | null {
  if (
    !Number.isInteger(year) ||
    year < NO_SON_DAYS_MIN_YEAR ||
    year > NO_SON_DAYS_MAX_YEAR
  ) {
    return null;
  }
  const months: { month: number; noSonDays: readonly NoSonDayInfoType[] }[] =
    [];
  for (let month = 1; month <= 12; month += 1) {
    const built = buildNoSonMonth(year, month);
    if (!built) return null;
    months.push({ month, noSonDays: built.days.filter((d) => d.isNoSonDay) });
  }
  return { year, months };
}

/** 기준 날짜(한국 시간 오늘)의 상태 */
export function getNoSonTodayStatus(
  today: CalendarYmdType
): NoSonTodayStatusType {
  const todayJdn = toJulianDayNumber(today);
  const todayInfo = infoFromJdn(todayJdn);
  if (!todayInfo) {
    return { kind: 'out-of-range', todayKey: toDateKey(today) };
  }
  for (let jdn = todayJdn + 1; jdn <= RANGE_END_JDN; jdn += 1) {
    const info = infoFromJdn(jdn);
    if (info?.isNoSonDay) {
      return {
        kind: 'in-range',
        today: todayInfo,
        next: { day: info, daysUntil: jdn - todayJdn },
      };
    }
  }
  return { kind: 'in-range', today: todayInfo, next: null };
}

/** 허브 달력의 처음 달. 항상 표시 범위 안의 커서를 돌려준다 */
export function getNoSonInitialMonth(
  today: CalendarYmdType
): NoSonMonthCursorType {
  const jdn = toJulianDayNumber(today);
  if (jdn < RANGE_START_JDN) {
    return { year: RANGE_START.year, month: RANGE_START.month };
  }
  if (jdn > RANGE_END_JDN) {
    return { year: RANGE_END.year, month: RANGE_END.month };
  }
  return { year: today.year, month: today.month };
}

/** '2026'~'2049'만 숫자로 돌려준다 */
export function parseNoSonDaysYear(value: string): number | null {
  if (!/^\d{4}$/.test(value)) return null;
  const year = Number(value);
  return year >= NO_SON_DAYS_MIN_YEAR && year <= NO_SON_DAYS_MAX_YEAR
    ? year
    : null;
}

/** 2026~2049 */
export function getNoSonDaysYears(): readonly number[] {
  return Array.from(
    { length: NO_SON_DAYS_MAX_YEAR - NO_SON_DAYS_MIN_YEAR + 1 },
    (_, i) => NO_SON_DAYS_MIN_YEAR + i
  );
}

/** 이동 결과. 범위 밖으로 가면 null */
export function moveNoSonMonth(
  cursor: NoSonMonthCursorType,
  delta: -1 | 1
): NoSonMonthCursorType | null {
  const index = cursor.year * 12 + (cursor.month - 1) + delta;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return isValidMonth(year, month) ? { year, month } : null;
}
