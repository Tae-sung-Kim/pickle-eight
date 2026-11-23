import { describe, expect, it } from 'vitest';
import { TAROT_CARDS } from '@/features/tarot/constants/tarot-cards.constant';
import {
  TAROT_COPY_ALLOWED_SENTENCES,
  TAROT_FORBIDDEN_PATTERNS,
  TAROT_FORBIDDEN_TERMS,
} from '@/features/tarot/constants/tarot-copy-rule.constant';
import { TAROT_STORY_SETS } from '@/features/tarot/constants/tarot-story.constant';
import { TAROT_TOPIC_READINGS } from '@/features/tarot/constants/tarot-topic-reading.constant';
import type {
  TarotCardType,
  TarotSpreadPositionKeyType,
  TarotSuitGroupType,
  TarotTopicKeyType,
  TarotTopicSelectionType,
} from '@/features/tarot/types/tarot.type';
import {
  buildTarotThreeCardStory,
  getTarotStoryTone,
} from '@/features/tarot/utils/tarot-story.util';
import {
  getTarotSuitGroup,
  getTarotTopicReading,
} from '@/features/tarot/utils/tarot-topic.util';
import { findForbidden, splitSentences } from '../helpers/copy-check.util';

const SUIT_GROUPS: readonly TarotSuitGroupType[] = [
  'major',
  'wands',
  'cups',
  'swords',
  'pentacles',
];
const TOPIC_KEYS: readonly TarotTopicKeyType[] = [
  'love',
  'career',
  'money',
  'daily',
];
const STORY_TOPICS: readonly TarotTopicSelectionType[] = ['all', ...TOPIC_KEYS];
const POSITIONS: readonly TarotSpreadPositionKeyType[] = [
  'past',
  'present',
  'future',
];
const ORIENTATIONS = ['upright', 'reversed'] as const;

const RULE = {
  forbiddenTerms: TAROT_FORBIDDEN_TERMS,
  forbiddenPatterns: TAROT_FORBIDDEN_PATTERNS,
  allowedSentences: TAROT_COPY_ALLOWED_SENTENCES,
};

function entryOf(
  positionKey: TarotSpreadPositionKeyType,
  card: TarotCardType,
  isReversed = false
) {
  return { positionKey, card, isReversed };
}

describe('getTarotTopicReading', () => {
  it('v2 AC-5: 상수 칸과 같은 문장을 돌려주고 all이면 null이며 수트 그룹 장수가 맞다', () => {
    for (const group of SUIT_GROUPS) {
      const pool = TAROT_CARDS.filter((c) => getTarotSuitGroup(c) === group);
      expect(pool.length, group).toBe(group === 'major' ? 22 : 14);
      const card = pool[0];
      for (const topic of TOPIC_KEYS) {
        for (const orientation of ORIENTATIONS) {
          expect(
            getTarotTopicReading(card, orientation === 'reversed', topic)
          ).toBe(TAROT_TOPIC_READINGS[group][topic][orientation]);
        }
      }
      expect(getTarotTopicReading(card, false, 'all')).toBeNull();
      expect(getTarotTopicReading(card, true, 'all')).toBeNull();
    }
  });
});

