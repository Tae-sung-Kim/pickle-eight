'use client';

import React, { useEffect, useId, useState } from 'react';
import { useConsentContext } from '@/providers';

/**
 * Kakao AdFit slot. Loads script after consent and triggers SPA re-exec.
 */

export function AdFitSlotComponent() {
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
    // Only load script when consent is accepted and ads are not disabled
    if (adsDisabledOverride || state !== 'accepted') return;

    const src = 'https://t1.daumcdn.net/kas/static/ba.min.js';
    const exists = document.querySelector(`script[src="${src}"]`);
    if (!exists) {
      const s = document.createElement('script');
      s.async = true;
      s.src = src;
      s.type = 'text/javascript';
      document.body.appendChild(s);
      s.onload = () => {
        try {
          window.kakaoAsyncAdFit = window.kakaoAsyncAdFit || [];
          // re-exec for SPA mounts
          (window.kakaoAsyncAdFit as unknown[]).push({});
        } catch {
          /* noop */
        }
      };
    } else {
      try {
        window.kakaoAsyncAdFit = window.kakaoAsyncAdFit || [];
        (window.kakaoAsyncAdFit as unknown[]).push({});
      } catch {
        /* noop */
      }
    }
  }, [state, adsDisabledOverride]);

  // Always render AdFit area for ad review compliance
  // Script loading is controlled by useEffect above
  return (
    // AdFit requires display:none initially; script will size/insert iframe
    <ins
      key={key}
      className="kakao_ad_area"
      style={{ display: 'none' }}
      data-ad-unit={unitId}
      data-ad-width={String(width)}
      data-ad-height={String(height)}
    />
  );
}

export default AdFitSlotComponent;
