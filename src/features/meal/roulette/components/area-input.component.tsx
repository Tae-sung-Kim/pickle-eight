import { CircleAlert, X } from 'lucide-react';
import type { ChangeEvent, CompositionEvent, JSX } from 'react';
import { useId, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MEAL_AREA_INPUT_HARD_LIMIT } from '@/features/meal/constants/meal-area.constant';
import {
  MEAL_AREA_CLEAR_BUTTON_LABEL,
  MEAL_AREA_ERROR_TEXT,
  MEAL_AREA_INPUT_LABEL,
  MEAL_AREA_INPUT_PLACEHOLDER,
  MEAL_AREA_NOTICE_LINES,
} from '@/features/meal/constants/meal-notice.constant';
import type { MealAreaInputErrorType } from '@/features/meal/types/meal.type';

export type MealRouletteAreaInputComponentPropsType = Readonly<{
  /** 입력란 표시값 (조합 중 글자 포함) */
  value: string;
  /** 확정값 검사 오류. 없으면 null */
  error: MealAreaInputErrorType | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => void;
  onClear: () => void;
}>;

/**
 * MealRouletteAreaInputComponent
 * - 동네 이름 입력란. form을 쓰지 않는다(Enter 제출 금지). 회전 중에도 잠그지 않는다.
 */
export function MealRouletteAreaInputComponent({
  value,
  error,
  onChange,
  onCompositionEnd,
  onClear,
}: MealRouletteAreaInputComponentPropsType): JSX.Element {
  const inputId = useId();
  const errorId = useId();
  const noticeId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const errorText =
    error === null
      ? null
      : error === 'too_long'
        ? MEAL_AREA_ERROR_TEXT.tooLong
        : error === 'too_many_digits'
          ? MEAL_AREA_ERROR_TEXT.tooManyDigits
          : MEAL_AREA_ERROR_TEXT.invalidChar;
  const describedBy = error === null ? noticeId : `${errorId} ${noticeId}`;

  function handleClear() {
    onClear();
    inputRef.current?.focus();
  }

  return (
    <div>
      <Label
        htmlFor={inputId}
        className="mb-2 text-sm font-semibold leading-6 text-foreground"
      >
        {MEAL_AREA_INPUT_LABEL}
      </Label>
      <div className="relative sm:max-w-sm">
        <Input
          ref={inputRef}
          id={inputId}
          type="text"
          value={value}
          maxLength={MEAL_AREA_INPUT_HARD_LIMIT}
          placeholder={MEAL_AREA_INPUT_PLACEHOLDER}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-invalid={error !== null}
          aria-describedby={describedBy}
          onChange={onChange}
          onCompositionEnd={onCompositionEnd}
          className="h-11 rounded-lg border-muted-foreground bg-card pr-11 md:text-base"
        />
        {value !== '' && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={MEAL_AREA_CLEAR_BUTTON_LABEL}
            onClick={handleClear}
            className="absolute inset-y-0 right-0 h-11 w-11 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4 text-muted-foreground" />
          </Button>
        )}
      </div>
      <div aria-live="polite" className="mt-2 empty:mt-0">
        {errorText !== null && (
          <p
            id={errorId}
            className="flex items-start gap-2 break-keep text-sm leading-6 text-destructive"
          >
            <CircleAlert aria-hidden="true" className="mt-1 size-4 shrink-0" />
            <span>{errorText}</span>
          </p>
        )}
      </div>
      <ul
        id={noticeId}
        className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground sm:max-w-2xl"
      >
        {MEAL_AREA_NOTICE_LINES.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
