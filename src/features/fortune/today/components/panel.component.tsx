'use client';

import Link from 'next/link';
import { type JSX, useEffect, useId, useMemo, useRef, useState } from 'react';
import { FORTUNE_METHOD_A_NOTICE } from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';
import { FORTUNE_COMMON_POOL } from '@/features/fortune/constants/pools/common.constant';
import { FORTUNE_PERSONAL_POOL } from '@/features/fortune/constants/pools/personal.constant';
import { useBirthFlow } from '@/features/fortune/hooks/use-birth-flow.hook';
import { useKoreaDateKey } from '@/features/fortune/hooks/use-korea-date-key.hook';
import { FortuneAgeBlockedComponent } from '@/features/fortune/shared/components/age-blocked.component';
import { FortuneBirthFormComponent } from '@/features/fortune/shared/components/birth-form.component';
import { FortuneLuckyComponent } from '@/features/fortune/shared/components/lucky.component';
import { FortuneLunarConfirmComponent } from '@/features/fortune/shared/components/lunar-confirm.component';
import { FortuneReadingComponent } from '@/features/fortune/shared/components/reading.component';
import type {
  FortuneBirthInputType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import { parseDateKey } from '@/features/fortune/utils/fortune-date.util';
import {
  getLunarLeapMonth,
  getLunarMonthLength,
} from '@/features/fortune/utils/fortune-lunar.util';
import { buildFortuneReading } from '@/features/fortune/utils/fortune-reading.util';

// 화면 문구. ui-ux-design.md "문구"(패널 제목, 주요 버튼, 다른 운세 링크 묶음, 결과 공지(sr)).
// 운세 상수 파일에는 아직 없어 이 파일에 둔다
const TODAY_PANEL_TEXTS = {
  formTitle: '생년월일 입력',
  submitLabel: '운세 보기',
  otherBasisTitle: '다른 기준의 운세',
  ttiLinkLabel: '띠별 운세',
  starSignLinkLabel: '별자리 운세',
  announcementSuffix: '오늘의 결과를 표시했습니다.',
} as const;

const PANEL_CLASS =
  'scroll-mt-20 rounded-panel border border-border bg-card p-5 sm:p-8';
const TITLE_CLASS =
  'rounded-sm text-xl leading-tight font-semibold break-keep text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:text-2xl';
const LINK_CLASS =
  'inline-flex min-h-11 items-center rounded-sm text-base font-medium break-keep text-primary underline underline-offset-4 hover:decoration-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const OTHER_BASIS_LINKS: ReadonlyArray<
  Readonly<{ href: string; label: string }>
> = [
  { href: FORTUNE_ROUTES.tti, label: TODAY_PANEL_TEXTS.ttiLinkLabel },
  {
    href: FORTUNE_ROUTES.starSign,
    label: TODAY_PANEL_TEXTS.starSignLinkLabel,
  },
];

/**
 * 마지막으로 "운세 보기"를 누른 기록. 메모리(state)에만 둔다(저장·URL 금지, AC-28, AC-30).
 * - count: 결과를 새로 공개하는 신호(점수 눈금 모션, 포커스, 공지)
 * - dateKey: 누른 시점의 KST 오늘. 공지 문구가 자정 갱신으로 다시 읽히지 않게 따로 둔다
 * - lunar: 음력으로 입력했을 때만 확인 줄에 쓴다
 */
type SubmittedType = Readonly<{
  count: number;
  dateKey: string;
  lunar: FortuneBirthInputType | null;
}>;

function toDateKey(ymd: FortuneYmdType): string {
  const month = String(ymd.month).padStart(2, '0');
  const day = String(ymd.day).padStart(2, '0');
  return `${ymd.year}-${month}-${day}`;
}

function buildAnnouncement(dateKey: string): string {
  const ymd = parseDateKey(dateKey);
  if (!ymd) {
    return '';
  }
  return `${ymd.year}년 ${ymd.month}월 ${ymd.day}일 ${TODAY_PANEL_TEXTS.announcementSuffix}`;
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

export type FortuneTodayPanelComponentPropsType = Readonly<{
  /** 동의 화면에서 막 동의한 경우에만 true. 첫 h2("생년월일 입력")로 포커스를 옮긴다 */
  shouldFocusTitle?: boolean;
}>;

/**
 * 오늘의 운세 panel. 동의(granted) 뒤에만 root가 next/dynamic으로 불러온다.
 * 문구 풀과 달력 표는 이 파일에서만 import한다(동의 전에 내려받지 않는다).
 * - 흐름: 생년월일 폼 → 연령 확인(만 14세 미만이면 연령 안내만) → 결과. 오늘의 운세는 판정 없이 바로 done이다.
 * - 입력값과 결과는 메모리(state)에만 둔다. 새로고침하면 빈 입력이다(AC-30).
 * - 결과는 렌더링 중 계산한다: 양력 생년월일 + KST 오늘 날짜가 시드이고, 자정이 지나면 새 날짜로 바뀐다(AC-3).
 *   절기 표는 쓰지 않아 기기 시계가 2029년 이후여도 정상이다(AC-84).
 */
export function FortuneTodayPanelComponent({
  shouldFocusTitle = false,
}: FortuneTodayPanelComponentPropsType): JSX.Element {
  const todayKey = useKoreaDateKey();
  const today = useMemo(
    () => (todayKey ? parseDateKey(todayKey) : null),
    [todayKey]
  );
  const { state, submit, reset } = useBirthFlow<string>();
  const [submitted, setSubmitted] = useState<SubmittedType | null>(null);

  const formTitleId = useId();
  const otherBasisId = useId();
  const resultRef = useRef<HTMLDivElement>(null);
  const resultTitleRef = useRef<HTMLHeadingElement>(null);
  const ageTitleRef = useRef<HTMLHeadingElement>(null);
  const formTitleRef = useRef<HTMLHeadingElement>(null);

  // 동의 직후 한 번만 첫 h2로 포커스를 옮긴다(이미 동의한 탭의 첫 로드에서는 옮기지 않는다)
  useEffect(() => {
    if (shouldFocusTitle) {
      formTitleRef.current?.focus();
    }
  }, [shouldFocusTitle]);

  const step = state.step;
  const solar = state.step === 'done' ? state.solar : null;
  const isFromLunar = state.step === 'done' && state.isFromLunar;

  const reading = useMemo(() => {
    if (!solar || !todayKey) {
      return null;
    }
    return buildFortuneReading({
      seedText: `fortune-v1|personal|${toDateKey(solar)}|${todayKey}`,
      dateKey: todayKey,
      pool: FORTUNE_PERSONAL_POOL,
      common: FORTUNE_COMMON_POOL,
    });
  }, [solar, todayKey]);

  // 사용자가 "운세 보기"를 눌러 새 결과(또는 연령 안내)가 나왔을 때만 제목으로 포커스를 옮긴다
  useEffect(() => {
    if (!submitted) {
      return;
    }
    if (step === 'done') {
      scrollResultIntoViewIfNeeded(resultRef.current, resultTitleRef.current);
      resultTitleRef.current?.focus({ preventScroll: true });
    } else if (step === 'age-blocked') {
      ageTitleRef.current?.focus();
    }
  }, [submitted, step]);

  function handleSubmit(input: FortuneBirthInputType): void {
    // 마운트 전(오늘 날짜 없음)에는 제출하지 않는다
    if (!today || !todayKey) {
      return;
    }
    // 결과가 나온 뒤에도 폼이 남아 다른 날짜로 이어서 볼 수 있다. 흐름은 input 단계에서만 제출을 받는다
    if (step !== 'input') {
      reset();
    }
    submit(input, today);
    setSubmitted((previous) => ({
      count: (previous?.count ?? 0) + 1,
      dateKey: todayKey,
      lunar: input.calendar === 'lunar' ? input : null,
    }));
  }

  // 폼 형식 검사에서 걸리면 오류 안내만 남기고 이전 결과를 지운다(AC-1)
  function handleInvalid(): void {
    if (step !== 'input') {
      reset();
    }
    setSubmitted(null);
  }

  if (step === 'age-blocked') {
    return (
      <div className={PANEL_CLASS}>
        <FortuneAgeBlockedComponent titleRef={ageTitleRef} />
      </div>
    );
  }

  const announcement =
    step === 'done' && submitted ? buildAnnouncement(submitted.dateKey) : '';

  return (
    <div className={PANEL_CLASS}>
      {/* 결과 공지: 입력값은 넣지 않고 날짜만 읽는다. 영역은 항상 두고 내용만 바꾼다 */}
      <div aria-live="polite" className="sr-only">
        {announcement ? <p key={submitted?.count}>{announcement}</p> : null}
      </div>

      <section aria-labelledby={formTitleId}>
        <h2
          id={formTitleId}
          ref={formTitleRef}
          tabIndex={-1}
          className={`${TITLE_CLASS} mb-4`}
        >
          {TODAY_PANEL_TEXTS.formTitle}
        </h2>
        <FortuneBirthFormComponent
          todayKey={todayKey}
          error={step === 'input' ? state.error : null}
          submitLabel={TODAY_PANEL_TEXTS.submitLabel}
          getLunarLeapMonth={getLunarLeapMonth}
          getLunarMonthLength={getLunarMonthLength}
          onSubmit={handleSubmit}
          onInvalid={handleInvalid}
        />
      </section>

      {solar && reading ? (
        <div
          ref={resultRef}
          className="mt-8 scroll-mt-20 space-y-6 border-t border-border pt-8"
        >
          {isFromLunar && submitted?.lunar ? (
            <FortuneLunarConfirmComponent
              lunar={submitted.lunar}
              solar={solar}
            />
          ) : null}
          <FortuneReadingComponent
            reading={reading}
            methodNotice={FORTUNE_METHOD_A_NOTICE}
            titleRef={resultTitleRef}
            animationKey={submitted?.count ?? null}
          />
          <FortuneLuckyComponent lucky={reading.lucky} />
          <div className="md:flex md:flex-wrap md:items-center md:gap-x-6">
            <p
              id={otherBasisId}
              className="text-sm font-medium text-foreground"
            >
              {TODAY_PANEL_TEXTS.otherBasisTitle}
            </p>
            <ul
              aria-labelledby={otherBasisId}
              className="flex flex-wrap gap-x-6"
            >
              {OTHER_BASIS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={LINK_CLASS}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
