import type { JSX } from 'react';

import { DREAM_SEARCH_NOSCRIPT_TEXT } from '@/features/dream/constants/dream-notice.constant';

/**
 * DreamHubNoscriptNoticeComponent
 * - JS가 꺼진 경우 검색이 안 되는 이유를 알린다. 서버 컴포넌트.
 */
export function DreamHubNoscriptNoticeComponent(): JSX.Element {
  return (
    <noscript>
      <p className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-4 text-sm leading-6 text-foreground">
        {DREAM_SEARCH_NOSCRIPT_TEXT}
      </p>
    </noscript>
  );
}
