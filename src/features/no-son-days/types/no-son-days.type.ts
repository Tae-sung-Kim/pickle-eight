import type { CalendarYmdType, LunarDateType } from '@/types/calendar.type';

export type NoSonDayInfoType = Readonly<{
  /** 'YYYY-MM-DD' */
  dateKey: string;
  solar: CalendarYmdType;
  /** 0 = 일 ~ 6 = 토 */
  weekday: number;
  lunar: LunarDateType;
  isNoSonDay: boolean;
}>;

export type NoSonMonthType = Readonly<{
  year: number;
  month: number;
  /** 1일 앞 빈칸 수(일요일 시작) = 1일의 weekday */
  leadingBlankCount: number;
  days: readonly NoSonDayInfoType[];
}>;

export type NoSonYearType = Readonly<{
  year: number;
  /** 길이 12 */
  months: readonly Readonly<{
    month: number;
    noSonDays: readonly NoSonDayInfoType[];
  }>[];
}>;

export type NoSonNextDayType = Readonly<{
  day: NoSonDayInfoType;
  daysUntil: number;
}>;

export type NoSonTodayStatusType =
  | Readonly<{
      kind: 'in-range';
      today: NoSonDayInfoType;
      next: NoSonNextDayType | null;
    }>
  | Readonly<{ kind: 'out-of-range'; todayKey: string }>;

export type NoSonMonthCursorType = Readonly<{ year: number; month: number }>;
