'use client';

import React, { useMemo, useRef } from 'react';
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
  const { earn } = useCreditStore();

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

  const onClose = (): void => onOpenChange(false);

  const onClaim = (): void => {
    const res = earn();
    if (res.canEarn) onOpenChange(false);
  };

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
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              ref={containerRef}
              className="flex min-h-[260px] items-center justify-center"
            >
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
            <Button type="button" onClick={onClaim} disabled={!isCompleted}>
              크레딧 받기 (+{CREDIT_POLICY.rewardAmount})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RewardModalComponent;
