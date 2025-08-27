'use client';

import React, { useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdFitSlotComponent } from '@/components';
import { useCreditStore } from '@/stores';
import { CREDIT_POLICY } from '@/constants';
import { useRewardVisibility } from '@/hooks';

export type RewardModalType = {
  readonly open: boolean;
  readonly onOpenChange: (v: boolean) => void;
};

export function RewardModalComponent({ open, onOpenChange }: RewardModalType) {
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

  const onClose = (): void => onOpenChange(false);

  const onClaim = (): void => {
    const res = earn();
    if (res.canEarn) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>광고 보기로 크레딧 받기</DialogTitle>
        </DialogHeader>
        <div ref={containerRef} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            광고 영역이 화면에 충분히 보여지는 동안 타이머가 진행됩니다.
            완료되면 크레딧이 지급됩니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AdFitSlotComponent width={250} height={250} />
            <AdFitSlotComponent width={250} height={250} />
          </div>
          <div className="text-sm">남은 시간: {remain}s</div>
          <div className="flex justify-end gap-2">
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
