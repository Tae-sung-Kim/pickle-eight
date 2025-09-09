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

function kstMidnightUtcTs(now: number = Date.now()): number {
  const d = new Date(now);
  const utc = d.getTime() + d.getTimezoneOffset() * 60_000;
  const kst = new Date(utc + 9 * 60 * 60 * 1000);
  kst.setHours(0, 0, 0, 0);
  const kstMidnightUtc = kst.getTime() - 9 * 60 * 60 * 1000;
  // if already past today's midnight (same timestamp), add 24h to get next midnight
  return (
    kstMidnightUtc +
    (now >= kstMidnightUtc + 24 * 60 * 60 * 1000 ? 24 * 60 * 60 * 1000 : 0)
  );
}

function nextFiveMinuteBucketTs(now: number = Date.now()): number {
  const d = new Date(now);
  d.setSeconds(0, 0);
  const m = d.getMinutes();
  const mod = m % 5;
  const add = mod === 0 ? 5 : 5 - mod;
  d.setMinutes(m + add);
  return d.getTime();
}

function formatHms(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0 ? `${h}h${m}m` : `${m}m${s}s`;
}

export function CreditBalancePillComponent({
  className,
  showLabel = true,
}: CreditBalancePillType) {
  const { total, syncReset, hydrated, markHydrated } = useCreditStore();

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

  const timers = useMemo<{ refillIn: string; resetIn: string }>(() => {
    const now = Date.now();
    const refillTs = nextFiveMinuteBucketTs(now);
    const midnightTs = kstMidnightUtcTs(now);
    return {
      refillIn: formatHms(refillTs - now),
      resetIn: formatHms(midnightTs - now),
    };
  }, []);

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

      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex shrink-0" role="button" tabIndex={0}>
            {/* 정보 툴팁 트리거 (아이콘 없이 영역 클릭으로 표시) */}
            <span className="sr-only">크레딧 정책 보기</span>
          </span>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>
          <div className="space-y-0.5">
            <p>5분마다 +1 충전 · 최대 {CREDIT_POLICY.dailyCap}</p>
            <p>다음 충전까지 {timers.refillIn}</p>
            <p>자정 리셋까지 {timers.resetIn}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default CreditBalancePillComponent;
