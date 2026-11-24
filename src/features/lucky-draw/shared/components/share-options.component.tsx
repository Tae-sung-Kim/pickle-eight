'use client';

import { Info } from 'lucide-react';
import { type JSX, useId } from 'react';

import { Switch } from '@/components/ui/switch';
import { SHARE_TEXTS } from '@/constants/share.constant';

type LuckyDrawShareOptionsPropsType = Readonly<{
  isMasked: boolean;
  onMaskedChange: (value: boolean) => void;
  /** 돌림판만 넘긴다. undefined이면 후보 목록 스위치를 그리지 않는다 */
  shouldIncludeCandidates?: boolean;
  onIncludeCandidatesChange?: (value: boolean) => void;
}>;

type SwitchRowPropsType = Readonly<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}>;

function SwitchRow({
  label,
  description,
  checked,
  onChange,
}: SwitchRowPropsType): JSX.Element {
  const id = useId();
  const descId = `${id}-desc`;
  return (
    <div className="rounded-md px-2 py-1 hover:bg-muted/50">
      <label
        htmlFor={id}
        className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm font-semibold leading-6 text-foreground"
      >
        <span>{label}</span>
        <Switch
          id={id}
          checked={checked}
          aria-describedby={descId}
          onCheckedChange={onChange}
        />
      </label>
      <p id={descId} className="pb-1 text-sm leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/**
 * LuckyDrawShareOptionsComponent
 * - 공유 미리보기 안 옵션. 이름 가리기, 후보 목록 넣기(돌림판만).
 * - 만드는 중에도 켜고 끌 수 있다(카드가 바뀌면 다시 만든다).
 */
export function LuckyDrawShareOptionsComponent({
  isMasked,
  onMaskedChange,
  shouldIncludeCandidates,
  onIncludeCandidatesChange,
}: LuckyDrawShareOptionsPropsType): JSX.Element {
  return (
    <div className="space-y-1">
      <SwitchRow
        label={SHARE_TEXTS.maskSwitchLabel}
        description={SHARE_TEXTS.maskSwitchDescription}
        checked={isMasked}
        onChange={onMaskedChange}
      />
      {isMasked ? null : (
        <p className="flex items-start gap-2 px-2 text-sm leading-5 text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{SHARE_TEXTS.maskOffNotice}</span>
        </p>
      )}
      {shouldIncludeCandidates === undefined ||
      !onIncludeCandidatesChange ? null : (
        <SwitchRow
          label={SHARE_TEXTS.candidatesSwitchLabel}
          description={SHARE_TEXTS.candidatesSwitchDescription}
          checked={shouldIncludeCandidates}
          onChange={onIncludeCandidatesChange}
        />
      )}
    </div>
  );
}
