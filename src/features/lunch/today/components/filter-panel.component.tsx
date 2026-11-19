import { Check } from 'lucide-react';
import type { JSX } from 'react';

import { Button } from '@/components/ui/button';
import { LUNCH_CATEGORIES } from '@/features/lunch/constants/lunch-category.constant';
import {
  LUNCH_BROTH_GROUP_LABEL,
  LUNCH_BROTH_OPTION_LABELS,
  LUNCH_CANDIDATE_COUNT_TEMPLATE,
  LUNCH_CATEGORY_GROUP_LABEL,
  LUNCH_CLEAR_BROTH_BUTTON_LABEL,
  LUNCH_EMPTY_NO_CANDIDATE_TEXT,
  LUNCH_EMPTY_NO_CATEGORY_TEXT,
} from '@/features/lunch/constants/lunch-notice.constant';
import type {
  LunchBrothFilterType,
  LunchCategoryKeyType,
} from '@/features/lunch/types/lunch.type';
import { cn } from '@/lib/utils';

const BROTH_OPTIONS: readonly LunchBrothFilterType[] = ['all', 'soup', 'dry'];

const CHIP_BASE_CLASS =
  'inline-flex h-11 items-center gap-1.5 rounded-md border px-3 text-base font-medium break-keep';

export type LunchTodayFilterPanelComponentPropsType = Readonly<{
  categories: readonly LunchCategoryKeyType[];
  broth: LunchBrothFilterType;
  candidateCount: number;
  showClearBroth: boolean;
  /** 회전 중 */
  locked: boolean;
  /** 빈 상태 안내 블록 id (뽑기 버튼 aria-describedby가 가리킨다) */
  emptyNoticeId: string;
  onToggleCategory: (category: LunchCategoryKeyType) => void;
  onChangeBroth: (broth: LunchBrothFilterType) => void;
  onClearBroth: () => void;
}>;

/**
 * LunchTodayFilterPanelComponent
 * - 카테고리 칩(aria-pressed), 국물 라디오, 후보 수, 빈 상태 안내.
 * - 회전 중에는 disabled 대신 aria-disabled를 쓰고 핸들러에서 무시한다(포커스 유지).
 */
export function LunchTodayFilterPanelComponent({
  categories,
  broth,
  candidateCount,
  showClearBroth,
  locked,
  emptyNoticeId,
  onToggleCategory,
  onChangeBroth,
  onClearBroth,
}: LunchTodayFilterPanelComponentPropsType): JSX.Element {
  const noCategory = categories.length === 0;
  const noCandidate = candidateCount === 0;
  const lockedClass = locked ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <div className="space-y-4">
      <fieldset className="min-w-0">
        <legend className="mb-2 text-sm font-semibold leading-6 text-foreground">
          {LUNCH_CATEGORY_GROUP_LABEL}
        </legend>
        <div className="flex flex-wrap gap-2">
          {LUNCH_CATEGORIES.map((category) => {
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
                  'justify-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  pressed
                    ? 'border-menu-lunch bg-menu-lunch/10 hover:bg-menu-lunch/10'
                    : 'border-border bg-card text-foreground hover:border-menu-lunch/40 hover:bg-card',
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
            {LUNCH_BROTH_GROUP_LABEL}
          </legend>
          <div className="flex flex-wrap gap-2">
            {BROTH_OPTIONS.map((option) => {
              const checked = broth === option;
              const inputId = `lunch-broth-${option}`;
              return (
                <div key={option}>
                  <input
                    id={inputId}
                    type="radio"
                    name="lunch-broth"
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
                        ? 'border-menu-lunch bg-menu-lunch/10'
                        : 'border-border bg-card text-foreground hover:border-menu-lunch/40',
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
                    {LUNCH_BROTH_OPTION_LABELS[option]}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>
        {!noCategory && !noCandidate ? (
          <p className="mt-4 text-sm leading-6 text-muted-foreground md:mt-0">
            {LUNCH_CANDIDATE_COUNT_TEMPLATE.replace(
              '{n}',
              String(candidateCount)
            )}
          </p>
        ) : null}
      </div>

      {/* 항상 마운트된 status 껍데기. 내용만 조건부 */}
      <div id={emptyNoticeId} role="status">
        {noCategory || noCandidate ? (
          <p className="rounded-panel border border-menu-lunch/30 bg-menu-lunch/10 px-4 py-3 text-sm leading-7 text-foreground sm:text-base">
            {noCategory
              ? LUNCH_EMPTY_NO_CATEGORY_TEXT
              : LUNCH_EMPTY_NO_CANDIDATE_TEXT}
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
          {LUNCH_CLEAR_BROTH_BUTTON_LABEL}
        </Button>
      ) : null}
    </div>
  );
}
