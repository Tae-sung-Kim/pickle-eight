import type { JSX } from 'react';

import { TAROT_NOSCRIPT_NOTICE } from '@/features/tarot/constants/tarot-notice.constant';

/**
 * TarotNoscriptNoticeComponent
 * - JavaScript가 꺼진 경우에만 보이는 안내. 서버 컴포넌트.
 */
export function TarotNoscriptNoticeComponent(): JSX.Element {
  return (
    <noscript>
      <p className="rounded-lg border border-border bg-card p-4 text-sm text-foreground break-keep">
        {TAROT_NOSCRIPT_NOTICE}
      </p>
    </noscript>
  );
}
