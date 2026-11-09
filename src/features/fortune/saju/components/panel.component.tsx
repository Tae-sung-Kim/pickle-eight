'use client';

import {
  type JSX,
  type MouseEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FORTUNE_DST_NOTICE,
  FORTUNE_METHOD_B_NOTICE,
} from '@/features/fortune/constants/fortune-notice.constant';
import {
  FORTUNE_SAJU_BRANCHES,
  FORTUNE_SAJU_LATE_ZI_STEM_BASIS,
  FORTUNE_SAJU_SEED_PREFIX,
  FORTUNE_SAJU_STEMS,
} from '@/features/fortune/constants/fortune-saju.constant';
import {
  FORTUNE_SAJU_BOUNDARY_NOTICE_TEMPLATE,
  FORTUNE_SAJU_CANDIDATE_LABEL_TEMPLATES,
  FORTUNE_SAJU_PANEL_TEXTS,
  FORTUNE_SAJU_SOLAR_TERM_NAMES,
  FORTUNE_SAJU_TIME_QUESTION_TEXT,
  FORTUNE_SAJU_TIME_UNKNOWN_NOTICE,
} from '@/features/fortune/constants/fortune-saju-notice.constant';
import { FORTUNE_SAJU_CALC_BASIS_ANCHOR_ID } from '@/features/fortune/constants/fortune-saju-view.constant';
import { FORTUNE_COMMON_POOL } from '@/features/fortune/constants/pools/common.constant';
import {
  FORTUNE_SAJU_BASE_SCORES,
  FORTUNE_SAJU_POOLS,
} from '@/features/fortune/constants/pools/saju-pools.constant';
import { useKoreaDateKey } from '@/features/fortune/hooks/use-korea-date-key.hook';
import { FortuneSajuElementsComponent } from '@/features/fortune/saju/components/elements.component';
import { FortuneSajuPillarsComponent } from '@/features/fortune/saju/components/pillars.component';
import { FortuneSajuTenGodComponent } from '@/features/fortune/saju/components/ten-god.component';
import { useSajuFlow } from '@/features/fortune/saju/hooks/use-saju-flow.hook';
import { FortuneAgeBlockedComponent } from '@/features/fortune/shared/components/age-blocked.component';
import { FortuneBirthFormComponent } from '@/features/fortune/shared/components/birth-form.component';
import { FortuneBirthTimeFormComponent } from '@/features/fortune/shared/components/birth-time-form.component';
import { FortuneCandidateChoiceComponent } from '@/features/fortune/shared/components/candidate-choice.component';
import { FortuneLuckyComponent } from '@/features/fortune/shared/components/lucky.component';
import { FortuneLunarConfirmComponent } from '@/features/fortune/shared/components/lunar-confirm.component';
import { FortuneReadingComponent } from '@/features/fortune/shared/components/reading.component';
import type {
  FortuneBirthInputType,
  FortuneClockTimeType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import type { FortuneSajuChartType } from '@/features/fortune/types/fortune-saju.type';
import { parseDateKey } from '@/features/fortune/utils/fortune-date.util';
import {
  getLunarLeapMonth,
  getLunarMonthLength,
} from '@/features/fortune/utils/fortune-lunar.util';
import { buildFortuneReading } from '@/features/fortune/utils/fortune-reading.util';
import {
  buildFortuneSajuCharts,
  getDayPillar,
  getFortuneTenGod,
  shouldShowFortuneDstNotice,
} from '@/features/fortune/utils/fortune-saju.util';
import { cn } from '@/lib/utils';

const PANEL_CLASS =
  'scroll-mt-20 rounded-panel border border-border bg-card p-5 sm:p-8';
const H2_CLASS =
  'rounded-sm text-xl leading-tight font-semibold break-keep text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:text-2xl';
const BLOCK_CLASS = 'border-t border-border pt-8';
const LINK_CLASS =
  'inline-flex min-h-11 items-center rounded-sm text-sm leading-6 font-medium break-keep text-primary underline underline-offset-4 hover:decoration-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none';
const NOTICE_CLASS = 'text-sm leading-6 break-keep text-muted-foreground';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type CandidateKeyType = '0' | '1';

/** `양력 {연}년 {월}월 {일}일 기준` 줄. 상태의 양력 날짜로 만든다 */
function formatSummary(solar: FortuneYmdType): string {
  return FORTUNE_SAJU_PANEL_TEXTS.summaryTemplate
    .replace('{연}', String(solar.year))
    .replace('{월}', String(solar.month))
    .replace('{일}', String(solar.day));
}

/** 결과 제목이 화면에 절반 이상 보이지 않을 때만 결과 위치로 스크롤한다. 동작 줄이기면 즉시 이동한다 */
function scrollResultIntoViewIfNeeded(
  target: HTMLElement | null,
  title: HTMLElement | null
): void {
  if (!target || !title) {
    return;
  }
  const rect = title.getBoundingClientRect();
  const visibleHeight =
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  if (visibleHeight >= rect.height / 2) {
    return;
  }
  const isReduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  target.scrollIntoView({
    block: 'start',
    behavior: isReduced ? 'auto' : 'smooth',
  });
}

/** 계산 기준 영역으로 이동하고 포커스를 옮긴다. 동작 줄이기면 즉시 이동한다 */
function goToCalcBasis(event: MouseEvent<HTMLAnchorElement>): void {
  const target = document.getElementById(FORTUNE_SAJU_CALC_BASIS_ANCHOR_ID);
  if (!target) {
    return;
  }
  event.preventDefault();
  const isReduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  target.scrollIntoView({
    block: 'start',
    behavior: isReduced ? 'auto' : 'smooth',
  });
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
}

function toGanji(pillar: { stem: number; branch: number }): string {
  return `${FORTUNE_SAJU_STEMS[pillar.stem].ko}${FORTUNE_SAJU_BRANCHES[pillar.branch].ko}`;
}

export type FortuneSajuPanelComponentPropsType = Readonly<{
  /** 동의 화면에서 막 동의한 경우에만 true. 첫 h2("생년월일 입력")로 포커스를 옮긴다 */
  shouldFocusTitle?: boolean;
}>;

/**
 * 사주 panel. 동의(granted) 뒤에만 root가 next/dynamic으로 불러온다.
 * - 흐름: 생년월일 → 연령 확인 → 태어난 시간(또는 시간 모름) → (경계일이면 후보 선택) → 결과. 폼과 시간 단계는 결과 뒤에도 남는다(UD-3 안 A).
 * - 차트·오행·십신·일진·점수·표준시 안내 여부는 상태가 아니라 렌더링 중 계산한다.
 * - 입력값은 메모리(state)에만 둔다. 저장·URL 금지, 연령 미달이면 비운다(AC-47).
 */
export function FortuneSajuPanelComponent({
  shouldFocusTitle = false,
}: FortuneSajuPanelComponentPropsType): JSX.Element {
  const todayKey = useKoreaDateKey();
  const today = useMemo(
    () => (todayKey ? parseDateKey(todayKey) : null),
    [todayKey]
  );
  const { state, submit, submitTime, setTimeUnknown, choose, reset } =
    useSajuFlow();
  // 흐름 훅은 time 단계에서만 시간을 받으므로, 결과 뒤 다시 누르기는 같은 입력으로 되감아 처리한다. 메모리만 쓴다
  const [lastInput, setLastInput] = useState<FortuneBirthInputType | null>(
    null
  );
  // 새 결과를 공개한 횟수: 점수 눈금 모션(M1)과 sr 공지 신호
  const [revealCount, setRevealCount] = useState(0);
  // 사용자가 제출해 단계가 바뀐 뒤 포커스를 옮기는 신호
  const [focusNonce, setFocusNonce] = useState(0);
  const handledNonceRef = useRef(0);

  const dateTitleId = useId();
  const boundaryNoticeId = useId();
  const dateTitleRef = useRef<HTMLHeadingElement>(null);
  const timeTitleRef = useRef<HTMLHeadingElement>(null);
  const firstCandidateRef = useRef<HTMLButtonElement>(null);
  const ageTitleRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const resultTitleRef = useRef<HTMLHeadingElement>(null);

  const step = state.step;
  const solar =
    state.step === 'input' || state.step === 'age-blocked' ? null : state.solar;
  const isFromLunar =
    state.step === 'time' || state.step === 'choose' || state.step === 'done'
      ? state.isFromLunar
      : false;
  const lunarInput =
    isFromLunar && lastInput?.calendar === 'lunar' ? lastInput : null;

  // 동의 직후 한 번만 첫 h2로 포커스를 옮긴다
  useEffect(() => {
    if (shouldFocusTitle) {
      dateTitleRef.current?.focus();
    }
  }, [shouldFocusTitle]);

  // 연령 미달이면 입력값을 남기지 않는다(AC-47)
  useEffect(() => {
    if (step === 'age-blocked') {
      setLastInput(null);
    }
  }, [step]);

  // 사용자가 제출해서 단계가 바뀐 뒤에만 새 화면으로 포커스를 옮긴다(신호 하나당 한 번)
  useEffect(() => {
    if (focusNonce === handledNonceRef.current) {
      return;
    }
    handledNonceRef.current = focusNonce;
    if (step === 'time') {
      timeTitleRef.current?.focus();
    } else if (step === 'choose') {
      firstCandidateRef.current?.focus();
    } else if (step === 'age-blocked') {
      ageTitleRef.current?.focus();
    } else if (step === 'done') {
      scrollResultIntoViewIfNeeded(resultRef.current, resultTitleRef.current);
      resultTitleRef.current?.focus({ preventScroll: true });
    }
  }, [focusNonce, step]);

  // 차트(경계일 + 시간 모름이면 후보 2개). 상태에 넣지 않고 렌더링 중 계산한다
  const charts = useMemo(() => {
    if (state.step !== 'choose' && state.step !== 'done') {
      return null;
    }
    const time = state.step === 'done' ? state.time : null;
    return buildFortuneSajuCharts(
      state.solar,
      time,
      FORTUNE_SAJU_LATE_ZI_STEM_BASIS
    );
  }, [state]);

  const chart: FortuneSajuChartType | null = useMemo(() => {
    if (!charts || state.step !== 'done') {
      return null;
    }
    if (charts.kind === 'single') {
      return charts.chart;
    }
    if (charts.kind === 'need-choice' && state.candidate !== null) {
      return charts.charts[state.candidate];
    }
    return null;
  }, [charts, state]);

  const todayPillar = useMemo(
    () => (today ? getDayPillar(today) : null),
    [today]
  );
  const dayStem = chart?.day.stem ?? null;
  const tenGod =
    dayStem !== null && todayPillar
      ? getFortuneTenGod(dayStem, todayPillar.stem)
      : null;

  const reading = useMemo(() => {
    if (dayStem === null || !tenGod || !todayKey) {
      return null;
    }
    return buildFortuneReading({
      seedText: `${FORTUNE_SAJU_SEED_PREFIX}|${dayStem}|${todayKey}`,
      dateKey: todayKey,
      pool: FORTUNE_SAJU_POOLS[tenGod],
      common: FORTUNE_COMMON_POOL,
      baseScores: FORTUNE_SAJU_BASE_SCORES[tenGod],
    });
  }, [dayStem, tenGod, todayKey]);

  function handleSubmitDate(input: FortuneBirthInputType): void {
    // 마운트 전(오늘 날짜 없음)에는 제출하지 않는다
    if (!today) {
      return;
    }
    // 흐름은 input 단계에서만 날짜를 받는다. 결과가 나온 뒤 다시 누르면 처음부터 다시 시작한다
    if (step !== 'input') {
      reset();
    }
    submit(input, today);
    setLastInput(input);
    setFocusNonce((count) => count + 1);
  }

  // 폼 형식 검사에서 걸리면 오류 안내만 남기고 이전 결과를 지운다(AC-1)
  function handleInvalid(): void {
    if (step !== 'input') {
      reset();
    }
    setLastInput(null);
  }

  /** 흐름을 time 단계로 맞춘다. 이미 time이면 그대로 둔다 */
  function ensureTimeStep(): boolean {
    if (!lastInput || !today) {
      return false;
    }
    if (step !== 'time') {
      reset();
      submit(lastInput, today);
    }
    return true;
  }

  function handleSubmitTime(time: FortuneClockTimeType): void {
    if (!ensureTimeStep()) {
      return;
    }
    submitTime(time);
    setRevealCount((count) => count + 1);
    setFocusNonce((count) => count + 1);
  }

  function handleTimeUnknown(): void {
    if (!ensureTimeStep()) {
      return;
    }
    setTimeUnknown();
    setRevealCount((count) => count + 1);
    setFocusNonce((count) => count + 1);
  }

  // 후보는 고른 뒤에도 버튼이 남아 바꿀 수 있어 포커스는 버튼에 둔다(신호 없음)
  function handleChoose(key: CandidateKeyType): void {
    if (!ensureTimeStep()) {
      return;
    }
    setTimeUnknown();
    choose(key === '0' ? 0 : 1);
    setRevealCount((count) => count + 1);
  }

  if (step === 'age-blocked') {
    return (
      <div className={PANEL_CLASS}>
        <FortuneAgeBlockedComponent titleRef={ageTitleRef} />
      </div>
    );
  }

  const boundary = charts?.kind === 'need-choice' ? charts.boundary : null;
  const needChoice = charts?.kind === 'need-choice' ? charts : null;
  const selectedCandidate: CandidateKeyType | null =
    state.step === 'done' && state.candidate !== null
      ? (String(state.candidate) as CandidateKeyType)
      : null;
  const hasTime = state.step === 'done' && state.time !== null;
  const summary = solar ? formatSummary(solar) : '';
  const isResultReady = Boolean(
    state.step === 'done' &&
      chart &&
      todayPillar &&
      tenGod &&
      reading &&
      todayKey
  );

  return (
    <div className={cn(PANEL_CLASS, 'space-y-8')}>
      {/* 결과 공지: 영역은 항상 두고 내용만 바꾼다. 입력값은 넣지 않는다 */}
      <div aria-live="polite" className="sr-only">
        {isResultReady && revealCount > 0 ? (
          <p key={revealCount}>{FORTUNE_SAJU_PANEL_TEXTS.resultAnnouncement}</p>
        ) : null}
      </div>

      <section aria-labelledby={dateTitleId}>
        <h2
          id={dateTitleId}
          ref={dateTitleRef}
          tabIndex={-1}
          className={cn(H2_CLASS, 'mb-4')}
        >
          {FORTUNE_SAJU_PANEL_TEXTS.dateTitle}
        </h2>
        <FortuneBirthFormComponent
          todayKey={todayKey}
          error={state.step === 'input' ? state.error : null}
          submitLabel={FORTUNE_SAJU_PANEL_TEXTS.dateSubmitLabel}
          getLunarLeapMonth={getLunarLeapMonth}
          getLunarMonthLength={getLunarMonthLength}
          onSubmit={handleSubmitDate}
          onInvalid={handleInvalid}
        />
      </section>

      {solar ? (
        <div className={cn(BLOCK_CLASS, 'space-y-4')}>
          {lunarInput ? (
            <FortuneLunarConfirmComponent lunar={lunarInput} solar={solar} />
          ) : null}
          <FortuneBirthTimeFormComponent
            key={`${solar.year}-${solar.month}-${solar.day}`}
            description={lunarInput ? '' : summary}
            onSubmit={handleSubmitTime}
            onUnknown={handleTimeUnknown}
            titleRef={timeTitleRef}
            texts={{
              title: FORTUNE_SAJU_PANEL_TEXTS.timeFormTitle,
              help: FORTUNE_SAJU_TIME_QUESTION_TEXT,
              submit: FORTUNE_SAJU_PANEL_TEXTS.timeFormSubmit,
              unknown: FORTUNE_SAJU_PANEL_TEXTS.timeFormUnknown,
            }}
          />
          <a
            href={`#${FORTUNE_SAJU_CALC_BASIS_ANCHOR_ID}`}
            onClick={goToCalcBasis}
            className={LINK_CLASS}
          >
            {FORTUNE_SAJU_PANEL_TEXTS.calcBasisLinkLabel}
          </a>
        </div>
      ) : null}

      {boundary && needChoice ? (
        <div className={cn(BLOCK_CLASS, 'space-y-3')}>
          <p
            id={boundaryNoticeId}
            className="text-sm leading-6 break-keep text-foreground"
          >
            {FORTUNE_SAJU_BOUNDARY_NOTICE_TEMPLATE.replace(
              '{절기}',
              FORTUNE_SAJU_SOLAR_TERM_NAMES[boundary.termIndex / 2]
            ).replace(
              '{기둥}',
              boundary.kind === 'year'
                ? `${FORTUNE_SAJU_PANEL_TEXTS.pillarYearLabel}와 ${FORTUNE_SAJU_PANEL_TEXTS.pillarMonthLabel}`
                : FORTUNE_SAJU_PANEL_TEXTS.pillarMonthLabel
            )}
          </p>
          <FortuneCandidateChoiceComponent<CandidateKeyType>
            candidates={[
              {
                key: '0',
                label: FORTUNE_SAJU_CANDIDATE_LABEL_TEMPLATES[
                  boundary.kind
                ].replace(
                  '{간지}',
                  toGanji(needChoice.charts[0][boundary.kind])
                ),
              },
              {
                key: '1',
                label: FORTUNE_SAJU_CANDIDATE_LABEL_TEMPLATES[
                  boundary.kind
                ].replace(
                  '{간지}',
                  toGanji(needChoice.charts[1][boundary.kind])
                ),
              },
            ]}
            selectedKey={selectedCandidate}
            onSelect={handleChoose}
            firstButtonRef={firstCandidateRef}
          />
        </div>
      ) : null}

      {state.step === 'done' &&
      solar &&
      chart &&
      todayPillar &&
      tenGod &&
      reading ? (
        <div ref={resultRef} className="scroll-mt-20 space-y-8">
          <div className={cn(BLOCK_CLASS, 'space-y-6')}>
            <div className="space-y-2 md:flex md:items-baseline md:justify-between md:space-y-0">
              <h2 ref={resultTitleRef} tabIndex={-1} className={H2_CLASS}>
                {FORTUNE_SAJU_PANEL_TEXTS.pillarsTitle}
              </h2>
              {lunarInput ? (
                <FortuneLunarConfirmComponent
                  lunar={lunarInput}
                  solar={solar}
                />
              ) : (
                <p className="text-sm leading-6 text-foreground tabular-nums">
                  {summary}
                </p>
              )}
            </div>
            <div className="space-y-8 md:grid md:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] md:gap-x-10 md:space-y-0">
              <div className="space-y-3">
                <FortuneSajuPillarsComponent chart={chart} />
                {chart.hour === null ? (
                  <p className={NOTICE_CLASS}>
                    {FORTUNE_SAJU_TIME_UNKNOWN_NOTICE}
                  </p>
                ) : shouldShowFortuneDstNotice(solar.year, hasTime) ? (
                  <p className={NOTICE_CLASS}>{FORTUNE_DST_NOTICE}</p>
                ) : null}
              </div>
              <FortuneSajuElementsComponent chart={chart} />
            </div>
            <div className={BLOCK_CLASS}>
              <FortuneSajuTenGodComponent
                todayPillar={todayPillar}
                dayStem={chart.day.stem}
                tenGod={tenGod}
              />
            </div>
          </div>

          <div className={cn(BLOCK_CLASS, 'space-y-6')}>
            <FortuneReadingComponent
              reading={reading}
              methodNotice={FORTUNE_METHOD_B_NOTICE}
              animationKey={revealCount}
            />
            <FortuneLuckyComponent lucky={reading.lucky} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
