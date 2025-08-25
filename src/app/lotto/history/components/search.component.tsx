'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

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
    const to = Number(normalize(toInput, from));
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
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={fromInput}
          onChange={(e) => {
            const v = e.target.value;
            if (onlyDigits(v)) setFromInput(v);
          }}
          onBlur={() => setFromInput((v) => normalize(v, 1))}
          className="w-full text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="to" className="w-16 text-sm">
          To
        </Label>
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={toInput}
          onChange={(e) => {
            const v = e.target.value;
            if (onlyDigits(v)) setToInput(v);
          }}
          onBlur={() =>
            setToInput((v) => normalize(v, Math.max(1, toInt(fromInput))))
          }
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
    </div>
  );
}

export default LottoHistorySearchComponent;
