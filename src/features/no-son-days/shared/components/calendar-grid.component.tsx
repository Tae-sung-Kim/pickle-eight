import { NO_SON_DAYS_VIEW } from '@/features/no-son-days/constants/no-son-days-view.constant';
import type {
  NoSonDayInfoType,
  NoSonMonthType,
} from '@/features/no-son-days/types/no-son-days.type';
import { cn } from '@/lib/utils';

type NoSonDaysCalendarGridPropsType = Readonly<{
  month: NoSonMonthType;
  /** 'YYYY-MM-DD'. 없으면 오늘 표시 없음 */
  todayKey?: string;
}>;

const COLUMNS = 7;
const ROWS = 6;

function srLabel(day: NoSonDayInfoType, isToday: boolean): string {
  const { solar, lunar, weekday, isNoSonDay } = day;
  const parts = [
    isToday ? '오늘' : null,
    NO_SON_DAYS_VIEW.dateLine.solar(
      solar.month,
      solar.day,
      NO_SON_DAYS_VIEW.weekdayNames[weekday]
    ),
    NO_SON_DAYS_VIEW.dateLine.lunar(lunar.month, lunar.day, lunar.isLeapMonth),
    isNoSonDay ? NO_SON_DAYS_VIEW.calendar.legend.noSon : null,
  ];
  return parts.filter(Boolean).join(', ');
}

function DayCell({
  day,
  isToday,
}: Readonly<{ day: NoSonDayInfoType; isToday: boolean }>) {
  const { lunar, isNoSonDay } = day;
  const lunarText = `${lunar.isLeapMonth ? NO_SON_DAYS_VIEW.badge.leap : ''}${lunar.month}.${lunar.day}`;
  return (
    <td
      aria-current={isToday ? 'date' : undefined}
      className={cn(
        'h-14 rounded-md border border-border p-0.5 text-center align-middle sm:h-[72px]',
        isNoSonDay ? 'bg-menu-no-son-days/10' : 'bg-card',
        isToday && 'ring-2 ring-inset ring-foreground'
      )}
    >
      <span className="sr-only">{srLabel(day, isToday)}</span>
      <span aria-hidden="true" className="flex flex-col items-center gap-0.5">
        <span
          className={cn(
            'font-mono text-sm leading-none sm:text-base',
            isNoSonDay ? 'font-bold' : 'font-semibold'
          )}
        >
          {day.solar.day}
        </span>
        <span
          className={cn(
            'whitespace-nowrap leading-none',
            lunar.isLeapMonth ? 'text-[10px]' : 'text-[10px] sm:text-xs',
            isNoSonDay ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {lunarText}
        </span>
        <span className="flex h-4 items-center">
          {isNoSonDay && (
            <span className="whitespace-nowrap rounded-md bg-menu-no-son-days px-1 text-[10px] leading-4 text-card">
              <span className="sm:hidden">{NO_SON_DAYS_VIEW.badge.noSon}</span>
              <span className="hidden sm:inline">
                {NO_SON_DAYS_VIEW.calendar.legend.noSon}
              </span>
            </span>
          )}
        </span>
      </span>
    </td>
  );
}

export function NoSonDaysCalendarGridComponent({
  month,
  todayKey,
}: NoSonDaysCalendarGridPropsType) {
  const captionText = `${month.year}년 ${month.month}월`;
  const cells: { key: string; day: NoSonDayInfoType | null }[] = [];
  for (let i = 0; i < COLUMNS * ROWS; i += 1) {
    const day = month.days[i - month.leadingBlankCount] ?? null;
    cells.push({
      key: day && i >= month.leadingBlankCount ? day.dateKey : `blank-${i}`,
      day: i >= month.leadingBlankCount ? day : null,
    });
  }

  const rows = Array.from({ length: ROWS }, (_, r) => ({
    key: cells[r * COLUMNS].key,
    cells: cells.slice(r * COLUMNS, (r + 1) * COLUMNS),
  }));

  return (
    <table className="w-full table-fixed border-separate border-spacing-0.5">
      <caption className="sr-only">{captionText}</caption>
      <thead>
        <tr>
          {NO_SON_DAYS_VIEW.weekdays.map((w) => (
            <th
              key={w}
              scope="col"
              className="py-1 text-xs font-semibold text-muted-foreground"
            >
              {w}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const isEmptyRow = row.cells.every((c) => c.day === null);
          return (
            <tr key={row.key} aria-hidden={isEmptyRow ? true : undefined}>
              {row.cells.map(({ key, day }) =>
                day ? (
                  <DayCell
                    key={key}
                    day={day}
                    isToday={day.dateKey === todayKey}
                  />
                ) : (
                  <td key={key} className="h-14 bg-background sm:h-[72px]" />
                )
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
