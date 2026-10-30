'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { LottoAgeGateDialogType } from '@/features/lotto/types/lotto.type';

/**
 * Controlled age-gate dialog. Closes only via the two buttons (onCancel / onConfirm);
 * X, dim click and Esc are disabled.
 */
export function AgeGateDialogComponent({
  open,
  onConfirm,
  onCancel,
}: LottoAgeGateDialogType) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="z-[1001] w-full max-w-sm sm:max-w-sm p-6 sm:p-8"
        showCloseButton={false}
        // dim 클릭, Esc로는 닫히지 않음 (버튼으로만 닫힘)
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-center gap-3 text-center sm:text-center">
          <div
            aria-hidden
            className="flex size-14 items-center justify-center rounded-full border-2 border-destructive text-lg font-bold text-destructive"
          >
            19
          </div>
          <DialogTitle className="text-lg sm:text-xl">성인 확인</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            본 서비스는 로또 관련 콘텐츠를 포함하며,
            <br />
            대한민국 기준 만 19세 미만의 이용은 제한됩니다.
          </DialogDescription>
        </DialogHeader>
        <p className="rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
          동의하지 않으시면 로또 서비스를 이용할 수 없으며 홈으로 이동합니다.
        </p>
        <DialogFooter className="grid grid-cols-2 gap-2 sm:flex-none">
          <Button type="button" variant="outline" onClick={onCancel}>
            동의하지 않음
          </Button>
          <Button type="button" onClick={onConfirm}>
            만 19세 이상입니다
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
