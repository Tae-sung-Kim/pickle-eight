import type { FortuneCompatibilityGradeKeyType } from '@/features/fortune/types/fortune-compatibility.type';

/** 등급 3단계. 표시 순서 */
export const FORTUNE_COMPATIBILITY_GRADES: readonly Readonly<{
  key: FortuneCompatibilityGradeKeyType;
  name: string;
}>[] = [
  { key: 'good', name: '잘 맞는 편' },
  { key: 'neutral', name: '무난한 편' },
  { key: 'adjust', name: '조율이 필요한 편' },
];

export const FORTUNE_COMPATIBILITY_GRADE_NAMES: Readonly<
  Record<FortuneCompatibilityGradeKeyType, string>
> = {
  good: '잘 맞는 편',
  neutral: '무난한 편',
  adjust: '조율이 필요한 편',
};
