import type { JSX } from 'react';

import {
  DREAM_DETAIL_NOTICE_ITEMS,
  DREAM_DETAIL_NOTICE_TITLE,
} from '@/features/dream/constants/dream-notice.constant';

/**
 * DreamHubDetailNoticeComponent
 * - 허브 상세 안내 2항. 상자 없는 글. 서버 컴포넌트.
 */
export function DreamHubDetailNoticeComponent(): JSX.Element {
  return (
    <section className="space-y-2">
      <h2 className="text-lg leading-tight font-semibold break-keep text-foreground">
        {DREAM_DETAIL_NOTICE_TITLE}
      </h2>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-7 break-keep text-foreground">
        {DREAM_DETAIL_NOTICE_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
