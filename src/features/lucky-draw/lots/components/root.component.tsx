'use client';

import { MotionConfig } from 'framer-motion';
import { CircleAlert } from 'lucide-react';
import { type JSX, useEffect, useMemo, useRef, useState } from 'react';

import { ShareCardHostComponent } from '@/components/share/share-card-host.component';
import { SharePanelComponent } from '@/components/share/share-panel.component';
import { cn } from '@/lib/utils';
import { LUCKY_DRAW_LOTS_RULE } from '../../constants/lucky-draw-limit.constant';
import { LUCKY_DRAW_ACCENT_BG_CLASS } from '../../constants/lucky-draw-theme.constant';
import { LuckyDrawLinesInputComponent } from '../../shared/components/lines-input.component';
import { LuckyDrawStatusComponent } from '../../shared/components/status.component';
import { LuckyDrawToolNavComponent } from '../../shared/components/tool-nav.component';
import type { LuckyDrawLotsDeckType } from '../../types/lucky-draw.type';
import { parseLuckyDrawLines } from '../../utils/lucky-draw-input.util';
import {
  createLuckyDrawLotsDeck,
  getLuckyDrawLotsUnopenedPositions,
} from '../../utils/lucky-draw-lots.util';
import { isLuckyDrawRandomAvailable } from '../../utils/lucky-draw-random.util';
import { useLuckyDrawLots } from '../hooks/use-lucky-draw-lots.hook';
import { useLuckyDrawLotsShare } from '../hooks/use-lucky-draw-lots-share.hook';
import { LuckyDrawLotsCardGridComponent } from './card-grid.component';
import { LuckyDrawLotsShareCardComponent } from './share-card.component';

const PLACEHOLDER = 'A\nB\nC';
const REASON_ID = 'lucky-draw-lots-reason';
const REST_REASON_ID = 'lucky-draw-lots-rest-reason';

/**
 * LuckyDrawLotsComponent
 * - 제비뽑기 도구 root. 입력, 섞기, 카드 한 장씩 열기.
 * - 위치 → 항목 대응은 deckRef 클로저 안에만 있다. 상태, props, DOM에는 열린 카드의 항목만 있다.
 */
