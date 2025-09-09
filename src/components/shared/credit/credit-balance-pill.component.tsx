'use client';

import { useEffect, useMemo } from 'react';
import { useCreditStore } from '@/stores';
import { cn } from '@/lib';
import { CREDIT_POLICY } from '@/constants';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { scheduleIdle, cancelIdle } from '@/lib';

export type CreditBalancePillType = {
  className?: string;
  showLabel?: boolean;
};

export function CreditBalancePillComponent({
  className,
  showLabel = true,
}: CreditBalancePillType) {
  const { total, todayEarned, syncReset, hydrated, markHydrated } =
    useCreditStore();

  useEffect(() => {
    if (hydrated) syncReset();
  }, [syncReset, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      const idleId = scheduleIdle(() => markHydrated());
      return () => {
        cancelIdle(idleId);
      };
    }
  }, [hydrated, markHydrated]);

  const todayAvailLabel = useMemo<string>(() => {
    return `오늘 ${todayEarned}/${CREDIT_POLICY.dailyCap}`;
  }, [todayEarned]);

  return (
    <div
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] text-muted-foreground overflow-hidden ml-auto mr-2 md:ml-0 md:mr-0 sm:text-xs sm:px-2.5 sm:py-1.5',
        className
      )}
    >
      {showLabel && <span className="shrink-0">보유</span>}
      <span className="tabular-nums font-semibold shrink-0">
        {hydrated ? total : '—'}
      </span>
      {/* Mobile-only inline status */}
      <span className="block sm:hidden min-w-0 truncate text-[10px] text-muted-foreground">
        {todayAvailLabel}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex shrink-0" role="button" tabIndex={0}>
            {/* 정보 툴팁 트리거 (아이콘 없이 영역 클릭으로 표시) */}
            <span className="sr-only">크레딧 정책 보기</span>
          </span>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>
          <div className="space-y-0.5">
            <p>5분마다 +5 충전 · 최대 {CREDIT_POLICY.dailyCap}</p>
            <p>{todayAvailLabel}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default CreditBalancePillComponent;
