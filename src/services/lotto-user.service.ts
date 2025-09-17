import { http } from "@/lib/http";
import type { LottoBudgetDocType, LottoConstraintPresetType, LottoGenerationLogType, LottoNumberSetType } from "@/types/lotto.type";

export async function listMyNumberSets(): Promise<LottoNumberSetType[]> {
  const res = await http.get<{ ok: boolean; data: LottoNumberSetType[] }>(
    '/lotto/user/number-sets'
  );
  return res.data.data ?? [];
}

export async function saveMyNumberSet(
  payload: Partial<LottoNumberSetType>
): Promise<string> {
  const res = await http.post<{ ok: boolean; id: string }>(
    '/lotto/user/number-sets',
    payload
  );
  return res.data.id;
}

export async function deleteMyNumberSet(id: string): Promise<void> {
  await http.delete('/lotto/user/number-sets', { params: { id } });
}

export type AutoCompareItem = Readonly<{
  id?: string | null;
  label: string | null;
  numbers: readonly [number, number, number, number, number, number];
  results: ReadonlyArray<{
    drawNumber: number;
    matchCount: number;
    bonusMatch: boolean;
    rank: 0 | 1 | 2 | 3 | 4 | 5;
  }>;
}>;

export async function autoCompareMyNumbers(
  from: number,
  to: number
): Promise<ReadonlyArray<AutoCompareItem>> {
  const res = await http.get<{
    ok: boolean;
    data: ReadonlyArray<AutoCompareItem>;
    meta: { from: number; to: number; count: number };
  }>('/lotto/user/auto-compare', { params: { from, to } });
  return res.data.data;
}

// Constraint presets
export async function listConstraintPresets(): Promise<
  ReadonlyArray<LottoConstraintPresetType>
> {
  const res = await http.get<{
    ok: boolean;
    data: ReadonlyArray<LottoConstraintPresetType>;
  }>('/lotto/user/constraint-presets');
  return res.data.data ?? [];
}

export async function saveConstraintPreset(
  payload: Partial<LottoConstraintPresetType>
): Promise<string> {
  const res = await http.post<{ ok: boolean; id: string }>(
    '/lotto/user/constraint-presets',
    payload
  );
  return res.data.id;
}

export async function deleteConstraintPreset(id: string): Promise<void> {
  await http.delete('/lotto/user/constraint-presets', { params: { id } });
}

// Hot/Cold stats
export type HotColdStats = Readonly<{
  latest: number;
  frequency: Readonly<Record<number, number>>;
  overdue: Readonly<Record<number, number>>; // how many draws since last appearance
  recentWindow: number;
  recentFrequency: Readonly<Record<number, number>>;
}>;

export async function getHotColdStats(): Promise<HotColdStats | null> {
  const res = await http.get<{ ok: boolean; data: HotColdStats | null }>(
    '/lotto/stats/hot-cold'
  );
  return res.data.data ?? null;
}

// Generation logs
export async function listGenerationLogs(
  limit = 30
): Promise<ReadonlyArray<LottoGenerationLogType>> {
  const res = await http.get<{
    ok: boolean;
    data: ReadonlyArray<LottoGenerationLogType>;
  }>('/lotto/user/generation-log', { params: { limit } });
  return res.data.data ?? [];
}

export async function saveGenerationLog(
  payload: Partial<LottoGenerationLogType>
): Promise<void> {
  await http.post('/lotto/user/generation-log', payload);
}

// Budget
export async function getMyBudget(): Promise<LottoBudgetDocType | null> {
  const res = await http.get<{ ok: boolean; data: LottoBudgetDocType | null }>(
    '/lotto/user/budgets'
  );
  return res.data.data ?? null;
}

export async function saveMyBudget(
  payload: Partial<LottoBudgetDocType>
): Promise<void> {
  await http.post('/lotto/user/budgets', payload);
}