export function LuckyDrawLotsComponent(): JSX.Element {
  const [state, dispatch] = useLuckyDrawLots();
  const [isRandomAvailable, setIsRandomAvailable] = useState(true);
  /** 마지막 섞기 직전에 카드가 이미 있었는지. 안내 문구용 */
  const [isReshuffle, setIsReshuffle] = useState(false);
  const deckRef = useRef<{ runId: number; deck: LuckyDrawLotsDeckType } | null>(
    null
  );

  useEffect(() => {
    setIsRandomAvailable(isLuckyDrawRandomAvailable());
  }, []);

  const parsed = parseLuckyDrawLines(state.text, LUCKY_DRAW_LOTS_RULE, 'i');
  const entries = parsed.entries;
  const { cardCount, openedCards, lastEvent, runId } = state;

  let blockReason: string | null = null;
  if (entries.length < LUCKY_DRAW_LOTS_RULE.minCount) {
    blockReason = '두 개 이상 입력하세요.';
  } else if (!isRandomAvailable) {
    blockReason = '이 브라우저에서는 도구를 쓸 수 없어요.';
  }
  const isDisabled = blockReason !== null;

  const errorParts: string[] = [];
  if (parsed.overflowCount > 0) {
    errorParts.push(
      `최대 ${LUCKY_DRAW_LOTS_RULE.maxCount}개까지 입력할 수 있어요. 앞의 ${LUCKY_DRAW_LOTS_RULE.maxCount}개만 사용해요.`
    );
  }
  if (parsed.tooLongCount > 0) {
    errorParts.push(
      `한 줄은 ${LUCKY_DRAW_LOTS_RULE.maxLength}자까지 쓸 수 있어요. 긴 줄 ${parsed.tooLongCount}개는 사용하지 않아요.`
    );
  }
  const errorText = errorParts.length > 0 ? errorParts.join(' ') : null;

  const openedLabels = useMemo(
    () => new Map(openedCards.map((card) => [card.position, card.label])),
    [openedCards]
  );
  const share = useLuckyDrawLotsShare(openedCards);
  const openedCount = openedCards.length;
  const remainingCount = cardCount === null ? 0 : cardCount - openedCount;
  const isAllOpened = cardCount !== null && remainingCount === 0;

  let statusMessage = '';
  if (cardCount !== null && lastEvent === 'shuffle') {
    statusMessage = isReshuffle
      ? `카드 ${cardCount}장을 새로 섞었어요. 열린 카드는 모두 닫혔어요.`
      : `카드 ${cardCount}장을 섞어 놓았어요. 카드를 눌러 한 장씩 열어 보세요.`;
  } else if (lastEvent === 'open') {
    const last = openedCards[openedCards.length - 1];
    if (last) {
      statusMessage = `${last.position + 1}번째 카드: ${last.label}`;
    }
  } else if (lastEvent === 'open-rest') {
    statusMessage =
      '남은 카드를 모두 열었어요. 열린 카드에서 항목을 읽을 수 있어요.';
  }

  const handleShuffle = (): void => {
    if (isDisabled) return;
    try {
      const nextRunId = runId + 1;
      const deck = createLuckyDrawLotsDeck(entries);
      deckRef.current = { runId: nextRunId, deck };
      setIsReshuffle(cardCount !== null);
      dispatch({ type: 'SHUFFLE', runId: nextRunId, cardCount: deck.size });
    } catch {
      setIsRandomAvailable(false);
    }
  };

  const handleOpen = (position: number): void => {
    const current = deckRef.current;
    if (!current || current.runId !== runId) return;
    if (openedLabels.has(position)) return;
    dispatch({ type: 'OPEN', runId, card: current.deck.open(position) });
  };

  const handleOpenRest = (): void => {
    const current = deckRef.current;
    if (!current || current.runId !== runId || cardCount === null) return;
    const positions = getLuckyDrawLotsUnopenedPositions(cardCount, openedCards);
    if (positions.length === 0) return;
    dispatch({
      type: 'OPEN_REST',
      runId,
      cards: positions.map((position) => current.deck.open(position)),
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        <LuckyDrawToolNavComponent current="lots" isLocked={false} />
        <LuckyDrawStatusComponent message={statusMessage} />

        {isRandomAvailable ? null : (
          <p className="flex items-start gap-2 text-sm leading-6 text-destructive">
            <CircleAlert className="mt-1 size-4 shrink-0" aria-hidden="true" />
            <span>
              이 브라우저에서는 도구를 쓸 수 없어요. 다른 브라우저로 열어
              보세요.
            </span>
          </p>
        )}

        <div className="space-y-6 rounded-panel border border-border bg-card p-4 sm:p-6">
          <LuckyDrawLinesInputComponent
            id="lucky-draw-lots-text"
            label="항목"
            value={state.text}
            onChange={(text) => {
              deckRef.current = null;
              dispatch({ type: 'SET_TEXT', text });
            }}
            placeholder={PLACEHOLDER}
            countText={`${entries.length} / ${LUCKY_DRAW_LOTS_RULE.maxCount}개`}
            errorText={errorText}
          />
          <div className="space-y-2">
            <button
              type="button"
              aria-disabled={isDisabled ? 'true' : undefined}
              aria-describedby={blockReason ? REASON_ID : undefined}
              onClick={handleShuffle}
              className={cn(
                'h-12 w-full rounded-lg text-base font-semibold text-primary-foreground transition-colors duration-150 hover:bg-menu-lucky/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none',
                LUCKY_DRAW_ACCENT_BG_CLASS,
                isDisabled && 'cursor-not-allowed opacity-60'
              )}
            >
              {cardCount === null ? '섞기' : '다시 섞기'}
            </button>
            <p
              id={REASON_ID}
              className="min-h-6 text-sm leading-6 text-muted-foreground"
            >
              {blockReason}
            </p>
          </div>
        </div>

        {cardCount !== null ? (
          <section
            aria-labelledby="lucky-draw-lots-result-title"
            className="space-y-4"
          >
            <h2
              id="lucky-draw-lots-result-title"
              className="break-keep text-xl font-semibold leading-8 sm:text-2xl"
            >
              결과
            </h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm leading-6 text-foreground">
                  열린 카드{' '}
                  <span className="font-mono">
                    {openedCount} / {cardCount}
                  </span>
                  장
                </p>
                {isAllOpened ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    모든 카드를 열었어요.
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                aria-disabled={isAllOpened ? 'true' : undefined}
                aria-describedby={isAllOpened ? REST_REASON_ID : undefined}
                onClick={handleOpenRest}
                className={cn(
                  'h-11 w-full rounded-lg border border-menu-lucky px-4 text-sm font-semibold text-menu-lucky transition-colors duration-150 hover:bg-menu-lucky/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none sm:w-auto',
                  isAllOpened && 'cursor-not-allowed opacity-60'
                )}
              >
                남은 카드 모두 열기
              </button>
              {isAllOpened ? (
                <span id={REST_REASON_ID} className="sr-only">
                  열 카드가 없어요. 다시 섞기를 누르면 카드를 새로 섞어요.
                </span>
              ) : null}
            </div>
            <LuckyDrawLotsCardGridComponent
              cardCount={cardCount}
              openedLabels={openedLabels}
              onOpen={handleOpen}
            />
            {share.card ? (
              <>
                <SharePanelComponent controller={share.controller} />
                <ShareCardHostComponent ref={share.cardRef}>
                  <LuckyDrawLotsShareCardComponent card={share.card} />
                </ShareCardHostComponent>
              </>
            ) : null}
          </section>
        ) : null}
      </div>
    </MotionConfig>
  );
}
