import type { JSX } from 'react';
import { useId } from 'react';

import { MEAL_LIST } from '@/features/meal/constants/meal.constant';
import { MEAL_PICKER_GROUP_LABEL } from '@/features/meal/constants/meal-notice.constant';
import type { MealKeyType } from '@/features/meal/types/meal.type';
import { cn } from '@/lib/utils';

export type MealRouletteMealPickerComponentPropsType = Readonly<{
  meal: MealKeyType;
  /** 회전 중 */
  locked: boolean;
  onChangeMeal: (meal: MealKeyType) => void;
}>;

/**
 * MealRouletteMealPickerComponent
 * - 끼니 3택. 기본 라디오 + label을 3칸 스위치 모양으로 꾸민다.
 * - 회전 중에는 disabled 대신 aria-disabled를 쓰고 핸들러에서 무시한다(포커스 유지).
 */
export function MealRouletteMealPickerComponent({
  meal,
  locked,
  onChangeMeal,
}: MealRouletteMealPickerComponentPropsType): JSX.Element {
  const groupId = useId();

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-semibold leading-6 text-foreground">
        {MEAL_PICKER_GROUP_LABEL}
      </legend>
      <div className="grid grid-cols-3 gap-0 rounded-lg border border-border bg-card p-1 sm:max-w-sm">
        {MEAL_LIST.map((option) => {
          const checked = meal === option.key;
          const inputId = `${groupId}-${option.key}`;
          return (
            <div key={option.key} className="min-w-0">
              <input
                id={inputId}
                type="radio"
                name={`${groupId}-meal`}
                value={option.key}
                checked={checked}
                aria-disabled={locked ? true : undefined}
                onChange={() => {
                  if (locked) {
                    return;
                  }
                  onChangeMeal(option.key);
                }}
                className="peer sr-only"
              />
              <label
                htmlFor={inputId}
                className={cn(
                  'flex min-h-12 cursor-pointer items-center justify-center rounded-md px-2 text-center text-base break-keep peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card',
                  checked
                    ? 'bg-menu-meal font-semibold text-primary-foreground'
                    : 'font-medium text-foreground hover:bg-menu-meal/10',
                  locked ? 'opacity-60 cursor-not-allowed' : ''
                )}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
