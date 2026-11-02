import type {
  LottoDrawType,
  LottoHotColdStatsType,
} from '@/features/lotto/types/lotto.type';

// 최근 출현 빈도를 계산하는 기본 구간(회차 수)
export const LOTTO_HOT_COLD_RECENT_WINDOW = 50 as const;

type ComputeHotColdParams = Readonly<{
  from: number; // 집계 시작 회차 (포함)
  to: number; // 집계 끝 회차 (포함). 결과의 latest가 된다
  recentWindow?: number;
}>;

/**
 * from..to 회차의 핫/콜드 통계를 계산한다. 서버 캐시와 클라이언트가 같이 쓴다.
 * - frequency: 구간 내 번호별 출현 횟수
 * - overdue: to - (마지막 출현 회차). 구간에서 한 번도 안 나왔으면 구간 길이(to - from + 1)
 * - recentFrequency: 구간 끝에서 recentWindow회 안의 출현 횟수
 */
export function computeHotCold(
  draws: readonly LottoDrawType[],
  {
    from,
    to,
    recentWindow = LOTTO_HOT_COLD_RECENT_WINDOW,
  }: ComputeHotColdParams
): LottoHotColdStatsType {
  const span = to - from + 1;
  const window = Math.max(1, Math.min(recentWindow, span));
  const recentFrom = to - window + 1;

  const frequency: Record<number, number> = {};
  const lastSeen: Record<number, number> = {};
  const recentFrequency: Record<number, number> = {};
  for (let n = 1; n <= 45; n += 1) {
    frequency[n] = 0;
    lastSeen[n] = 0;
    recentFrequency[n] = 0;
  }

  for (const d of draws) {
    if (d.drawNumber < from || d.drawNumber > to) continue;
    for (const n of d.numbers) {
      frequency[n] += 1;
      if (d.drawNumber > lastSeen[n]) lastSeen[n] = d.drawNumber;
      if (d.drawNumber >= recentFrom) recentFrequency[n] += 1;
    }
  }

  const overdue: Record<number, number> = {};
  for (let n = 1; n <= 45; n += 1) {
    overdue[n] = lastSeen[n] > 0 ? to - lastSeen[n] : span;
  }

  return {
    latest: to,
    frequency,
    overdue,
    recentWindow: window,
    recentFrequency,
  };
}
