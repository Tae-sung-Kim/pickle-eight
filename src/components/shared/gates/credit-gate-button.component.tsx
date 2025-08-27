'use client';

import { ComponentProps, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreditStore } from '@/stores';
import { SPEND_COST } from '@/constants';
import { RewardModalComponent } from '@/components';

export type CreditGateButtonType = {
  readonly variant?: ComponentProps<typeof Button>['variant'];
  readonly className?: string;
  readonly label: string;
  readonly spendKey: keyof typeof SPEND_COST;
  readonly onProceed: () => void;
};

export function CreditGateButtonComponent({
  variant,
  className,
  label,
  spendKey,
  onProceed,
}: CreditGateButtonType) {
  const [open, setOpen] = useState<boolean>(false);
  const { total, canSpend, onSpend } = useCreditStore();
  const amount = useMemo<number>(() => SPEND_COST[spendKey], [spendKey]);
  const insufficient = useMemo<boolean>(() => total < amount, [total, amount]);

  const handleClick = (): void => {
    if (insufficient) return;
    const check = canSpend(amount);
    if (!check.canSpend) {
      setOpen(true);
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
        disabled={insufficient}
        aria-disabled={insufficient}
        onClick={handleClick}
      >
        {label}
      </Button>
      {open && <RewardModalComponent onOpenChange={setOpen} />}
    </>
  );
}

export default CreditGateButtonComponent;
