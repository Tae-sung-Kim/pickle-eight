'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { type JSX, useEffect, useId, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FORTUNE_BIRTH_DAY_MAX,
  FORTUNE_BIRTH_DAY_MIN,
  FORTUNE_BIRTH_MONTH_MAX,
  FORTUNE_BIRTH_MONTH_MIN,
  FORTUNE_BIRTH_YEAR_MIN,
  FORTUNE_SUPPORTED_MAX_YEAR,
} from '@/features/fortune/constants/fortune-input.constant';
import {
  FORTUNE_BIRTH_ERROR_MESSAGES,
  FORTUNE_LEAP_MONTH_HINT_TEMPLATE,
} from '@/features/fortune/constants/fortune-notice.constant';
import type {
  FortuneBirthErrorType,
  FortuneBirthInputType,
  FortuneCalendarKindType,
} from '@/features/fortune/types/fortune.type';
import { parseDateKey } from '@/features/fortune/utils/fortune-date.util';
import { cn } from '@/lib/utils';

// 입력칸 라벨. ui-ux-design.md "입력", "라벨·읽기" 문구. 운세 상수 파일에는 아직 없어 이 파일에 둔다
const BIRTH_FORM_TEXTS = {
  calendarLegend: '달력',
  solar: '양력',
  lunar: '음력',
  birthLegend: '생년월일',
  year: '연도',
  month: '월',
  day: '일',
  leapMonth: '윤달',
} as const;

const CALENDAR_OPTIONS: ReadonlyArray<
  Readonly<{ value: FortuneCalendarKindType; label: string }>
> = [
  { value: 'solar', label: BIRTH_FORM_TEXTS.solar },
  { value: 'lunar', label: BIRTH_FORM_TEXTS.lunar },
];

const YEAR_LENGTH = 4;
const MONTH_DAY_LENGTH = 2;

const FOCUS_RING_CLASS =
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card';
const INPUT_CLASS = cn(
  'h-11 scroll-mb-48 rounded-lg shadow-none transition-none focus-visible:shadow-none',
  FOCUS_RING_CLASS
);

/** 폼 입력 초안. 연·월·일은 숫자만 남긴 문자열이며 메모리에서만 쓴다(저장·전송·URL·로그 금지) */
type BirthFormValuesType = Readonly<{
  calendar: FortuneCalendarKindType;
  year: string;
  month: string;
  day: string;
  isLeapMonth: boolean;
}>;

type BirthFieldNameType = 'year' | 'month' | 'day';

type BirthDraftContextType = Readonly<{
  /** min(KST 오늘 연도, FORTUNE_SUPPORTED_MAX_YEAR) */
  maxYear: number;
  todayYear: number;
  getLunarMonthLength: FortuneBirthFormComponentPropsType['getLunarMonthLength'];
}>;

export type FortuneBirthFormComponentPropsType = Readonly<{
  /** KST 오늘 'YYYY-MM-DD'(useKoreaDateKey). 마운트 전 null이면 지원 연도 상한만 적용한다 */
  todayKey: string | null;
  /** 부모(판정 흐름)가 내려 주는 오류. 입력값은 문구에 들어가지 않는다 */
  error: FortuneBirthErrorType | null;
  /** 주요 버튼 라벨: 운세 보기, 내 띠 찾기, 내 별자리 찾기 */
  submitLabel: string;
  /** 달력 표 함수 주입(FE-3b의 fortune-lunar.util). 이 컴포넌트는 달력 파일을 import하지 않는다 */
  getLunarLeapMonth: (lunarYear: number) => number | null;
  getLunarMonthLength: (
    lunarYear: number,
    month: number,
    isLeapMonth: boolean
  ) => 29 | 30 | null;
  /** 형식 검사를 통과한 값만 올린다. 범위·존재 여부의 최종 판정은 부모가 resolveFortuneBirth로 한다 */
  onSubmit: (input: FortuneBirthInputType) => void;
  /** 형식 검사에서 걸려 onSubmit이 호출되지 않을 때 알린다. 부모가 이전 결과를 지우는 데 쓴다(AC-1) */
  onInvalid?: () => void;
  /** 좁은 면(띠·별자리 찾기 면)이면 md 이상에서도 한 줄로 펴지 않고 세로로 쌓는다 */
  isCompact?: boolean;
}>;

