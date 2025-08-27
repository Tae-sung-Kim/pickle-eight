'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export type WeightingControlsType = {
  readonly useWeight: boolean;
  readonly loading: boolean;
  readonly from: number;
  readonly to: number;
  readonly excludeLatest: boolean;
  readonly onToggleUseWeight: (next: boolean) => void;
  readonly onChangeFrom: (next: number) => void;
  readonly onChangeTo: (next: number) => void;
  readonly onToggleExcludeLatest: (next: boolean) => void;
};

export function LottoAdvancedWeightingControlsComponent({
  useWeight,
  loading,
  from,
  to,
  excludeLatest,
  onToggleUseWeight,
  onChangeFrom,
  onChangeTo,
  onToggleExcludeLatest,
}: WeightingControlsType) {
  return (
    <div className="space-y-3" aria-busy={loading}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">가중치(핫/콜드) 사용</div>
        <Switch
          className="cursor-pointer"
          checked={useWeight}
          onCheckedChange={onToggleUseWeight}
          disabled={loading}
        />
      </div>
      {useWeight && loading && (
        <div className="text-xs text-muted-foreground">
          최신 회차 기준 범위를 불러오는 중...
        </div>
      )}
      {useWeight && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              type="number"
              min={1}
              value={from}
              onChange={(e) => onChangeFrom(Number(e.target.value))}
              disabled={loading}
            />
          </div>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="number"
              min={from}
              value={to}
              onChange={(e) => onChangeTo(Number(e.target.value))}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-3 pt-1.5">
            <Label htmlFor="excludeLatest" className="text-sm">
              최근번호 제외
            </Label>
            <Switch
              id="excludeLatest"
              className="cursor-pointer"
              checked={excludeLatest}
              onCheckedChange={onToggleExcludeLatest}
              disabled={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default LottoAdvancedWeightingControlsComponent;
