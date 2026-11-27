'use client';
import { useEffect, useId } from 'react';
import { ConsentNudgeComponent } from '@/components/consent/consent-nudge.component';
import {
  AD_BOTTOM_BANNER,
  AD_TOP_BANNER,
  ADS_DISABLED,
} from '@/features/ad/constants/adfit.constant';
import { useConsentContext } from '@/providers/consent.provider';
import { useLoadingStore } from '@/stores/loading.store';

// 슬롯이 여러 개여도 마지막 로드가 끝날 때만 로딩 표시를 끈다
let pendingAdLoads = 0;

export type AdFitSlotProps = {
  readonly unit?: 'top' | 'bottom';
  readonly fixed?: boolean;
  readonly topOffsetPx?: number; // when fixed, offset from top (e.g., header height)
};

export function AdFitSlotComponent({
  unit = 'top',
  fixed = false,
  topOffsetPx = 0,
}: AdFitSlotProps) {
  const { showLoading, hideLoading } = useLoadingStore();
  const { state } = useConsentContext();
  const key = useId();

  const adConfig = unit === 'bottom' ? AD_BOTTOM_BANNER : AD_TOP_BANNER;

  useEffect(() => {
    // Only proceed when consent is explicitly accepted
    if (state !== 'accepted' || !adConfig) return;

    pendingAdLoads += 1;
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
        // 광고 차단 등으로 로드가 실패해도 로딩 표시가 남지 않게 한다
        s.onerror = () => resolve();
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
      .finally(() => {
        pendingAdLoads -= 1;
        if (pendingAdLoads <= 0) {
          pendingAdLoads = 0;
          hideLoading();
        }
      });
  }, [state, adConfig, showLoading, hideLoading]);

  // 광고 단위가 없으면 동의 여부와 상관없이 아무것도 그리지 않는다
  if (ADS_DISABLED || !adConfig) return null;

  // 동의하지 않은 경우: 공용 컨센트 너지 컴포넌트를 활용해 안내 및 동의 유도
  if (state !== 'accepted') {
    return (
      <section
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
      </section>
    );
  }

  // Render labeled container for compliance. Script loading is gated above.
  const AdInner = (
    <section
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
    </section>
  );

  if (!fixed) return AdInner;

  // position: fixed 광고는 삼성 인터넷에서 스크롤 중 사라진 뒤 복구되지 않아 sticky로 둔다.
  // sticky는 부모 높이 안에서만 붙으므로 부모는 body여야 한다(layout.tsx에서 래퍼 없이 둔다).
  return (
    <div
      className="sticky z-40 bg-background"
      style={{ top: `${topOffsetPx}px` }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex justify-center">
        {AdInner}
      </div>
    </div>
  );
}
