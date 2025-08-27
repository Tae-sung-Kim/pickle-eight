'use client';

import React, { useEffect, useId, useMemo } from 'react';
import { useConsentContext } from '@/providers';
import { Button } from '@/components/ui/button';

export type AdFitSlotType = {
  readonly unitId?: string;
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
  /**
   * Optional fallback rendered when consent is not accepted.
   * If not provided, a default CTA with a button to reopen consent is shown.
   */
  readonly fallback?: React.ReactNode;
};

/**
 * Kakao AdFit slot. Loads script after consent and triggers SPA re-exec.
 */
export function AdFitSlotComponent({
  unitId = process.env.NEXT_PUBLIC_ADFIT_UNIT_ID_BODY ?? '',
  width = 250,
  height = 250,
  className,
  fallback,
}: AdFitSlotType) {
  const { state, onOpen } = useConsentContext();
  const key = useId();

  // Only serve ads in production
  const adsDisabled = useMemo<boolean>(() => {
    return process.env.NODE_ENV !== 'production';
  }, []);

  // 임의로 광고 노출하지 않을 경우
  const adsDisabledOverride = useMemo<boolean>(() => {
    return localStorage.getItem('adfit-disabled') === 'true';
  }, []);

  // Reason is environment only
  const disabledReason = useMemo<'env' | null>(() => {
    return process.env.NODE_ENV !== 'production' ? 'env' : null;
  }, []);

  useEffect(() => {
    if (adsDisabledOverride || adsDisabled || state !== 'accepted') return;

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
  }, [state, adsDisabled, adsDisabledOverride]);

  // When ads are disabled, render a subtle placeholder to preserve layout
  if (adsDisabledOverride) {
    return (
      <div className={className} style={{ width, height }}>
        <div className="h-full w-full rounded-md border border-dashed bg-muted/30 flex items-center justify-between gap-3 p-2">
          <div className="text-xs text-muted-foreground">
            임의로 광고가 비활성화되었습니다
          </div>
        </div>
      </div>
    );
  }
  if (adsDisabled) {
    return (
      <div className={className} style={{ width, height }}>
        <div className="h-full w-full rounded-md border border-dashed bg-muted/30 flex items-center justify-between gap-3 p-2">
          <div className="text-xs text-muted-foreground">
            {disabledReason === 'env' &&
              '개발/프리뷰 환경에서는 광고가 비활성화됩니다'}
          </div>
        </div>
      </div>
    );
  }

  if (state !== 'accepted') {
    if (fallback) return <>{fallback}</>;
    // Default non-tracking placeholder with consent reopen CTA
    return (
      <div className={className} style={{ width, height }}>
        <div className="h-full w-full rounded-md border border-dashed bg-muted/30 flex items-center justify-between gap-3 p-2">
          <div className="text-xs text-muted-foreground">
            광고가 비활성화되어 있습니다.
            <span className="hidden sm:inline">
              {' '}
              동의 시 무료 서비스 운영을 도울 수 있어요.
            </span>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={onOpen}>
            광고 설정 열기
          </Button>
        </div>
      </div>
    );
  }

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

export default AdFitSlotComponent;
