'use client';

import { ComponentProps, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useCreditStore } from '@/stores';
import { SPEND_COST } from '@/constants';
// TODO(reward-ads): 보상형 광고 모달 비활성화
// import { RewardModalComponent } from '@/components';

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
  // const [open, setOpen] = useState<boolean>(false);
  const { total, canSpend, onSpend } = useCreditStore();
  const amount = useMemo<number>(
    () =>
      typeof amountOverride === 'number'
        ? amountOverride
        : SPEND_COST[spendKey],
    [spendKey, amountOverride]
  );
  const insufficient = useMemo<boolean>(() => total < amount, [total, amount]);

  const handleClick = (): void => {
    // TODO(reward-ads): 보상형 광고 충전 유도 비활성화. 부족해도 그대로 진행 판단.
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
        // 실제 클릭은 막지 않고, 시각적으로는 비활성처럼 보이게만 처리(aria)
        aria-disabled={insufficient}
        onClick={handleClick}
      >
        {label}
      </Button>
      {/* TODO(reward-ads): 보상형 광고 모달 비활성화 */}
      {/* {open && <RewardModalComponent onOpenChange={setOpen} />} */}
    </>
  );
}

export default CreditGateButtonComponent;
