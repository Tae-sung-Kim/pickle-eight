import { CREDIT_SPEND_COST, GPT_MODEL_ENUM } from '@/constants';
import { CreditCostLabelType } from '@/types';

export const formatCooldown = (ms: number): string => {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m${s}s`;
};

export const creditBuildCostLabel = ({
  spendKey,
  baseLabel,
  isBusy = false,
  busyLabel = `${baseLabel} 중…`,
  amountOverride,
}: CreditCostLabelType & { amountOverride?: number }): string => {
  if (isBusy) return busyLabel;
  const amount: number =
    typeof amountOverride === 'number'
      ? amountOverride
      : CREDIT_SPEND_COST[spendKey];
  return `${baseLabel}(-${amount})`;
};

export function isPaidModel(model: string): boolean {
  return model === GPT_MODEL_ENUM.PLUS;
}
