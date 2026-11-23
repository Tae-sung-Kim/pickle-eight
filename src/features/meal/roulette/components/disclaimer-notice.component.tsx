import type { JSX } from 'react';

import { MEAL_DISCLAIMER_TEXT } from '@/features/meal/constants/meal-notice.constant';

/**
 * MealRouletteDisclaimerNoticeComponent
 * - 상시 오락 고지. h1 바로 아래. 접기·툴팁 없음. 서버 컴포넌트.
 */
export function MealRouletteDisclaimerNoticeComponent(): JSX.Element {
  return (
    <p className="mx-auto max-w-2xl rounded-lg border border-border bg-card px-4 py-3 text-left text-sm leading-6 text-muted-foreground">
      {MEAL_DISCLAIMER_TEXT}
    </p>
  );
}
