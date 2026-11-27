import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { FaqComponent } from '@/components/common/faq.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { FortuneCompatibilityStarSignGuideComponent } from '@/features/fortune/compatibility-star-sign/components/guide.component';
import { FortuneCompatibilityStarSignComponent } from '@/features/fortune/compatibility-star-sign/components/root.component';
import { FORTUNE_COMPATIBILITY_STAR_SIGN_FAQ } from '@/features/fortune/constants/fortune-compatibility-faq.constant';
import { FORTUNE_COMPATIBILITY_OG_TAGS } from '@/features/fortune/constants/fortune-compatibility-menu.constant';
import {
  FORTUNE_COMPATIBILITY_HUB_SEO,
  FORTUNE_COMPATIBILITY_STAR_SIGN_SEO,
} from '@/features/fortune/constants/fortune-compatibility-seo.constant';
import { FORTUNE_BREADCRUMB_GROUP } from '@/features/fortune/constants/fortune-seo.constant';
import { FortuneCalcBasisComponent } from '@/features/fortune/shared/components/calc-basis.component';
import { FortuneCompatibilityCrossLinkComponent } from '@/features/fortune/shared/components/compatibility-cross-link.component';
import { FortuneCompatibilityDisclaimerComponent } from '@/features/fortune/shared/components/compatibility-disclaimer.component';
import { FortuneCompatibilityInputNoticeComponent } from '@/features/fortune/shared/components/compatibility-input-notice.component';
import { FortuneCompatibilityResultNoticeComponent } from '@/features/fortune/shared/components/compatibility-result-notice.component';
import { FortuneConsentResetComponent } from '@/features/fortune/shared/components/consent-reset.component';
import { FortuneDetailNoticeComponent } from '@/features/fortune/shared/components/detail-notice.component';
import { FortuneNoscriptNoticeComponent } from '@/features/fortune/shared/components/noscript-notice.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdFaq,
  SITE_NAME,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: FORTUNE_COMPATIBILITY_STAR_SIGN_SEO.title,
  description: FORTUNE_COMPATIBILITY_STAR_SIGN_SEO.description,
  pathname: FORTUNE_COMPATIBILITY_STAR_SIGN_SEO.pathname,
  keywords: [...FORTUNE_COMPATIBILITY_STAR_SIGN_SEO.keywords],
  ogImage: {
    alt: FORTUNE_COMPATIBILITY_STAR_SIGN_SEO.ogImageAlt,
    tag: FORTUNE_COMPATIBILITY_OG_TAGS.starSign,
  },
});

export default function FortuneCompatibilityStarSignPage() {
  // 정적 상수만 사용한다. 동의 상태·사용자 입력은 서버 HTML과 JSON-LD에 넣지 않는다.
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
    {
      name: FORTUNE_COMPATIBILITY_STAR_SIGN_SEO.heading,
      item: canonicalUrl(FORTUNE_COMPATIBILITY_STAR_SIGN_SEO.pathname),
    },
  ]);
  const jsonLd =
    FORTUNE_COMPATIBILITY_STAR_SIGN_FAQ.length > 0
      ? [crumbs, jsonLdFaq(FORTUNE_COMPATIBILITY_STAR_SIGN_FAQ)]
      : [crumbs];

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.FORTUNE}>
      <JsonLdComponent data={jsonLd} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.FORTUNE}
            title={FORTUNE_COMPATIBILITY_STAR_SIGN_SEO.heading}
            description={FORTUNE_COMPATIBILITY_STAR_SIGN_SEO.headerDescription}
          />
          <FortuneCompatibilityDisclaimerComponent />
          <FortuneCompatibilityInputNoticeComponent />
          <FortuneNoscriptNoticeComponent />
        </div>

        <FortuneCompatibilityStarSignComponent />
        <div className="space-y-4">
          <FortuneCompatibilityResultNoticeComponent />
          <FortuneCompatibilityCrossLinkComponent current="star-sign" />
        </div>
        <FortuneCompatibilityStarSignGuideComponent />
        <FortuneCalcBasisComponent items={['star-sign', 'time-unknown']} />
        <FaqComponent items={FORTUNE_COMPATIBILITY_STAR_SIGN_FAQ} />
        <FortuneDetailNoticeComponent />
        <FortuneConsentResetComponent />
      </div>
    </ContentWrapperComponent>
  );
}
