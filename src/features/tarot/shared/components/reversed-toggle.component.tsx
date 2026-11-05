'use client';

import { type JSX, useId } from 'react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  TAROT_REVERSED_TOGGLE_HINT,
  TAROT_REVERSED_TOGGLE_LABEL,
} from '@/features/tarot/constants/tarot-notice.constant';

export type TarotReversedToggleComponentPropsType = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

/**
 * TarotReversedToggleComponent
 * - 역방향 사용 스위치(Controlled). idle일 때만 부모가 렌더링한다.
 */
export function TarotReversedToggleComponent({
  checked,
  onCheckedChange,
}: TarotReversedToggleComponentPropsType): JSX.Element {
  const baseId = useId();
  const switchId = `${baseId}-switch`;
  const hintId = `${baseId}-hint`;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={switchId} className="text-sm font-medium">
          {TAROT_REVERSED_TOGGLE_LABEL}
        </Label>
        <Switch
          id={switchId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-describedby={hintId}
        />
      </div>
      <p
        id={hintId}
        className="max-w-[68ch] text-xs leading-5 text-muted-foreground"
      >
        {TAROT_REVERSED_TOGGLE_HINT}
      </p>
    </div>
  );
}
