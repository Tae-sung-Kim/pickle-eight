'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

/**
 * AgeGateModal blocks the UI until user confirms 19+ age.
 * Persists a flag in localStorage to avoid repeated prompts.
 */

const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export function AgeGateModal() {
  const STORAGE_KEY = 'age_gate_verified_v1' as const;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <h2 className="text-lg font-semibold">성인 확인</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          본 서비스는 로또 관련 콘텐츠를 포함하며, 대한민국 기준 만 19세 미만의
          이용은 제한됩니다.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Link href="/" className="rounded-md border px-3 py-2 text-sm">
            돌아가기
          </Link>
          <button
            type="button"
            onClick={confirm}
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
          >
            만 19세 이상입니다
          </button>
        </div>
      </div>
    </div>
  );
}
