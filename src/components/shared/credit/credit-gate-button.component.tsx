'use client';

import {
  ComponentProps,
  useMemo,
  // useState
} from 'react';
import { Button } from '@/components/ui/button';
import { useCreditStore } from '@/stores';
import { SPEND_COST } from '@/constants';
// import { RewardModalComponent } from '@/components';

export type CreditGateButtonType = {
  readonly variant?: ComponentProps<typeof Button>['variant'];
  readonly className?: string;
  readonly label: string;
  readonly spendKey: keyof typeof SPEND_COST;
  readonly onProceed: () => void;
  readonly amountOverride?: number;
};

export function CreditGateButtonComponent({
  variant,
  className,
  label,
  spendKey,
  onProceed,
  amountOverride,
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
    // 부족하면 보상 모달을 열어 충전 유도
    if (insufficient) {
      // setOpen(true);
      return;
    }
    const check = canSpend(amount);
    if (!check.canSpend) {
      // setOpen(true);
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
      {/* {open && <RewardModalComponent onOpenChange={setOpen} />} */}
    </>
  );
}

export default CreditGateButtonComponent;
