import { create } from 'zustand';
import { CREDIT_POLICY } from '@/constants/credit.constant';
import type {
  CreditBalanceType,
  EarnCheckResultType,
  SpendCheckResultType,
} from '@/types/credit';

type CreditStateType = {
  earn: () => EarnCheckResultType;
  spend: (amount: number) => SpendCheckResultType;
  canSpend: (amount: number) => SpendCheckResultType;
} & CreditBalanceType;

const STORAGE_KEY = 'credits:v1';
const DAY = 24 * 60 * 60 * 1000;

function load(): CreditBalanceType {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { total: 0, todayEarned: 0 };
    const data = JSON.parse(raw) as CreditBalanceType & {
      lastEarnedAt?: number;
    };
    if (data.lastEarnedAt && Date.now() - data.lastEarnedAt > DAY) {
      return { total: data.total ?? 0, todayEarned: 0 };
    }
    return {
      total: data.total ?? 0,
      todayEarned: data.todayEarned ?? 0,
      lastEarnedAt: data.lastEarnedAt,
    };
  } catch {
    return { total: 0, todayEarned: 0 };
  }
}

function save(state: CreditBalanceType): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useCreditStore = create<CreditStateType>((set, get) => ({
  ...load(),
  earn: () => {
    const s = get();
    const now = Date.now();
    const last = s.lastEarnedAt ?? 0;
    const since = now - last;
    if (s.todayEarned >= CREDIT_POLICY.dailyCap) {
      return { canEarn: false, reason: 'daily_cap' };
    }
    if (since < CREDIT_POLICY.cooldownMs) {
      return {
        canEarn: false,
        reason: 'cooldown',
        msToNext: CREDIT_POLICY.cooldownMs - since,
      };
    }
    const willEarn = Math.min(
      CREDIT_POLICY.rewardAmount,
      CREDIT_POLICY.dailyCap - s.todayEarned
    );
    const next = {
      total: s.total + willEarn,
      todayEarned: s.todayEarned + willEarn,
      lastEarnedAt: now,
    };
    set(next);
    save(next);
    return { canEarn: true, reason: 'ok' };
  },
  canSpend: (amount: number) => {
    const s = get();
    if (s.total >= amount) return { canSpend: true };
    return { canSpend: false, shortBy: Math.max(0, amount - s.total) };
  },
  spend: (amount: number) => {
    const check = get().canSpend(amount);
    if (!check.canSpend) return check;
    const s = get();
    const next = {
      total: s.total - amount,
      todayEarned: s.todayEarned,
      lastEarnedAt: s.lastEarnedAt,
    };
    set(next);
    save(next);
    return { canSpend: true };
  },
}));
