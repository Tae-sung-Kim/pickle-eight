import { NO_SON_DAYS_VIEW } from '@/features/no-son-days/constants/no-son-days-view.constant';
import type { NoSonYearType } from '@/features/no-son-days/types/no-son-days.type';

type NoSonDaysYearMonthListPropsType = Readonly<{
  year: NoSonYearType;
}>;

export function NoSonDaysYearMonthListComponent({
  year,
}: NoSonDaysYearMonthListPropsType) {
  const { dateLine, monthCard, weekdayNames } = NO_SON_DAYS_VIEW;

  return (
    <ul className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {year.months.map(({ month, noSonDays }) => (
        <li
          key={month}
          id={`month-${month}`}
          className="scroll-mt-52 rounded-panel border border-border bg-card p-4"
        >
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">{monthCard.title(month)}</h2>
            <span className="text-xs text-muted-foreground">
              {monthCard.count(noSonDays.length)}
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-2">
            {noSonDays.map((info) => (
              <li
                key={info.dateKey}
                className="rounded-md bg-menu-no-son-days/10 px-2 py-2 text-foreground"
              >
                <p className="text-sm font-semibold">
                  {info.solar.day}일 ({weekdayNames[info.weekday].slice(0, 1)})
                </p>
                <p className="text-xs">
                  {dateLine.lunar(
                    info.lunar.month,
                    info.lunar.day,
                    info.lunar.isLeapMonth
                  )}
                </p>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
