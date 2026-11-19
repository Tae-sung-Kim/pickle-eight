import { DREAM_CATEGORIES } from '@/features/dream/constants/dream-category.constant';
import { DREAM_HUB_PATH } from '@/features/dream/constants/dream-route.constant';
import { DREAM_TOPICS } from '@/features/dream/constants/dream-topics.constant';
import type {
  DreamHubGroupType,
  DreamSearchItemType,
  DreamTopicType,
} from '@/features/dream/types/dream.type';
import { normalizeDreamSearchText } from '@/features/dream/utils/dream-search.util';

/**
 * 서버 전용. 소재 본문이 들어 있는 DREAM_TOPICS를 import하므로
 * 클라이언트 컴포넌트(hub/components)에서 import하지 않는다.
 */
const TOPIC_MAP: ReadonlyMap<string, DreamTopicType> = new Map(
  DREAM_TOPICS.map((topic) => [topic.slug, topic])
);

export function getDreamTopicBySlug(slug: string): DreamTopicType | null {
  return TOPIC_MAP.get(slug) ?? null;
}

/** related slug 순서대로 소재로 바꾼다. 없는 slug는 건너뛴다 */
export function getDreamRelatedTopics(
  topic: DreamTopicType
): readonly DreamTopicType[] {
  return topic.related
    .map((slug) => TOPIC_MAP.get(slug))
    .filter((found): found is DreamTopicType => found !== undefined);
}

/** 허브 검색용 가벼운 항목. 본문은 넣지 않는다. searchKeys는 정규화만 하고 접미어는 떼지 않는다 */
export function buildDreamSearchItems(
  topics: readonly DreamTopicType[]
): readonly DreamSearchItemType[] {
  return topics.map((topic) => {
    const categoryLabel =
      DREAM_CATEGORIES.find((category) => category.key === topic.category)
        ?.label ?? '';
    const keys = [
      topic.name,
      topic.keywordName,
      ...topic.aliases,
      categoryLabel,
    ]
      .map(normalizeDreamSearchText)
      .filter((key) => key !== '');
    return {
      slug: topic.slug,
      name: topic.name,
      category: topic.category,
      aliases: topic.aliases,
      searchKeys: Array.from(new Set(keys)),
    };
  });
}

/** DREAM_CATEGORIES 순서로 묶는다. 항목 순서는 입력 순서를 유지한다 */
export function buildDreamHubGroups(
  items: readonly DreamSearchItemType[]
): readonly DreamHubGroupType[] {
  return DREAM_CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category.key),
  }));
}

export function getDreamTopicPath(slug: string): string {
  return `${DREAM_HUB_PATH}/${slug}`;
}

/** sitemap용 상세 경로 */
export function getDreamTopicPaths(): readonly string[] {
  return DREAM_TOPICS.map((topic) => getDreamTopicPath(topic.slug));
}
