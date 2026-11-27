import Link from 'next/link';
import { CollapsibleComponent } from '@/components/common/collapsible.component';
import { NO_SON_DAYS_HUB_PATH } from '@/features/no-son-days/constants/no-son-days-route.constant';
import { NO_SON_DAYS_VIEW } from '@/features/no-son-days/constants/no-son-days-view.constant';
import { NoSonDaysBottomNoticeComponent } from '@/features/no-son-days/shared/components/bottom-notice.component';
import { NoSonDaysCalendarComponent } from '@/features/no-son-days/shared/components/calendar.component';
import { NoSonDaysRuleGuideComponent } from '@/features/no-son-days/shared/components/rule-guide.component';
import { NoSonDaysYearLinksComponent } from '@/features/no-son-days/shared/components/year-links.component';
import type { NoSonYearType } from '@/features/no-son-days/types/no-son-days.type';
import { NoSonDaysMonthJumpNavComponent } from './month-jump-nav.component';
import { NoSonDaysYearMonthListComponent } from './month-list.component';

type NoSonDaysYearPropsType = Readonly<{
  year: NoSonYearType;
}>;

export function NoSonDaysYearComponent({ year }: NoSonDaysYearPropsType) {
  return (
    <>
      <NoSonDaysMonthJumpNavComponent />
      <NoSonDaysYearMonthListComponent year={year} />

      <section className="mx-auto mt-10 w-full max-w-5xl">
        <CollapsibleComponent
          heading={NO_SON_DAYS_VIEW.year.calendarHeading}
          level={2}
        >
          <NoSonDaysCalendarComponent
            initialMonth={{ year: year.year, month: 1 }}
            headingLevel="h3"
          />
        </CollapsibleComponent>
      </section>

      <NoSonDaysYearLinksComponent currentYear={year.year} />
      <div className="mx-auto mt-4 w-full max-w-5xl">
        <Link
          href={NO_SON_DAYS_HUB_PATH}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {NO_SON_DAYS_VIEW.backToHub}
        </Link>
      </div>

      <NoSonDaysRuleGuideComponent />
      <NoSonDaysBottomNoticeComponent />
    </>
  );
}
