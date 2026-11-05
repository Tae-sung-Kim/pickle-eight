import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { TAROT_DAILY_FAQ } from '@/features/tarot/constants/tarot-faq.constant';
import {
  TAROT_BREADCRUMB_GROUP,
  TAROT_DAILY_SEO,
} from '@/features/tarot/constants/tarot-seo.constant';
import { TarotDailyGuideComponent } from '@/features/tarot/daily/components/guide.component';
import { TarotDailyComponent } from '@/features/tarot/daily/components/root.component';
import { TarotDailyStorageNoticeComponent } from '@/features/tarot/daily/components/storage-notice.component';
import { TarotDetailNoticeComponent } from '@/features/tarot/shared/components/detail-notice.component';
import { TarotDisclaimerNoticeComponent } from '@/features/tarot/shared/components/disclaimer-notice.component';
import { TarotFaqComponent } from '@/features/tarot/shared/components/faq.component';
import { TarotNoscriptNoticeComponent } from '@/features/tarot/shared/components/noscript-notice.component';
import { TarotResultNoticeComponent } from '@/features/tarot/shared/components/result-notice.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdFaq,
  SITE_NAME,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: TAROT_DAILY_SEO.title,
  description: TAROT_DAILY_SEO.description,
  pathname: TAROT_DAILY_SEO.pathname,
  keywords: [...TAROT_DAILY_SEO.keywords],
  ogImage: { alt: TAROT_DAILY_SEO.ogImageAlt },
});

export default function TarotDailyPage() {
  // 정적 상수만 사용한다. 사용자 입력은 JSON-LD에 넣지 않는다.
  // 그룹 href가 /tarot/daily 라 2·3단계 URL이 같다(design.md D5 수용)
  const crumbs = jsonLdBreadcrumb([
    { name: SITE_NAME, item: canonicalUrl('/') },
    {
      name: TAROT_BREADCRUMB_GROUP.name,
      item: canonicalUrl(TAROT_BREADCRUMB_GROUP.pathname),
    },
    {
      name: TAROT_DAILY_SEO.heading,
      item: canonicalUrl(TAROT_DAILY_SEO.pathname),
    },
  ]);
  const jsonLd =
    TAROT_DAILY_FAQ.length > 0 ? [crumbs, jsonLdFaq(TAROT_DAILY_FAQ)] : crumbs;

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.TAROT}>
      <JsonLdComponent data={jsonLd} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.TAROT}
            title={TAROT_DAILY_SEO.heading}
            description={TAROT_DAILY_SEO.headerDescription}
          />
          <TarotDisclaimerNoticeComponent />
          <TarotDailyStorageNoticeComponent />
          <TarotNoscriptNoticeComponent />
        </div>

        <TarotDailyComponent />
        <TarotResultNoticeComponent />
        <TarotDailyGuideComponent />
        <TarotFaqComponent items={TAROT_DAILY_FAQ} />
        <TarotDetailNoticeComponent />
      </div>
    </ContentWrapperComponent>
  );
}
