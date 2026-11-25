import { CalendarDays, Check } from 'lucide-react';
import { NO_SON_DAYS_VIEW } from '@/features/no-son-days/constants/no-son-days-view.constant';
import type {
  NoSonDayInfoType,
  NoSonTodayStatusType,
} from '@/features/no-son-days/types/no-son-days.type';
import { cn } from '@/lib/utils';

type NoSonDaysHubTodayStatusPropsType = Readonly<{
  status: NoSonTodayStatusType;
}>;

const VIEW = NO_SON_DAYS_VIEW;

function solarLine(day: NoSonDayInfoType): string {
  return VIEW.dateLine.solar(
    day.solar.month,
    day.solar.day,
    VIEW.weekdayNames[day.weekday]
  );
}

function lunarLine(day: NoSonDayInfoType): string {
  return VIEW.dateLine.lunar(
    day.lunar.month,
    day.lunar.day,
    day.lunar.isLeapMonth
  );
}

export function NoSonDaysHubTodayStatusComponent({
  status,
}: NoSonDaysHubTodayStatusPropsType) {
  if (status.kind === 'out-of-range') {
    return (
      <section className="rounded-panel border border-border bg-card p-4 sm:p-5 lg:self-start">
        <p className="text-base text-foreground">{VIEW.today.outOfRange}</p>
      </section>
    );
  }

  const { today, next } = status;
  return (
    <section
      className={cn(
        'rounded-panel border p-4 sm:p-5 lg:self-start',
        today.isNoSonDay
          ? 'border-menu-no-son-days bg-menu-no-son-days/10'
          : 'border-border bg-card'
      )}
    >
      <p className="text-sm text-muted-foreground">{VIEW.today.heading}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">
        {solarLine(today)}
      </p>
      <p className="text-sm text-foreground">{lunarLine(today)}</p>
      <p className="mt-2 flex items-center gap-2 text-base font-semibold text-foreground">
        {today.isNoSonDay ? VIEW.today.isNoSon : VIEW.today.isNotNoSon}
        {today.isNoSonDay && (
          <span className="inline-flex items-center gap-1 rounded-md bg-menu-no-son-days px-2 py-0.5 text-xs font-medium text-card">
            <Check aria-hidden="true" className="size-3" />
            {VIEW.calendar.legend.noSon}
          </span>
        )}
      </p>

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">{VIEW.next.heading}</p>
        {next ? (
          <>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-foreground">
              <CalendarDays
                aria-hidden="true"
                className="size-5 shrink-0 text-menu-no-son-days"
              />
              {solarLine(next.day)}
            </p>
            <p className="mt-1 flex items-center justify-between gap-2 text-sm text-foreground">
              <span>{lunarLine(next.day)}</span>
              <span className="font-semibold">
                {next.daysUntil === 1
                  ? VIEW.next.tomorrow
                  : VIEW.next.daysLater(next.daysUntil)}
              </span>
            </p>
          </>
        ) : (
          <p className="mt-1 text-base text-foreground">{VIEW.next.none}</p>
        )}
      </div>
    </section>
  );
}
