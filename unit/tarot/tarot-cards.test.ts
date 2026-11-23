import { describe, expect, it } from 'vitest';
import { TAROT_CARDS } from '@/features/tarot/constants/tarot-cards.constant';

type DirectionType = readonly [string, (typeof TAROT_CARDS)[number]['upright']];

function directionsOf(card: (typeof TAROT_CARDS)[number]): DirectionType[] {
  return [
    ['정방향', card.upright],
    ['역방향', card.reversed],
  ];
}

describe('타로 카드 78장 데이터', () => {
  it('AC-15: 78장 모두 이름, 정/역방향 키워드 3개씩, 정/역방향 요약이 비어 있지 않다', () => {
    expect(TAROT_CARDS).toHaveLength(78);
    const problems: string[] = [];
    for (const card of TAROT_CARDS) {
      if (!card.nameKo.trim()) problems.push(`${card.id}: 한글 이름 없음`);
      for (const [dir, meaning] of directionsOf(card)) {
        const keywords = meaning.keywords;
        if (keywords.length !== 3) {
          problems.push(
            `${card.id} ${card.nameKo} ${dir}: 키워드 ${keywords.length}개`
          );
        }
        for (const keyword of keywords) {
          if (!keyword.trim()) problems.push(`${card.id} ${dir}: 빈 키워드`);
        }
        if (new Set(keywords).size !== keywords.length) {
          problems.push(`${card.id} ${card.nameKo} ${dir}: 키워드 중복`);
        }
        if (!meaning.summary.trim()) {
          problems.push(`${card.id} ${card.nameKo} ${dir}: 요약 없음`);
        }
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  it('AC-15(참고): 서로 다른 카드·방향에 같은 요약이 없다', () => {
    const seen = new Map<string, string>();
    const duplicates: string[] = [];
    for (const card of TAROT_CARDS) {
      for (const [dir, meaning] of directionsOf(card)) {
        const where = `${card.id} ${card.nameKo} ${dir}`;
        const before = seen.get(meaning.summary);
        if (before) duplicates.push(`${before} = ${where}`);
        seen.set(meaning.summary, where);
      }
    }
    expect(duplicates).toEqual([]);
  });

  it('AC-16: id 0~77 연속, 힘 8, 정의 11, 마이너 이름은 수트 + 랭크 순서이고 코트는 페이지·나이트·퀸·킹이다', () => {
    const suits = [
      { key: 'wands', ko: '완드', en: 'Wands' },
      { key: 'cups', ko: '컵', en: 'Cups' },
      { key: 'swords', ko: '소드', en: 'Swords' },
      { key: 'pentacles', ko: '펜타클', en: 'Pentacles' },
    ] as const;
    const rankKo = [
      '',
      '에이스',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '페이지',
      '나이트',
      '퀸',
      '킹',
    ];
    const rankEn = [
      '',
      'Ace',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Page',
      'Knight',
      'Queen',
      'King',
    ];

    const problems: string[] = [];
    for (const [index, card] of TAROT_CARDS.entries()) {
      if (card.id !== index) {
        problems.push(`id 불일치: 위치 ${index}, id ${card.id}`);
      }
      if (!card.nameEn.trim()) problems.push(`${card.id}: 영문 이름 없음`);
    }
    expect(TAROT_CARDS.filter((c) => c.arcana === 'major')).toHaveLength(22);
    expect(TAROT_CARDS.filter((c) => c.arcana === 'minor')).toHaveLength(56);

    const strength = TAROT_CARDS.find((c) => c.nameKo === '힘');
    const justice = TAROT_CARDS.find((c) => c.nameKo === '정의');
    expect(strength?.rank).toBe(8);
    expect(strength?.id).toBe(8);
    expect(justice?.rank).toBe(11);
    expect(justice?.id).toBe(11);

    for (const [suitIndex, suit] of suits.entries()) {
      for (let rank = 1; rank <= 14; rank++) {
        const id = 22 + suitIndex * 14 + (rank - 1);
        const card = TAROT_CARDS[id];
        if (card.suit !== suit.key || card.rank !== rank) {
          problems.push(`${id}: 수트·랭크 불일치 (${card.suit} ${card.rank})`);
        }
        if (card.nameKo !== `${suit.ko} ${rankKo[rank]}`) {
          problems.push(
            `${id}: 한글 이름 "${card.nameKo}" (기대 "${suit.ko} ${rankKo[rank]}")`
          );
        }
        if (card.nameEn !== `${rankEn[rank]} of ${suit.en}`) {
          problems.push(`${id}: 영문 이름 "${card.nameEn}"`);
        }
      }
    }
    const names = TAROT_CARDS.map((c) => c.nameKo);
    expect(new Set(names).size).toBe(78);
    expect(problems, problems.join('\n')).toEqual([]);
  });

  it('AC-20: 죽음 카드(id 13)만 보충 문구가 있고 실제 죽음이 아니라는 뜻이다', () => {
    const withNote = TAROT_CARDS.filter((c) => c.note);
    expect(withNote.map((c) => c.id)).toEqual([13]);
    expect(withNote[0].nameKo).toBe('죽음');
    expect(withNote[0].note).toMatch(/실제 죽음이 아니라/);
  });
});
