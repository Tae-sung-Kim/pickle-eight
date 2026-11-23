import { Check } from 'lucide-react';
import type { JSX } from 'react';

import { Button } from '@/components/ui/button';
import {
  MEAL_BROTH_GROUP_LABEL,
  MEAL_BROTH_OPTION_LABELS,
  MEAL_CANDIDATE_COUNT_TEMPLATE,
  MEAL_CATEGORY_GROUP_LABEL,
  MEAL_CLEAR_BROTH_BUTTON_LABEL,
  MEAL_EMPTY_NO_CANDIDATE_TEXT,
} from '@/features/meal/constants/meal-notice.constant';
import type {
  MealBrothFilterType,
  MealCategoryKeyType,
  MealCategoryType,
} from '@/features/meal/types/meal.type';
import { cn } from '@/lib/utils';

const BROTH_OPTIONS: readonly MealBrothFilterType[] = ['all', 'soup', 'dry'];

const CHIP_BASE_CLASS =
  'inline-flex h-11 items-center gap-1.5 rounded-md border px-3 text-base font-medium break-keep';

export type MealRouletteFilterPanelComponentPropsType = Readonly<{
  /** 현재 끼니의 카테고리 칩 목록 */
  categoryOptions: readonly MealCategoryType[];
  categories: readonly MealCategoryKeyType[];
  broth: MealBrothFilterType;
  candidateCount: number;
  showClearBroth: boolean;
  /** 회전 중 */
  locked: boolean;
  /** 빈 상태 안내 블록 id (뽑기 버튼 aria-describedby가 가리킨다) */
  emptyNoticeId: string;
  onToggleCategory: (category: MealCategoryKeyType) => void;
  onChangeBroth: (broth: MealBrothFilterType) => void;
  onClearBroth: () => void;
}>;

/**
 * MealRouletteFilterPanelComponent
 * - 카테고리 칩(aria-pressed), 국물 라디오, 후보 수, 빈 상태 안내.
 * - 회전 중에는 disabled 대신 aria-disabled를 쓰고 핸들러에서 무시한다(포커스 유지).
 */
export function MealRouletteFilterPanelComponent({
  categoryOptions,
  categories,
  broth,
  candidateCount,
  showClearBroth,
  locked,
  emptyNoticeId,
  onToggleCategory,
  onChangeBroth,
  onClearBroth,
}: MealRouletteFilterPanelComponentPropsType): JSX.Element {
  const noCandidate = candidateCount === 0;
  const lockedClass = locked ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <div className="space-y-4">
      <fieldset className="min-w-0">
        <legend className="mb-2 text-sm font-semibold leading-6 text-foreground">
          {MEAL_CATEGORY_GROUP_LABEL}
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {categoryOptions.map((category) => {
            const pressed = categories.includes(category.key);
            return (
              <Button
                key={category.key}
                type="button"
                variant="outline"
                aria-pressed={pressed}
                aria-disabled={locked ? true : undefined}
                onClick={() => {
                  if (locked) {
                    return;
                  }
                  onToggleCategory(category.key);
                }}
                className={cn(
                  CHIP_BASE_CLASS,
                  'w-full justify-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  pressed
                    ? 'border-menu-meal bg-menu-meal/10 hover:bg-menu-meal/10'
                    : 'border-border bg-card text-foreground hover:border-menu-meal/40 hover:bg-card',
                  lockedClass
                )}
              >
                <Check
                  aria-hidden="true"
                  className={cn('size-4', pressed ? 'visible' : 'invisible')}
                />
                {category.label}
              </Button>
            );
          })}
        </div>
      </fieldset>

      <div className="md:flex md:items-end md:justify-between md:gap-4">
        <fieldset className="min-w-0 space-y-2">
          <legend className="mb-2 text-sm font-semibold leading-6 text-foreground">
            {MEAL_BROTH_GROUP_LABEL}
          </legend>
          <div className="flex flex-wrap gap-2">
            {BROTH_OPTIONS.map((option) => {
              const checked = broth === option;
              const inputId = `meal-broth-${option}`;
              return (
                <div key={option}>
                  <input
                    id={inputId}
                    type="radio"
                    name="meal-broth"
                    value={option}
                    checked={checked}
                    aria-disabled={locked ? true : undefined}
                    onChange={() => {
                      if (locked) {
                        return;
                      }
                      onChangeBroth(option);
                    }}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={inputId}
                    className={cn(
                      CHIP_BASE_CLASS,
                      'cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
                      checked
                        ? 'border-menu-meal bg-menu-meal/10'
                        : 'border-border bg-card text-foreground hover:border-menu-meal/40',
                      lockedClass
                    )}
                  >
                    <Check
                      aria-hidden="true"
                      className={cn(
                        'size-4',
                        checked ? 'visible' : 'invisible'
                      )}
                    />
                    {MEAL_BROTH_OPTION_LABELS[option]}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>
        {!noCandidate ? (
          <p className="mt-4 text-sm leading-6 text-muted-foreground md:mt-0">
            {MEAL_CANDIDATE_COUNT_TEMPLATE.replace(
              '{n}',
              String(candidateCount)
            )}
          </p>
        ) : null}
      </div>

      {/* 항상 마운트된 status 껍데기. 내용만 조건부 */}
      <div id={emptyNoticeId} role="status">
        {noCandidate ? (
          <p className="rounded-panel border border-menu-meal/30 bg-menu-meal/10 px-4 py-3 text-sm leading-7 text-foreground sm:text-base">
            {MEAL_EMPTY_NO_CANDIDATE_TEXT}
          </p>
        ) : null}
      </div>
      {showClearBroth ? (
        <Button
          type="button"
          variant="outline"
          onClick={onClearBroth}
          className="h-11 rounded-lg text-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {MEAL_CLEAR_BROTH_BUTTON_LABEL}
        </Button>
      ) : null}
    </div>
  );
}
