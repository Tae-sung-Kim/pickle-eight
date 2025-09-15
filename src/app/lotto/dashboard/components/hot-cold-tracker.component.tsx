'use client';

import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHotColdStatsQuery, useMyNumberSetsQuery } from '@/queries';

function sortEntries(
  rec: Readonly<Record<number, number>>,
  order: 'desc' | 'asc'
): Array<[number, number]> {
  const arr = Object.entries(rec).map(
    ([k, v]) => [Number(k), Number(v)] as [number, number]
  );
  arr.sort((a, b) => (order === 'desc' ? b[1] - a[1] : a[1] - b[1]));
  return arr;
}

function MiniBar({
  value,
  max,
}: {
  readonly value: number;
  readonly max: number;
}): JSX.Element {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="ml-3 h-2 flex-1 rounded bg-muted">
      <div className="h-2 rounded bg-primary/60" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function HotColdTrackerComponent(): JSX.Element {
  const { data, isFetching } = useHotColdStatsQuery();
  const [top, setTop] = useState<number>(10);

  const { data: mySets = [] } = useMyNumberSetsQuery();
  const favoriteNums = useMemo(() => {
    const s = new Set<number>();
    for (const it of mySets)
      if (it.isFavorite) for (const n of it.numbers) s.add(n);
    return s;
  }, [mySets]);

  const frequencyTop = useMemo(() => {
    if (!data) return [] as Array<[number, number]>;
    return sortEntries(data.frequency, 'desc').slice(0, top);
  }, [data, top]);

  const overdueTop = useMemo(() => {
    if (!data) return [] as Array<[number, number]>;
    return sortEntries(data.overdue, 'desc').slice(0, top);
  }, [data, top]);

  const recentTop = useMemo(() => {
    if (!data) return [] as Array<[number, number]>;
    return sortEntries(data.recentFrequency, 'desc').slice(0, top);
  }, [data, top]);

  const maxFreq = useMemo(
    () => (data ? Math.max(...Object.values(data.frequency)) : 0),
    [data]
  );
  const maxOverdue = useMemo(
    () => (data ? Math.max(...Object.values(data.overdue)) : 0),
    [data]
  );
  const maxRecent = useMemo(
    () => (data ? Math.max(...Object.values(data.recentFrequency)) : 0),
    [data]
  );

  const renderRow = (n: number, v: number, max: number, suffix?: string) => {
    const fav = favoriteNums.has(n);
    return (
      <li key={`${n}-${v}-${suffix ?? ''}`} className="flex items-center">
        <span className={`w-8 ${fav ? 'font-semibold text-foreground' : ''}`}>
          {fav ? `★${n}` : n}
        </span>
        <span className="w-14 text-right text-muted-foreground">
          {v}
          {suffix ?? ''}
        </span>
        <MiniBar value={v} max={max} />
      </li>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="border-border bg-surface-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">핫/콜드/지연 요약</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Top</span>
            <Select
              value={String(top)}
              onValueChange={(v) => setTop(Number(v))}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {isFetching ? (
          <p className="mt-3 text-sm text-muted-foreground">계산 중…</p>
        ) : !data ? (
          <p className="mt-3 text-sm text-muted-foreground">
            데이터가 없습니다.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <div className="text-sm font-medium">
                자주 나온 번호(전체 빈도)
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {frequencyTop.map(([n, c]) => renderRow(n, c, maxFreq))}
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium">
                오랫동안 안 나온 번호(지연)
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {overdueTop.map(([n, gap]) =>
                  renderRow(n, gap, maxOverdue, '회')
                )}
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium">
                최근 급상승 번호(최근 빈도)
              </div>
              <div className="text-xs text-muted-foreground">
                최근 {data.recentWindow}회 기준
              </div>
              <ul className="mt-1 space-y-1 text-sm">
                {recentTop.map(([n, c]) => renderRow(n, c, maxRecent))}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
