'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LOTTO_MAX_HISTORY_RANGE } from '@/constants/lotto.constant';
import { Label } from '@radix-ui/react-label';
import { useEffect, useMemo, useState } from 'react';

export function LottoHistorySearchComponent({
  initRange,
  onSearch,
}: {
  initRange: { from: number; to: number; enabled: boolean };
  onSearch: (range: { from: number; to: number; enabled: boolean }) => void;
}) {
  const [fromInput, setFromInput] = useState<string>(String(initRange.from));
  const [toInput, setToInput] = useState<string>(String(initRange.to));

  const onlyDigits = (v: string): boolean => v === '' || /^[0-9]+$/.test(v);
  const stripLeadingZeros = (v: string): string => v.replace(/^0+(?=\d)/, '');
  const toInt = (v: string): number => Number(v || NaN);
  const normalize = (v: string, min: number): string => {
    const cleaned = stripLeadingZeros(v);
    const n = Number(cleaned);
    if (!Number.isFinite(n) || cleaned === '') return String(min);
    return String(Math.max(n, min));
  };

  const canSearch = useMemo(
    () =>
      Number.isInteger(toInt(fromInput)) &&
      Number.isInteger(toInt(toInput)) &&
      toInt(fromInput) > 0 &&
      toInt(toInput) >= toInt(fromInput),
    [fromInput, toInput]
  );

  // 조회
  const handleSearch = () => {
    if (!canSearch) return;
    const from = Number(normalize(fromInput, 1));
    const rawTo = Number(normalize(toInput, from + 1));
    const minTo = from + 1;
    const maxTo = from + LOTTO_MAX_HISTORY_RANGE; // 포함 기준: from..from+500
    const to = Math.max(minTo, Math.min(rawTo, maxTo));
    onSearch({ from, to, enabled: true });
  };

  useEffect(() => {
    setFromInput(String(initRange.from));
    setToInput(String(initRange.to));
  }, [initRange]);

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="flex items-center gap-2">
        <Label htmlFor="from" className="w-16 text-sm">
          From
        </Label>
        <Input
          id="from"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={fromInput}
          onChange={(e) => {
            const v = e.target.value;
            if (onlyDigits(v)) setFromInput(v);
          }}
          onBlur={() => {
            // from 정규화 + 현재 to를 from 앵커 기준으로 즉시 클램프
            const safeFrom = Number(normalize(fromInput, 1));
            setFromInput(String(safeFrom));
            const rawTo = Number(normalize(toInput, safeFrom + 1));
            const minTo = safeFrom + 1;
            const maxTo = safeFrom + LOTTO_MAX_HISTORY_RANGE;
            const safeTo = Math.max(minTo, Math.min(rawTo, maxTo));
            setToInput(String(safeTo));
          }}
          className="w-full text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="to" className="w-16 text-sm">
          To
        </Label>
        <Input
          id="to"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={toInput}
          onChange={(e) => {
            const v = e.target.value;
            if (onlyDigits(v)) setToInput(v);
          }}
          onBlur={() => {
            const f = Number(normalize(fromInput, 1));
            const rawTo = Number(normalize(toInput, f + 1));
            const minTo = f + 1;
            const maxTo = f + LOTTO_MAX_HISTORY_RANGE;
            const safeTo = Math.max(minTo, Math.min(rawTo, maxTo));
            setToInput(String(safeTo));
          }}
          className="w-full text-sm"
        />
      </div>
      <div className="flex items-end">
        <Button
          type="button"
          onClick={handleSearch}
          disabled={!canSearch}
          variant="secondary"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          조회
        </Button>
      </div>
      <div className="sm:col-span-3 text-xs text-muted-foreground">
        최대 {LOTTO_MAX_HISTORY_RANGE}회차까지 조회됩니다. (예: from=400 → to≤
        {400 + LOTTO_MAX_HISTORY_RANGE})
      </div>
    </div>
  );
}
