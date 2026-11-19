import type { JSX, Ref } from 'react';

import { RouletteComponent } from '@/components/common/roulette.component';
import { Button } from '@/components/ui/button';
import type { RouletteItemType } from '@/types/roulette.type';

export type LunchTodaySpinPanelComponentPropsType = Readonly<{
  items: readonly RouletteItemType[];
  targetIndex: number | null;
  spinId: number;
  spinning: boolean;
  /** 후보 0개 */
  disabled: boolean;
  buttonLabel: string;
  /** 후보 0개일 때 안내 블록 id */
  describedBy?: string;
  buttonRef?: Ref<HTMLButtonElement>;
  onSpin: () => void;
  onSpinEnd: (spinId: number) => void;
}>;

/**
 * LunchTodaySpinPanelComponent
 * - 돌림판 + 버튼 하나(U3). 회전 중에도 같은 버튼이 남아 포커스를 유지한다.
 */
export function LunchTodaySpinPanelComponent({
  items,
  targetIndex,
  spinId,
  spinning,
  disabled,
  buttonLabel,
  describedBy,
  buttonRef,
  onSpin,
  onSpinEnd,
}: LunchTodaySpinPanelComponentPropsType): JSX.Element {
  return (
    <div
      aria-busy={spinning}
      className="mx-auto w-full max-w-80 space-y-4 md:max-w-sm"
    >
      <div aria-hidden="true">
        <RouletteComponent
          items={items}
          targetIndex={targetIndex}
          spinId={spinId}
          onSpinEnd={onSpinEnd}
          className="aspect-square w-full"
        />
      </div>
      <Button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-disabled={spinning ? true : undefined}
        aria-describedby={disabled ? describedBy : undefined}
        onClick={() => {
          if (spinning) {
            return;
          }
          onSpin();
        }}
        className="h-12 w-full rounded-lg bg-menu-lunch text-base font-semibold text-primary-foreground hover:bg-menu-lunch/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 aria-disabled:cursor-wait aria-disabled:opacity-70"
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
