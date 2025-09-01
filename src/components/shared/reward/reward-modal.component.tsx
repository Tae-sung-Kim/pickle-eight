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

const STORAGE_KEY = process.env.NEXT_PUBLIC_SITE_NAME + '_apxConsentHintShown';

export function RewardModalComponent({ onOpenChange }: RewardModalType) {
  const onClose = (): void => onOpenChange(false);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [adMaxHeight, setAdMaxHeight] = useState<number>(0);
  const [showConsentHint, setShowConsentHint] = useState<boolean>(false);

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

  // 최초 1회: 광고 제공사(CMP) 동의 팝업 안내 표기
  useEffect(() => {
    try {
      const seen =
        typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : '1';
      setShowConsentHint(seen !== '1');
    } catch (_) {
      console.error(_, 'Failed to get consent hint shown');
      setShowConsentHint(false);
    }
  }, []);

  const handleDismissConsentHint = (): void => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (_) {
      // ignore storage errors
      console.error(_, 'Failed to set consent hint shown');
    }
    setShowConsentHint(false);
  };

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

        {/* 정보 안내 박스: 광고 재고/심사 상태 */}
        <div className="mt-2 rounded-md border border-blue-300 bg-blue-50 text-blue-900 px-3 py-2 text-xs">
          <p>
            현재 광고 재고가 부족하거나 매체 심사 진행 중인 경우 광고가 표시되지
            않을 수 있습니다. 이 경우 잠시 후 다시 시도해 주세요. 매체 심사 완료
            후에는 정상적으로 광고 시청이 가능합니다.
          </p>
        </div>

        {/* 최초 1회 안내: 광고 제공사 동의 팝업 안내 */}
        {showConsentHint && (
          <div className="mt-2 flex items-start justify-between gap-3 rounded-md border border-gray-300 bg-gray-50 text-gray-800 px-3 py-2 text-xs">
            <p className="leading-relaxed">
              광고 시청 전{' '}
              <span className="font-semibold">
                광고 제공사(파트너) 동의 팝업
              </span>
              이 영어로 한 번 표시될 수 있습니다. 해당 창에서{' '}
              <span className="font-semibold">I Agree</span>를 눌러 주시면
              이후부터는 다시 표시되지 않으며 정상적으로 보상이 지급됩니다.
              언제든지 사이트 하단의 개인정보 처리방침에서 동의를 변경하실 수
              있습니다.
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleDismissConsentHint}
            >
              확인
            </Button>
          </div>
        )}

        <div className="space-y-4 mt-4">
          <ApplixirRewardAdComponent
            maxHeight={adMaxHeight}
            disabled={showConsentHint}
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
