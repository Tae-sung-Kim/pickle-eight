import type { JSX } from 'react';

import { CollapsibleComponent } from '@/components/common/collapsible.component';
import {
  FORTUNE_DETAIL_NOTICE_ITEMS,
  FORTUNE_DETAIL_NOTICE_TITLE,
} from '@/features/fortune/constants/fortune-notice.constant';

// 책임(첫 항)과 만 14세(마지막 항)는 접지 않는다(AC-48). 나머지는 접는다.
const ALWAYS_VISIBLE = [
  FORTUNE_DETAIL_NOTICE_ITEMS[0],
  FORTUNE_DETAIL_NOTICE_ITEMS[FORTUNE_DETAIL_NOTICE_ITEMS.length - 1],
];
const FOLDED = FORTUNE_DETAIL_NOTICE_ITEMS.slice(1, -1);

const LIST_CLASS = 'list-disc space-y-1 pl-5';

/**
 * FortuneDetailNoticeComponent
 * - 페이지 하단 이용 안내(h2 + 글머리 5항, AC-48). 가운데 3항만 접힌다. 서버 컴포넌트.
 */
export function FortuneDetailNoticeComponent(): JSX.Element {
  return (
    <section className="rounded-panel border border-border bg-card p-4 text-xs text-muted-foreground">
      <h2 className="mb-2 text-sm font-semibold text-foreground break-keep">
        {FORTUNE_DETAIL_NOTICE_TITLE}
      </h2>
      <ul className={LIST_CLASS}>
        {ALWAYS_VISIBLE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="mt-2">
        <CollapsibleComponent heading="이용 안내 더 보기">
          <ul className={LIST_CLASS}>
            {FOLDED.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CollapsibleComponent>
      </div>
    </section>
  );
}
