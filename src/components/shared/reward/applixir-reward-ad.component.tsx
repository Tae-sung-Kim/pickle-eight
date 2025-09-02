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
  disabled,
}: ApplixirRewardAdType) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [containerKey, setContainerKey] = useState<number>(0); // 스킵/중단 후 강제 리셋용
  const observerRef = useRef<MutationObserver | null>(null);
  const serverTokenRef = useRef<string | null>(null);
  const adStartTimeRef = useRef<number | null>(null); // 현재 재생 시작 시각
  const accumulatedMsRef = useRef<number>(0); // 누적 시청 시간(일시정지 포함)
  const isPlayingRef = useRef<boolean>(false); // 실제 재생 중 여부
  const startedRef = useRef<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const lastNotifiedAmountRef = useRef<number>(CREDIT_POLICY.rewardAmount);
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
    accumulatedMsRef.current = 0;
    isPlayingRef.current = false;
    startedRef.current = false;
    setElapsedMs(0);
    lastNotifiedAmountRef.current = CREDIT_POLICY.rewardAmount;
  };

  // IMPORTANT: React state 읽지 않음. 첫 시작/재개 모두 처리. 토스트는 최초 1회만.
  const ensureStarted = (): void => {
    const now = Date.now();
    if (!startedRef.current) {
      startedRef.current = true;
      toast.info('광고가 시작되었습니다.');
    }
    if (!isPlayingRef.current) {
      adStartTimeRef.current = now;
      isPlayingRef.current = true;
      // Force immediate UI update so resume reflects right away
      setElapsedMs(getWatchedMs());
    }
  };

  const handlePause = (): void => {
    if (!isPlayingRef.current) return;
    const now = Date.now();
    if (adStartTimeRef.current !== null) {
      accumulatedMsRef.current += now - adStartTimeRef.current;
    }
    adStartTimeRef.current = null;
    isPlayingRef.current = false;
    setElapsedMs(accumulatedMsRef.current);
  };

  const getWatchedMs = (): number => {
    if (isPlayingRef.current && adStartTimeRef.current !== null) {
      return accumulatedMsRef.current + (Date.now() - adStartTimeRef.current);
    }
    return accumulatedMsRef.current;
  };

  // Track elapsed time while ad is running
  useEffect(() => {
    if (!isLoading) return;
    const tick = (): void => {
      setElapsedMs(getWatchedMs());
    };
    const id = setInterval(tick, 250);
    tick();
    return () => clearInterval(id);
  }, [isLoading]);

  // 추가 보상 안내 토스트: 기준(2×step) 초과 이후 증가할 때마다 +N 안내 (maxPerAd까지)
  useEffect(() => {
    if (!isLoading) return;
    const sec = Math.floor(elapsedMs / 1000);
    const stepSec = CREDIT_POLICY.stepReward; // 운영: 60초, 개발: 5초
    if (sec <= 2 * stepSec) return; // 기준 이전은 알림 없음
    const currentAmount = computeRewardByWatch(elapsedMs); // 이미 maxPerAd로 클램프됨
    const prevAmount = lastNotifiedAmountRef.current;
    if (currentAmount > prevAmount) {
      // const added = currentAmount - prevAmount;
      // toast.info(`+${added} 크레딧 추가 예정 (누적 ${currentAmount})`);
      lastNotifiedAmountRef.current = currentAmount;
    }
  }, [elapsedMs, isLoading]);

  const computeRewardByWatch = (watchedMs: number): number => {
    const sec = Math.floor(watchedMs / 1000);
    const stepSec = CREDIT_POLICY.stepReward; // 운영: 60초, 개발: 5초
    const inc = CREDIT_POLICY.rewardAmount; // 스텝당 +크레딧(기본 5)
    if (sec <= 2 * stepSec) return Math.min(inc, CREDIT_POLICY.maxPerAd); // 기준(2스텝) 이전: 기본 보상
    const steps = Math.floor(sec / stepSec) - 1; // 기준(2스텝) 초과분부터 스텝 카운트
    const amount = inc + steps * inc;
    return Math.min(amount, CREDIT_POLICY.maxPerAd);
  };

  const handleAdStatusCallback = async (
    status: { type?: CreditAdStatusType } | string
  ): Promise<void> => {
    const raw = status as unknown;
    const t: string =
      typeof raw === 'string'
        ? raw
        : (raw as { type?: string; status?: string })?.type ||
          (raw as { type?: string; status?: string })?.status ||
          '';
    const type = (t || '').toString();
    console.log('Applixir Ad Status (normalized):', type);
    const aid = getAnonymousId();
    void adEvent.mutateAsync({
      kind: 'status',
      status: type as CreditAdStatusType,
      aid,
      cid: String(containerKey),
      watchedMs: getWatchedMs(),
    });

    switch ((type || '').toLowerCase()) {
      case 'loaded':
        // 로딩 완료. 실제 시작은 start/ad-started/impression 또는 video.play에서 처리
        break;
      case 'start':
      case 'ad-started':
      case 'adstarted':
      case 'ad-start':
      case 'impression':
      case 'ad-impression':
        ensureStarted();
        break;
      case 'pause':
      case 'paused':
      case 'ad-paused':
        handlePause();
        break;
      case 'resume':
      case 'resumed':
      case 'ad-resumed':
      case 'playing':
        ensureStarted();
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
            watchedMs: getWatchedMs(),
          });
          return;
        }
        // 로컬 스토어도 동기화(서버가 승인했을 때만)
        const watchedMs = getWatchedMs();
        const dynamicAmount = computeRewardByWatch(watchedMs);
        const result = onEarn(dynamicAmount);
        if (result.canEarn) {
          toast.success(`크레딧 ${dynamicAmount}개를 받았습니다!`);
          onAdCompleted?.();
          void adEvent.mutateAsync({
            kind: 'complete_granted',
            aid,
            cid: String(containerKey),
            watchedMs,
            grantedAmount: dynamicAmount,
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
          watchedMs: getWatchedMs(),
        });
        resetPlayer();
        break;
      case 'ad-interrupted':
        toast.warning('광고가 중단되었습니다. 다시 시도할 수 있습니다.');
        void adEvent.mutateAsync({
          kind: 'interrupted',
          aid,
          cid: String(containerKey),
          watchedMs: getWatchedMs(),
        });
        resetPlayer();
        break;
      case 'fb-started':
        toast.info('대체 광고가 시작되었습니다.');
        break;
      case 'alladscompleted':
      case 'thankyoumodalclosed':
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

  function startContainerObserver(): void {
    if (!containerRef.current || observerRef.current) return;
    observerRef.current = new MutationObserver(() => {
      const hasChild = !!containerRef.current?.firstChild;
      // 광고 DOM 주입 직후 시작 보장
      if (hasChild && !startedRef.current) {
        ensureStarted();
      }
      // 재생 이벤트 기반 보장: 주입된 video가 play되면 시작 처리
      const videos = containerRef.current?.querySelectorAll('video');
      videos?.forEach((v) => {
        // 중복 리스너 방지용 플래그
        const anyV = v as unknown as { __apx_bound?: boolean };
        if (anyV.__apx_bound) return;
        anyV.__apx_bound = true;
        v.addEventListener('play', () => {
          if (!startedRef.current || !isPlayingRef.current) ensureStarted();
        });
        v.addEventListener('playing', () => {
          if (!startedRef.current || !isPlayingRef.current) ensureStarted();
        });
        v.addEventListener('pause', () => {
          handlePause();
        });
        v.addEventListener('ended', () => {
          handlePause();
        });
      });
      // 종료 콜백에서만 reset
    });
    observerRef.current.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });
  }

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
    if (!canWatchAd) {
      if (reachedDailyCap) {
        toast.info('오늘 시청 한도에 도달했습니다. 내일 0시에 초기화됩니다.');
      }
      return;
    }
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
        {/* 상단 고정 안내 배지: 광고 위에 떠서 가려지지 않도록 표시 */}
        <div className="pointer-events-none absolute left-2 top-2 z-[2147483647]">
          <span className="inline-flex items-center gap-1 rounded bg-black/65 text-white px-2 py-1 text-[11px] shadow">
            기본 {CREDIT_POLICY.rewardAmount}개 · {CREDIT_POLICY.stepReward}
            초마다 +{CREDIT_POLICY.rewardAmount}
            <span className="ml-1 opacity-90">
              (최대 {CREDIT_POLICY.maxPerAd}개)
            </span>
          </span>
        </div>
        {/* 우상단 진행 배지: 경과시간/예상보상 실시간 표시 */}
        {isLoading && (
          <div className="pointer-events-none absolute right-2 top-2 z-[2147483647]">
            <span className="inline-flex items-center gap-1 rounded bg-emerald-600/85 text-white px-2 py-1 text-[11px] shadow">
              {(elapsedMs / 1000).toFixed(0)}초 · 예상 획득 +
              {computeRewardByWatch(elapsedMs)}
            </span>
          </div>
        )}
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
          disabled={disabled || !canWatchAd || isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              광고 시청 중...
              <span className="ml-1 rounded px-1.5 py-0.5 text-[11px] border bg-muted text-muted-foreground">
                예상 +{computeRewardByWatch(elapsedMs)}
              </span>
            </span>
          ) : reachedDailyCap ? (
            '오늘 시청 한도 도달'
          ) : inCooldown ? (
            `쿨다운 ${cooldownLabel()}`
          ) : (
            '광고 보고 크레딧 받기'
          )}
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
        {/* {isLoading && (
          <p>
            시청 시간: {(elapsedMs / 1000).toFixed(0)}초 · 현재 예상 획득량:{' '}
            {computeRewardByWatch(elapsedMs)}개
          </p>
        )} */}
        <p>
          보상 정책: 기본 {CREDIT_POLICY.rewardAmount}개, 이후{' '}
          <span className="font-semibold">{CREDIT_POLICY.stepReward}초</span>
          마다 +{CREDIT_POLICY.rewardAmount}씩 증가하며, 광고 1회 최대{' '}
          {CREDIT_POLICY.maxPerAd}개까지 지급됩니다.
        </p>
        <p>
          오늘 남은 획득 가능 크레딧:{' '}
          {Math.max(0, CREDIT_POLICY.dailyCap - todayEarned)}개
        </p>
      </div>
    </div>
  );
}

export default ApplixirRewardAdComponent;
