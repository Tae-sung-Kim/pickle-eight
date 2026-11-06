import type { JSX } from 'react';

import { FORTUNE_NOSCRIPT_NOTICE } from '@/features/fortune/constants/fortune-notice.constant';

/**
 * FortuneNoscriptNoticeComponent
 * - JavaScript가 꺼진 경우에만 보이는 안내(AC-72). 서버 컴포넌트.
 */
export function FortuneNoscriptNoticeComponent(): JSX.Element {
  return (
    <noscript>
      <p className="rounded-lg border border-border bg-card p-4 text-sm text-foreground break-keep">
        {FORTUNE_NOSCRIPT_NOTICE}
      </p>
    </noscript>
  );
}
