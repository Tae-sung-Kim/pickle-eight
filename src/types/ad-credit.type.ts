import { CREDIT_RESET_MODE_ENUM, SPEND_COST } from '@/constants';

declare global {
  interface Window {
    kakaoAsyncAdFit?: unknown[];
  }
}

export type CreditBalanceType = {
  readonly total: number;
  readonly todayEarned: number;
  readonly lastEarnedAt?: number;
  readonly lastResetAt?: number;
  readonly overCapLocked?: boolean;
  readonly lastRefillAt?: number; // 5분 리필 버킷 기준 시각(ms)
  readonly refillArmed: boolean; // 상한에서 소비가 발생한 이후에만 리필을 동작시키기 위한 플래그
};

export type CreditPolicyType = {
  readonly rewardAmount: number;
  readonly dailyCap: number;
  readonly cooldownMs: number;
  readonly baseDaily: number;
  readonly maxPerIpPerDay: number;
  readonly maxPerDevicePerDay: number;
  readonly deviceCookie: string;
};

export type CreditSpendCostType = {
  readonly analysis: number;
  readonly simulator: number;
  readonly advanced: number;
  readonly csv: number;
};

export type CreditEarnCheckResultType = {
  readonly canEarn: boolean;
  readonly reason?: 'cooldown' | 'daily_cap' | 'ok';
  readonly msToNext?: number;
};

export type CreditSpendCheckResultType = {
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
  onEarn: (amount?: number) => CreditEarnCheckResultType;
  onSpend: (amount: number) => CreditSpendCheckResultType;
  canSpend: (amount: number) => CreditSpendCheckResultType;
  syncReset: () => void;
  hydrated: boolean;
  markHydrated: () => void;
  revokeTodaysEarned: () => void;
  setTotal: (total: number) => void;
  setServerSync: (p: {
    credits: number;
    lastRefillAt?: number;
    refillArmed?: boolean;
  }) => void;
} & CreditBalanceType;

// Use enum VALUE union ("midnight" | "minute"), not KEY union
export type CreditResetModeType =
  (typeof CREDIT_RESET_MODE_ENUM)[keyof typeof CREDIT_RESET_MODE_ENUM];

export type CreditSpendResponseType = {
  ok: boolean;
  credits: number;
  code?: string;
  lastRefillAt?: number;
  refillArmed?: boolean;
};

export type UserCreditsType = {
  credits: number;
  lastClaimDate?: string;
  lastRefillAt?: number;
  refillArmed?: boolean;
};

export type CreditBalancePillType = {
  className?: string;
  showLabel?: boolean;
};
