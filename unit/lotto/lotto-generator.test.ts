import { describe, expect, it } from 'vitest';
import { LOTTO_MAX_GAMES } from '@/features/lotto/constants/lotto.constant';
import {
  generateLottoNumbers,
  LottoGenerator,
} from '@/features/lotto/utils/lotto.util';

function expectValid(nums: readonly number[]) {
  expect(nums).toHaveLength(6);
  expect(new Set(nums).size).toBe(6);
  for (const n of nums) {
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(45);
  }
  expect([...nums]).toEqual([...nums].sort((a, b) => a - b));
}

describe('lotto 번호 생성', () => {
  it('generateLottoNumbers: 1,000회 모두 6개·1~45·중복 없음·오름차순', () => {
    for (let i = 0; i < 1000; i += 1) expectValid(generateLottoNumbers());
  });

  it('LottoGenerator.generate: 1,000회 모두 유효한 티켓 1장', () => {
    for (let i = 0; i < 1000; i += 1) {
      const tickets = LottoGenerator.generate(1);
      expect(tickets).toHaveLength(1);
      expectValid(tickets[0].numbers);
    }
  });

  it('최대 게임 수(20)가 상수로 고정돼 있고 그만큼 생성해도 모두 유효하다', () => {
    expect(LOTTO_MAX_GAMES).toBe(20);
    const tickets = LottoGenerator.generate(LOTTO_MAX_GAMES);
    expect(tickets).toHaveLength(20);
    for (const t of tickets) expectValid(t.numbers);
  });

  it('제외 번호 필터를 지킨다', () => {
    const excluded = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (let i = 0; i < 100; i += 1) {
      const [t] = LottoGenerator.generate(1, { excludeNumbers: excluded });
      expectValid(t.numbers);
      for (const n of t.numbers) expect(excluded).not.toContain(n);
    }
  });
});
