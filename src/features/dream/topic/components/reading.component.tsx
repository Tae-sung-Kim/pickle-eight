import type { JSX } from 'react';

import { DREAM_SECTION_TITLES } from '@/features/dream/constants/dream-notice.constant';
import type { DreamTopicType } from '@/features/dream/types/dream.type';

export type DreamTopicReadingComponentPropsType = Readonly<{
  topic: DreamTopicType;
}>;

/**
 * DreamTopicReadingComponent
 * - 한 줄 요약, 민간 풀이, 요즘 생각해 볼 점. 서버 컴포넌트.
 */
export function DreamTopicReadingComponent({
  topic,
}: DreamTopicReadingComponentPropsType): JSX.Element {
  return (
    <div className="space-y-8">
      <p className="border-l-4 border-menu-dream pl-4 text-lg leading-8 font-medium break-keep text-foreground sm:text-xl sm:leading-9">
        {topic.summary}
      </p>
      <section className="space-y-3">
        <h2 className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl">
          {DREAM_SECTION_TITLES.folk}
        </h2>
        <p className="max-w-[68ch] text-base leading-8 break-keep text-foreground">
          {topic.folk.join(' ')}
        </p>
      </section>
      <section className="space-y-3 rounded-panel border border-border bg-card p-5 sm:p-6">
        <h2 className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl">
          {DREAM_SECTION_TITLES.reflection}
        </h2>
        <p className="max-w-[68ch] text-base leading-8 break-keep text-foreground">
          {topic.reflection.join(' ')}
        </p>
      </section>
    </div>
  );
}
