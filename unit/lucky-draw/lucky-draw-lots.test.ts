import { describe, expect, it, vi } from 'vitest';
import {
  LUCKY_DRAW_LOTS_INITIAL_STATE,
  type LuckyDrawLotsStateType,
  luckyDrawLotsReducer,
} from '@/features/lucky-draw/lots/hooks/use-lucky-draw-lots.hook';
import type { LuckyDrawEntryType } from '@/features/lucky-draw/types/lucky-draw.type';
import {
  createLuckyDrawLotsDeck,
  getLuckyDrawLotsUnopenedPositions,
} from '@/features/lucky-draw/utils/lucky-draw-lots.util';

const entriesOf = (labels: readonly string[]): LuckyDrawEntryType[] =>
  labels.map((label, i) => ({ id: `i-${i}`, label }));

const sized = (n: number) =>
  entriesOf(Array.from({ length: n }, (_, i) => `항목${i}`));

describe('createLuckyDrawLotsDeck 공정성 (AC-25)', () => {
  it('3개 항목 10만 회: 6가지 대응이 각각 1/6 ± 4σ', () => {
    const entries = entriesOf(['가', '나', '다']);
    const N = 100_000;
    const counts = new Map<string, number>();
    for (let i = 0; i < N; i += 1) {
      const deck = createLuckyDrawLotsDeck(entries);
      const key = [0, 1, 2].map((p) => deck.open(p).label).join('');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    expect(counts.size).toBe(6);
    const p = 1 / 6;
    const tol = 4 * Math.sqrt((p * (1 - p)) / N);
    for (const [key, c] of counts) {
      expect(Math.abs(c / N - p), key).toBeLessThanOrEqual(tol);
    }
  });

  it('카드 한 장은 위치와 항목을 돌려주고 모든 항목이 한 번씩 나온다', () => {
    const entries = sized(10);
    const deck = createLuckyDrawLotsDeck(entries);
    expect(deck.size).toBe(10);
    const opened = Array.from({ length: 10 }, (_, p) => deck.open(p));
    opened.forEach((card, p) => {
      expect(card.position).toBe(p);
    });
    expect(opened.map((c) => c.label).sort()).toEqual(
      entries.map((e) => e.label).sort()
    );
  });

  it('같은 이름이 여러 줄이면 같은 글자 카드가 줄 수만큼 있다 (AC-24)', () => {
    const deck = createLuckyDrawLotsDeck(entriesOf(['동명', '동명', '다른']));
    const labels = [0, 1, 2].map((p) => deck.open(p).label).sort();
    expect(labels).toEqual(['다른', '동명', '동명']);
  });

  it('난수는 crypto만 쓴다 (Math.random 호출 0회, AC-27)', () => {
    const rnd = vi.spyOn(Math, 'random');
    createLuckyDrawLotsDeck(sized(5));
    expect(rnd).not.toHaveBeenCalled();
    rnd.mockRestore();
  });

  it('입력 항목 배열을 바꾸지 않는다', () => {
    const entries = sized(6);
    const snapshot = JSON.stringify(entries);
    createLuckyDrawLotsDeck(entries);
    expect(JSON.stringify(entries)).toBe(snapshot);
  });
});

describe('createLuckyDrawLotsDeck 범위 오류', () => {
  it('항목이 2개 미만 또는 30개 초과면 RangeError', () => {
    expect(() => createLuckyDrawLotsDeck([])).toThrow(RangeError);
    expect(() => createLuckyDrawLotsDeck(sized(1))).toThrow(RangeError);
    expect(() => createLuckyDrawLotsDeck(sized(31))).toThrow(RangeError);
    expect(() => createLuckyDrawLotsDeck(sized(2))).not.toThrow();
    expect(() => createLuckyDrawLotsDeck(sized(30))).not.toThrow();
  });

  it('open 위치가 범위 밖, 소수, 음수, NaN이면 RangeError', () => {
    const deck = createLuckyDrawLotsDeck(sized(3));
    for (const bad of [-1, 3, 99, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => deck.open(bad), String(bad)).toThrow(RangeError);
    }
    expect(() => deck.open(0)).not.toThrow();
    expect(() => deck.open(2)).not.toThrow();
  });
});

describe('createLuckyDrawLotsDeck 내보내기 방지 (AC-26d)', () => {
  it('속성은 size와 open뿐이고 JSON에는 size만 나온다', () => {
    const labels = ['비밀가', '비밀나', '비밀다'];
    const deck = createLuckyDrawLotsDeck(entriesOf(labels));
    expect(Object.keys(deck).sort()).toEqual(['open', 'size']);
    expect(JSON.stringify(deck)).toBe('{"size":3}');
    for (const l of labels) expect(JSON.stringify(deck)).not.toContain(l);
    expect(Object.isFrozen(deck)).toBe(true);
  });

  it('열지 않은 카드의 항목은 어떤 열거에도 나오지 않는다', () => {
    const labels = ['비밀가', '비밀나', '비밀다'];
    const deck = createLuckyDrawLotsDeck(entriesOf(labels));
    const dump = [
      ...Object.getOwnPropertyNames(deck),
      ...Object.getOwnPropertySymbols(deck).map(String),
      String(deck),
      JSON.stringify(Object.entries(deck)),
    ].join('|');
    for (const l of labels) expect(dump).not.toContain(l);
  });
});

describe('getLuckyDrawLotsUnopenedPositions', () => {
  it('열지 않은 위치를 작은 번호부터 돌려준다', () => {
    expect(getLuckyDrawLotsUnopenedPositions(4, [])).toEqual([0, 1, 2, 3]);
    expect(
      getLuckyDrawLotsUnopenedPositions(4, [
        { position: 2, label: 'x' },
        { position: 0, label: 'y' },
      ])
    ).toEqual([1, 3]);
    expect(
      getLuckyDrawLotsUnopenedPositions(2, [
        { position: 0, label: 'x' },
        { position: 1, label: 'y' },
      ])
    ).toEqual([]);
  });
});

describe('luckyDrawLotsReducer', () => {
  const shuffled = (
    count: number,
    runId = 1,
    text = 'a'
  ): LuckyDrawLotsStateType =>
    luckyDrawLotsReducer(
      { ...LUCKY_DRAW_LOTS_INITIAL_STATE, text },
      { type: 'SHUFFLE', runId, cardCount: count }
    );

  it('SHUFFLE: 카드 수와 runId를 넣고 열린 기록을 비운다', () => {
    const opened = luckyDrawLotsReducer(shuffled(3), {
      type: 'OPEN',
      runId: 1,
      card: { position: 0, label: '가' },
    });
    const again = luckyDrawLotsReducer(opened, {
      type: 'SHUFFLE',
      runId: 2,
      cardCount: 3,
    });
    expect(again).toMatchObject({
      runId: 2,
      cardCount: 3,
      openedCards: [],
      lastEvent: 'shuffle',
    });
  });

  it('OPEN: 한 장 열면 그 항목 하나만 상태에 있다 (AC-26d)', () => {
    const labels = ['보라A', '파랑B', '초록C', '노랑D', '빨강E'];
    const deck = createLuckyDrawLotsDeck(entriesOf(labels));
    const state = luckyDrawLotsReducer(shuffled(5, 1, 'x'), {
      type: 'OPEN',
      runId: 1,
      card: deck.open(3),
    });
    const json = JSON.stringify(state);
    const opened = deck.open(3).label;
    expect(json).toContain(opened);
    for (const l of labels.filter((x) => x !== opened)) {
      expect(json).not.toContain(l);
    }
    expect(state.lastEvent).toBe('open');
  });

  it('같은 위치를 두 번 OPEN해도 무시한다', () => {
    const first = luckyDrawLotsReducer(shuffled(3), {
      type: 'OPEN',
      runId: 1,
      card: { position: 1, label: '가' },
    });
    const second = luckyDrawLotsReducer(first, {
      type: 'OPEN',
      runId: 1,
      card: { position: 1, label: '다른글자' },
    });
    expect(second).toBe(first);
    expect(second.openedCards).toEqual([{ position: 1, label: '가' }]);
  });

  it('다른 runId의 OPEN과 OPEN_REST는 무시한다', () => {
    const base = shuffled(3, 2);
    expect(
      luckyDrawLotsReducer(base, {
        type: 'OPEN',
        runId: 1,
        card: { position: 0, label: '가' },
      })
    ).toBe(base);
    expect(
      luckyDrawLotsReducer(base, {
        type: 'OPEN_REST',
        runId: 1,
        cards: [{ position: 0, label: '가' }],
      })
    ).toBe(base);
  });

  it('섞기 전(cardCount null)과 범위 밖 위치의 OPEN은 무시한다', () => {
    const init = LUCKY_DRAW_LOTS_INITIAL_STATE;
    expect(
      luckyDrawLotsReducer(init, {
        type: 'OPEN',
        runId: 0,
        card: { position: 0, label: '가' },
      })
    ).toBe(init);
    const base = shuffled(3);
    for (const position of [-1, 3, 1.5]) {
      expect(
        luckyDrawLotsReducer(base, {
          type: 'OPEN',
          runId: 1,
          card: { position, label: '가' },
        })
      ).toBe(base);
    }
  });

  it('OPEN_REST: 안 연 위치만 붙이고 열린 수는 줄지 않는다', () => {
    const one = luckyDrawLotsReducer(shuffled(4), {
      type: 'OPEN',
      runId: 1,
      card: { position: 2, label: '다' },
    });
    const rest = luckyDrawLotsReducer(one, {
      type: 'OPEN_REST',
      runId: 1,
      cards: [
        { position: 0, label: '가' },
        { position: 1, label: '나' },
        { position: 2, label: '중복' },
        { position: 3, label: '라' },
        { position: 3, label: '중복라' },
      ],
    });
    expect(rest.openedCards.map((c) => c.position)).toEqual([2, 0, 1, 3]);
    expect(rest.openedCards.find((c) => c.position === 2)?.label).toBe('다');
    expect(rest.openedCards.find((c) => c.position === 3)?.label).toBe('라');
    expect(rest.openedCards.length).toBeGreaterThanOrEqual(
      one.openedCards.length
    );
    expect(rest.lastEvent).toBe('open-rest');
  });

  it('OPEN_REST: 붙일 카드가 없으면 상태 그대로', () => {
    const base = shuffled(2);
    expect(
      luckyDrawLotsReducer(base, { type: 'OPEN_REST', runId: 1, cards: [] })
    ).toBe(base);
    const all = luckyDrawLotsReducer(base, {
      type: 'OPEN_REST',
      runId: 1,
      cards: [
        { position: 0, label: '가' },
        { position: 1, label: '나' },
      ],
    });
    expect(
      luckyDrawLotsReducer(all, {
        type: 'OPEN_REST',
        runId: 1,
        cards: [{ position: 0, label: '가' }],
      })
    ).toBe(all);
  });

  it('SET_TEXT: 카드와 열린 기록을 지우되 runId는 그대로', () => {
    const opened = luckyDrawLotsReducer(shuffled(3, 5), {
      type: 'OPEN',
      runId: 5,
      card: { position: 0, label: '가' },
    });
    const next = luckyDrawLotsReducer(opened, {
      type: 'SET_TEXT',
      text: '새 입력',
    });
    expect(next).toMatchObject({
      text: '새 입력',
      cardCount: null,
      openedCards: [],
      lastEvent: null,
      runId: 5,
    });
  });

  it('SET_TEXT 뒤 이전 묶음의 OPEN은 무시된다 (cardCount null)', () => {
    const cleared = luckyDrawLotsReducer(shuffled(3, 1), {
      type: 'SET_TEXT',
      text: 'z',
    });
    expect(
      luckyDrawLotsReducer(cleared, {
        type: 'OPEN',
        runId: 1,
        card: { position: 0, label: '가' },
      })
    ).toBe(cleared);
  });
});
