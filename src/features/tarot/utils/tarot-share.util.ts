import {
  TAROT_SHARE_FEATURE_NAMES,
  TAROT_SHARE_NOTICE,
  TAROT_SHARE_TARGETS,
  type TarotShareKindType,
} from '@/features/tarot/constants/tarot-share.constant';
import type {
  TarotCardType,
  TarotSpreadPositionType,
} from '@/features/tarot/types/tarot.type';
import type { ShareCardFrameType } from '@/types/share.type';

/** 카드 한 장의 공유 내용. 질문, 해석 전문, 키워드는 받지 않는다 */
export type TarotShareItemType = Readonly<{
  /** 세 장에서만 값이 있다(과거·현재·미래) */
  positionLabel: string | null;
  card: TarotCardType;
  isReversed: boolean;
  summary: string;
}>;

export type TarotShareCardType = Readonly<{
  kind: TarotShareKindType;
  frame: ShareCardFrameType;
  items: readonly TarotShareItemType[];
}>;

export type TarotShareInputType = Readonly<{
  card: TarotCardType;
  isReversed: boolean;
  position?: TarotSpreadPositionType;
}>;

/** 요약(1~2문장)의 첫 문장 */
export function getTarotFirstSentence(summary: string): string {
  const match = summary.match(/^.*?[.!?](?=\s|$)/);
  return (match ? match[0] : summary).trim();
}

/** 입력이 비었거나 요약이 빈 카드가 있으면 null. 한 장이면 오늘의 타로, 세 장이면 세 장 타로 */
export function buildTarotShareCard(
  inputs: readonly TarotShareInputType[],
  expectedCount: 1 | 3
): TarotShareCardType | null {
  if (inputs.length !== expectedCount) return null;
  const items = inputs.map((input) => ({
    positionLabel: input.position?.label ?? null,
    card: input.card,
    isReversed: input.isReversed,
    summary: getTarotFirstSentence(
      (input.isReversed ? input.card.reversed : input.card.upright).summary
    ),
  }));
  if (items.some((item) => !item.summary)) return null;
  const kind: TarotShareKindType = expectedCount === 1 ? 'daily' : 'threeCard';
  return {
    kind,
    frame: {
      featureName: TAROT_SHARE_FEATURE_NAMES[kind],
      pathname: TAROT_SHARE_TARGETS[kind].pathname,
      notice: TAROT_SHARE_NOTICE,
      accent: 'tarot',
    },
    items,
  };
}
