import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { FORTUNE_SAJU_FAQ } from '@/features/fortune/constants/fortune-faq.constant';
import { FORTUNE_SAJU_CALC_BASIS_ANCHOR_ID } from '@/features/fortune/constants/fortune-saju-view.constant';
import {
  FORTUNE_BREADCRUMB_GROUP,
  FORTUNE_SAJU_SEO,
} from '@/features/fortune/constants/fortune-seo.constant';
import { FortuneSajuGuideComponent } from '@/features/fortune/saju/components/guide.component';
import { FortuneSajuComponent } from '@/features/fortune/saju/components/root.component';
import { FortuneCalcBasisComponent } from '@/features/fortune/shared/components/calc-basis.component';
import { FortuneConsentResetComponent } from '@/features/fortune/shared/components/consent-reset.component';
import { FortuneDetailNoticeComponent } from '@/features/fortune/shared/components/detail-notice.component';
import { FortuneDisclaimerNoticeComponent } from '@/features/fortune/shared/components/disclaimer-notice.component';
import { FortuneFaqComponent } from '@/features/fortune/shared/components/faq.component';
import { FortuneInputNoticeComponent } from '@/features/fortune/shared/components/input-notice.component';
import { FortuneNoscriptNoticeComponent } from '@/features/fortune/shared/components/noscript-notice.component';
import { FortuneResultNoticeComponent } from '@/features/fortune/shared/components/result-notice.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdFaq,
  SITE_NAME,
} from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: FORTUNE_SAJU_SEO.title,
    description: FORTUNE_SAJU_SEO.description,
    pathname: FORTUNE_SAJU_SEO.pathname,
    keywords: [...FORTUNE_SAJU_SEO.keywords],
    ogImage: { alt: FORTUNE_SAJU_SEO.ogImageAlt },
  }),
};

export default function FortuneSajuPage() {
  // 정적 상수만 사용한다. 동의 상태·사용자 입력은 서버 HTML과 JSON-LD에 넣지 않는다(AC-62).
  const crumbs = jsonLdBreadcrumb([
    { name: SITE_NAME, item: canonicalUrl('/') },
    {
      name: FORTUNE_BREADCRUMB_GROUP.name,
      item: canonicalUrl(FORTUNE_BREADCRUMB_GROUP.pathname),
    },
    {
      name: FORTUNE_SAJU_SEO.heading,
      item: canonicalUrl(FORTUNE_SAJU_SEO.pathname),
    },
  ]);
  const jsonLd = [crumbs, jsonLdFaq(FORTUNE_SAJU_FAQ)];

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.FORTUNE}>
      <JsonLdComponent data={jsonLd} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.FORTUNE}
            title={FORTUNE_SAJU_SEO.heading}
            description={FORTUNE_SAJU_SEO.headerDescription}
          />
          <FortuneDisclaimerNoticeComponent />
          <FortuneInputNoticeComponent />
          <FortuneNoscriptNoticeComponent />
        </div>

        <FortuneSajuComponent />
        <FortuneResultNoticeComponent />
        <FortuneSajuGuideComponent />
        <div id={FORTUNE_SAJU_CALC_BASIS_ANCHOR_ID} className="scroll-mt-20">
          <FortuneCalcBasisComponent
            items={[
              'saju-pillars',
              'saju-day-hour',
              'saju-schools',
              'saju-zi-start',
              'saju-no-correction',
              'saju-time-unknown',
              'saju-statement',
            ]}
          />
        </div>
        <FortuneFaqComponent items={FORTUNE_SAJU_FAQ} />
        <FortuneDetailNoticeComponent />
        <FortuneConsentResetComponent />
      </div>
    </ContentWrapperComponent>
  );
}
