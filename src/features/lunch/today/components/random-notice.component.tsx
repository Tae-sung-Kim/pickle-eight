import type { JSX } from 'react';

import {
  LUNCH_NO_REWARD_NOTICE_TEXT,
  LUNCH_RANDOM_NOTICE_TEXT,
} from '@/features/lunch/constants/lunch-notice.constant';

/**
 * LunchTodayRandomNoticeComponent
 * - 무작위 고지 + 보상 없음 고지(U5). 결과가 없어도 항상 보인다. 서버 컴포넌트.
 */
export function LunchTodayRandomNoticeComponent(): JSX.Element {
  return (
    <div className="space-y-1 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm leading-6 text-muted-foreground">
      <p>{LUNCH_RANDOM_NOTICE_TEXT}</p>
      <p>{LUNCH_NO_REWARD_NOTICE_TEXT}</p>
    </div>
  );
}
