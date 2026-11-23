import type { JSX } from 'react';

import { RouletteComponent } from '@/components/common/roulette.component';
import { cn } from '@/lib/utils';
import type { RouletteItemType } from '@/types/roulette.type';
import { LUCKY_DRAW_ROULETTE_SPIN } from '../../constants/lucky-draw-limit.constant';
import {
  LUCKY_DRAW_ACCENT_BG_CLASS,
  LUCKY_DRAW_ROULETTE_ACCENT_CLASS,
} from '../../constants/lucky-draw-theme.constant';

const REASON_ID = 'lucky-draw-roulette-reason';

type LuckyDrawRouletteSpinPanelPropsType = Readonly<{
  items: readonly RouletteItemType[];
  targetIndex: number | null;
  spinId: number;
  isResultHidden: boolean;
  isSpinning: boolean;
  /** 막힘 사유. 없으면 null (줄 자리는 유지) */
  blockReason: string | null;
  isBlocked: boolean;
  onSpin: () => void;
  onSpinEnd: (spinId: number) => void;
}>;

/**
 * LuckyDrawRouletteSpinPanelComponent
 * - 공용 돌림판 + 돌리기 버튼 + 막힘 사유 한 줄
 */
export function LuckyDrawRouletteSpinPanelComponent({
  items,
  targetIndex,
  spinId,
  isResultHidden,
  isSpinning,
  blockReason,
  isBlocked,
  onSpin,
  onSpinEnd,
}: LuckyDrawRouletteSpinPanelPropsType): JSX.Element {
  const isDisabled = isBlocked || isSpinning;

  return (
    <div className="space-y-4">
      <div
        aria-hidden="true"
        className={cn(
          'mx-auto w-full max-w-sm rounded-full border-2 p-2',
          isResultHidden
            ? 'border-dashed border-menu-lucky/50'
            : 'border-transparent'
        )}
      >
        <RouletteComponent
          items={items}
          targetIndex={targetIndex}
          spinId={spinId}
          onSpinEnd={onSpinEnd}
          accentClassName={LUCKY_DRAW_ROULETTE_ACCENT_CLASS}
          spinDurationSec={LUCKY_DRAW_ROULETTE_SPIN.durationSec}
          spinTurns={LUCKY_DRAW_ROULETTE_SPIN.turns}
          isResultHidden={isResultHidden}
        />
      </div>
      <button
        type="button"
        aria-disabled={isDisabled ? 'true' : undefined}
        aria-describedby={blockReason ? REASON_ID : undefined}
        onClick={() => {
          if (isDisabled) return;
          onSpin();
        }}
        className={cn(
          'h-12 w-full rounded-lg text-base font-semibold text-primary-foreground transition-colors duration-150 hover:bg-menu-lucky/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none',
          LUCKY_DRAW_ACCENT_BG_CLASS,
          isDisabled && 'cursor-not-allowed opacity-60'
        )}
      >
        돌리기
      </button>
      <p
        id={REASON_ID}
        className="min-h-6 text-sm leading-6 text-muted-foreground"
      >
        {blockReason}
      </p>
    </div>
  );
}