function isBirthError(value: unknown): value is FortuneBirthErrorType {
  return (
    typeof value === 'string' &&
    Object.hasOwn(FORTUNE_BIRTH_ERROR_MESSAGES, value)
  );
}

/**
 * 형식 검사. 첫 번째로 걸린 오류 하나만 돌려준다(판정 순서는 design.md 4.3과 같다).
 * 양력에 없는 날짜(2월 30일 등)와 윤달 존재 여부는 부모의 resolveFortuneBirth가 가린다.
 */
function findBirthDraftError(
  values: BirthFormValuesType,
  context: BirthDraftContextType
): FortuneBirthErrorType | null {
  if (!values.year || !values.month || !values.day) {
    return 'empty';
  }
  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);
  if (
    month < FORTUNE_BIRTH_MONTH_MIN ||
    month > FORTUNE_BIRTH_MONTH_MAX ||
    day < FORTUNE_BIRTH_DAY_MIN ||
    day > FORTUNE_BIRTH_DAY_MAX
  ) {
    return 'invalid-date';
  }
  if (year < FORTUNE_BIRTH_YEAR_MIN) {
    return 'before-min';
  }
  if (year > FORTUNE_SUPPORTED_MAX_YEAR) {
    return 'after-max';
  }
  if (year > context.todayYear) {
    return 'future';
  }
  if (values.calendar === 'lunar') {
    const monthLength = context.getLunarMonthLength(
      year,
      month,
      values.isLeapMonth
    );
    if (monthLength !== null && day > monthLength) {
      return 'lunar-invalid-day';
    }
  }
  return null;
}

function buildBirthSchema(context: BirthDraftContextType) {
  return z
    .object({
      calendar: z.enum(['solar', 'lunar']),
      year: z.string(),
      month: z.string(),
      day: z.string(),
      isLeapMonth: z.boolean(),
    })
    .superRefine((values, issueContext) => {
      const errorCode = findBirthDraftError(values, context);
      if (errorCode) {
        // message에 오류 코드를 담는다. 화면 문구는 FORTUNE_BIRTH_ERROR_MESSAGES에서 찾는다
        issueContext.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorCode,
          path: ['year'],
        });
      }
    });
}

function fillLeapHint(lunarYear: number, month: number): string {
  return FORTUNE_LEAP_MONTH_HINT_TEMPLATE.replace(
    '{연도}',
    String(lunarYear)
  ).replace('{월}', String(month));
}

/**
 * 생년월일 입력 폼. 양력/음력, 숫자 입력 3칸, 윤달 체크(음력일 때만, 일 칸 다음).
 * - 입력 초안은 react-hook-form이 메모리에만 둔다. 이름·연락처·성별·출생지 칸이 없다(AC-31).
 * - `<form>`에 action·method가 없고 handleSubmit이 기본 제출을 막는다. autoComplete="off".
 * - 연도 범위 1920 ~ min(KST 오늘 연도, 2028). 윤달은 그해 그 달에 있을 때만 활성, 없으면 비활성 + 선택 해제.
 */
