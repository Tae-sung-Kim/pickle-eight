import { CREDIT_POLICY } from '@/constants';

export const formatCooldown = (ms: number): string => {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m${s}s`;
};

export const getAnonymousId = () => {
  try {
    const key = 'AID';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const buf =
      typeof window !== 'undefined' && window.crypto?.getRandomValues
        ? (() => {
            const a = new Uint8Array(16);
            window.crypto.getRandomValues(a);
            return Array.from(a)
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('');
          })()
        : (() => {
            let s = '';
            for (let i = 0; i < 16; i++) {
              s += Math.floor(Math.random() * 256)
                .toString(16)
                .padStart(2, '0');
            }
            return s;
          })();
    localStorage.setItem(key, buf);
    return buf;
  } catch {
    return `aid_${Date.now()}`;
  }
};

export const computeRewardByWatch = (watchedMs: number): number => {
  const sec = Math.floor(watchedMs / 1000);
  const stepSec = CREDIT_POLICY.stepReward; // 운영: 60초, 개발: 5초
  const inc = CREDIT_POLICY.rewardAmount; // 스텝당 +크레딧(기본 5)
  if (sec <= 2 * stepSec) return Math.min(inc, CREDIT_POLICY.maxPerAd); // 기준(2스텝) 이전: 기본 보상
  const steps = Math.floor(sec / stepSec) - 1; // 기준(2스텝) 초과분부터 스텝 카운트
  const amount = inc + steps * inc;
  return Math.min(amount, CREDIT_POLICY.maxPerAd);
};
