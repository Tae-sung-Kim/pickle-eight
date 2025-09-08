'use client';

import Link from 'next/link';
import { Home, Coins, PlayCircle } from 'lucide-react';
import {
  MobileMenuLayout,
  PcMenuLayout,
  RewardModalComponent,
} from '@/components';
import { Button } from '@/components/ui/button';
import { useCreditStore } from '@/stores';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { CREDIT_POLICY, CREDIT_RESET_MODE_ENUM } from '@/constants';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { CreditResetModeType } from '@/types';
import { scheduleIdle, cancelIdle } from '@/lib';

// Normalize env to enum VALUE union ('midnight' | 'minute')
const envMode = (process.env.NEXT_PUBLIC_CREDIT_RESET_MODE || '').toLowerCase();

const resetMode: CreditResetModeType =
  envMode === CREDIT_RESET_MODE_ENUM.MINUTE
    ? CREDIT_RESET_MODE_ENUM.MINUTE
    : CREDIT_RESET_MODE_ENUM.MIDNIGHT;
const isMinuteMode = resetMode === CREDIT_RESET_MODE_ENUM.MINUTE;

export function HeaderLayout() {
  const { total, todayEarned, syncReset, hydrated, markHydrated } =
    useCreditStore();

  useEffect(() => {
    if (!hydrated) {
      // yield to allow persist to run first
      const idleId = scheduleIdle(() => markHydrated());
      return () => {
        cancelIdle(idleId);
      };
    }
  }, [hydrated, markHydrated]);

  const nextKstMidnight = (base: Date): number => {
    const msUtc = base.getTime() + base.getTimezoneOffset() * 60_000;
    const kst = new Date(msUtc + 9 * 60 * 60 * 1000);
    kst.setHours(24, 0, 0, 0); // next midnight in KST
    const backToUtc = kst.getTime() - 9 * 60 * 60 * 1000;
    return backToUtc;
  };

  const calcNextResetTs = useCallback(() => {
    const now = new Date();
    if (resetMode === CREDIT_RESET_MODE_ENUM.MINUTE) {
      const d = new Date(now);
      d.setSeconds(0, 0);
      d.setMinutes(d.getMinutes() + 1);
      return d.getTime();
    }
    return nextKstMidnight(now);
  }, []);

  // Keep moving threshold in state; initialize after mount to avoid SSR mismatch
  const [nextResetTs, setNextResetTs] = useState<number>(0);

  const [remainingMs, setRemainingMs] = useState<number>(-1);

  const didResetRef = useRef<boolean>(false);

  useEffect(() => {
    // initialize threshold when mode changes
    if (!hydrated) return;
    const initialNext = calcNextResetTs();
    setNextResetTs(initialNext);
    const tick = (): void => {
      if (!hydrated) return;
      const now = Date.now();
      if (now >= nextResetTs) {
        if (!didResetRef.current) {
          // Force store to sync to new period (sets credits to baseDaily)
          syncReset();
          didResetRef.current = true;
        }
        const next = calcNextResetTs();
        setNextResetTs(next);
        setRemainingMs(next - Date.now());
      } else {
        didResetRef.current = false;
        setRemainingMs(nextResetTs - now);
      }
    };
    // IMPORTANT: do NOT tick immediately to avoid hydration race
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [syncReset, nextResetTs, calcNextResetTs, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (nextResetTs > 0) setRemainingMs(nextResetTs - Date.now());
  }, [nextResetTs, hydrated]);

  useEffect(() => {
    if (isMinuteMode) {
      // Developer-visible warning in console to avoid accidental production usage
      console.warn(
        '[Credits] NEXT_PUBLIC_CREDIT_RESET_MODE=minute is active. Credits reset every minute (TEST MODE).'
      );
    }
  }, []);

  const remainingLabel = useMemo<string>(() => {
    if (remainingMs < 0) return '';
    const totalSec = Math.ceil(remainingMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    if (h > 0) return `${String(h).padStart(2, '0')}:${mm}:${ss}`;
    return `${mm}:${ss}`;
  }, [remainingMs]);

  const tooltipText = useMemo<string>(() => {
    const base =
      todayEarned >= CREDIT_POLICY.dailyCap
        ? `오늘 획득 ${todayEarned}/${CREDIT_POLICY.dailyCap} · 일일 한도 도달 · 리셋까지 ${remainingLabel}`
        : `오늘 획득 ${todayEarned}/${CREDIT_POLICY.dailyCap} · 리셋까지 ${remainingLabel}`;
    return isMinuteMode ? `${base} · 테스트 모드(1분 리셋)` : base;
  }, [todayEarned, remainingLabel]);

  // const remainingCharges = useMemo<number>(() => {
  //   const left = Math.max(0, CREDIT_POLICY.dailyCap - todayEarned);
  //   return Math.floor(left / CREDIT_POLICY.rewardAmount);
  // }, [todayEarned]);

  const [rewardOpen, setRewardOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6">
        {/* 왼쪽: 로고 */}
        <div className="flex-1 min-w-0">
          <Link href="/" className="flex items-center space-x-2 w-fit">
            <Home className="h-5 w-5" />
            <span className="text-lg font-bold whitespace-nowrap truncate max-w-[110px] sm:max-w-[180px] max-[380px]:hidden">
              {process.env.NEXT_PUBLIC_SITE_NAME}
            </span>
          </Link>
          {/* 좌측에는 모바일 햄버거를 노출하지 않음 (중복 방지) */}
        </div>
        {/* 가운데: PC 메뉴 (lg 이상에서만 노출) */}
        <div className="hidden lg:flex">
          <PcMenuLayout />
        </div>
        {/* 오른쪽: 크레딧 표시 (PC, lg 이상) */}
        <div className="hidden lg:flex flex-1 min-w-0 justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs cursor-default select-none">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Credits</span>
                <span className="tabular-nums font-semibold">
                  {hydrated ? total : '—'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>{tooltipText}</TooltipContent>
          </Tooltip>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="ml-2 h-7 px-2.5 text-xs"
            onClick={() => setRewardOpen(true)}
          >
            <PlayCircle className="h-4 w-4 mr-1" /> 광고 시청
          </Button>
        </div>
        {/* 모바일/태블릿 메뉴 (lg 미만에서 사용) */}
        <div className="lg:hidden ml-auto flex items-center gap-1.5 max-[360px]:gap-1 whitespace-nowrap">
          {/* 우측 햄버거: 항상 표시되도록 shrink 방지 */}
          <div className="shrink-0">
            <MobileMenuLayout />
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-7 px-2 text-xs max-[400px]:px-1.5 max-[340px]:px-1 shrink-0"
            onClick={() => setRewardOpen(true)}
          >
            <PlayCircle className="h-4 w-4 mr-1 max-[340px]:mr-0" />
            <span className="max-[420px]:hidden">시청</span>
          </Button>
          {/* 넓은 모바일(>=sm)에서는 크레딧 배지 노출 */}
          <div className="hidden sm:inline-flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] cursor-default select-none overflow-hidden">
                  <Coins className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="tabular-nums font-semibold shrink-0 ml-0.5">
                    {hydrated ? total : '—'}
                  </span>
                  <span className="inline-flex items-center ml-1 rounded px-1 py-0.5 text-[10px] text-muted-foreground border shrink-0">
                    ↻ {remainingLabel}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>{tooltipText}</TooltipContent>
            </Tooltip>
          </div>
          {/* 좁은 모바일(<sm)에서는 콤팩트 크레딧 수량 + 리셋 타이머를 항상 노출 */}
          <span
            className="sm:hidden inline-flex items-center gap-1 tabular-nums text-[11px] text-muted-foreground shrink-0"
            aria-label={`보유 크레딧 ${
              hydrated ? total : 0
            }, 리셋까지 ${remainingLabel}`}
          >
            <Coins className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-semibold text-foreground">
              {hydrated ? total : '—'}
            </span>
            <span className="opacity-70">·</span>
            <span>↻ {remainingLabel}</span>
          </span>
        </div>
        {rewardOpen && <RewardModalComponent onOpenChange={setRewardOpen} />}
      </div>
    </header>
  );
}

export default HeaderLayout;
