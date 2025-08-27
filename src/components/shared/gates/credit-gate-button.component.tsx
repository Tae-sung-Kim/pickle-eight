'use client';

import { ComponentProps, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreditStore } from '@/stores/credit.store';
import { SPEND_COST } from '@/constants/credit.constant';
import RewardModalComponent from '@/components/shared/reward/reward-modal.component';

export type CreditGateButtonType = {
  readonly variant?: ComponentProps<typeof Button>['variant'];
  readonly className?: string;
  readonly label: string;
  readonly spendKey: keyof typeof SPEND_COST;
  readonly onProceed: () => void;
  readonly disabled?: boolean;
};

export function CreditGateButtonComponent({
  variant,
  className,
  label,
  spendKey,
  onProceed,
  disabled,
}: CreditGateButtonType) {
  const [open, setOpen] = useState<boolean>(false);
  const { canSpend, spend } = useCreditStore();
  const amount = useMemo<number>(() => SPEND_COST[spendKey], [spendKey]);

  const handleClick = (): void => {
    if (disabled) return;
    const check = canSpend(amount);
    if (!check.canSpend) {
      setOpen(true);
      return;
    }
    const res = spend(amount);
    if (res.canSpend) onProceed();
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={className}
        disabled={disabled}
        onClick={handleClick}
      >
        {label}
      </Button>
      <RewardModalComponent open={open} onOpenChange={setOpen} />
    </>
  );
}

export default CreditGateButtonComponent;
