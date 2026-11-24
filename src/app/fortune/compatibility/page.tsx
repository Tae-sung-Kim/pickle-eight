import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { FortuneCompatibilityHubComponent } from '@/features/fortune/compatibility-hub/components/root.component';
import { FORTUNE_COMPATIBILITY_HUB_FAQ } from '@/features/fortune/constants/fortune-compatibility-faq.constant';
import { FORTUNE_COMPATIBILITY_MENU_TEXTS } from '@/features/fortune/constants/fortune-compatibility-menu.constant';
import { FORTUNE_COMPATIBILITY_HUB_SEO } from '@/features/fortune/constants/fortune-compatibility-seo.constant';
import { FORTUNE_BREADCRUMB_GROUP } from '@/features/fortune/constants/fortune-seo.constant';
import { FortuneCompatibilityDisclaimerComponent } from '@/features/fortune/shared/components/compatibility-disclaimer.component';
import { FortuneDetailNoticeComponent } from '@/features/fortune/shared/components/detail-notice.component';
import { FortuneFaqComponent } from '@/features/fortune/shared/components/faq.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdFaq,
  SITE_NAME,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: FORTUNE_COMPATIBILITY_HUB_SEO.title,
  description: FORTUNE_COMPATIBILITY_HUB_SEO.description,
  pathname: FORTUNE_COMPATIBILITY_HUB_SEO.pathname,
  keywords: [...FORTUNE_COMPATIBILITY_HUB_SEO.keywords],
  ogImage: {
    alt: FORTUNE_COMPATIBILITY_HUB_SEO.ogImageAlt,
    tag: FORTUNE_COMPATIBILITY_MENU_TEXTS.label,
  },
});

export default function FortuneCompatibilityHubPage() {
  // 정적 상수만 사용한다. 동의 상태를 읽거나 쓰지 않는다.
  const crumbs = jsonLdBreadcrumb([
    { name: SITE_NAME, item: canonicalUrl('/') },
    {
      name: FORTUNE_BREADCRUMB_GROUP.name,
      item: canonicalUrl(FORTUNE_BREADCRUMB_GROUP.pathname),
    },
    {
      name: FORTUNE_COMPATIBILITY_HUB_SEO.heading,
      item: canonicalUrl(FORTUNE_COMPATIBILITY_HUB_SEO.pathname),
    },
  ]);
  const jsonLd =
    FORTUNE_COMPATIBILITY_HUB_FAQ.length > 0
      ? [crumbs, jsonLdFaq(FORTUNE_COMPATIBILITY_HUB_FAQ)]
      : [crumbs];

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.FORTUNE}>
      <JsonLdComponent data={jsonLd} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.FORTUNE}
            title={FORTUNE_COMPATIBILITY_HUB_SEO.heading}
            description={FORTUNE_COMPATIBILITY_HUB_SEO.headerDescription}
          />
          <FortuneCompatibilityDisclaimerComponent />
        </div>

        <FortuneCompatibilityHubComponent />
        <FortuneFaqComponent items={FORTUNE_COMPATIBILITY_HUB_FAQ} />
        <FortuneDetailNoticeComponent />
      </div>
    </ContentWrapperComponent>
  );
}
