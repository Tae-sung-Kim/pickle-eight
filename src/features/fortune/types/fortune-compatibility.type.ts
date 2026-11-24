import type {
  FortuneStarSignKeyType,
  FortuneTtiKeyType,
} from '@/features/fortune/types/fortune.type';

/** 등급 3단계 키 */
export type FortuneCompatibilityGradeKeyType = 'good' | 'neutral' | 'adjust';

/** 조합 키. 두 키를 목록 순서로 정렬해 "앞-뒤"로 만든다. 같은 키면 "쥐-쥐"처럼 같은 키 두 개 */
export type FortuneCompatibilityPairKeyType<K extends string> = `${K}-${K}`;

export type FortuneCompatibilityTtiPairKeyType =
  FortuneCompatibilityPairKeyType<FortuneTtiKeyType>;

export type FortuneCompatibilityStarSignPairKeyType =
  FortuneCompatibilityPairKeyType<FortuneStarSignKeyType>;

/** 띠 관계 종류 */
export type FortuneCompatibilityTtiRelationKeyType =
  | 'same'
  | 'yukhap'
  | 'samhap'
  | 'banghap'
  | 'chung'
  | 'wonjin'
  | 'other';

/** 규칙 목록으로 정의되는 띠 관계(같은 띠, 그 밖의 관계 제외) */
export type FortuneCompatibilityTtiRuleRelationKeyType = Exclude<
  FortuneCompatibilityTtiRelationKeyType,
  'same' | 'other'
>;

/** 별자리 원소 */
export type FortuneCompatibilityElementKeyType =
  | 'fire'
  | 'earth'
  | 'air'
  | 'water';

/** 별자리 관계 종류. `same`은 같은 별자리(원소 관계는 같은 원소) */
export type FortuneCompatibilityStarSignRelationKeyType =
  | 'same'
  | 'sameElement'
  | 'complement'
  | 'opposite'
  | 'other';

/** 원소 관계(같은 별자리 구분 없음) */
export type FortuneCompatibilityElementRelationKeyType = Exclude<
  FortuneCompatibilityStarSignRelationKeyType,
  'same'
>;

/** 문구 묶음 하나 = 요약 1~2문장 + 잘 맞는 점 2개 + 조율하면 좋은 점 2개 */
export type FortuneCompatibilityCopyBundleType = Readonly<{
  summary: readonly string[];
  strengths: readonly [string, string];
  adjustments: readonly [string, string];
}>;

/** 띠 관계 유형 문단 6개(같은 띠 제외). 값은 CP-1이 채운다 */
export type FortuneCompatibilityTtiRelationCopyType = Readonly<
  Record<
    Exclude<FortuneCompatibilityTtiRelationKeyType, 'same'>,
    FortuneCompatibilityCopyBundleType
  >
>;

/** 별자리 관계 유형 문단 4개(같은 별자리 제외) */
export type FortuneCompatibilityStarSignRelationCopyType = Readonly<
  Record<
    Exclude<FortuneCompatibilityStarSignRelationKeyType, 'same'>,
    FortuneCompatibilityCopyBundleType
  >
>;

/** 같은 띠 전용 문단 12개 */
export type FortuneCompatibilityTtiSameCopyType = Readonly<
  Record<FortuneTtiKeyType, FortuneCompatibilityCopyBundleType>
>;

/** 같은 별자리 전용 문단 12개 */
export type FortuneCompatibilityStarSignSameCopyType = Readonly<
  Record<FortuneStarSignKeyType, FortuneCompatibilityCopyBundleType>
>;

/** 띠 궁합 판정 결과 */
export type FortuneCompatibilityTtiResultType = Readonly<{
  pairKey: FortuneCompatibilityTtiPairKeyType;
  relation: FortuneCompatibilityTtiRelationKeyType;
  grade: FortuneCompatibilityGradeKeyType;
}>;

/** 별자리 궁합 판정 결과 */
export type FortuneCompatibilityStarSignResultType = Readonly<{
  pairKey: FortuneCompatibilityStarSignPairKeyType;
  relation: FortuneCompatibilityStarSignRelationKeyType;
  grade: FortuneCompatibilityGradeKeyType;
}>;

/** 궁합 공유 종류. 공유 주소와 기능명을 고른다 */
export type FortuneCompatibilityShareKindType = 'tti' | 'starSign';

/** 궁합 공유 카드 입력. 생년월일, 관계 이름, 원소, 시각 후보는 받지 않는다(AC-7) */
export type FortuneCompatibilityShareInputType = Readonly<{
  kind: FortuneCompatibilityShareKindType;
  firstName: string;
  secondName: string;
  gradeKey: FortuneCompatibilityGradeKeyType;
  /** copy.summary[0] */
  summary: string;
}>;
