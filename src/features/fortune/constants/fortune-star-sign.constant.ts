import type { FortuneStarSignKeyType } from '@/features/fortune/types/fortune.type';

export type FortuneStarSignItemType = Readonly<{
  key: FortuneStarSignKeyType;
  /** 대표 표기(plan 결정 13: 사수자리) */
  name: string;
  /** 시작 중기의 절기 인덱스(design.md 4.5). 판정에 쓴다 */
  startTermIndex: number;
}>;

/**
 * 12별자리. 순서는 염소자리부터(타입 순서).
 * 시작 중기: 염소 동지(23), 물병 대한(1), 물고기 우수(3), 양 춘분(5), 황소 곡우(7), 쌍둥이 소만(9),
 * 게 하지(11), 사자 대서(13), 처녀 처서(15), 천칭 추분(17), 전갈 상강(19), 사수 소설(21)
 */
export const FORTUNE_STAR_SIGNS: readonly FortuneStarSignItemType[] = [
  { key: 'capricorn', name: '염소자리', startTermIndex: 23 },
  { key: 'aquarius', name: '물병자리', startTermIndex: 1 },
  { key: 'pisces', name: '물고기자리', startTermIndex: 3 },
  { key: 'aries', name: '양자리', startTermIndex: 5 },
  { key: 'taurus', name: '황소자리', startTermIndex: 7 },
  { key: 'gemini', name: '쌍둥이자리', startTermIndex: 9 },
  { key: 'cancer', name: '게자리', startTermIndex: 11 },
  { key: 'leo', name: '사자자리', startTermIndex: 13 },
  { key: 'virgo', name: '처녀자리', startTermIndex: 15 },
  { key: 'libra', name: '천칭자리', startTermIndex: 17 },
  { key: 'scorpio', name: '전갈자리', startTermIndex: 19 },
  { key: 'sagittarius', name: '사수자리', startTermIndex: 21 },
];

/**
 * 칩과 안내 콘텐츠에 보이는 "일반적인 기간"(안내용, 판정에 쓰지 않는다).
 * 서비스 자체 값이며 월.일 표기다. 연말에 걸친 염소자리는 12.22~1.19.
 */
export const FORTUNE_STAR_SIGN_GUIDE_RANGES: Readonly<
  Record<FortuneStarSignKeyType, string>
> = {
  capricorn: '12.22~1.19',
  aquarius: '1.20~2.18',
  pisces: '2.19~3.20',
  aries: '3.21~4.19',
  taurus: '4.20~5.20',
  gemini: '5.21~6.21',
  cancer: '6.22~7.22',
  leo: '7.23~8.22',
  virgo: '8.23~9.22',
  libra: '9.23~10.22',
  scorpio: '10.23~11.22',
  sagittarius: '11.23~12.21',
};
