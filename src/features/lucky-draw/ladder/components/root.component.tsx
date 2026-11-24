'use client';

import { MotionConfig } from 'framer-motion';
import { CircleAlert } from 'lucide-react';
import {
  type JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ShareCardHostComponent } from '@/components/share/share-card-host.component';
import { SharePanelComponent } from '@/components/share/share-panel.component';
import { cn } from '@/lib/utils';
import {
  LUCKY_DRAW_LADDER_RULE,
  LUCKY_DRAW_REVEAL_MODES,
} from '../../constants/lucky-draw-limit.constant';
import { LUCKY_DRAW_INPUT_NOTICE_TEXT } from '../../constants/lucky-draw-notice.constant';
import { LuckyDrawLinesInputComponent } from '../../shared/components/lines-input.component';
import { LuckyDrawResultNoticeComponent } from '../../shared/components/result-notice.component';
import { LuckyDrawRevealModeComponent } from '../../shared/components/reveal-mode.component';
import { LuckyDrawShareOptionsComponent } from '../../shared/components/share-options.component';
import { LuckyDrawStatusComponent } from '../../shared/components/status.component';
import { LuckyDrawToolNavComponent } from '../../shared/components/tool-nav.component';
import {
  getLuckyDrawLadderBlock,
  parseLuckyDrawLines,
} from '../../utils/lucky-draw-input.util';
import {
  createLuckyDrawLadderGame,
  traceLuckyDrawLadder,
} from '../../utils/lucky-draw-ladder.util';
import { isLuckyDrawRandomAvailable } from '../../utils/lucky-draw-random.util';
import { useLuckyDrawLadder } from '../hooks/use-lucky-draw-ladder.hook';
import { useLuckyDrawLadderShare } from '../hooks/use-lucky-draw-ladder-share.hook';
import { LuckyDrawLadderBoardComponent } from './board.component';
import { LuckyDrawLadderNamePickerComponent } from './name-picker.component';
import {
  LuckyDrawLadderResultListComponent,
  type LuckyDrawLadderResultRowType,
} from './result-list.component';
import { LuckyDrawLadderShareCardComponent } from './share-card.component';

const NOTICE_ID = 'lucky-ladder-notice';
const BLOCK_ID = 'lucky-ladder-block';
const LOCK_REASON_ID = 'lucky-ladder-lock';
const BTN_BASE =
  'flex w-full items-center justify-center rounded-lg px-4 text-base font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none';

function getBlockText(
  block: ReturnType<typeof getLuckyDrawLadderBlock>,
  a: number,
  b: number
): string | null {
  switch (block) {
    case 'too-few':
      return '참가자를 2명 이상 입력하세요.';
    case 'too-many':
      return `참가자는 최대 ${LUCKY_DRAW_LADDER_RULE.maxCount}명까지 입력할 수 있어요. 시작하려면 ${LUCKY_DRAW_LADDER_RULE.maxCount}명 이하로 줄여 주세요.`;
    case 'count-mismatch':
      return b > LUCKY_DRAW_LADDER_RULE.maxCount
        ? `결과는 최대 ${LUCKY_DRAW_LADDER_RULE.maxCount}개까지 입력할 수 있어요. 시작하려면 참가자 수에 맞춰 줄여 주세요.`
        : `참가자 ${a}명, 결과 ${b}개예요. 같은 수로 맞춰 주세요.`;
    default:
      return null;
  }
}

const tooLongText = (k: number): string | null =>
  k > 0
    ? `한 줄은 ${LUCKY_DRAW_LADDER_RULE.maxLength}자까지 쓸 수 있어요. 긴 줄 ${k}개는 사용하지 않아요.`
    : null;

/**
 * LuckyDrawLadderRootComponent
 * - 사다리 타기 도구 root. 입력, 시작, 결과 영역(시작 후에만 렌더링).
 */
