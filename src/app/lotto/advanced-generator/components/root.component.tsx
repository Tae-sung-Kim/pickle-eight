'use client';

import { useMemo, useState, useEffect } from 'react';
import { useLottoDrawsQuery, useLatestLottoDrawQuery } from '@/queries';
import { LottoGenerator } from '@/utils';
import { GenerateFiltersType, WeightingOptionsType } from '@/types';
import { LottoAdvancedGenerateControlsComponent } from './generate-controls.component';
import { LottoAdvancedWeightingControlsComponent } from './weighting-controls.component';
import { LottoAdvancedGeneratedListComponent } from './generated-list.component';
import { Card } from '@/components/ui/card';
import { CreditGateButtonComponent } from '@/components/shared/gates';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LottoAdvancedGeneratorComponent() {
  const [count, setCount] = useState<number>(5);
  const [filters, setFilters] = useState<GenerateFiltersType>({
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

  const enabled = useMemo(
    () =>
      useWeight &&
      rangeInitialized &&
      Number.isInteger(from) &&
      Number.isInteger(to) &&
      from > 0 &&
      to >= from,
    [useWeight, rangeInitialized, from, to]
  );

  const { data: draws } = useLottoDrawsQuery({ from, to, enabled });

  const weighting: WeightingOptionsType | undefined = useMemo(() => {
    if (!useWeight || !draws) return undefined;
    const freq: Record<number, number> = {};
    for (let n = 1; n <= 45; n += 1) freq[n] = 0;
    for (const d of draws) for (const n of d.numbers) freq[n] += 1;
    return { frequency: freq, hotColdAlpha: 1 };
  }, [useWeight, draws]);

  const excludeNumbers = useMemo(() => {
    if (!excludeLatest || !draws || draws.length === 0) return [] as number[];
    const latest = draws.reduce((a, b) =>
      a.drawNumber > b.drawNumber ? a : b
    );
    return [...latest.numbers, latest.bonusNumber];
  }, [excludeLatest, draws]);

  const [generated, setGenerated] = useState<
    ReadonlyArray<{
      numbers: readonly [number, number, number, number, number, number];
    }>
  >([]);

  function onGenerate() {
    setError(null);
    if (
      filters.sumMin !== undefined &&
      filters.sumMax !== undefined &&
      filters.sumMin > filters.sumMax
    ) {
      setError('합계 최소값이 최대값보다 클 수 없습니다.');
      return;
    }
    if (useWeight && to < from) {
      setError('가중치 범위(From/To)가 올바르지 않습니다.');
      return;
    }
    const f = {
      ...filters,
      excludeRecentNumbers: excludeNumbers,
    } as GenerateFiltersType;
    try {
      const safeCount = Math.max(1, Math.min(50, count));
      const list = LottoGenerator.generate(safeCount, f, weighting);
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

        <div className="flex">
          <CreditGateButtonComponent
            className="ml-auto"
            label="생성"
            spendKey="advanced"
            onProceed={onGenerate}
          />
        </div>

        <LottoAdvancedGeneratedListComponent items={generated} />
      </div>
    </>
  );
}
export default LottoAdvancedGeneratorComponent;
