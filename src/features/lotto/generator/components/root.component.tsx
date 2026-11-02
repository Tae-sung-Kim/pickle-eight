'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLatestLottoDrawQuery } from '@/features/lotto/queries/use-lotto.query';
import { getLottoDraws } from '@/features/lotto/services/lotto.service';
import { ClientCsvButtonComponent } from '@/features/lotto/shared/components/client-csv-button.component';
import type {
  LottoDrawType,
  LottoGenerateFiltersType,
  LottoWeightingOptionsType,
} from '@/features/lotto/types/lotto.type';
import {
  generateLottoNumbers,
  LottoGenerator,
} from '@/features/lotto/utils/lotto.util';
import { getRandomSourceLabel } from '@/features/lotto/utils/random.util';
import { LottoGeneratorFilterControlsComponent } from './filter-controls.component';
import { LottoGeneratorControlsComponent } from './generator-controls.component';
import { LottoNumberListComponent } from './number-list.component';
import { LottoGeneratorWeightingControlsComponent } from './weighting-controls.component';

const DEFAULT_ORDER_COUNT = 5 as const; // 로또 용지 1장 = 5게임
const WEIGHT_RANGE_SIZE = 50 as const;

export function LottoGeneratorComponent() {
  const [orderCount, setOrderCount] = useState<number>(DEFAULT_ORDER_COUNT);
  const [numbersList, setNumbersList] = useState<number[][]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedAt, setGeneratedAt] = useState<string>('');
  const [rngLabel, setRngLabel] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // 고급 옵션 (꺼져 있으면 조건 없는 무작위 생성)
  const [useAdvanced, setUseAdvanced] = useState<boolean>(false);
  const [filters, setFilters] = useState<LottoGenerateFiltersType>({
    sumMin: 100,
    sumMax: 200,
    maxConsecutive: 2,
  });
  const [useWeight, setUseWeight] = useState<boolean>(false);
  const [from, setFrom] = useState<number>(1);
  const [to, setTo] = useState<number>(WEIGHT_RANGE_SIZE);
  const [excludeLatest, setExcludeLatest] = useState<boolean>(false);
  const [rangeInitialized, setRangeInitialized] = useState<boolean>(false);

  const weightActive = useAdvanced && useWeight;
  const { data: latestDraw } = useLatestLottoDrawQuery({
    enabled: weightActive,
  });

  useEffect(() => {
    if (!weightActive) {
      setRangeInitialized(false);
      return;
    }
    if (!latestDraw) return;
    const latestNo = latestDraw.lastDrawNumber;
    if (!Number.isInteger(latestNo) || latestNo <= 0) return;
    setFrom(Math.max(1, latestNo - (WEIGHT_RANGE_SIZE - 1)));
    setTo(latestNo);
    setRangeInitialized(true);
  }, [weightActive, latestDraw]);

  // 조건 없는 무작위 생성
  const generatePlain = useCallback(async (): Promise<number[][]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Array.from({ length: orderCount }, () => generateLottoNumbers());
  }, [orderCount]);

  // 필터/가중치를 적용한 생성. 실패하면 화면에 오류를 띄우고 null을 돌려준다
  const generateAdvanced = useCallback(async (): Promise<number[][] | null> => {
    if (
      filters.sumMin !== undefined &&
      filters.sumMax !== undefined &&
      filters.sumMin > filters.sumMax
    ) {
      setError('합계 최소값이 최대값보다 클 수 없습니다.');
      return null;
    }

    let drawsData: LottoDrawType[] | undefined;
    if (useWeight) {
      if (!rangeInitialized || from <= 0 || to < from) {
        setError('가중치 범위(From/To)가 올바르지 않습니다.');
        return null;
      }
      // 버튼 클릭 순간에 최신 데이터를 직접 조회(HTTP -> 전역 로딩 보장)
      try {
        drawsData = await getLottoDraws({ from, to });
      } catch (e) {
        setError(
          `가중치 데이터를 불러오지 못했습니다. 잠시 후 다시 시도하세요.${e}`
        );
        return null;
      }
      if (!drawsData || drawsData.length === 0) {
        setError('가중치 데이터가 비어 있습니다.');
        return null;
      }
    }

    const weighting: LottoWeightingOptionsType | undefined = (() => {
      if (!useWeight || !drawsData) return undefined;
      const freq: Record<number, number> = {};
      for (let n = 1; n <= 45; n += 1) freq[n] = 0;
      for (const d of drawsData) for (const n of d.numbers) freq[n] += 1;
      return { frequency: freq, hotColdAlpha: 1 };
    })();

    const excludeRecentNumbers: number[] = (() => {
      if (!excludeLatest || !drawsData || drawsData.length === 0) return [];
      const latest = drawsData.reduce((a, b) =>
        a.drawNumber > b.drawNumber ? a : b
      );
      return [...latest.numbers, latest.bonusNumber];
    })();

    try {
      const tickets = LottoGenerator.generate(
        orderCount,
        { ...filters, excludeRecentNumbers },
        weighting
      );
      return tickets.map((t) => [...t.numbers]);
    } catch (e) {
      setError(
        `조건이 너무 엄격합니다. 필터를 완화하고 다시 시도하세요.${
          e instanceof Error ? ` ${e.message}` : ''
        }`
      );
      return null;
    }
  }, [
    orderCount,
    filters,
    useWeight,
    rangeInitialized,
    from,
    to,
    excludeLatest,
  ]);

  const handleGenerate = useCallback(async () => {
    setError(null);
    setIsGenerating(true);
    try {
      const list = useAdvanced
        ? await generateAdvanced()
        : await generatePlain();
      if (!list) return;
      setNumbersList(list);
      setRngLabel(getRandomSourceLabel());
      setGeneratedAt(new Date().toLocaleString('ko-KR', { hour12: false }));
    } finally {
      setIsGenerating(false);
    }
  }, [useAdvanced, generateAdvanced, generatePlain]);

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">번호 생성</h2>
        <p className="max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
          {useAdvanced
            ? '조건(합계·연속·홀짝·구간·고정/제외 번호·가중치)에 맞는 번호를 무작위로 뽑습니다. 참고용 조합이며 당첨 확률은 달라지지 않습니다.'
            : '무작위(랜덤) 번호를 생성합니다. AI 예측이 아니며 통계·패턴 분석을 사용하지 않습니다.'}
        </p>
      </div>

      <LottoGeneratorControlsComponent
        orderCount={orderCount}
        isGenerating={isGenerating}
        onOrderCountChange={setOrderCount}
        onGenerate={handleGenerate}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="use-advanced" className="text-sm font-medium">
            고급 옵션 사용
          </Label>
          <Switch
            id="use-advanced"
            className="cursor-pointer"
            checked={useAdvanced}
            onCheckedChange={setUseAdvanced}
            disabled={isGenerating}
          />
        </div>

        {useAdvanced && (
          <div className="space-y-6">
            <Alert>
              <AlertDescription>
                ※ 생성 및 필터 기준은 통계상 당첨 번호 6개를 대상으로 하며,
                보너스 번호는 포함하지 않습니다.
              </AlertDescription>
            </Alert>
            <Card className="p-4">
              <LottoGeneratorFilterControlsComponent
                filters={filters}
                onChangeFilters={(updater) => setFilters((p) => updater(p))}
              />
            </Card>
            <Card className="p-4">
              <LottoGeneratorWeightingControlsComponent
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
          </div>
        )}
      </div>

      {error && (
        <Alert className="border-destructive/30 bg-destructive/10 text-foreground">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generatedAt && (
        <p className="text-xs text-muted-foreground">
          생성 시각 {generatedAt}, 난수 소스 {rngLabel}
        </p>
      )}

      <LottoNumberListComponent numbersList={numbersList} title="생성된 번호" />

      {numbersList.length > 0 && (
        <div className="flex justify-end">
          <ClientCsvButtonComponent
            headers={['no1', 'no2', 'no3', 'no4', 'no5', 'no6']}
            rows={numbersList}
            filename="generated_numbers.csv"
            baseLabel="생성 결과 CSV"
          />
        </div>
      )}
    </div>
  );
}
