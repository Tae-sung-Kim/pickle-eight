import { useShare } from '@/hooks/use-share.hook';
import { toShareCardKey } from '@/lib/share';
import { LUCKY_DRAW_SHARE_TEXTS } from '../../constants/lucky-draw-share.constant';
import type {
  LuckyDrawLotsOpenedCardType,
  LuckyDrawLotsShareCardType,
} from '../../types/lucky-draw.type';
import { buildLotsShareCard } from '../../utils/lucky-draw-share.util';

const TARGET = {
  pathname: LUCKY_DRAW_SHARE_TEXTS.lots.pathname,
  title: LUCKY_DRAW_SHARE_TEXTS.lots.title,
  text: LUCKY_DRAW_SHARE_TEXTS.lots.text,
  fileName: LUCKY_DRAW_SHARE_TEXTS.lots.fileName,
} as const;

/**
 * 제비뽑기 공유. 열린 카드만 입력으로 받는다. 이름 가림 옵션이 없어 미리보기를 쓰지 않는다.
 */
export function useLuckyDrawLotsShare(
  openedCards: readonly LuckyDrawLotsOpenedCardType[]
) {
  const card: LuckyDrawLotsShareCardType | null = buildLotsShareCard({
    openedCards,
  });
  const { cardRef, controller } = useShare({
    target: TARGET,
    cardKey: card ? toShareCardKey(card) : null,
    requiresPreview: false,
  });
  return { card, cardRef, controller };
}
