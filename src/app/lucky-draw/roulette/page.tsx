import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import {
  LUCKY_DRAW_METADATA_CATEGORY,
  LUCKY_DRAW_ROULETTE_SEO,
} from '@/features/lucky-draw/constants/lucky-draw-seo.constant';
import { LuckyDrawRouletteComponent } from '@/features/lucky-draw/roulette/components/root.component';
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
    title: LUCKY_DRAW_ROULETTE_SEO.title,
    description: LUCKY_DRAW_ROULETTE_SEO.description,
    pathname: LUCKY_DRAW_ROULETTE_SEO.pathname,
    keywords: [...LUCKY_DRAW_ROULETTE_SEO.keywords],
    ogImage: { alt: LUCKY_DRAW_ROULETTE_SEO.ogImageAlt },
  }),
  // 루트 레이아웃 category("로또")를 덮어쓴다
  category: LUCKY_DRAW_METADATA_CATEGORY,
  // 출시 전(comingSoon)에는 noindex
  ...getLuckyDrawRobots(),
};

export default function LuckyDrawRoulettePage() {
  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.LUCKY_DRAW}>
      <JsonLdComponent data={getLuckyDrawJsonLd('roulette')} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.LUCKY_DRAW}
            title={LUCKY_DRAW_ROULETTE_SEO.heading}
            description={LUCKY_DRAW_ROULETTE_SEO.headerDescription}
          />
          <LuckyDrawDisclaimerNoticeComponent />
          <LuckyDrawNoscriptNoticeComponent />
        </div>

        <LuckyDrawRouletteComponent />
        <LuckyDrawResultNoticeComponent />

        <div className="space-y-10 border-t border-border pt-10">
          <LuckyDrawGuideComponent page="roulette" />
          <LuckyDrawFaqComponent page="roulette" />
        </div>
      </div>
    </ContentWrapperComponent>
  );
}
