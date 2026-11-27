import Link from 'next/link';
import type { JSX } from 'react';

import {
  MENU_LABEL_BY_HREF,
  RESULT_NEXT_LINK_SUFFIX,
  RESULT_NEXT_LINK_TARGETS,
  RESULT_NEXT_LINKS_TITLE,
  type ResultNextLinkFromType,
} from '@/constants/result-next-links.constant';

/**
 * ResultNextLinksComponent
 * - 결과 아래 다른 기능 이동 링크 2개. 훅·상태 없음(결과가 있을 때만 부르는 쪽에서 렌더링한다).
 * - 쿼리·해시·광고 없음. 모양은 FortuneCompatibilityLinkComponent와 같다.
 */
export function ResultNextLinksComponent({
  from,
}: Readonly<{ from: ResultNextLinkFromType }>): JSX.Element {
  return (
    <nav aria-label={RESULT_NEXT_LINKS_TITLE}>
      <p className="text-sm leading-6 break-keep text-muted-foreground">
        {RESULT_NEXT_LINKS_TITLE}
      </p>
      <ul className="flex flex-wrap gap-x-6">
        {RESULT_NEXT_LINK_TARGETS[from].map((href) => (
          <li key={href}>
            <Link
              href={href}
              className="inline-flex min-h-11 items-center rounded-sm text-base font-medium break-keep text-primary underline underline-offset-4 hover:decoration-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              {MENU_LABEL_BY_HREF.get(href)}
              {RESULT_NEXT_LINK_SUFFIX}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
