import {
  DREAM_BREADCRUMB_GROUP,
  DREAM_TOPIC_SEO_TEMPLATE,
} from '@/features/dream/constants/dream-seo.constant';
import type {
  DreamFaqItemType,
  DreamTopicType,
} from '@/features/dream/types/dream.type';
import { getDreamTopicPath } from '@/features/dream/utils/dream-topic.util';
import { canonicalUrl, SITE_NAME } from '@/lib/seo';

export type DreamTopicSeoType = Readonly<{
  title: string;
  description: string;
  pathname: string;
  keywords: string[];
  ogImage: { alt: string; tag: string };
}>;

export type DreamTopicJsonLdInputType = Readonly<{
  breadcrumb: ReadonlyArray<{ name: string; item: string }>;
  faq: readonly DreamFaqItemType[];
}>;

function fillTemplate(template: string, topic: DreamTopicType): string {
  return template
    .replaceAll('{keywordName}', topic.keywordName)
    .replaceAll('{summary}', topic.summary);
}

/** 상세 metadata 입력값. 호출 쪽이 buildMetadata에 펼치고 category를 덮어쓴다 */
export function buildDreamTopicSeo(topic: DreamTopicType): DreamTopicSeoType {
  const t = DREAM_TOPIC_SEO_TEMPLATE;
  // 별칭(속어·불길한 표현)은 head HTML에 내보내지 않는다
  const keywords = Array.from(
    new Set([`${topic.keywordName} 해몽`, topic.keywordName])
  );
  return {
    title: fillTemplate(t.title, topic),
    description: fillTemplate(t.description, topic),
    pathname: getDreamTopicPath(topic.slug),
    keywords,
    ogImage: {
      alt: fillTemplate(t.ogImageAlt, topic),
      tag: t.ogImageTag,
    },
  };
}

/** 상세 JSON-LD 입력. 홈 > 꿈 해몽 > 소재, FAQ는 화면과 같은 topic.faq */
export function buildDreamTopicJsonLdInput(
  topic: DreamTopicType
): DreamTopicJsonLdInputType {
  return {
    breadcrumb: [
      { name: SITE_NAME, item: canonicalUrl('/') },
      {
        name: DREAM_BREADCRUMB_GROUP.name,
        item: canonicalUrl(DREAM_BREADCRUMB_GROUP.pathname),
      },
      {
        name: topic.keywordName,
        item: canonicalUrl(getDreamTopicPath(topic.slug)),
      },
    ],
    faq: topic.faq,
  };
}
