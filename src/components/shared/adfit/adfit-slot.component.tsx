'use client';

import React, { useEffect, useId, useState } from 'react';
import { useConsentContext } from '@/providers';
import { useLoadingStore } from '@/stores';

/**
 * Kakao AdFit slot. Loads script after consent and triggers SPA re-exec.
 */

export function AdFitSlotComponent() {
  const { showLoading, hideLoading } = useLoadingStore();
  const { state } = useConsentContext();
  const key = useId();

  const unitId = process.env.NEXT_PUBLIC_ADFIT_UNIT_ID ?? 'DAN-placeholder';
  const width = 320;
  const height = 100;

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
    if (adsDisabledOverride || state !== 'accepted') return;

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
  }, [state, adsDisabledOverride, showLoading, hideLoading]);

  // Render labeled container for compliance. Script loading is gated above.
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
      {/* AdFit requires display:none initially; script will size/insert iframe */}
      <ins
        key={key}
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={unitId}
        data-ad-width={String(width)}
        data-ad-height={String(height)}
      />
    </div>
  );
}

export default AdFitSlotComponent;
