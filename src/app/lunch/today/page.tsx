import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { LUNCH_FAQ } from '@/features/lunch/constants/lunch-faq.constant';
import { LUNCH_PAGE_DESCRIPTION } from '@/features/lunch/constants/lunch-notice.constant';
import {
  LUNCH_BREADCRUMB,
  LUNCH_HUB_SEO,
} from '@/features/lunch/constants/lunch-seo.constant';
import { LunchTodayDisclaimerNoticeComponent } from '@/features/lunch/today/components/disclaimer-notice.component';
import { LunchTodayFaqComponent } from '@/features/lunch/today/components/faq.component';
import { LunchTodayIntroComponent } from '@/features/lunch/today/components/intro.component';
import { LunchTodayNoscriptNoticeComponent } from '@/features/lunch/today/components/noscript-notice.component';
import { LunchTodayRandomNoticeComponent } from '@/features/lunch/today/components/random-notice.component';
import { LunchTodayComponent } from '@/features/lunch/today/components/root.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdFaq,
  SITE_NAME,
} from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: LUNCH_HUB_SEO.title,
    description: LUNCH_HUB_SEO.description,
    pathname: LUNCH_HUB_SEO.pathname,
    keywords: [...LUNCH_HUB_SEO.keywords],
    ogImage: { alt: LUNCH_HUB_SEO.ogImageAlt },
  }),
};

export default function LunchTodayPage() {
  const jsonLd = [
    jsonLdBreadcrumb([
      { name: SITE_NAME, item: canonicalUrl('/') },
      {
        name: LUNCH_BREADCRUMB.group.name,
        item: canonicalUrl(LUNCH_BREADCRUMB.group.pathname),
      },
      {
        name: LUNCH_BREADCRUMB.page.name,
        item: canonicalUrl(LUNCH_BREADCRUMB.page.pathname),
      },
    ]),
    jsonLdFaq(LUNCH_FAQ),
  ];

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.LUNCH}>
      <JsonLdComponent data={jsonLd} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.LUNCH}
            title={LUNCH_HUB_SEO.heading}
            description={LUNCH_PAGE_DESCRIPTION}
          />
          <LunchTodayDisclaimerNoticeComponent />
          <LunchTodayNoscriptNoticeComponent />
        </div>

        <LunchTodayComponent />

        <div className="space-y-10 border-t border-border pt-10">
          <LunchTodayIntroComponent />
          <LunchTodayRandomNoticeComponent />
          <LunchTodayFaqComponent />
        </div>
      </div>
    </ContentWrapperComponent>
  );
}
