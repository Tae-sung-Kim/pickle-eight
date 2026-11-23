import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import {
  LUCKY_DRAW_LOTS_SEO,
  LUCKY_DRAW_METADATA_CATEGORY,
} from '@/features/lucky-draw/constants/lucky-draw-seo.constant';
import { LuckyDrawLotsComponent } from '@/features/lucky-draw/lots/components/root.component';
import { LuckyDrawDisclaimerNoticeComponent } from '@/features/lucky-draw/shared/components/disclaimer-notice.component';
import { LuckyDrawFaqComponent } from '@/features/lucky-draw/shared/components/faq.component';
import { LuckyDrawGuideComponent } from '@/features/lucky-draw/shared/components/guide.component';
import { LuckyDrawNoscriptNoticeComponent } from '@/features/lucky-draw/shared/components/noscript-notice.component';
import { LuckyDrawResultNoticeComponent } from '@/features/lucky-draw/shared/components/result-notice.component';
import {
  getLuckyDrawJsonLd,
  getLuckyDrawRobots,
} from '@/features/lucky-draw/utils/lucky-draw-seo.util';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: LUCKY_DRAW_LOTS_SEO.title,
    description: LUCKY_DRAW_LOTS_SEO.description,
    pathname: LUCKY_DRAW_LOTS_SEO.pathname,
    keywords: [...LUCKY_DRAW_LOTS_SEO.keywords],
    ogImage: { alt: LUCKY_DRAW_LOTS_SEO.ogImageAlt },
  }),
  // 루트 레이아웃 category("로또")를 덮어쓴다
  category: LUCKY_DRAW_METADATA_CATEGORY,
  // 출시 전(comingSoon)에는 noindex
  ...getLuckyDrawRobots(),
};

export default function LuckyDrawLotsPage() {
  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.LUCKY_DRAW}>
      <JsonLdComponent data={getLuckyDrawJsonLd('lots')} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.LUCKY_DRAW}
            title={LUCKY_DRAW_LOTS_SEO.heading}
            description={LUCKY_DRAW_LOTS_SEO.headerDescription}
          />
          <LuckyDrawDisclaimerNoticeComponent />
          <LuckyDrawNoscriptNoticeComponent />
        </div>

        <LuckyDrawLotsComponent />
        <LuckyDrawResultNoticeComponent />

        <div className="space-y-10 border-t border-border pt-10">
          <LuckyDrawGuideComponent page="lots" />
          <LuckyDrawFaqComponent page="lots" />
        </div>
      </div>
    </ContentWrapperComponent>
  );
}
