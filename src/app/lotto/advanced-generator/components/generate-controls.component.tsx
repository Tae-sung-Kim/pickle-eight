'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LottoGenerateControlsType } from '@/features/lotto/types/lotto.type';

// "7, 21 3" -> [3, 7, 21] (1~45 정수만, 중복 제거)
function parseNumberList(text: string): number[] {
  const nums = text
    .split(/[ ,]+/)
    .map((x) => Number(x))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 45);
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

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

  const [fixedText, setFixedText] = useState<string>(
    (filters.fixedNumbers ?? []).join(', ')
  );
  const [excludeText, setExcludeText] = useState<string>(
    (filters.excludeNumbers ?? []).join(', ')
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
    setFixedText((filters.fixedNumbers ?? []).join(', '));
    setExcludeText((filters.excludeNumbers ?? []).join(', '));
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="fixedNumbers">고정 번호 (반드시 포함)</Label>
          <Input
            id="fixedNumbers"
            type="text"
            placeholder="예: 7, 21"
            value={fixedText}
            onChange={(e) => setFixedText(e.target.value)}
            onBlur={(e) => {
              const nums = parseNumberList(e.target.value);
              onChangeFilters((p) => ({
                ...p,
                fixedNumbers: nums.length > 0 ? nums : undefined,
              }));
            }}
          />
        </div>
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="excludeNumbers">제외 번호</Label>
          <Input
            id="excludeNumbers"
            type="text"
            placeholder="예: 4, 13, 44"
            value={excludeText}
            onChange={(e) => setExcludeText(e.target.value)}
            onBlur={(e) => {
              const nums = parseNumberList(e.target.value);
              onChangeFilters((p) => ({
                ...p,
                excludeNumbers: nums.length > 0 ? nums : undefined,
              }));
            }}
          />
        </div>
      </div>
    </div>
  );
}
