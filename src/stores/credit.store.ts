import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CREDIT_POLICY } from '@/constants';
import type {
  CreditBalanceType,
  EarnCheckResultType,
  SpendCheckResultType,
} from '@/types/credit.type';

type CreditStateType = {
  onEarn: () => EarnCheckResultType;
  onSpend: (amount: number) => SpendCheckResultType;
  canSpend: (amount: number) => SpendCheckResultType;
} & CreditBalanceType;

const STORAGE_KEY = process.env.NEXT_PUBLIC_SITE_NAME + '_credits:v1';
const DAY = 24 * 60 * 60 * 1000;

const initialBalance: CreditBalanceType = {
  total: 0,
  todayEarned: 0,
};

export const useCreditStore = create<CreditStateType>()(
  persist(
    (set, get) => ({
      ...initialBalance,
      onEarn: () => {
        const s = get();
        const now = Date.now();
        const last = s.lastEarnedAt ?? 0;
        const since = now - last;
        if (s.todayEarned >= CREDIT_POLICY.dailyCap) {
          return { canEarn: false, reason: 'daily_cap' } as EarnCheckResultType;
        }
        if (since < CREDIT_POLICY.cooldownMs) {
          return {
            canEarn: false,
            reason: 'cooldown',
            msToNext: CREDIT_POLICY.cooldownMs - since,
          } as EarnCheckResultType;
        }
        const willEarn = Math.min(
          CREDIT_POLICY.rewardAmount,
          CREDIT_POLICY.dailyCap - s.todayEarned
        );
        const next: CreditBalanceType = {
          total: s.total + willEarn,
          todayEarned: s.todayEarned + willEarn,
          lastEarnedAt: now,
        } as CreditBalanceType;
        set(next);
        return { canEarn: true, reason: 'ok' } as EarnCheckResultType;
      },
      canSpend: (amount: number) => {
        const s = get();
        if (s.total >= amount)
          return { canSpend: true } as SpendCheckResultType;
        return {
          canSpend: false,
          shortBy: Math.max(0, amount - s.total),
        } as SpendCheckResultType;
      },
      onSpend: (amount: number) => {
        const check = get().canSpend(amount);
        if (!check.canSpend) return check;
        const s = get();
        const next: CreditBalanceType = {
          total: s.total - amount,
          todayEarned: s.todayEarned,
          lastEarnedAt: s.lastEarnedAt,
        } as CreditBalanceType;
        set(next);
        return { canSpend: true } as SpendCheckResultType;
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      // Important: avoid reading localStorage during SSR; JSON storage reads only in browser
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        total: s.total,
        todayEarned: s.todayEarned,
        lastEarnedAt: s.lastEarnedAt,
      }),
      migrate: (persisted) => persisted as CreditBalanceType,
      // Reset todayEarned after a day on hydration
      onRehydrateStorage: () => (state) => {
        if (!state?.lastEarnedAt) return;
        const since = Date.now() - (state.lastEarnedAt ?? 0);
        if (since > DAY) {
          // safe set after rehydrate
          useCreditStore.setState({ todayEarned: 0 });
        }
      },
    }
  )
);
