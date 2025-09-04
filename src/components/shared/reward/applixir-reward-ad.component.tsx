'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreditStore } from '@/stores';
import { AD_APX, CREDIT_POLICY } from '@/constants';
import { toast } from 'sonner';
import { useConsentContext } from '@/providers';
import {
  CreditApplixirRewardAdType,
  CreditApplixirErrorType,
  CreditApplixirStatusType,
} from '@/types';
import {
  useApplixirEventMutation,
  useStartApplixirSessionMutation,
  useCompleteApplixirSessionMutation,
} from '@/queries';
import { computeRewardByWatch, formatCooldown, getAnonymousId } from '@/utils';
import { useAdCredit } from '@/hooks';

/**
 * Applixir 보상형 광고 컴포넌트
 * - 동의 상태 확인 후 광고 재생
 * - 시청 완료 시 서버 검증을 통해 크레딧 지급
 * - 스킵/중단 시 안전한 리셋 처리
 */
export function ApplixirRewardAdComponent({
  onApplixirCompleted,
  onApplixirError,
  maxHeight,
  disabled,
}: CreditApplixirRewardAdType) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [containerKey, setContainerKey] = useState<number>(0); // 스킵/중단 후 강제 리셋용
  const observerRef = useRef<MutationObserver | null>(null);
  const serverTokenRef = useRef<string | null>(null);
  const hasToastedRef = useRef<boolean>(false);
  const lastNotifiedAmountRef = useRef<number>(CREDIT_POLICY.rewardAmount);
  const { onEarn, todayEarned } = useCreditStore();
  const { state } = useConsentContext();
  const applixirEvent = useApplixirEventMutation();
  const startApplixir = useStartApplixirSessionMutation();
  const completeApplixir = useCompleteApplixirSessionMutation();
  const hadChildRef = useRef<boolean>(false);

  // Centralized credit + watch-time management
  const {
    cooldownMsLeft,
    inCooldown,
    reachedDailyCap,
    canWatchAd,
    elapsedMs,
    currentReward,
    ensureStarted,
    handlePause,
    getWatchedMs,
    resetElapsed,
    hasStarted,
    bindMediaElement,
  } = useAdCredit();

  const resetPlayer = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    setContainerKey((k) => k + 1);
    setIsLoading(false);
    serverTokenRef.current = null;
    hasToastedRef.current = false;
    resetElapsed();
    lastNotifiedAmountRef.current = CREDIT_POLICY.rewardAmount;
  };

  // IMPORTANT: 최초 시작 토스트는 컴포넌트에서만 한 번 처리
  const ensureStartedWithToast = () => {
    if (!hasToastedRef.current) {
      hasToastedRef.current = true;
      toast.info('광고가 시작되었습니다.');
    }
    ensureStarted();
  };

  // 재생 시점에 토스트 1회만 보장하는 래퍼 바인딩
  const bindMediaElementWithToast = (v: HTMLVideoElement): void => {
    const anyV = v as unknown as { __apx_toast_bound?: boolean };
    if (!anyV.__apx_toast_bound) {
      anyV.__apx_toast_bound = true;
      v.addEventListener('play', ensureStartedWithToast);
      v.addEventListener('playing', ensureStartedWithToast);
    }
    // 시청 시간 집계/일시정지는 훅의 바인딩에 위임
    bindMediaElement(v);
  };

  const handleAdStatusCallback = async (
    status: { type?: CreditApplixirStatusType } | string
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
    void applixirEvent.mutateAsync({
      kind: 'status',
      status: type as CreditApplixirStatusType,
      aid,
      cid: String(containerKey),
      watchedMs: getWatchedMs(),
    });

    switch ((type || '').toLowerCase()) {
      case 'loaded':
        // 로딩 완료. 실제 시작은 start/applixir-started/impression 또는 video.play에서 처리
        break;
      case 'start':
      case 'applixir-started':
      case 'adstarted':
      case 'applixir-start':
      case 'impression':
      case 'applixir-impression':
        ensureStartedWithToast();
        break;
      case 'pause':
      case 'paused':
      case 'applixir-paused':
        handlePause();
        break;
      case 'resume':
      case 'resumed':
      case 'applixir-resumed':
      case 'playing':
        ensureStartedWithToast();
        break;
      case 'complete':
      case 'applixir-watched':
      case 'fb-watched': {
        // 서버 검증 요청
        const token = serverTokenRef.current;
        if (!token) {
          toast.error('검증 토큰이 없습니다. 다시 시도해주세요.');
          resetPlayer();
          break;
        }
        try {
          await completeApplixir.mutateAsync({ token });
        } catch (err: unknown) {
          const reason: string =
            err instanceof Error ? err.message : 'verification_failed';
          toast.error('크레딧 지급이 거절되었습니다.');
          void applixirEvent.mutateAsync({
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
          onApplixirCompleted?.();
          void applixirEvent.mutateAsync({
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
      case 'applixir-skipped':
        toast.info('광고가 스킵되었습니다. 크레딧은 지급되지 않습니다.');
        void applixirEvent.mutateAsync({
          kind: 'skipped',
          aid,
          cid: String(containerKey),
          watchedMs: getWatchedMs(),
        });
        resetPlayer();
        break;
      case 'applixir-interrupted':
        toast.warning('광고가 중단되었습니다. 다시 시도할 수 있습니다.');
        void applixirEvent.mutateAsync({
          kind: 'interrupted',
          aid,
          cid: String(containerKey),
          watchedMs: getWatchedMs(),
        });
        resetPlayer();
        break;
      case 'closed':
      case 'close':
      case 'ad-closed':
      case 'adclosed':
      case 'applixir-closed':
      case 'player-closed':
      case 'user-closed': {
        // 사용자가 플레이어 X 버튼 등으로 닫은 경우
        handlePause();
        toast.info('광고가 종료되었습니다.');
        void applixirEvent.mutateAsync({
          kind: 'closed_by_user',
          aid,
          cid: String(containerKey),
          watchedMs: getWatchedMs(),
        });
        resetPlayer();
        break;
      }
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
    getError: () => {
      data: { type: CreditApplixirErrorType };
      errorMessage: string;
    };
  }) => {
    const errorInfo = error.getError();
    console.error('Applixir Ad Error:', errorInfo);
    void applixirEvent.mutateAsync({
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

    // Explicit type-based mapping (normalize to string to avoid type narrowing issues)
    const typeStr = String(errorInfo.data?.type || '');
    switch (typeStr) {
      case 'ads-unavailable':
      case 'applixir-unavailable':
        errorMessage =
          '현재 시청 가능한 광고가 없습니다. 잠시 후 다시 시도해 주세요.';
        break;
      case 'mediaReviewPending':
      case 'media_review_pending':
        errorMessage =
          '매체 심사 진행 중입니다. 승인 완료 후 광고 시청이 가능합니다.';
        break;
      case 'siteNotApproved':
      case 'site_not_approved':
        errorMessage =
          '사이트 승인 대기 상태입니다. 승인 완료 후 광고 시청이 가능합니다.';
        break;
      case 'applixirRequestNetworkError':
        errorMessage = '네트워크 오류로 광고를 불러올 수 없습니다.';
        break;
      case 'consentManagementProviderNotReady':
        errorMessage = '광고 동의 설정이 준비되지 않았습니다.';
        break;
      default:
        // 마지막으로 제공된 원본 메시지를 사용
        errorMessage = errorInfo.errorMessage || errorMessage;
        break;
    }

    toast.error(errorMessage);
    onApplixirError?.(errorMessage);
    resetPlayer();
  };

  const startContainerObserver = () => {
    if (!containerRef.current || observerRef.current) return;
    observerRef.current = new MutationObserver(() => {
      const hasChild = !!containerRef.current?.firstChild;
      // 광고 DOM 주입 직후 시작 보장
      if (hasChild && !hasStarted) {
        ensureStartedWithToast();
      }
      // 광고 DOM이 사라진 경우(사용자 닫기 버튼 등) 안전 정지/리셋 처리
      if (!hasChild && hadChildRef.current && isLoading) {
        handlePause();
        toast.info('광고가 종료되었습니다.');
        void applixirEvent.mutateAsync({
          kind: 'closed_by_dom',
          aid: getAnonymousId(),
          cid: String(containerKey),
          watchedMs: getWatchedMs(),
        });
        resetPlayer();
      }
      hadChildRef.current = hasChild;
      // 재생 이벤트 기반 보장: 주입된 video가 play되면 시작 처리
      const videos = containerRef.current?.querySelectorAll('video');
      videos?.forEach((v) => bindMediaElementWithToast(v));
      // 종료 콜백에서만 reset
    });
    observerRef.current.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });
  };

  const ensurePrivacyStubs = () => {
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
    resetElapsed();

    try {
      // Prevent gpp-library errors by ensuring CMP stubs exist
      ensurePrivacyStubs();
      await ensureApplixirLoaded();
      if (!window.initializeAndOpenPlayer) {
        throw new Error('SDK not initialized');
      }

      // 1) 서버에서 토큰 발급
      const start = await startApplixir.mutateAsync({
        cid: String(containerKey),
      });
      serverTokenRef.current = start.token;

      // 2) DOM 관찰 시작
      startContainerObserver();

      // 3) 플레이어 열기
      window.initializeAndOpenPlayer({
        apiKey: process.env.NEXT_PUBLIC_APPLIXIR_API_KEY,
        injectionElementId: 'applixir-applixir-container',
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

  // Applixir SDK 동적 로더 (누락 복원)
  const ensureApplixirLoaded = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    if (window.initializeAndOpenPlayer) return;
    await new Promise<void>((resolve, reject) => {
      const id = 'applixir-sdk-script';
      const existing = document.getElementById(id) as HTMLScriptElement | null;
      // 이미 스크립트 태그가 있다면, 중복 주입 대신 로드 완료만 기다림
      if (existing) {
        if (typeof window.initializeAndOpenPlayer === 'function') {
          resolve();
          return;
        }
        const onLoad = () => {
          existing.removeEventListener('load', onLoad);
          existing.removeEventListener('error', onError);
          resolve();
        };
        const onError = () => {
          existing.removeEventListener('load', onLoad);
          existing.removeEventListener('error', onError);
          reject(new Error('Failed to load Applixir SDK'));
        };
        existing.addEventListener('load', onLoad);
        existing.addEventListener('error', onError);
        return;
      }
      // 최초 1회만 삽입
      const s = document.createElement('script');
      s.id = id;
      s.src = 'https://cdn.applixir.com/applixir.app.v6.0.1.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Applixir SDK'));
      document.body.appendChild(s);
    });
  };

  // 래퍼 박스를 사용해 16:9 유지 + 가용 높이 내에 맞춤(최대 90vh)
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth;
      const hByWidth = (w * AD_APX.ASPECT_HEIGHT) / AD_APX.ASPECT_WIDTH;
      const capByViewport = Math.floor(
        window.innerHeight * AD_APX.VIEWPORT_HEIGHT_RATIO
      );
      const cap = Math.min(capByViewport, maxHeight ?? capByViewport);
      const h = Math.max(AD_APX.MIN_WRAPPER_HEIGHT, Math.min(hByWidth, cap));
      el.style.height = `${h}px`;
    };
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener('resize', apply);
    apply();
    return () => {
      window.removeEventListener('resize', apply);
      ro.disconnect();
      observerRef.current?.disconnect();
      observerRef.current = null;
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
          id="applixir-applixir-container"
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
              {(elapsedMs / 1000).toFixed(0)}초 · 예상 획득 +{currentReward}
            </span>
          </div>
        )}
      </div>

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
                예상 +{currentReward}
              </span>
            </span>
          ) : reachedDailyCap ? (
            '오늘 시청 한도 도달'
          ) : inCooldown ? (
            `쿨다운 ${formatCooldown(cooldownMsLeft)}`
          ) : (
            '광고 보고 크레딧 받기'
          )}
        </Button>
        {false && isLoading && elapsedMs >= AD_APX.CLOSE_WITHOUT_REWARD_MS && (
          <Button
            variant="secondary"
            onClick={() => {
              toast.info(
                '보상 없이 광고를 종료했습니다. 다시 시도할 수 있습니다.'
              );
              void applixirEvent.mutateAsync({
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
