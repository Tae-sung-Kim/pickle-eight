'use client';

import React from 'react';
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

  const handleAdCompleted = (): void => {
    // 광고 시청 완료 후 모달 닫기
    onOpenChange(false);
  };

  const handleAdError = (error: string): void => {
    console.error('Reward ad error:', error);
    // 에러 발생 시에도 모달은 열어둠 (사용자가 다시 시도할 수 있도록)
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
          광고를 끝까지 시청하시면 크레딧이 지급됩니다.
        </DialogDescription>

        <div className="space-y-4 mt-4">
          <ApplixirRewardAdComponent
            onAdCompleted={handleAdCompleted}
            onAdError={handleAdError}
          />

          {/* 액션 영역 */}
          <div className="flex justify-end gap-2 pt-2">
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
