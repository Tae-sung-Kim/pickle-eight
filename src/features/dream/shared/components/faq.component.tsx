import type { JSX } from 'react';

import { DREAM_FAQ_TITLE } from '@/features/dream/constants/dream-notice.constant';
import type { DreamFaqItemType } from '@/features/dream/types/dream.type';

export type DreamFaqComponentPropsType = Readonly<{
  items: readonly DreamFaqItemType[];
}>;

/**
 * DreamFaqComponent
 * - 펼친 목록(아코디언 아님). 모든 답이 서버 HTML에 보인다. 서버 컴포넌트.
 * - 화면과 JSON-LD가 같은 items 배열을 쓴다.
 */
export function DreamFaqComponent({
  items,
}: DreamFaqComponentPropsType): JSX.Element | null {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl">
        {DREAM_FAQ_TITLE}
      </h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.question} className="space-y-1">
            <h3 className="text-lg leading-snug font-semibold break-keep text-foreground">
              {item.question}
            </h3>
            <p className="max-w-[68ch] text-sm leading-7 break-keep text-foreground sm:text-base">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
