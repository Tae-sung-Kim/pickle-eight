'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdFitSlotComponent } from '@/components';
import { useCreditStore } from '@/stores';
import { CREDIT_POLICY } from '@/constants';
import { useRewardVisibility } from '@/hooks';

export type RewardModalType = {
  readonly onOpenChange: (v: boolean) => void;
};

export function RewardModalComponent({ onOpenChange }: RewardModalType) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { onEarn, lastEarnedAt, todayEarned } = useCreditStore();

  const { visibleSeconds, isCompleted } = useRewardVisibility(
    containerRef,
    CREDIT_POLICY.visibleSecondsRequired,
    { requiredRatio: CREDIT_POLICY.visibleRatioRequired }
  );

  const remain = useMemo<number>(
    () =>
      Math.max(
        0,
        Math.ceil(CREDIT_POLICY.visibleSecondsRequired - visibleSeconds)
      ),
    [visibleSeconds]
  );

  const progress = useMemo<number>(() => {
    const ratio = visibleSeconds / CREDIT_POLICY.visibleSecondsRequired;
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  }, [visibleSeconds]);

  // cooldown & cap
  const [cooldownMsLeft, setCooldownMsLeft] = useState<number>(0);
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
  const reachedDailyCap = todayEarned >= CREDIT_POLICY.dailyCap;

  const onClose = (): void => onOpenChange(false);

  const onClaim = (): void => {
    const res = onEarn();
    if (res.canEarn) onOpenChange(false);
  };

  const claimDisabled = useMemo<boolean>(() => {
    if (reachedDailyCap) return true;
    if (inCooldown) return true;
    return !isCompleted;
  }, [reachedDailyCap, inCooldown, isCompleted]);

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[80vh] overflow-auto"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>광고 보기로 크레딧 받기</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          광고 영역이 화면에 충분히 보이는 동안 타이머가 진행됩니다. 완료되면
          크레딧이 지급됩니다.
        </DialogDescription>

        {/* 쿨다운/캡 경고 */}
        {(inCooldown || reachedDailyCap) && (
          <div
            className="mt-2 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-yellow-900"
            role="status"
            aria-live="polite"
          >
            {reachedDailyCap
              ? '오늘 시청 한도에 도달했습니다.'
              : `쿨다운 중입니다. ${cooldownLabel} 후 다시 시도해주세요.`}
          </div>
        )}

        <div className="space-y-4 mt-2">
          <div
            ref={containerRef}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="flex min-h-[260px] items-center justify-center">
              <AdFitSlotComponent />
            </div>
            <div className="flex min-h-[260px] items-center justify-center">
              <AdFitSlotComponent />
            </div>
          </div>

          {/* 진행 상태 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">진행률</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progress}%` }}
                aria-hidden
              />
            </div>
            <div className="text-sm text-muted-foreground" aria-live="polite">
              남은 시간: {remain}s
            </div>
          </div>

          {/* 액션 영역 */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              닫기
            </Button>
            <Button type="button" onClick={onClaim} disabled={claimDisabled}>
              {reachedDailyCap
                ? '오늘 한도 도달'
                : inCooldown
                ? `쿨다운 ${cooldownLabel}`
                : `크레딧 받기 (+${CREDIT_POLICY.rewardAmount})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RewardModalComponent;
