import type { JSX } from 'react';

import {
  DREAM_BOTTOM_NOTICE_TEXT,
  DREAM_JUDGMENT_NOTICE_TEXT,
} from '@/features/dream/constants/dream-notice.constant';

/**
 * DreamBottomNoticeComponent
 * - 하단 짧은 면책 + 판단 책임. 상시 면책과 같은 상자. 서버 컴포넌트.
 */
export function DreamBottomNoticeComponent(): JSX.Element {
  return (
    <div className="space-y-1 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm leading-6 break-keep text-muted-foreground">
      <p>{DREAM_BOTTOM_NOTICE_TEXT}</p>
      <p>{DREAM_JUDGMENT_NOTICE_TEXT}</p>
    </div>
  );
}
