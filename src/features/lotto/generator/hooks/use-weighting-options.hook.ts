import { useEffect, useState } from 'react';
import { useLatestLottoDrawQuery } from '@/features/lotto/queries/use-lotto.query';

export const LOTTO_WEIGHT_RANGE_SIZE = 50 as const;

// 가중치 옵션 상태. 켜지면 최신 회차 기준으로 최근 N회차 범위를 채운다
export function useWeightingOptions(advancedEnabled: boolean) {
  const [useWeight, setUseWeight] = useState<boolean>(false);
  const [from, setFrom] = useState<number>(1);
  const [to, setTo] = useState<number>(LOTTO_WEIGHT_RANGE_SIZE);
  const [excludeLatest, setExcludeLatest] = useState<boolean>(false);
  const [rangeInitialized, setRangeInitialized] = useState<boolean>(false);

  const weightActive = advancedEnabled && useWeight;
  const { data: latestDraw } = useLatestLottoDrawQuery({
    enabled: weightActive,
  });

  useEffect(() => {
    if (!weightActive) {
      setRangeInitialized(false);
      return;
    }
    if (!latestDraw) return;
    const latestNo = latestDraw.lastDrawNumber;
    if (!Number.isInteger(latestNo) || latestNo <= 0) return;
    setFrom(Math.max(1, latestNo - (LOTTO_WEIGHT_RANGE_SIZE - 1)));
    setTo(latestNo);
    setRangeInitialized(true);
  }, [weightActive, latestDraw]);

  return {
    useWeight,
    from,
    to,
    excludeLatest,
    rangeInitialized,
    setUseWeight,
    setFrom,
    setTo,
    setExcludeLatest,
  };
}
