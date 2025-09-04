import type { CreditPolicyType, CreditSpendCostType } from '@/types';

// 개발모드일때
const envMode =
  (process.env.NEXT_PUBLIC_CREDIT_RESET_MODE || '').toLowerCase() === 'minute';

export const CREDIT_POLICY: CreditPolicyType = {
  rewardAmount: 5, // 기본 보상 크레딧
  dailyCap: envMode
    ? 10
    : Number(process.env.NEXT_PUBLIC_CREDIT_DAILY_CAP) ?? 50, // 하루 최대치 크레딧
  cooldownMs: envMode ? 5000 : 1.5 * 60 * 1000, // 광고 재시청 쿨다운
  baseDaily: 5, //기본 시작 크레딧
  stepReward: envMode ? 5 : 60, // seconds(초)
  maxPerAd: 20, // 한번에 얻을수 있는 최대 크레딧
  maxPerIpPerDay: 3, // 하루에 얻을수 있는 최대 크레딧
  maxPerDevicePerDay: 1, // 한기기에 얻을수 있는 최대 크레딧
  deviceCookie: 'did',
} as const;

export const SPEND_COST: CreditSpendCostType = {
  analysis: 3,
  simulator: 2,
  advanced: 3,
} as const;

export enum CREDIT_RESET_MODE_ENUM {
  MIDNIGHT = 'midnight',
  MINUTE = 'minute',
}

export enum CREDIT_APPLIXIR_STATUS_ENUM {
  LOADED = 'loaded',
  START = 'start',
  APPLIXIR_STARTED = 'applixir-started',
  COMPLETE = 'complete',
  APPLIXIR_WATCHED = 'applixir-watched',
  SKIP = 'skip',
  APPLIXIR_SKIPPED = 'applixir-skipped',
  APPLIXIR_INTERRUPTED = 'applixir-interrupted',
  FB_STARTED = 'fb-started',
  FB_WATCHED = 'fb-watched',
  ALL_ADS_COMPLETED = 'allAdsCompleted',
  THANK_YOU_MODAL_CLOSED = 'thankYouModalClosed',
}

export enum CREDIT_CLAIM_ERROR_CODE_ENUM {
  APPCHECK_MISSING = 'appcheck/missing',
  APPCHECK_INVALID = 'appcheck/invalid',
  AUTH_MISSING = 'auth/missing',
  AUTH_INVALID = 'auth/invalid',
  LIMIT_DEVICE = 'limit/device',
  LIMIT_IP = 'limit/ip',
  INTERNAL = 'internal',
  REQUEST_FAILED = 'request_failed',
}

export enum CREDIT_APPLIXIR_ERROR_ENUM {
  APPLIXIR_REQUEST_NETWORK_ERROR = 'applixirRequestNetworkError',
  CONSENT_MANAGEMENT_PROVIDER_NOT_READY = 'consentManagementProviderNotReady',
  APPLIXIR_UNAVAILABLE = 'applixir-unavailable',
}
