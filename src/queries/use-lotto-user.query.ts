import type { AutoCompareItem } from '@/services/lotto-user.service';
import {
    autoCompareMyNumbers,
    deleteConstraintPreset,
    deleteMyNumberSet,
    getHotColdStats,
    getMyBudget,
    listConstraintPresets,
    listGenerationLogs,
    listMyNumberSets,
    saveConstraintPreset,
    saveGenerationLog,
    saveMyBudget,
    saveMyNumberSet,
} from '@/services/lotto-user.service';
import type { LottoBudgetDocType, LottoConstraintPresetType, LottoGenerationLogType, LottoNumberSetType } from "@/types/lotto.type";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const keys = {
  numberSets: ['lotto', 'user', 'number-sets'] as const,
  autoCompare: (from: number, to: number) =>
    ['lotto', 'user', 'auto-compare', from, to] as const,
  presets: ['lotto', 'user', 'constraint-presets'] as const,
  hotCold: ['lotto', 'stats', 'hot-cold'] as const,
  genLogs: (limit: number) =>
    ['lotto', 'user', 'generation-logs', limit] as const,
  budget: ['lotto', 'user', 'budget'] as const,
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
    },
  });
}

export function useDeleteNumberSetMutation() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteMyNumberSet(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.numberSets });
    },
  });
}

export function useAutoCompareQuery(from: number, to: number, enabled = true) {
  return useQuery<ReadonlyArray<AutoCompareItem>, Error>({
    queryKey: keys.autoCompare(from, to),
    queryFn: () => autoCompareMyNumbers(from, to),
    enabled,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useConstraintPresetsQuery() {
  return useQuery<ReadonlyArray<LottoConstraintPresetType>, Error>({
    queryKey: keys.presets,
    queryFn: () => listConstraintPresets(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSaveConstraintPresetMutation() {
  const qc = useQueryClient();
  return useMutation<string, Error, Partial<LottoConstraintPresetType>>({
    mutationFn: (payload) => saveConstraintPreset(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.presets });
    },
  });
}

export function useDeleteConstraintPresetMutation() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteConstraintPreset(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.presets });
    },
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

export function useGenerationLogsQuery(limit = 30) {
  return useQuery<ReadonlyArray<LottoGenerationLogType>, Error>({
    queryKey: keys.genLogs(limit),
    queryFn: () => listGenerationLogs(limit),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSaveGenerationLogMutation(limitToInvalidate = 30) {
  const qc = useQueryClient();
  return useMutation<void, Error, Parameters<typeof saveGenerationLog>[0]>({
    mutationFn: (payload) => saveGenerationLog(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.genLogs(limitToInvalidate) });
    },
  });
}

export function useMyBudgetQuery() {
  return useQuery<LottoBudgetDocType | null, Error>({
    queryKey: keys.budget,
    queryFn: () => getMyBudget(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSaveMyBudgetMutation() {
  const qc = useQueryClient();
  return useMutation<void, Error, Partial<LottoBudgetDocType>>({
    mutationFn: (payload) => saveMyBudget(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.budget });
    },
  });
}
