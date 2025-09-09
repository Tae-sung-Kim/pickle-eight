import type { CreditPolicyType, CreditSpendCostType } from '@/types';

// 개발모드일때
const envMinuteMode =
  (process.env.NEXT_PUBLIC_CREDIT_RESET_MODE || '').toLowerCase() === 'minute';

const DAILY_CAP_DEFAULT: number = 80;
const dailyCapValue: number = envMinuteMode
  ? 100
  : Number(process.env.NEXT_PUBLIC_CREDIT_DAILY_CAP ?? '') || DAILY_CAP_DEFAULT;

export const CREDIT_POLICY: CreditPolicyType = {
  rewardAmount: 10, // 현재 보상형 광고 미사용, 내부 onEarn 등에서 기본 증분 용도로만 사용 가능
  dailyCap: dailyCapValue, // 하루 최대치 크레딧 (기본 80)
  cooldownMs: envMinuteMode ? 5000 : 1.5 * 60 * 1000, // 현재 광고 미사용 상태에서도 내부 쿨다운 기준으로 활용 가능
  baseDaily: envMinuteMode ? 80 : 80, // 초기/일일 기본 지급 크레딧 80
  stepReward: envMinuteMode ? 5 : 60, // (미사용) 보상형 광고 삭제에 따라 의미 없음
  maxPerAd: 0, // (미사용)
  maxPerIpPerDay: 3,
  maxPerDevicePerDay: 1,
  deviceCookie: 'did',
} as const;

export const SPEND_COST: CreditSpendCostType = {
  analysis: 3,
  simulator: 2,
  advanced: 3,
  csv: 1,
} as const;

// 유지: 리셋 모드 (스토어 등에서 사용)
export enum CREDIT_RESET_MODE_ENUM {
  MIDNIGHT = 'midnight',
  MINUTE = 'minute',
}

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
