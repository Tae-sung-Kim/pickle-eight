import Link from 'next/link';
import { NO_SON_DAYS_HUB_PATH } from '@/features/no-son-days/constants/no-son-days-route.constant';
import { NO_SON_DAYS_VIEW } from '@/features/no-son-days/constants/no-son-days-view.constant';
import { getNoSonDaysYears } from '@/features/no-son-days/utils/no-son-days.util';
import { cn } from '@/lib/utils';

type NoSonDaysYearLinksPropsType = Readonly<{
  /** 연도 화면에서 현재 연도. 링크 대신 현재 표시 */
  currentYear?: number;
}>;

const ITEM_CLASS =
  'flex h-11 items-center justify-center rounded-lg border text-sm';

export function NoSonDaysYearLinksComponent({
  currentYear,
}: NoSonDaysYearLinksPropsType) {
  return (
    <section className="mx-auto mt-10 w-full max-w-5xl">
      <h2 className="mb-3 text-xl font-bold leading-snug">
        {NO_SON_DAYS_VIEW.yearLinks.heading}
      </h2>
      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {getNoSonDaysYears().map((year) => (
          <li key={year}>
            {year === currentYear ? (
              <span
                aria-current="page"
                className={cn(
                  ITEM_CLASS,
                  'border-menu-no-son-days bg-menu-no-son-days/10 font-bold'
                )}
              >
                {year}
              </span>
            ) : (
              <Link
                href={`${NO_SON_DAYS_HUB_PATH}/${year}`}
                aria-label={NO_SON_DAYS_VIEW.year.title(year)}
                className={cn(
                  ITEM_CLASS,
                  'border-border bg-card text-foreground transition-colors hover:bg-menu-no-son-days/10'
                )}
              >
                {year}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
