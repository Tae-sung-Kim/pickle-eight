import type { JSX } from 'react';

import { LUCKY_DRAW_NOSCRIPT_TEXT } from '../../constants/lucky-draw-notice.constant';

/**
 * LuckyDrawNoscriptNoticeComponent
 * - JS가 꺼진 경우 도구가 동작하지 않는 이유를 알린다. 서버 컴포넌트.
 */
export function LuckyDrawNoscriptNoticeComponent(): JSX.Element {
  return (
    <noscript>
      <p className="rounded-lg border border-border bg-card p-4 text-sm leading-6 text-foreground">
        {LUCKY_DRAW_NOSCRIPT_TEXT}
      </p>
    </noscript>
  );
}
