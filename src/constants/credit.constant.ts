import type { CreditPolicyType, SpendCostType } from '@/types';

export const CREDIT_POLICY: CreditPolicyType = {
  rewardAmount: 5,
  dailyCap: 50,
  cooldownMs: 1 * 60 * 1000,
  visibleRatioRequired: 0.5,
  visibleSecondsRequired: 12,
} as const;

export const SPEND_COST: SpendCostType = {
  analysis: 3,
  simulator: 2,
  advanced: 5,
} as const;
