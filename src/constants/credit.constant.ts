import type { CreditPolicyType, SpendCostType } from '@/types';

// 개발모드일때
const envMode =
  (process.env.NEXT_PUBLIC_CREDIT_RESET_MODE || '').toLowerCase() === 'minute';

export const CREDIT_POLICY: CreditPolicyType = {
  rewardAmount: 5,
  dailyCap: envMode ? 10 : 50,
  cooldownMs: envMode ? 5000 : 1.5 * 60 * 1000,
  visibleRatioRequired: 0.5,
  baseDaily: 5,
  stepReward: envMode ? 5 : 60,
  maxPerAd: 20,
} as const;

export const SPEND_COST: SpendCostType = {
  analysis: 3,
  simulator: 2,
  advanced: 3,
} as const;

export enum CREDIT_RESET_MODE_ENUM {
  MIDNIGHT = 'midnight',
  MINUTE = 'minute',
}
