import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CREDIT_POLICY, CREDIT_RESET_MODE_ENUM } from '@/constants';
import type {
  CreditBalanceType,
  CreditResetModeType,
  CreditStateType,
  CreditEarnCheckResultType,
  CreditSpendCheckResultType,
} from '@/types';

const STORAGE_KEY = process.env.NEXT_PUBLIC_SITE_NAME + '_credits:v2';

// Testing option: set NEXT_PUBLIC_CREDIT_RESET_MODE=minute to reset every minute instead of midnight.
// Default (undefined or any other value) uses midnight-based reset.
const envMode = (process.env.NEXT_PUBLIC_CREDIT_RESET_MODE || '').toLowerCase();
const RESET_MODE: CreditResetModeType =
  envMode === CREDIT_RESET_MODE_ENUM.MINUTE
    ? CREDIT_RESET_MODE_ENUM.MINUTE
    : CREDIT_RESET_MODE_ENUM.MIDNIGHT;

// Refill mode: interval(5m +5 up to cap) | midnight(only daily reset)
const REFILL_MODE = (
  process.env.NEXT_PUBLIC_CREDIT_REFILL_MODE || 'interval'
).toLowerCase();
const REFILL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const REFILL_AMOUNT = 5; // per interval

// Use KST (UTC+9) midnight as the canonical daily reset to avoid client timezone discrepancies
function todayMidnightTsKst(now: number = Date.now()): number {
  const d = new Date(now);
  const utc = d.getTime() + d.getTimezoneOffset() * 60_000; // ms since epoch in UTC
  const kst = new Date(utc + 9 * 60 * 60 * 1000); // shift to KST
  kst.setHours(0, 0, 0, 0); // midnight in KST
  // convert back to absolute epoch ms
  const kstMidnightUtc = kst.getTime() - 9 * 60 * 60 * 1000;
  return kstMidnightUtc;
}

function minuteBucketTs(now: number = Date.now()): number {
  const d = new Date(now);
  d.setSeconds(0, 0);
  return d.getTime();
}

function currentResetKey(now: number = Date.now()): number {
  return RESET_MODE === CREDIT_RESET_MODE_ENUM.MINUTE
    ? minuteBucketTs(now)
    : todayMidnightTsKst(now);
}

function fiveMinuteBucketTs(now: number = Date.now()): number {
  const d = new Date(now);
  d.setSeconds(0, 0);
  const m = d.getMinutes();
  d.setMinutes(m - (m % 5));
  return d.getTime();
}

const initialBalance: CreditBalanceType = {
  total: CREDIT_POLICY.baseDaily,
  todayEarned: 0,
  lastEarnedAt: 0,
  lastResetAt: currentResetKey(),
  overCapLocked: false,
  lastRefillAt: fiveMinuteBucketTs(),
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
            overCapLocked: false,
            lastRefillAt: fiveMinuteBucketTs(),
          } as CreditBalanceType);
        }
      };

      const ensureRefill = (): void => {
        if (REFILL_MODE !== 'interval') return;
        const s = get();
        // if already at or above cap, nothing to do
        if (s.total >= CREDIT_POLICY.dailyCap) return;
        const nowBucket = fiveMinuteBucketTs();
        const lastRefillAt = s.lastRefillAt ?? nowBucket;
        if (nowBucket <= lastRefillAt) return;
        // compute number of 5-minute buckets elapsed
        const elapsed = nowBucket - lastRefillAt;
        const steps = Math.floor(elapsed / REFILL_INTERVAL_MS);
        if (steps <= 0) return;
        const add = steps * REFILL_AMOUNT;
        const nextTotal = Math.min(CREDIT_POLICY.dailyCap, s.total + add);
        set({
          total: nextTotal,
          lastRefillAt: nowBucket,
        } as Partial<CreditBalanceType>);
      };

      return {
        ...initialBalance,
        hydrated: false,
        markHydrated: (): void => {
          if (!get().hydrated) set({ hydrated: true });
        },
        // Expose reset to UI: force reset snapshot unconditionally (idempotent)
        syncReset: (): void => {
          ensureReset();
          ensureRefill();
        },
        onEarn: (amount?: number) => {
          ensureReset();
          ensureRefill();
          const s = get();
          const now = Date.now();
          const last = s.lastEarnedAt ?? 0;
          const since = now - last;
          if (since < CREDIT_POLICY.cooldownMs) {
            return {
              canEarn: false,
              reason: 'cooldown',
              msToNext: CREDIT_POLICY.cooldownMs - since,
            } as CreditEarnCheckResultType;
          }
          const base =
            typeof amount === 'number' && amount > 0
              ? amount
              : CREDIT_POLICY.rewardAmount;
          const willEarn = base;
          const overCapCrossed =
            s.todayEarned < CREDIT_POLICY.dailyCap &&
            s.todayEarned + willEarn > CREDIT_POLICY.dailyCap;
          const next: CreditBalanceType = {
            total: Math.min(CREDIT_POLICY.dailyCap, s.total + willEarn),
            todayEarned: Math.min(
              CREDIT_POLICY.dailyCap,
              s.todayEarned + willEarn
            ),
            lastEarnedAt: now,
            lastResetAt: s.lastResetAt,
            overCapLocked: s.overCapLocked || overCapCrossed,
            lastRefillAt: s.lastRefillAt ?? fiveMinuteBucketTs(now),
          } as CreditBalanceType;
          set(next);
          return { canEarn: true, reason: 'ok' } as CreditEarnCheckResultType;
        },
        canSpend: (amount: number) => {
          ensureReset();
          ensureRefill();
          const s = get();
          if (s.total >= amount)
            return { canSpend: true } as CreditSpendCheckResultType;
          return {
            canSpend: false,
            shortBy: Math.max(0, amount - s.total),
          } as CreditSpendCheckResultType;
        },
        onSpend: (amount: number) => {
          ensureReset();
          ensureRefill();
          const check = get().canSpend(amount);
          if (!check.canSpend) return check;
          const s = get();
          const next: CreditBalanceType = {
            total: s.total - amount,
            todayEarned: s.todayEarned,
            lastEarnedAt: s.lastEarnedAt,
            lastResetAt: s.lastResetAt,
            overCapLocked: s.overCapLocked,
            lastRefillAt: s.lastRefillAt,
          } as CreditBalanceType;
          set(next);
          return { canSpend: true } as CreditSpendCheckResultType;
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
        overCapLocked: s.overCapLocked,
        lastRefillAt: s.lastRefillAt,
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
            overCapLocked: false,
            lastRefillAt: fiveMinuteBucketTs(),
          } as Partial<CreditBalanceType>);
        } else if (REFILL_MODE === 'interval') {
          // Attempt a refill immediately after hydration
          const nowBucket = fiveMinuteBucketTs();
          const lastRefillAt = state.lastRefillAt ?? nowBucket;
          if (
            nowBucket > lastRefillAt &&
            state.total < CREDIT_POLICY.dailyCap
          ) {
            const elapsed = nowBucket - lastRefillAt;
            const steps = Math.floor(elapsed / REFILL_INTERVAL_MS);
            if (steps > 0) {
              const add = steps * REFILL_AMOUNT;
              useCreditStore.setState({
                total: Math.min(CREDIT_POLICY.dailyCap, state.total + add),
                lastRefillAt: nowBucket,
              } as Partial<CreditBalanceType>);
            }
          }
        }
        // Mark as hydrated to allow UI to render final totals without flicker
        useCreditStore.setState({ hydrated: true });
      },
    }
  )
);
