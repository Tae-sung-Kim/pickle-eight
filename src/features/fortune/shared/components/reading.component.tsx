'use client';

import { motion } from 'framer-motion';
import { type JSX, type Ref, useId } from 'react';
import {
  FORTUNE_KST_LABEL,
  FORTUNE_SCORE_NOTICE,
} from '@/features/fortune/constants/fortune-notice.constant';
import {
  FORTUNE_SCORE_HIGH_MIN,
  FORTUNE_SCORE_MAX,
  FORTUNE_SCORE_MID_MIN,
  FORTUNE_SCORE_MIN,
} from '@/features/fortune/constants/fortune-score.constant';
import type {
  FortuneCategoryKeyType,
  FortuneReadingType,
  FortuneScoredTextType,
} from '@/features/fortune/types/fortune.type';
import { parseDateKey } from '@/features/fortune/utils/fortune-date.util';
import { cn } from '@/lib/utils';

// 결과 화면 문구. ui-ux-design.md "승인됨(2026-11-05)"의 결과 제목·항목 이름·기준 날짜 형식.
// 운세 상수 파일에는 아직 없어 이 파일에 둔다
const READING_TEXTS = {
  defaultTitle: '오늘의 결과',
  total: '총운',
  advice: '오늘의 조언',
  caution: '주의할 점',
  scoreUnit: '점',
} as const;

const CATEGORY_LABELS: Readonly<
  Record<Exclude<FortuneCategoryKeyType, 'total'>, string>
> = {
  money: '재물',
  love: '애정',
  work: '직장·학업',
  health: '건강',
};

/** 기록표 항목 순서: 재물 → 애정 → 직장·학업 → 건강 */
const ITEM_KEYS = ['money', 'love', 'work', 'health'] as const;

const WEEKDAY_LABELS = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
] as const;

// 점수 눈금 (ui-ux-design.md "점수 눈금"). viewBox 260 x 20
const SCALE_WIDTH = 260;
const SCALE_HEIGHT = 20;
const SCALE_BASE_Y = 14;
const SCALE_TICK_STEP = 5;
const SCALE_MAJOR_SCORES: readonly number[] = [
  FORTUNE_SCORE_MIN,
  FORTUNE_SCORE_MID_MIN,
  FORTUNE_SCORE_HIGH_MIN,
  FORTUNE_SCORE_MAX,
];
const SCALE_MINOR_SCORES: readonly number[] = Array.from(
  {
    length:
      Math.floor((FORTUNE_SCORE_MAX - FORTUNE_SCORE_MIN) / SCALE_TICK_STEP) + 1,
  },
  (_, index) => FORTUNE_SCORE_MIN + index * SCALE_TICK_STEP
);
// M1 모션 (ui-ux-design.md "인터랙션·애니메이션")
const SCALE_MOTION_DURATION_SECONDS = 0.4;
const SCALE_MOTION_STAGGER_SECONDS = 0.04;
const SCALE_MOTION_EASE = [0.2, 0.7, 0.2, 1] as const;

function scoreToX(score: number): number {
  const clamped = Math.min(
    Math.max(score, FORTUNE_SCORE_MIN),
    FORTUNE_SCORE_MAX
  );
  return (
    ((clamped - FORTUNE_SCORE_MIN) / (FORTUNE_SCORE_MAX - FORTUNE_SCORE_MIN)) *
    SCALE_WIDTH
  );
}

export type FortuneScoreScaleVariantType = 'total' | 'item' | 'compact';

const SCALE_HEIGHT_CLASS: Readonly<
  Record<FortuneScoreScaleVariantType, string>
> = {
  total: 'h-5',
  item: 'h-4',
  compact: 'h-3',
};

export type FortuneScoreScaleComponentPropsType = Readonly<{
  score: number;
  /** total: 총운(20px, 큰 눈금), item: 항목(16px), compact: 목록의 접힌 항목 총운(12px) */
  variant: FortuneScoreScaleVariantType;
  /**
   * M1 모션 재생 신호. null이면 움직임 없이 최종 위치로 그린다(처음 렌더링된 접힌 목록, 같은 결과의 재렌더).
   * 값이 바뀌면 처음부터 다시 재생한다(새 결과가 나올 때 부모가 값을 바꾼다).
   * 동작 줄이기 설정이면 MotionProvider(reducedMotion="user")가 최종 위치로 바로 보낸다.
   */
  animationKey?: string | number | null;
  /** 총운 0, 재물 1, 애정 2, 직장·학업 3, 건강 4. 40ms씩 늦게 시작한다 */
  delayIndex?: number;
}>;

