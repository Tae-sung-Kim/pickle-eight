import { GPT_MODEL_COST, GPT_MODEL_ENUM } from '@/constants';

export function getModelCostByKey(key: GPT_MODEL_ENUM): number {
  return GPT_MODEL_COST[key] ?? 0;
}

/**
 * Given a model string value (e.g., 'gpt-4o-mini'), return its enum key if known.
 */
export function getModelKeyByValue(model: string): GPT_MODEL_ENUM | null {
  const entries = Object.entries(GPT_MODEL_ENUM) as [
    keyof typeof GPT_MODEL_ENUM,
    string
  ][];
  for (const [k, v] of entries) {
    if (v === model) return GPT_MODEL_ENUM[k];
  }
  return null;
}

/**
 * Return credit cost for a given model string value.
 */
export function getModelCost(model: string): number {
  const key = getModelKeyByValue(model);
  return key ? GPT_MODEL_COST[key] : 0;
}

export function isPaidModel(model: string): boolean {
  return getModelCost(model) > 0;
}
