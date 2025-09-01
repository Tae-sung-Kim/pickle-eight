'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreditStore } from '@/stores';
import { CREDIT_POLICY } from '@/constants';
import { toast } from 'sonner';
import { useConsentContext } from '@/providers';
import {
  ApplixirRewardAdType,
  CreditAdErrorType,
  CreditAdStatusType,
} from '@/types';
import {
  useAdEventMutation,
  useStartAdSessionMutation,
  useCompleteAdSessionMutation,
} from '@/queries';

// Constants to avoid magic numbers
const ASPECT_WIDTH: number = 16;
const ASPECT_HEIGHT: number = 9;
const VIEWPORT_HEIGHT_RATIO: number = 0.9;
const MIN_WRAPPER_HEIGHT: number = 200;
const CLOSE_WITHOUT_REWARD_MS: number = 60_000; // 60s after which we allow closing without reward

/**
 * Applixir 보상형 광고 컴포넌트
 * - 동의 상태 확인 후 광고 재생
 * - 시청 완료 시 서버 검증을 통해 크레딧 지급
 * - 스킵/중단 시 안전한 리셋 처리
 */
export function ApplixirRewardAdComponent({
  onAdCompleted,
  onAdError,
  maxHeight,
}: ApplixirRewardAdType) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [containerKey, setContainerKey] = useState<number>(0); // 스킵/중단 후 강제 리셋용
  const observerRef = useRef<MutationObserver | null>(null);
  const serverTokenRef = useRef<string | null>(null);
  const adStartTimeRef = useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const { onEarn, todayEarned, lastEarnedAt } = useCreditStore();
  const { state } = useConsentContext();
  const adEvent = useAdEventMutation();
  const startAd = useStartAdSessionMutation();
  const completeAd = useCompleteAdSessionMutation();

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
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    setContainerKey((k) => k + 1);
    setIsLoading(false);
    serverTokenRef.current = null;
    adStartTimeRef.current = null;
    setElapsedMs(0);
  };

  const startContainerObserver = (): void => {
    if (!containerRef.current || observerRef.current) return;
    observerRef.current = new MutationObserver(() => {
      const hasChild = !!containerRef.current?.firstChild;
      if (!hasChild && isLoading) resetPlayer();
    });
    observerRef.current.observe(containerRef.current, {
      childList: true,
      subtree: false,
    });
  };

  // Track elapsed time while ad is running
  useEffect(() => {
    if (!isLoading || adStartTimeRef.current === null) return;
    const tick = (): void => {
      if (adStartTimeRef.current !== null) {
        setElapsedMs(Date.now() - adStartTimeRef.current);
      }
    };
    const id = setInterval(tick, 250);
    tick();
    return () => clearInterval(id);
  }, [isLoading]);

  const handleAdStatusCallback = async (status: {
    type: CreditAdStatusType;
  }): Promise<void> => {
    console.log('Applixir Ad Status:', status.type);
    const aid = getAnonymousId();
    void adEvent.mutateAsync({
      kind: 'status',
      status: status.type,
      aid,
      cid: String(containerKey),
      watchedMs:
        adStartTimeRef.current !== null
          ? Date.now() - adStartTimeRef.current
          : 0,
    });

    switch (status.type) {
      case 'loaded':
        break;
      case 'start':
      case 'ad-started':
        toast.info('광고가 시작되었습니다.');
        adStartTimeRef.current = Date.now();
        break;
      case 'complete':
      case 'ad-watched':
      case 'fb-watched': {
        // 서버 검증 요청
        const token = serverTokenRef.current;
        if (!token) {
          toast.error('검증 토큰이 없습니다. 다시 시도해주세요.');
          resetPlayer();
          break;
        }
        try {
          await completeAd.mutateAsync({ token });
        } catch (err: unknown) {
          const reason: string =
            err instanceof Error ? err.message : 'verification_failed';
          toast.error('크레딧 지급이 거절되었습니다.');
          void adEvent.mutateAsync({
            kind: 'complete_denied',
            reason,
            aid,
            cid: String(containerKey),
            watchedMs:
              adStartTimeRef.current !== null
                ? Date.now() - adStartTimeRef.current
                : 0,
          });
          return;
        }
        // 로컬 스토어도 동기화(서버가 승인했을 때만)
        const result = onEarn();
        if (result.canEarn) {
          toast.success(`크레딧 ${CREDIT_POLICY.rewardAmount}개를 받았습니다!`);
          onAdCompleted?.();
          void adEvent.mutateAsync({
            kind: 'complete_granted',
            aid,
            cid: String(containerKey),
            watchedMs:
              adStartTimeRef.current !== null
                ? Date.now() - adStartTimeRef.current
                : 0,
          });
        }
        break;
      }
      case 'skip':
      case 'ad-skipped':
        toast.info('광고가 스킵되었습니다. 크레딧은 지급되지 않습니다.');
        void adEvent.mutateAsync({
          kind: 'skipped',
          aid,
          cid: String(containerKey),
          watchedMs:
            adStartTimeRef.current !== null
              ? Date.now() - adStartTimeRef.current
              : 0,
        });
        resetPlayer();
        break;
      case 'ad-interrupted':
        toast.warning('광고가 중단되었습니다. 다시 시도할 수 있습니다.');
        void adEvent.mutateAsync({
          kind: 'interrupted',
          aid,
          cid: String(containerKey),
          watchedMs:
            adStartTimeRef.current !== null
              ? Date.now() - adStartTimeRef.current
              : 0,
        });
        resetPlayer();
        break;
      case 'fb-started':
        toast.info('대체 광고가 시작되었습니다.');
        break;
      case 'allAdsCompleted':
      case 'thankYouModalClosed':
        if (isLoading) resetPlayer();
        break;
      default:
        break;
    }
  };

  const handleAdErrorCallback = (error: {
    getError: () => { data: { type: CreditAdErrorType }; errorMessage: string };
  }): void => {
    const errorInfo = error.getError();
    console.error('Applixir Ad Error:', errorInfo);
    void adEvent.mutateAsync({
      kind: 'error',
      error: errorInfo,
      cid: String(containerKey),
      aid: getAnonymousId(),
    });

    let errorMessage = '광고 로딩 중 오류가 발생했습니다.';
    // Heuristic mapping for common IMA/Applixir messages
    const rawMsg = (errorInfo.errorMessage || '').toLowerCase();
    if (/no ads|vast/.test(rawMsg)) {
      errorMessage =
        '현재 시청 가능한 광고가 없습니다. 잠시 후 다시 시도해 주세요.';
    } else if (/media review|site not approved|approval pending/.test(rawMsg)) {
      errorMessage =
        '매체 심사 진행 중입니다. 승인 완료 후 광고 시청이 가능합니다.';
    }
    switch (errorInfo.data.type) {
      case 'adsRequestNetworkError':
        errorMessage = '네트워크 오류로 광고를 불러올 수 없습니다.';
        break;
      case 'consentManagementProviderNotReady':
        errorMessage = '광고 동의 설정이 준비되지 않았습니다.';
        break;
      case 'ads-unavailable':
        errorMessage =
          '현재 시청 가능한 광고가 없습니다. 잠시 후 다시 시도해 주세요.';
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

  const ensurePrivacyStubs = (): void => {
    if (typeof window === 'undefined') return;
    // GPP stub
    const win = window as unknown as {
      __gpp?: unknown;
      __gppQueue?: unknown[];
      __tcfapi?: unknown;
      __tcfapiQueue?: unknown[];
      __uspapi?: unknown;
      __uspapiQueue?: unknown[];
    };
    if (typeof win.__gpp !== 'function') {
      win.__gppQueue = win.__gppQueue || [];
      win.__gpp = function (...args: unknown[]) {
        (win.__gppQueue as unknown[]).push(args);
      } as unknown as () => void;
    }
    // TCF v2 stub
    if (typeof win.__tcfapi !== 'function') {
      win.__tcfapiQueue = win.__tcfapiQueue || [];
      win.__tcfapi = function (...args: unknown[]) {
        (win.__tcfapiQueue as unknown[]).push(args);
      } as unknown as () => void;
    }
    // US Privacy stub
    if (typeof win.__uspapi !== 'function') {
      win.__uspapiQueue = win.__uspapiQueue || [];
      win.__uspapi = function (...args: unknown[]) {
        (win.__uspapiQueue as unknown[]).push(args);
      } as unknown as () => void;
    }
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
    adStartTimeRef.current = null;
    setElapsedMs(0);

    try {
      // Prevent gpp-library errors by ensuring CMP stubs exist
      ensurePrivacyStubs();
      await ensureApplixirLoaded();
      if (!window.initializeAndOpenPlayer) {
        throw new Error('SDK not initialized');
      }

      // 1) 서버에서 토큰 발급
      const start = await startAd.mutateAsync({ cid: String(containerKey) });
      serverTokenRef.current = start.token;

      // 2) DOM 관찰 시작
      startContainerObserver();

      // 3) 플레이어 열기
      window.initializeAndOpenPlayer({
        apiKey: process.env.NEXT_PUBLIC_APPLIXIR_API_KEY,
        injectionElementId: 'applixir-ad-container',
        adStatusCallbackFn: handleAdStatusCallback,
        adErrorCallbackFn: handleAdErrorCallback,
        // customId에 시도 카운터를 추가하여 세션 캐싱/중복 문제 방지
        adOptions: { customId: `${getAnonymousId()}:${containerKey}` },
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
      const hByWidth = (w * ASPECT_HEIGHT) / ASPECT_WIDTH;
      const capByViewport = Math.floor(
        window.innerHeight * VIEWPORT_HEIGHT_RATIO
      );
      const cap = Math.min(capByViewport, maxHeight ?? capByViewport);
      const h = Math.max(MIN_WRAPPER_HEIGHT, Math.min(hByWidth, cap));
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
        className="relative w-full bg-gray-100 rounded-md overflow-hidden"
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

      <div className="flex justify-center gap-2">
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
        {false && isLoading && elapsedMs >= CLOSE_WITHOUT_REWARD_MS && (
          <Button
            variant="secondary"
            onClick={() => {
              toast.info(
                '보상 없이 광고를 종료했습니다. 다시 시도할 수 있습니다.'
              );
              void adEvent.mutateAsync({
                kind: 'closed_without_reward',
                aid: getAnonymousId(),
                cid: String(containerKey),
                watchedMs: elapsedMs,
              });
              resetPlayer();
            }}
          >
            60초 경과, 닫기 (보상 없음)
          </Button>
        )}
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
        {isLoading && <p>시청 시간: {(elapsedMs / 1000).toFixed(0)}초</p>}
      </div>
    </div>
  );
}

export default ApplixirRewardAdComponent;
