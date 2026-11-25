'use client';

import { useEffect, useState } from 'react';
import { getKoreaYmd } from '@/lib/date';
import type { CalendarYmdType } from '@/types/calendar.type';

/**
 * 첫 렌더는 서버 기준 오늘. 마운트 후 기기 시각으로 다시 읽어 다르면 바꾼다.
 * hydration 오류를 막기 위해 기기 날짜는 effect 안에서만 읽는다.
 */
export function useKoreaToday(serverToday: CalendarYmdType): CalendarYmdType {
  const [today, setToday] = useState<CalendarYmdType>(serverToday);

  useEffect(() => {
    const now = getKoreaYmd();
    setToday((prev) =>
      prev.year === now.year && prev.month === now.month && prev.day === now.day
        ? prev
        : now
    );
  }, []);

  return today;
}
