import { getLatestLottoDraw, getLottoDrawByNumber, getLottoDraws } from "@/services/lotto.service";
import type { LottoDrawType, LottoDrawsParamsType } from "@/types/lotto.type";
import { useMutation, useQuery } from '@tanstack/react-query';

// 회차에 따른 로또 당첨 결과 조회
export function useLottoDrawsQuery({
  from,
  to,
  enabled = true,
}: LottoDrawsParamsType) {
  const safeEnabled =
    Boolean(enabled) &&
    Number.isInteger(from as number) &&
    Number.isInteger(to as number) &&
    (from as number) > 0 &&
    (to as number) >= (from as number);
  return useQuery<LottoDrawType[], Error>({
    queryKey: ['lotto-draws', from, to],
    queryFn: () => getLottoDraws({ from, to }),
    enabled: safeEnabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

// 제일 마지막회차 가져오기
export function useLatestLottoDrawQuery(options?: {
  readonly enabled?: boolean;
}) {
  const enabled = options?.enabled ?? true;
  return useQuery<{ lastDrawNumber: number }, Error>({
    queryKey: ['lotto-draw', 'latest'],
    queryFn: () => getLatestLottoDraw(),
    enabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

// 특정 회차 당첨 결과 조회
export function useLottoDrawByNumberMutation() {
  return useMutation<LottoDrawType, Error, number>({
    mutationFn: (drwNo) => getLottoDrawByNumber(drwNo),
  });
}
