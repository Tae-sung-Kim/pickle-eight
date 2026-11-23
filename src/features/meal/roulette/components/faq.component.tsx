import type { JSX } from 'react';

import { MEAL_FAQ } from '@/features/meal/constants/meal-faq.constant';
import { MEAL_FAQ_TITLE } from '@/features/meal/constants/meal-notice.constant';

/**
 * MealRouletteFaqComponent
 * - 펼친 목록(아코디언 아님). 모든 답이 서버 HTML에 보인다. 서버 컴포넌트.
 * - 질문·답은 MEAL_FAQ 한 배열만 참조한다(JSON-LD와 공유).
 */
export function MealRouletteFaqComponent(): JSX.Element {
  return (
    <section className="space-y-4">
      <h2 className="break-keep text-xl font-semibold leading-tight text-foreground sm:text-2xl">
        {MEAL_FAQ_TITLE}
      </h2>
      <div className="space-y-5">
        {MEAL_FAQ.map((item) => (
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
