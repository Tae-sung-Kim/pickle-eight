'use client';

import { AlertCircle } from 'lucide-react';
import {
  type FormEvent,
  type JSX,
  type Ref,
  useId,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FortuneClockTimeType } from '@/features/fortune/types/fortune.type';
import { cn } from '@/lib/utils';

// 시각 질문 문구. ui-ux-design.md "승인됨(2026-11-05)" 문구. 운세 상수 파일에는 아직 없어 이 파일에 둔다
const BIRTH_TIME_TEXTS = {
  title: '태어난 시각',
  hour: '시',
  minute: '분',
  help: '24시간 형식으로 입력합니다. 예를 들어 오후 3시 5분은 15시 5분입니다.',
  rangeError: '시는 0부터 23까지, 분은 0부터 59까지 입력해 주시기 바랍니다.',
  submit: '시각 반영',
  unknown: '시각 모름',
} as const;

const HOUR_MAX = 23;
const MINUTE_MAX = 59;
const TIME_INPUT_LENGTH = 2;

const FOCUS_RING_CLASS =
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const INPUT_CLASS = cn(
  'h-11 w-16 scroll-mb-48 rounded-lg shadow-none transition-none focus-visible:shadow-none',
  FOCUS_RING_CLASS
);
const BUTTON_CLASS = cn(
  'h-11 scroll-mb-48 rounded-lg break-keep transition-none',
  FOCUS_RING_CLASS
);

export type FortuneBirthTimeFormComponentPropsType = Readonly<{
  /**
   * 이 시각을 묻는 이유 문장. 부모가 승인 문구 틀로 만들어 넘긴다.
   * 예: "이 날은 입춘이 드는 날이라 … {연도}년 입춘은 {M}월 {D}일 {HH:mm}(한국 시간)입니다."
   */
  description: string;
  /** 시각 반영. 범위 안의 시·분일 때만 호출한다 */
  onSubmit: (time: FortuneClockTimeType) => void;
  /** 시각 모름 */
  onUnknown: () => void;
  /** 화면이 나타날 때 부모가 제목으로 포커스를 옮기는 데 쓴다(tabIndex -1) */
  titleRef?: Ref<HTMLHeadingElement>;
}>;

function parseTimeField(value: string, max: number): number | null {
  if (value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= max
    ? parsed
    : null;
}

/**
 * 태어난 시각 입력(시·분). 연령 확인을 통과하고 경계일일 때만 부모가 그린다(AC-46).
 * 시·분 초안은 이 컴포넌트의 로컬 state이며 저장·전송하지 않는다.
 */
export function FortuneBirthTimeFormComponent({
  description,
  onSubmit,
  onUnknown,
  titleRef,
}: FortuneBirthTimeFormComponentPropsType): JSX.Element {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;
  const helpId = `${baseId}-help`;
  const errorId = `${baseId}-error`;
  const hourId = `${baseId}-hour`;
  const minuteId = `${baseId}-minute`;
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);

  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [hasError, setHasError] = useState(false);
  // 같은 오류가 반복돼도 오류 줄을 다시 읽히게 한다
  const [attempt, setAttempt] = useState(0);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const parsedHour = parseTimeField(hour, HOUR_MAX);
    const parsedMinute = parseTimeField(minute, MINUTE_MAX);
    if (parsedHour === null || parsedMinute === null) {
      setHasError(true);
      setAttempt((count) => count + 1);
      (parsedHour === null ? hourRef : minuteRef).current?.focus();
      return;
    }
    setHasError(false);
    onSubmit({ hour: parsedHour, minute: parsedMinute });
  }

  function renderField(
    id: string,
    label: string,
    value: string,
    onChange: (next: string) => void,
    ref: Ref<HTMLInputElement>
  ): JSX.Element {
    return (
      <div>
        <Label htmlFor={id} className="mb-1 text-xs">
          {label}
        </Label>
        <Input
          id={id}
          ref={ref}
          type="text"
          inputMode="numeric"
          maxLength={TIME_INPUT_LENGTH}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${helpId} ${errorId}` : helpId}
          className={INPUT_CLASS}
        />
      </div>
    );
  }

  return (
    <section aria-labelledby={titleId} className="space-y-3">
      <h3
        id={titleId}
        ref={titleRef}
        tabIndex={-1}
        className="rounded-sm text-lg leading-snug font-semibold break-keep text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {BIRTH_TIME_TEXTS.title}
      </h3>
      <p
        id={descriptionId}
        className="text-sm leading-6 break-keep text-foreground"
      >
        {description}
      </p>
      <form
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
        className="space-y-3"
      >
        <fieldset className="min-w-0">
          <legend className="sr-only">{BIRTH_TIME_TEXTS.title}</legend>
          <div className="flex items-end gap-3">
            {renderField(hourId, BIRTH_TIME_TEXTS.hour, hour, setHour, hourRef)}
            {renderField(
              minuteId,
              BIRTH_TIME_TEXTS.minute,
              minute,
              setMinute,
              minuteRef
            )}
          </div>
        </fieldset>
        <p
          id={helpId}
          className="text-sm leading-6 break-keep text-muted-foreground"
        >
          {BIRTH_TIME_TEXTS.help}
        </p>
        <div aria-live="polite">
          {hasError ? (
            <p
              key={attempt}
              id={errorId}
              className="flex items-start gap-2 text-sm leading-6 break-keep text-destructive"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-1 size-4 shrink-0"
              />
              <span>{BIRTH_TIME_TEXTS.rangeError}</span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            type="submit"
            className={cn(
              BUTTON_CLASS,
              'bg-menu-fortune px-6 text-primary-foreground hover:bg-menu-fortune/90'
            )}
          >
            {BIRTH_TIME_TEXTS.submit}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onUnknown}
            className={cn(BUTTON_CLASS, 'px-6')}
          >
            {BIRTH_TIME_TEXTS.unknown}
          </Button>
        </div>
      </form>
    </section>
  );
}
