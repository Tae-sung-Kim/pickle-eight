import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { FORTUNE_HUB_FAQ } from '@/features/fortune/constants/fortune-faq.constant';
import {
  FORTUNE_BREADCRUMB_GROUP,
  FORTUNE_HUB_SEO,
} from '@/features/fortune/constants/fortune-seo.constant';
import {
  FortuneHubComponent,
  getFortuneHubItems,
} from '@/features/fortune/hub/components/root.component';
import { FortuneDetailNoticeComponent } from '@/features/fortune/shared/components/detail-notice.component';
import { FortuneDisclaimerNoticeComponent } from '@/features/fortune/shared/components/disclaimer-notice.component';
import { FortuneFaqComponent } from '@/features/fortune/shared/components/faq.component';
import { FortuneResultNoticeComponent } from '@/features/fortune/shared/components/result-notice.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdFaq,
  SITE_NAME,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: FORTUNE_HUB_SEO.title,
  description: FORTUNE_HUB_SEO.description,
  pathname: FORTUNE_HUB_SEO.pathname,
  keywords: [...FORTUNE_HUB_SEO.keywords],
  ogImage: { alt: FORTUNE_HUB_SEO.ogImageAlt },
});

export default function FortuneHubPage() {
  // 정적 상수만 사용한다. 동의 상태를 읽거나 쓰지 않는다(AC-83).
  const items = getFortuneHubItems();

  const crumbs = jsonLdBreadcrumb([
    { name: SITE_NAME, item: canonicalUrl('/') },
    {
      name: FORTUNE_BREADCRUMB_GROUP.name,
      item: canonicalUrl(FORTUNE_BREADCRUMB_GROUP.pathname),
    },
  ]);
  // 로또 허브와 같은 ItemList 형식
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.label,
      url: canonicalUrl(it.href),
      description: it.description,
    })),
  };
  const jsonLd =
    FORTUNE_HUB_FAQ.length > 0
      ? [crumbs, itemList, jsonLdFaq(FORTUNE_HUB_FAQ)]
      : [crumbs, itemList];

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.FORTUNE}>
      <JsonLdComponent data={jsonLd} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.FORTUNE}
            title={FORTUNE_HUB_SEO.heading}
            description={FORTUNE_HUB_SEO.headerDescription}
          />
          <FortuneDisclaimerNoticeComponent />
        </div>

        <FortuneHubComponent />
        <FortuneFaqComponent items={FORTUNE_HUB_FAQ} />
        <FortuneResultNoticeComponent />
        <FortuneDetailNoticeComponent />
      </div>
    </ContentWrapperComponent>
  );
}
