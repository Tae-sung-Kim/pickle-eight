'use client';

import { CircleAlert } from 'lucide-react';
import { type JSX, useEffect, useRef, useState } from 'react';

import { ShareCardHostComponent } from '@/components/share/share-card-host.component';
import { SharePanelComponent } from '@/components/share/share-panel.component';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { RouletteItemType } from '@/types/roulette.type';
import {
  LUCKY_DRAW_REVEAL_MODES,
  LUCKY_DRAW_ROULETTE_RULE,
} from '../../constants/lucky-draw-limit.constant';
import { LuckyDrawLinesInputComponent } from '../../shared/components/lines-input.component';
import { LuckyDrawRevealModeComponent } from '../../shared/components/reveal-mode.component';
import { LuckyDrawShareOptionsComponent } from '../../shared/components/share-options.component';
import { LuckyDrawStatusComponent } from '../../shared/components/status.component';
import { LuckyDrawToolNavComponent } from '../../shared/components/tool-nav.component';
import { parseLuckyDrawLines } from '../../utils/lucky-draw-input.util';
import {
  isLuckyDrawRandomAvailable,
  randomIntBelow,
} from '../../utils/lucky-draw-random.util';
import { useLuckyDrawRoulette } from '../hooks/use-lucky-draw-roulette.hook';
import { useLuckyDrawRouletteShare } from '../hooks/use-lucky-draw-roulette-share.hook';
import { LuckyDrawRouletteResultComponent } from './result.component';
import { LuckyDrawRouletteShareCardComponent } from './share-card.component';
import { LuckyDrawRouletteSpinPanelComponent } from './spin-panel.component';

const PLACEHOLDER = 'A\nB\nC';
const SWITCH_ID = 'lucky-draw-roulette-remove';
const SWITCH_DESC_ID = 'lucky-draw-roulette-remove-desc';
const MODE_OPTIONS = LUCKY_DRAW_REVEAL_MODES.roulette;

/**
 * LuckyDrawRouletteComponent
 * - 돌림판 도구 root. 입력, 공개 방식, 빼기 옵션, 돌림판, 결과, 남은 항목.
 */
