'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { LottoGenerateControlsType } from '@/types';

export function LottoAdvancedGenerateControlsComponent({
  count,
  filters,
  onChangeCount,
  onChangeFilters,
}: LottoGenerateControlsType) {
  const [countText, setCountText] = useState<string>(String(count ?? ''));
  const [sumMinText, setSumMinText] = useState<string>(
    filters.sumMin === undefined ? '' : String(filters.sumMin)
  );
  const [sumMaxText, setSumMaxText] = useState<string>(
    filters.sumMax === undefined ? '' : String(filters.sumMax)
  );
  const [maxConsecutiveText, setMaxConsecutiveText] = useState<string>(
    String(filters.maxConsecutive ?? 6)
  );
  const [oddCountText, setOddCountText] = useState<string>(
    filters.desiredOddCount === undefined ? '' : String(filters.desiredOddCount)
  );
  const [minBucketSpreadText, setMinBucketSpreadText] = useState<string>(
    filters.minBucketSpread === undefined ? '' : String(filters.minBucketSpread)
  );

  useEffect(() => setCountText(String(count ?? '')), [count]);
  useEffect(() => {
    setSumMinText(filters.sumMin === undefined ? '' : String(filters.sumMin));
    setSumMaxText(filters.sumMax === undefined ? '' : String(filters.sumMax));
    setMaxConsecutiveText(String(filters.maxConsecutive ?? 6));
    setOddCountText(
      filters.desiredOddCount === undefined
        ? ''
        : String(filters.desiredOddCount)
    );
    setMinBucketSpreadText(
      filters.minBucketSpread === undefined
        ? ''
        : String(filters.minBucketSpread)
    );
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="count">생성 매수</Label>
          <Input
            id="count"
            type="text"
            inputMode="numeric"
            min={1}
            max={50}
            value={countText}
            onChange={(e) => {
              const v = e.target.value;
              setCountText(v);
              const n = parseInt(v, 10);
              if (Number.isFinite(n)) {
                const clamped = Math.min(50, Math.max(1, n));
                onChangeCount(clamped);
              }
            }}
            onKeyDown={(e) => {
              const allowed = [
                'Backspace',
                'Delete',
                'ArrowLeft',
                'ArrowRight',
                'Tab',
              ];
              if (allowed.includes(e.key)) return;
              if (!/^[0-9]$/.test(e.key)) {
                e.preventDefault();
              }
            }}
            onBlur={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!Number.isFinite(n)) {
                setCountText('1');
                onChangeCount(1);
                return;
              }
              const clamped = Math.min(50, Math.max(1, n));
              if (String(clamped) !== countText) setCountText(String(clamped));
              onChangeCount(clamped);
            }}
          />
        </div>
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="sumMin">합계 최소</Label>
          <Input
            id="sumMin"
            type="text"
            inputMode="numeric"
            value={sumMinText}
            onChange={(e) => setSumMinText(e.target.value)}
            onBlur={(e) => {
              const v = e.target.value.trim();
              onChangeFilters((p) => ({
                ...p,
                sumMin: v === '' ? undefined : Number.parseInt(v, 10),
              }));
            }}
          />
        </div>
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="sumMax">합계 최대</Label>
          <Input
            id="sumMax"
            type="text"
            inputMode="numeric"
            value={sumMaxText}
            onChange={(e) => setSumMaxText(e.target.value)}
            onBlur={(e) => {
              const v = e.target.value.trim();
              onChangeFilters((p) => ({
                ...p,
                sumMax: v === '' ? undefined : Number.parseInt(v, 10),
              }));
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="maxConsecutive">최대 연속수</Label>
          <Input
            id="maxConsecutive"
            type="text"
            inputMode="numeric"
            min={0}
            max={6}
            value={maxConsecutiveText}
            onChange={(e) => setMaxConsecutiveText(e.target.value)}
            onBlur={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              onChangeFilters((p) => ({
                ...p,
                maxConsecutive: Number.isFinite(n) ? n : p.maxConsecutive,
              }));
            }}
          />
        </div>
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="oddCount">홀수 개수</Label>
          <Input
            id="oddCount"
            type="text"
            inputMode="numeric"
            min={0}
            max={6}
            value={oddCountText}
            onChange={(e) => setOddCountText(e.target.value)}
            onBlur={(e) => {
              const v = e.target.value.trim();
              onChangeFilters((p) => ({
                ...p,
                desiredOddCount: v === '' ? undefined : Number.parseInt(v, 10),
              }));
            }}
          />
        </div>
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="minBucketSpread">구간 최소개수</Label>
          <Input
            id="minBucketSpread"
            type="text"
            inputMode="numeric"
            min={1}
            max={5}
            value={minBucketSpreadText}
            onChange={(e) => setMinBucketSpreadText(e.target.value)}
            onBlur={(e) => {
              const v = e.target.value.trim();
              onChangeFilters((p) => ({
                ...p,
                minBucketSpread: v === '' ? undefined : Number.parseInt(v, 10),
              }));
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default LottoAdvancedGenerateControlsComponent;
