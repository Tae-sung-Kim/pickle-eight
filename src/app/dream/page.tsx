import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { DREAM_HUB_FAQ } from '@/features/dream/constants/dream-faq.constant';
import { DREAM_HUB_DESCRIPTION } from '@/features/dream/constants/dream-notice.constant';
import {
  DREAM_HUB_SEO,
  DREAM_METADATA_CATEGORY,
} from '@/features/dream/constants/dream-seo.constant';
import { DREAM_TOPICS } from '@/features/dream/constants/dream-topics.constant';
import { DreamHubDetailNoticeComponent } from '@/features/dream/hub/components/detail-notice.component';
import { DreamHubNoscriptNoticeComponent } from '@/features/dream/hub/components/noscript-notice.component';
import { DreamHubComponent } from '@/features/dream/hub/components/root.component';
import { DreamBasisNoticeComponent } from '@/features/dream/shared/components/basis-notice.component';
import { DreamBreadcrumbComponent } from '@/features/dream/shared/components/breadcrumb.component';
import { DreamCrisisPhonesComponent } from '@/features/dream/shared/components/crisis-phones.component';
import { DreamDisclaimerNoticeComponent } from '@/features/dream/shared/components/disclaimer-notice.component';
import { DreamFaqComponent } from '@/features/dream/shared/components/faq.component';
import {
  buildDreamHubGroups,
  buildDreamSearchItems,
} from '@/features/dream/utils/dream-topic.util';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdFaq,
  SITE_NAME,
} from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: DREAM_HUB_SEO.title,
    description: DREAM_HUB_SEO.description,
    pathname: DREAM_HUB_SEO.pathname,
    keywords: [...DREAM_HUB_SEO.keywords],
    ogImage: { alt: DREAM_HUB_SEO.ogImageAlt },
  }),
  // 루트 레이아웃 category에 "로또"가 들어 있어 덮어쓴다
  category: DREAM_METADATA_CATEGORY,
};

export default function DreamHubPage() {
  const groups = buildDreamHubGroups(buildDreamSearchItems(DREAM_TOPICS));

  const crumbs = jsonLdBreadcrumb([
    { name: SITE_NAME, item: canonicalUrl('/') },
    { name: DREAM_HUB_SEO.heading, item: canonicalUrl(DREAM_HUB_SEO.pathname) },
  ]);
  const jsonLd =
    DREAM_HUB_FAQ.length > 0 ? [crumbs, jsonLdFaq(DREAM_HUB_FAQ)] : crumbs;

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.DREAM}>
      <JsonLdComponent data={jsonLd} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <DreamBreadcrumbComponent
            items={[
              { label: SITE_NAME, href: '/' },
              { label: DREAM_HUB_SEO.heading },
            ]}
          />
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.DREAM}
            title={DREAM_HUB_SEO.heading}
            description={DREAM_HUB_DESCRIPTION}
          />
          <DreamDisclaimerNoticeComponent />
          <DreamHubNoscriptNoticeComponent />
        </div>

        <DreamHubComponent groups={groups} />

        <div className="space-y-10 border-t border-border pt-10">
          <DreamBasisNoticeComponent />
          <DreamHubDetailNoticeComponent />
          <DreamFaqComponent items={DREAM_HUB_FAQ} />
          <DreamCrisisPhonesComponent />
        </div>
      </div>
    </ContentWrapperComponent>
  );
}
