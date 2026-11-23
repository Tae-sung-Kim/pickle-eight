import type { JSX } from 'react';

import { LUCKY_DRAW_FAQ } from '../../constants/lucky-draw-faq.constant';
import { LUCKY_DRAW_FAQ_TITLE } from '../../constants/lucky-draw-notice.constant';
import type { LuckyDrawPageKeyType } from '../../types/lucky-draw.type';

type LuckyDrawFaqPropsType = Readonly<{ page: LuckyDrawPageKeyType }>;

/**
 * LuckyDrawFaqComponent
 * - FAQ를 모두 펼쳐 둔다. FAQPage JSON-LD와 같은 배열. 서버 컴포넌트.
 */
export function LuckyDrawFaqComponent({
  page,
}: LuckyDrawFaqPropsType): JSX.Element {
  return (
    <section aria-labelledby="lucky-draw-faq-title" className="space-y-4">
      <h2
        id="lucky-draw-faq-title"
        className="break-keep text-xl font-semibold leading-8 sm:text-2xl"
      >
        {LUCKY_DRAW_FAQ_TITLE}
      </h2>
      <dl className="space-y-5">
        {LUCKY_DRAW_FAQ[page].map((item) => (
          <div key={item.question} className="max-w-prose">
            <dt className="text-base font-semibold leading-7 text-foreground">
              {item.question}
            </dt>
            <dd className="text-sm leading-7 text-muted-foreground">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
