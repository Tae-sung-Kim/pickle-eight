import type { JSX } from 'react';

import { LUCKY_DRAW_RESULT_NOTICE_TEXT } from '../../constants/lucky-draw-notice.constant';

/**
 * LuckyDrawResultNoticeComponent
 * - 결과 영역 하단 보상 무관 고지. 결과가 없어도 항상 렌더링한다.
 */
export function LuckyDrawResultNoticeComponent(): JSX.Element {
  return (
    <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm leading-6 text-foreground">
      {LUCKY_DRAW_RESULT_NOTICE_TEXT}
    </p>
  );
}
