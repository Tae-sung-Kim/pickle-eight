import { useCallback, useEffect, useState } from 'react';

const DAILY_LIMIT = 5;
const STORAGE_KEY = `${process.env.NEXT_PUBLIC_SITE_NAME}_quiz_daily_limit`;

type DailyLimitStateType = {
  date: string; // YYYY-MM-DD
  count: number;
};

/**
 * 오늘 날짜(로컬 기준) 반환
 */
function getToday(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

/**
 * 일일 퀴즈 제한 관리 훅
 * @returns {limit, used, canUse, useOne, reset}
 */
export function useDailyLimit(): {
  limit: number;
  used: number;
  canUse: boolean;
  useOne: () => void;
  reset: () => void;
} {
  const [state, setState] = useState<DailyLimitStateType>(() => {
    if (typeof window === 'undefined') return { date: getToday(), count: 0 };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), count: 0 };
    try {
      const parsed = JSON.parse(raw) as DailyLimitStateType;
      if (parsed.date !== getToday()) return { date: getToday(), count: 0 };
      return parsed;
    } catch {
      return { date: getToday(), count: 0 };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const useOne = useCallback(() => {
    if (state.count < DAILY_LIMIT) {
      setState((prev) => ({ ...prev, count: prev.count + 1 }));
    }
  }, [state.count]);

  const reset = useCallback(() => {
    setState({ date: getToday(), count: 0 });
  }, []);

  return {
    limit: DAILY_LIMIT,
    used: state.count,
    canUse: state.count < DAILY_LIMIT,
    useOne,
    reset,
  };
}
