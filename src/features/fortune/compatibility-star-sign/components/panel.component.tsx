'use client';

import { type JSX, useCallback, useEffect, useRef, useState } from 'react';
import { FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_COPY } from '@/features/fortune/constants/fortune-compatibility-copy.constant';
import {
  FORTUNE_COMPATIBILITY_PERSON_LABELS,
  FORTUNE_COMPATIBILITY_TIME_UNKNOWN_LINE_TEMPLATE,
} from '@/features/fortune/constants/fortune-compatibility-menu.constant';
import { FORTUNE_COMPATIBILITY_AGE_BLOCKED_TEXTS } from '@/features/fortune/constants/fortune-compatibility-notice.constant';
import { FORTUNE_COMPATIBILITY_STAR_SIGN_SAME_COPY } from '@/features/fortune/constants/fortune-compatibility-same-copy.constant';
import {
  FORTUNE_COMPATIBILITY_ELEMENT_NAMES,
  FORTUNE_COMPATIBILITY_ELEMENT_RELATION_NAMES,
  FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS,
} from '@/features/fortune/constants/fortune-compatibility-star-sign.constant';
import { FORTUNE_TIME_UNKNOWN_NOTICE } from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_STAR_SIGNS } from '@/features/fortune/constants/fortune-star-sign.constant';
import { FORTUNE_STAR_SIGN_TIME_QUESTION_TEXTS } from '@/features/fortune/constants/fortune-time-question.constant';
import { useCompatibilityFlow } from '@/features/fortune/hooks/use-compatibility-flow.hook';
import { useKoreaDateKey } from '@/features/fortune/hooks/use-korea-date-key.hook';
import { FortuneAgeBlockedComponent } from '@/features/fortune/shared/components/age-blocked.component';
import { FortuneCompatibilityPersonStepComponent } from '@/features/fortune/shared/components/compatibility-person-step.component';
import { FortuneCompatibilityResultComponent } from '@/features/fortune/shared/components/compatibility-result.component';
import { FortuneCompatibilityShareComponent } from '@/features/fortune/shared/components/compatibility-share.component';
import type {
  FortuneBirthInputType,
  FortuneStarSignKeyType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import {
  resolveFortuneCompatibilityElementRelation,
  resolveFortuneCompatibilityStarSign,
  resolveFortuneCompatibilityStarSignCopy,
} from '@/features/fortune/utils/fortune-compatibility.util';
import { parseDateKey } from '@/features/fortune/utils/fortune-date.util';
import { getSolarTermTime } from '@/features/fortune/utils/fortune-solar-term.util';
import {
  determineFortuneStarSign,
  resolveFortuneStarSignWithTime,
} from '@/features/fortune/utils/fortune-star-sign.util';

const TIME_PAD_LENGTH = 2;

const PANEL_CLASS =
  'scroll-mt-4 rounded-panel border border-border bg-card p-5 sm:p-8';

/** 판정 함수는 module 상수(안정된 참조)로 넘긴다 */
const FLOW_CONFIG = {
  determine: determineFortuneStarSign,
  resolveWithTime: resolveFortuneStarSignWithTime,
} as const;

const STAR_SIGN_NAMES: Readonly<Record<FortuneStarSignKeyType, string>> =
  Object.fromEntries(
    FORTUNE_STAR_SIGNS.map((sign) => [sign.key, sign.name])
  ) as Record<FortuneStarSignKeyType, string>;

const padTime = (value: number): string =>
  String(value).padStart(TIME_PAD_LENGTH, '0');

/**
 * 시각 질문 설명. 경계일(바뀌는 날)이면 바뀐 뒤 별자리의 시작 시각을 절기 표에서 구해 덧붙인다.
 * 사람 단계 컴포넌트는 solar만 넘겨 주므로 경계는 여기서 다시 판정한다.
 */
function buildTimeDescription(solar: FortuneYmdType): string {
  const result = determineFortuneStarSign(solar);
  if (result.kind !== 'need-time') {
    return FORTUNE_STAR_SIGN_TIME_QUESTION_TEXTS.intro;
  }
  const startTermIndex = FORTUNE_STAR_SIGNS.find(
    (sign) => sign.key === result.after
  )?.startTermIndex;
  const term =
    startTermIndex === undefined
      ? null
      : getSolarTermTime(solar.year, startTermIndex);
  if (!term) {
    return FORTUNE_STAR_SIGN_TIME_QUESTION_TEXTS.intro;
  }
  return `${FORTUNE_STAR_SIGN_TIME_QUESTION_TEXTS.intro} ${solar.year}년 ${STAR_SIGN_NAMES[result.after]} 시작 시각은 ${term.month}월 ${term.day}일 ${padTime(term.hour)}:${padTime(term.minute)}${FORTUNE_STAR_SIGN_TIME_QUESTION_TEXTS.kst}입니다.`;
}

/** 시각 모름 안내 줄: 기존 안내 + 새 문장({사람}은 {이름}로 보고 있습니다) */
function buildTimeUnknownLine(personLabel: string, name: string): string {
  const sentence = FORTUNE_COMPATIBILITY_TIME_UNKNOWN_LINE_TEMPLATE.replace(
    '{사람}',
    personLabel
  ).replace('{이름}', name);
  return `${FORTUNE_TIME_UNKNOWN_NOTICE} ${sentence}`;
}

export type FortuneCompatibilityStarSignPanelComponentPropsType = Readonly<{
  /** 동의 화면에서 막 동의한 경우에만 true. 첫 단계 h2로 포커스를 옮긴다 */
  shouldFocusTitle?: boolean;
}>;

/**
 * FortuneCompatibilityStarSignPanelComponent (별자리 궁합 panel)
 * - 동의(granted) 뒤에만 root가 next/dynamic으로 불러온다. 문구 묶음은 이 panel 아래에서만 import한다.
 * - 흐름: 첫 번째 사람 → 두 번째 사람 → 결과. 입력값·결과는 훅 state(메모리)에만 둔다. 저장·전송·URL에 올리지 않는다.
 * - 음력 확인 줄: 훅이 입력값을 버리므로 제출 시점 입력값을 이 panel이 메모리에만 들고 있는다.
 */
export function FortuneCompatibilityStarSignPanelComponent({
  shouldFocusTitle = false,
}: FortuneCompatibilityStarSignPanelComponentPropsType): JSX.Element {
  const todayKey = useKoreaDateKey();
  const {
    state,
    submit,
    submitTime,
    setTimeUnknown,
    choose,
    swapCandidate,
    reset,
  } = useCompatibilityFlow<FortuneStarSignKeyType>(FLOW_CONFIG);

  const [lastInput, setLastInput] = useState<FortuneBirthInputType | null>(
    null
  );
  // "다시 입력"으로 첫 단계로 돌아온 경우에만 첫 단계 제목으로 포커스를 옮긴다
  const [hasReset, setHasReset] = useState(false);
  const ageTitleRef = useRef<HTMLHeadingElement>(null);

  const isAgeBlocked = state.step === 'age-blocked';
  useEffect(() => {
    if (isAgeBlocked) {
      ageTitleRef.current?.focus();
    }
  }, [isAgeBlocked]);

  const handleSubmit = useCallback(
    (input: FortuneBirthInputType): void => {
      const today = todayKey ? parseDateKey(todayKey) : null;
      if (!today) {
        return;
      }
      setLastInput(input);
      submit(input, today);
    },
    [todayKey, submit]
  );

  const handleInvalid = useCallback((): void => {
    setLastInput(null);
  }, []);

  const handleReset = useCallback((): void => {
    setLastInput(null);
    setHasReset(true);
    reset();
  }, [reset]);

  if (state.step === 'age-blocked') {
    return (
      <div className={`${PANEL_CLASS} max-w-2xl`}>
        <FortuneAgeBlockedComponent
          titleRef={ageTitleRef}
          texts={FORTUNE_COMPATIBILITY_AGE_BLOCKED_TEXTS}
        />
      </div>
    );
  }

  if (state.step === 'result') {
    const { first, second } = state;
    const pair = resolveFortuneCompatibilityStarSign(first.key, second.key);
    const elementRelation = resolveFortuneCompatibilityElementRelation(
      first.key,
      second.key
    );
    const copy = resolveFortuneCompatibilityStarSignCopy(
      first.key,
      second.key,
      FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_COPY,
      FORTUNE_COMPATIBILITY_STAR_SIGN_SAME_COPY
    );
    const swaps = (['first', 'second'] as const)
      .filter((target) => state[target].otherKey !== null)
      .map((target) => ({
        target,
        text: buildTimeUnknownLine(
          FORTUNE_COMPATIBILITY_PERSON_LABELS[target],
          STAR_SIGN_NAMES[state[target].key]
        ),
      }));

    return (
      <div className="space-y-4">
        <FortuneCompatibilityResultComponent
          first={{
            name: STAR_SIGN_NAMES[first.key],
            detail:
              FORTUNE_COMPATIBILITY_ELEMENT_NAMES[
                FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS[first.key]
              ],
          }}
          second={{
            name: STAR_SIGN_NAMES[second.key],
            detail:
              FORTUNE_COMPATIBILITY_ELEMENT_NAMES[
                FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS[second.key]
              ],
          }}
          relationName={
            FORTUNE_COMPATIBILITY_ELEMENT_RELATION_NAMES[elementRelation]
          }
          grade={pair.grade}
          copy={copy}
          swaps={swaps}
          onSwap={swapCandidate}
          onReset={handleReset}
        />
        <FortuneCompatibilityShareComponent
          kind="starSign"
          firstName={STAR_SIGN_NAMES[first.key]}
          secondName={STAR_SIGN_NAMES[second.key]}
          gradeKey={pair.grade}
          summary={copy.summary[0]}
        />
      </div>
    );
  }

  const person = state.person;
  const lunarConfirm =
    lastInput &&
    (person.step === 'need-time' || person.step === 'choose') &&
    person.isFromLunar
      ? { lunar: lastInput, solar: person.solar }
      : null;
  const isSecond = state.step === 'second';

  return (
    <FortuneCompatibilityPersonStepComponent<FortuneStarSignKeyType>
      key={state.step}
      step={state.step}
      state={person}
      todayKey={todayKey}
      nameByKey={STAR_SIGN_NAMES}
      firstKey={isSecond ? state.first.key : undefined}
      buildTimeDescription={buildTimeDescription}
      lunarConfirm={lunarConfirm}
      shouldFocusTitle={isSecond || hasReset || shouldFocusTitle}
      onSubmit={handleSubmit}
      onInvalid={handleInvalid}
      onSubmitTime={submitTime}
      onTimeUnknown={setTimeUnknown}
      onChoose={choose}
      onReset={isSecond ? handleReset : undefined}
    />
  );
}
