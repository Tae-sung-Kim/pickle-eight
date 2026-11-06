import type { FortuneYmdType } from '@/features/fortune/types/fortune.type';

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(year: number, month: number): number {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DAYS_IN_MONTH[month - 1];
}

/** 그레고리력에 실제로 있는 날짜인지 확인한다(2월 30일, 평년 2월 29일은 false) */
export function isValidSolarDate(ymd: FortuneYmdType): boolean {
  const { year, month, day } = ymd;
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return false;
  }
  if (month < 1 || month > 12 || day < 1) {
    return false;
  }
  return day <= getDaysInMonth(year, month);
}

/** 그레고리력 날짜 → 율리우스 일수(정오 기준 정수). 날짜 차이·일진 계산용 */
export function toJulianDayNumber(ymd: FortuneYmdType): number {
  const a = Math.floor((14 - ymd.month) / 12);
  const y = ymd.year + 4800 - a;
  const m = ymd.month + 12 * a - 3;
  return (
    ymd.day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function fromJulianDayNumber(jdn: number): FortuneYmdType {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const carry = Math.floor(m / 10);
  return {
    year: 100 * b + d - 4800 + carry,
    month: m + 3 - 12 * carry,
    day: e - Math.floor((153 * m + 2) / 5) + 1,
  };
}

export function compareYmd(a: FortuneYmdType, b: FortuneYmdType): -1 | 0 | 1 {
  if (a.year !== b.year) {
    return a.year < b.year ? -1 : 1;
  }
  if (a.month !== b.month) {
    return a.month < b.month ? -1 : 1;
  }
  if (a.day !== b.day) {
    return a.day < b.day ? -1 : 1;
  }
  return 0;
}

/** 'YYYY-MM-DD' → FortuneYmdType. 형식이 다르거나 없는 날짜면 null */
export function parseDateKey(key: string): FortuneYmdType | null {
  const match = DATE_KEY_PATTERN.exec(key);
  if (!match) {
    return null;
  }
  const ymd: FortuneYmdType = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  return isValidSolarDate(ymd) ? ymd : null;
}

/**
 * 만 나이. today는 KST 오늘(getKoreaDateKey 결과를 파싱한 값).
 * 2월 29일생은 평년에 3월 1일에 한 살이 늘어난 것으로 본다(plan 보수적 가정)
 */
export function calculateFortuneManAge(
  birth: FortuneYmdType,
  today: FortuneYmdType
): number {
  const isLeapDayBirth = birth.month === 2 && birth.day === 29;
  const birthdayThisYear: FortuneYmdType =
    isLeapDayBirth && !isLeapYear(today.year)
      ? { year: today.year, month: 3, day: 1 }
      : { year: today.year, month: birth.month, day: birth.day };
  const age = today.year - birth.year;
  return compareYmd(today, birthdayThisYear) < 0 ? age - 1 : age;
}
