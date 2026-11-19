import type { JSX } from 'react';

import { LUNCH_DISCLAIMER_TEXT } from '@/features/lunch/constants/lunch-notice.constant';

/**
 * LunchTodayDisclaimerNoticeComponent
 * - 상시 오락 고지. h1 바로 아래. 접기·툴팁 없음. 서버 컴포넌트.
 */
export function LunchTodayDisclaimerNoticeComponent(): JSX.Element {
  return (
    <p className="mx-auto max-w-2xl rounded-lg border border-border bg-card px-4 py-3 text-left text-sm leading-6 text-muted-foreground">
      {LUNCH_DISCLAIMER_TEXT}
    </p>
  );
}
