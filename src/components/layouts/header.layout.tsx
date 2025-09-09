'use client';

import Link from 'next/link';
import { Home, Coins } from 'lucide-react';
import { MobileMenuLayout, PcMenuLayout } from '@/components';
import { useCreditStore } from '@/stores';
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
    // Use pure UTC arithmetic to avoid relying on the client's local timezone.
    const ms = base.getTime();
    const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
    const kstNow = new Date(ms + KST_OFFSET_MS);
    const y = kstNow.getUTCFullYear();
    const m = kstNow.getUTCMonth();
    const d = kstNow.getUTCDate();
    // Next day 00:00:00 in KST, expressed in UTC ms
    const nextKstZeroUtcMs = Date.UTC(y, m, d + 1, 0, 0, 0) - KST_OFFSET_MS;
    return nextKstZeroUtcMs;
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
    // Always drive the countdown regardless of hydration to avoid blanks in production.
    const initialNext = calcNextResetTs();
    setNextResetTs(initialNext);
    const tick = (): void => {
      const now = Date.now();
      const target = nextResetTs || initialNext;
      if (now >= target) {
        if (!didResetRef.current) {
          if (hydrated) syncReset();
          didResetRef.current = true;
        }
        const next = calcNextResetTs();
        setNextResetTs(next);
        setRemainingMs(Math.max(0, next - Date.now()));
      } else {
        didResetRef.current = false;
        setRemainingMs(Math.max(0, target - now));
      }
    };
    // Run immediately then every second
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [syncReset, nextResetTs, calcNextResetTs, hydrated]);

  useEffect(() => {
    if (nextResetTs > 0) setRemainingMs(Math.max(0, nextResetTs - Date.now()));
  }, [nextResetTs]);

  useEffect(() => {
    if (isMinuteMode) {
      // Developer-visible warning in console to avoid accidental production usage
      console.warn(
        '[Credits] NEXT_PUBLIC_CREDIT_RESET_MODE=minute is active. Credits reset every minute (TEST MODE).'
      );
    }
  }, []);

  const remainingLabel = useMemo<string>(() => {
    if (remainingMs < 0) return '--:--';
    const totalSec = Math.ceil(remainingMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    if (h > 0) return `${String(h).padStart(2, '0')}:${mm}:${ss}`;
    return `${mm}:${ss}`;
  }, [remainingMs]);

  const todayAvailLabel = useMemo<string>(() => {
    return `오늘 ${todayEarned}/${CREDIT_POLICY.dailyCap}`;
  }, [todayEarned]);

  // TODO(reward-ads): 보상형 광고 모달 오픈 상태 (비활성화)
  // const [rewardOpen, setRewardOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6">
        {/* 왼쪽: 로고 */}
        <div className="flex-1 min-w-0">
          <Link href="/" className="flex items-center space-x-2 w-fit">
            <Home className="h-5 w-5" />
            <span className="text-lg font-bold whitespace-nowrap truncate max-w-[110px] sm:max-w-[180px] max-[560px]:hidden">
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
          <span
            className="inline-flex items-center gap-1 tabular-nums text-[11px] max-[360px]:text-[10px] text-muted-foreground shrink-0"
            aria-label={`보유 크레딧 ${
              hydrated ? total : 0
            }, 리셋까지 ${remainingLabel}`}
            aria-live="polite"
          >
            <Coins className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-foreground">
              {hydrated ? total : '—'}
            </span>
            <span className="opacity-70">·</span>
            <span>↻ {remainingLabel}</span>
            <span className="opacity-70 max-[420px]:hidden">·</span>
            <span className="max-[420px]:hidden">{todayAvailLabel}</span>
          </span>
          {/* TODO(reward-ads): 보상형 광고 버튼 비활성화
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="ml-2 h-7 px-2.5 text-xs"
            onClick={() => setRewardOpen(true)}
          >
            <PlayCircle className="h-4 w-4 mr-1" /> 광고 시청
          </Button>
          */}
        </div>
        {/* 모바일/태블릿 메뉴 (lg 미만에서 사용) */}
        <div className="lg:hidden ml-auto flex items-center gap-1.5 max-[400px]:gap-1 whitespace-nowrap">
          {/* 좁은 모바일(<sm)에서는 콤팩트 크레딧 수량 + 리셋 타이머를 항상 노출 */}
          <span
            className="sm:hidden inline-flex items-center gap-1 tabular-nums text-[11px] max-[380px]:text-[10px] text-muted-foreground shrink-0"
            aria-label={`보유 크레딧 ${
              hydrated ? total : 0
            }, 리셋까지 ${remainingLabel}`}
          >
            <Coins className="h-3.5 w-3.5 max-[360px]:h-3 max-[360px]:w-3 text-amber-500" />
            <span className="font-semibold text-foreground">
              {hydrated ? total : '—'}
            </span>
            <span className="opacity-70">·</span>
            <span>↻ {remainingLabel}</span>
            <span className="opacity-70 max-[480px]:hidden">·</span>
            <span className="max-[480px]:hidden">{todayAvailLabel}</span>
          </span>
          {/* TODO(reward-ads): 보상형 광고 버튼 비활성화
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
          */}
          {/* 우측 햄버거: 항상 표시되도록 shrink 방지 */}
          <div className="shrink-0">
            <MobileMenuLayout />
          </div>
        </div>
        {/* TODO(reward-ads): 보상형 광고 모달 비활성화 */}
        {/* {rewardOpen && <RewardModalComponent onOpenChange={setRewardOpen} />} */}
      </div>
    </header>
  );
}

export default HeaderLayout;
