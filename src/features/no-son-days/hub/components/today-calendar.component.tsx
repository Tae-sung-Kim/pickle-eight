'use client';

import { NoSonDaysCalendarComponent } from '@/features/no-son-days/shared/components/calendar.component';
import {
  getNoSonInitialMonth,
  getNoSonTodayStatus,
} from '@/features/no-son-days/utils/no-son-days.util';
import { toDateKey } from '@/lib/date';
import type { CalendarYmdType } from '@/types/calendar.type';
import { useKoreaToday } from '../hooks/use-korea-today.hook';
import { NoSonDaysHubTodayStatusComponent } from './today-status.component';

type NoSonDaysHubTodayCalendarPropsType = Readonly<{
  serverToday: CalendarYmdType;
}>;

export function NoSonDaysHubTodayCalendarComponent({
  serverToday,
}: NoSonDaysHubTodayCalendarPropsType) {
  const today = useKoreaToday(serverToday);
  const status = getNoSonTodayStatus(today);

  return (
    <div className="space-y-8 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8 lg:space-y-0">
      <NoSonDaysHubTodayStatusComponent status={status} />
      <NoSonDaysCalendarComponent
        initialMonth={getNoSonInitialMonth(today)}
        todayKey={toDateKey(today)}
        syncToday
      />
    </div>
  );
}
