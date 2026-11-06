import type { JSX } from 'react';

import { FORTUNE_DISCLAIMER_TEXT } from '@/features/fortune/constants/fortune-notice.constant';

/**
 * FortuneDisclaimerNoticeComponent
 * - 상시 면책 문구. h1 바로 아래에 둔다(허브 포함). 서버 컴포넌트, 접기·툴팁 없음.
 */
export function FortuneDisclaimerNoticeComponent(): JSX.Element {
  return (
    <p className="mx-auto max-w-2xl rounded-lg border border-border bg-card px-4 py-3 text-center text-sm leading-6 break-keep text-muted-foreground">
      {FORTUNE_DISCLAIMER_TEXT}
    </p>
  );
}
