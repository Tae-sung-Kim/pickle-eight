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

// Ad status types observed from Applixir callbacks
export type CreditAdStatusType =
  | 'loaded'
  | 'start'
  | 'ad-started'
  | 'complete'
  | 'ad-watched'
  | 'skip'
  | 'ad-skipped'
  | 'ad-interrupted'
  | 'fb-started'
  | 'fb-watched'
  | 'allAdsCompleted'
  | 'thankYouModalClosed';

// Error types observed from Applixir error callback
export type CreditAdErrorType =
  | 'adsRequestNetworkError'
  | 'consentManagementProviderNotReady'
  | 'ads-unavailable'
  | string;

// ===== Ad services =====

export type AdEventPayloadType = Readonly<Record<string, unknown>>;

export type StartAdSessionInputType = Readonly<{ cid: string }>;
export type StartAdSessionOutputType = Readonly<{ token: string }>;

export type CompleteAdSessionInputType = Readonly<{ token: string }>;
export type CompleteAdSessionOutputType = Readonly<{ ok: boolean }>;

export type ApplixirRewardAdType = {
  readonly onAdCompleted?: () => void;
  readonly onAdError?: (error: string) => void;
  readonly maxHeight?: number; // modal이 계산한 가용 높이 전달(선택)
  readonly disabled?: boolean; // 외부에서 버튼 활성/비활성 제어
};
