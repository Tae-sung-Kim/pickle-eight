import type { JSX } from 'react';
import { useId } from 'react';

import {
  MEAL_PLACEHOLDER_IDLE_TEXT,
  MEAL_PLACEHOLDER_SPINNING_TEXT,
  MEAL_RESULT_NOTICE_TEXT,
} from '@/features/meal/constants/meal-notice.constant';
import { MealRouletteMapLinksComponent } from '@/features/meal/roulette/components/map-links.component';
import type { MealMenuType } from '@/features/meal/types/meal.type';

export type MealRouletteResultComponentPropsType = Readonly<{
  /** 결과 메뉴. null이면 PC 자리 표시만 그린다 */
  menu: MealMenuType | null;
  categoryLabel: string;
  /** 운세 라벨. 예: '오늘의 점심운' */
  luckLabel: string;
  luckLine: string;
  spinning: boolean;
}>;

/**
 * MealRouletteResultComponent
 * - 결과 카드(버튼 없음). 결과가 없으면 PC에서만 장식 자리 표시를 그린다.
 */
export function MealRouletteResultComponent({
  menu,
  categoryLabel,
  luckLabel,
  luckLine,
  spinning,
}: MealRouletteResultComponentPropsType): JSX.Element {
  const titleId = useId();

  if (!menu) {
    return (
      <div
        aria-hidden="true"
        className="hidden min-h-40 items-center justify-center rounded-panel border border-dashed border-border px-6 text-center text-sm text-muted-foreground md:flex"
      >
        {spinning ? MEAL_PLACEHOLDER_SPINNING_TEXT : MEAL_PLACEHOLDER_IDLE_TEXT}
      </div>
    );
  }

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-5 rounded-panel border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2
          id={titleId}
          className="break-keep text-3xl font-bold leading-tight text-foreground sm:text-4xl"
        >
          {menu.name}
        </h2>
        <span className="rounded-md border border-menu-meal/40 px-2 py-0.5 text-sm font-medium leading-6 text-menu-meal">
          {categoryLabel}
        </span>
      </div>
      <div className="space-y-1 border-l-4 border-menu-meal pl-4">
        <p className="text-sm font-semibold leading-6 text-menu-meal">
          {luckLabel}
        </p>
        <p className="max-w-[68ch] text-base leading-8 sm:text-lg">
          {luckLine}
        </p>
      </div>
      <MealRouletteMapLinksComponent menu={menu} />
      <p className="border-t border-border pt-4 text-sm leading-6 text-muted-foreground">
        {MEAL_RESULT_NOTICE_TEXT}
      </p>
    </section>
  );
}
