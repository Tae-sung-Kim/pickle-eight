'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCreditStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ApplixirRewardAdComponent } from '@/components';
import { CREDIT_POLICY } from '@/constants';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useConsentContext } from '@/providers';

export type CreditBalancePillType = {
  className?: string;
  showLabel?: boolean;
};

export function CreditBalancePillComponent({
  className,
  showLabel = true,
}: CreditBalancePillType) {
  const { total, todayEarned, lastEarnedAt } = useCreditStore();
  const [open, setOpen] = useState<boolean>(false);
  const [cooldownMsLeft, setCooldownMsLeft] = useState<number>(0);
  const reachedDailyCap = todayEarned >= CREDIT_POLICY.dailyCap;
  const remaining = Math.max(0, CREDIT_POLICY.dailyCap - todayEarned);

  const { state, onOpen } = useConsentContext();

  useEffect(() => {
    const updateLeft = (): void => {
      const last: number = lastEarnedAt ?? 0;
      const since: number = Date.now() - last;
      const left: number = Math.max(0, CREDIT_POLICY.cooldownMs - since);
      setCooldownMsLeft(left);
    };
    updateLeft();
    const id = setInterval(updateLeft, 1000);
    return () => clearInterval(id);
  }, [lastEarnedAt]);

  const inCooldown = useMemo<boolean>(
    () => cooldownMsLeft > 0,
    [cooldownMsLeft]
  );
  const cooldownLabel = useMemo<string>(() => {
    const totalSec = Math.ceil(cooldownMsLeft / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m${s}s`;
  }, [cooldownMsLeft]);

  const disabledNow = useMemo<boolean>(
    () => reachedDailyCap || inCooldown,
    [reachedDailyCap, inCooldown]
  );

  const handleTriggerClick = (
    e: React.MouseEvent | React.KeyboardEvent
  ): void => {
    if (state !== 'accepted') {
      e.preventDefault();
      e.stopPropagation();
      onOpen();
      return;
    }

    if (disabledNow) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setOpen(true);
  };

  const handleTriggerKeyDown = (
    e: React.KeyboardEvent<HTMLSpanElement>
  ): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleTriggerClick(e);
    }
  };

  return (
    <div
      className={cn(
        // Mobile-safe: allow shrinking, avoid overflow, slightly tighter sizes
        // Also push to the right on small screens to avoid overlapping primary buttons in rows
        // Add a small right margin on mobile to prevent card edge clipping when parent has overflow-hidden
        'inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] text-muted-foreground overflow-hidden ml-auto mr-2 md:ml-0 md:mr-0 sm:text-xs sm:px-2.5 sm:py-1.5',
        className
      )}
    >
      {showLabel && <span className="shrink-0">보유</span>}
      <span className="tabular-nums font-semibold shrink-0">{total}</span>
      {/* Mobile-only inline status since tooltips are not available on touch */}
      <span className="block sm:hidden min-w-0 truncate text-[10px] text-muted-foreground">
        {state !== 'accepted'
          ? '광고 허가 필요'
          : reachedDailyCap
          ? '오늘 한도 도달'
          : inCooldown
          ? `${cooldownLabel}`
          : `오늘 ${todayEarned}/${CREDIT_POLICY.dailyCap}`}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* span을 Trigger로 사용하여, 내부 버튼이 비활성화처럼 보이더라도 툴팁은 항상 노출되도록 함 */}
          <span
            role="button"
            tabIndex={disabledNow ? -1 : 0}
            aria-disabled={disabledNow}
            onClick={handleTriggerClick}
            onKeyDown={handleTriggerKeyDown}
            className={cn(
              'inline-flex shrink-0',
              disabledNow && 'cursor-not-allowed'
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'ml-0.5 h-5 w-5 p-0 text-xs sm:h-5 sm:w-5',
                disabledNow && 'opacity-50 pointer-events-none'
              )}
            >
              +
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>
          {state !== 'accepted'
            ? '광고 허가 필요'
            : reachedDailyCap
            ? '오늘 시청 한도 도달'
            : inCooldown
            ? `다음 시청까지 ${cooldownLabel}`
            : `광고 보기로 크레딧 충전 · 남은 횟수 ${Math.floor(
                remaining / CREDIT_POLICY.rewardAmount
              )}회`}
        </TooltipContent>
      </Tooltip>
      {open && (
        <div className="mt-4 border rounded-md p-4 bg-card">
          <ApplixirRewardAdComponent
            onAdCompleted={() => setOpen(false)}
            onAdError={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default CreditBalancePillComponent;
