import { CREDIT_RESET_MODE_ENUM, SPEND_COST } from '@/constants';

export type CreditEventType =
  | 'reward_complete'
  | 'spend_analysis'
  | 'spend_simulator'
  | 'spend_advanced';

export type CreditBalanceType = {
  readonly total: number;
  readonly todayEarned: number;
  readonly lastEarnedAt?: number;
  readonly lastResetAt?: number;
};

export type CreditPolicyType = {
  readonly rewardAmount: number;
  readonly dailyCap: number;
  readonly cooldownMs: number;
  readonly visibleRatioRequired: number;
  readonly baseDaily: number;
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

export type CreditCostLabelType = {
  readonly spendKey: keyof typeof SPEND_COST;
  readonly baseLabel: string;
  readonly isBusy?: boolean;
  readonly busyLabel?: string;
};

export type CreditStateType = {
  onEarn: () => EarnCheckResultType;
  onSpend: (amount: number) => SpendCheckResultType;
  canSpend: (amount: number) => SpendCheckResultType;
  syncReset: () => void;
} & CreditBalanceType;

// Use enum VALUE union ("midnight" | "minute"), not KEY union ("MIDNIGHT" | "MINUTE")
export type CreditResetModeType =
  (typeof CREDIT_RESET_MODE_ENUM)[keyof typeof CREDIT_RESET_MODE_ENUM];

export type CreditClaimErrorCodeType =
  | 'appcheck/missing'
  | 'appcheck/invalid'
  | 'auth/missing'
  | 'auth/invalid'
  | 'limit/device'
  | 'limit/ip'
  | 'internal'
  | 'request_failed';

export type CreditClaimResponseType = {
  ok: boolean;
  already?: boolean;
  code?: CreditClaimErrorCodeType;
};

export type UserCreditsType = { credits: number; lastClaimDate?: string };
