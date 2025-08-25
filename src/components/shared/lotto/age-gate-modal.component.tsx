'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const STORAGE_KEY = process.env.NEXT_PUBLIC_SITE_NAME + '_age_gate_verified_v1';

export function AgeGateModalComponent() {
  const [open, setOpen] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only apply on lotto-related routes
    const isLotto =
      typeof pathname === 'string' && pathname.startsWith('/lotto');
    if (!isLotto) {
      setOpen(false);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Backward compatibility: legacy 'true'
      if (raw === 'true') {
        setOpen(false);
        return;
      }
      if (!raw) {
        setOpen(true);
        return;
      }
      const parsed = JSON.parse(raw) as { v: boolean; ts: number };
      const valid =
        parsed?.v === true &&
        typeof parsed?.ts === 'number' &&
        Date.now() - parsed.ts < TTL_MS;
      setOpen(!valid);
    } catch {
      setOpen(true);
    }
  }, [pathname]);

  function confirm(): void {
    try {
      const payload = JSON.stringify({ v: true, ts: Date.now() });
      localStorage.setItem(STORAGE_KEY, payload);
    } catch {
      /* noop */
    }
    setOpen(false);
  }

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl rounded-xl border bg-background/95 p-5 shadow-xl ring-1 ring-border">
        <h2 id="age-gate-title" className="text-base font-semibold sm:text-lg">
          성인 확인
        </h2>
        <p className="mt-2 text-xs leading-6 text-muted-foreground sm:text-sm">
          본 서비스는 로또 관련 콘텐츠를 포함하며, 대한민국 기준 만 19세 미만의
          이용은 제한됩니다.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href="/">돌아가기</Link>
          </Button>
          <Button
            type="button"
            onClick={confirm}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            만 19세 이상입니다
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AgeGateModalComponent;
