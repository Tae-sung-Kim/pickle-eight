import type { FortuneLuckyType } from '@/features/fortune/types/fortune.type';

export const FORTUNE_LUCKY_NUMBER_MIN = 1;
export const FORTUNE_LUCKY_NUMBER_MAX = 10;

/**
 * 오행별 행운 색·방향·숫자 대응표(서비스 자체 규칙, design.md 4.7).
 * 순서(목, 화, 토, 금, 수)가 곧 난수 `floor(r * 5)`의 인덱스다. 바꾸면 결과가 바뀐다.
 * 숫자는 항상 1~10 안의 두 수이고, 한 개만 보일 때는 `floor(r * 2)`번째를 쓴다.
 */
export const FORTUNE_LUCKY_TABLE: readonly FortuneLuckyType[] = [
  { element: 'wood', color: '초록', direction: '동쪽', numbers: [3, 8] },
  { element: 'fire', color: '빨강', direction: '남쪽', numbers: [2, 7] },
  { element: 'earth', color: '노랑', direction: '가운데', numbers: [5, 10] },
  { element: 'metal', color: '흰색', direction: '서쪽', numbers: [4, 9] },
  { element: 'water', color: '파랑', direction: '북쪽', numbers: [1, 6] },
];
