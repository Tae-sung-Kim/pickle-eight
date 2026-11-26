import {
  FORTUNE_SHARE_FEATURE_NAMES,
  FORTUNE_SHARE_NOTICE,
  FORTUNE_SHARE_TARGETS,
  type FortuneShareKindType,
} from '@/features/fortune/constants/fortune-share.constant';
import type { FortuneLuckyType } from '@/features/fortune/types/fortune.type';
import type { ShareCardFrameType } from '@/types/share.type';

/** 카드 입력. 생년월일, 입력 이름, 날짜는 받지 않는다. name은 띠·별자리 이름만 */
export type FortuneShareInputType = Readonly<{
  kind: FortuneShareKindType;
  name?: string;
  summary: string;
  lucky: Pick<FortuneLuckyType, 'color' | 'direction' | 'numbers'> | null;
}>;

export type FortuneShareBodyType = Readonly<{
  name: string | null;
  summary: string;
  lucky: Readonly<{
    color: string;
    direction: string;
    numbers: readonly number[];
  }> | null;
}>;

export type FortuneShareCardType = Readonly<{
  frame: ShareCardFrameType;
  body: FortuneShareBodyType;
}>;

/** 요약이 비면 null. 행운 요소가 없으면 lucky만 null로 두고 카드는 만든다 */
export function buildFortuneShareCard(
  input: FortuneShareInputType | null
): FortuneShareCardType | null {
  if (!input?.summary) return null;
  const { lucky } = input;
  return {
    frame: {
      featureName: FORTUNE_SHARE_FEATURE_NAMES[input.kind],
      pathname: FORTUNE_SHARE_TARGETS[input.kind].pathname,
      notice: FORTUNE_SHARE_NOTICE,
      accent: 'fortune',
    },
    body: {
      name: input.name ?? null,
      summary: input.summary,
      lucky: lucky
        ? {
            color: lucky.color,
            direction: lucky.direction,
            numbers: [...lucky.numbers],
          }
        : null,
    },
  };
}
