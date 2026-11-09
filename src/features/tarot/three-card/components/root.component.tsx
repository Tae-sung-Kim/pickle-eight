'use client';

import { type JSX, useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  TAROT_ANNOUNCE_TEMPLATES,
  TAROT_DRAW_THREE_BUTTON_LABEL,
  TAROT_ORIENTATION_LABELS,
  TAROT_REDRAW_BUTTON_LABEL,
  TAROT_REDRAW_NOTICE,
  TAROT_REDRAW_RESULT_NOTICE,
} from '@/features/tarot/constants/tarot-notice.constant';
import { TAROT_QUESTION_PLACEHOLDER_THREE_CARD } from '@/features/tarot/constants/tarot-question.constant';
import { TAROT_SPREAD_POSITIONS } from '@/features/tarot/constants/tarot-spread.constant';
import {
  TAROT_TOPIC_DEFAULT,
  TAROT_TOPIC_LINE_PREFIX,
  TAROT_TOPICS,
} from '@/features/tarot/constants/tarot-topic.constant';
import { useTarotQuestion } from '@/features/tarot/hooks/use-tarot-question.hook';
import { TarotCrisisNoticeComponent } from '@/features/tarot/shared/components/crisis-notice.component';
import { TarotExpertNoticeComponent } from '@/features/tarot/shared/components/expert-notice.component';
import { TarotQuestionInputComponent } from '@/features/tarot/shared/components/question-input.component';
import { TarotReversedToggleComponent } from '@/features/tarot/shared/components/reversed-toggle.component';
import { TarotCardComponent } from '@/features/tarot/shared/components/tarot-card.component';
import { TarotTopicChipsComponent } from '@/features/tarot/shared/components/topic-chips.component';
import { TarotThreeCardSpreadResultComponent } from '@/features/tarot/three-card/components/spread-result.component';
import { TarotThreeCardStoryComponent } from '@/features/tarot/three-card/components/story.component';
import { useThreeCardReading } from '@/features/tarot/three-card/hooks/use-three-card-reading.hook';
import type {
  TarotCardType,
  TarotTopicSelectionType,
} from '@/features/tarot/types/tarot.type';
import {
  formatTarotCardName,
  getTarotCardById,
} from '@/features/tarot/utils/tarot-card.util';
import { hasTarotExpertTopic } from '@/features/tarot/utils/tarot-safety.util';
import { buildTarotThreeCardStory } from '@/features/tarot/utils/tarot-story.util';
import { getTarotTopicReading } from '@/features/tarot/utils/tarot-topic.util';

const FLIP_DURATION_MS = 500;
const FLIP_STAGGER_MS = 120;
const MOBILE_QUERY = '(max-width: 767px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const PRIMARY_BUTTON_CLASS =
  'h-11 w-full rounded-lg bg-menu-tarot px-6 font-semibold break-keep text-primary-foreground hover:bg-menu-tarot/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 md:w-auto md:min-w-40';

type RevealedCardType = Readonly<{
  card: TarotCardType;
  isReversed: boolean;
}>;

function getOrientationLabel(isReversed: boolean): string {
  return isReversed
    ? TAROT_ORIENTATION_LABELS.reversed
    : TAROT_ORIENTATION_LABELS.upright;
}

/** 공개 시 한 번 읽는 aria-live 문구. 질문은 넣지 않는다 */
function buildAnnouncement(
  revealed: readonly (RevealedCardType | undefined)[]
): string {
  const [past, present, future] = revealed.map((item) =>
    item
      ? `${formatTarotCardName(item.card)} ${getOrientationLabel(item.isReversed)}`
      : ''
  );
  return TAROT_ANNOUNCE_TEMPLATES.threeCard
    .replace('{past}', past ?? '')
    .replace('{present}', present ?? '')
    .replace('{future}', future ?? '');
}

