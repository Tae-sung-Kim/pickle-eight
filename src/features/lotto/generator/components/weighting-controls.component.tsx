'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { LottoWeightingControlsType } from '@/features/lotto/types/lotto.type';

export function LottoGeneratorWeightingControlsComponent({
  useWeight,
  loading,
  from,
  to,
  excludeLatest,
  onToggleUseWeight,
  onChangeFrom,
  onChangeTo,
  onToggleExcludeLatest,
}: LottoWeightingControlsType) {
  const [fromText, setFromText] = useState<string>(String(from ?? ''));
  const [toText, setToText] = useState<string>(String(to ?? ''));
  useEffect(() => setFromText(String(from ?? '')), [from]);
  useEffect(() => setToText(String(to ?? '')), [to]);

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
      <p className="text-xs leading-relaxed text-muted-foreground">
        과거 출현 빈도에 따라 번호가 뽑힐 비율을 조정합니다. 로또 추첨은 매 회
        독립적이라 당첨 확률은 달라지지 않으며, 재미로 참고하는 기능입니다.
      </p>
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
              type="text"
              inputMode="numeric"
              min={1}
              value={fromText}
              onChange={(e) => setFromText(e.target.value)}
              onBlur={(e) => {
                const n = Number.parseInt(e.target.value, 10);
                if (Number.isFinite(n)) onChangeFrom(n);
              }}
              disabled={loading}
            />
          </div>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="text"
              inputMode="numeric"
              min={from}
              value={toText}
              onChange={(e) => setToText(e.target.value)}
              onBlur={(e) => {
                const n = Number.parseInt(e.target.value, 10);
                if (Number.isFinite(n)) onChangeTo(n);
              }}
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
