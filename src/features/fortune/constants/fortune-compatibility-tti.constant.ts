import type { FortuneTtiKeyType } from '@/features/fortune/types/fortune.type';
import type {
  FortuneCompatibilityGradeKeyType,
  FortuneCompatibilityTtiRelationKeyType,
  FortuneCompatibilityTtiRuleRelationKeyType,
} from '@/features/fortune/types/fortune-compatibility.type';

type TtiPairType = readonly [FortuneTtiKeyType, FortuneTtiKeyType];
type TtiGroupType = readonly [
  FortuneTtiKeyType,
  FortuneTtiKeyType,
  FortuneTtiKeyType,
];

/**
 * 띠 관계 규칙 목록 (docs/research/compatibility.md 5.1 표 그대로).
 * 78조합 관계표는 손으로 쓰지 않고 이 목록에서 계산한다(utils).
 * 원진은 출처마다 2쌍(용-닭, 뱀-원숭이) 차이가 있어 여러 사이트가 쓰는 쪽을 따랐다. 확인 필요.
 */

/** 쌍으로 정의되는 관계: 육합, 충, 원진 (각 6쌍) */
export const FORTUNE_COMPATIBILITY_TTI_PAIR_RULES: Readonly<
  Record<'yukhap' | 'chung' | 'wonjin', readonly TtiPairType[]>
> = {
  yukhap: [
    ['rat', 'ox'],
    ['tiger', 'pig'],
    ['rabbit', 'dog'],
    ['dragon', 'rooster'],
    ['snake', 'monkey'],
    ['horse', 'goat'],
  ],
  chung: [
    ['rat', 'horse'],
    ['ox', 'goat'],
    ['tiger', 'monkey'],
    ['rabbit', 'rooster'],
    ['dragon', 'dog'],
    ['snake', 'pig'],
  ],
  wonjin: [
    ['rat', 'goat'],
    ['ox', 'horse'],
    ['tiger', 'rooster'],
    ['rabbit', 'monkey'],
    ['dragon', 'pig'],
    ['snake', 'dog'],
  ],
};

/** 무리로 정의되는 관계: 삼합, 방합 (각 4조, 조 안의 모든 쌍이 해당) */
export const FORTUNE_COMPATIBILITY_TTI_GROUP_RULES: Readonly<
  Record<'samhap' | 'banghap', readonly TtiGroupType[]>
> = {
  samhap: [
    ['rat', 'dragon', 'monkey'],
    ['ox', 'snake', 'rooster'],
    ['tiger', 'horse', 'dog'],
    ['rabbit', 'goat', 'pig'],
  ],
  banghap: [
    ['tiger', 'rabbit', 'dragon'],
    ['snake', 'horse', 'goat'],
    ['monkey', 'rooster', 'dog'],
    ['pig', 'rat', 'ox'],
  ],
};

/**
 * 관계 우선순위. 앞이 이긴다. 같은 띠 > 육합 > 삼합 > 방합 > 충 > 원진 > 그 밖의 관계.
 * 겹치는 쌍은 쥐-소, 말-양(육합과 방합)뿐이고 둘 다 육합이 된다.
 */
export const FORTUNE_COMPATIBILITY_TTI_RELATION_PRIORITY: readonly FortuneCompatibilityTtiRelationKeyType[] =
  ['same', 'yukhap', 'samhap', 'banghap', 'chung', 'wonjin', 'other'];

/** 규칙 목록 판정 순서(같은 띠, 그 밖의 관계 제외) */
export const FORTUNE_COMPATIBILITY_TTI_RULE_RELATIONS: readonly FortuneCompatibilityTtiRuleRelationKeyType[] =
  ['yukhap', 'samhap', 'banghap', 'chung', 'wonjin'];

export const FORTUNE_COMPATIBILITY_TTI_RELATION_NAMES: Readonly<
  Record<FortuneCompatibilityTtiRelationKeyType, string>
> = {
  same: '같은 띠',
  yukhap: '육합',
  samhap: '삼합',
  banghap: '방합',
  chung: '충',
  wonjin: '원진',
  other: '그 밖의 관계',
};

/** 관계 → 등급. 육합·삼합·방합 잘 맞는 편, 충·원진 조율이 필요한 편, 그 밖과 같은 띠 무난한 편 */
export const FORTUNE_COMPATIBILITY_TTI_GRADE_BY_RELATION: Readonly<
  Record<
    FortuneCompatibilityTtiRelationKeyType,
    FortuneCompatibilityGradeKeyType
  >
> = {
  same: 'neutral',
  yukhap: 'good',
  samhap: 'good',
  banghap: 'good',
  chung: 'adjust',
  wonjin: 'adjust',
  other: 'neutral',
};
