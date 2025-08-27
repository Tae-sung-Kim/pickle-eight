'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CreditGateButtonComponent } from '@/components';
import { CreditBalancePillComponent } from '@/components';
import { useCreditCostLabel } from '@/hooks';

export function LottoAnalysisControlsComponent({
  from,
  to,
  setFrom,
  setTo,
  enabled,
  isFetching,
  onAnalyze,
}: {
  from: number;
  to: number;
  setFrom: (v: number) => void;
  setTo: (v: number) => void;
  enabled: boolean;
  isFetching: boolean;
  onAnalyze: () => void;
}) {
  const label = useCreditCostLabel({
    spendKey: 'analysis',
    baseLabel: '분석',
    isBusy: isFetching,
    busyLabel: '분석 중…',
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
              type="number"
              value={from}
              onChange={(e) => setFrom(Number(e.target.value))}
              min={1}
              className="col-span-3"
              inputMode="numeric"
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
              type="number"
              value={to}
              onChange={(e) => setTo(Number(e.target.value))}
              min={from}
              className="col-span-3"
              inputMode="numeric"
            />
          </div>

          <div className="flex items-end justify-between gap-3">
            <CreditGateButtonComponent
              className="w-full sm:w-auto"
              label={label}
              spendKey="analysis"
              onProceed={onAnalyze}
              disabled={!enabled || isFetching}
            />
            <CreditBalancePillComponent />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LottoAnalysisControlsComponent;
