import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { NO_SON_DAYS_HUB_PATH } from '@/features/no-son-days/constants/no-son-days-route.constant';
import { NO_SON_DAYS_SEO } from '@/features/no-son-days/constants/no-son-days-seo.constant';
import { NO_SON_DAYS_VIEW } from '@/features/no-son-days/constants/no-son-days-view.constant';
import { NoSonDaysHubComponent } from '@/features/no-son-days/hub/components/root.component';
import { NoSonDaysBreadcrumbComponent } from '@/features/no-son-days/shared/components/breadcrumb.component';
import { NoSonDaysDisclaimerNoticeComponent } from '@/features/no-son-days/shared/components/disclaimer-notice.component';
import { buildNoSonDaysBreadcrumb } from '@/features/no-son-days/utils/no-son-days-seo.util';
import { getKoreaYmd } from '@/lib/date';
import { buildMetadata, jsonLdBreadcrumb } from '@/lib/seo';

/** 1시간마다 서버 기준 오늘을 다시 계산한다 */
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: NO_SON_DAYS_SEO.hub.title,
  description: NO_SON_DAYS_SEO.hub.description,
  pathname: NO_SON_DAYS_HUB_PATH,
  keywords: [...NO_SON_DAYS_SEO.hub.keywords],
  ogImage: { alt: NO_SON_DAYS_SEO.hub.ogAlt },
});

export default function NoSonDaysPage() {
  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.NO_SON_DAYS}>
      <JsonLdComponent
        data={jsonLdBreadcrumb([...buildNoSonDaysBreadcrumb()])}
      />
      <div className="px-4 py-8">
        <NoSonDaysBreadcrumbComponent />
        <TitleWrapperComponent
          type={MENU_GROUP_NAME_ENUM.NO_SON_DAYS}
          title={NO_SON_DAYS_VIEW.hub.title}
          description={NO_SON_DAYS_VIEW.hub.description}
        />
        <NoSonDaysDisclaimerNoticeComponent />
        <NoSonDaysHubComponent serverToday={getKoreaYmd()} />
      </div>
    </ContentWrapperComponent>
  );
}
