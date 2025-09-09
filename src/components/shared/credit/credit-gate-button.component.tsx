'use client';

import { ComponentProps, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useCreditStore } from '@/stores';
import { SPEND_COST } from '@/constants';
import { useConsentContext } from '@/providers';
import { toast } from 'sonner';

export type CreditGateButtonType = {
  readonly variant?: ComponentProps<typeof Button>['variant'];
  readonly className?: string;
  readonly label: string;
  readonly spendKey: keyof typeof SPEND_COST;
  readonly onProceed: () => void;
  readonly amountOverride?: number;
  readonly confirmMessage?: string; // optional confirm before proceeding
  readonly deferSpend?: boolean; // if true, do not deduct here (caller will deduct after success)
};

export function CreditGateButtonComponent({
  variant,
  className,
  label,
  spendKey,
  onProceed,
  amountOverride,
  confirmMessage,
  deferSpend,
}: CreditGateButtonType) {
  const { total, canSpend, onSpend } = useCreditStore();
  const { state: consentState } = useConsentContext();
  const amount = useMemo<number>(
    () =>
      typeof amountOverride === 'number'
        ? amountOverride
        : SPEND_COST[spendKey],
    [spendKey, amountOverride]
  );
  const insufficient = useMemo<boolean>(() => total < amount, [total, amount]);
  const consentBlocked = consentState !== 'accepted';

  const handleClick = (): void => {
    if (consentBlocked) {
      toast.error(
        '광고 및 쿠키에 동의해야 크레딧 사용이 가능합니다. 하단 배너에서 동의를 진행하세요.'
      );
      return;
    }
    if (insufficient) return; // 필요 시 별도 안내 토스트로 대체 가능
    const check = canSpend(amount);
    if (!check.canSpend) {
      return;
    }
    // Optional confirm
    if (typeof confirmMessage === 'string' && confirmMessage.length > 0) {
      const ok = window.confirm(confirmMessage);
      if (!ok) return;
    }
    // Defer spending to caller if requested
    if (deferSpend) {
      onProceed();
      return;
    }
    const res = onSpend(amount);
    if (res.canSpend) onProceed();
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={className}
        // 동의 미수락 또는 크레딧 부족 시 비활성화 표시
        aria-disabled={consentBlocked || insufficient}
        onClick={handleClick}
      >
        {label}
      </Button>
    </>
  );
}

export default CreditGateButtonComponent;
