import type { CreditPolicyType, CreditSpendCostType } from '@/types';

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
  maxPerIpPerDay: 3,
  maxPerDevicePerDay: 1,
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

export enum CREDIT_AD_STATUS_ENUM {
  LOADED = 'loaded',
  START = 'start',
  AD_STARTED = 'ad-started',
  COMPLETE = 'complete',
  AD_WATCHED = 'ad-watched',
  SKIP = 'skip',
  AD_SKIPPED = 'ad-skipped',
  AD_INTERRUPTED = 'ad-interrupted',
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

export enum CREDIT_ADERROR_ENUM {
  ADS_REQUEST_NETWORK_ERROR = 'adsRequestNetworkError',
  CONSENT_MANAGEMENT_PROVIDER_NOT_READY = 'consentManagementProviderNotReady',
  ADS_UNAVAILABLE = 'ads-unavailable',
}
