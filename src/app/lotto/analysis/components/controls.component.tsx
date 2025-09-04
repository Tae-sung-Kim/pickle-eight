'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  CreditBalancePillComponent,
  CreditGateButtonComponent,
} from '@/components';
import { useAdCredit } from '@/hooks';
import { useEffect, useState } from 'react';
import { LottoAnalysisControlsType } from '@/types';

export function LottoAnalysisControlsComponent({
  from,
  to,
  setFrom,
  setTo,
  isFetching,
  onAnalyze,
}: LottoAnalysisControlsType) {
  const [fromText, setFromText] = useState<string>(String(from ?? ''));
  const [toText, setToText] = useState<string>(String(to ?? ''));
  useEffect(() => {
    setFromText(String(from ?? ''));
  }, [from]);
  useEffect(() => {
    setToText(String(to ?? ''));
  }, [to]);

  // 실시간 크레딧 계산: 입력 텍스트 기준으로 우선 계산
  const parsedFrom = Number.isFinite(parseInt(fromText, 10))
    ? parseInt(fromText, 10)
    : from;
  const parsedTo = Number.isFinite(parseInt(toText, 10))
    ? parseInt(toText, 10)
    : to;
  const liveRange =
    Number.isInteger(parsedFrom) &&
    Number.isInteger(parsedTo) &&
    parsedTo > parsedFrom
      ? parsedTo - parsedFrom
      : 0;
  const liveCapped = Math.min(200, Math.max(0, liveRange));
  const liveIncrements =
    liveCapped > 0 ? Math.floor((Math.max(1, liveCapped) - 1) / 30) : 0;
  const amountOverride = 3 + liveIncrements; // SPEND_COST.analysis=3 기준
  const { buildCostLabel } = useAdCredit();

  const label = buildCostLabel({
    spendKey: 'analysis',
    baseLabel: '분석',
    isBusy: isFetching,
    busyLabel: '분석 중…',
    amountOverride,
  });

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">분석 범위</CardTitle>
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
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setFrom(n);
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
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setTo(n);
              }}
              min={from + 1}
              className="col-span-3"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-end gap-2 sm:gap-3">
            <CreditGateButtonComponent
              className="w-full sm:w-auto"
              label={label}
              spendKey="analysis"
              onProceed={onAnalyze}
              amountOverride={amountOverride}
            />
            <CreditBalancePillComponent className="self-end sm:self-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LottoAnalysisControlsComponent;
