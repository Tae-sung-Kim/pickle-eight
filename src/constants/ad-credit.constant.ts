import type { CreditPolicyType, CreditSpendCostType } from '@/types';

// 개발모드일때
const envMinuteMode =
  (process.env.NEXT_PUBLIC_CREDIT_RESET_MODE || '').toLowerCase() === 'minute';

// Constants to avoid magic numbers

export const AD_APX = {
  ASPECT_WIDTH: 16,
  ASPECT_HEIGHT: 9,
  VIEWPORT_HEIGHT_RATIO: 0.9,
  MIN_WRAPPER_HEIGHT: 200,
  CLOSE_WITHOUT_REWARD_MS: 60_000, // 60s after which we allow closing without reward
} as const;

const DAILY_CAP_DEFAULT: number = 80;
const dailyCapValue: number = envMinuteMode
  ? 100
  : Number(process.env.NEXT_PUBLIC_CREDIT_DAILY_CAP ?? '') || DAILY_CAP_DEFAULT;

export const CREDIT_POLICY: CreditPolicyType = {
  rewardAmount: 10, // 기본 보상 크레딧 (보상형 광고 비활성화로 현재 미사용)
  dailyCap: dailyCapValue, // 하루 최대치 크레딧 (기본 80)
  cooldownMs: envMinuteMode ? 5000 : 1.5 * 60 * 1000, // 광고 재시청 쿨다운 (보상형 광고 비활성화로 현재 미사용)
  baseDaily: envMinuteMode ? 80 : 80, // 초기/일일 기본 지급 크레딧을 80으로 상향
  stepReward: envMinuteMode ? 5 : 60, // seconds(초) (보상형 광고 비활성화로 현재 미사용)
  maxPerAd: 20, // 한번에 얻을수 있는 최대 크레딧 (보상형 광고 비활성화로 현재 미사용)
  maxPerIpPerDay: 3, // 하루에 얻을수 있는 최대 크레딧 (보상형 광고 비활성화와 무관, API 안전장치 유지)
  maxPerDevicePerDay: 1, // 한기기에 얻을수 있는 최대 크레딧 (보상형 광고 비활성화와 무관, API 안전장치 유지)
  deviceCookie: 'did',
} as const;

export const SPEND_COST: CreditSpendCostType = {
  analysis: 3,
  simulator: 2,
  advanced: 3,
  csv: 1,
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
