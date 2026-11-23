import type { JSX } from 'react';

import {
  MEAL_INTRO_TEXT,
  MEAL_STEPS,
  MEAL_STEPS_TITLE,
} from '@/features/meal/constants/meal-notice.constant';

/**
 * MealRouletteIntroComponent
 * - 소개 문단 + 사용 순서(h2). 서버 컴포넌트.
 */
export function MealRouletteIntroComponent(): JSX.Element {
  return (
    <section className="space-y-4">
      <p className="max-w-[68ch] text-base leading-7 text-foreground">
        {MEAL_INTRO_TEXT}
      </p>
      <h2 className="break-keep text-xl font-semibold leading-tight text-foreground sm:text-2xl">
        {MEAL_STEPS_TITLE}
      </h2>
      <ol className="space-y-3 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
        {MEAL_STEPS.map((step, index) => (
          <li
            key={step}
            className="flex items-start gap-3 text-sm leading-6 text-foreground sm:text-base"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-menu-meal text-sm font-semibold text-foreground"
            >
              {index + 1}
            </span>
            <span className="break-keep">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