export function LuckyDrawLadderRootComponent(): JSX.Element {
  const [state, dispatch] = useLuckyDrawLadder();
  const { game, revealMode, isRevealed, tracedColumns, tracing } = state;
  const [randomOk, setRandomOk] = useState(true);
  const [startFailed, setStartFailed] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusHeadingRef = useRef(false);

  useEffect(() => {
    setRandomOk(isLuckyDrawRandomAvailable());
  }, []);

  // 텍스트나 공개 방식이 바뀌면 시작 실패 안내를 지운다
  // biome-ignore lint/correctness/useExhaustiveDependencies: 입력 변경만 트리거
  useEffect(() => {
    setStartFailed(false);
  }, [state.participantText, state.resultText, revealMode]);

  useEffect(() => {
    if (isRevealed && focusHeadingRef.current) {
      focusHeadingRef.current = false;
      headingRef.current?.focus();
    }
  }, [isRevealed]);

  const participants = useMemo(
    () =>
      parseLuckyDrawLines(state.participantText, LUCKY_DRAW_LADDER_RULE, 'p'),
    [state.participantText]
  );
  const results = useMemo(
    () => parseLuckyDrawLines(state.resultText, LUCKY_DRAW_LADDER_RULE, 'r'),
    [state.resultText]
  );
  const block = getLuckyDrawLadderBlock(participants, results);
  const blockText = getBlockText(
    block,
    participants.entries.length,
    results.entries.length + results.overflowCount
  );
  const isLocked = tracing !== null;
  const canStart = randomOk && block === null && !isLocked;
  const reasonText = !randomOk
    ? '이 브라우저에서는 도구를 쓸 수 없어요. 다른 브라우저로 열어 보세요.'
    : blockText;

  const handleStart = (): void => {
    if (!canStart) return;
    try {
      dispatch({
        type: 'START',
        game: createLuckyDrawLadderGame(participants.entries, results.entries),
      });
      setStartFailed(false);
    } catch {
      setStartFailed(true);
    }
  };

  const handlePathEnd = useCallback(
    (runId: number) => dispatch({ type: 'TRACE_END', runId }),
    [dispatch]
  );

  const traces = useMemo(
    () =>
      game
        ? game.participants.map(
            (_, i) => traceLuckyDrawLadder(game.ladder, i).endColumn
          )
        : [],
    [game]
  );

  const checked = useMemo(() => new Set(tracedColumns), [tracedColumns]);
  const pathColumn =
    tracing?.column ??
    (tracedColumns.length ? tracedColumns[tracedColumns.length - 1] : null);
  const isHiddenLocked = revealMode === 'hidden' && !isRevealed;

  const revealedSlots = useMemo(() => {
    const set = new Set<number>();
    if (!game) return set;
    if (revealMode === 'one-by-one') {
      for (const c of tracedColumns) set.add(traces[c]);
    } else if (isRevealed) {
      for (let c = 0; c < game.ladder.columnCount; c += 1) set.add(c);
    }
    return set;
  }, [game, revealMode, isRevealed, tracedColumns, traces]);

  const rows: LuckyDrawLadderResultRowType[] = [];
  if (game) {
    const order =
      revealMode === 'one-by-one'
        ? tracedColumns
        : isRevealed
          ? game.participants.map((_, i) => i)
          : [];
    for (const i of order) {
      rows.push({
        id: game.participants[i].id,
        name: game.participants[i].label,
        result: game.results[game.assignment[i]].label,
      });
    }
  }

  const share = useLuckyDrawLadderShare(rows);

  let statusMessage = '';
  if (game && !tracing) {
    const last = tracedColumns.length
      ? tracedColumns[tracedColumns.length - 1]
      : null;
    if (last !== null && !isHiddenLocked) {
      statusMessage = `${game.participants[last].label}의 결과: ${game.results[game.assignment[last]].label}`;
    } else if (revealMode === 'hidden') {
      statusMessage = isRevealed
        ? '전체 결과가 나왔어요. 아래 목록에서 읽을 수 있어요.'
        : '사다리가 만들어졌어요. 결과 보기를 누르면 볼 수 있어요.';
    } else if (revealMode === 'one-by-one') {
      statusMessage =
        '사다리가 만들어졌어요. 이름을 고르면 그 이름의 결과가 나와요.';
    } else {
      statusMessage =
        '사다리가 만들어졌어요. 이름을 고르면 결과를 따라가 볼 수 있고, 전체 결과는 아래 목록에 있어요.';
    }
  }

  const emptyText =
    revealMode === 'hidden'
      ? '결과 보기를 누르면 이름별 결과가 나와요.'
      : '이름을 고르면 결과가 여기에 쌓여요.';

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <LuckyDrawStatusComponent message={statusMessage} />
        <LuckyDrawToolNavComponent current="ladder" isLocked={isLocked} />

        <section className="space-y-4 rounded-panel border border-border bg-card p-4 sm:p-6">
          {!randomOk ? (
            <p className="flex items-start gap-2 text-sm leading-6 text-destructive">
              <CircleAlert
                className="mt-1 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                이 브라우저에서는 도구를 쓸 수 없어요. 다른 브라우저로 열어
                보세요.
              </span>
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <LuckyDrawLinesInputComponent
              id="lucky-ladder-participants"
              label="참가자"
              value={state.participantText}
              onChange={(text) =>
                dispatch({ type: 'SET_PARTICIPANT_TEXT', text })
              }
              placeholder={'참가자 1\n참가자 2\n참가자 3'}
              countText={`${participants.entries.length} / ${LUCKY_DRAW_LADDER_RULE.maxCount}명`}
              isLocked={isLocked}
              errorText={tooLongText(participants.tooLongCount)}
              showNotice={false}
              externalNoticeId={NOTICE_ID}
            />
            <LuckyDrawLinesInputComponent
              id="lucky-ladder-results"
              label="결과"
              value={state.resultText}
              onChange={(text) => dispatch({ type: 'SET_RESULT_TEXT', text })}
              placeholder={'청소\n설거지\n쉬기'}
              countText={`${results.entries.length} / ${LUCKY_DRAW_LADDER_RULE.maxCount}개`}
              isLocked={isLocked}
              errorText={tooLongText(results.tooLongCount)}
              showNotice={false}
              externalNoticeId={NOTICE_ID}
            />
          </div>
          <p id={NOTICE_ID} className="text-sm leading-6 text-muted-foreground">
            {LUCKY_DRAW_INPUT_NOTICE_TEXT}
          </p>
          <LuckyDrawRevealModeComponent
            name="lucky-ladder-reveal"
            value={revealMode}
            options={LUCKY_DRAW_REVEAL_MODES.ladder}
            onChange={(mode) => dispatch({ type: 'SET_REVEAL_MODE', mode })}
            isLocked={isLocked}
          />
          {reasonText ? (
            <p
              id={BLOCK_ID}
              className="flex items-start gap-2 text-sm leading-6 text-destructive"
            >
              <CircleAlert
                className="mt-1 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{reasonText}</span>
            </p>
          ) : null}
          {startFailed ? (
            <p className="flex items-start gap-2 text-sm leading-6 text-destructive">
              <CircleAlert
                className="mt-1 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>사다리를 만들지 못했어요. 시작을 다시 눌러 주세요.</span>
            </p>
          ) : null}
          <button
            type="button"
            aria-disabled={canStart ? undefined : 'true'}
            aria-describedby={reasonText ? BLOCK_ID : undefined}
            onClick={handleStart}
            className={cn(
              BTN_BASE,
              'h-12 bg-menu-lucky text-primary-foreground hover:bg-menu-lucky/90',
              !canStart && 'cursor-not-allowed opacity-60'
            )}
          >
            {game ? '다시 시작' : '시작'}
          </button>
        </section>

        {game ? (
          <section className="space-y-4 rounded-panel border border-border bg-card p-4 sm:p-6">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-xl font-bold text-foreground focus-visible:outline-none"
            >
              결과
            </h2>
            {isHiddenLocked ? (
              <button
                type="button"
                aria-disabled={isLocked ? 'true' : undefined}
                onClick={() => {
                  if (isLocked) return;
                  focusHeadingRef.current = true;
                  dispatch({ type: 'REVEAL_ALL' });
                }}
                className={cn(
                  BTN_BASE,
                  'h-11 border border-border text-foreground hover:bg-menu-lucky/10',
                  isLocked && 'cursor-not-allowed opacity-60'
                )}
              >
                결과 보기
              </button>
            ) : null}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">
                이름 고르기
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                이름을 누르면 사다리를 따라 결과가 나와요.
              </p>
              {isHiddenLocked ? (
                <p
                  id={LOCK_REASON_ID}
                  className="text-sm leading-6 text-muted-foreground"
                >
                  결과 보기를 누르면 이름을 골라 사다리를 따라갈 수 있어요.
                </p>
              ) : null}
              <LuckyDrawLadderNamePickerComponent
                participants={game.participants}
                selectedColumn={pathColumn}
                checkedColumns={
                  revealMode === 'one-by-one' ? checked : new Set()
                }
                isLocked={isLocked || isHiddenLocked}
                lockReasonId={isHiddenLocked ? LOCK_REASON_ID : undefined}
                onPick={(column) => dispatch({ type: 'TRACE_START', column })}
              />
            </div>
            <LuckyDrawLadderBoardComponent
              game={game}
              pathColumn={pathColumn}
              drawingRunId={tracing ? tracing.runId : null}
              revealedSlots={revealedSlots}
              arrivedSlot={
                !tracing && pathColumn !== null && !isHiddenLocked
                  ? traces[pathColumn]
                  : null
              }
              onPathEnd={handlePathEnd}
            />
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">
                전체 결과
              </h3>
              <LuckyDrawLadderResultListComponent
                rows={rows}
                emptyText={emptyText}
              />
            </div>
            {share.card ? (
              <>
                <SharePanelComponent
                  controller={share.controller}
                  previewAlt={share.previewAlt}
                  previewTexts={share.previewTexts}
                >
                  <LuckyDrawShareOptionsComponent
                    isMasked={share.options.isMasked}
                    onMaskedChange={(isMasked) =>
                      share.setOptions({ isMasked })
                    }
                  />
                </SharePanelComponent>
                <ShareCardHostComponent ref={share.cardRef}>
                  <LuckyDrawLadderShareCardComponent card={share.card} />
                </ShareCardHostComponent>
              </>
            ) : null}
          </section>
        ) : null}

        <LuckyDrawResultNoticeComponent />
      </div>
    </MotionConfig>
  );
}
