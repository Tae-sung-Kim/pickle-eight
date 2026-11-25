import type { CalendarYmdType } from '@/types/calendar.type';

export function getKoreaTime(date = new Date()): Date {
  const utc = date.getTime();
  const localOffset = date.getTimezoneOffset() * 60 * 1000;
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(utc + localOffset + kstOffset);
}

/** 한국 시간(Asia/Seoul) 기준 날짜 키(YYYY-MM-DD). */
export function getKoreaDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string): string =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** 한국 시간(Asia/Seoul) 기준 오늘의 연·월·일(숫자). */
export function getKoreaYmd(date = new Date()): CalendarYmdType {
  const [year, month, day] = getKoreaDateKey(date).split('-').map(Number);
  return { year, month, day };
}

/** 'YYYY-MM-DD' */
export function toDateKey(ymd: CalendarYmdType): string {
  const pad = (n: number, len: number): string => String(n).padStart(len, '0');
  return `${pad(ymd.year, 4)}-${pad(ymd.month, 2)}-${pad(ymd.day, 2)}`;
}

/** 그레고리력 날짜 → 율리우스 일수(정오 기준 정수). 날짜 차이·일진 계산용 */
export function toJulianDayNumber(ymd: CalendarYmdType): number {
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

/** 0 = 일요일 ~ 6 = 토요일 */
export function getWeekdayIndex(ymd: CalendarYmdType): number {
  return (toJulianDayNumber(ymd) + 1) % 7;
}

export function fromJulianDayNumber(jdn: number): CalendarYmdType {
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
