import { TAROT_TOPIC_READINGS } from '@/features/tarot/constants/tarot-topic-reading.constant';
import type {
  TarotCardType,
  TarotSuitGroupType,
  TarotTopicSelectionType,
} from '@/features/tarot/types/tarot.type';

/** arcana === 'major'이면 'major', 아니면 card.suit */
export function getTarotSuitGroup(card: TarotCardType): TarotSuitGroupType {
  if (card.arcana === 'major' || card.suit === null) return 'major';
  return card.suit;
}

/**
 * 분야 해석 문장 조회. topic === 'all'이거나 문장이 빈 문자열이면 null.
 * 질문 텍스트를 인자로 받지 않는다(질문은 해석에 쓰지 않는다).
 */
export function getTarotTopicReading(
  card: TarotCardType,
  isReversed: boolean,
  topic: TarotTopicSelectionType
): string | null {
  if (topic === 'all') return null;
  const text: string =
    TAROT_TOPIC_READINGS[getTarotSuitGroup(card)][topic][
      isReversed ? 'reversed' : 'upright'
    ];
  return text === '' ? null : text;
}
