import type { JSX } from 'react';

import { DREAM_DISCLAIMER_TEXT } from '@/features/dream/constants/dream-notice.constant';

/**
 * DreamDisclaimerNoticeComponent
 * - 상시 면책. h1 바로 아래에 둔다. 접기·툴팁 없음. 서버 컴포넌트.
 */
export function DreamDisclaimerNoticeComponent(): JSX.Element {
  return (
    <p className="mx-auto max-w-2xl rounded-lg border border-border bg-card px-4 py-3 text-left text-sm leading-6 break-keep text-muted-foreground">
      {DREAM_DISCLAIMER_TEXT}
    </p>
  );
}
