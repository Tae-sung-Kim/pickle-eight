'use client';

import { CalendarCheck, HardDrive } from 'lucide-react';
import { type JSX, useEffect, useRef, useState } from 'react';

import {
  TAROT_DAILY_RESTORED_NOTICE,
  TAROT_DAILY_STORAGE_FAILED_NOTICE,
  TAROT_DRAW_BUTTON_LABEL,
  TAROT_ORIENTATION_LABELS,
  TAROT_QUESTION_LINE_PREFIX,
} from '@/features/tarot/constants/tarot-notice.constant';
import { TAROT_QUESTION_PLACEHOLDER_DAILY } from '@/features/tarot/constants/tarot-question.constant';
import { useDailyReading } from '@/features/tarot/daily/hooks/use-daily-reading.hook';
import { useTarotQuestion } from '@/features/tarot/hooks/use-tarot-question.hook';
import { TarotCardReadingComponent } from '@/features/tarot/shared/components/card-reading.component';
import { TarotCrisisNoticeComponent } from '@/features/tarot/shared/components/crisis-notice.component';
import { TarotExpertNoticeComponent } from '@/features/tarot/shared/components/expert-notice.component';
import { TarotQuestionInputComponent } from '@/features/tarot/shared/components/question-input.component';
import { TarotReversedToggleComponent } from '@/features/tarot/shared/components/reversed-toggle.component';
import { TarotCardComponent } from '@/features/tarot/shared/components/tarot-card.component';
import {
  hasTarotCrisisSignal,
  hasTarotExpertTopic,
} from '@/features/tarot/utils/tarot-safety.util';

const MD_MEDIA_QUERY = '(min-width: 768px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const SKELETON_CLASS =
  'animate-pulse rounded-lg bg-muted motion-reduce:animate-none';

/**
 * 공개 시작 시 무대 패널이 화면에 절반 이상 보이지 않으면(모바일만) 패널 위로 스크롤한다.
 * 동작 줄이기이면 즉시 이동한다.
 */
function scrollPanelIntoViewIfNeeded(panel: HTMLElement): void {
  if (window.matchMedia(MD_MEDIA_QUERY).matches) return;
  const rect = panel.getBoundingClientRect();
  const visibleHeight =
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  if (visibleHeight >= rect.height / 2) return;
  const isReduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  panel.scrollIntoView({
    block: 'start',
    behavior: isReduced ? 'auto' : 'smooth',
  });
}

/**
 * TarotDailyComponent (오늘의 타로 root)
 * - 무대 패널. md 이상 2열(왼쪽 카드 무대, 오른쪽 옵션 또는 결과).
 * - 질문은 카드 선택에 영향을 주지 않고 저장·전송하지 않는다. 폼 제출도 하지 않는다.
 * - 위기·전문가 표현 감지는 렌더링 중 계산값이다(상태에 저장하지 않는다).
 */