/** 모바일에서 카드 무대가 절반 넘게 화면 밖이면 무대를 화면 위로 가져온다 */
function scrollStageIntoViewIfNeeded(stage: HTMLElement | null): void {
  if (!stage || !window.matchMedia(MOBILE_QUERY).matches) return;
  const rect = stage.getBoundingClientRect();
  const visibleHeight =
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  if (visibleHeight >= rect.height / 2) return;
  const isReduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  stage.scrollIntoView({
    block: 'start',
    behavior: isReduced ? 'auto' : 'smooth',
  });
}

/**
 * TarotThreeCardComponent (3장 타로 root)
 * - 질문, 역방향 옵션, 분야 칩 선택은 이 컴포넌트의 state에만 있다. 결과는 어디에도 저장하지 않는다.
 * - 위기·전문가 표현 감지는 저장하지 않는 계산값이다.
 */
export function TarotThreeCardComponent(): JSX.Element {
  const { state, isFlipping, draw, continueReading, finishFlip, reset } =
    useThreeCardReading();
  const { question, setQuestion } = useTarotQuestion();
  const [isReversedEnabled, setIsReversedEnabled] = useState<boolean>(true);
  // 분야는 메모리에만 둔다. 다시 뽑기(RESET) 뒤에도 질문과 같이 남는다
  const [topic, setTopic] =
    useState<TarotTopicSelectionType>(TAROT_TOPIC_DEFAULT);

  const redrawNoticeId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const crisisTitleRef = useRef<HTMLHeadingElement>(null);
  const resultTitleRef = useRef<HTMLHeadingElement>(null);
  const drawButtonRef = useRef<HTMLButtonElement>(null);
  const prevStatusRef = useRef<typeof state.status>('idle');

  const isRevealed = state.status === 'revealed';

  // 상태 전이 뒤 포커스 이동: crisis → 위기 패널 제목, revealed → 결과 제목, idle 복귀 → "세 장 뽑기"
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = state.status;
    if (prevStatus === state.status) return;

    if (state.status === 'crisis') {
      crisisTitleRef.current?.focus();
    } else if (state.status === 'revealed') {
      resultTitleRef.current?.focus({ preventScroll: true });
      scrollStageIntoViewIfNeeded(stageRef.current);
    } else {
      drawButtonRef.current?.focus();
    }
  }, [state.status]);

  // 뽑힌 카드 3장을 위치 순서대로 풀어 둔다 (crisis에서는 카드를 그리지 않는다)
  const revealedCards: readonly (RevealedCardType | undefined)[] = isRevealed
    ? state.drawn.map((drawn) => {
        const card = getTarotCardById(drawn.cardId);
        return card ? { card, isReversed: drawn.isReversed } : undefined;
      })
    : [];

  const spreadEntries = TAROT_SPREAD_POSITIONS.flatMap((position, index) => {
    const item = revealedCards[index];
    return item
      ? [
          {
            position,
            card: item.card,
            isReversed: item.isReversed,
            topicSentence: getTarotTopicReading(
              item.card,
              item.isReversed,
              topic
            ),
          },
        ]
      : [];
  });

  // 렌더링 중 계산값. null이면 이야기 블록을 그리지 않는다
  const story =
    spreadEntries.length === TAROT_SPREAD_POSITIONS.length
      ? buildTarotThreeCardStory(
          spreadEntries.map((entry) => ({
            positionKey: entry.position.key,
            card: entry.card,
            isReversed: entry.isReversed,
          })),
          topic
        )
      : null;
  const topicLabel = TAROT_TOPICS.find((item) => item.key === topic)?.label;

  const announcement = isRevealed ? buildAnnouncement(revealedCards) : '';
  const showExpertNotice = isRevealed && hasTarotExpertTopic(question);

  function handleDraw(): void {
    if (state.status !== 'idle') return;
    draw(isReversedEnabled, question);
  }

  return (
    <div className="rounded-panel border border-border bg-card p-5 sm:p-8">
      {/* 공개 시 한 번 읽는 공지 (revealed일 때만 채움, 질문은 넣지 않음) */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div
        ref={stageRef}
        aria-busy={isFlipping}
        className="rounded-panel bg-muted/60 p-6"
      >
        <div className="grid grid-cols-3 justify-items-center gap-3 md:gap-6">
          {TAROT_SPREAD_POSITIONS.map((position, index) => {
            const item = revealedCards[index];
            return (
              <div
                key={position.key}
                className="flex w-full max-w-[104px] flex-col items-center gap-2 sm:max-w-[140px] md:max-w-[180px]"
              >
                {/* 위치 이름: idle부터 보이는 글자(제목 요소 아님). 결과에서는 읽기 블록의 h3가 맡는다 */}
                <span
                  aria-hidden={isRevealed ? true : undefined}
                  className="text-sm font-semibold break-keep text-foreground sm:text-base"
                >
                  {position.label}
                </span>
                <TarotCardComponent
                  card={item?.card}
                  isReversed={item?.isReversed ?? false}
                  isFaceUp={isRevealed && item !== undefined}
                  isFlipping={isFlipping}
                  flipDelayMs={index * FLIP_STAGGER_MS}
                  flipDurationMs={FLIP_DURATION_MS}
                  // 세 장 중 마지막(가장 늦게 끝나는) 카드가 끝나면 한 번만 알린다
                  onFlipComplete={
                    index === TAROT_SPREAD_POSITIONS.length - 1
                      ? finishFlip
                      : undefined
                  }
                  className="w-full"
                />
                {item?.isReversed ? (
                  <span className="text-xs font-semibold text-menu-tarot sm:text-sm">
                    {TAROT_ORIENTATION_LABELS.reversed}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {state.status === 'idle' ? (
        <div className="mx-auto mt-6 max-w-xl space-y-5">
          <TarotReversedToggleComponent
            checked={isReversedEnabled}
            onCheckedChange={setIsReversedEnabled}
          />
          <TarotTopicChipsComponent selectedKey={topic} onSelect={setTopic} />
          <TarotQuestionInputComponent
            value={question}
            onValueChange={setQuestion}
            onEnter={handleDraw}
            placeholder={TAROT_QUESTION_PLACEHOLDER_THREE_CARD}
          />
          <div className="space-y-2">
            <Button
              ref={drawButtonRef}
              type="button"
              onClick={handleDraw}
              disabled={isFlipping}
              aria-busy={isFlipping || undefined}
              className={PRIMARY_BUTTON_CLASS}
            >
              {TAROT_DRAW_THREE_BUTTON_LABEL}
            </Button>
            <p className="max-w-[68ch] text-xs leading-5 text-muted-foreground">
              {TAROT_REDRAW_NOTICE}
            </p>
          </div>
        </div>
      ) : null}

      {state.status === 'crisis' ? (
        <div className="mt-6">
          <TarotCrisisNoticeComponent
            titleRef={crisisTitleRef}
            onContinue={continueReading}
          />
        </div>
      ) : null}

      {isRevealed ? (
        <div className="mt-6 space-y-6">
          {topic !== 'all' && topicLabel ? (
            <p className="text-sm leading-6 text-muted-foreground md:px-6">
              {TAROT_TOPIC_LINE_PREFIX} {topicLabel}
            </p>
          ) : null}
          <TarotThreeCardSpreadResultComponent
            entries={spreadEntries}
            titleRef={resultTitleRef}
          />
          {story ? <TarotThreeCardStoryComponent story={story} /> : null}
          {showExpertNotice ? <TarotExpertNoticeComponent /> : null}
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
            <Button
              type="button"
              variant="outline"
              aria-describedby={redrawNoticeId}
              onClick={reset}
              disabled={isFlipping}
              aria-busy={isFlipping || undefined}
              className="h-11 w-full rounded-lg px-6 font-semibold break-keep disabled:opacity-60 md:w-auto md:min-w-40"
            >
              {TAROT_REDRAW_BUTTON_LABEL}
            </Button>
            <p
              id={redrawNoticeId}
              className="max-w-[68ch] text-sm leading-6 text-muted-foreground md:pt-2.5"
            >
              {TAROT_REDRAW_RESULT_NOTICE}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
