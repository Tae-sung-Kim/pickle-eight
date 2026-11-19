import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { DREAM_CATEGORIES } from '@/features/dream/constants/dream-category.constant';
import { DREAM_TOPIC_DESCRIPTION_TEMPLATE } from '@/features/dream/constants/dream-notice.constant';
import { DREAM_HUB_PATH } from '@/features/dream/constants/dream-route.constant';
import {
  DREAM_BREADCRUMB_GROUP,
  DREAM_METADATA_CATEGORY,
} from '@/features/dream/constants/dream-seo.constant';
import { DREAM_TOPICS } from '@/features/dream/constants/dream-topics.constant';
import { DreamBottomNoticeComponent } from '@/features/dream/shared/components/bottom-notice.component';
import { DreamBreadcrumbComponent } from '@/features/dream/shared/components/breadcrumb.component';
import { DreamCrisisPhonesComponent } from '@/features/dream/shared/components/crisis-phones.component';
import { DreamDisclaimerNoticeComponent } from '@/features/dream/shared/components/disclaimer-notice.component';
import { DreamTopicBackLinkComponent } from '@/features/dream/topic/components/back-link.component';
import { DreamTopicComponent } from '@/features/dream/topic/components/root.component';
import {
  buildDreamTopicJsonLdInput,
  buildDreamTopicSeo,
} from '@/features/dream/utils/dream-seo.util';
import {
  getDreamRelatedTopics,
  getDreamTopicBySlug,
} from '@/features/dream/utils/dream-topic.util';
import { buildMetadata, jsonLdBreadcrumb, jsonLdFaq } from '@/lib/seo';

export const dynamicParams = false;

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return DREAM_TOPICS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getDreamTopicBySlug(slug);
  if (!topic) notFound();

  const seo = buildDreamTopicSeo(topic);
  return {
    ...buildMetadata({
      title: seo.title,
      description: seo.description,
      pathname: seo.pathname,
      keywords: seo.keywords,
      ogImage: seo.ogImage,
    }),
    // 루트 레이아웃의 category("로또")를 덮어쓴다
    category: DREAM_METADATA_CATEGORY,
  };
}

export default async function DreamTopicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const topic = getDreamTopicBySlug(slug);
  if (!topic) notFound();

  const relatedTopics = getDreamRelatedTopics(topic);
  const input = buildDreamTopicJsonLdInput(topic);
  const categoryLabel =
    DREAM_CATEGORIES.find((category) => category.key === topic.category)
      ?.label ?? '';
  const description = DREAM_TOPIC_DESCRIPTION_TEMPLATE.replace(
    '{category}',
    categoryLabel
  );

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.DREAM}>
      <JsonLdComponent
        data={[jsonLdBreadcrumb(input.breadcrumb), jsonLdFaq(input.faq)]}
      />

      <div className="mx-auto max-w-3xl space-y-10 px-4 pb-8">
        <div className="space-y-4">
          <DreamBreadcrumbComponent
            items={[
              { label: '홈', href: '/' },
              { label: DREAM_BREADCRUMB_GROUP.name, href: DREAM_HUB_PATH },
              { label: topic.keywordName },
            ]}
          />
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.DREAM}
            title={`${topic.keywordName} 해몽`}
            description={description}
          />
          <DreamDisclaimerNoticeComponent />
        </div>

        <DreamTopicComponent topic={topic} relatedTopics={relatedTopics} />
        <DreamBottomNoticeComponent />
        <DreamCrisisPhonesComponent />
        <DreamTopicBackLinkComponent />
      </div>
    </ContentWrapperComponent>
  );
}
