import { ExternalLink } from 'lucide-react';
import type { JSX } from 'react';

import { Button } from '@/components/ui/button';
import {
  MEAL_AREA_PREVIEW_LABEL,
  MEAL_AREA_RESULT_NOTICE_TEXT,
  MEAL_EXTERNAL_LINK_NOTICE_TEXT,
  MEAL_MAP_LINKS_TITLE,
} from '@/features/meal/constants/meal-notice.constant';
import type {
  MealAreaInputResultType,
  MealMenuType,
} from '@/features/meal/types/meal.type';
import {
  buildMealMapLinks,
  getMealMapSearchText,
} from '@/features/meal/utils/meal-map-link.util';

export type MealRouletteMapLinksComponentPropsType = Readonly<{
  menu: MealMenuType;
  area: MealAreaInputResultType;
}>;

/**
 * MealRouletteMapLinksComponent
 * - 지도 검색 링크 3개(새 탭). 스크립트 호출 없이 일반 <a>만 쓴다.
 */
export function MealRouletteMapLinksComponent({
  menu,
  area,
}: MealRouletteMapLinksComponentPropsType): JSX.Element {
  const links = buildMealMapLinks(menu, area);

  return (
    <div className="space-y-3">
      <h3 className="break-keep text-base font-semibold leading-snug text-foreground">
        {MEAL_MAP_LINKS_TITLE}
      </h3>
      {area.status === 'valid' && (
        <>
          <dl className="rounded-md bg-menu-meal/10 px-3 py-2">
            <dt className="text-sm font-medium leading-6 text-muted-foreground">
              {MEAL_AREA_PREVIEW_LABEL}
            </dt>
            <dd className="break-words text-base font-semibold leading-snug text-foreground">
              {getMealMapSearchText(menu, area)}
            </dd>
          </dl>
          <p className="text-sm leading-6 text-muted-foreground">
            {MEAL_AREA_RESULT_NOTICE_TEXT}
          </p>
        </>
      )}
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <Button
            key={link.provider}
            asChild
            variant="outline"
            className="h-11 w-full whitespace-nowrap rounded-lg text-base font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
        {MEAL_EXTERNAL_LINK_NOTICE_TEXT}
      </p>
    </div>
  );
}
