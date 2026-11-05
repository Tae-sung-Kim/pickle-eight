import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { TAROT_THREE_CARD_FAQ } from '@/features/tarot/constants/tarot-faq.constant';
import {
  TAROT_BREADCRUMB_GROUP,
  TAROT_THREE_CARD_SEO,
} from '@/features/tarot/constants/tarot-seo.constant';
import { TarotDetailNoticeComponent } from '@/features/tarot/shared/components/detail-notice.component';
import { TarotDisclaimerNoticeComponent } from '@/features/tarot/shared/components/disclaimer-notice.component';
import { TarotFaqComponent } from '@/features/tarot/shared/components/faq.component';
import { TarotNoscriptNoticeComponent } from '@/features/tarot/shared/components/noscript-notice.component';
import { TarotResultNoticeComponent } from '@/features/tarot/shared/components/result-notice.component';
import { TarotThreeCardGuideComponent } from '@/features/tarot/three-card/components/guide.component';
import { TarotThreeCardComponent } from '@/features/tarot/three-card/components/root.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdFaq,
  SITE_NAME,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: TAROT_THREE_CARD_SEO.title,
  description: TAROT_THREE_CARD_SEO.description,
  pathname: TAROT_THREE_CARD_SEO.pathname,
  keywords: [...TAROT_THREE_CARD_SEO.keywords],
  ogImage: { alt: TAROT_THREE_CARD_SEO.ogImageAlt },
});

export default function TarotThreeCardPage() {
  // 정적 상수만 사용한다. 사용자 입력은 JSON-LD에 넣지 않는다.
  const crumbs = jsonLdBreadcrumb([
    { name: SITE_NAME, item: canonicalUrl('/') },
    {
      name: TAROT_BREADCRUMB_GROUP.name,
      item: canonicalUrl(TAROT_BREADCRUMB_GROUP.pathname),
    },
    {
      name: TAROT_THREE_CARD_SEO.heading,
      item: canonicalUrl(TAROT_THREE_CARD_SEO.pathname),
    },
  ]);
  const jsonLd =
    TAROT_THREE_CARD_FAQ.length > 0
      ? [crumbs, jsonLdFaq(TAROT_THREE_CARD_FAQ)]
      : crumbs;

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.TAROT}>
      <JsonLdComponent data={jsonLd} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.TAROT}
            title={TAROT_THREE_CARD_SEO.heading}
            description={TAROT_THREE_CARD_SEO.headerDescription}
          />
          <TarotDisclaimerNoticeComponent />
          <TarotNoscriptNoticeComponent />
        </div>

        <TarotThreeCardComponent />
        <TarotResultNoticeComponent />
        <TarotThreeCardGuideComponent />
        <TarotFaqComponent items={TAROT_THREE_CARD_FAQ} />
        <TarotDetailNoticeComponent />
      </div>
    </ContentWrapperComponent>
  );
}
