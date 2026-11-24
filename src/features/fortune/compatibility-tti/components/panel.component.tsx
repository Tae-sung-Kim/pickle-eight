import { type JSX, useEffect, useMemo, useRef, useState } from 'react';
import { FORTUNE_COMPATIBILITY_TTI_RELATION_COPY } from '@/features/fortune/constants/fortune-compatibility-copy.constant';
import { FORTUNE_COMPATIBILITY_LABELS } from '@/features/fortune/constants/fortune-compatibility-label.constant';
import {
  FORTUNE_COMPATIBILITY_PERSON_LABELS,
  FORTUNE_COMPATIBILITY_TIME_UNKNOWN_LINE_TEMPLATE,
} from '@/features/fortune/constants/fortune-compatibility-menu.constant';
import { FORTUNE_COMPATIBILITY_AGE_BLOCKED_TEXTS } from '@/features/fortune/constants/fortune-compatibility-notice.constant';
import { FORTUNE_COMPATIBILITY_TTI_SAME_COPY } from '@/features/fortune/constants/fortune-compatibility-same-copy.constant';
import { FORTUNE_COMPATIBILITY_TTI_RELATION_NAMES } from '@/features/fortune/constants/fortune-compatibility-tti.constant';
import {
  FORTUNE_CALC_BASIS_TTI,
  FORTUNE_TIME_UNKNOWN_NOTICE,
} from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';
import { FORTUNE_TTI_TIME_QUESTION_TEXTS } from '@/features/fortune/constants/fortune-time-question.constant';
import { FORTUNE_ZODIAC } from '@/features/fortune/constants/fortune-zodiac.constant';
import { useCompatibilityFlow } from '@/features/fortune/hooks/use-compatibility-flow.hook';
import { useKoreaDateKey } from '@/features/fortune/hooks/use-korea-date-key.hook';
import { FortuneAgeBlockedComponent } from '@/features/fortune/shared/components/age-blocked.component';
import { FortuneCompatibilityPersonStepComponent } from '@/features/fortune/shared/components/compatibility-person-step.component';
import {
  FortuneCompatibilityResultComponent,
  type FortuneCompatibilityResultSwapType,
} from '@/features/fortune/shared/components/compatibility-result.component';
import type {
  FortuneBirthInputType,
  FortuneTtiKeyType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import {
  resolveFortuneCompatibilityTti,
  resolveFortuneCompatibilityTtiCopy,
} from '@/features/fortune/utils/fortune-compatibility.util';
import { parseDateKey } from '@/features/fortune/utils/fortune-date.util';
import { getSolarTermTime } from '@/features/fortune/utils/fortune-solar-term.util';
import {
  determineFortuneTti,
  resolveFortuneTtiWithTime,
} from '@/features/fortune/utils/fortune-tti.util';

/** 24절기 인덱스 2 = 입춘 */
const LICHUN_TERM_INDEX = 2;

const PANEL_CLASS =
  'scroll-mt-20 rounded-panel border border-border bg-card p-5 sm:p-8';

/** 판정 함수는 module 상수로 넘긴다(훅이 참조 안정성을 기대한다) */
const TTI_FLOW_CONFIG = {
  determine: determineFortuneTti,
  resolveWithTime: resolveFortuneTtiWithTime,
} as const;

const TTI_NAME_BY_KEY = Object.fromEntries(
  FORTUNE_ZODIAC.map((zodiac) => [zodiac.key, zodiac.name])
) as Readonly<Record<FortuneTtiKeyType, string>>;

function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

/** 시각 질문 설명. 입력 날짜의 입춘 시각을 절기 표에서 읽는다. 표에 없으면 이유 문장만 보인다 */
function buildTimeDescription(solar: FortuneYmdType): string {
  const lichun = getSolarTermTime(solar.year, LICHUN_TERM_INDEX);
  if (!lichun) {
    return FORTUNE_TTI_TIME_QUESTION_TEXTS.timeIntro;
  }
  const boundary = FORTUNE_TTI_TIME_QUESTION_TEXTS.timeBoundaryTemplate
    .replace('{연도}', String(solar.year))
    .replace('{M}', String(lichun.month))
    .replace('{D}', String(lichun.day))
    .replace('{HH:mm}', `${padTwo(lichun.hour)}:${padTwo(lichun.minute)}`);
  return `${FORTUNE_TTI_TIME_QUESTION_TEXTS.timeIntro} ${boundary}`;
}

export type FortuneCompatibilityTtiPanelComponentPropsType = Readonly<{
  /** 동의 화면에서 막 동의한 경우에만 true. 첫 단계 h2로 포커스를 옮긴다 */
  shouldFocusTitle?: boolean;
}>;

/**
 * 띠 궁합 panel. 동의(granted) 뒤에만 root가 next/dynamic으로 불러온다.
 * - 첫 번째 사람 → 두 번째 사람 → 결과. 입력값은 흐름 훅의 메모리에만 있고 저장·전송하지 않는다.
 * - 음력 확인 줄은 훅이 입력값을 버리므로 제출 시점 입력값을 이 컴포넌트가 메모리에 들고 있다가
 *   시각 질문·후보 선택 중에만 쓰고, 그 단계가 끝나면 지운다.
 */
export function FortuneCompatibilityTtiPanelComponent({
  shouldFocusTitle = false,
}: FortuneCompatibilityTtiPanelComponentPropsType): JSX.Element {
  const todayKey = useKoreaDateKey();
  const today = useMemo(
    () => (todayKey ? parseDateKey(todayKey) : null),
    [todayKey]
  );
  const {
    state,
    submit,
    submitTime,
    setTimeUnknown,
    choose,
    swapCandidate,
    reset,
  } = useCompatibilityFlow<FortuneTtiKeyType>(TTI_FLOW_CONFIG);
  const [lunarInput, setLunarInput] = useState<FortuneBirthInputType | null>(
    null
  );
  // "다시 입력"으로 첫 단계에 돌아온 뒤에는 첫 단계 h2로 포커스를 옮긴다
  const [hasReset, setHasReset] = useState(false);
  const ageTitleRef = useRef<HTMLHeadingElement>(null);

  const step = state.step;
  const pendingStep =
    state.step === 'first' || state.step === 'second'
      ? state.person.step
      : null;

  const isAskingMore = pendingStep === 'need-time' || pendingStep === 'choose';

  // 시각 질문·후보 선택 중이 아니면(질문 없이 다음 사람으로 넘어감, 범위 밖 오류, 연령 차단, 결과)
  // 입력해 둔 음력 값을 바로 지운다
  useEffect(() => {
    if (!isAskingMore && lunarInput) {
      setLunarInput(null);
    }
  }, [isAskingMore, lunarInput]);

  useEffect(() => {
    if (step === 'age-blocked') {
      ageTitleRef.current?.focus();
    }
  }, [step]);

  function handleSubmit(input: FortuneBirthInputType): void {
    // 마운트 전(오늘 날짜 없음)에는 제출하지 않는다
    if (!today) {
      return;
    }
    submit(input, today);
    setLunarInput(input.calendar === 'lunar' ? input : null);
  }

  function handleReset(): void {
    setHasReset(true);
    reset();
  }

  if (state.step === 'age-blocked') {
    return (
      <div className={PANEL_CLASS}>
        <FortuneAgeBlockedComponent
          titleRef={ageTitleRef}
          texts={FORTUNE_COMPATIBILITY_AGE_BLOCKED_TEXTS}
        />
      </div>
    );
  }

  if (state.step === 'result') {
    const { first, second } = state;
    const result = resolveFortuneCompatibilityTti(first.key, second.key);
    const copy = resolveFortuneCompatibilityTtiCopy(
      first.key,
      second.key,
      FORTUNE_COMPATIBILITY_TTI_RELATION_COPY,
      FORTUNE_COMPATIBILITY_TTI_SAME_COPY
    );

    const swaps: FortuneCompatibilityResultSwapType[] = [];
    for (const target of ['first', 'second'] as const) {
      const person = state[target];
      if (person.otherKey !== null) {
        const line = FORTUNE_COMPATIBILITY_TIME_UNKNOWN_LINE_TEMPLATE.replace(
          '{사람}',
          FORTUNE_COMPATIBILITY_PERSON_LABELS[target]
        ).replace('{이름}', TTI_NAME_BY_KEY[person.key]);
        swaps.push({ target, text: `${FORTUNE_TIME_UNKNOWN_NOTICE} ${line}` });
      }
    }

    return (
      <FortuneCompatibilityResultComponent
        first={{ name: TTI_NAME_BY_KEY[first.key] }}
        second={{ name: TTI_NAME_BY_KEY[second.key] }}
        relationName={FORTUNE_COMPATIBILITY_TTI_RELATION_NAMES[result.relation]}
        grade={result.grade}
        copy={copy}
        swaps={swaps}
        earlyYear={
          first.isEarlyYear || second.isEarlyYear
            ? {
                text: FORTUNE_CALC_BASIS_TTI,
                linkLabel: FORTUNE_COMPATIBILITY_LABELS.ttiFortune,
                href: FORTUNE_ROUTES.tti,
              }
            : null
        }
        onSwap={swapCandidate}
        onReset={handleReset}
      />
    );
  }

  const person = state.person;
  const lunarConfirm =
    lunarInput &&
    (person.step === 'need-time' || person.step === 'choose') &&
    person.isFromLunar
      ? { lunar: lunarInput, solar: person.solar }
      : null;

  return (
    <FortuneCompatibilityPersonStepComponent<FortuneTtiKeyType>
      key={state.step}
      step={state.step}
      state={person}
      todayKey={todayKey}
      nameByKey={TTI_NAME_BY_KEY}
      firstKey={state.step === 'second' ? state.first.key : undefined}
      buildTimeDescription={buildTimeDescription}
      lunarConfirm={lunarConfirm}
      shouldFocusTitle={state.step === 'second' || hasReset || shouldFocusTitle}
      onSubmit={handleSubmit}
      onSubmitTime={submitTime}
      onTimeUnknown={setTimeUnknown}
      onChoose={choose}
      onReset={state.step === 'second' ? handleReset : undefined}
    />
  );
}
