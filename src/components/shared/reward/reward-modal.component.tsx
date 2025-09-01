'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ApplixirRewardAdComponent } from './applixir-reward-ad.component';

export type RewardModalType = {
  readonly onOpenChange: (v: boolean) => void;
};

export function RewardModalComponent({ onOpenChange }: RewardModalType) {
  const onClose = (): void => onOpenChange(false);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [adMaxHeight, setAdMaxHeight] = useState<number>(0);

  useEffect(() => {
    const calc = (): void => {
      const viewportCap = Math.floor(window.innerHeight * 0.9); // 90vh 상한
      const headerH = headerRef.current?.offsetHeight ?? 0;
      const actionsH = actionsRef.current?.offsetHeight ?? 0;
      // 모달 내부 여백(상하 margin/padding) 보정치
      const padding = 24; // 대략치
      const available = Math.max(
        200,
        viewportCap - headerH - actionsH - padding
      );
      setAdMaxHeight(available);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const handleAdCompleted = (): void => {
    onOpenChange(false);
  };

  const handleAdError = (error: string): void => {
    console.error('Reward ad error:', error);
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        className="sm:max-w-3xl max-h-[90vh] overflow-auto"
        showCloseButton={false}
      >
        <DialogHeader
          ref={headerRef as unknown as React.RefObject<HTMLDivElement>}
        >
          <DialogTitle>광고 보기로 크레딧 받기</DialogTitle>
          <DialogDescription>
            광고를 끝까지 시청하시면 크레딧이 지급됩니다.
          </DialogDescription>
        </DialogHeader>

        {/* 강조 안내 박스: 스킵 시 미지급 경고 */}
        <div className="mt-2 rounded-md border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2 text-sm">
          <p>
            <span className="font-semibold">중요</span> — 광고를{' '}
            <span className="font-semibold">끝까지 시청</span>해야 보상이
            지급됩니다. 스킵하거나 중단하면 보상이 지급되지 않습니다.
          </p>
        </div>

        <div className="space-y-4 mt-4">
          <ApplixirRewardAdComponent
            maxHeight={adMaxHeight}
            onAdCompleted={handleAdCompleted}
            onAdError={handleAdError}
          />

          {/* 액션 영역 */}
          <div ref={actionsRef} className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RewardModalComponent;
