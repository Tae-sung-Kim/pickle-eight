'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreditStore } from '@/stores';
import { CREDIT_POLICY } from '@/constants';
import { toast } from 'sonner';
import { useConsentContext } from '@/providers';

export type ApplixirRewardAdType = {
  readonly onAdCompleted?: () => void;
  readonly onAdError?: (error: string) => void;
  readonly maxHeight?: number; // modal이 계산한 가용 높이 전달(선택)
};

export function ApplixirRewardAdComponent({
  onAdCompleted,
  onAdError,
  maxHeight,
}: ApplixirRewardAdType) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [adStatus, setAdStatus] = useState<string>('');
  const [containerKey, setContainerKey] = useState<number>(0); // 스킵/중단 후 강제 리셋용
  const { onEarn, todayEarned, lastEarnedAt } = useCreditStore();
  const { state } = useConsentContext();

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

  const resetPlayer = (): void => {
    // 컨테이너를 강제로 재생성하여 SDK 내부 상태를 초기화
    setContainerKey((k) => k + 1);
    setAdStatus('');
    setIsLoading(false);
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
      case 'ad-skipped':
        toast.info('광고가 스킵되었습니다. 크레딧은 지급되지 않습니다.');
        resetPlayer();
        break;
      case 'ad-interrupted':
        toast.warning('광고가 중단되었습니다. 다시 시도할 수 있습니다.');
        resetPlayer();
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
    resetPlayer();
  };

  const ensureApplixirLoaded = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    if (window.initializeAndOpenPlayer) return;
    await new Promise<void>((resolve, reject) => {
      const id = 'applixir-sdk-script';
      const existing = document.getElementById(id) as HTMLScriptElement | null;
      if (existing && typeof window.initializeAndOpenPlayer === 'function') {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.id = id;
      s.src = 'https://cdn.applixir.com/applixir.app.v6.0.1.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Applixir SDK'));
      document.body.appendChild(s);
    });
  };

  const handleWatchAd = async (): Promise<void> => {
    if (!canWatchAd) return;
    if (state !== 'accepted') {
      toast.info('광고/쿠키 동의 후 이용할 수 있습니다.');
      return;
    }
    if (!process.env.NEXT_PUBLIC_APPLIXIR_API_KEY) {
      toast.error('Applixir API 키가 설정되지 않았습니다.');
      return;
    }

    setIsLoading(true);
    setAdStatus('loading');

    try {
      await ensureApplixirLoaded();
      if (!window.initializeAndOpenPlayer) {
        throw new Error('SDK not initialized');
      }
      const anonymousId = getAnonymousId();
      window.initializeAndOpenPlayer({
        apiKey: process.env.NEXT_PUBLIC_APPLIXIR_API_KEY,
        injectionElementId: 'applixir-ad-container',
        adStatusCallbackFn: handleAdStatusCallback,
        adErrorCallbackFn: handleAdErrorCallback,
        // customId에 시도 카운터를 추가하여 세션 캐싱/중복 문제 방지
        adOptions: { customId: `${anonymousId}:${containerKey}` },
      });
    } catch (e) {
      console.error('Applixir dynamic load/init error:', e);
      toast.error('광고 SDK 로드에 실패했습니다.');
      resetPlayer();
    }
  };

  const getAnonymousId = (): string => {
    try {
      const key = 'AID';
      const existing = localStorage.getItem(key);
      if (existing) return existing;
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
      return `aid_${Date.now()}`;
    }
  };

  // 래퍼 박스를 사용해 16:9 유지 + 가용 높이 내에 맞춤(최대 90vh)
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth;
      const hByWidth = (w * 9) / 16;
      const capByViewport = Math.floor(window.innerHeight * 0.9);
      const cap = Math.min(capByViewport, maxHeight ?? capByViewport);
      const h = Math.max(200, Math.min(hByWidth, cap));
      el.style.height = `${h}px`;
    };
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener('resize', apply);
    apply();
    return () => {
      window.removeEventListener('resize', apply);
      ro.disconnect();
    };
  }, [maxHeight]);

  return (
    <div className="space-y-4">
      {/* 비율 박스: 내부 미디어는 contain으로 표시되어 잘리지 않음 */}
      <div
        ref={wrapperRef}
        className="relative w-full bg-black rounded-md overflow-hidden"
      >
        <div
          key={containerKey}
          id="applixir-ad-container"
          ref={containerRef}
          className="absolute inset-0"
        />
      </div>

      {/* 주입되는 비디오/캔버스/iframe이 부모 크기를 채우고 잘리지 않도록 강제 */}
      <style jsx global>{`
        #applixir-ad-container,
        #applixir-ad-container * {
          max-width: 100% !important;
        }
        #applixir-ad-container video,
        #applixir-ad-container canvas,
        #applixir-ad-container iframe {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
      `}</style>

      {adStatus && (
        <div className="text-sm text-muted-foreground text-center">
          상태: {adStatus}
        </div>
      )}

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
