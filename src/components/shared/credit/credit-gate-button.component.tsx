'use client';

import { ComponentProps, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useCreditStore } from '@/stores';
import { CREDIT_SPEND_COST } from '@/constants';
import { useConsentContext } from '@/providers';
import { toast } from 'sonner';
import { spendCredits } from '@/services';

export type CreditGateButtonType = {
  readonly variant?: ComponentProps<typeof Button>['variant'];
  readonly className?: string;
  readonly label: string;
  readonly spendKey: keyof typeof CREDIT_SPEND_COST;
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
  const { total, setServerSync } = useCreditStore();
  const { state: consentState } = useConsentContext();
  const amount = useMemo<number>(
    () =>
      typeof amountOverride === 'number'
        ? amountOverride
        : CREDIT_SPEND_COST[spendKey],
    [spendKey, amountOverride]
  );
  const insufficient = useMemo<boolean>(() => total < amount, [total, amount]);
  const consentBlocked = consentState !== 'accepted';

  const handleClick = async (): Promise<void> => {
    if (consentBlocked) {
      toast.error(
        '광고 및 쿠키에 동의해야 크레딧 사용이 가능합니다. 하단 배너에서 동의를 진행하세요.'
      );
      return;
    }
    // Optional confirm
    if (typeof confirmMessage === 'string' && confirmMessage.length > 0) {
      const ok = window.confirm(confirmMessage);
      if (!ok) return;
    }
    if (deferSpend) {
      // Caller will handle spend server-side separately
      onProceed();
      return;
    }
    try {
      const res = await spendCredits(amount);
      if (res.ok) {
        setServerSync({
          credits: res.credits,
          lastRefillAt: res.lastRefillAt,
          refillArmed: res.refillArmed,
        });
        onProceed();
        return;
      }
      // not ok: sync latest credits if provided and notify
      if (typeof res.credits === 'number')
        setServerSync({
          credits: res.credits,
          lastRefillAt: res.lastRefillAt,
          refillArmed: res.refillArmed,
        });
      toast.error('크레딧이 부족하거나 요청을 처리할 수 없습니다.');
    } catch (e) {
      toast.error(
        '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' + e
      );
    }
  };

  return (
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
  );
}

export default CreditGateButtonComponent;
