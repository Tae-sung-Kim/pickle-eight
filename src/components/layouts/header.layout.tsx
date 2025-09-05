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

export function HeaderLayout() {
  const { total, todayEarned, syncReset } = useCreditStore();
  // Normalize env to enum VALUE union ('midnight' | 'minute')
  const envMode = (
    process.env.NEXT_PUBLIC_CREDIT_RESET_MODE || ''
  ).toLowerCase();
  const resetMode: CreditResetModeType =
    envMode === CREDIT_RESET_MODE_ENUM.MINUTE
      ? CREDIT_RESET_MODE_ENUM.MINUTE
      : CREDIT_RESET_MODE_ENUM.MIDNIGHT;
  const isMinuteMode = resetMode === CREDIT_RESET_MODE_ENUM.MINUTE;

  const calcNextResetTs = useCallback(() => {
    const now = new Date();
    if (resetMode === CREDIT_RESET_MODE_ENUM.MINUTE) {
      const d = new Date(now);
      d.setSeconds(0, 0);
      d.setMinutes(d.getMinutes() + 1);
      return d.getTime();
    }
    const d = new Date(now);
    d.setHours(24, 0, 0, 0);
    return d.getTime();
  }, [resetMode]);

  // Keep moving threshold in state; initialize after mount to avoid SSR mismatch
  const [nextResetTs, setNextResetTs] = useState<number>(0);

  const [remainingMs, setRemainingMs] = useState<number>(-1);

  const didResetRef = useRef<boolean>(false);

  useEffect(() => {
    // initialize threshold when mode changes
    const initialNext = calcNextResetTs();
    setNextResetTs(initialNext);
    const tick = (): void => {
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
  }, [resetMode, syncReset, nextResetTs, calcNextResetTs]);

  useEffect(() => {
    if (isMinuteMode) {
      // Developer-visible warning in console to avoid accidental production usage
      console.warn(
        '[Credits] NEXT_PUBLIC_CREDIT_RESET_MODE=minute is active. Credits reset every minute (TEST MODE).'
      );
    }
  }, [isMinuteMode]);

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
  }, [todayEarned, remainingLabel, isMinuteMode]);

  const remainingCharges = useMemo<number>(() => {
    const left = Math.max(0, CREDIT_POLICY.dailyCap - todayEarned);
    return Math.floor(left / CREDIT_POLICY.rewardAmount);
  }, [todayEarned]);

  const [rewardOpen, setRewardOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6">
        {/* 왼쪽: 로고 */}
        <div className="flex-1 min-w-0">
          <Link href="/" className="flex items-center space-x-2 w-fit">
            <Home className="h-5 w-5" />
            <span className="text-lg font-bold whitespace-nowrap">
              {process.env.NEXT_PUBLIC_SITE_NAME}
            </span>
          </Link>
        </div>
        {/* 가운데: PC 메뉴 */}
        <div className="hidden md:flex">
          <PcMenuLayout />
        </div>
        {/* 오른쪽: 크레딧 표시 (PC) */}
        <div className="hidden md:flex flex-1 min-w-0 justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs cursor-default select-none">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Credits</span>
                <span className="tabular-nums font-semibold">{total}</span>
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
        {/* 모바일 메뉴 */}
        <div className="md:hidden flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs cursor-default select-none">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="tabular-nums font-semibold">{total}</span>
                {/* 남은 충전 횟수 (모바일 표시) */}
                <span className="ml-1 rounded px-1 py-0.5 text-[10px] text-muted-foreground border">
                  시청 가능 횟수 {remainingCharges}회
                </span>
                <span className="ml-1 rounded px-1 py-0.5 text-[10px] text-muted-foreground border">
                  ↻ {remainingLabel}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>{tooltipText}</TooltipContent>
          </Tooltip>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-7 px-2.5 text-xs"
            onClick={() => setRewardOpen(true)}
          >
            <PlayCircle className="h-4 w-4 mr-1" /> 시청
          </Button>
          <MobileMenuLayout />
        </div>
        {rewardOpen && <RewardModalComponent onOpenChange={setRewardOpen} />}
      </div>
    </header>
  );
}

export default HeaderLayout;
