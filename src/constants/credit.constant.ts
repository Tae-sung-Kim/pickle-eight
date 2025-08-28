import type { CreditPolicyType, SpendCostType } from '@/types';

export const CREDIT_POLICY: CreditPolicyType = {
  rewardAmount: 5,
  dailyCap: 40,
  cooldownMs: 1.5 * 60 * 1000,
  visibleRatioRequired: 0.5,
  visibleSecondsRequired: 20,
  baseDaily: 5,
} as const;

export const SPEND_COST: SpendCostType = {
  analysis: 3,
  simulator: 2,
  advanced: 5,
} as const;

export enum CREDIT_RESET_MODE_ENUM {
  MIDNIGHT = 'midnight',
  MINUTE = 'minute',
}
