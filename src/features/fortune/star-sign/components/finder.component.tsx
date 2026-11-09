'use client';

import {
  type JSX,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { FORTUNE_FINDER_BASIS_STAR_SIGN_NOTICE } from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_STAR_SIGNS } from '@/features/fortune/constants/fortune-star-sign.constant';
import { useBirthFlow } from '@/features/fortune/hooks/use-birth-flow.hook';
import { FortuneAgeBlockedComponent } from '@/features/fortune/shared/components/age-blocked.component';
import { FortuneBirthFormComponent } from '@/features/fortune/shared/components/birth-form.component';
import { FortuneBirthTimeFormComponent } from '@/features/fortune/shared/components/birth-time-form.component';
import { FortuneCandidateChoiceComponent } from '@/features/fortune/shared/components/candidate-choice.component';
import { FortuneLunarConfirmComponent } from '@/features/fortune/shared/components/lunar-confirm.component';
import type {
  FortuneBirthInputType,
  FortuneStarSignKeyType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import { parseDateKey } from '@/features/fortune/utils/fortune-date.util';
import {
  getLunarLeapMonth,
  getLunarMonthLength,
} from '@/features/fortune/utils/fortune-lunar.util';
import { getSolarTermTime } from '@/features/fortune/utils/fortune-solar-term.util';
import {
  determineFortuneStarSign,
  resolveFortuneStarSignWithTime,
} from '@/features/fortune/utils/fortune-star-sign.util';

// 찾기 면 문구. ui-ux-design.md "문구 > 승인됨(2026-11-05)". 운세 상수 파일에는 아직 없어 이 파일에 둔다
const FINDER_TEXTS = {
  title: '내 별자리 찾기',
  submitLabel: '내 별자리 찾기',
  /** 시각 질문(별자리) 앞 문장 */
  timeQuestionIntro:
    '이 날은 별자리가 바뀌는 날이라 태어난 시각에 따라 별자리가 달라집니다.',
  /** {연도}년 {별자리} 시작 시각은 {M}월 {D}일 {HH:mm}(한국 시간)입니다. 조각으로 나눠 이어 쓴다 */
  timeQuestionKst: '(한국 시간)',
  foundSuffix: '입니다.',
  candidateSuffix: '로 보기',
} as const;

const TIME_PAD_LENGTH = 2;

/** 판정 함수는 module 상수(안정된 참조)로 넘긴다 */
const BIRTH_FLOW_CONFIG = {
  determine: determineFortuneStarSign,
  resolveWithTime: resolveFortuneStarSignWithTime,
} as const;

const STAR_SIGN_NAMES: Readonly<Record<FortuneStarSignKeyType, string>> =
  Object.fromEntries(
    FORTUNE_STAR_SIGNS.map((sign) => [sign.key, sign.name])
  ) as Record<FortuneStarSignKeyType, string>;

type CandidatePairType = Readonly<{
  before: FortuneStarSignKeyType;
  after: FortuneStarSignKeyType;
}>;

const padTime = (value: number): string =>
  String(value).padStart(TIME_PAD_LENGTH, '0');

/**
 * 시각 질문 설명. need-time 상태에는 경계가 없어 부모가 절기 표에서 새로 구한다.
 * 경계 시각 = 바뀐 뒤 별자리(after)가 시작하는 중기 시각(KST 시계)이다.
 */
function buildTimeDescription(
  solar: FortuneYmdType,
  afterKey: FortuneStarSignKeyType
): string {
  const startTermIndex = FORTUNE_STAR_SIGNS.find(
    (sign) => sign.key === afterKey
  )?.startTermIndex;
  const term =
    startTermIndex === undefined
      ? null
      : getSolarTermTime(solar.year, startTermIndex);
  if (!term) {
    return FINDER_TEXTS.timeQuestionIntro;
  }
  return `${FINDER_TEXTS.timeQuestionIntro} ${solar.year}년 ${STAR_SIGN_NAMES[afterKey]} 시작 시각은 ${term.month}월 ${term.day}일 ${padTime(term.hour)}:${padTime(term.minute)}${FINDER_TEXTS.timeQuestionKst}입니다.`;
}

export type FortuneStarSignFinderComponentPropsType = Readonly<{
  /** KST 오늘 'YYYY-MM-DD'(useKoreaDateKey). 마운트 전 null */
  todayKey: string | null;
  /** 별자리가 정해지면(단일 판정, 시각 반영, 후보 선택) 부모가 목록에서 그 항목을 펼친다 */
  onFound: (key: FortuneStarSignKeyType) => void;
}>;

/**
 * FortuneStarSignFinderComponent (내 별자리 찾기 면)
 * - 생년월일 → 연령 확인 → (경계일이면 시각 질문 → 후보 선택) → 별자리. 찾은 별자리는 onFound로 목록에 알린다(사본을 그리지 않는다).
 * - 입력값·판정 결과는 이 컴포넌트의 메모리(state)에만 둔다. 저장·전송·URL에 올리지 않는다(AC-28~30).
 * - 연령 확인에서 걸리면(만 14세 미만) 이 면 전체를 연령 안내로 바꾼다. 입력값을 남기지 않고 다시 입력 장치도 없다(AC-42).
 */
export function FortuneStarSignFinderComponent({
  todayKey,
  onFound,
}: FortuneStarSignFinderComponentPropsType): JSX.Element {
  const titleId = useId();
  const { state, submit, submitTime, setTimeUnknown, choose, reset } =
    useBirthFlow<FortuneStarSignKeyType>(BIRTH_FLOW_CONFIG);

  // 음력 확인 줄에 쓰는 마지막 입력(메모리만)
  const [lastInput, setLastInput] = useState<FortuneBirthInputType | null>(
    null
  );
  // 시각 모름을 누른 뒤의 두 후보와 고른 쪽. 훅은 done 뒤 후보를 잊으므로 이 면이 따로 기억한다
  const [candidates, setCandidates] = useState<CandidatePairType | null>(null);
  const [pickedKey, setPickedKey] = useState<FortuneStarSignKeyType | null>(
    null
  );

  const ageTitleRef = useRef<HTMLHeadingElement>(null);
  const timeTitleRef = useRef<HTMLHeadingElement>(null);
  const firstCandidateRef = useRef<HTMLButtonElement>(null);
  const onFoundRef = useRef(onFound);
  useEffect(() => {
    onFoundRef.current = onFound;
  }, [onFound]);

  // 단계가 바뀔 때만 포커스를 옮긴다: 연령 안내 → h2, 시각 질문 → h3, 후보 → 첫 후보 버튼
  useEffect(() => {
    if (state.step === 'age-blocked') {
      ageTitleRef.current?.focus();
    } else if (state.step === 'need-time') {
      timeTitleRef.current?.focus();
    } else if (state.step === 'choose') {
      firstCandidateRef.current?.focus();
    }
  }, [state]);

  // 별자리가 확정되면 목록에 알린다(후보를 고른 경우도 done을 거친다)
  useEffect(() => {
    if (state.step === 'done' && state.key) {
      onFoundRef.current(state.key);
    }
  }, [state]);

  const handleSubmit = useCallback(
    (input: FortuneBirthInputType): void => {
      const today = todayKey ? parseDateKey(todayKey) : null;
      if (!today) {
        return;
      }
      setLastInput(input);
      setCandidates(null);
      setPickedKey(null);
      // 결과가 나온 뒤에도 폼이 남아 다른 날짜로 다시 찾을 수 있다. 훅은 input에서만 제출을 받으므로 먼저 되돌린다
      reset();
      submit(input, today);
    },
    [todayKey, reset, submit]
  );

  // 폼 형식 검사에서 걸리면 오류 안내만 남기고 이전에 찾은 별자리를 지운다(AC-1)
  function handleInvalid(): void {
    if (state.step !== 'input') {
      reset();
    }
    setLastInput(null);
    setCandidates(null);
    setPickedKey(null);
  }

  function handleTimeUnknown(): void {
    if (state.step === 'need-time') {
      setCandidates({ before: state.before, after: state.after });
    }
    setTimeUnknown();
  }

  function handleCandidateSelect(key: FortuneStarSignKeyType): void {
    setPickedKey(key);
    if (state.step === 'choose') {
      // done으로 가면 위 효과가 목록에 알린다
      choose(key);
      return;
    }
    // 이미 한쪽을 고른 뒤 다른 쪽으로 바꾼다
    onFound(key);
  }

  if (state.step === 'age-blocked') {
    return (
      <div className="rounded-lg border border-border bg-background p-4 sm:p-5">
        <FortuneAgeBlockedComponent titleRef={ageTitleRef} />
      </div>
    );
  }

  const isAfterSubmit =
    state.step === 'need-time' ||
    state.step === 'choose' ||
    state.step === 'done';
  const foundKey: FortuneStarSignKeyType | null = candidates
    ? pickedKey
    : state.step === 'done'
      ? state.key
      : null;

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-4 rounded-lg border border-border bg-background p-4 sm:p-5"
    >
      <h2
        id={titleId}
        className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl"
      >
        {FINDER_TEXTS.title}
      </h2>

      <FortuneBirthFormComponent
        todayKey={todayKey}
        error={state.step === 'input' ? state.error : null}
        submitLabel={FINDER_TEXTS.submitLabel}
        getLunarLeapMonth={getLunarLeapMonth}
        getLunarMonthLength={getLunarMonthLength}
        onSubmit={handleSubmit}
        onInvalid={handleInvalid}
        isCompact
      />

      {isAfterSubmit && state.isFromLunar && lastInput ? (
        <FortuneLunarConfirmComponent lunar={lastInput} solar={state.solar} />
      ) : null}

      {state.step === 'need-time' ? (
        <div className="border-t border-border pt-4">
          <FortuneBirthTimeFormComponent
            description={buildTimeDescription(state.solar, state.after)}
            onSubmit={submitTime}
            onUnknown={handleTimeUnknown}
            titleRef={timeTitleRef}
          />
        </div>
      ) : null}

      {candidates ? (
        <div className="border-t border-border pt-4">
          <FortuneCandidateChoiceComponent
            candidates={[
              {
                key: candidates.before,
                label: `${STAR_SIGN_NAMES[candidates.before]}${FINDER_TEXTS.candidateSuffix}`,
              },
              {
                key: candidates.after,
                label: `${STAR_SIGN_NAMES[candidates.after]}${FINDER_TEXTS.candidateSuffix}`,
              },
            ]}
            selectedKey={pickedKey}
            onSelect={handleCandidateSelect}
            firstButtonRef={firstCandidateRef}
          />
        </div>
      ) : null}

      {foundKey ? (
        <div className="space-y-1 border-l-2 border-menu-fortune/40 pl-3">
          <p className="text-base leading-7 font-medium break-keep text-foreground">
            {`${STAR_SIGN_NAMES[foundKey]}${FINDER_TEXTS.foundSuffix}`}
          </p>
          <p className="text-sm leading-6 break-keep text-muted-foreground">
            {FORTUNE_FINDER_BASIS_STAR_SIGN_NOTICE}
          </p>
        </div>
      ) : null}
    </section>
  );
}