export function FortuneBirthFormComponent({
  todayKey,
  error,
  submitLabel,
  getLunarLeapMonth,
  getLunarMonthLength,
  onSubmit,
  onInvalid,
  isCompact = false,
}: FortuneBirthFormComponentPropsType): JSX.Element {
  const baseId = useId();
  const yearId = `${baseId}-year`;
  const monthId = `${baseId}-month`;
  const dayId = `${baseId}-day`;
  const hintId = `${baseId}-leap-hint`;
  const errorId = `${baseId}-error`;

  const todayYear =
    (todayKey ? parseDateKey(todayKey)?.year : undefined) ??
    FORTUNE_SUPPORTED_MAX_YEAR;
  const maxYear = Math.min(todayYear, FORTUNE_SUPPORTED_MAX_YEAR);

  const schema = useMemo(
    () => buildBirthSchema({ maxYear, todayYear, getLunarMonthLength }),
    [maxYear, todayYear, getLunarMonthLength]
  );

  const { register, control, handleSubmit, setValue, setFocus, getValues } =
    useForm<BirthFormValuesType>({
      resolver: zodResolver(schema),
      defaultValues: {
        calendar: 'solar',
        year: '',
        month: '',
        day: '',
        isLeapMonth: false,
      },
      // 제출할 때만 검사한다. 입력 중에는 오류를 바꾸지 않는다
      mode: 'onSubmit',
      reValidateMode: 'onSubmit',
    });

  const [localError, setLocalError] = useState<FortuneBirthErrorType | null>(
    null
  );
  // 제출을 시도한 횟수. 같은 오류가 반복돼도 오류 줄을 다시 읽히게 하고 포커스를 옮기는 신호로 쓴다
  const [attempt, setAttempt] = useState(0);

  const [calendar, yearValue, monthValue, dayValue, isLeapMonthChecked] =
    useWatch({
      control,
      name: ['calendar', 'year', 'month', 'day', 'isLeapMonth'],
    });

  const isLunar = calendar === 'lunar';
  const yearNumber = Number(yearValue);
  const monthNumber = Number(monthValue);
  const isYearMonthReady =
    yearValue.length === YEAR_LENGTH &&
    yearNumber >= FORTUNE_BIRTH_YEAR_MIN &&
    yearNumber <= maxYear &&
    monthNumber >= FORTUNE_BIRTH_MONTH_MIN &&
    monthNumber <= FORTUNE_BIRTH_MONTH_MAX;
  // 윤달 선택 가능 여부는 상태가 아니라 연·월 입력에서 렌더링 중 계산한다(design.md 12.3)
  const isLeapAvailable =
    isLunar &&
    isYearMonthReady &&
    getLunarLeapMonth(yearNumber) === monthNumber;

  // 윤달이 없는 달이 되거나 양력으로 바꾸면 선택을 해제한다(알리지 않는다)
  useEffect(() => {
    if (!isLeapAvailable && isLeapMonthChecked) {
      setValue('isLeapMonth', false);
    }
  }, [isLeapAvailable, isLeapMonthChecked, setValue]);

  const activeError = localError ?? error;

  // 오류가 나면 첫 오류 칸으로 포커스를 옮긴다. 윤달 체크는 비활성일 수 있어 연도 칸으로 보낸다
  useEffect(() => {
    if (attempt === 0 || !activeError) {
      return;
    }
    const emptyField: BirthFieldNameType | undefined =
      activeError === 'empty'
        ? (['year', 'month', 'day'] as const).find(
            (name) => getValues(name) === ''
          )
        : undefined;
    setFocus(emptyField ?? 'year');
  }, [attempt, activeError, getValues, setFocus]);

  function isFieldInvalid(value: string): boolean {
    if (!activeError) {
      return false;
    }
    // 빈 칸 오류는 빈 칸에만, 그 밖의 오류는 세 칸 모두에 준다
    return activeError === 'empty' ? value === '' : true;
  }

  function handleValid(values: BirthFormValuesType): void {
    setLocalError(null);
    setAttempt((count) => count + 1);
    onSubmit({
      calendar: values.calendar,
      year: Number(values.year),
      month: Number(values.month),
      day: Number(values.day),
      isLeapMonth: values.calendar === 'lunar' && values.isLeapMonth,
    });
  }

  function handleInvalid(errors: { year?: { message?: string } }): void {
    const code = errors.year?.message;
    setLocalError(isBirthError(code) ? code : 'empty');
    setAttempt((count) => count + 1);
    onInvalid?.();
  }

  function renderNumberField(
    name: BirthFieldNameType,
    id: string,
    label: string,
    maxLength: number,
    widthClass: string,
    value: string
  ): JSX.Element {
    return (
      <div>
        <Label htmlFor={id} className="mb-1 text-xs">
          {label}
        </Label>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Input
              id={id}
              ref={field.ref}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(event.target.value.replace(/\D/g, ''))
              }
              type="text"
              inputMode="numeric"
              maxLength={maxLength}
              autoComplete="off"
              aria-invalid={isFieldInvalid(value) || undefined}
              aria-describedby={activeError ? errorId : undefined}
              className={cn(INPUT_CLASS, widthClass)}
            />
          )}
        />
      </div>
    );
  }

  return (
    <form
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit(handleValid, handleInvalid)}
      className={cn(
        'space-y-4',
        !isCompact && 'md:flex md:flex-wrap md:items-end md:gap-6 md:space-y-0'
      )}
    >
      <fieldset className="min-w-0">
        <legend className="mb-1 text-sm font-medium">
          {BIRTH_FORM_TEXTS.calendarLegend}
        </legend>
        <div className="inline-flex rounded-lg border border-input p-0.5">
          {CALENDAR_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="inline-flex h-10 min-w-16 cursor-pointer items-center justify-center rounded-md px-4 text-sm font-medium break-keep not-has-[:checked]:hover:bg-muted has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-card"
            >
              <input
                type="radio"
                value={option.value}
                className="sr-only"
                {...register('calendar')}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="mb-1 text-sm font-medium">
          {BIRTH_FORM_TEXTS.birthLegend}
        </legend>
        <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
          {renderNumberField(
            'year',
            yearId,
            BIRTH_FORM_TEXTS.year,
            YEAR_LENGTH,
            'w-24',
            yearValue
          )}
          {renderNumberField(
            'month',
            monthId,
            BIRTH_FORM_TEXTS.month,
            MONTH_DAY_LENGTH,
            'w-16',
            monthValue
          )}
          {renderNumberField(
            'day',
            dayId,
            BIRTH_FORM_TEXTS.day,
            MONTH_DAY_LENGTH,
            'w-16',
            dayValue
          )}
          {isLunar ? (
            <Controller
              control={control}
              name="isLeapMonth"
              render={({ field }) => (
                <label
                  className={cn(
                    'inline-flex min-h-11 basis-full items-center gap-2 text-sm font-medium',
                    isCompact ? null : 'md:basis-auto',
                    isLeapAvailable
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed text-muted-foreground'
                  )}
                >
                  <input
                    type="checkbox"
                    ref={field.ref}
                    name={field.name}
                    checked={field.value && isLeapAvailable}
                    disabled={!isLeapAvailable}
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(event.target.checked)}
                    aria-invalid={activeError === 'lunar-no-leap' || undefined}
                    aria-describedby={
                      isLeapAvailable
                        ? hintId
                        : activeError === 'lunar-no-leap'
                          ? errorId
                          : undefined
                    }
                    className={cn(
                      'size-5 scroll-mb-48 accent-primary outline-none disabled:cursor-not-allowed',
                      FOCUS_RING_CLASS
                    )}
                  />
                  {BIRTH_FORM_TEXTS.leapMonth}
                </label>
              )}
            />
          ) : null}
        </div>
      </fieldset>

      {isLeapAvailable ? (
        <p
          id={hintId}
          className={cn(
            'text-sm leading-6 break-keep text-muted-foreground',
            isCompact ? null : 'md:basis-full'
          )}
        >
          {fillLeapHint(yearNumber, monthNumber)}
        </p>
      ) : null}

      {/* 오류 줄: live 영역은 항상 두고 내용만 바꾼다. key로 같은 오류도 다시 읽힌다 */}
      <div
        aria-live="polite"
        className={isCompact ? undefined : 'md:basis-full'}
      >
        {activeError ? (
          <p
            key={attempt}
            id={errorId}
            className="flex items-start gap-2 text-sm leading-6 break-keep text-destructive"
          >
            <AlertCircle aria-hidden="true" className="mt-1 size-4 shrink-0" />
            <span>{FORTUNE_BIRTH_ERROR_MESSAGES[activeError]}</span>
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        className={cn(
          'h-11 w-full scroll-mb-48 rounded-lg bg-menu-fortune px-6 break-keep text-primary-foreground transition-none hover:bg-menu-fortune/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
          isCompact ? null : 'md:w-auto'
        )}
      >
        {submitLabel}
      </Button>
    </form>
  );
}
