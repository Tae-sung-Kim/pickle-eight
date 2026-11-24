import Link from 'next/link';
import type { JSX } from 'react';

import { MenuListComponent } from '@/components/common/menu-list.component';
import { FORTUNE_COMPATIBILITY_HUB_INTRO } from '@/features/fortune/constants/fortune-compatibility-intro.constant';
import { FORTUNE_COMPATIBILITY_LABELS } from '@/features/fortune/constants/fortune-compatibility-label.constant';
import { FORTUNE_COMPATIBILITY_HUB_LIST_TEXTS } from '@/features/fortune/constants/fortune-compatibility-menu.constant';
import { FORTUNE_COMPATIBILITY_LINK_TEXTS } from '@/features/fortune/constants/fortune-compatibility-notice.constant';
import { FORTUNE_COMPATIBILITY_ROUTES } from '@/features/fortune/constants/fortune-compatibility-route.constant';
import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';
import type { MenuItemType } from '@/types/menu.type';

const LIST_HEADING_ID = 'fortune-compatibility-hub-list-heading';

const FINDER_LINKS = [
  { href: FORTUNE_ROUTES.tti, label: FORTUNE_COMPATIBILITY_LABELS.ttiFortune },
  {
    href: FORTUNE_ROUTES.starSign,
    label: FORTUNE_COMPATIBILITY_LABELS.starSignFortune,
  },
] as const;

/** 허브 목록 항목. MENU_LIST를 읽지 않고 궁합 상수에서 만든다 */
export const getFortuneCompatibilityHubItems = (): readonly MenuItemType[] => [
  {
    href: FORTUNE_COMPATIBILITY_ROUTES.tti,
    label: FORTUNE_COMPATIBILITY_LABELS.ttiCompatibility,
    icon: 'PawPrint',
    colorClass: 'text-menu-fortune',
    description: FORTUNE_COMPATIBILITY_HUB_LIST_TEXTS.ttiDescription,
  },
  {
    href: FORTUNE_COMPATIBILITY_ROUTES.starSign,
    label: FORTUNE_COMPATIBILITY_LABELS.starSignCompatibility,
    icon: 'Telescope',
    colorClass: 'text-menu-fortune',
    description: FORTUNE_COMPATIBILITY_HUB_LIST_TEXTS.starSignDescription,
  },
];

/**
 * FortuneCompatibilityHubComponent
 * - 궁합 허브 본문(서버 컴포넌트): 궁합 고르기 목록, 허브 가이드, 띠·별자리 확인 링크.
 * - 동의 게이트, 입력칸을 쓰지 않는다. 동의 전후 HTML이 같다.
 */
export function FortuneCompatibilityHubComponent(): JSX.Element {
  return (
    <div className="space-y-10">
      <section aria-labelledby={LIST_HEADING_ID} className="space-y-3">
        <h2
          id={LIST_HEADING_ID}
          className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl"
        >
          {FORTUNE_COMPATIBILITY_HUB_LIST_TEXTS.heading}
        </h2>
        <MenuListComponent items={getFortuneCompatibilityHubItems()} />
      </section>

      <section className="space-y-6">
        {FORTUNE_COMPATIBILITY_HUB_INTRO.map((section) => (
          <div key={section.heading} className="space-y-2">
            <h2 className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="max-w-[68ch] text-sm leading-7 text-foreground sm:text-base"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </section>

      <div className="sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-4">
        <p className="text-sm leading-6 break-keep text-muted-foreground">
          {FORTUNE_COMPATIBILITY_LINK_TEXTS.hubFinderNotice}
        </p>
        <div className="flex flex-col sm:flex-row sm:gap-x-4">
          {FINDER_LINKS.map((link) => (
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
    </div>
  );
}
