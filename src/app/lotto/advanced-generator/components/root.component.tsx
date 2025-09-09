'use client';

import { useState, useEffect } from 'react';
import { useLottoDrawsQuery, useLatestLottoDrawQuery } from '@/queries';
import { LottoGenerator, creditBuildCostLabel } from '@/utils';
import {
  LottoGenerateFiltersType,
  LottoWeightingOptionsType,
  LottoDrawType,
} from '@/types';
import { LottoAdvancedGenerateControlsComponent } from './generate-controls.component';
import { LottoAdvancedWeightingControlsComponent } from './weighting-controls.component';
import { LottoAdvancedGeneratedListComponent } from './generated-list.component';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditBalancePillComponent,
  CreditGateButtonComponent,
} from '@/components';
import { SPEND_COST } from '@/constants';
import { ClientCsvButtonComponent } from '@/components';
import { getLottoDraws } from '@/services';

export function LottoAdvancedGeneratorComponent() {
  const [count, setCount] = useState<number>(3);
  const [filters, setFilters] = useState<LottoGenerateFiltersType>({
    sumMin: 100,
    sumMax: 200,
    maxConsecutive: 2,
  });
  const [useWeight, setUseWeight] = useState<boolean>(false);
  const [from, setFrom] = useState<number>(1);
  const [to, setTo] = useState<number>(50);
  const [excludeLatest, setExcludeLatest] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rangeInitialized, setRangeInitialized] = useState<boolean>(false);

  const { data: latestDraw } = useLatestLottoDrawQuery({ enabled: useWeight });

  useEffect(() => {
    if (!useWeight) {
      setRangeInitialized(false);
      return;
    }
    if (!latestDraw) return;
    const latestNo = latestDraw.lastDrawNumber;
    if (!Number.isInteger(latestNo) || latestNo <= 0) return;
    const nextTo = latestNo;
    const nextFrom = Math.max(1, latestNo - 49);
    setFrom(nextFrom);
    setTo(nextTo);
    setRangeInitialized(true);
  }, [useWeight, latestDraw]);

  // Keep query only for passive scenarios (not used on click now)
  useLottoDrawsQuery({ from, to, enabled: false });

  const amountOverride =
    SPEND_COST.advanced +
    (useWeight ? 2 : 0) +
    Math.floor(Math.max(0, count - 1) / 3);
  const label = creditBuildCostLabel({
    spendKey: 'advanced',
    baseLabel: '생성',
    isBusy: false,
    busyLabel: '생성 중…',
    amountOverride,
  });

  const [generated, setGenerated] = useState<
    ReadonlyArray<{
      numbers: readonly [number, number, number, number, number, number];
    }>
  >([]);

  async function onGenerate() {
    setError(null);
    if (
      filters.sumMin !== undefined &&
      filters.sumMax !== undefined &&
      filters.sumMin > filters.sumMax
    ) {
      setError('합계 최소값이 최대값보다 클 수 없습니다.');
      return;
    }

    let drawsData: LottoDrawType[] | undefined = undefined;
    if (useWeight) {
      if (!rangeInitialized || from <= 0 || to < from) {
        setError('가중치 범위(From/To)가 올바르지 않습니다.');
        return;
      }
      // 버튼 클릭 순간에 최신 데이터를 직접 조회(HTTP -> 전역 로딩 보장)
      try {
        drawsData = await getLottoDraws({ from, to });
      } catch (e) {
        setError(
          '가중치 데이터를 불러오지 못했습니다. 잠시 후 다시 시도하세요.' + e
        );
        return;
      }
      if (!drawsData || drawsData.length === 0) {
        setError('가중치 데이터가 비어 있습니다.');
        return;
      }
    }

    // weighting/exclusions from fresh data if provided
    const weighting: LottoWeightingOptionsType | undefined = (() => {
      if (!useWeight || !drawsData) return undefined;
      const freq: Record<number, number> = {};
      for (let n = 1; n <= 45; n += 1) freq[n] = 0;
      for (const d of drawsData) for (const n of d.numbers) freq[n] += 1;
      return { frequency: freq, hotColdAlpha: 1 };
    })();

    const excludeNumbers: number[] = (() => {
      if (!excludeLatest || !drawsData || drawsData.length === 0) return [];
      const latest = drawsData.reduce((a, b) =>
        a.drawNumber > b.drawNumber ? a : b
      );
      return [...latest.numbers, latest.bonusNumber];
    })();

    try {
      const safeCount = Math.max(1, Math.min(50, count));
      const list = LottoGenerator.generate(
        safeCount,
        {
          ...filters,
          excludeRecentNumbers: excludeNumbers,
        } as LottoGenerateFiltersType,
        weighting
      );
      setGenerated(list);
    } catch (e) {
      setError(
        `조건이 너무 엄격합니다. 필터를 완화하고 다시 시도하세요.${
          e instanceof Error ? ' ' + e.message : ''
        }`
      );
    }
  }

  return (
    <>
      <Alert className="mt-2">
        <AlertDescription>
          ※ 생성 및 필터 기준은 통계상 당첨 번호 6개를 대상으로 하며, 보너스
          번호는 포함하지 않습니다.
        </AlertDescription>
      </Alert>
      {error && (
        <Alert className="mt-2 border-red-200 bg-red-50 text-red-900">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mt-6 space-y-6">
        <Card className="p-4">
          <LottoAdvancedGenerateControlsComponent
            count={count}
            filters={filters}
            onChangeCount={setCount}
            onChangeFilters={(u) => setFilters((p) => u(p))}
          />
        </Card>

        <Card className="p-4">
          <LottoAdvancedWeightingControlsComponent
            useWeight={useWeight}
            loading={useWeight && !rangeInitialized}
            from={from}
            to={to}
            excludeLatest={excludeLatest}
            onToggleUseWeight={setUseWeight}
            onChangeFrom={setFrom}
            onChangeTo={setTo}
            onToggleExcludeLatest={setExcludeLatest}
          />
        </Card>

        <div className="flex items-end justify-between gap-3">
          <CreditGateButtonComponent
            className="ml-auto"
            label={label}
            spendKey="advanced"
            onProceed={onGenerate}
            amountOverride={amountOverride}
          />
          <CreditBalancePillComponent />
        </div>

        {generated.length > 0 && (
          <div className="flex items-center justify-end gap-3">
            <ClientCsvButtonComponent
              className="ml-auto"
              headers={['no1', 'no2', 'no3', 'no4', 'no5', 'no6']}
              rows={generated.map((g) => g.numbers)}
              filename="advanced_generated_numbers.csv"
              baseLabel="생성 결과 CSV"
            />
          </div>
        )}

        <LottoAdvancedGeneratedListComponent items={generated} />
      </div>
    </>
  );
}
export default LottoAdvancedGeneratorComponent;
