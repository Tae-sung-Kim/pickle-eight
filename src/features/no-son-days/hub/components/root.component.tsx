import { NoSonDaysBottomNoticeComponent } from '@/features/no-son-days/shared/components/bottom-notice.component';
import { NoSonDaysRuleGuideComponent } from '@/features/no-son-days/shared/components/rule-guide.component';
import { NoSonDaysYearLinksComponent } from '@/features/no-son-days/shared/components/year-links.component';
import type { CalendarYmdType } from '@/types/calendar.type';
import { NoSonDaysHubTodayCalendarComponent } from './today-calendar.component';

type NoSonDaysHubPropsType = Readonly<{
  serverToday: CalendarYmdType;
}>;

export function NoSonDaysHubComponent({ serverToday }: NoSonDaysHubPropsType) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <NoSonDaysHubTodayCalendarComponent serverToday={serverToday} />
      <NoSonDaysYearLinksComponent />
      <NoSonDaysRuleGuideComponent />
      <NoSonDaysBottomNoticeComponent />
    </div>
  );
}
