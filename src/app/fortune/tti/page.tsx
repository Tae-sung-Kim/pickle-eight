import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { FORTUNE_TTI_FAQ } from '@/features/fortune/constants/fortune-faq.constant';
import {
  FORTUNE_BREADCRUMB_GROUP,
  FORTUNE_TTI_SEO,
} from '@/features/fortune/constants/fortune-seo.constant';
import { FortuneCalcBasisComponent } from '@/features/fortune/shared/components/calc-basis.component';
import { FortuneConsentResetComponent } from '@/features/fortune/shared/components/consent-reset.component';
import { FortuneDetailNoticeComponent } from '@/features/fortune/shared/components/detail-notice.component';
import { FortuneDisclaimerNoticeComponent } from '@/features/fortune/shared/components/disclaimer-notice.component';
import { FortuneFaqComponent } from '@/features/fortune/shared/components/faq.component';
import { FortuneInputNoticeComponent } from '@/features/fortune/shared/components/input-notice.component';
import { FortuneNoscriptNoticeComponent } from '@/features/fortune/shared/components/noscript-notice.component';
import { FortuneResultNoticeComponent } from '@/features/fortune/shared/components/result-notice.component';
import { FortuneTodayLinkComponent } from '@/features/fortune/shared/components/today-link.component';
import { FortuneTtiGuideComponent } from '@/features/fortune/tti/components/guide.component';
import { FortuneTtiComponent } from '@/features/fortune/tti/components/root.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdFaq,
  SITE_NAME,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: FORTUNE_TTI_SEO.title,
  description: FORTUNE_TTI_SEO.description,
  pathname: FORTUNE_TTI_SEO.pathname,
  keywords: [...FORTUNE_TTI_SEO.keywords],
  ogImage: { alt: FORTUNE_TTI_SEO.ogImageAlt },
});

export default function FortuneTtiPage() {
  // 정적 상수만 사용한다. 동의 상태·사용자 입력은 서버 HTML과 JSON-LD에 넣지 않는다(AC-62).
  const crumbs = jsonLdBreadcrumb([
    { name: SITE_NAME, item: canonicalUrl('/') },
    {
      name: FORTUNE_BREADCRUMB_GROUP.name,
      item: canonicalUrl(FORTUNE_BREADCRUMB_GROUP.pathname),
    },
    {
      name: FORTUNE_TTI_SEO.heading,
      item: canonicalUrl(FORTUNE_TTI_SEO.pathname),
    },
  ]);
  const jsonLd =
    FORTUNE_TTI_FAQ.length > 0 ? [crumbs, jsonLdFaq(FORTUNE_TTI_FAQ)] : crumbs;

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.FORTUNE}>
      <JsonLdComponent data={jsonLd} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.FORTUNE}
            title={FORTUNE_TTI_SEO.heading}
            description={FORTUNE_TTI_SEO.headerDescription}
          />
          <FortuneDisclaimerNoticeComponent />
          <FortuneInputNoticeComponent />
          <FortuneNoscriptNoticeComponent />
        </div>

        <FortuneTtiComponent />
        <div>
          <FortuneResultNoticeComponent />
          <FortuneTodayLinkComponent />
        </div>
        <FortuneTtiGuideComponent />
        <FortuneCalcBasisComponent items={['tti', 'time-unknown']} />
        <FortuneFaqComponent items={FORTUNE_TTI_FAQ} />
        <FortuneDetailNoticeComponent />
        <FortuneConsentResetComponent />
      </div>
    </ContentWrapperComponent>
  );
}
