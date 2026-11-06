import type { JSX } from 'react';

import {
  FORTUNE_DETAIL_NOTICE_ITEMS,
  FORTUNE_DETAIL_NOTICE_TITLE,
} from '@/features/fortune/constants/fortune-notice.constant';

/**
 * FortuneDetailNoticeComponent
 * - 페이지 하단 이용 안내(h2 + 글머리 9항, AC-48). 서버 컴포넌트.
 */
export function FortuneDetailNoticeComponent(): JSX.Element {
  return (
    <section className="rounded-panel border border-border bg-card p-4 text-xs text-muted-foreground">
      <h2 className="mb-2 text-sm font-semibold text-foreground break-keep">
        {FORTUNE_DETAIL_NOTICE_TITLE}
      </h2>
      <ul className="list-disc space-y-1 pl-5">
        {FORTUNE_DETAIL_NOTICE_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
