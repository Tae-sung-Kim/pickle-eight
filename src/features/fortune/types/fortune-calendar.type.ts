/** 음력 한 해. 표의 한 행 */
export type FortuneLunarYearType = Readonly<{
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

/**
 * 절기 인덱스 0~23: 0 소한, 1 대한, 2 입춘, 3 우수, 4 경칩, 5 춘분, 6 청명, 7 곡우,
 * 8 입하, 9 소만, 10 망종, 11 하지, 12 소서, 13 대서, 14 입추, 15 처서,
 * 16 백로, 17 추분, 18 한로, 19 상강, 20 입동, 21 소설, 22 대설, 23 동지
 */
export type FortuneSolarTermIndexType = number;

/**
 * 한 해 24절기 시각(KST, UTC+9 기준). 각 값은 MMDDHHmm 정수 (예: 2032310 = 2월 3일 23:10).
 * 사람이 KASI 원자료와 바로 대조할 수 있게 읽기 쉬운 형식으로 둔다
 */
export type FortuneSolarTermYearType = readonly number[]; // 길이 24
