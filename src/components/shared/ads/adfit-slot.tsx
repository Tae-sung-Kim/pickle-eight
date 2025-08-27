'use client';

import React, { useEffect, useId } from 'react';
import { useConsentContext } from '@/providers/consent.provider';

declare global {
  interface Window {
    kakaoAsyncAdFit?: unknown[];
  }
}

export type AdFitSlotProps = {
  readonly unitId: string;
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
};

/**
 * Kakao AdFit slot. Loads script after consent and triggers SPA re-exec.
 */
export function AdFitSlot({
  unitId = process.env.NEXT_PUBLIC_ADFIT_UNIT_ID_BODY ?? '',
  width = 250,
  height = 250,
  className,
}: AdFitSlotProps) {
  const { state } = useConsentContext();
  const key = useId();

  useEffect(() => {
    if (state !== 'accepted') return;
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
  }, [state]);

  if (state !== 'accepted') return null;

  return (
    // AdFit requires display:none initially; script will size/insert iframe
    <ins
      key={key}
      className={`kakao_ad_area ${className ?? ''}`}
      style={{ display: 'none' }}
      data-ad-unit={unitId}
      data-ad-width={String(width)}
      data-ad-height={String(height)}
    />
  );
}

export default AdFitSlot;