export function LuckyDrawRouletteComponent(): JSX.Element {
  const [state, dispatch] = useLuckyDrawRoulette();
  const [isRandomAvailable, setIsRandomAvailable] = useState(true);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsRandomAvailable(isLuckyDrawRandomAvailable());
  }, []);

  const { spin } = state;
  const isSpinning = spin.status === 'spinning';
  const parsed = parseLuckyDrawLines(state.text, LUCKY_DRAW_ROULETTE_RULE, 'i');
  const entries = parsed.entries;
  const remaining = entries.filter((e) => !state.removedIds.includes(e.id));
  const wheelEntries = state.wheelIds
    ? state.wheelIds
        .map((id) => entries.find((e) => e.id === id))
        .filter((e): e is (typeof entries)[number] => e !== undefined)
    : remaining;
  const items: RouletteItemType[] = wheelEntries.map((e) => ({
    key: e.id,
    label: e.label,
  }));
  const pickedLabel =
    entries.find((e) => e.id === spin.pickedId)?.label ?? null;
  const share = useLuckyDrawRouletteShare({
    spin,
    isRevealed: state.isRevealed,
    pickedLabel,
    wheelEntries,
  });
  const isResultHidden = state.revealMode === 'hidden' && !state.isRevealed;
  const isPendingReveal = spin.status === 'done' && !state.isRevealed;

  let blockReason: string | null = null;
  if (entries.length < LUCKY_DRAW_ROULETTE_RULE.minCount) {
    blockReason = '두 개 이상 입력하세요.';
  } else if (remaining.length < LUCKY_DRAW_ROULETTE_RULE.minCount) {
    blockReason = '항목이 한 개 남았어요. 처음부터를 눌러 목록을 되돌리세요.';
  } else if (isPendingReveal) {
    blockReason = '결과 보기를 누르면 다시 돌릴 수 있어요.';
  }
  const isBlocked = blockReason !== null || !isRandomAvailable;

  const errorParts: string[] = [];
  if (parsed.overflowCount > 0) {
    errorParts.push(
      `최대 ${LUCKY_DRAW_ROULETTE_RULE.maxCount}개까지 입력할 수 있어요. 앞의 ${LUCKY_DRAW_ROULETTE_RULE.maxCount}개만 사용해요.`
    );
  }
  if (parsed.tooLongCount > 0) {
    errorParts.push(
      `한 줄은 ${LUCKY_DRAW_ROULETTE_RULE.maxLength}자까지 쓸 수 있어요. 긴 줄 ${parsed.tooLongCount}개는 사용하지 않아요.`
    );
  }
  const errorText = errorParts.length > 0 ? errorParts.join(' ') : null;

  let statusMessage = '';
  if (isSpinning) {
    statusMessage = '돌리는 중이에요.';
  } else if (spin.status === 'done') {
    statusMessage =
      state.isRevealed && pickedLabel !== null
        ? `돌림판 결과: ${pickedLabel}`
        : '결과가 정해졌어요. 결과 보기를 누르면 볼 수 있어요.';
  }

  const handleSpin = (): void => {
    if (isBlocked || isSpinning) return;
    try {
      const targetIndex = randomIntBelow(remaining.length);
      dispatch({
        type: 'SPIN_START',
        wheelIds: remaining.map((e) => e.id),
        targetIndex,
        pickedId: remaining[targetIndex].id,
      });
    } catch {
      setIsRandomAvailable(false);
    }
  };

  const handleReveal = (): void => {
    dispatch({ type: 'REVEAL' });
    resultRef.current?.focus();
  };

  const showRestore =
    state.shouldRemovePicked &&
    (state.removedIds.length > 0 || remaining.length <= 1) &&
    entries.length > 0;

  return (
    <div className="space-y-6">
      <LuckyDrawToolNavComponent current="roulette" isLocked={isSpinning} />
      <LuckyDrawStatusComponent message={statusMessage} />

      {isRandomAvailable ? null : (
        <p className="flex items-start gap-2 text-sm leading-6 text-destructive">
          <CircleAlert className="mt-1 size-4 shrink-0" aria-hidden="true" />
          <span>
            이 브라우저에서는 도구를 쓸 수 없어요. 다른 브라우저로 열어 보세요.
          </span>
        </p>
      )}

      <div className="grid gap-6 rounded-panel border border-border bg-card p-4 sm:p-6 md:grid-cols-2 md:items-start">
        <div className="space-y-6">
          <LuckyDrawLinesInputComponent
            id="lucky-draw-roulette-text"
            label="항목"
            value={state.text}
            onChange={(text) => dispatch({ type: 'SET_TEXT', text })}
            placeholder={PLACEHOLDER}
            countText={`${entries.length} / ${LUCKY_DRAW_ROULETTE_RULE.maxCount}개`}
            isLocked={isSpinning}
            errorText={errorText}
          />
          <LuckyDrawRevealModeComponent
            name="lucky-draw-roulette-reveal"
            value={state.revealMode}
            options={MODE_OPTIONS}
            isLocked={isSpinning}
            onChange={(mode) => {
              if (isSpinning || mode === 'one-by-one') return;
              dispatch({ type: 'SET_REVEAL_MODE', mode });
            }}
          />
          <div
            className={cn('space-y-1', isSpinning && 'opacity-60')}
            aria-disabled={isSpinning ? 'true' : undefined}
          >
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor={SWITCH_ID}
                className="text-sm font-semibold leading-6 text-foreground"
              >
                뽑힌 항목 빼기
              </label>
              <Switch
                id={SWITCH_ID}
                checked={state.shouldRemovePicked}
                aria-describedby={SWITCH_DESC_ID}
                aria-disabled={isSpinning ? 'true' : undefined}
                onCheckedChange={(value) => {
                  if (isSpinning) return;
                  dispatch({ type: 'SET_REMOVE_PICKED', value });
                }}
              />
            </div>
            <p
              id={SWITCH_DESC_ID}
              className="text-sm leading-6 text-muted-foreground"
            >
              켜면 뽑힌 항목을 빼고 남은 항목으로 다시 돌려요.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <LuckyDrawRouletteSpinPanelComponent
            items={items}
            targetIndex={spin.targetIndex}
            spinId={spin.spinId}
            isResultHidden={isResultHidden}
            isSpinning={isSpinning}
            blockReason={
              isRandomAvailable
                ? blockReason
                : '이 브라우저에서는 도구를 쓸 수 없어요.'
            }
            isBlocked={isBlocked}
            onSpin={handleSpin}
            onSpinEnd={(spinId) => dispatch({ type: 'SPIN_END', spinId })}
          />
          <LuckyDrawRouletteResultComponent
            containerRef={resultRef}
            status={spin.status}
            isRevealed={state.isRevealed}
            isHiddenMode={state.revealMode === 'hidden'}
            label={state.isRevealed ? pickedLabel : null}
            onReveal={handleReveal}
          />
          {share.card ? (
            <SharePanelComponent
              controller={share.controller}
              previewAlt={share.previewAlt}
              previewTexts={share.previewTexts}
            >
              <LuckyDrawShareOptionsComponent
                isMasked={share.options.isMasked}
                onMaskedChange={(isMasked) =>
                  share.setOptions((prev) => ({ ...prev, isMasked }))
                }
                shouldIncludeCandidates={share.options.shouldIncludeCandidates}
                onIncludeCandidatesChange={(shouldIncludeCandidates) =>
                  share.setOptions((prev) => ({
                    ...prev,
                    shouldIncludeCandidates,
                  }))
                }
              />
            </SharePanelComponent>
          ) : null}
        </div>
      </div>

      {state.shouldRemovePicked ? (
        <section
          aria-labelledby="lucky-draw-roulette-remaining"
          className="space-y-2"
        >
          <div className="flex items-center justify-between gap-2">
            <h2
              id="lucky-draw-roulette-remaining"
              className="text-base font-semibold leading-6 text-foreground"
            >
              남은 항목 {remaining.length}개
            </h2>
            {showRestore ? (
              <button
                type="button"
                aria-disabled={isSpinning ? 'true' : undefined}
                onClick={() => {
                  if (isSpinning) return;
                  dispatch({ type: 'RESTORE' });
                }}
                className={cn(
                  'h-11 rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none',
                  isSpinning && 'opacity-60'
                )}
              >
                처음부터
              </button>
            ) : null}
          </div>
          <ul className="flex flex-wrap gap-2">
            {remaining.map((e) => (
              <li
                key={e.id}
                className="break-words rounded-md border border-border bg-card px-2 py-1 text-sm leading-6 text-foreground"
              >
                {e.label}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {share.card ? (
        <ShareCardHostComponent ref={share.cardRef}>
          <LuckyDrawRouletteShareCardComponent card={share.card} />
        </ShareCardHostComponent>
      ) : null}
    </div>
  );
}
