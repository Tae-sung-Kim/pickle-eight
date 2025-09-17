'use client';
import { useConsentContext } from '@/providers/consent.provider';
import { useTopBannerAdConfig } from '@/queries/use-ads-config.query';
import { useLoadingStore } from '@/stores/loading.store';
import { useEffect, useId, useState } from 'react';
import { ConsentNudgeComponent } from '../consent/consent-nudge.component';

export type AdFitSlotProps = {
  readonly fixed?: boolean;
  readonly topOffsetPx?: number; // when fixed, offset from top (e.g., header height)
};

export function AdFitSlotComponent({
  fixed = false,
  topOffsetPx = 0,
}: AdFitSlotProps) {
  const { showLoading, hideLoading } = useLoadingStore();
  const { state } = useConsentContext();
  const key = useId();

  const { data: adConfig } = useTopBannerAdConfig();

  // 임의로 광고 노출하지 않을 경우 - SSR에서 localStorage 접근 금지
  const [adsDisabledOverride, setAdsDisabledOverride] =
    useState<boolean>(false);
  useEffect(() => {
    try {
      const v =
        typeof window !== 'undefined' &&
        window.localStorage?.getItem('adfit-disabled') === 'true';
      setAdsDisabledOverride(Boolean(v));
    } catch {
      setAdsDisabledOverride(false);
    }
  }, []);

  useEffect(() => {
    // Only proceed when consent is explicitly accepted
    if (adsDisabledOverride || state !== 'accepted' || !adConfig) return;

    showLoading();

    const src = 'https://t1.daumcdn.net/kas/static/ba.min.js';

    const ensureQueue = () => {
      try {
        (window as unknown as { kakaoAsyncAdFit?: unknown[] }).kakaoAsyncAdFit =
          (window as unknown as { kakaoAsyncAdFit?: unknown[] })
            .kakaoAsyncAdFit || [];
      } catch {
        /* noop */
      }
    };

    const ensureScript = () =>
      new Promise<void>((resolve) => {
        const exists = document.querySelector(`script[src="${src}"]`);
        if (exists) {
          ensureQueue();
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.async = true;
        s.src = src;
        s.type = 'text/javascript';
        s.onload = () => {
          ensureQueue();
          resolve();
        };
        document.body.appendChild(s);
      });

    ensureScript()
      .then(() => {
        // consent is accepted; safe to request AdFit
        if (state === 'accepted') {
          try {
            if (
              Array.isArray(
                (window as unknown as { kakaoAsyncAdFit?: unknown[] })
                  .kakaoAsyncAdFit
              )
            ) {
              (window.kakaoAsyncAdFit as unknown[]).push({});
            }
          } catch {
            /* noop */
          }
        }
      })
      .catch(() => {
        /* noop */
      })
      .finally(() => hideLoading());
  }, [state, adsDisabledOverride, showLoading, hideLoading, adConfig]);

  // 동의하지 않은 경우: 공용 컨센트 너지 컴포넌트를 활용해 안내 및 동의 유도
  if (state !== 'accepted') {
    return (
      <div
        role="region"
        aria-label="advertisement"
        className="flex w-full flex-col items-center gap-1"
      >
        <div
          className="self-start rounded bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground"
          aria-hidden
        >
          광고
        </div>
        <ConsentNudgeComponent variant="ad-slot" />
      </div>
    );
  }

  // 동의는 했지만 Config가 없으면 렌더링하지 않습니다.
  if (!adConfig) return null;

  // Render labeled container for compliance. Script loading is gated above.
  const AdInner = (
    <div
      role="region"
      aria-label="advertisement"
      className="flex w-full flex-col items-center gap-1"
    >
      <div
        className="self-start rounded bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground"
        aria-hidden
      >
        광고
      </div>
      {/* AdFit requires display:none initially; script will size/insert iframe */}
      <ins
        key={`${key}-${adConfig.unitId}-${adConfig.width}x${adConfig.height}`}
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={adConfig.unitId}
        data-ad-width={String(adConfig.width)}
        data-ad-height={String(adConfig.height)}
      />
    </div>
  );

  if (!fixed || adsDisabledOverride) return AdInner;

  // Fixed top bar + spacer to preserve layout
  const h = Number(adConfig.height) || 0;
  return (
    <>
      {/* spacer to offset fixed bar height */}
      <div style={{ height: h ? `${h + 16}px` : undefined }} aria-hidden />
      <div
        className="fixed left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        style={{ top: `${topOffsetPx}px` }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex justify-center">
          {AdInner}
        </div>
      </div>
    </>
  );
}
