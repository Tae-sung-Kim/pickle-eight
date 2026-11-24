'use client';

import { MotionConfig, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { type JSX, type ReactNode, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FORTUNE_COMPATIBILITY_GRADES } from '@/features/fortune/constants/fortune-compatibility-grade.constant';
import { useRevealHeadingOnMount } from '@/features/fortune/hooks/use-reveal-heading.hook';
import type {
  FortuneCompatibilityCopyBundleType,
  FortuneCompatibilityGradeKeyType,
} from '@/features/fortune/types/fortune-compatibility.type';
import { cn } from '@/lib/utils';

// 화면 구조 문구. ui-ux-design.md "문구" 초안. 운세 상수 파일에는 아직 없어 이 파일에 둔다
const RESULT_TEXTS = {
  title: '궁합 결과',
  firstLabel: '첫 번째 사람',
  secondLabel: '두 번째 사람',
  gradeTitle: '등급',
  gradeListLabel: '궁합 등급',
  gradeCurrent: '이 결과',
  strengths: '잘 맞는 점',
  adjustments: '조율하면 좋은 점',
  swap: '다른 후보로 보기',
  reset: '다시 입력',
} as const;

// 대조 줄이 그어지는 연출(ui-ux-design.md M1, 확정). 운세 점수 눈금과 같은 감속 곡선
const LINE_MOTION_DURATION_SECONDS = 0.35;
const LINE_MOTION_EASE = [0.2, 0.7, 0.2, 1] as const;

const FOCUS_RING_CLASS =
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card';

export type FortuneCompatibilityResultPersonType = Readonly<{
  /** 띠·별자리 이름 */
  name: string;
  /** 이름 아래 보조 줄(별자리의 원소 이름). 띠 궁합은 생략 */
  detail?: string;
}>;

export type FortuneCompatibilityResultSwapType = Readonly<{
  target: 'first' | 'second';
  /** 시각 모름 안내 문장(초안, 문구 승인 대기). 부모가 만들어 넘긴다 */
  text: string;
}>;

export type FortuneCompatibilityResultEarlyYearType = Readonly<{
  /** 입춘 기준 안내 문장 */
  text: string;
  linkLabel: string;
  href: string;
}>;

export type FortuneCompatibilityResultComponentPropsType = Readonly<{
  /** 입력 순서대로 */
  first: FortuneCompatibilityResultPersonType;
  second: FortuneCompatibilityResultPersonType;
  relationName: string;
  grade: FortuneCompatibilityGradeKeyType;
  copy: FortuneCompatibilityCopyBundleType;
  /** 시각 모름 후보를 고른 사람마다 하나. 없으면 빈 배열 */
  swaps: readonly FortuneCompatibilityResultSwapType[];
  /** 띠 궁합에서 1~2월 출생이 있을 때만 */
  earlyYear?: FortuneCompatibilityResultEarlyYearType | null;
  onSwap: (target: 'first' | 'second') => void;
  onReset: () => void;
}>;

function ResultRow({
  title,
  children,
}: Readonly<{ title: string; children: ReactNode }>): JSX.Element {
  return (
    <div className="border-t border-border py-5 md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-x-8">
      <h3 className="mb-3 text-lg leading-snug font-semibold break-keep text-foreground md:mb-0">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

function PersonCell({
  label,
  person,
  columnClass,
}: Readonly<{
  label: string;
  person: FortuneCompatibilityResultPersonType;
  columnClass: string;
}>): JSX.Element {
  return (
    <div
      className={cn(
        'row-span-3 grid min-w-0 grid-rows-subgrid text-center',
        columnClass
      )}
    >
      <p className="text-sm leading-5 text-muted-foreground">{label}</p>
      <p className="text-lg leading-[1.2] font-semibold break-words break-keep text-foreground sm:text-2xl">
        {person.name}
      </p>
      <p className="text-sm leading-5 text-muted-foreground">{person.detail}</p>
    </div>
  );
}

/**
 * 궁합 결과(두 페이지 공통). 개인 결과는 동의 뒤 클라이언트에서만 그린다.
 * - 대조 줄 DOM 순서: 첫 번째 사람, 이름, 두 번째 사람, 이름, 관계 이름. 선·점은 aria-hidden.
 * - 선 연출(framer-motion scaleX 350ms)은 마운트 때 한 번만. "다른 후보로 보기"로는 다시 재생되지 않는다.
 * - 등급 세 칸은 모두 보이고 해당 칸만 체크·굵기·테두리·"이 결과"로 강조한다(색만으로 구분하지 않는다).
 * - 점수·퍼센트·하트·순위를 쓰지 않는다. 오락 고지는 결과 하단 상자(서버)에 둔다.
 */
export function FortuneCompatibilityResultComponent({
  first,
  second,
  relationName,
  grade,
  copy,
  swaps,
  earlyYear = null,
  onSwap,
  onReset,
}: FortuneCompatibilityResultComponentPropsType): JSX.Element {
  const titleId = useId();
  const swapBaseId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  // "다른 후보로 보기"를 누른 뒤에만 상태 알림을 채운다. 처음 결과는 h2 포커스가 읽기를 맡는다
  const [hasSwapped, setHasSwapped] = useState(false);

  useRevealHeadingOnMount(panelRef, titleRef, true);

  const gradeName =
    FORTUNE_COMPATIBILITY_GRADES.find((item) => item.key === grade)?.name ?? '';

  function handleSwap(target: 'first' | 'second'): void {
    setHasSwapped(true);
    onSwap(target);
  }

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={panelRef}
        aria-labelledby={titleId}
        className="scroll-mt-4 rounded-panel border border-border bg-card p-5 sm:p-8"
      >
        <h2
          id={titleId}
          ref={titleRef}
          tabIndex={-1}
          className="mb-5 rounded-sm text-xl leading-tight font-semibold break-keep text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:text-2xl"
        >
          {RESULT_TEXTS.title}
        </h2>

        <div className="mx-auto max-w-xl">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(1rem,3rem)_minmax(0,1fr)] gap-x-2 sm:gap-x-3">
            <PersonCell
              label={RESULT_TEXTS.firstLabel}
              person={first}
              columnClass="col-start-1"
            />
            {/* 장식 선. 이름 줄(둘째 행) 높이의 가운데를 지난다 */}
            <div
              aria-hidden="true"
              className="relative col-start-2 row-start-2 flex items-center"
            >
              <motion.span
                className="block h-px w-full origin-left bg-muted-foreground/45"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: LINE_MOTION_DURATION_SECONDS,
                  ease: LINE_MOTION_EASE,
                }}
              />
              <span className="absolute left-0 size-1.5 -translate-x-1/2 rounded-full bg-menu-fortune" />
              <span className="absolute right-0 size-1.5 translate-x-1/2 rounded-full bg-menu-fortune" />
            </div>
            <PersonCell
              label={RESULT_TEXTS.secondLabel}
              person={second}
              columnClass="col-start-3"
            />
          </div>
          <h3 className="mt-3 text-center text-lg leading-snug font-semibold break-keep text-menu-fortune">
            {relationName}
          </h3>
        </div>

        {swaps.length > 0 || earlyYear ? (
          <div className="mt-5 space-y-3">
            {swaps.map((swap) => {
              const noticeId = `${swapBaseId}-${swap.target}`;
              return (
                <div
                  key={swap.target}
                  className="space-y-2 border-l-2 border-menu-fortune/40 pl-3"
                >
                  <p
                    id={noticeId}
                    className="text-sm leading-6 break-keep text-foreground"
                  >
                    {swap.text}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    aria-describedby={noticeId}
                    onClick={() => handleSwap(swap.target)}
                    className={cn(
                      'h-11 scroll-mb-48 rounded-lg px-4 break-keep transition-none hover:border-menu-fortune/60',
                      FOCUS_RING_CLASS
                    )}
                  >
                    {RESULT_TEXTS.swap}
                  </Button>
                </div>
              );
            })}
            {earlyYear ? (
              <div className="space-y-1 border-l-2 border-menu-fortune/40 pl-3">
                <p className="text-sm leading-6 break-keep text-muted-foreground">
                  {earlyYear.text}
                </p>
                <Link
                  href={earlyYear.href}
                  className={cn(
                    'inline-flex min-h-11 scroll-mb-48 items-center rounded-sm text-sm font-medium break-keep text-primary underline underline-offset-4 hover:decoration-2 focus-visible:outline-none',
                    FOCUS_RING_CLASS
                  )}
                >
                  {earlyYear.linkLabel}
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5">
          <ResultRow title={RESULT_TEXTS.gradeTitle}>
            <ul
              aria-label={RESULT_TEXTS.gradeListLabel}
              className="mb-4 space-y-1"
            >
              {FORTUNE_COMPATIBILITY_GRADES.map((item) => {
                const isCurrent = item.key === grade;
                return (
                  <li
                    key={item.key}
                    className={cn(
                      'flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm leading-5 break-keep',
                      isCurrent
                        ? 'border-menu-fortune bg-menu-fortune/10 font-semibold text-foreground ring-1 ring-menu-fortune ring-inset'
                        : 'border-border bg-background font-medium text-muted-foreground'
                    )}
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      {isCurrent ? (
                        <Check size={16} aria-hidden="true" />
                      ) : null}
                    </span>
                    <span>{item.name}</span>
                    {isCurrent ? (
                      <span className="sr-only">
                        {RESULT_TEXTS.gradeCurrent}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <p className="max-w-[68ch] text-lg leading-8 font-medium break-keep text-foreground sm:text-xl">
              {copy.summary.join(' ')}
            </p>
          </ResultRow>

          <ResultRow title={RESULT_TEXTS.strengths}>
            <ul className="max-w-[68ch] list-disc space-y-1 pl-5 text-base leading-7 break-keep text-foreground">
              {copy.strengths.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </ResultRow>

          <ResultRow title={RESULT_TEXTS.adjustments}>
            <ul className="max-w-[68ch] list-disc space-y-1 border-l-2 border-menu-fortune/40 pl-7 text-base leading-7 break-keep text-foreground">
              {copy.adjustments.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </ResultRow>
        </div>

        <div className="border-t border-border pt-5 md:flex md:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className={cn(
              'h-11 w-full scroll-mb-48 rounded-lg px-6 break-keep transition-none md:w-auto',
              FOCUS_RING_CLASS
            )}
          >
            {RESULT_TEXTS.reset}
          </Button>
        </div>

        {/* 상태 알림: "다른 후보로 보기" 뒤에만 내용이 바뀐다 */}
        <p aria-live="polite" className="sr-only">
          {hasSwapped
            ? `${first.name}, ${second.name}, ${relationName}, ${gradeName}`
            : ''}
        </p>
      </section>
    </MotionConfig>
  );
}
