import { useCallback, useEffect, useState } from 'react';

const DAILY_LIMIT = 5;
const STORAGE_KEY = `${process.env.NEXT_PUBLIC_SITE_NAME}_quiz_daily_limit`;

type DailyLimitStateType = {
  date: string;
  count: number;
};

type DailyLimitStorageType = {
  [quizType: string]: DailyLimitStateType;
};

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 일일 퀴즈 제한 관리 훅 (localStorage 키 하나에 여러 퀴즈 타입의 제한을 관리)
 */
export function useDailyLimit() {
  const [storage, setStorage] = useState<DailyLimitStorageType>(() => {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  }, [storage]);

  const getDailyLimitState = useCallback(
    (quizType: string) => {
      const entry = storage[quizType];
      if (!entry || entry.date !== getToday())
        return { date: getToday(), count: 0 };
      return entry;
    },
    [storage]
  );

  /**
   * 일일 제한 카운트 1 증가
   */
  const addOne = useCallback(
    (quizType: string) => {
      const entry = getDailyLimitState(quizType);
      if (entry.count < DAILY_LIMIT) {
        setStorage((prev) => ({
          ...prev,
          [quizType]: { ...entry, count: entry.count + 1 },
        }));
      }
    },
    [getDailyLimitState]
  );

  const reset = useCallback((quizType: string) => {
    setStorage((prev) => ({
      ...prev,
      [quizType]: { date: getToday(), count: 0 },
    }));
  }, []);

  const getDailyLimitInfo = useCallback(
    (quizType: string) => {
      const entry = getDailyLimitState(quizType);
      return {
        limit: DAILY_LIMIT,
        used: entry.count,
        canUse: entry.count < DAILY_LIMIT,
      };
    },
    [getDailyLimitState]
  );

  return {
    addOne,
    reset,
    getDailyLimitInfo,
  };
}
