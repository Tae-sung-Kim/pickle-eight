'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LottoAgeGateDialogType } from '@/types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

/**
 * Controlled age-gate dialog used for pre-navigation verification.
 * Keeps the user on current page until they confirm.
 */
export function AgeGateDialogComponent({
  open,
  onConfirm,
  onCancel,
}: LottoAgeGateDialogType) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent
        aria-label="성인 확인"
        aria-labelledby="age-gate-title-hidden"
        className="z-[1001] w-full max-w-md sm:max-w-lg md:max-w-xl p-5"
      >
        <VisuallyHidden>
          <DialogTitle id="age-gate-title-hidden">성인 확인</DialogTitle>
        </VisuallyHidden>
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">성인 확인</DialogTitle>
          <DialogDescription className="mt-1 text-xs sm:text-sm">
            본 서비스는 로또 관련 콘텐츠를 포함하며, 대한민국 기준 만 19세
            미만의 이용은 제한됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5 sm:mt-6">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AgeGateDialogComponent;
