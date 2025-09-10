import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  CREDIT_POLICY,
  CREDIT_REFILL_AMOUNT,
  CREDIT_REFILL_INTERVAL_MS,
} from '@/constants';
import type {
  CreditBalanceType,
  CreditStateType,
  CreditEarnCheckResultType,
  CreditSpendCheckResultType,
} from '@/types';
import { currentResetKey } from '@/utils';

const STORAGE_KEY = process.env.NEXT_PUBLIC_SITE_NAME + '_credits:v2';

// Helper: read consent state from localStorage (client-only)
function isConsentAccepted(): boolean {
  if (typeof window === 'undefined') return true; // SSR 안전장치: 클라이언트에서만 제한
  try {
    const key =
      (process.env.NEXT_PUBLIC_SITE_NAME || '') + '_cookie_consent_v1';
    const v = localStorage.getItem(key);
    return v === 'accepted';
  } catch {
    return false;
  }
}

const initialBalance: CreditBalanceType = {
  total: CREDIT_POLICY.baseDaily,
  todayEarned: 0,
  lastEarnedAt: 0,
  lastResetAt: currentResetKey(),
  overCapLocked: false,
  // 시간 경과 기반 리필: 마지막 리필(또는 무장 시작) 시각(ms). 0이면 비활성/초기 상태.
  lastRefillAt: 0,
  refillArmed: false,
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
            lastRefillAt: 0, // 자정 리셋 시 타이머 초기화
            refillArmed: false,
          } as CreditBalanceType);
        }
      };

      const ensureRefill = (): void => {
        // interval 값이 0이면 리필 비활성
        if (CREDIT_REFILL_INTERVAL_MS <= 0) return;
        // 동의 미수락 상태이면 리필 정지 (freeze). 일일 리셋은 별도 로직으로 유지.
        if (!isConsentAccepted()) return;
        const s = get();
        // '소비 이후'에만 동작, 상한에서는 동작하지 않음
        if (!s.refillArmed || s.total >= CREDIT_POLICY.dailyCap) return;
        const lastAt = s.lastRefillAt || 0;
        if (lastAt <= 0) return; // 아직 무장 시작 시간이 없음
        const now = Date.now();
        const elapsed = now - lastAt;
        if (elapsed < CREDIT_REFILL_INTERVAL_MS) return;
        const steps = Math.floor(elapsed / CREDIT_REFILL_INTERVAL_MS);
        if (steps <= 0) return;
        const add = steps * CREDIT_REFILL_AMOUNT;
        const nextTotal = Math.min(CREDIT_POLICY.dailyCap, s.total + add);
        const backToCap = nextTotal >= CREDIT_POLICY.dailyCap;
        // 다음 기준 시각: lastAt + steps*interval (정확히 경계 정렬)
        const nextLastAt = lastAt + steps * CREDIT_REFILL_INTERVAL_MS;
        set({
          total: nextTotal,
          lastRefillAt: backToCap ? 0 : nextLastAt,
          refillArmed: backToCap ? false : s.refillArmed,
        } as Partial<CreditBalanceType>);
      };

      return {
        ...initialBalance,
        hydrated: false,
        markHydrated: (): void => {
          if (!get().hydrated) set({ hydrated: true });
        },
        syncReset: (): void => {
          ensureReset();
          ensureRefill();
        },
        setTotal: (total: number): void => {
          const clamped = Math.max(0, Math.min(CREDIT_POLICY.dailyCap, total));
          set({ total: clamped } as Partial<CreditBalanceType>);
        },
        setServerSync: (p: {
          credits: number;
          lastRefillAt?: number;
          refillArmed?: boolean;
        }): void => {
          const clamped = Math.max(
            0,
            Math.min(CREDIT_POLICY.dailyCap, p.credits)
          );
          set({
            total: clamped,
            lastRefillAt:
              typeof p.lastRefillAt === 'number' ? p.lastRefillAt : 0,
            refillArmed:
              typeof p.refillArmed === 'boolean' ? p.refillArmed : false,
          } as Partial<CreditBalanceType>);
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
          const newTotal = Math.min(CREDIT_POLICY.dailyCap, s.total + willEarn);
          const next: CreditBalanceType = {
            total: newTotal,
            todayEarned: Math.min(
              CREDIT_POLICY.dailyCap,
              s.todayEarned + willEarn
            ),
            lastEarnedAt: now,
            lastResetAt: s.lastResetAt,
            overCapLocked: s.overCapLocked || overCapCrossed,
            // 상한 도달 시 타이머/무장 해제
            lastRefillAt:
              newTotal >= CREDIT_POLICY.dailyCap ? 0 : s.lastRefillAt,
            refillArmed:
              newTotal >= CREDIT_POLICY.dailyCap ? false : s.refillArmed,
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
          const now = Date.now();
          const newTotal = s.total - amount;
          // Determine next refill timer state:
          // - If at or above cap after spending: disable timer (0/false)
          // - If below cap: arm timer only if not already armed; otherwise preserve existing base time
          const fallingBelowCap = newTotal < CREDIT_POLICY.dailyCap;
          const shouldArmNow = fallingBelowCap && !s.refillArmed;
          const nextLastRefillAt = fallingBelowCap
            ? shouldArmNow
              ? now
              : s.lastRefillAt || now // safety: if persisted value missing, initialize once
            : 0;
          const nextRefillArmed = fallingBelowCap ? true : false;
          const next: CreditBalanceType = {
            total: newTotal,
            todayEarned: s.todayEarned,
            lastEarnedAt: s.lastEarnedAt,
            lastResetAt: s.lastResetAt,
            overCapLocked: s.overCapLocked,
            lastRefillAt: nextLastRefillAt,
            refillArmed: nextRefillArmed,
          } as CreditBalanceType;
          set(next);
          return { canSpend: true } as CreditSpendCheckResultType;
        },
        revokeTodaysEarned: (): void => {
          ensureReset();
          const s = get();
          const reduceBy = Math.min(s.todayEarned, s.total);
          if (reduceBy <= 0) return;
          set({
            total: Math.max(0, s.total - reduceBy),
            todayEarned: 0,
          } as Partial<CreditBalanceType>);
        },
      };
    },
    {
      name: STORAGE_KEY,
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        todayEarned: s.todayEarned,
        lastEarnedAt: s.lastEarnedAt,
        lastResetAt: s.lastResetAt,
        overCapLocked: s.overCapLocked,
        lastRefillAt: s.lastRefillAt,
        refillArmed: s.refillArmed,
      }),
      migrate: (persisted) => {
        const p = persisted as Partial<CreditBalanceType>;
        const hasArmed: boolean = typeof p.refillArmed === 'boolean';
        const hasTotal: boolean = typeof p.total === 'number';
        const refillArmed: boolean = hasArmed
          ? (p.refillArmed as boolean)
          : hasTotal
          ? (p.total as number) < CREDIT_POLICY.dailyCap
          : false;
        // Clamp and lift logic
        const key = currentResetKey();
        const rawTotal =
          typeof p.total === 'number' ? p.total : CREDIT_POLICY.baseDaily;
        // Hard clamp total into [0, cap]
        let total = Math.min(CREDIT_POLICY.dailyCap, Math.max(0, rawTotal));
        const todayEarned =
          typeof p.todayEarned === 'number' ? p.todayEarned : 0;
        const sameDay =
          typeof p.lastResetAt === 'number' && p.lastResetAt === key;
        // If same reset bucket and user hasn't earned today (i.e., fresh day for this store)
        // and total is below new baseDaily (e.g., env cap changed upward), lift to baseDaily.
        if (sameDay && todayEarned === 0 && total < CREDIT_POLICY.baseDaily) {
          total = CREDIT_POLICY.baseDaily;
        }
        return {
          ...p,
          total,
          lastRefillAt: typeof p.lastRefillAt === 'number' ? p.lastRefillAt : 0,
          refillArmed,
        } as CreditBalanceType;
      },
      onRehydrateStorage: () => (state) => {
        const key = currentResetKey();
        if (!state || state.lastResetAt !== key) {
          useCreditStore.setState({
            total: CREDIT_POLICY.baseDaily,
            todayEarned: 0,
            lastEarnedAt: 0,
            lastResetAt: key,
            overCapLocked: false,
            lastRefillAt: 0,
            refillArmed: false,
          } as Partial<CreditBalanceType>);
        } else if (CREDIT_REFILL_INTERVAL_MS > 0 && isConsentAccepted()) {
          // 소급 리필: 'armed'이고 상한 미만인 경우 경과 시간만큼 즉시 반영
          const s = useCreditStore.getState();
          const lastAt = s.lastRefillAt || 0;
          if (lastAt > 0 && s.refillArmed && s.total < CREDIT_POLICY.dailyCap) {
            const now = Date.now();
            const elapsed = now - lastAt;
            const steps = Math.floor(elapsed / CREDIT_REFILL_INTERVAL_MS);
            if (steps > 0) {
              const add = steps * CREDIT_REFILL_AMOUNT;
              const nextTotal = Math.min(CREDIT_POLICY.dailyCap, s.total + add);
              useCreditStore.setState({
                total: nextTotal,
                lastRefillAt:
                  nextTotal >= CREDIT_POLICY.dailyCap
                    ? 0
                    : lastAt + steps * CREDIT_REFILL_INTERVAL_MS,
                refillArmed:
                  nextTotal >= CREDIT_POLICY.dailyCap ? false : s.refillArmed,
              } as Partial<CreditBalanceType>);
            }
          }
        }
        useCreditStore.setState({ hydrated: true });
      },
    }
  )
);
