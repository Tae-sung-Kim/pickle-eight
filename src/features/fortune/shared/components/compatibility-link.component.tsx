import Link from 'next/link';
import type { JSX } from 'react';

import { FORTUNE_COMPATIBILITY_LABELS } from '@/features/fortune/constants/fortune-compatibility-label.constant';
import { FORTUNE_COMPATIBILITY_ROUTES } from '@/features/fortune/constants/fortune-compatibility-route.constant';

// 승인 문구: docs/compatibility/fixed-copy-draft.md 연결 링크(Q-6)
const COMPATIBILITY_LINK_INTRO = '두 사람의 관계는 따로 볼 수 있습니다.';

const COMPATIBILITY_LINKS = {
  tti: {
    href: FORTUNE_COMPATIBILITY_ROUTES.tti,
    label: FORTUNE_COMPATIBILITY_LABELS.ttiCompatibility,
  },
  'star-sign': {
    href: FORTUNE_COMPATIBILITY_ROUTES.starSign,
    label: FORTUNE_COMPATIBILITY_LABELS.starSignCompatibility,
  },
} as const;

type FortuneCompatibilityLinkPropsType = Readonly<{
  target: keyof typeof COMPATIBILITY_LINKS;
}>;

/**
 * FortuneCompatibilityLinkComponent
 * - 띠별·별자리 운세 페이지에서 해당 궁합 페이지로 가는 링크. 서버 컴포넌트.
 * - 오늘의 운세 링크와 같은 모양(안내 한 줄 + 링크 한 줄). 쿼리·해시 없음.
 */
export function FortuneCompatibilityLinkComponent({
  target,
}: FortuneCompatibilityLinkPropsType): JSX.Element {
  const { href, label } = COMPATIBILITY_LINKS[target];

  return (
    <div className="sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-2">
      <p className="text-sm leading-6 break-keep text-muted-foreground">
        {COMPATIBILITY_LINK_INTRO}
      </p>
      <Link
        href={href}
        className="inline-flex min-h-11 items-center rounded-sm text-base font-medium break-keep text-primary underline underline-offset-4 hover:decoration-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
      >
        {label}
      </Link>
    </div>
  );
}