describe('buildTarotThreeCardStory', () => {
  it('v2 AC-11, AC-13: 전수(그룹 5^3 x 방향 2^3 = 1,000 조합, 분야 5개 각각)는 null 0, 4문장, 과거·현재·미래 포함', () => {
    const problems: string[] = [];
    let perTopic = 0;
    let combos = 0;
    for (const topic of STORY_TOPICS) {
      let count = 0;
      for (const g0 of SUIT_GROUPS) {
        for (const g1 of SUIT_GROUPS) {
          for (const g2 of SUIT_GROUPS) {
            const groups = [g0, g1, g2];
            const cards = groups.map((group, slot) => {
              const pool = TAROT_CARDS.filter(
                (c) => getTarotSuitGroup(c) === group
              );
              return pool[slot % pool.length];
            });
            for (let mask = 0; mask < 8; mask++) {
              const entries = POSITIONS.map((positionKey, i) =>
                entryOf(positionKey, cards[i], Boolean(mask & (1 << i)))
              );
              count++;
              combos++;
              const label = `${topic} ${groups.join('/')} mask=${mask}`;
              const story = buildTarotThreeCardStory(entries, topic);
              if (story === null) {
                problems.push(`${label}: null`);
                continue;
              }
              const sentenceCount = splitSentences(story).length;
              if (sentenceCount !== 4) {
                problems.push(`${label}: ${sentenceCount}문장`);
              }
              for (const word of ['과거', '현재', '미래']) {
                if (!story.includes(word)) {
                  problems.push(`${label}: "${word}" 없음`);
                }
              }
              if (/[{}]/.test(story)) problems.push(`${label}: 중괄호 잔존`);
              const closing =
                TAROT_STORY_SETS[topic].closing[getTarotStoryTone(entries)];
              if (!story.endsWith(closing)) {
                problems.push(`${label}: 마무리 불일치`);
              }
              if (findForbidden({ where: label, text: story }, RULE).length) {
                problems.push(`${label}: 금지 표현`);
              }
            }
          }
        }
      }
      perTopic = count;
    }
    expect(perTopic).toBe(1000);
    expect(combos).toBe(5000);
    expect(
      problems.slice(0, 30),
      `${problems.length}건 위반\n${problems.slice(0, 30).join('\n')}`
    ).toEqual([]);
  });

  it('v2 FE-2: 세 장이 아니거나 위치가 겹치면 null이다', () => {
    const [a, b, c] = TAROT_CARDS;
    expect(buildTarotThreeCardStory([], 'all')).toBeNull();
    expect(
      buildTarotThreeCardStory(
        [entryOf('past', a), entryOf('present', b)],
        'all'
      )
    ).toBeNull();
    expect(
      buildTarotThreeCardStory(
        [entryOf('past', a), entryOf('past', b), entryOf('future', c)],
        'all'
      )
    ).toBeNull();
  });

  it('v2 AC-13: 분야별로 이야기 문장이 해당 분야 세트에서 나오고 전체 세트와 겹치지 않는다', () => {
    const [a, b, c] = TAROT_CARDS;
    const allTexts = new Set<string>([
      ...POSITIONS.flatMap((p) =>
        ORIENTATIONS.map((o) => TAROT_STORY_SETS.all.positions[p][o])
      ),
      ...Object.values(TAROT_STORY_SETS.all.closing),
    ]);
    for (const topic of TOPIC_KEYS) {
      const set = TAROT_STORY_SETS[topic];
      const entries = [
        entryOf('past', a),
        entryOf('present', b),
        entryOf('future', c),
      ];
      const story = buildTarotThreeCardStory(entries, topic) ?? '';
      expect(story.endsWith(set.closing.upright), topic).toBe(true);
      expect(
        story.includes(set.positions.past.upright.split('{card}')[0])
      ).toBe(true);
      for (const text of [
        ...POSITIONS.flatMap((p) =>
          ORIENTATIONS.map((o) => set.positions[p][o])
        ),
        ...Object.values(set.closing),
      ]) {
        expect(allTexts.has(text), `${topic}: 전체 세트와 겹침`).toBe(false);
      }
    }
  });

  it('getTarotStoryTone: 역방향 0장은 upright, 3장은 reversed, 그 외는 mixed다', () => {
    const [a, b, c] = TAROT_CARDS;
    const make = (r0: boolean, r1: boolean, r2: boolean) => [
      entryOf('past', a, r0),
      entryOf('present', b, r1),
      entryOf('future', c, r2),
    ];
    expect(getTarotStoryTone(make(false, false, false))).toBe('upright');
    expect(getTarotStoryTone(make(true, true, true))).toBe('reversed');
    expect(getTarotStoryTone(make(true, false, false))).toBe('mixed');
    expect(getTarotStoryTone(make(true, true, false))).toBe('mixed');
  });
});
