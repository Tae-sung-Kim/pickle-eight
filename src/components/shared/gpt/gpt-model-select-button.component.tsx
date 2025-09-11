'use client';

import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import CreditGateButtonComponent from '@/components/shared/credit/credit-gate-button.component';
import { GPT_MODEL_ENUM, GPT_MODEL_LABEL } from '@/constants';
import { creditBuildCostLabel, getModelCost, isPaidModel } from '@/utils';
import { GptModelSelectButtonType } from '@/types';

export type GptModelSelectButtonInternalProps = GptModelSelectButtonType & {
  readonly disabled?: boolean;
};

export function GptModelSelectButtonComponent({
  model,
  onModelChange,
  onProceed,
  isBusy = false,
  className,
  triggerSize = 'default',
  buttonLabel = 'Generate',
  allowed,
  disabled = false,
}: GptModelSelectButtonInternalProps) {
  const options: readonly GPT_MODEL_ENUM[] = useMemo<
    readonly GPT_MODEL_ENUM[]
  >(() => {
    return Array.isArray(allowed) && allowed.length > 0
      ? allowed
      : [
          GPT_MODEL_ENUM.BASIC,
          GPT_MODEL_ENUM.STANDARD,
          GPT_MODEL_ENUM.PLUS,
          GPT_MODEL_ENUM.PREMIUM,
        ];
  }, [allowed]);

  const cost: number = useMemo<number>(() => getModelCost(model), [model]);
  const paid: boolean = useMemo<boolean>(() => isPaidModel(model), [model]);
  const proceedLabel: string = useMemo<string>(
    () =>
      creditBuildCostLabel({
        spendKey: 'advanced',
        baseLabel: buttonLabel,
        isBusy,
        amountOverride: cost,
      }),
    [buttonLabel, isBusy, cost]
  );

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Select value={model} onValueChange={onModelChange}>
          <SelectTrigger
            size={triggerSize}
            aria-label="Select GPT model"
            className="cursor-pointer"
          >
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {options.map((key) => (
              <SelectItem key={key} value={key} className="cursor-pointer">
                {GPT_MODEL_LABEL[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {disabled ? (
          <Button type="button" variant="default" disabled aria-disabled>
            {buttonLabel}
          </Button>
        ) : paid ? (
          <CreditGateButtonComponent
            variant="default"
            label={proceedLabel}
            spendKey={'advanced'}
            amountOverride={cost}
            onProceed={onProceed}
            deferSpend={false}
          />
        ) : (
          <Button
            type="button"
            variant="default"
            onClick={onProceed}
            aria-disabled={isBusy}
            disabled={isBusy}
          >
            {buttonLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default GptModelSelectButtonComponent;
