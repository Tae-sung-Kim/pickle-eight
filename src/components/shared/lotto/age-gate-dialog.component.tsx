'use client';

import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';

export type AgeGateDialogPropsType = Readonly<{
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>;

/**
 * Controlled age-gate dialog used for pre-navigation verification.
 * Keeps the user on current page until they confirm.
 */
export function AgeGateDialogComponent({
  open,
  onConfirm,
  onCancel,
}: AgeGateDialogPropsType) {
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
          <Button asChild variant="outline" size="sm" onClick={onCancel}>
            <Link href="#" onClick={(e) => e.preventDefault()}>
              취소
            </Link>
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
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

export default AgeGateDialogComponent;
