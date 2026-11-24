'use client';

import { type JSX, useEffect, useId, useRef } from 'react';
import { FORTUNE_SUPPORTED_RANGE_NOTICE } from '@/features/fortune/constants/fortune-notice.constant';
import type { FortuneBirthFlowStateType } from '@/features/fortune/hooks/use-birth-flow.hook';
import { useRevealHeadingOnMount } from '@/features/fortune/hooks/use-reveal-heading.hook';
import { FortuneBirthFormComponent } from '@/features/fortune/shared/components/birth-form.component';
import { FortuneBirthTimeFormComponent } from '@/features/fortune/shared/components/birth-time-form.component';
import { FortuneCandidateChoiceComponent } from '@/features/fortune/shared/components/candidate-choice.component';
import { FortuneLunarConfirmComponent } from '@/features/fortune/shared/components/lunar-confirm.component';
import type {
  FortuneBirthInputType,
  FortuneClockTimeType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import {
  getLunarLeapMonth,
  getLunarMonthLength,
} from '@/features/fortune/utils/fortune-lunar.util';
import { cn } from '@/lib/utils';

// 화면 구조 문구. ui-ux-design.md "문구" 초안. 운세 상수 파일에는 아직 없어 이 파일에 둔다
const PERSON_STEP_TEXTS = {
  firstTitle: '첫 번째 사람의 생년월일',
  firstDescription: '두 사람의 생년월일을 한 사람씩 차례로 입력합니다.',
  secondTitle: '두 번째 사람의 생년월일',
  firstSubmit: '다음 사람 입력',
  secondSubmit: '궁합 보기',
  confirmPrefix: '첫 번째 사람:',
  reset: '다시 입력',
  candidateSuffix: '로 보기',
} as const;

/** 입력 중인 한 사람의 단계. 판정 완료·연령 차단은 부모가 맡는다 */
export type FortuneCompatibilityPersonInputStateType<K extends string> =
  Exclude<
    FortuneBirthFlowStateType<K>,
    Readonly<{ step: 'age-blocked' }> | Readonly<{ step: 'done' }>
  >;

export type FortuneCompatibilityPersonStepComponentPropsType<K extends string> =
  Readonly<{
    /** 'first': 다음 사람 입력, 'second': 궁합 보기 + 첫 번째 사람 확인 줄 + 다시 입력 */
    step: 'first' | 'second';
    state: FortuneCompatibilityPersonInputStateType<K>;
    /** KST 오늘 'YYYY-MM-DD'(useKoreaDateKey). 마운트 전 null */
    todayKey: string | null;
    /** 키 → 화면 이름(띠 이름, 별자리 이름). 후보 버튼과 확인 줄에 쓴다 */
    nameByKey: Readonly<Record<K, string>>;
    /** 둘째 단계 확인 줄에 보일 첫 번째 사람의 키 */
    firstKey?: K;
    /** 시각 질문의 이유 문장. 부모가 승인 문구 틀로 만든다(need-time 단계에서만 호출) */
    buildTimeDescription: (solar: FortuneYmdType) => string;
    /** 음력으로 입력해 판정 중일 때만 부모가 넘기는 확인 줄 값 */
    lunarConfirm?: Readonly<{
      lunar: FortuneBirthInputType;
      solar: FortuneYmdType;
    }> | null;
    /** 단계가 바뀐 뒤 h2로 포커스를 옮기고 필요하면 스크롤한다. 첫 화면 로드에서는 false */
    shouldFocusTitle: boolean;
    onSubmit: (input: FortuneBirthInputType) => void;
    onInvalid?: () => void;
    onSubmitTime: (time: FortuneClockTimeType) => void;
    onTimeUnknown: () => void;
    onChoose: (key: K) => void;
    /** 둘째 단계의 "다시 입력". 처음 상태로 돌아간다 */
    onReset?: () => void;
  }>;

/**
 * 한 사람 입력 단계(첫 번째·두 번째 공용). 생년월일 폼 → (시각 질문 → 후보 선택).
 * - 입력값은 기존 폼의 메모리에만 있다. 이 컴포넌트는 저장·전송하지 않는다.
 * - 단계 h2가 포커스 대상이고 section이 그 h2로 이름을 얻는다. 기존 폼에 prop을 더하지 않는다.
 */
export function FortuneCompatibilityPersonStepComponent<K extends string>({
  step,
  state,
  todayKey,
  nameByKey,
  firstKey,
  buildTimeDescription,
  lunarConfirm,
  shouldFocusTitle,
  onSubmit,
  onInvalid,
  onSubmitTime,
  onTimeUnknown,
  onChoose,
  onReset,
}: FortuneCompatibilityPersonStepComponentPropsType<K>): JSX.Element {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timeTitleRef = useRef<HTMLHeadingElement>(null);
  const firstCandidateRef = useRef<HTMLButtonElement>(null);

  useRevealHeadingOnMount(panelRef, titleRef, shouldFocusTitle);

  // 같은 단계 안에서 시각 질문·후보 선택이 나타나면 그 화면으로 포커스를 옮긴다
  const innerStep = state.step;
  useEffect(() => {
    if (innerStep === 'need-time') {
      timeTitleRef.current?.focus();
    } else if (innerStep === 'choose') {
      firstCandidateRef.current?.focus();
    }
  }, [innerStep]);

  const isSecond = step === 'second';
  const error = state.step === 'input' ? state.error : null;

  return (
    <section
      ref={panelRef}
      aria-labelledby={titleId}
      className="scroll-mt-4 space-y-4 rounded-panel border border-border bg-card p-5 sm:p-8"
    >
      {isSecond && firstKey ? (
        <p className="border-l-2 border-menu-fortune/40 pl-3 text-sm leading-6 font-medium break-keep text-foreground">
          {`${PERSON_STEP_TEXTS.confirmPrefix} ${nameByKey[firstKey]}`}
        </p>
      ) : null}

      <div className="space-y-1">
        <h2
          id={titleId}
          ref={titleRef}
          tabIndex={-1}
          className="rounded-sm text-xl leading-tight font-semibold break-keep text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:text-2xl"
        >
          {isSecond
            ? PERSON_STEP_TEXTS.secondTitle
            : PERSON_STEP_TEXTS.firstTitle}
        </h2>
        {isSecond ? null : (
          <p className="text-sm leading-6 break-keep text-muted-foreground">
            {PERSON_STEP_TEXTS.firstDescription}
          </p>
        )}
      </div>

      <FortuneBirthFormComponent
        todayKey={todayKey}
        error={error}
        submitLabel={
          isSecond
            ? PERSON_STEP_TEXTS.secondSubmit
            : PERSON_STEP_TEXTS.firstSubmit
        }
        getLunarLeapMonth={getLunarLeapMonth}
        getLunarMonthLength={getLunarMonthLength}
        onSubmit={onSubmit}
        onInvalid={onInvalid}
      />

      {/* 방어 경로: 절기·음력 표 범위 밖이면 지원 범위를 알린다 */}
      {error === 'out-of-table' ? (
        <p className="text-sm leading-6 break-keep text-muted-foreground">
          {FORTUNE_SUPPORTED_RANGE_NOTICE}
        </p>
      ) : null}

      {lunarConfirm ? (
        <FortuneLunarConfirmComponent
          lunar={lunarConfirm.lunar}
          solar={lunarConfirm.solar}
        />
      ) : null}

      {state.step === 'need-time' ? (
        <div className="rounded-lg border border-border bg-background p-4">
          <FortuneBirthTimeFormComponent
            key={`${state.solar.year}-${state.solar.month}-${state.solar.day}`}
            description={buildTimeDescription(state.solar)}
            onSubmit={onSubmitTime}
            onUnknown={onTimeUnknown}
            titleRef={timeTitleRef}
          />
        </div>
      ) : null}

      {state.step === 'choose' ? (
        <div className="rounded-lg border border-border bg-background p-4">
          <FortuneCandidateChoiceComponent<K>
            candidates={[
              {
                key: state.before,
                label: `${nameByKey[state.before]}${PERSON_STEP_TEXTS.candidateSuffix}`,
              },
              {
                key: state.after,
                label: `${nameByKey[state.after]}${PERSON_STEP_TEXTS.candidateSuffix}`,
              },
            ]}
            selectedKey={null}
            onSelect={onChoose}
            firstButtonRef={firstCandidateRef}
          />
        </div>
      ) : null}

      {isSecond && onReset ? (
        <button
          type="button"
          onClick={onReset}
          className={cn(
            'inline-flex min-h-11 scroll-mb-48 items-center rounded-sm text-sm font-medium break-keep text-primary underline underline-offset-4 hover:decoration-2',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none'
          )}
        >
          {PERSON_STEP_TEXTS.reset}
        </button>
      ) : null}
    </section>
  );
}
