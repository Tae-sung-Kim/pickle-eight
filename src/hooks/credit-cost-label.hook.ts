import { SPEND_COST } from '@/constants';
import { UseCreditCostLabelType } from '@/types';

export function useCreditCostLabel({
  spendKey,
  baseLabel,
  isBusy = false,
  busyLabel = `${baseLabel} 중…`,
}: UseCreditCostLabelType): string {
  if (isBusy) return busyLabel;
  const cost = SPEND_COST[spendKey];
  return `${baseLabel}(-${cost})`;
}

export default useCreditCostLabel;
