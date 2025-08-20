import { useQuery } from '@tanstack/react-query';
import { getLatestLottoDraw, getLottoDraws } from '@/services';
import type { LottoDrawsParamsType, LottoDrawType } from '@/types';

// 회차에 따른 로또 당첨 결과 조회
export function useLottoDrawsQuery({
  from,
  to,
  enabled = true,
}: LottoDrawsParamsType) {
  return useQuery<LottoDrawType[], Error>({
    queryKey: ['lotto-draws', from, to],
    queryFn: () => getLottoDraws({ from, to }),
    enabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

// 제일 마지막회차 가져오기
export function useLatestLottoDrawQuery() {
  return useQuery<LottoDrawType, Error>({
    queryKey: ['lotto-draw', 'latest'],
    queryFn: () => getLatestLottoDraw(),
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
