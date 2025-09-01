'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreditStore } from '@/stores';
import { CREDIT_POLICY } from '@/constants';
import { toast } from 'sonner';

declare global {
  interface Window {
    initializeAndOpenPlayer?: (options: {
      apiKey: string;
      injectionElementId: string;
      adStatusCallbackFn: (status: { type: string }) => void;
      adErrorCallbackFn: (error: {
        getError: () => { data: { type: string }; errorMessage: string };
      }) => void;
    }) => void;
  }
}

export type ApplixirRewardAdType = {
  readonly onAdCompleted?: () => void;
  readonly onAdError?: (error: string) => void;
};

export function ApplixirRewardAdComponent({
  onAdCompleted,
  onAdError,
}: ApplixirRewardAdType) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [adStatus, setAdStatus] = useState<string>('');
  const { onEarn, todayEarned, lastEarnedAt } = useCreditStore();

  // Cooldown 계산
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

  const inCooldown = cooldownMsLeft > 0;
  const reachedDailyCap = todayEarned >= CREDIT_POLICY.dailyCap;
  const canWatchAd = !inCooldown && !reachedDailyCap;

  const cooldownLabel = (): string => {
    const totalSec = Math.ceil(cooldownMsLeft / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m${s}s`;
  };

  const handleAdStatusCallback = (status: { type: string }): void => {
    console.log('Applixir Ad Status:', status.type);
    setAdStatus(status.type);

    switch (status.type) {
      case 'ad-started':
        toast.info('광고가 시작되었습니다.');
        break;
      case 'complete':
      case 'ad-watched':
        // 광고 시청 완료 시 크레딧 지급
        const result = onEarn();
        if (result.canEarn) {
          toast.success(`크레딧 ${CREDIT_POLICY.rewardAmount}개를 받았습니다!`);
          onAdCompleted?.();
        } else {
          toast.error('크레딧 지급에 실패했습니다.');
        }
        setIsLoading(false);
        break;
      case 'ad-interrupted':
        toast.warning('광고가 중단되었습니다.');
        setIsLoading(false);
        break;
      case 'fb-started':
        toast.info('대체 광고가 시작되었습니다.');
        break;
      case 'fb-watched':
        // 대체 광고도 보상 지급
        const fbResult = onEarn();
        if (fbResult.canEarn) {
          toast.success(`크레딧 ${CREDIT_POLICY.rewardAmount}개를 받았습니다!`);
          onAdCompleted?.();
        }
        setIsLoading(false);
        break;
      default:
        break;
    }
  };

  const handleAdErrorCallback = (error: {
    getError: () => { data: { type: string }; errorMessage: string };
  }): void => {
    const errorInfo = error.getError();
    console.error('Applixir Ad Error:', errorInfo);

    let errorMessage = '광고 로딩 중 오류가 발생했습니다.';

    switch (errorInfo.data.type) {
      case 'adsRequestNetworkError':
        errorMessage = '네트워크 오류로 광고를 불러올 수 없습니다.';
        break;
      case 'consentManagementProviderNotReady':
        errorMessage = '광고 동의 설정이 준비되지 않았습니다.';
        break;
      case 'ads-unavailable':
        errorMessage = '현재 시청 가능한 광고가 없습니다.';
        break;
      default:
        errorMessage = errorInfo.errorMessage || errorMessage;
        break;
    }

    toast.error(errorMessage);
    onAdError?.(errorMessage);
    setIsLoading(false);
  };

  const handleWatchAd = (): void => {
    if (!canWatchAd) return;
    if (!process.env.NEXT_PUBLIC_APPLIXIR_API_KEY) {
      toast.error('Applixir API 키가 설정되지 않았습니다.');
      return;
    }

    setIsLoading(true);
    setAdStatus('loading');

    // Applixir 광고 초기화 및 실행
    if (window.initializeAndOpenPlayer) {
      try {
        const anonymousId = getAnonymousId();
        window.initializeAndOpenPlayer({
          apiKey: process.env.NEXT_PUBLIC_APPLIXIR_API_KEY,
          injectionElementId: 'applixir-ad-container',
          adStatusCallbackFn: handleAdStatusCallback,
          adErrorCallbackFn: handleAdErrorCallback,
          // SDK가 지원할 경우 커스텀 식별자 전달 (지원하지 않으면 무시됨)
          // @ts-expect-error: 외부 SDK 확장 필드 가능성
          adOptions: {
            customId: anonymousId,
          },
        });
      } catch (error) {
        console.error('Applixir initialization error:', error);
        toast.error('광고 초기화에 실패했습니다.');
        setIsLoading(false);
      }
    } else {
      toast.error('Applixir 스크립트가 로드되지 않았습니다.');
      setIsLoading(false);
    }
  };

  // 브라우저별 익명 ID (localStorage에 영구 저장)
  const getAnonymousId = (): string => {
    try {
      const key = 'AID';
      const existing = localStorage.getItem(key);
      if (existing) return existing;
      // 16바이트 랜덤(hex 32자리)
      const buf =
        typeof window !== 'undefined' && window.crypto?.getRandomValues
          ? (() => {
              const a = new Uint8Array(16);
              window.crypto.getRandomValues(a);
              return Array.from(a)
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');
            })()
          : (() => {
              // 폴백: Math.random 기반(보안 강도 낮음)
              let s = '';
              for (let i = 0; i < 16; i++) {
                s += Math.floor(Math.random() * 256)
                  .toString(16)
                  .padStart(2, '0');
              }
              return s;
            })();
      localStorage.setItem(key, buf);
      return buf;
    } catch {
      // 실패 시 타임스탬프 폴백
      return `aid_${Date.now()}`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Applixir 광고 컨테이너 */}
      <div
        id="applixir-ad-container"
        ref={containerRef}
        className="min-h-[200px]"
      />

      {/* 상태 표시 */}
      {adStatus && (
        <div className="text-sm text-muted-foreground text-center">
          상태: {adStatus}
        </div>
      )}

      {/* 광고 시청 버튼 */}
      <div className="flex justify-center">
        <Button
          onClick={handleWatchAd}
          disabled={!canWatchAd || isLoading}
          className="min-w-[200px]"
        >
          {isLoading
            ? '광고 로딩 중...'
            : reachedDailyCap
            ? '오늘 시청 한도 도달'
            : inCooldown
            ? `쿨다운 ${cooldownLabel()}`
            : `광고 보고 크레딧 받기 (+${CREDIT_POLICY.rewardAmount})`}
        </Button>
      </div>

      {/* 안내 메시지 */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>
          광고 시청 완료 시 크레딧 {CREDIT_POLICY.rewardAmount}개가 지급됩니다.
        </p>
        <p>
          하루 최대{' '}
          {Math.floor(CREDIT_POLICY.dailyCap / CREDIT_POLICY.rewardAmount)}
          회까지 시청 가능합니다.
        </p>
      </div>
    </div>
  );
}

export default ApplixirRewardAdComponent;
