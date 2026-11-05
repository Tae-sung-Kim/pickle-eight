import { TAROT_CARDS } from '@/features/tarot/constants/tarot-cards.constant';
import type { TarotCardType } from '@/features/tarot/types/tarot.type';

/** 등록되지 않은 번호면 undefined */
export function getTarotCardById(cardId: number): TarotCardType | undefined {
  if (!Number.isInteger(cardId)) return undefined;
  return TAROT_CARDS[cardId];
}

/** 예: '바보 (The Fool)' */
export function formatTarotCardName(card: TarotCardType): string {
  return `${card.nameKo} (${card.nameEn})`;
}

/** 앞면 접근성 이름. 예: '바보 카드, 정방향'. 위치 이름은 넣지 않는다 */
export function getTarotCardAlt(
  card: TarotCardType,
  isReversed: boolean
): string {
  return `${card.nameKo} 카드, ${isReversed ? '역방향' : '정방향'}`;
}
