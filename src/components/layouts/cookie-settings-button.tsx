'use client';

import React from 'react';
import { useConsent } from '@/providers/consent.provider';

/**
 * CookieSettingsButton opens the cookie consent banner on demand.
 */
export function CookieSettingsButton() {
  const { open } = useConsent();
  return (
    <button
      type="button"
      onClick={open}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground underline"
      aria-label="쿠키 설정 열기"
    >
      쿠키 설정
    </button>
  );
}
