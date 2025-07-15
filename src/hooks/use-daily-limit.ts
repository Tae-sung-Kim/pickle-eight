import { getTodayString } from '@/utils';
import { useCallback, useEffect, useState } from 'react';

const DAILY_LIMIT = 5;
const STORAGE_KEY = `${
  process.env.NEXT_PUBLIC_SITE_NAME
}_quiz_daily_limit:${getTodayString()}`;

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
  const [storage, setStorage] = useState<DailyLimitStorageType>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Mount 시점에 localStorage에서 데이터를 불러와 초기화하고, 오래된 데이터를 정리합니다.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // --- 오래된 데이터 정리 로직 ---
    const today = getToday();
    const prefix = `${process.env.NEXT_PUBLIC_SITE_NAME}_quiz_daily_limit:`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && !key.endsWith(today)) {
        localStorage.removeItem(key);
      }
    }
    // --- 정리 로직 끝 ---

    const raw = localStorage.getItem(STORAGE_KEY);
    let initialStorage: DailyLimitStorageType = {};

    if (raw) {
      try {
        initialStorage = JSON.parse(raw);
      } catch {
        initialStorage = {}; // 파싱 실패 시 초기화
      }
    }

    // 오늘 날짜와 맞지 않는 항목이 있다면 정리 (이중 체크)
    const updatedStorage = { ...initialStorage };
    Object.keys(updatedStorage).forEach((quizType) => {
      if (updatedStorage[quizType].date !== today) {
        delete updatedStorage[quizType];
      }
    });

    setStorage(updatedStorage);
    setIsInitialized(true);
  }, []);

  // 2. storage 상태가 변경될 때마다 localStorage에 저장합니다.
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  }, [storage, isInitialized]);

  /**
   * 일일 제한 카운트 1 증가
   */
  const addOne = useCallback(
    (quizType: string) => {
      setStorage((prev) => {
        const today = getToday();
        const entry = prev[quizType];
        const newCount = !entry || entry.date !== today ? 1 : entry.count + 1;

        if (newCount <= DAILY_LIMIT) {
          return {
            ...prev,
            [quizType]: { date: today, count: newCount },
          };
        }
        return prev; // 제한 초과 시 상태 변경 없음
      });
    },
    [] // 의존성 배열에서 storage 제거
  );

  const reset = useCallback((quizType: string) => {
    setStorage((prev) => ({
      ...prev,
      [quizType]: { date: getToday(), count: 0 },
    }));
  }, []);

  const getDailyLimitInfo = useCallback(
    (quizType: string) => {
      const entry = storage[quizType];
      const today = getToday();

      if (!entry || entry.date !== today) {
        return {
          limit: DAILY_LIMIT,
          used: 0,
          canUse: true,
        };
      }

      return {
        limit: DAILY_LIMIT,
        used: entry.count,
        canUse: entry.count < DAILY_LIMIT,
      };
    },
    [storage]
  );

  return {
    addOne,
    reset,
    getDailyLimitInfo,
    isInitialized,
  };
}
