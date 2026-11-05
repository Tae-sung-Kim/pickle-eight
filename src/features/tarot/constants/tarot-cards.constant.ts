import { TAROT_CUPS_CARDS } from '@/features/tarot/constants/cards/cups.constant';
import { TAROT_MAJOR_CARDS } from '@/features/tarot/constants/cards/major.constant';
import { TAROT_PENTACLES_CARDS } from '@/features/tarot/constants/cards/pentacles.constant';
import { TAROT_SWORDS_CARDS } from '@/features/tarot/constants/cards/swords.constant';
import { TAROT_WANDS_CARDS } from '@/features/tarot/constants/cards/wands.constant';
import type { TarotCardType } from '@/features/tarot/types/tarot.type';

/** 78장 합본. id 순서(메이저, 완드, 컵, 소드, 펜타클)이며 TAROT_CARDS[i].id === i 이다 */
export const TAROT_CARDS: readonly TarotCardType[] = [
  ...TAROT_MAJOR_CARDS,
  ...TAROT_WANDS_CARDS,
  ...TAROT_CUPS_CARDS,
  ...TAROT_SWORDS_CARDS,
  ...TAROT_PENTACLES_CARDS,
];

export const TAROT_CARD_COUNT = 78;
