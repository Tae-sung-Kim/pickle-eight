import type { JSX } from 'react';

import {
  MEAL_NO_REWARD_NOTICE_TEXT,
  MEAL_RANDOM_NOTICE_TEXT,
} from '@/features/meal/constants/meal-notice.constant';

/**
 * MealRouletteRandomNoticeComponent
 * - 무작위 고지 + 보상 없음 고지(U5). 결과가 없어도 항상 보인다. 서버 컴포넌트.
 */
export function MealRouletteRandomNoticeComponent(): JSX.Element {
  return (
    <div className="space-y-1 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm leading-6 text-muted-foreground">
      <p>{MEAL_RANDOM_NOTICE_TEXT}</p>
      <p>{MEAL_NO_REWARD_NOTICE_TEXT}</p>
    </div>
  );
}
