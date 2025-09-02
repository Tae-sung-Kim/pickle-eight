import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CREDIT_POLICY, CREDIT_RESET_MODE_ENUM } from '@/constants';
import type {
  CreditBalanceType,
  CreditResetModeType,
  CreditStateType,
  EarnCheckResultType,
  SpendCheckResultType,
} from '@/types';

const STORAGE_KEY = process.env.NEXT_PUBLIC_SITE_NAME + '_credits:v2';

// Testing option: set NEXT_PUBLIC_CREDIT_RESET_MODE=minute to reset every minute instead of midnight.
// Default (undefined or any other value) uses midnight-based reset.
const envMode = (process.env.NEXT_PUBLIC_CREDIT_RESET_MODE || '').toLowerCase();
const RESET_MODE: CreditResetModeType =
  envMode === CREDIT_RESET_MODE_ENUM.MINUTE
    ? CREDIT_RESET_MODE_ENUM.MINUTE
    : CREDIT_RESET_MODE_ENUM.MIDNIGHT;

function todayMidnightTs(now: number = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function minuteBucketTs(now: number = Date.now()): number {
  const d = new Date(now);
  d.setSeconds(0, 0);
  return d.getTime();
}

function currentResetKey(now: number = Date.now()): number {
  return RESET_MODE === CREDIT_RESET_MODE_ENUM.MINUTE
    ? minuteBucketTs(now)
    : todayMidnightTs(now);
}

const initialBalance: CreditBalanceType = {
  total: CREDIT_POLICY.baseDaily,
  todayEarned: 0,
  lastEarnedAt: 0,
  lastResetAt: currentResetKey(),
};

export const useCreditStore = create<CreditStateType>()(
  persist(
    (set, get) => {
      const ensureReset = (): void => {
        const s = get();
        const key = currentResetKey();
        if (s.lastResetAt !== key) {
          set({
            total: CREDIT_POLICY.baseDaily,
            todayEarned: 0,
            lastEarnedAt: 0,
            lastResetAt: key,
          } as CreditBalanceType);
        }
      };
      return {
        ...initialBalance,
        // Expose reset to UI: force reset snapshot unconditionally (idempotent)
        syncReset: (): void => {
          const key = currentResetKey();
          set({
            total: CREDIT_POLICY.baseDaily,
            todayEarned: 0,
            lastEarnedAt: 0,
            lastResetAt: key,
          } as CreditBalanceType);
        },
        onEarn: (amount?: number) => {
          ensureReset();
          const s = get();
          const now = Date.now();
          const last = s.lastEarnedAt ?? 0;
          const since = now - last;
          if (since < CREDIT_POLICY.cooldownMs) {
            return {
              canEarn: false,
              reason: 'cooldown',
              msToNext: CREDIT_POLICY.cooldownMs - since,
            } as EarnCheckResultType;
          }
          const base =
            typeof amount === 'number' && amount > 0
              ? amount
              : CREDIT_POLICY.rewardAmount;
          // Allow exceeding daily cap: earn full base amount
          const willEarn = base;
          const next: CreditBalanceType = {
            total: s.total + willEarn,
            todayEarned: s.todayEarned + willEarn,
            lastEarnedAt: now,
            lastResetAt: s.lastResetAt,
          } as CreditBalanceType;
          set(next);
          return { canEarn: true, reason: 'ok' } as EarnCheckResultType;
        },
        canSpend: (amount: number) => {
          ensureReset();
          const s = get();
          if (s.total >= amount)
            return { canSpend: true } as SpendCheckResultType;
          return {
            canSpend: false,
            shortBy: Math.max(0, amount - s.total),
          } as SpendCheckResultType;
        },
        onSpend: (amount: number) => {
          ensureReset();
          const check = get().canSpend(amount);
          if (!check.canSpend) return check;
          const s = get();
          const next: CreditBalanceType = {
            total: s.total - amount,
            todayEarned: s.todayEarned,
            lastEarnedAt: s.lastEarnedAt,
            lastResetAt: s.lastResetAt,
          } as CreditBalanceType;
          set(next);
          return { canSpend: true } as SpendCheckResultType;
        },
      };
    },
    {
      name: STORAGE_KEY,
      version: 2,
      // Important: avoid reading localStorage during SSR; JSON storage reads only in browser
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        total: s.total,
        todayEarned: s.todayEarned,
        lastEarnedAt: s.lastEarnedAt,
        lastResetAt: s.lastResetAt,
      }),
      migrate: (persisted) => persisted as CreditBalanceType,
      // Ensure midnight reset on hydration
      onRehydrateStorage: () => (state) => {
        const key = currentResetKey();
        if (!state || state.lastResetAt !== key) {
          useCreditStore.setState({
            total: CREDIT_POLICY.baseDaily,
            todayEarned: 0,
            lastEarnedAt: 0,
            lastResetAt: key,
          } as Partial<CreditBalanceType>);
        }
      },
    }
  )
);
