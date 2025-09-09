'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useCreditStore } from '@/stores';
import { cn } from '@/lib';
import {
  CREDIT_POLICY,
  CREDIT_REFILL_INTERVAL_MS,
  CREDIT_RESET_MODE,
  CREDIT_RESET_MODE_ENUM,
} from '@/constants';
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

function nextKstMidnightUtcTs(base: number = Date.now()): number {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const kstNow = new Date(base + KST_OFFSET_MS);
  const y = kstNow.getUTCFullYear();
  const m = kstNow.getUTCMonth();
  const d = kstNow.getUTCDate();
  const nextKstZeroUtcMs = Date.UTC(y, m, d + 1, 0, 0, 0) - KST_OFFSET_MS;
  return nextKstZeroUtcMs;
}

function formatHms(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(
      2,
      '0'
    )}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function CreditBalancePillComponent({
  className,
  showLabel = true,
}: CreditBalancePillType) {
  const {
    total,
    syncReset,
    hydrated,
    markHydrated,
    refillArmed,
    lastRefillAt,
  } = useCreditStore();

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

  const [resetRemainMs, setResetRemainMs] = useState<number>(-1);
  const [refillRemainMs, setRefillRemainMs] = useState<number>(
    CREDIT_REFILL_INTERVAL_MS > 0 ? -1 : 0
  );

  const nextResetTsCalc = useCallback((): number => {
    if (CREDIT_RESET_MODE === CREDIT_RESET_MODE_ENUM.MINUTE) {
      const d = new Date();
      d.setSeconds(0, 0);
      d.setMinutes(d.getMinutes() + 1);
      return d.getTime();
    }
    return nextKstMidnightUtcTs();
  }, []);

  const nextResetRef = useRef<number>(0);

  useEffect(() => {
    const initialNext = nextResetTsCalc();
    nextResetRef.current = initialNext;
    setResetRemainMs(Math.max(0, initialNext - Date.now()));

    const tick = (): void => {
      const now = Date.now();
      // Reset countdown
      const resetTarget = nextResetRef.current || nextResetTsCalc();
      if (now >= resetTarget) {
        if (hydrated) syncReset();
        const next = nextResetTsCalc();
        nextResetRef.current = next;
        setResetRemainMs(Math.max(0, next - Date.now()));
      } else {
        setResetRemainMs(Math.max(0, resetTarget - now));
      }

      // Refill countdown: only if interval enabled AND armed AND below cap
      const atCap = total >= CREDIT_POLICY.dailyCap;
      const refillDisabled = CREDIT_REFILL_INTERVAL_MS <= 0;
      if (refillDisabled || atCap || !refillArmed) {
        setRefillRemainMs(0);
        return;
      }
      const base =
        typeof lastRefillAt === 'number' && lastRefillAt > 0
          ? lastRefillAt
          : now; // safety
      const target = base + CREDIT_REFILL_INTERVAL_MS;
      const remain = Math.max(0, target - now);
      setRefillRemainMs(remain);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hydrated, syncReset, nextResetTsCalc, refillArmed, lastRefillAt, total]);

  const resetLabel = useMemo<string>(() => {
    if (resetRemainMs < 0) return '--:--';
    return formatHms(resetRemainMs);
  }, [resetRemainMs]);

  const refillLabel = useMemo<string>(() => {
    if (CREDIT_REFILL_INTERVAL_MS <= 0) return '—';
    if (refillRemainMs < 0) return '--:--';
    if (refillRemainMs === 0) return '—';
    return formatHms(refillRemainMs);
  }, [refillRemainMs]);

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
            <span className="sr-only">크레딧 정책 보기</span>
          </span>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>
          <div className="space-y-0.5">
            <p>5분마다 +1 충전 · 최대 {CREDIT_POLICY.dailyCap}</p>
            <p>다음 충전까지 {refillLabel}</p>
            <p>자정 리셋까지 {resetLabel}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default CreditBalancePillComponent;
