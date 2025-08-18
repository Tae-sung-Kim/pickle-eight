'use client';

import React from 'react';
import { useConsent } from '@/providers/consent.provider';

/**
 * CookieConsent displays a small bottom banner asking for consent.
 * Uses ConsentProvider for state management.
 */
export function CookieConsent() {
  const { visible, accept, decline } = useConsent();
  if (!visible) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-3xl px-4 pb-4">
      <div className="rounded-md border bg-background p-4 shadow-lg">
        <p className="text-xs text-muted-foreground">
          분석/광고 쿠키를 사용하여 서비스 품질을 개선하고 맞춤형 콘텐츠를
          제공합니다. 자세한 내용은{' '}
          <a href="/privacy" className="underline">
            개인정보처리방침
          </a>
          을 확인하세요.
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={decline}
            className="rounded-md border px-3 py-1.5 text-xs"
          >
            거부
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground"
          >
            동의
          </button>
        </div>
      </div>
    </div>
  );
}
