'use client';

import { useCallback, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useGenerationResult } from '@/features/lotto/generator/hooks/use-generation-result.hook';
import { useWeightingOptions } from '@/features/lotto/generator/hooks/use-weighting-options.hook';
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
import { getRandomSourceLabel } from '@/lib/random';
import { LottoGeneratorFilterControlsComponent } from './filter-controls.component';
import { LottoGeneratorControlsComponent } from './generator-controls.component';
import { LottoNumberListComponent } from './number-list.component';
import { LottoGeneratorWeightingControlsComponent } from './weighting-controls.component';

const DEFAULT_ORDER_COUNT = 5 as const; // 로또 용지 1장 = 5게임

export function LottoGeneratorComponent() {
  // 화면 입력 (게임 수, 고급 옵션, 필터)
  const [orderCount, setOrderCount] = useState<number>(DEFAULT_ORDER_COUNT);
  const [useAdvanced, setUseAdvanced] = useState<boolean>(false);
  const [filters, setFilters] = useState<LottoGenerateFiltersType>({
    sumMin: 100,
    sumMax: 200,
    maxConsecutive: 2,
  });
  // 가중치 옵션과 생성 결과는 훅으로 묶는다
  const weightOptions = useWeightingOptions(useAdvanced);
  const { useWeight, from, to, excludeLatest, rangeInitialized } =
    weightOptions;
  const result = useGenerationResult();
  const { numbersList, isGenerating, generatedAt, rngLabel, error } = result;

  // 조건 없는 무작위 생성
  const generatePlain = useCallback(async (): Promise<number[][]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Array.from({ length: orderCount }, () => generateLottoNumbers());
  }, [orderCount]);

  // 필터/가중치를 적용한 생성. 실패하면 화면에 띄울 문구로 Error를 던진다
  const generateAdvanced = useCallback(async (): Promise<number[][]> => {
    if (
      filters.sumMin !== undefined &&
      filters.sumMax !== undefined &&
      filters.sumMin > filters.sumMax
    ) {
      throw new Error('합계 최소값이 최대값보다 클 수 없습니다.');
    }

    let drawsData: LottoDrawType[] | undefined;
    if (useWeight) {
      if (!rangeInitialized || from <= 0 || to < from) {
        throw new Error('가중치 범위(From/To)가 올바르지 않습니다.');
      }
      // 버튼 클릭 순간에 최신 데이터를 직접 조회(HTTP -> 전역 로딩 보장)
      try {
        drawsData = await getLottoDraws({ from, to });
      } catch (e) {
        throw new Error(
          `가중치 데이터를 불러오지 못했습니다. 잠시 후 다시 시도하세요.${e}`
        );
      }
      if (!drawsData || drawsData.length === 0) {
        throw new Error('가중치 데이터가 비어 있습니다.');
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
      throw new Error(
        `조건이 너무 엄격합니다. 필터를 완화하고 다시 시도하세요.${
          e instanceof Error ? ` ${e.message}` : ''
        }`
      );
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

  const { start, succeed, fail } = result;
  const handleGenerate = useCallback(async () => {
    start();
    try {
      const list = useAdvanced
        ? await generateAdvanced()
        : await generatePlain();
      succeed(list, getRandomSourceLabel());
    } catch (e) {
      fail(e instanceof Error ? e.message : String(e));
    }
  }, [useAdvanced, generateAdvanced, generatePlain, start, succeed, fail]);

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
                onToggleUseWeight={weightOptions.setUseWeight}
                onChangeFrom={weightOptions.setFrom}
                onChangeTo={weightOptions.setTo}
                onToggleExcludeLatest={weightOptions.setExcludeLatest}
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
