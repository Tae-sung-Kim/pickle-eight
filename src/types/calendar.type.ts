/** 양력(그레고리력) 날짜 */
export type CalendarYmdType = Readonly<{
  year: number;
  month: number;
  day: number;
}>;

/** 음력 한 해. 표의 한 행 */
export type LunarYearType = Readonly<{
  /** 음력 연도 */
  year: number;
  /** 음력 1월 1일(설날)의 양력 날짜. 같은 해 1~2월이므로 MMDD 정수 (예: 129 = 1월 29일) */
  newYear: number;
  /** 윤달이 붙는 달(1~12). 없으면 0 */
  leapMonth: number;
  /**
   * 달 길이 비트. 평달 1~12월 순서로 bit0~bit11, 윤달은 bit12.
   * 1이면 30일, 0이면 29일
   */
  monthBits: number;
}>;

/** 음력 날짜 */
export type LunarDateType = Readonly<{
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
}>;
