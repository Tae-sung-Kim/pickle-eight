import { TAROT_STORY_SETS } from '@/features/tarot/constants/tarot-story.constant';
import type {
  TarotCardType,
  TarotSpreadPositionKeyType,
  TarotStoryToneType,
  TarotTopicSelectionType,
} from '@/features/tarot/types/tarot.type';

export type TarotStoryEntryType = Readonly<{
  positionKey: TarotSpreadPositionKeyType;
  card: TarotCardType;
  isReversed: boolean;
}>;

const POSITION_ORDER: readonly TarotSpreadPositionKeyType[] = [
  'past',
  'present',
  'future',
];

/** 역방향 장수 0 -> 'upright', 3 -> 'reversed', 그 외 'mixed' */
export function getTarotStoryTone(
  entries: readonly TarotStoryEntryType[]
): TarotStoryToneType {
  const reversedCount = entries.filter((entry) => entry.isReversed).length;
  if (reversedCount === 0) return 'upright';
  if (reversedCount === 3) return 'reversed';
  return 'mixed';
}

/**
 * 흐름 이야기 문단(4문장)을 만든다. 질문 텍스트를 인자로 받지 않는다.
 * 틀이 비었거나, 세 위치가 한 번씩 아니거나, 치환 뒤 중괄호가 남으면 null.
 */
export function buildTarotThreeCardStory(
  entries: readonly TarotStoryEntryType[],
  topic: TarotTopicSelectionType
): string | null {
  if (entries.length !== POSITION_ORDER.length) return null;

  const set = TAROT_STORY_SETS[topic];
  const sentences: string[] = [];

  for (const positionKey of POSITION_ORDER) {
    const matched = entries.filter(
      (entry) => entry.positionKey === positionKey
    );
    const entry = matched[0];
    if (matched.length !== 1 || !entry) return null;

    const template: string =
      set.positions[positionKey][entry.isReversed ? 'reversed' : 'upright'];
    if (template === '') return null;

    const meaning = entry.isReversed ? entry.card.reversed : entry.card.upright;
    sentences.push(
      template
        .replaceAll('{card}', entry.card.nameKo)
        .replaceAll('{keyword}', meaning.keywords[0])
    );
  }

  const closing: string = set.closing[getTarotStoryTone(entries)];
  if (closing === '') return null;
  sentences.push(closing);

  const story = sentences.join(' ');
  if (story.includes('{') || story.includes('}')) return null;
  return story;
}
