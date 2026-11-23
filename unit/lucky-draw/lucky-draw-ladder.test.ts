import { describe, expect, it } from 'vitest';
import { LUCKY_DRAW_LADDER_ROW_COUNT } from '@/features/lucky-draw/constants/lucky-draw-limit.constant';
import {
  createLuckyDrawLadderGame,
  generateLuckyDrawLadder,
  isLuckyDrawLadderValid,
  traceLuckyDrawLadder,
} from '@/features/lucky-draw/utils/lucky-draw-ladder.util';

const entries = (n: number, p: string) =>
  Array.from({ length: n }, (_, i) => ({ id: `${p}-${i}`, label: `${p}${i}` }));
const iota = (n: number) => Array.from({ length: n }, (_, i) => i);

describe('AC-11 사다리 모양', () => {
  for (let n = 2; n <= 10; n += 1) {
    it(`n=${n}: 1,000개 모두 유효, 간격마다 가로선 1개 이상, 인접 간격 동시 금지`, () => {
      for (let t = 0; t < 1000; t += 1) {
        const l = generateLuckyDrawLadder(n);
        expect(l.columnCount).toBe(n);
        expect(l.rows).toHaveLength(LUCKY_DRAW_LADDER_ROW_COUNT);
        expect(isLuckyDrawLadderValid(l)).toBe(true);
        for (const row of l.rows) {
          expect(row).toHaveLength(n - 1);
          for (let g = 1; g < row.length; g += 1) {
            expect(row[g] && row[g - 1]).toBe(false);
          }
        }
        for (let g = 0; g < n - 1; g += 1) {
          expect(l.rows.some((r) => r[g])).toBe(true);
        }
      }
    });
  }
  it('범위 밖 열 수는 RangeError', () => {
    for (const n of [0, 1, 11, 2.5]) {
      expect(() => generateLuckyDrawLadder(n)).toThrow(RangeError);
    }
  });
  it('시도 초과 시 Error (항상 0을 주는 원천)', () => {
    expect(() => generateLuckyDrawLadder(4, () => 0)).toThrow(Error);
  });
  it('인접 가로선이 겹친 사다리는 유효하지 않다', () => {
    expect(
      isLuckyDrawLadderValid({ columnCount: 3, rows: [[true, true]] })
    ).toBe(false);
  });
});

describe('AC-12 일대일, 경로', () => {
  it('n=2~10 배정이 순열이고 trace와 일치', () => {
    for (let n = 2; n <= 10; n += 1) {
      for (let t = 0; t < 300; t += 1) {
        const g = createLuckyDrawLadderGame(entries(n, 'p'), entries(n, 'r'));
        expect([...g.assignment].sort((a, b) => a - b)).toEqual(iota(n));
        expect([...g.slotResultIndexes].sort((a, b) => a - b)).toEqual(iota(n));
        const ends = new Set<number>();
        g.participants.forEach((_, i) => {
          const tr = traceLuckyDrawLadder(g.ladder, i);
          ends.add(tr.endColumn);
          expect(g.assignment[i]).toBe(g.slotResultIndexes[tr.endColumn]);
          expect(tr.points[0]).toEqual({ column: i, level: 0 });
          expect(tr.points.at(-1)).toEqual({
            column: tr.endColumn,
            level: LUCKY_DRAW_LADDER_ROW_COUNT + 1,
          });
        });
        expect(ends.size).toBe(n);
      }
    }
  });
  it('참가자와 결과 수가 다르거나 범위 밖이면 RangeError', () => {
    expect(() =>
      createLuckyDrawLadderGame(entries(3, 'p'), entries(4, 'r'))
    ).toThrow(RangeError);
    expect(() =>
      createLuckyDrawLadderGame(entries(11, 'p'), entries(11, 'r'))
    ).toThrow(RangeError);
  });
});

describe('AC-13 결과 예측 방지', () => {
  it('아래 결과 칸 순서가 무작위(n=4에서 여러 순열 등장)', () => {
    const seen = new Set<string>();
    for (let t = 0; t < 500; t += 1) {
      seen.add(
        createLuckyDrawLadderGame(
          entries(4, 'p'),
          entries(4, 'r')
        ).slotResultIndexes.join('')
      );
    }
    expect(seen.size).toBeGreaterThan(12);
  });
});

describe('AC-13 분포 균등성', () => {
  const tol: Record<number, number> = {
    2: 0.0063,
    4: 0.0055,
    6: 0.0047,
    10: 0.0038,
  };
  const run = (n: number) => {
    const counts = Array.from({ length: n }, () =>
      new Array<number>(n).fill(0)
    );
    const p = entries(n, 'p');
    const r = entries(n, 'r');
    for (let t = 0; t < 100000; t += 1) {
      const g = createLuckyDrawLadderGame(p, r);
      g.assignment.forEach((k, i) => {
        counts[i][k] += 1;
      });
    }
    const bad = new Set<string>();
    counts.forEach((row, i) => {
      row.forEach((c, k) => {
        if (Math.abs(c / 100000 - 1 / n) > tol[n]) bad.add(`${i},${k}`);
      });
    });
    return bad;
  };
  for (const n of [2, 4, 6, 10]) {
    it(`n=${n}: 10만 회 모든 칸 1/n ± 4σ (벗어난 칸은 1회 재실행)`, () => {
      const first = run(n);
      if (first.size > 0) {
        const second = run(n);
        expect([...first].filter((c) => second.has(c))).toEqual([]);
      }
    }, 120000);
  }
});
