import type { JSX } from 'react';

import { LUNCH_NOSCRIPT_TEXT } from '@/features/lunch/constants/lunch-notice.constant';

/**
 * LunchTodayNoscriptNoticeComponent
 * - JS가 꺼진 경우 돌림판이 동작하지 않는 이유를 알린다. 서버 컴포넌트.
 */
export function LunchTodayNoscriptNoticeComponent(): JSX.Element {
  return (
    <noscript>
      <p className="rounded-lg border border-border bg-card p-4 text-sm leading-6 text-foreground">
        {LUNCH_NOSCRIPT_TEXT}
      </p>
    </noscript>
  );
}
