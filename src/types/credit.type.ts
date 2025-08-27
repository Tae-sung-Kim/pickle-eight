import { SPEND_COST } from '@/constants';

export type CreditEventType =
  | 'reward_complete'
  | 'spend_analysis'
  | 'spend_simulator'
  | 'spend_advanced';

export type CreditBalanceType = {
  readonly total: number;
  readonly todayEarned: number;
  readonly lastEarnedAt?: number;
};

export type CreditPolicyType = {
  readonly rewardAmount: number;
  readonly dailyCap: number;
  readonly cooldownMs: number;
  readonly visibleRatioRequired: number;
  readonly visibleSecondsRequired: number;
};

export type SpendCostType = {
  readonly analysis: number;
  readonly simulator: number;
  readonly advanced: number;
};

export type EarnCheckResultType = {
  readonly canEarn: boolean;
  readonly reason?: 'cooldown' | 'daily_cap' | 'ok';
  readonly msToNext?: number;
};

export type SpendCheckResultType = {
  readonly canSpend: boolean;
  readonly shortBy?: number;
};

export type UseCreditCostLabelType = {
  readonly spendKey: keyof typeof SPEND_COST;
  readonly baseLabel: string;
  readonly isBusy?: boolean;
  readonly busyLabel?: string;
};
