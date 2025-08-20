'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LottoDrawType } from '@/types/lotto.type';
import { LottoUtils } from '@/utils/lotto.util';
import { LottoWarningAlertComponent } from '@/components/lotto-warning-alert.component';

function fetchDraws(from: number, to: number): Promise<LottoDrawType[]> {
  const url = `/api/lotto/draws?from=${encodeURIComponent(
    String(from)
  )}&to=${encodeURIComponent(String(to))}`;
  return fetch(url).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error ?? 'Failed to load draws');
    }
    const json = (await res.json()) as { data: LottoDrawType[] };
    return json.data;
  });
}

function Bar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-xs text-muted-foreground">{label}</div>
      <div className="h-3 flex-1 rounded bg-muted">
        <div
          className="h-3 rounded bg-primary"
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="w-8 text-right text-xs">{value}</div>
    </div>
  );
}

export default function Page() {
  const [from, setFrom] = useState<number>(1);
  const [to, setTo] = useState<number>(50);

  const enabled = useMemo(
    () =>
      Number.isInteger(from) && Number.isInteger(to) && from > 0 && to >= from,
    [from, to]
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['lotto-analysis', from, to],
    queryFn: () => fetchDraws(from, to),
    enabled,
  });

  const stats = useMemo(
    () => (data && data.length > 0 ? LottoUtils.computeStats(data) : null),
    [data]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">로또 분석</h1>
      <p className="text-sm text-muted-foreground mt-1">
        회차 범위를 선택하여 빈도/패턴을 확인하세요.
      </p>

      <LottoWarningAlertComponent
        className="mt-4"
        tone="danger"
        includeAgeNotice
      />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="from" className="w-16 text-sm">
            From
          </label>
          <input
            id="from"
            type="number"
            value={from}
            onChange={(e) => setFrom(Number(e.target.value))}
            className="w-full rounded-md border px-3 py-2 text-sm"
            min={1}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="to" className="w-16 text-sm">
            To
          </label>
          <input
            id="to"
            type="number"
            value={to}
            onChange={(e) => setTo(Number(e.target.value))}
            className="w-full rounded-md border px-3 py-2 text-sm"
            min={from}
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={!enabled || isFetching}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isFetching ? '분석 중…' : '분석'}
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {isLoading && <p className="text-sm">불러오는 중…</p>}
        {isError && (
          <p className="text-sm text-red-600">
            오류: {(error as Error).message}
          </p>
        )}

        {stats && (
          <>
            <section>
              <h2 className="text-lg font-medium mb-3">번호 빈도 (1-45)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
                  <Bar
                    key={n}
                    label={String(n).padStart(2, '0')}
                    value={stats.frequencyByNumber[n] ?? 0}
                    max={Math.max(...Object.values(stats.frequencyByNumber))}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3">구간 분포</h2>
              <div className="space-y-2">
                {Object.entries(stats.bucketDistribution).map(([k, v]) => (
                  <Bar
                    key={k}
                    label={k}
                    value={v}
                    max={Math.max(...Object.values(stats.bucketDistribution))}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3">홀/짝 분포</h2>
              <div className="space-y-2">
                <Bar
                  label="홀수"
                  value={stats.oddEvenDistribution.odd}
                  max={
                    stats.oddEvenDistribution.odd +
                    stats.oddEvenDistribution.even
                  }
                />
                <Bar
                  label="짝수"
                  value={stats.oddEvenDistribution.even}
                  max={
                    stats.oddEvenDistribution.odd +
                    stats.oddEvenDistribution.even
                  }
                />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3">합계 분포</h2>
              <div className="space-y-2">
                {Object.entries(stats.sumDistribution).map(([k, v]) => (
                  <Bar
                    key={k}
                    label={k}
                    value={v}
                    max={Math.max(...Object.values(stats.sumDistribution))}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3">연속수 발생</h2>
              <p className="text-sm">
                연속된 번호가 포함된 회차 수:{' '}
                <span className="font-medium">{stats.consecutiveCount}</span>
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
