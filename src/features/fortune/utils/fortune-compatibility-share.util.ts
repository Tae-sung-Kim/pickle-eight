import { FORTUNE_COMPATIBILITY_GRADE_NAMES } from '@/features/fortune/constants/fortune-compatibility-grade.constant';
import {
  FORTUNE_COMPATIBILITY_SHARE_FEATURE_NAMES,
  FORTUNE_COMPATIBILITY_SHARE_NOTICE,
  FORTUNE_COMPATIBILITY_SHARE_TARGETS,
} from '@/features/fortune/constants/fortune-compatibility-share.constant';
import type { FortuneCompatibilityShareInputType } from '@/features/fortune/types/fortune-compatibility.type';
import type { ShareCardFrameType } from '@/types/share.type';

export type FortuneCompatibilityShareBodyType = Readonly<{
  firstName: string;
  secondName: string;
  gradeName: string;
  summary: string;
}>;

export type FortuneCompatibilityShareCardType = Readonly<{
  frame: ShareCardFrameType;
  body: FortuneCompatibilityShareBodyType;
}>;

/** 두 이름, 등급 이름, 요약 한 줄만 카드에 싣는다. 결과가 없으면 null */
export function buildFortuneCompatibilityShareCard(
  input: FortuneCompatibilityShareInputType | null
): FortuneCompatibilityShareCardType | null {
  if (!input) return null;
  return {
    frame: {
      featureName: FORTUNE_COMPATIBILITY_SHARE_FEATURE_NAMES[input.kind],
      pathname: FORTUNE_COMPATIBILITY_SHARE_TARGETS[input.kind].pathname,
      notice: FORTUNE_COMPATIBILITY_SHARE_NOTICE,
      accent: 'fortune',
    },
    body: {
      firstName: input.firstName,
      secondName: input.secondName,
      gradeName: FORTUNE_COMPATIBILITY_GRADE_NAMES[input.gradeKey],
      summary: input.summary,
    },
  };
}