/**
 * 점수 눈금(이 기능의 개성 요소). 인라인 SVG이고 aria-hidden이다. 점수 정보는 옆의 숫자 글자가 전한다.
 * 구간 이름(상·중·하, 좋음·나쁨)은 쓰지 않는다. 큰 눈금은 구간 경계 위치만 보인다.
 */
export function FortuneScoreScaleComponent({
  score,
  variant,
  animationKey = null,
  delayIndex = 0,
}: FortuneScoreScaleComponentPropsType): JSX.Element {
  const markerX = scoreToX(score);
  const isAnimated = animationKey !== null;
  const transition = {
    duration: SCALE_MOTION_DURATION_SECONDS,
    ease: SCALE_MOTION_EASE,
    delay: delayIndex * SCALE_MOTION_STAGGER_SECONDS,
  };

  return (
    <svg
      key={isAnimated ? String(animationKey) : 'static'}
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${SCALE_WIDTH} ${SCALE_HEIGHT}`}
      preserveAspectRatio="none"
      className={cn('w-full overflow-visible', SCALE_HEIGHT_CLASS[variant])}
    >
      <g
        className="text-muted-foreground"
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.45}
      >
        <line
          x1={0}
          x2={SCALE_WIDTH}
          y1={SCALE_BASE_Y}
          y2={SCALE_BASE_Y}
          vectorEffect="non-scaling-stroke"
        />
        {SCALE_MINOR_SCORES.map((tick) => (
          <line
            key={`minor-${tick}`}
            x1={scoreToX(tick)}
            x2={scoreToX(tick)}
            y1={10}
            y2={SCALE_BASE_Y}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {variant === 'total'
          ? SCALE_MAJOR_SCORES.map((tick) => (
              <line
                key={`major-${tick}`}
                x1={scoreToX(tick)}
                x2={scoreToX(tick)}
                y1={7}
                y2={SCALE_BASE_Y}
                vectorEffect="non-scaling-stroke"
              />
            ))
          : null}
      </g>
      <g className="text-menu-fortune">
        {/* 채움: x 0 ~ 점수 위치. scaleX 0 -> 1, 왼쪽 기준 */}
        <motion.rect
          x={0}
          y={13}
          width={markerX}
          height={2}
          fill="currentColor"
          opacity={0.35}
          style={{ originX: 0 }}
          initial={isAnimated ? { scaleX: 0 } : false}
          animate={{ scaleX: 1 }}
          transition={transition}
        />
        {/* 표시선: 폭 3. 0 -> 점수 위치로 이동 */}
        <motion.g
          initial={isAnimated ? { x: 0 } : false}
          animate={{ x: markerX }}
          transition={transition}
        >
          <rect
            x={-1.5}
            y={2}
            width={3}
            height={16}
            rx={1.5}
            fill="currentColor"
          />
        </motion.g>
      </g>
    </svg>
  );
}

export type FortuneReadingComponentPropsType = Readonly<{
  reading: FortuneReadingType;
  /** 방식 A 안내 한 문장. 화면에 맞는 상수를 넘긴다(FORTUNE_METHOD_A_NOTICE / _TTI_ / _STAR_SIGN_) */
  methodNotice: string;
  /** 제목. 기본 "오늘의 결과". 띠·별자리 목록의 펼친 항목은 그 이름을 넘긴다 */
  title?: string;
  /** 제목 옆 sr-only 덧말. 예: "(선택한 띠)" */
  titleSrSuffix?: string;
  /** 제목 요소. 기본 h2, 목록 안 펼친 항목은 h3. 항목 이름은 한 단계 아래를 쓴다 */
  headingLevel?: 'h2' | 'h3';
  /** 결과가 나타날 때 부모가 제목으로 포커스를 옮기는 데 쓴다(tabIndex -1) */
  titleRef?: Ref<HTMLHeadingElement>;
  /** M1 모션 재생 신호. FortuneScoreScaleComponent의 animationKey와 같다 */
  animationKey?: string | number | null;
}>;

function formatDateLine(dateKey: string): string {
  const ymd = parseDateKey(dateKey);
  if (!ymd) {
    return dateKey;
  }
  const weekday = new Date(
    Date.UTC(ymd.year, ymd.month - 1, ymd.day)
  ).getUTCDay();
  return `${ymd.year}년 ${ymd.month}월 ${ymd.day}일 ${WEEKDAY_LABELS[weekday]}`;
}

type ScoreNumberPropsType = Readonly<{
  score: number;
  numberClassName: string;
  unitClassName: string;
}>;

function ScoreNumber({
  score,
  numberClassName,
  unitClassName,
}: ScoreNumberPropsType): JSX.Element {
  return (
    <p className="text-menu-fortune tabular-nums">
      <span className={numberClassName}>{score}</span>
      <span className={unitClassName}>{READING_TEXTS.scoreUnit}</span>
    </p>
  );
}

/**
 * 오늘의 운세 결과 기록표: 기준 날짜 줄, 총운 점수·요약, 항목 4개, 조언·주의, 방식 안내, 점수 안내.
 * 값은 props로만 받고 저장·전송하지 않는다(AC-27~30). 행운 요소는 FortuneLuckyComponent가 따로 그린다.
 */
export function FortuneReadingComponent({
  reading,
  methodNotice,
  title = READING_TEXTS.defaultTitle,
  titleSrSuffix,
  headingLevel = 'h2',
  titleRef,
  animationKey = null,
}: FortuneReadingComponentPropsType): JSX.Element {
  const titleId = useId();
  const Heading = headingLevel;
  const ItemHeading = headingLevel === 'h2' ? 'h3' : 'h4';

  function renderItem(
    key: (typeof ITEM_KEYS)[number],
    scored: FortuneScoredTextType,
    index: number
  ): JSX.Element {
    return (
      <div
        key={key}
        className="border-t border-border py-5 md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-x-8"
      >
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <ItemHeading className="text-base leading-snug font-semibold break-keep text-foreground sm:text-lg">
              {CATEGORY_LABELS[key]}
            </ItemHeading>
            <ScoreNumber
              score={scored.score}
              numberClassName="text-2xl leading-none font-semibold"
              unitClassName="text-sm"
            />
          </div>
          <FortuneScoreScaleComponent
            score={scored.score}
            variant="item"
            animationKey={animationKey}
            delayIndex={index + 1}
          />
        </div>
        <p className="mt-3 max-w-[68ch] text-base leading-7 break-keep text-foreground md:mt-0">
          {scored.text}
        </p>
      </div>
    );
  }

  return (
    <section aria-labelledby={titleId}>
      <div className="mb-4 md:flex md:items-baseline md:justify-between md:gap-x-6">
        <Heading
          id={titleId}
          ref={titleRef}
          tabIndex={-1}
          className="rounded-sm text-xl leading-tight font-semibold break-keep text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:text-2xl"
        >
          {title}
          {titleSrSuffix ? (
            <span className="sr-only"> {titleSrSuffix}</span>
          ) : null}
        </Heading>
        <p className="mt-1 text-sm leading-6 font-medium text-foreground tabular-nums md:mt-0">
          {formatDateLine(reading.dateKey)} ({FORTUNE_KST_LABEL})
        </p>
      </div>

      <div className="border-t border-border py-5 md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-x-8">
        <div className="space-y-2">
          <ItemHeading className="text-base leading-snug font-semibold break-keep text-foreground sm:text-lg">
            {READING_TEXTS.total}
          </ItemHeading>
          <ScoreNumber
            score={reading.total.score}
            numberClassName="text-6xl leading-none font-bold tracking-tight sm:text-7xl"
            unitClassName="text-xl font-semibold"
          />
          <FortuneScoreScaleComponent
            score={reading.total.score}
            variant="total"
            animationKey={animationKey}
            delayIndex={0}
          />
          <div
            aria-hidden="true"
            className="flex justify-between text-xs leading-4 text-muted-foreground tabular-nums"
          >
            <span>{FORTUNE_SCORE_MIN}</span>
            <span>{FORTUNE_SCORE_MAX}</span>
          </div>
        </div>
        <div className="mt-4 max-w-[68ch] space-y-2 md:mt-0">
          <p className="text-lg leading-8 font-medium break-keep text-foreground sm:text-xl">
            {reading.summary}
          </p>
          <p className="text-base leading-7 break-keep text-foreground">
            {reading.total.text}
          </p>
        </div>
      </div>

      {ITEM_KEYS.map((key, index) => renderItem(key, reading[key], index))}

      <div className="space-y-4 border-t border-border py-5 md:grid md:grid-cols-2 md:gap-x-8 md:space-y-0">
        <div className="space-y-1">
          <ItemHeading className="text-base leading-snug font-semibold break-keep text-foreground sm:text-lg">
            {READING_TEXTS.advice}
          </ItemHeading>
          <p className="max-w-[68ch] text-base leading-7 break-keep text-foreground">
            {reading.advice}
          </p>
        </div>
        <div className="space-y-1 border-l-2 border-menu-fortune/40 pl-3">
          <ItemHeading className="text-base leading-snug font-semibold break-keep text-foreground sm:text-lg">
            {READING_TEXTS.caution}
          </ItemHeading>
          <p className="max-w-[68ch] text-base leading-7 break-keep text-foreground">
            {reading.caution}
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-5">
        <p className="text-sm leading-6 break-keep text-muted-foreground">
          {methodNotice}
        </p>
        <p className="text-sm leading-6 break-keep text-muted-foreground">
          {FORTUNE_SCORE_NOTICE}
        </p>
      </div>
    </section>
  );
}
