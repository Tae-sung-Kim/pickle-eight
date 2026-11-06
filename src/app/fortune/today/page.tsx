import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { FORTUNE_TODAY_FAQ } from '@/features/fortune/constants/fortune-faq.constant';
import {
  FORTUNE_BREADCRUMB_GROUP,
  FORTUNE_TODAY_SEO,
} from '@/features/fortune/constants/fortune-seo.constant';
import { FortuneCalcBasisComponent } from '@/features/fortune/shared/components/calc-basis.component';
import { FortuneConsentResetComponent } from '@/features/fortune/shared/components/consent-reset.component';
import { FortuneDetailNoticeComponent } from '@/features/fortune/shared/components/detail-notice.component';
import { FortuneDisclaimerNoticeComponent } from '@/features/fortune/shared/components/disclaimer-notice.component';
import { FortuneFaqComponent } from '@/features/fortune/shared/components/faq.component';
import { FortuneInputNoticeComponent } from '@/features/fortune/shared/components/input-notice.component';
import { FortuneNoscriptNoticeComponent } from '@/features/fortune/shared/components/noscript-notice.component';
import { FortuneResultNoticeComponent } from '@/features/fortune/shared/components/result-notice.component';
import { FortuneTodayGuideComponent } from '@/features/fortune/today/components/guide.component';
import { FortuneTodayComponent } from '@/features/fortune/today/components/root.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdFaq,
  SITE_NAME,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: FORTUNE_TODAY_SEO.title,
  description: FORTUNE_TODAY_SEO.description,
  pathname: FORTUNE_TODAY_SEO.pathname,
  keywords: [...FORTUNE_TODAY_SEO.keywords],
  ogImage: { alt: FORTUNE_TODAY_SEO.ogImageAlt },
});

export default function FortuneTodayPage() {
  // 정적 상수만 사용한다. 동의 상태·사용자 입력은 서버 HTML과 JSON-LD에 넣지 않는다(AC-62).
  const crumbs = jsonLdBreadcrumb([
    { name: SITE_NAME, item: canonicalUrl('/') },
    {
      name: FORTUNE_BREADCRUMB_GROUP.name,
      item: canonicalUrl(FORTUNE_BREADCRUMB_GROUP.pathname),
    },
    {
      name: FORTUNE_TODAY_SEO.heading,
      item: canonicalUrl(FORTUNE_TODAY_SEO.pathname),
    },
  ]);
  const jsonLd =
    FORTUNE_TODAY_FAQ.length > 0
      ? [crumbs, jsonLdFaq(FORTUNE_TODAY_FAQ)]
      : crumbs;

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.FORTUNE}>
      <JsonLdComponent data={jsonLd} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.FORTUNE}
            title={FORTUNE_TODAY_SEO.heading}
            description={FORTUNE_TODAY_SEO.headerDescription}
          />
          <FortuneDisclaimerNoticeComponent />
          <FortuneInputNoticeComponent />
          <FortuneNoscriptNoticeComponent />
        </div>

        <FortuneTodayComponent />
        <FortuneResultNoticeComponent />
        <FortuneTodayGuideComponent />
        <FortuneCalcBasisComponent items={[]} />
        <FortuneFaqComponent items={FORTUNE_TODAY_FAQ} />
        <FortuneDetailNoticeComponent />
        <FortuneConsentResetComponent />
      </div>
    </ContentWrapperComponent>
  );
}
