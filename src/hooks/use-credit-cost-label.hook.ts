import { SPEND_COST } from '@/constants';
import { CreditCostLabelType } from '@/types';

export function useCreditCostLabel({
  spendKey,
  baseLabel,
  isBusy = false,
  busyLabel = `${baseLabel} 중…`,
  amountOverride,
}: CreditCostLabelType & { amountOverride?: number }): string {
  if (isBusy) return busyLabel;
  const amount =
    typeof amountOverride === 'number' ? amountOverride : SPEND_COST[spendKey];
  return `${baseLabel}(-${amount})`;
}

export default useCreditCostLabel;
