import type { JSX } from 'react';

import { LUNCH_FAQ } from '@/features/lunch/constants/lunch-faq.constant';
import { LUNCH_FAQ_TITLE } from '@/features/lunch/constants/lunch-notice.constant';

/**
 * LunchTodayFaqComponent
 * - 펼친 목록(아코디언 아님). 모든 답이 서버 HTML에 보인다. 서버 컴포넌트.
 * - 질문·답은 LUNCH_FAQ 한 배열만 참조한다(JSON-LD와 공유).
 */
export function LunchTodayFaqComponent(): JSX.Element {
  return (
    <section className="space-y-4">
      <h2 className="break-keep text-xl font-semibold leading-tight text-foreground sm:text-2xl">
        {LUNCH_FAQ_TITLE}
      </h2>
      <div className="space-y-5">
        {LUNCH_FAQ.map((item) => (
          <div key={item.question} className="space-y-1">
            <h3 className="break-keep text-lg font-semibold leading-snug text-foreground">
              {item.question}
            </h3>
            <p className="text-sm leading-7 text-foreground sm:text-base">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
