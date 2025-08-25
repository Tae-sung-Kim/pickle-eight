'use client';

import React from 'react';
import { useConsentContext } from '@/providers';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CookieConsentComponent() {
  const { visible, onAccept, onDecline, onClose } = useConsentContext();
  if (!visible) return null;
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-5 sm:pb-6"
      role="region"
      aria-label="쿠키 동의 배너"
    >
      <div className="mx-auto w-full max-w-3xl md:max-w-4xl lg:max-w-5xl rounded-2xl border bg-background/90 shadow-xl ring-1 ring-border backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col items-stretch gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between md:gap-4">
          <p className="flex-1 text-xs sm:text-sm leading-6 text-muted-foreground">
            분석/광고 쿠키를 사용하여 서비스 품질을 개선하고 맞춤형 콘텐츠를
            제공합니다. 자세한 내용은{' '}
            <Link
              href="/privacy"
              className="font-medium text-indigo-600 underline underline-offset-4 transition-colors hover:text-indigo-700"
            >
              개인정보처리방침
            </Link>
            을 확인하세요.
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-2 md:flex-nowrap md:justify-end">
            <Button
              type="button"
              onClick={onDecline}
              variant="outline"
              size="sm"
              className="border-muted-foreground/30 text-muted-foreground hover:bg-muted/50"
              aria-label="쿠키 거부"
            >
              거부
            </Button>
            <Button
              type="button"
              onClick={onAccept}
              variant="default"
              size="sm"
              className="bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600"
              aria-label="쿠키 동의"
            >
              동의
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              size="icon"
              aria-label="닫기"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <span aria-hidden>×</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieConsentComponent;
