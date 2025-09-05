import {
  CREDIT_APPLIXIR_STATUS_ENUM,
  CREDIT_APPLIXIR_ERROR_ENUM,
  CREDIT_CLAIM_ERROR_CODE_ENUM,
  CREDIT_RESET_MODE_ENUM,
  SPEND_COST,
} from '@/constants';

declare global {
  interface Window {
    kakaoAsyncAdFit?: unknown[];
    initializeAndOpenPlayer?: (options: {
      apiKey: string;
      injectionElementId: string;
      adStatusCallbackFn: (status: { type: CreditApplixirStatusType }) => void;
      adErrorCallbackFn: (error: {
        getError: () => {
          data: { type: CreditApplixirErrorType };
          errorMessage: string;
        };
      }) => void;
      adOptions?: { customId?: string };
    }) => void;
  }
}

export type AdCreditReturn = {
  readonly cooldownMsLeft: number;
  readonly inCooldown: boolean;
  readonly reachedDailyCap: boolean;
  readonly canWatchAd: boolean;
  readonly elapsedMs: number;
  readonly currentReward: number;
  readonly playing: boolean;
  readonly hasStarted: boolean;
  ensureStarted: () => void;
  handlePause: () => void;
  getWatchedMs: () => number;
  resetElapsed: () => void;
  bindMediaElement: (el: HTMLMediaElement) => void;
  buildCostLabel: (
    args: CreditCostLabelType & { amountOverride?: number }
  ) => string;
};

export type CreditBalanceType = {
  readonly total: number;
  readonly todayEarned: number;
  readonly lastEarnedAt?: number;
  readonly lastResetAt?: number;
  readonly overCapLocked?: boolean;
};

export type CreditPolicyType = {
  readonly rewardAmount: number;
  readonly dailyCap: number;
  readonly cooldownMs: number;
  readonly baseDaily: number;
  readonly stepReward: number;
  readonly maxPerAd: number;
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
} & CreditBalanceType;

// Use enum VALUE union ("midnight" | "minute"), not KEY union ("MIDNIGHT" | "MINUTE")
export type CreditResetModeType =
  (typeof CREDIT_RESET_MODE_ENUM)[keyof typeof CREDIT_RESET_MODE_ENUM];

export type CreditClaimErrorCodeType =
  (typeof CREDIT_CLAIM_ERROR_CODE_ENUM)[keyof typeof CREDIT_CLAIM_ERROR_CODE_ENUM];

export type CreditClaimResponseType = {
  ok: boolean;
  already?: boolean;
  code?: CreditClaimErrorCodeType;
};

export type UserCreditsType = { credits: number; lastClaimDate?: string };

// Ad status types observed from Applixir callbacks
export type CreditApplixirStatusType =
  (typeof CREDIT_APPLIXIR_STATUS_ENUM)[keyof typeof CREDIT_APPLIXIR_STATUS_ENUM];

// Error types observed from Applixir error callback
export type CreditApplixirErrorType =
  | (typeof CREDIT_APPLIXIR_ERROR_ENUM)[keyof typeof CREDIT_APPLIXIR_ERROR_ENUM]
  | string;

// ===== Ad services =====

export type CreditApplixirEventPayloadType = Readonly<Record<string, unknown>>;

export type CreditStartApplixirSessionInputType = Readonly<{ cid: string }>;
export type CreditStartApplixirSessionOutputType = Readonly<{ token: string }>;

export type CreditCompleteApplixirSessionInputType = Readonly<{
  token: string;
}>;
export type CreditCompleteApplixirSessionOutputType = Readonly<{ ok: boolean }>;

export type CreditApplixirRewardAdType = {
  readonly onApplixirCompleted?: () => void;
  readonly onApplixirError?: (error: CreditApplixirErrorType) => void;
  readonly maxHeight?: number; // modal이 계산한 가용 높이 전달(선택)
  readonly disabled?: boolean; // 외부에서 버튼 활성/비활성 제어
};
