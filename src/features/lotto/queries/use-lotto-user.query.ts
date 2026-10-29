import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MyNumberResultsType } from '@/features/lotto/services/lotto-user.service';
import {
  compareMyNumbers,
  deleteMyNumberSet,
  getHotColdStats,
  listMyNumberSets,
  saveMyNumberSet,
} from '@/features/lotto/services/lotto-user.service';
import type { LottoNumberSetType } from '@/features/lotto/types/lotto.type';

const keys = {
  numberSets: ['lotto', 'user', 'number-sets'] as const,
  numberResults: ['lotto', 'user', 'number-results'] as const,
  hotCold: ['lotto', 'stats', 'hot-cold'] as const,
} as const;

export function useMyNumberSetsQuery() {
  return useQuery<LottoNumberSetType[], Error>({
    queryKey: keys.numberSets,
    queryFn: () => listMyNumberSets(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSaveNumberSetMutation() {
  const qc = useQueryClient();
  return useMutation<string, Error, Partial<LottoNumberSetType>>({
    mutationFn: (payload) => saveMyNumberSet(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.numberSets });
      await qc.invalidateQueries({ queryKey: keys.numberResults });
    },
  });
}

export function useDeleteNumberSetMutation() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteMyNumberSet(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.numberSets });
      await qc.invalidateQueries({ queryKey: keys.numberResults });
    },
  });
}

export function useMyNumberResultsQuery() {
  return useQuery<MyNumberResultsType, Error>({
    queryKey: keys.numberResults,
    queryFn: () => compareMyNumbers(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useHotColdStatsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: keys.hotCold,
    queryFn: () => getHotColdStats(),
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? false,
  });
}
