import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createLuckyDrawCryptoSource,
  getLuckyDrawRejectionLimit,
  randomIntBelow,
  shuffleFisherYates,
} from '@/features/lucky-draw/utils/lucky-draw-random.util';

const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

afterEach(() => vi.restoreAllMocks());

describe('AC-28 경계값 표', () => {
  const table = [
    { n: 2, limit: 4294967296, maxAccept: 4294967295 },
    { n: 3, limit: 4294967295, maxAccept: 4294967294 },
    { n: 6, limit: 4294967292, maxAccept: 4294967291 },
    { n: 10, limit: 4294967290, maxAccept: 4294967289 },
  ];
  for (const { n, limit, maxAccept } of table) {
    it(`n=${n}: limit ${limit}`, () => {
      expect(getLuckyDrawRejectionLimit(n)).toBe(limit);
    });
    it(`n=${n}: 경계 바로 아래 값은 받는다`, () => {
      const src = vi.fn(seq(maxAccept));
      expect(randomIntBelow(n, src)).toBe(maxAccept % n);
      expect(src).toHaveBeenCalledTimes(1);
    });
    if (limit < 2 ** 32) {
      it(`n=${n}: limit 이상은 버리고 다시 뽑는다`, () => {
        const src = vi.fn(seq(limit, 2 ** 32 - 1, 7));
        expect(randomIntBelow(n, src)).toBe(7 % n);
        expect(src).toHaveBeenCalledTimes(3);
      });
    }
  }
  it('모듈로 편향 없음: limit이 n의 배수', () => {
    for (const n of [3, 6, 7, 10, 28, 30]) {
      expect(getLuckyDrawRejectionLimit(n) % n).toBe(0);
    }
  });
});

describe('입력 검증', () => {
  it('잘못된 n은 RangeError', () => {
    for (const n of [0, -1, 1.5, Number.NaN, 2 ** 32 + 1]) {
      expect(() => randomIntBelow(n, seq(0))).toThrow(RangeError);
    }
  });
  it('n=1은 원천을 부르지 않는다', () => {
    const src = vi.fn(seq(0));
    expect(randomIntBelow(1, src)).toBe(0);
    expect(src).not.toHaveBeenCalled();
  });
  it('n=2^32 허용', () => {
    expect(randomIntBelow(2 ** 32, seq(123))).toBe(123);
  });
  it('원천이 범위 밖 값이면 RangeError', () => {
    for (const v of [-1, 2 ** 32, 1.5, Number.NaN]) {
      expect(() => randomIntBelow(3, seq(v))).toThrow(RangeError);
    }
  });
  it('계속 버리는 원천은 Error', () => {
    const src = vi.fn(seq(4294967295));
    expect(() => randomIntBelow(3, src)).toThrow(Error);
    expect(src).toHaveBeenCalledTimes(1000);
  });
});

describe('AC-25, AC-27 crypto', () => {
  it('Math.random 0회, crypto.getRandomValues 1회 이상', () => {
    const mathSpy = vi.spyOn(Math, 'random');
    const cryptoSpy = vi.spyOn(globalThis.crypto, 'getRandomValues');
    const src = createLuckyDrawCryptoSource();
    randomIntBelow(10, src);
    shuffleFisherYates([1, 2, 3, 4], src);
    expect(mathSpy).not.toHaveBeenCalled();
    expect(cryptoSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
  it('crypto 원천 값은 uint32 정수', () => {
    const src = createLuckyDrawCryptoSource();
    for (let i = 0; i < 600; i += 1) {
      const v = src();
      expect(Number.isInteger(v) && v >= 0 && v < 2 ** 32).toBe(true);
    }
  });
});

describe('Fisher-Yates', () => {
  it('원천 [2,1]이면 3개가 그대로(Sattolo 아님)', () => {
    expect(shuffleFisherYates([0, 1, 2], seq(2, 1))).toEqual([0, 1, 2]);
  });
  it('원본을 바꾸지 않는다', () => {
    const a = [1, 2, 3, 4];
    const b = shuffleFisherYates(a);
    expect(a).toEqual([1, 2, 3, 4]);
    expect([...b].sort()).toEqual([1, 2, 3, 4]);
  });
  it('n=3 10만 회, 6가지 순서 비율 1/6 ± 0.47%p (실패 시 1회 재실행)', () => {
    const run = () => {
      const counts = new Map<string, number>();
      for (let i = 0; i < 100000; i += 1) {
        const k = shuffleFisherYates([0, 1, 2]).join('');
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
      expect(counts.size).toBe(6);
      const bad = new Set<string>();
      for (const [k, c] of counts) {
        if (Math.abs(c / 100000 - 1 / 6) > 0.0047) bad.add(k);
      }
      return bad;
    };
    const first = run();
    if (first.size > 0) {
      const second = run();
      expect([...first].filter((k) => second.has(k))).toEqual([]);
    }
  });
});
