import Link from 'next/link';
import type { JSX } from 'react';

import { FORTUNE_COMPATIBILITY_MENU_TEXTS } from '@/features/fortune/constants/fortune-compatibility-menu.constant';
import { FORTUNE_COMPATIBILITY_LINK_TEXTS } from '@/features/fortune/constants/fortune-compatibility-notice.constant';
import { FORTUNE_COMPATIBILITY_ROUTES } from '@/features/fortune/constants/fortune-compatibility-route.constant';

const CROSS_LINKS = {
  tti: {
    href: FORTUNE_COMPATIBILITY_ROUTES.starSign,
    label: FORTUNE_COMPATIBILITY_LINK_TEXTS.starSignLabel,
  },
  'star-sign': {
    href: FORTUNE_COMPATIBILITY_ROUTES.tti,
    label: FORTUNE_COMPATIBILITY_LINK_TEXTS.ttiLabel,
  },
} as const;

const HUB_LINK = {
  href: FORTUNE_COMPATIBILITY_ROUTES.hub,
  label: FORTUNE_COMPATIBILITY_MENU_TEXTS.label,
} as const;

type FortuneCompatibilityCrossLinkPropsType = Readonly<{
  /** 지금 보고 있는 궁합 페이지. 반대쪽 궁합과 허브로 잇는다 */
  current: keyof typeof CROSS_LINKS;
}>;

/**
 * FortuneCompatibilityCrossLinkComponent
 * - 띠 궁합 ↔ 별자리 궁합, 허브 링크. 안내 한 줄 + 링크(상자·아이콘 없음). 서버 컴포넌트.
 */
export function FortuneCompatibilityCrossLinkComponent({
  current,
}: FortuneCompatibilityCrossLinkPropsType): JSX.Element {
  const links = [CROSS_LINKS[current], HUB_LINK];
  return (
    <div className="sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-4">
      <p className="text-sm leading-6 break-keep text-muted-foreground">
        {FORTUNE_COMPATIBILITY_LINK_TEXTS.crossNotice}
      </p>
      <div className="flex flex-col sm:flex-row sm:gap-x-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 items-center rounded-sm text-base font-medium break-keep text-primary underline underline-offset-4 hover:decoration-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
