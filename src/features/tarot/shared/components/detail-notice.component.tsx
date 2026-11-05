import type { JSX } from 'react';

import {
  TAROT_DETAIL_NOTICE_ITEMS,
  TAROT_DETAIL_NOTICE_TITLE,
} from '@/features/tarot/constants/tarot-notice.constant';

/**
 * TarotDetailNoticeComponent
 * - 페이지 하단 상세 안내(h2 + 글머리 8항). 서버 컴포넌트.
 */
export function TarotDetailNoticeComponent(): JSX.Element {
  return (
    <section className="rounded-panel border border-border bg-card p-4 text-xs text-muted-foreground">
      <h2 className="mb-2 text-sm font-semibold text-foreground break-keep">
        {TAROT_DETAIL_NOTICE_TITLE}
      </h2>
      <ul className="list-disc space-y-1 pl-5">
        {TAROT_DETAIL_NOTICE_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
