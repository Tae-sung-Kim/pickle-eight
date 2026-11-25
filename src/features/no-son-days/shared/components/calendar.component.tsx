'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NO_SON_DAYS_VIEW } from '@/features/no-son-days/constants/no-son-days-view.constant';
import { useCalendarMonth } from '@/features/no-son-days/shared/hooks/use-calendar-month.hook';
import type { NoSonMonthCursorType } from '@/features/no-son-days/types/no-son-days.type';
import { buildNoSonMonth } from '@/features/no-son-days/utils/no-son-days.util';
import { getKoreaYmd, toDateKey } from '@/lib/date';
import { cn } from '@/lib/utils';
import { NoSonDaysCalendarGridComponent } from './calendar-grid.component';

type NoSonDaysCalendarPropsType = Readonly<{
  initialMonth: NoSonMonthCursorType;
  /**
   * 'YYYY-MM-DD'. 주면 그 날을 오늘로 표시한다(허브).
   * 없으면 마운트 후 기기 날짜로 오늘 칸을 표시한다(연도 화면, 정적 HTML)
   */
  todayKey?: string;
  /** 월 제목 제목 수준. 기본 h2, 연도 화면은 h3 */
  headingLevel?: 'h2' | 'h3';
  /** 처음 달 보정(허브만). 값이 바뀌고 사용자가 아직 이동 안 했을 때만 커서를 옮긴다 */
  syncToday?: boolean;
}>;

export function NoSonDaysCalendarComponent({
  initialMonth,
  todayKey,
  headingLevel = 'h2',
  syncToday = false,
}: NoSonDaysCalendarPropsType) {
  const {
    cursor,
    canPrev,
    canNext,
    prev,
    next,
    syncToday: dispatchSync,
  } = useCalendarMonth(initialMonth);
  const [mountedTodayKey, setMountedTodayKey] = useState<string | undefined>();

  useEffect(() => {
    if (todayKey === undefined) setMountedTodayKey(toDateKey(getKoreaYmd()));
  }, [todayKey]);

  const { year: initYear, month: initMonth } = initialMonth;
  // biome-ignore lint/correctness/useExhaustiveDependencies: 처음 달 값이 바뀔 때만 보정
  useEffect(() => {
    if (syncToday) dispatchSync({ year: initYear, month: initMonth, day: 1 });
  }, [syncToday, initYear, initMonth]);

  const month = buildNoSonMonth(cursor.year, cursor.month);
  if (!month) return null;

  const Heading = headingLevel;
  const noSonDayNumbers = month.days
    .filter((d) => d.isNoSonDay)
    .map((d) => d.solar.day);

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          aria-label={NO_SON_DAYS_VIEW.calendar.prev}
          aria-disabled={!canPrev}
          onClick={() => {
            if (canPrev) prev();
          }}
          className={cn('size-11 rounded-lg', !canPrev && 'opacity-40')}
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </Button>
        <Heading aria-live="polite" className="text-lg font-bold">
          {cursor.year}년 {cursor.month}월
        </Heading>
        <Button
          type="button"
          variant="outline"
          aria-label={NO_SON_DAYS_VIEW.calendar.next}
          aria-disabled={!canNext}
          onClick={() => {
            if (canNext) next();
          }}
          className={cn('size-11 rounded-lg', !canNext && 'opacity-40')}
        >
          <ChevronRight aria-hidden="true" className="size-5" />
        </Button>
      </div>

      <NoSonDaysCalendarGridComponent
        month={month}
        todayKey={todayKey ?? mountedTodayKey}
      />

      <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1">
          <span
            aria-hidden="true"
            className="rounded-md bg-menu-no-son-days px-1 text-[10px] leading-4 text-card"
          >
            {NO_SON_DAYS_VIEW.badge.noSon}
          </span>
          {NO_SON_DAYS_VIEW.calendar.legend.noSon}
        </li>
        <li className="flex items-center gap-1">
          <span
            aria-hidden="true"
            className="size-4 rounded-sm ring-2 ring-inset ring-foreground"
          />
          {NO_SON_DAYS_VIEW.calendar.legend.today}
        </li>
        <li>{NO_SON_DAYS_VIEW.calendar.legend.note}</li>
      </ul>

      <p className="mt-2 text-sm text-foreground">
        {NO_SON_DAYS_VIEW.calendar.monthSummary(cursor.month, noSonDayNumbers)}
      </p>
    </section>
  );
}
