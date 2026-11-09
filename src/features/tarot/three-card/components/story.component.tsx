import type { JSX } from 'react';

import { TAROT_STORY_NOTICE } from '@/features/tarot/constants/tarot-notice.constant';
import { TAROT_STORY_TITLE } from '@/features/tarot/constants/tarot-story.constant';

export type TarotThreeCardStoryComponentPropsType = {
  /** 세 장을 잇는 이야기 문단(문자열 하나). null이면 부모가 이 컴포넌트를 그리지 않는다 */
  story: string;
};

/**
 * TarotThreeCardStoryComponent
 * - 제목 h2 + 문단 p 하나 + 안내. React 텍스트로만 그리고 문단 안 강조는 없다.
 */
export function TarotThreeCardStoryComponent({
  story,
}: TarotThreeCardStoryComponentPropsType): JSX.Element {
  return (
    <section className="space-y-3 border-t border-border pt-6 md:px-6">
      <h2 className="text-xl leading-tight font-semibold text-foreground sm:text-2xl">
        {TAROT_STORY_TITLE}
      </h2>
      <p className="max-w-[68ch] text-base leading-8 break-keep text-foreground sm:text-lg sm:leading-9">
        {story}
      </p>
      <p className="max-w-[68ch] text-sm leading-6 break-keep text-muted-foreground">
        {TAROT_STORY_NOTICE}
      </p>
    </section>
  );
}
