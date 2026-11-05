import { TAROT_CARD_COUNT } from '@/features/tarot/constants/tarot-cards.constant';
import type { TarotDrawnCardType } from '@/features/tarot/types/tarot.type';
import { secureRandomInt } from '@/lib/random';

function drawOrientation(isReversedEnabled: boolean): boolean {
  return isReversedEnabled && secureRandomInt(2) === 1;
}

/** 1장. isReversedEnabled가 false면 항상 정방향 */
export function drawTarotCard(isReversedEnabled: boolean): TarotDrawnCardType {
  return {
    cardId: secureRandomInt(TAROT_CARD_COUNT),
    isReversed: drawOrientation(isReversedEnabled),
  };
}

/** count장, 중복 없음. 0~77 배열에 부분 Fisher-Yates(앞에서 count번)를 적용 */
export function drawTarotCards(
  count: number,
  isReversedEnabled: boolean
): readonly TarotDrawnCardType[] {
  const safeCount = Math.min(
    TAROT_CARD_COUNT,
    Math.max(0, Math.floor(Number.isFinite(count) ? count : 0))
  );
  const deck = Array.from({ length: TAROT_CARD_COUNT }, (_, index) => index);
  const drawn: TarotDrawnCardType[] = [];

  for (let i = 0; i < safeCount; i += 1) {
    const j = i + secureRandomInt(TAROT_CARD_COUNT - i);
    [deck[i], deck[j]] = [deck[j], deck[i]];
    drawn.push({
      cardId: deck[i],
      isReversed: drawOrientation(isReversedEnabled),
    });
  }

  return drawn;
}
