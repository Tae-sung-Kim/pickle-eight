import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { FORTUNE_STAR_SIGN_FAQ } from '@/features/fortune/constants/fortune-faq.constant';
import {
  FORTUNE_BREADCRUMB_GROUP,
  FORTUNE_STAR_SIGN_SEO,
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
import { FortuneStarSignGuideComponent } from '@/features/fortune/star-sign/components/guide.component';
import { FortuneStarSignComponent } from '@/features/fortune/star-sign/components/root.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdFaq,
  SITE_NAME,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: FORTUNE_STAR_SIGN_SEO.title,
  description: FORTUNE_STAR_SIGN_SEO.description,
  pathname: FORTUNE_STAR_SIGN_SEO.pathname,
  keywords: [...FORTUNE_STAR_SIGN_SEO.keywords],
  ogImage: { alt: FORTUNE_STAR_SIGN_SEO.ogImageAlt },
});

export default function FortuneStarSignPage() {
  // 정적 상수만 사용한다. 동의 상태·사용자 입력은 서버 HTML과 JSON-LD에 넣지 않는다(AC-62).
  const crumbs = jsonLdBreadcrumb([
    { name: SITE_NAME, item: canonicalUrl('/') },
    {
      name: FORTUNE_BREADCRUMB_GROUP.name,
      item: canonicalUrl(FORTUNE_BREADCRUMB_GROUP.pathname),
    },
    {
      name: FORTUNE_STAR_SIGN_SEO.heading,
      item: canonicalUrl(FORTUNE_STAR_SIGN_SEO.pathname),
    },
  ]);
  const jsonLd =
    FORTUNE_STAR_SIGN_FAQ.length > 0
      ? [crumbs, jsonLdFaq(FORTUNE_STAR_SIGN_FAQ)]
      : crumbs;

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.FORTUNE}>
      <JsonLdComponent data={jsonLd} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.FORTUNE}
            title={FORTUNE_STAR_SIGN_SEO.heading}
            description={FORTUNE_STAR_SIGN_SEO.headerDescription}
          />
          <FortuneDisclaimerNoticeComponent />
          <FortuneInputNoticeComponent />
          <FortuneNoscriptNoticeComponent />
        </div>

        <FortuneStarSignComponent />
        <div>
          <FortuneResultNoticeComponent />
          <FortuneTodayLinkComponent />
        </div>
        <FortuneStarSignGuideComponent />
        <FortuneCalcBasisComponent items={['star-sign', 'time-unknown']} />
        <FortuneFaqComponent items={FORTUNE_STAR_SIGN_FAQ} />
        <FortuneDetailNoticeComponent />
        <FortuneConsentResetComponent />
      </div>
    </ContentWrapperComponent>
  );
}
