import type { JSX } from 'react';

import { LUCKY_DRAW_DISCLAIMER_TEXT } from '../../constants/lucky-draw-notice.constant';

/**
 * LuckyDrawDisclaimerNoticeComponent
 * - 상시 오락 고지. h1 바로 아래. 서버 컴포넌트.
 */
export function LuckyDrawDisclaimerNoticeComponent(): JSX.Element {
  return (
    <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm leading-6 text-foreground">
      {LUCKY_DRAW_DISCLAIMER_TEXT}
    </p>
  );
}
