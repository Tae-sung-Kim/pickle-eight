import { type JSX, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  FORTUNE_FINDER_BASIS_NOTICE,
  FORTUNE_SEOLLAL_TEMPLATE,
  FORTUNE_SUPPORTED_RANGE_NOTICE,
} from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_ZODIAC } from '@/features/fortune/constants/fortune-zodiac.constant';
import { useBirthFlow } from '@/features/fortune/hooks/use-birth-flow.hook';
import { FortuneAgeBlockedComponent } from '@/features/fortune/shared/components/age-blocked.component';
import { FortuneBirthFormComponent } from '@/features/fortune/shared/components/birth-form.component';
import { FortuneBirthTimeFormComponent } from '@/features/fortune/shared/components/birth-time-form.component';
import { FortuneCandidateChoiceComponent } from '@/features/fortune/shared/components/candidate-choice.component';
import { FortuneLunarConfirmComponent } from '@/features/fortune/shared/components/lunar-confirm.component';
import type {
  FortuneBirthInputType,
  FortuneTtiKeyType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import { parseDateKey } from '@/features/fortune/utils/fortune-date.util';
import {
  getLunarLeapMonth,
  getLunarMonthLength,
} from '@/features/fortune/utils/fortune-lunar.util';
import { getSolarTermTime } from '@/features/fortune/utils/fortune-solar-term.util';
import {
  determineFortuneTti,
  getSeollalTti,
  resolveFortuneTtiWithTime,
} from '@/features/fortune/utils/fortune-tti.util';

// 화면 문구. ui-ux-design.md "문구"(패널 제목, 주요 버튼, 찾은 띠, 시각 질문(띠), 후보 버튼).
// 운세 상수 파일에는 아직 없어 이 파일에 둔다
const TTI_FINDER_TEXTS = {
  title: '내 띠 찾기',
  submitLabel: '내 띠 찾기',
  foundPrefix: '입춘 시각을 기준으로',
  foundSuffix: '입니다.',
  candidateSuffix: '로 보기',
  timeIntro: '이 날은 입춘이 드는 날이라 태어난 시각에 따라 띠가 달라집니다.',
  // {연도}, {M}, {D}, {HH:mm}을 바꿔 쓴다
  timeBoundaryTemplate: '{연도}년 입춘은 {M}월 {D}일 {HH:mm}(한국 시간)입니다.',
} as const;

/** 24절기 인덱스 2 = 입춘. fortune-tti.util의 LICHUN_TERM_INDEX와 같은 값이다(그쪽은 내보내지 않아 여기에 둔다) */
const LICHUN_TERM_INDEX = 2;

const TITLE_CLASS =
  'rounded-sm text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl';

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

/**
 * 시각 질문 설명. need-time 상태에는 경계 시각이 없어 입력 날짜의 입춘 시각을 절기 표에서 읽는다.
 * 표에 없는 연도(방어 경로)면 이유 문장만 보인다
 */
function buildTimeDescription(solar: FortuneYmdType): string {
  const lichun = getSolarTermTime(solar.year, LICHUN_TERM_INDEX);
  if (!lichun) {
    return TTI_FINDER_TEXTS.timeIntro;
  }
  const boundary = TTI_FINDER_TEXTS.timeBoundaryTemplate
    .replace('{연도}', String(solar.year))
    .replace('{M}', String(lichun.month))
    .replace('{D}', String(lichun.day))
    .replace('{HH:mm}', `${padTwo(lichun.hour)}:${padTwo(lichun.minute)}`);
  return `${TTI_FINDER_TEXTS.timeIntro} ${boundary}`;
}

/** 설날 기준 띠. 음력 표 범위 밖이면 null(지원 범위 안에서는 오지 않는 방어 경로) */
function findSeollalTti(solar: FortuneYmdType): FortuneTtiKeyType | null {
  try {
    return getSeollalTti(solar);
  } catch {
    return null;
  }
}

export type FortuneTtiFinderComponentPropsType = Readonly<{
  /** KST 오늘 'YYYY-MM-DD'(useKoreaDateKey). 마운트 전 null */
  todayKey: string | null;
  /** 띠가 정해지면(시각 반영, 후보 선택 포함) 부모가 그 띠를 목록에서 펼친다 */
  onFound: (key: FortuneTtiKeyType) => void;
}>;

/**
 * 내 띠 찾기 면. 생년월일 → 연령 확인 → (입춘일이면 시각 질문 → 시각 모름이면 후보 선택) → 띠 + 설날 기준 안내.
 * - 찾은 띠의 결과는 이 컴포넌트가 그리지 않는다. onFound로 알리면 부모가 목록에서 펼친다(사본을 그리지 않는다).
 * - 입력값(양력/음력 생년월일, 시각)은 이 훅·폼의 메모리에만 둔다. 저장·전송·URL에 올리지 않는다(AC-28, AC-30).
 */
export function FortuneTtiFinderComponent({
  todayKey,
  onFound,
}: FortuneTtiFinderComponentPropsType): JSX.Element {
  const titleId = useId();
  const today = useMemo(
    () => (todayKey ? parseDateKey(todayKey) : null),
    [todayKey]
  );
  const { state, submit, submitTime, setTimeUnknown, reset } =
    useBirthFlow<FortuneTtiKeyType>(TTI_FLOW_CONFIG);
  // 음력으로 입력했을 때만 확인 줄에 쓴다
  const [lunarInput, setLunarInput] = useState<FortuneBirthInputType | null>(
    null
  );
  // 시각 모름 → 후보 선택에서 고른 띠. 고른 뒤에도 버튼이 남아 다른 쪽으로 바꿀 수 있어
  // 흐름의 CHOOSE(done으로 닫힘)를 쓰지 않고 여기서 들고 있는다
  const [pickedKey, setPickedKey] = useState<FortuneTtiKeyType | null>(null);
  // 제출한 횟수. 같은 단계가 반복돼도 포커스를 다시 옮기는 신호
  const [attempt, setAttempt] = useState(0);

  const timeTitleRef = useRef<HTMLHeadingElement>(null);
  const firstCandidateRef = useRef<HTMLButtonElement>(null);
  const ageTitleRef = useRef<HTMLHeadingElement>(null);

  const step = state.step;

  // 사용자가 제출해서 단계가 바뀐 뒤에만 새 화면으로 포커스를 옮긴다
  useEffect(() => {
    if (attempt === 0) {
      return;
    }
    if (step === 'need-time') {
      timeTitleRef.current?.focus();
    } else if (step === 'choose') {
      firstCandidateRef.current?.focus();
    } else if (step === 'age-blocked') {
      ageTitleRef.current?.focus();
    }
  }, [attempt, step]);

  // 연령 미달이면 입력했던 음력 값도 남기지 않는다(AC-45)
  useEffect(() => {
    if (step === 'age-blocked') {
      setLunarInput(null);
    }
  }, [step]);

  // 시각 반영 등으로 띠가 하나로 정해졌을 때 부모에 알린다
  useEffect(() => {
    if (state.step === 'done' && state.key) {
      onFound(state.key);
    }
  }, [state, onFound]);

  function handleSubmit(input: FortuneBirthInputType): void {
    // 마운트 전(오늘 날짜 없음)에는 제출하지 않는다
    if (!today) {
      return;
    }
    // 결과가 나온 뒤에도 폼이 남아 다른 날짜로 이어서 찾을 수 있다. 흐름은 input 단계에서만 제출을 받는다
    if (step !== 'input') {
      reset();
    }
    submit(input, today);
    setLunarInput(input.calendar === 'lunar' ? input : null);
    setPickedKey(null);
    setAttempt((count) => count + 1);
  }

  // 폼 형식 검사에서 걸리면 오류 안내만 남기고 이전에 찾은 띠를 지운다(AC-1)
  function handleInvalid(): void {
    if (step !== 'input') {
      reset();
    }
    setLunarInput(null);
    setPickedKey(null);
  }

  function handlePick(key: FortuneTtiKeyType): void {
    setPickedKey(key);
    onFound(key);
  }

  if (step === 'age-blocked') {
    return (
      <div className="rounded-lg border border-border bg-background p-4 sm:p-5">
        <FortuneAgeBlockedComponent titleRef={ageTitleRef} />
      </div>
    );
  }

  const error = state.step === 'input' ? state.error : null;
  const solar = state.step === 'input' ? null : state.solar;
  const isFromLunar = state.step === 'input' ? false : state.isFromLunar;
  const foundKey =
    state.step === 'done'
      ? state.key
      : state.step === 'choose'
        ? pickedKey
        : null;
  const seollalKey = solar && foundKey ? findSeollalTti(solar) : null;

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-4 rounded-lg border border-border bg-background p-4 sm:p-5"
    >
      <h2 id={titleId} className={TITLE_CLASS}>
        {TTI_FINDER_TEXTS.title}
      </h2>

      <FortuneBirthFormComponent
        todayKey={todayKey}
        error={error}
        submitLabel={TTI_FINDER_TEXTS.submitLabel}
        getLunarLeapMonth={getLunarLeapMonth}
        getLunarMonthLength={getLunarMonthLength}
        onSubmit={handleSubmit}
        onInvalid={handleInvalid}
        isCompact
      />

      {/* 방어 경로: 절기·음력 표 범위 밖이면 오류 줄 옆에 지원 범위를 알린다 */}
      {error === 'out-of-table' ? (
        <p className="text-sm leading-6 break-keep text-muted-foreground">
          {FORTUNE_SUPPORTED_RANGE_NOTICE}
        </p>
      ) : null}

      {solar && isFromLunar && lunarInput ? (
        <FortuneLunarConfirmComponent lunar={lunarInput} solar={solar} />
      ) : null}

      {state.step === 'need-time' ? (
        <div className="border-t border-border pt-4">
          <FortuneBirthTimeFormComponent
            key={`${state.solar.year}-${state.solar.month}-${state.solar.day}`}
            description={buildTimeDescription(state.solar)}
            onSubmit={submitTime}
            onUnknown={setTimeUnknown}
            titleRef={timeTitleRef}
          />
        </div>
      ) : null}

      {state.step === 'choose' ? (
        <div className="border-t border-border pt-4">
          <FortuneCandidateChoiceComponent<FortuneTtiKeyType>
            candidates={[
              {
                key: state.before,
                label: `${TTI_NAME_BY_KEY[state.before]}${TTI_FINDER_TEXTS.candidateSuffix}`,
              },
              {
                key: state.after,
                label: `${TTI_NAME_BY_KEY[state.after]}${TTI_FINDER_TEXTS.candidateSuffix}`,
              },
            ]}
            selectedKey={pickedKey}
            onSelect={handlePick}
            firstButtonRef={firstCandidateRef}
          />
        </div>
      ) : null}

      {foundKey ? (
        <div className="space-y-1 border-l-2 border-menu-fortune/40 pl-3">
          <p className="text-sm leading-6 font-medium break-keep text-foreground">
            {`${TTI_FINDER_TEXTS.foundPrefix} ${TTI_NAME_BY_KEY[foundKey]}${TTI_FINDER_TEXTS.foundSuffix}`}
          </p>
          {seollalKey && seollalKey !== foundKey ? (
            <p className="text-sm leading-6 break-keep text-muted-foreground">
              {FORTUNE_SEOLLAL_TEMPLATE.replace(
                '{띠}',
                TTI_NAME_BY_KEY[seollalKey]
              )}
            </p>
          ) : null}
          <p className="text-sm leading-6 break-keep text-muted-foreground">
            {FORTUNE_FINDER_BASIS_NOTICE}
          </p>
        </div>
      ) : null}
    </section>
  );
}
