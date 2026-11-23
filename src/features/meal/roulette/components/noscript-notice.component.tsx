import type { JSX } from 'react';

import { MEAL_NOSCRIPT_TEXT } from '@/features/meal/constants/meal-notice.constant';

/**
 * MealRouletteNoscriptNoticeComponent
 * - JS가 꺼진 경우 돌림판이 동작하지 않는 이유를 알린다. 서버 컴포넌트.
 */
export function MealRouletteNoscriptNoticeComponent(): JSX.Element {
  return (
    <noscript>
      <p className="rounded-lg border border-border bg-card p-4 text-sm leading-6 text-foreground">
        {MEAL_NOSCRIPT_TEXT}
      </p>
    </noscript>
  );
}
