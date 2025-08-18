'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LottoDraw } from '@/types/lotto';

function fetchDraws(from: number, to: number): Promise<LottoDraw[]> {
  const url = `/api/lotto/draws?from=${encodeURIComponent(
    String(from)
  )}&to=${encodeURIComponent(String(to))}`;
  return fetch(url).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error ?? 'Failed to load draws');
    }
    const json = (await res.json()) as { data: LottoDraw[] };
    return json.data;
  });
}

export default function Page() {
  const [from, setFrom] = useState<number>(1);
  const [to, setTo] = useState<number>(10);

  const enabled = useMemo(
    () =>
      Number.isInteger(from) && Number.isInteger(to) && from > 0 && to >= from,
    [from, to]
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['lotto-draws', from, to],
    queryFn: () => fetchDraws(from, to),
    enabled,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">로또 당첨 결과 히스토리</h1>
      <p className="text-sm text-muted-foreground mt-1">
        회차 범위를 입력해 조회하세요.
      </p>

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
            {isFetching ? '불러오는 중…' : '조회'}
          </button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading && <p className="text-sm">불러오는 중…</p>}
        {isError && (
          <p className="text-sm text-red-600">
            오류: {(error as Error).message}
          </p>
        )}

        {data && data.length > 0 && (
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">회차</th>
                  <th className="px-3 py-2 text-left">추첨일</th>
                  <th className="px-3 py-2 text-left">당첨번호</th>
                  <th className="px-3 py-2 text-left">보너스</th>
                  <th className="px-3 py-2 text-left">1등(명)</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .slice()
                  .sort((a, b) => b.drawNumber - a.drawNumber)
                  .map((d) => (
                    <tr key={d.drawNumber} className="border-t">
                      <td className="px-3 py-2">{d.drawNumber}</td>
                      <td className="px-3 py-2">{d.drawDate}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {d.numbers.map((n) => (
                            <span
                              key={n}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
                          {d.bonusNumber}
                        </span>
                      </td>
                      <td className="px-3 py-2">{d.firstWinCount ?? '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
