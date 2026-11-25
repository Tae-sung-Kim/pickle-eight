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