export function TarotDailyComponent(): JSX.Element {
  const { state, card, announcement, draw, continueReveal, completeFlip } =
    useDailyReading();
  const { question, setQuestion, trimmedQuestion, hasQuestion } =
    useTarotQuestion();
  const [isReversedEnabled, setIsReversedEnabled] = useState<boolean>(true);

  const panelRef = useRef<HTMLDivElement>(null);
  const resultTitleRef = useRef<HTMLHeadingElement>(null);
  const crisisTitleRef = useRef<HTMLHeadingElement>(null);

  const isRevealed = state.status === 'revealed';
  const isFlipping = state.status === 'revealed' && state.isFlipping;
  const isReversed =
    state.status === 'revealed' || state.status === 'crisis'
      ? state.drawn.isReversed
      : false;

  // 사용자 행동으로 생긴 전이(위기, 방금 뽑음)에서만 포커스를 옮긴다. 재방문 복원은 옮기지 않는다
  let focusTarget: 'crisis' | 'result' | null = null;
  if (state.status === 'crisis') focusTarget = 'crisis';
  else if (state.status === 'revealed' && state.source === 'drawn') {
    focusTarget = 'result';
  }

  useEffect(() => {
    if (focusTarget === 'crisis') {
      crisisTitleRef.current?.focus();
    } else if (focusTarget === 'result') {
      if (panelRef.current) scrollPanelIntoViewIfNeeded(panelRef.current);
      resultTitleRef.current?.focus({ preventScroll: true });
    }
  }, [focusTarget]);

  function handleDraw(): void {
    // 위기 표현 감지는 이 클릭에서 계산해 다음 상태를 고르는 데만 쓴다
    draw({ isReversedEnabled, hasCrisis: hasTarotCrisisSignal(question) });
  }

  // 렌더링 중 계산값(상태 아님)
  const showExpertNotice = isRevealed && hasTarotExpertTopic(question);
  const showQuestionLine =
    state.status === 'revealed' && state.source === 'drawn' && hasQuestion;

  return (
    <div
      ref={panelRef}
      className="scroll-mt-20 rounded-panel border border-border bg-card p-5 sm:p-8"
    >
      {/* 공개 시에만 채운다. 질문 텍스트는 넣지 않는다 */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div className="space-y-6 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start md:gap-8 md:space-y-0">
        {/* 카드 무대: 카드 이미지는 여기에만 그린다 */}
        <div
          aria-busy={isFlipping}
          className="flex flex-col items-center gap-3 rounded-panel bg-muted/60 p-6"
        >
          <TarotCardComponent
            card={isRevealed ? card : undefined}
            isReversed={isReversed}
            isFaceUp={isRevealed}
            isFlipping={isFlipping}
            onFlipComplete={completeFlip}
            className="w-40 sm:w-50 md:w-60"
          />
          {/* 카드 밖 글자. 높이를 미리 잡아 공개 때 레이아웃이 움직이지 않게 한다 */}
          <p
            aria-hidden="true"
            className="h-5 text-sm leading-5 font-semibold text-menu-tarot"
          >
            {isRevealed && isReversed
              ? TAROT_ORIENTATION_LABELS.reversed
              : null}
          </p>
        </div>

        <div className="min-w-0 space-y-5">
          {state.status === 'checking' ? (
            <div aria-hidden="true" className="space-y-5">
              <div className={`h-14 ${SKELETON_CLASS}`} />
              <div className={`h-24 ${SKELETON_CLASS}`} />
              <div className={`h-11 ${SKELETON_CLASS}`} />
            </div>
          ) : null}

          {state.status === 'idle' ? (
            <>
              <TarotReversedToggleComponent
                checked={isReversedEnabled}
                onCheckedChange={setIsReversedEnabled}
              />
              <TarotQuestionInputComponent
                value={question}
                onValueChange={setQuestion}
                onEnter={handleDraw}
                placeholder={TAROT_QUESTION_PLACEHOLDER_DAILY}
              />
              <button
                type="button"
                onClick={handleDraw}
                disabled={isFlipping}
                aria-busy={isFlipping}
                className="inline-flex h-11 w-full min-w-40 cursor-pointer items-center justify-center rounded-lg bg-menu-tarot px-6 font-semibold break-keep text-primary-foreground hover:bg-menu-tarot/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                {TAROT_DRAW_BUTTON_LABEL}
              </button>
            </>
          ) : null}

          {state.status === 'crisis' ? (
            <TarotCrisisNoticeComponent
              onContinue={continueReveal}
              titleRef={crisisTitleRef}
            />
          ) : null}

          {state.status === 'revealed' && card ? (
            <>
              {state.source === 'restored' ? (
                <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                  <CalendarCheck
                    size={16}
                    aria-hidden="true"
                    className="mt-1 shrink-0"
                  />
                  <span>{TAROT_DAILY_RESTORED_NOTICE}</span>
                </p>
              ) : null}

              {showQuestionLine ? (
                <p className="text-sm leading-6 break-words text-muted-foreground">
                  {TAROT_QUESTION_LINE_PREFIX} {trimmedQuestion}
                </p>
              ) : null}

              <TarotCardReadingComponent
                card={card}
                isReversed={state.drawn.isReversed}
                titleAs="h2"
                titleRef={resultTitleRef}
              />

              {showExpertNotice ? <TarotExpertNoticeComponent /> : null}

              {state.isSaveFailed ? (
                <p className="flex items-start gap-2 rounded-lg border border-border bg-card p-4 text-sm leading-6 text-foreground">
                  <HardDrive
                    size={16}
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-muted-foreground"
                  />
                  <span>{TAROT_DAILY_STORAGE_FAILED_NOTICE}</span>
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
