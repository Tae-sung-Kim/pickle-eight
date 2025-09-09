import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  CREDIT_POLICY,
  CREDIT_REFILL_AMOUNT,
  CREDIT_REFILL_INTERVAL_MS,
  CREDIT_RESET_MODE,
  CREDIT_RESET_MODE_ENUM,
} from '@/constants';
import type {
  CreditBalanceType,
  CreditStateType,
  CreditEarnCheckResultType,
  CreditSpendCheckResultType,
} from '@/types';

const STORAGE_KEY = process.env.NEXT_PUBLIC_SITE_NAME + '_credits:v2';

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
  return CREDIT_RESET_MODE === CREDIT_RESET_MODE_ENUM.MINUTE
    ? minuteBucketTs(now)
    : todayMidnightTsKst(now);
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
          const next: CreditBalanceType = {
            total: newTotal,
            todayEarned: s.todayEarned,
            lastEarnedAt: s.lastEarnedAt,
            lastResetAt: s.lastResetAt,
            overCapLocked: s.overCapLocked,
            // 소비 시점부터 경과시간 기준 카운트다운 시작
            lastRefillAt: newTotal < CREDIT_POLICY.dailyCap ? now : 0,
            refillArmed: newTotal < CREDIT_POLICY.dailyCap ? true : false,
          } as CreditBalanceType;
          set(next);
          return { canSpend: true } as CreditSpendCheckResultType;
        },
      };
    },
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        total: s.total,
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
        return {
          ...p,
          // 이전 데이터의 lastRefillAt이 버킷 시각이었다면 0으로 초기화하여 시간 기반 로직으로 전환
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
        } else if (CREDIT_REFILL_INTERVAL_MS > 0) {
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
