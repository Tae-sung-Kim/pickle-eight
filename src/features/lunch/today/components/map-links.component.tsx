import { ExternalLink } from 'lucide-react';
import type { JSX } from 'react';

import { Button } from '@/components/ui/button';
import {
  LUNCH_EXTERNAL_LINK_NOTICE_TEXT,
  LUNCH_MAP_LINKS_TITLE,
} from '@/features/lunch/constants/lunch-notice.constant';
import type { LunchMenuType } from '@/features/lunch/types/lunch.type';
import { buildLunchMapLinks } from '@/features/lunch/utils/lunch-map-link.util';

export type LunchTodayMapLinksComponentPropsType = Readonly<{
  menu: LunchMenuType;
}>;

/**
 * LunchTodayMapLinksComponent
 * - 지도 검색 링크 3개(새 탭). 스크립트 호출 없이 일반 <a>만 쓴다.
 */
export function LunchTodayMapLinksComponent({
  menu,
}: LunchTodayMapLinksComponentPropsType): JSX.Element {
  const links = buildLunchMapLinks(menu);

  return (
    <div className="space-y-3">
      <h3 className="break-keep text-base font-semibold leading-snug text-foreground">
        {LUNCH_MAP_LINKS_TITLE}
      </h3>
      <div className="flex flex-col gap-2 sm:flex-row">
        {links.map((link) => (
          <Button
            key={link.provider}
            asChild
            variant="outline"
            className="h-11 w-full whitespace-nowrap rounded-lg text-base font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex-1"
          >
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {link.label}
              <span className="sr-only">(새 탭에서 외부 사이트 열림)</span>
              <ExternalLink
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
            </a>
          </Button>
        ))}
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        {LUNCH_EXTERNAL_LINK_NOTICE_TEXT}
      </p>
    </div>
  );
}
