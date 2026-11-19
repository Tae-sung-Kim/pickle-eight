import Link from 'next/link';
import type { JSX } from 'react';

import { DREAM_SECTION_TITLES } from '@/features/dream/constants/dream-notice.constant';
import type { DreamTopicType } from '@/features/dream/types/dream.type';
import { getDreamTopicPath } from '@/features/dream/utils/dream-topic.util';

export type DreamTopicRelatedComponentPropsType = Readonly<{
  topics: readonly DreamTopicType[];
}>;

/**
 * DreamTopicRelatedComponent
 * - 관련 소재 칩. related 순서 그대로. 서버 컴포넌트.
 */
export function DreamTopicRelatedComponent({
  topics,
}: DreamTopicRelatedComponentPropsType): JSX.Element | null {
  if (topics.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl">
        {DREAM_SECTION_TITLES.related}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link
              href={getDreamTopicPath(topic.slug)}
              prefetch={false}
              className="inline-flex min-h-11 items-center rounded-md border border-border bg-card px-3 font-medium text-foreground hover:border-menu-dream/40 hover:bg-menu-dream/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              {topic.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
