import { useEffect, useState } from 'react';
import { getKoreaDateKey } from '@/lib/date';

/** 날짜 키를 다시 확인하는 간격(1분). 자정이 지나면 화면이 새 날짜로 바뀐다(AC-3) */
const REFRESH_INTERVAL_MS = 60_000;

/**
 * 한국 시간(KST) 기준 오늘 날짜 키 'YYYY-MM-DD'.
 * - 서버 렌더링·hydration과 어긋나지 않게 마운트 전에는 null이다. 부모는 null이면 결과를 그리지 않는다.
 * - 마운트 후 읽고, 1분 간격과 탭이 다시 보일 때(visibilitychange) 다시 계산한다.
 * - 값이 같으면 state가 바뀌지 않아 다시 그려지지 않는다.
 */
export function useKoreaDateKey(): string | null {
  const [dateKey, setDateKey] = useState<string | null>(null);

  useEffect(() => {
    function refresh(): void {
      setDateKey(getKoreaDateKey());
    }
    function handleVisibilityChange(): void {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    }

    refresh();
    const intervalId = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return dateKey;
}
