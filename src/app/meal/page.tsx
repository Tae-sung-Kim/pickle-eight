import type { Metadata } from 'next';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { MEAL_FAQ } from '@/features/meal/constants/meal-faq.constant';
import { MEAL_PAGE_DESCRIPTION } from '@/features/meal/constants/meal-notice.constant';
import {
  MEAL_BREADCRUMB,
  MEAL_HUB_SEO,
} from '@/features/meal/constants/meal-seo.constant';
import { MealRouletteDisclaimerNoticeComponent } from '@/features/meal/roulette/components/disclaimer-notice.component';
import { MealRouletteFaqComponent } from '@/features/meal/roulette/components/faq.component';
import { MealRouletteIntroComponent } from '@/features/meal/roulette/components/intro.component';
import { MealRouletteNoscriptNoticeComponent } from '@/features/meal/roulette/components/noscript-notice.component';
import { MealRouletteRandomNoticeComponent } from '@/features/meal/roulette/components/random-notice.component';
import { MealRouletteComponent } from '@/features/meal/roulette/components/root.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdFaq,
  SITE_NAME,
} from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: MEAL_HUB_SEO.title,
    description: MEAL_HUB_SEO.description,
    pathname: MEAL_HUB_SEO.pathname,
    keywords: [...MEAL_HUB_SEO.keywords],
    ogImage: { alt: MEAL_HUB_SEO.ogImageAlt },
  }),
};

export default function MealPage() {
  const jsonLd = [
    jsonLdBreadcrumb([
      { name: SITE_NAME, item: canonicalUrl('/') },
      {
        name: MEAL_BREADCRUMB.page.name,
        item: canonicalUrl(MEAL_BREADCRUMB.page.pathname),
      },
    ]),
    jsonLdFaq(MEAL_FAQ),
  ];

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.MEAL}>
      <JsonLdComponent data={jsonLd} />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div className="space-y-4">
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.MEAL}
            title={MEAL_HUB_SEO.heading}
            description={MEAL_PAGE_DESCRIPTION}
          />
          <MealRouletteDisclaimerNoticeComponent />
          <MealRouletteNoscriptNoticeComponent />
        </div>

        <MealRouletteComponent />

        <div className="space-y-10 border-t border-border pt-10">
          <MealRouletteIntroComponent />
          <MealRouletteRandomNoticeComponent />
          <MealRouletteFaqComponent />
        </div>
      </div>
    </ContentWrapperComponent>
  );
}
