import type { FortuneTtiKeyType } from '@/features/fortune/types/fortune.type';

export type FortuneZodiacItemType = Readonly<{
  key: FortuneTtiKeyType;
  name: string;
}>;

/** 12띠. 순서는 쥐부터 돼지까지이며 인덱스가 연도 주기의 나머지와 같다 */
export const FORTUNE_ZODIAC: readonly FortuneZodiacItemType[] = [
  { key: 'rat', name: '쥐띠' },
  { key: 'ox', name: '소띠' },
  { key: 'tiger', name: '호랑이띠' },
  { key: 'rabbit', name: '토끼띠' },
  { key: 'dragon', name: '용띠' },
  { key: 'snake', name: '뱀띠' },
  { key: 'horse', name: '말띠' },
  { key: 'goat', name: '양띠' },
  { key: 'monkey', name: '원숭이띠' },
  { key: 'rooster', name: '닭띠' },
  { key: 'dog', name: '개띠' },
  { key: 'pig', name: '돼지띠' },
];

/** 연도 주기: 인덱스 = ((연도 - FORTUNE_ZODIAC_BASE_OFFSET) mod FORTUNE_ZODIAC_CYCLE). 0 = 쥐 */
export const FORTUNE_ZODIAC_CYCLE = 12;
export const FORTUNE_ZODIAC_BASE_OFFSET = 4;
