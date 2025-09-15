import type {
  CreditPolicyType,
  CreditResetModeType,
  CreditSpendCostType,
} from '@/types';

// 개발모드일때(분 단위 리셋 테스트용)
export const ENV_MINUTE_MODE =
  (process.env.NEXT_PUBLIC_CREDIT_RESET_MODE || '').trim().toLowerCase() ===
  'minute';

const DAILY_CAP_DEFAULT: number = 80;
const dailyCapValue: number = ENV_MINUTE_MODE
  ? 100
  : Number((process.env.NEXT_PUBLIC_CREDIT_DAILY_CAP || '').trim()) ||
    DAILY_CAP_DEFAULT; // minute 모드와 무관하게 ENV 또는 기본값으로만 결정

export const CREDIT_POLICY: CreditPolicyType = {
  rewardAmount: 10,
  dailyCap: dailyCapValue, // 하루 최대치 크레딧 (기본 80)
  cooldownMs: ENV_MINUTE_MODE ? 5000 : 1.5 * 60 * 1000, // minute 모드일 때만 쿨다운 단축
  baseDaily: dailyCapValue, // 초기/일일 기본 지급 크레딧 (minute 모드에 영향을 받지 않음)
  maxPerIpPerDay: 3,
  maxPerDevicePerDay: 1,
  deviceCookie: 'did',
} as const;

// 유지: 리셋 모드 (스토어 등에서 사용)
export enum CREDIT_RESET_MODE_ENUM {
  MIDNIGHT = 'midnight',
  MINUTE = 'minute',
}

const envResetMode = (process.env.NEXT_PUBLIC_CREDIT_RESET_MODE || '')
  .trim()
  .toLowerCase();
export const CREDIT_RESET_MODE: CreditResetModeType =
  envResetMode === CREDIT_RESET_MODE_ENUM.MINUTE
    ? CREDIT_RESET_MODE_ENUM.MINUTE
    : CREDIT_RESET_MODE_ENUM.MIDNIGHT;

// Refill mode: interval(주기적 충전) | midnight(일일 리셋만)
export const CREDIT_REFILL_MODE = (
  process.env.NEXT_PUBLIC_CREDIT_REFILL_MODE || 'interval'
)
  .trim()
  .toLowerCase();

export const CREDIT_SPEND_COST: CreditSpendCostType = {
  analysis: 3,
  simulator: 2,
  advanced: 3,
  csv: 1,
  report: 2,
} as const;

export const CREDIT_REFILL_INTERVAL_MS =
  CREDIT_REFILL_MODE === 'interval'
    ? ENV_MINUTE_MODE
      ? 10 * 1000
      : 5 * 60 * 1000
    : 0;
export const CREDIT_REFILL_AMOUNT = 1;

// 유지: 크레딧 클레임 에러 코드 (API/서비스에서 사용)
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
