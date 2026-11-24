import type { FortuneStarSignKeyType } from '@/features/fortune/types/fortune.type';
import type {
  FortuneCompatibilityElementKeyType,
  FortuneCompatibilityElementRelationKeyType,
  FortuneCompatibilityGradeKeyType,
  FortuneCompatibilityStarSignRelationKeyType,
} from '@/features/fortune/types/fortune-compatibility.type';

/** 12별자리 원소 (docs/research/compatibility.md 5.2 표 그대로) */
export const FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS: Readonly<
  Record<FortuneStarSignKeyType, FortuneCompatibilityElementKeyType>
> = {
  aries: 'fire',
  leo: 'fire',
  sagittarius: 'fire',
  taurus: 'earth',
  virgo: 'earth',
  capricorn: 'earth',
  gemini: 'air',
  libra: 'air',
  aquarius: 'air',
  cancer: 'water',
  scorpio: 'water',
  pisces: 'water',
};

export const FORTUNE_COMPATIBILITY_ELEMENT_NAMES: Readonly<
  Record<FortuneCompatibilityElementKeyType, string>
> = {
  fire: '불',
  earth: '흙',
  air: '공기',
  water: '물',
};

/**
 * 서로 다른 원소 조합의 관계 규칙. 같은 원소는 코드에서 따로 판정한다.
 * 보완: 불+공기, 흙+물. 대립: 불+물, 공기+흙. 그 밖: 불+흙, 공기+물.
 * 보완·대립은 대중 블로그 기준이라 출처 확인 필요(리서치 5.2).
 */
export const FORTUNE_COMPATIBILITY_ELEMENT_PAIR_RULES: Readonly<
  Record<
    'complement' | 'opposite' | 'other',
    readonly (readonly [
      FortuneCompatibilityElementKeyType,
      FortuneCompatibilityElementKeyType,
    ])[]
  >
> = {
  complement: [
    ['fire', 'air'],
    ['earth', 'water'],
  ],
  opposite: [
    ['fire', 'water'],
    ['air', 'earth'],
  ],
  other: [
    ['fire', 'earth'],
    ['air', 'water'],
  ],
};

/** 관계 우선순위. 같은 별자리가 가장 앞이다 */
export const FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_PRIORITY: readonly FortuneCompatibilityStarSignRelationKeyType[] =
  ['same', 'sameElement', 'complement', 'opposite', 'other'];

export const FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_NAMES: Readonly<
  Record<FortuneCompatibilityStarSignRelationKeyType, string>
> = {
  same: '같은 별자리',
  sameElement: '같은 원소',
  complement: '보완',
  opposite: '대립',
  other: '그 밖의 관계',
};

/** 원소 관계 이름(같은 별자리는 원소 관계가 같은 원소) */
export const FORTUNE_COMPATIBILITY_ELEMENT_RELATION_NAMES: Readonly<
  Record<FortuneCompatibilityElementRelationKeyType, string>
> = {
  sameElement: '같은 원소',
  complement: '보완',
  opposite: '대립',
  other: '그 밖의 관계',
};

/** 관계 → 등급. 같은 원소(같은 별자리 포함)와 보완 잘 맞는 편, 대립 조율이 필요한 편, 그 밖 무난한 편 */
export const FORTUNE_COMPATIBILITY_STAR_SIGN_GRADE_BY_RELATION: Readonly<
  Record<
    FortuneCompatibilityStarSignRelationKeyType,
    FortuneCompatibilityGradeKeyType
  >
> = {
  same: 'good',
  sameElement: 'good',
  complement: 'good',
  opposite: 'adjust',
  other: 'neutral',
};
