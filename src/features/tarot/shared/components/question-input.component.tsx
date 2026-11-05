'use client';

import { type JSX, type KeyboardEvent, useId } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TAROT_SENSITIVE_INPUT_NOTICE } from '@/features/tarot/constants/tarot-notice.constant';
import {
  TAROT_QUESTION_LABEL,
  TAROT_QUESTION_LIMIT_NOTICE,
  TAROT_QUESTION_MAX_LENGTH,
} from '@/features/tarot/constants/tarot-question.constant';
import { cn } from '@/lib/utils';

export type TarotQuestionInputComponentPropsType = {
  value: string;
  onValueChange: (value: string) => void;
  /** Enter 입력 시 호출(뽑기 버튼과 같은 동작). 폼 제출은 하지 않는다 */
  onEnter?: () => void;
  placeholder: string;
};

/**
 * TarotQuestionInputComponent
 * - Controlled 한 줄 입력. 질문은 부모 state에만 있고 여기서 저장·전송하지 않는다.
 * - <form>으로 감싸지 않고, name 속성을 주지 않는다.
 */
export function TarotQuestionInputComponent({
  value,
  onValueChange,
  onEnter,
  placeholder,
}: TarotQuestionInputComponentPropsType): JSX.Element {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const noticeId = `${baseId}-notice`;
  const countId = `${baseId}-count`;

  const isAtLimit = value.length >= TAROT_QUESTION_MAX_LENGTH;

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    // 한글 조합 중 Enter는 글자 확정이므로 무시한다
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    onEnter?.();
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId} className="text-sm font-medium">
        {TAROT_QUESTION_LABEL}
      </Label>
      <Input
        id={inputId}
        type="text"
        autoComplete="off"
        maxLength={TAROT_QUESTION_MAX_LENGTH}
        placeholder={placeholder}
        value={value}
        onChange={(event) =>
          onValueChange(event.target.value.slice(0, TAROT_QUESTION_MAX_LENGTH))
        }
        onKeyDown={handleKeyDown}
        aria-describedby={`${noticeId} ${countId}`}
        className="rounded-lg"
      />
      <div className="flex items-start justify-between gap-3">
        <p
          id={noticeId}
          className="max-w-[68ch] text-xs leading-5 text-muted-foreground"
        >
          {TAROT_SENSITIVE_INPUT_NOTICE}
        </p>
        <div className="flex shrink-0 flex-col items-end text-xs leading-5">
          <span
            id={countId}
            className={cn(
              'text-muted-foreground',
              isAtLimit && 'font-medium text-foreground'
            )}
          >
            {value.length}/{TAROT_QUESTION_MAX_LENGTH}
          </span>
          <span
            aria-live="polite"
            className="text-right font-medium break-keep text-foreground"
          >
            {isAtLimit ? TAROT_QUESTION_LIMIT_NOTICE : null}
          </span>
        </div>
      </div>
    </div>
  );
}
