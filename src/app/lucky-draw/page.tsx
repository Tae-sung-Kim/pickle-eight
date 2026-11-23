import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { LUCKY_DRAW_HUB_NOTE } from '@/features/lucky-draw/constants/lucky-draw-notice.constant';
import {
  LUCKY_DRAW_HUB_SEO,
  LUCKY_DRAW_METADATA_CATEGORY,
} from '@/features/lucky-draw/constants/lucky-draw-seo.constant';
import { LuckyDrawToolLinksComponent } from '@/features/lucky-draw/hub/components/tool-links.component';
import { LuckyDrawDisclaimerNoticeComponent } from '@/features/lucky-draw/shared/components/disclaimer-notice.component';
import { LuckyDrawFaqComponent } from '@/features/lucky-draw/shared/components/faq.component';
import { LuckyDrawGuideComponent } from '@/features/lucky-draw/shared/components/guide.component';
import {
  getLuckyDrawJsonLd,
  getLuckyDrawRobots,
} from '@/features/lucky-draw/utils/lucky-draw-seo.util';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: LUCKY_DRAW_HUB_SEO.title,
    description: LUCKY_DRAW_HUB_SEO.description,
    pathname: LUCKY_DRAW_HUB_SEO.pathname,
    keywords: [...LUCKY_DRAW_HUB_SEO.keywords],
    ogImage: { alt: LUCKY_DRAW_HUB_SEO.ogImageAlt },
  }),
  // 루트 레이아웃 category("로또")를 덮어쓴다
  category: LUCKY_DRAW_METADATA_CATEGORY,
  // 출시 전(comingSoon)에는 noindex
  ...getLuckyDrawRobots(),
};

export default function LuckyDrawHubPage() {
  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.LUCKY_DRAW}>
      <JsonLdComponent data={getLuckyDrawJsonLd('hub')} />
      <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-8">
        <TitleWrapperComponent
          type={MENU_GROUP_NAME_ENUM.LUCKY_DRAW}
          title={LUCKY_DRAW_HUB_SEO.heading}
          description={LUCKY_DRAW_HUB_SEO.headerDescription}
        />
        <LuckyDrawDisclaimerNoticeComponent />
        <LuckyDrawToolLinksComponent />
        <p className="text-sm leading-6 text-muted-foreground">
          {LUCKY_DRAW_HUB_NOTE}
        </p>
        <LuckyDrawGuideComponent page="hub" />
        <LuckyDrawFaqComponent page="hub" />
      </div>
    </ContentWrapperComponent>
  );
}
