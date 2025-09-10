'use client';

import Link from 'next/link';
import { Home, Coins } from 'lucide-react';
import { MobileMenuLayout, PcMenuLayout } from '@/components';
import { useCreditStore } from '@/stores';
import {
  CREDIT_POLICY,
  CREDIT_REFILL_INTERVAL_MS,
  CREDIT_RESET_MODE,
  CREDIT_RESET_MODE_ENUM,
} from '@/constants';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { scheduleIdle, cancelIdle } from '@/lib';
import { useUserCreditsQuery } from '@/queries';

export function HeaderLayout() {
  const { total, hydrated, markHydrated, setServerSync } = useCreditStore();

  // Initial server sync (prevents baseDaily flicker on reload)
  const { data: userCredits, isSuccess } = useUserCreditsQuery();
  useEffect(() => {
    if (!userCredits) return;
    if (typeof userCredits.credits === 'number') {
      setServerSync({
        credits: userCredits.credits,
        lastRefillAt: userCredits.lastRefillAt,
        refillArmed: userCredits.refillArmed,
      });
    }
  }, [userCredits, setServerSync]);

  useEffect(() => {
    if (!hydrated) {
      const idleId = scheduleIdle(() => markHydrated());
      return () => {
        cancelIdle(idleId);
      };
    }
  }, [hydrated, markHydrated]);

  const nextKstMidnight = (base: Date): number => {
    const ms = base.getTime();
    const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
    const kstNow = new Date(ms + KST_OFFSET_MS);
    const y = kstNow.getUTCFullYear();
    const m = kstNow.getUTCMonth();
    const d = kstNow.getUTCDate();
    const nextKstZeroUtcMs = Date.UTC(y, m, d + 1, 0, 0, 0) - KST_OFFSET_MS;
    return nextKstZeroUtcMs;
  };

  const calcNextResetTs = useCallback(() => {
    const now = new Date();
    if (CREDIT_RESET_MODE === CREDIT_RESET_MODE_ENUM.MINUTE) {
      const d = new Date(now);
      d.setSeconds(0, 0);
      d.setMinutes(d.getMinutes() + 1);
      return d.getTime();
    }
    return nextKstMidnight(now);
  }, []);

  // states
  const [nextResetTs, setNextResetTs] = useState<number>(0);
  const [remainingMs, setRemainingMs] = useState<number>(-1);
  const [refillRemainingMs, setRefillRemainingMs] = useState<number>(
    CREDIT_REFILL_INTERVAL_MS > 0 ? -1 : 0
  );

  // refs
  const didResetRef = useRef<boolean>(false);
  const nextResetRef = useRef<number>(0);
  const prevRemainingRef = useRef<number>(-2);
  const prevRefillRemainingRef = useRef<number>(-2);

  useEffect(() => {
    // init once
    const initialNextReset = calcNextResetTs();
    setNextResetTs(initialNextReset);

    const tick = (): void => {
      const now = Date.now();
      const state = useCreditStore.getState();
      const doSync = state.syncReset;

      // Reset countdown
      const resetTarget = nextResetRef.current || initialNextReset;
      if (nextResetRef.current === 0) nextResetRef.current = initialNextReset;
      if (now >= resetTarget) {
        if (!didResetRef.current) {
          if (state.hydrated) doSync();
          didResetRef.current = true;
        }
        const next = calcNextResetTs();
        nextResetRef.current = next;
        setNextResetTs(next);
        const newRemain = Math.max(0, next - Date.now());
        if (prevRemainingRef.current !== newRemain) {
          prevRemainingRef.current = newRemain;
          setRemainingMs(newRemain);
        }
      } else {
        didResetRef.current = false;
        const newRemain = Math.max(0, resetTarget - now);
        if (prevRemainingRef.current !== newRemain) {
          prevRemainingRef.current = newRemain;
          setRemainingMs(newRemain);
        }
      }

      // Refill countdown: 소비 이후(refillArmed) + 상한 미만 + 활성 인터벌인 경우에만 동작
      const atCap = state.total >= CREDIT_POLICY.dailyCap;
      const refillDisabled = CREDIT_REFILL_INTERVAL_MS <= 0;
      const notArmed = !state.refillArmed;
      if (refillDisabled || atCap || notArmed) {
        // 고정 정지
        if (prevRefillRemainingRef.current !== 0) {
          prevRefillRemainingRef.current = 0;
          setRefillRemainingMs(0);
        }
        return;
      }

      // lastRefillAt 기반 목표 시각: 소비(now)로 armed 된 순간부터 정확히 interval 후
      const base =
        typeof state.lastRefillAt === 'number' && state.lastRefillAt > 0
          ? state.lastRefillAt
          : now; // 안전장치(이상치) – 첫 틱에는 full interval
      const target = base + CREDIT_REFILL_INTERVAL_MS;

      if (now >= target) {
        // 경계 도달: 실제 리필 수행 후 다음 주기 준비
        if (state.hydrated) doSync();
        const nextBase = target; // 정확히 경계에 정렬
        const nextRemain = Math.max(
          0,
          nextBase + CREDIT_REFILL_INTERVAL_MS - now
        );
        if (prevRefillRemainingRef.current !== nextRemain) {
          prevRefillRemainingRef.current = nextRemain;
          setRefillRemainingMs(nextRemain);
        }
      } else {
        const remain = Math.max(0, target - now);
        if (prevRefillRemainingRef.current !== remain) {
          prevRefillRemainingRef.current = remain;
          setRefillRemainingMs(remain);
        }
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // 단 한 번만 등록: 내부에서 getState로 최신값 반영
  }, [calcNextResetTs]);

  useEffect(() => {
    if (nextResetTs > 0) setRemainingMs(Math.max(0, nextResetTs - Date.now()));
  }, [nextResetTs]);

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

  const refillLabel = useMemo<string>(() => {
    if (CREDIT_REFILL_INTERVAL_MS <= 0) return '—';
    if (refillRemainingMs < 0) return '--:--';
    if (refillRemainingMs === 0) return '—';
    const totalSec = Math.ceil(refillRemainingMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    if (h > 0) return `${String(h).padStart(2, '0')}:${mm}:${ss}`;
    return `${mm}:${ss}`;
  }, [refillRemainingMs]);

  const showTotalNow = hydrated && isSuccess; // 서버 동기화 전에는 대시 유지

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
              showTotalNow ? total : 0
            }, 리셋까지 ${remainingLabel}, 충전까지 ${refillLabel}`}
            aria-live="polite"
          >
            <Coins className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-foreground">
              {showTotalNow ? total : '—'}
            </span>
            <span className="opacity-70">·</span>
            <span>↻ {remainingLabel}</span>
            <span className="opacity-70">·</span>
            <span>+1 {refillLabel}</span>
          </span>
        </div>
        {/* 모바일/태블릿 메뉴 (lg 미만에서 사용) */}
        <div className="lg:hidden ml-auto flex items-center gap-1.5 max-[400px]:gap-1 whitespace-nowrap">
          {/* 좁은 모바일(<sm)에서는 콤팩트 크레딧 수량 + 리셋 타이머를 항상 노출 */}
          <span
            className="inline-flex items-center gap-1 tabular-nums text-[11px] max-[380px]:text-[10px] text-muted-foreground shrink-0"
            aria-label={`보유 크레딧 ${
              showTotalNow ? total : 0
            }, 리셋까지 ${remainingLabel}, 충전까지 ${refillLabel}`}
            aria-live="polite"
          >
            <Coins className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-foreground">
              {showTotalNow ? total : '—'}
            </span>
            <span className="opacity-70">·</span>
            <span>↻ {remainingLabel}</span>
            <span className="opacity-70">·</span>
            <span>+1 {refillLabel}</span>
          </span>

          {/* 우측 햄버거: 항상 표시되도록 shrink 방지 */}
          <div className="shrink-0">
            <MobileMenuLayout />
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeaderLayout;
