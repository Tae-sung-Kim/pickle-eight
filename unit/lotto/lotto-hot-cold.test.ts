import { describe, expect, it } from 'vitest';
import type { LottoDrawType } from '@/features/lotto/types/lotto.type';
import { computeHotCold } from '@/features/lotto/utils/hot-cold.util';

function draw(
  drawNumber: number,
  numbers: LottoDrawType['numbers']
): LottoDrawType {
  return {
    drawNumber,
    drawDate: '2024-01-01',
    numbers,
    bonusNumber: 45,
    firstWinCount: 0,
    firstPrizeAmount: 0,
    secondWinCount: 0,
    secondPrizeAmount: 0,
    secondTotalAmount: 0,
    thirdWinCount: 0,
    thirdPrizeAmount: 0,
    thirdTotalAmount: 0,
    fourthWinCount: 0,
    fourthPrizeAmount: 0,
    fourthTotalAmount: 0,
    fifthWinCount: 0,
    fifthPrizeAmount: 0,
    fifthTotalAmount: 0,
    totalWinners: 0,
    totalSalesAmount: 0,
  };
}

// 10~14회차 고정 표본
const DRAWS = [
  draw(10, [1, 2, 3, 4, 5, 6]),
  draw(11, [1, 2, 3, 7, 8, 9]),
  draw(12, [1, 2, 10, 11, 12, 13]),
  draw(13, [1, 14, 15, 16, 17, 18]),
  draw(14, [19, 20, 21, 22, 23, 24]),
];

describe('computeHotCold', () => {
  const stats = computeHotCold(DRAWS, { from: 10, to: 14, recentWindow: 2 });

  it('latest와 recentWindow를 반영한다', () => {
    expect(stats.latest).toBe(14);
    expect(stats.recentWindow).toBe(2);
  });

  it('번호별 출현 빈도를 센다', () => {
    expect(stats.frequency[1]).toBe(4);
    expect(stats.frequency[2]).toBe(3);
    expect(stats.frequency[3]).toBe(2);
    expect(stats.frequency[19]).toBe(1);
    expect(stats.frequency[45]).toBe(0);
  });

  it('지연 회차: 마지막 출현 기준, 미출현은 구간 길이', () => {
    expect(stats.overdue[19]).toBe(0);
    expect(stats.overdue[1]).toBe(1);
    expect(stats.overdue[4]).toBe(4);
    expect(stats.overdue[45]).toBe(5);
  });

  it('최근 빈도: 마지막 2회(13, 14)만 센다', () => {
    expect(stats.recentFrequency[1]).toBe(1);
    expect(stats.recentFrequency[14]).toBe(1);
    expect(stats.recentFrequency[19]).toBe(1);
    expect(stats.recentFrequency[2]).toBe(0);
  });

  it('빈도 합 = 6 × 회차 수, 최근 빈도 합 = 6 × 윈도우', () => {
    const sum = (r: Record<number, number>) =>
      Object.values(r).reduce((a, b) => a + b, 0);
    expect(sum(stats.frequency)).toBe(6 * 5);
    expect(sum(stats.recentFrequency)).toBe(6 * 2);
  });

  it('구간 밖 회차는 무시한다', () => {
    const s = computeHotCold(DRAWS, { from: 11, to: 13, recentWindow: 50 });
    expect(s.recentWindow).toBe(3);
    expect(Object.values(s.frequency).reduce((a, b) => a + b, 0)).toBe(18);
    expect(s.frequency[19]).toBe(0);
  });
});
