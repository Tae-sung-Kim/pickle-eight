'use client';

import { CircleAlert } from 'lucide-react';
import type { ChangeEvent, JSX } from 'react';

import { cn } from '@/lib/utils';
import { LUCKY_DRAW_INPUT_MAX_CHARS } from '../../constants/lucky-draw-limit.constant';
import { LUCKY_DRAW_INPUT_NOTICE_TEXT } from '../../constants/lucky-draw-notice.constant';

type LuckyDrawLinesInputPropsType = Readonly<{
  /** textarea id. 안내·개수·오류 id의 접두어로도 쓴다 */
  id: string;
  label: string;
  value: string;
  onChange: (text: string) => void;
  /** 줄바꿈으로 세 줄 */
  placeholder: string;
  /** 예: "3 / 10명" */
  countText: string;
  /** 연출 중 잠금 (readOnly + aria-disabled) */
  isLocked?: boolean;
  /** 입력란 아래 오류 문장 (text-destructive + CircleAlert) */
  errorText?: string | null;
  /** 입력 안내 문장을 이 입력 아래에 그린다. 사다리의 두 번째 입력은 false로 두고 noticeId만 연결 */
  showNotice?: boolean;
  /** 외부에 있는 입력 안내 id (showNotice가 false일 때 연결) */
  externalNoticeId?: string;
}>;

/**
 * LuckyDrawLinesInputComponent
 * - 줄 단위 textarea + 개수 + 오류 + 입력 안내. Controlled.
 */
export function LuckyDrawLinesInputComponent({
  id,
  label,
  value,
  onChange,
  placeholder,
  countText,
  isLocked = false,
  errorText = null,
  showNotice = true,
  externalNoticeId,
}: LuckyDrawLinesInputPropsType): JSX.Element {
  const countId = `${id}-count`;
  const errorId = `${id}-error`;
  const noticeId = showNotice ? `${id}-notice` : externalNoticeId;
  const describedBy =
    [countId, errorText ? errorId : null, noticeId].filter(Boolean).join(' ') ||
    undefined;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    if (isLocked) return;
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="text-sm font-semibold leading-6 text-foreground"
        >
          {label}
        </label>
        <span
          id={countId}
          className="font-mono text-sm leading-6 text-muted-foreground"
        >
          {countText}
        </span>
      </div>
      <textarea
        id={id}
        value={value}
        onChange={handleChange}
        readOnly={isLocked}
        aria-disabled={isLocked ? 'true' : undefined}
        aria-describedby={describedBy}
        maxLength={LUCKY_DRAW_INPUT_MAX_CHARS}
        placeholder={placeholder}
        rows={6}
        className={cn(
          'block min-h-36 w-full resize-y rounded-lg border border-border bg-card px-3 py-2 text-base leading-6 text-foreground placeholder:text-muted-foreground hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isLocked && 'opacity-60'
        )}
      />
      {errorText ? (
        <p
          id={errorId}
          className="flex items-start gap-2 text-sm leading-6 text-destructive"
        >
          <CircleAlert className="mt-1 size-4 shrink-0" aria-hidden="true" />
          <span>{errorText}</span>
        </p>
      ) : null}
      {showNotice ? (
        <p
          id={`${id}-notice`}
          className="text-sm leading-6 text-muted-foreground"
        >
          {LUCKY_DRAW_INPUT_NOTICE_TEXT}
        </p>
      ) : null}
    </div>
  );
}
