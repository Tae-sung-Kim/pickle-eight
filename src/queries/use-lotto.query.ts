import { useQuery } from '@tanstack/react-query';
import { getLottoDraws } from '@/services';
import type { LottoDrawsParamsType, LottoDrawType } from '@/types';

export function useLottoDrawsQuery({
  from,
  to,
  enabled = true,
}: LottoDrawsParamsType) {
  return useQuery<LottoDrawType[], Error>({
    queryKey: ['lotto-draws', from, to],
    queryFn: () => getLottoDraws({ from, to }),
    enabled,
  });
}
