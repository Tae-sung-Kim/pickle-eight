'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LOTTO_MAX_HISTORY_RANGE } from '@/features/lotto/constants/lotto.constant';
import type { LottoAnalysisControlsType } from '@/features/lotto/types/lotto.type';

export function LottoAnalysisControlsComponent({
  from,
  to,
  setFrom,
  setTo,
  isFetching,
  onAnalyze,
  headerAction,
}: LottoAnalysisControlsType) {
  const [fromText, setFromText] = useState<string>(String(from ?? ''));
  const [toText, setToText] = useState<string>(String(to ?? ''));
  useEffect(() => {
    setFromText(String(from ?? ''));
  }, [from]);
  useEffect(() => {
    setToText(String(to ?? ''));
  }, [to]);

  // from 값을 기준(anchor)으로 강제: 허용 구간은 [from+1, from+MAX]
  const clampFromAnchor = (f: number): number => {
    if (!Number.isInteger(f)) return f;
    return Math.max(1, f);
  };

  const clampToByFrom = (f: number, t: number): number => {
    if (!Number.isInteger(f) || !Number.isInteger(t)) return t;
    const minToAllowed = f + 1;
    const maxToAllowed = f + LOTTO_MAX_HISTORY_RANGE; // 예: from=400 → maxTo=900
    return Math.max(minToAllowed, Math.min(t, maxToAllowed));
  };

  const handleAnalyze = (): void => {
    const f0 = Number.isFinite(parseInt(fromText, 10))
      ? parseInt(fromText, 10)
      : from;
    const safeFrom = clampFromAnchor(f0);
    if (safeFrom !== from) {
      setFrom(safeFrom);
      setFromText(String(safeFrom));
    }
    const t0 = Number.isFinite(parseInt(toText, 10))
      ? parseInt(toText, 10)
      : to;
    const safeTo = clampToByFrom(safeFrom, t0);
    if (safeTo !== to) {
      setTo(safeTo);
      setToText(String(safeTo));
    }
    onAnalyze();
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base">분석 범위</CardTitle>
          {headerAction && (
            <div className="sm:ml-3 self-start sm:self-auto">
              {headerAction}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="grid grid-cols-5 items-center gap-2">
            <Label
              htmlFor="from"
              className="col-span-2 text-sm text-muted-foreground"
            >
              From
            </Label>
            <Input
              id="from"
              type="text"
              inputMode="numeric"
              value={fromText}
              onChange={(e) => setFromText(e.target.value)}
              onBlur={(e) => {
                const raw = parseInt(e.target.value, 10);
                if (!Number.isFinite(raw)) return;
                const safeFrom = clampFromAnchor(raw);
                setFrom(safeFrom);
                setFromText(String(safeFrom));
                // from 기준으로 현재 to를 즉시 보정
                const t0 = Number.isFinite(parseInt(toText, 10))
                  ? parseInt(toText, 10)
                  : to;
                const safeTo = clampToByFrom(safeFrom, t0);
                setTo(safeTo);
                setToText(String(safeTo));
              }}
              min={1}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-5 items-center gap-2">
            <Label
              htmlFor="to"
              className="col-span-2 text-sm text-muted-foreground"
            >
              To
            </Label>
            <Input
              id="to"
              type="text"
              inputMode="numeric"
              value={toText}
              onChange={(e) => setToText(e.target.value)}
              onBlur={(e) => {
                const raw = parseInt(e.target.value, 10);
                if (!Number.isFinite(raw)) return;
                const f0 = Number.isFinite(parseInt(fromText, 10))
                  ? parseInt(fromText, 10)
                  : from;
                const safeFrom = clampFromAnchor(f0);
                const safeTo = clampToByFrom(safeFrom, raw);
                setTo(safeTo);
                setToText(String(safeTo));
              }}
              min={from + 1}
              className="col-span-3"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-end gap-2 sm:gap-3">
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={isFetching}
              onClick={handleAnalyze}
            >
              {isFetching ? '분석 중…' : '분석'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-3">
            최대 조회 범위: {LOTTO_MAX_HISTORY_RANGE} 회차(예: from=400 →
            to≤900). 입력값은 자동으로 제한됩니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
