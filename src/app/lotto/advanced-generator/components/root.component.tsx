'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useLottoDrawsQuery, useLatestLottoDrawQuery } from '@/queries';
import {
  LottoGenerator,
  type GenerateFilters,
  type WeightingOptions,
} from '@/utils';
import { LottoWarningAlertComponent, LottoBallComponent } from '@/components';

export function LottoAdvancedGeneratorComponent() {
  const [count, setCount] = useState<number>(5);
  const [filters, setFilters] = useState<GenerateFilters>({
    sumMin: 100,
    sumMax: 200,
    maxConsecutive: 2,
  });
  const [useWeight, setUseWeight] = useState<boolean>(false);
  const [from, setFrom] = useState<number>(1);
  const [to, setTo] = useState<number>(50);
  const [excludeLatest, setExcludeLatest] = useState<boolean>(false);

  // Initialize range using latest draw (set to latest, from to last 50 draws)
  const { data: latestDraw } = useLatestLottoDrawQuery();
  useEffect(() => {
    if (!latestDraw) return;
    const latestNo = latestDraw.lastDrawNumber;
    if (!Number.isInteger(latestNo) || latestNo <= 0) return;
    const nextTo = latestNo;
    const nextFrom = Math.max(1, latestNo - 49);
    setFrom(nextFrom);
    setTo(nextTo);
  }, [latestDraw]);

  const enabled = useMemo(
    () =>
      useWeight &&
      Number.isInteger(from) &&
      Number.isInteger(to) &&
      from > 0 &&
      to >= from,
    [useWeight, from, to]
  );

  const { data: draws } = useLottoDrawsQuery({ from, to, enabled });

  const weighting: WeightingOptions | undefined = useMemo(() => {
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
    const f = {
      ...filters,
      excludeRecentNumbers: excludeNumbers,
    } as GenerateFilters;
    const list = LottoGenerator.generate(count, f, weighting);
    setGenerated(list);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">로또 고급 번호 생성기</h1>
      <p className="text-sm text-muted-foreground mt-1">
        필터와 가중치를 사용하여 번호를 생성하세요.
      </p>
      <div className="mt-2 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        ※ 생성 및 필터 기준은 통계상 당첨 번호 6개를 대상으로 하며, 보너스
        번호는 포함하지 않습니다.
      </div>

      <LottoWarningAlertComponent
        className="mt-4"
        tone="danger"
        includeAgeNotice
      />

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <label className="w-28 text-sm">생성 매수</label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-28 text-sm">합계 최소</label>
            <input
              type="number"
              value={filters.sumMin ?? ''}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  sumMin:
                    e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-28 text-sm">합계 최대</label>
            <input
              type="number"
              value={filters.sumMax ?? ''}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  sumMax:
                    e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <label className="w-28 text-sm">최대 연속수</label>
            <input
              type="number"
              min={0}
              max={6}
              value={filters.maxConsecutive ?? 6}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  maxConsecutive: Number(e.target.value),
                }))
              }
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-28 text-sm">홀수 개수</label>
            <input
              type="number"
              min={0}
              max={6}
              value={filters.desiredOddCount ?? ''}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  desiredOddCount:
                    e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-28 text-sm">구간 최소개수</label>
            <input
              type="number"
              min={1}
              max={5}
              value={filters.minBucketSpread ?? ''}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  minBucketSpread:
                    e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="rounded-md border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">가중치(핫/콜드) 사용</div>
            <input
              type="checkbox"
              checked={useWeight}
              onChange={(e) => setUseWeight(e.target.checked)}
            />
          </div>
          {useWeight && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <label className="w-28 text-sm">From</label>
                <input
                  type="number"
                  min={1}
                  value={from}
                  onChange={(e) => setFrom(Number(e.target.value))}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-sm">To</label>
                <input
                  type="number"
                  min={from}
                  value={to}
                  onChange={(e) => setTo(Number(e.target.value))}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-sm">최근번호 제외</label>
                <input
                  type="checkbox"
                  checked={excludeLatest}
                  onChange={(e) => setExcludeLatest(e.target.checked)}
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onGenerate}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          생성
        </button>

        {generated.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {generated.map((t, idx) => (
              <div key={idx} className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">
                  조합 #{idx + 1}
                </div>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {t.numbers.map((n, i) => (
                    <LottoBallComponent key={n} number={n} index={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LottoAdvancedGeneratorComponent;
