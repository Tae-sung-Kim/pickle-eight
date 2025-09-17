'use client';
import { CreditGateButtonComponent } from '@/components/shared/credit/credit-gate-button.component';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CREDIT_SPEND_COST } from '@/constants/ad-credit.constant';
import {
  useHotColdStatsQuery,
  useMyNumberSetsQuery,
} from '@/queries/use-lotto-user.query';
import { useLatestLottoDrawQuery } from '@/queries/use-lotto.query';
import { getLottoDraws } from '@/services/lotto.service';
import { creditBuildCostLabel } from '@/utils/ad-credit.util';
import { useEffect, useMemo, useState } from 'react';

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
}) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="ml-3 h-2 flex-1 rounded bg-muted">
      <div className="h-2 rounded bg-primary/60" style={{ width: `${pct}%` }} />
    </div>
  );
}

function downloadCsv(
  filename: string,
  rows: Array<ReadonlyArray<string | number>>
): void {
  const csv = rows
    .map((r) =>
      r
        .map((c) =>
          typeof c === 'string' && c.includes(',') ? `"${c}"` : String(c)
        )
        .join(',')
    )
    .join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function HotColdTrackerComponent() {
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);
  const { data, isFetching } = useHotColdStatsQuery({ enabled: shouldFetch });
  const latestQ = useLatestLottoDrawQuery({ enabled: true });
  const [mode, setMode] = useState<'top' | 'range'>('top');
  const [top, setTop] = useState<number>(5);
  const [range, setRange] = useState<{ from: string; to: string }>(() => ({
    from: '',
    to: '',
  }));
  const [appliedWindow, setAppliedWindow] = useState<number>(10);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [localStats, setLocalStats] = useState<{
    frequency: Readonly<Record<number, number>>;
    overdue: Readonly<Record<number, number>>;
    recentFrequency: Readonly<Record<number, number>>;
  } | null>(null);

  useEffect(() => {
    const latestNo = latestQ.data?.lastDrawNumber;
    if (!latestNo || range.from || range.to) return;
    const from = Math.max(1, latestNo - 10);
    const to = latestNo;
    setRange({ from: String(from), to: String(to) });
    setAppliedWindow(Math.min(1000, to - from + 1));
    setShouldFetch(false);
  }, [latestQ.data, range.from, range.to]);

  const { data: mySets = [] } = useMyNumberSetsQuery();
  const favoriteNums = useMemo(() => {
    const s = new Set<number>();
    for (const it of mySets)
      if (it.isFavorite) for (const n of it.numbers) s.add(n);
    return s;
  }, [mySets]);

  const currentStats = mode === 'top' ? data : localStats;
  const loading = mode === 'top' ? isFetching : localLoading;

  const frequencyTop = useMemo(() => {
    if (!currentStats) return [] as Array<[number, number]>;
    return sortEntries(currentStats.frequency, 'desc').slice(0, top);
  }, [currentStats, top]);

  const overdueTop = useMemo(() => {
    if (!currentStats) return [] as Array<[number, number]>;
    return sortEntries(currentStats.overdue, 'desc').slice(0, top);
  }, [currentStats, top]);

  const recentTop = useMemo(() => {
    if (!currentStats) return [] as Array<[number, number]>;
    return sortEntries(currentStats.recentFrequency, 'desc').slice(0, top);
  }, [currentStats, top]);

  const maxFreq = useMemo(
    () =>
      currentStats ? Math.max(...Object.values(currentStats.frequency)) : 0,
    [currentStats]
  );
  const maxOverdue = useMemo(
    () => (currentStats ? Math.max(...Object.values(currentStats.overdue)) : 0),
    [currentStats]
  );
  const maxRecent = useMemo(
    () =>
      currentStats
        ? Math.max(...Object.values(currentStats.recentFrequency))
        : 0,
    [currentStats]
  );

  const renderRow = (n: number, v: number, max: number, suffix?: string) => {
    const fav = favoriteNums.has(n);
    return (
      <li
        key={`${n}-${v}-${suffix ?? ''}`}
        className="flex items-center py-0.5"
      >
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

  const queryAmount = useMemo<number>(() => {
    if (mode === 'top') return Math.max(1, Math.ceil(top / 5));
    const f = Number(range.from);
    const t = Number(range.to);
    if (!Number.isFinite(f) || !Number.isFinite(t) || t <= f) return 1;
    const exclusiveLen = t - f; // e.g., 1179~1189 => 10
    return Math.max(1, Math.ceil(exclusiveLen / 10));
  }, [mode, top, range.from, range.to]);

  const queryLabel = creditBuildCostLabel({
    spendKey: 'analysis',
    baseLabel: '조회',
    isBusy: false,
    busyLabel: '조회 중…',
    amountOverride: queryAmount,
  });

  const reportLabel = creditBuildCostLabel({
    spendKey: 'csv',
    baseLabel: '리포트 다운로드',
    isBusy: false,
    busyLabel: '다운로드 준비…',
    amountOverride: CREDIT_SPEND_COST.csv,
  });

  const onDownloadReport = () => {
    const s = currentStats;
    if (!s) return;
    const rows: Array<ReadonlyArray<string | number>> = [];
    rows.push(['window', appliedWindow]);
    rows.push(['number', 'total_frequency', 'overdue', 'recent_frequency']);
    for (let n = 1; n <= 45; n += 1) {
      const f = s.frequency[n] ?? 0;
      const o = s.overdue[n] ?? 0;
      const r = s.recentFrequency[n] ?? 0;
      rows.push([n, f, o, r]);
    }
    downloadCsv('hot-cold-report.csv', rows);
  };

  const onQuery = () => {
    if (mode === 'top') {
      setShouldFetch(false); // reset first to ensure hook re-evaluates
      setTimeout(() => setShouldFetch(true), 0);
      return;
    }
    const f = Number(range.from);
    const t = Number(range.to);
    if (!Number.isFinite(f) || !Number.isFinite(t) || t <= f) return;
    const exclusiveLen = t - f;
    setAppliedWindow(exclusiveLen);
    setLocalLoading(true);
    void getLottoDraws({ from: f, to: t })
      .then((draws) => {
        const frequency: Record<number, number> = {};
        const overdue: Record<number, number> = {};
        const recentFrequency: Record<number, number> = {};
        for (let n = 1; n <= 45; n += 1) {
          frequency[n] = 0;
          overdue[n] = exclusiveLen;
          recentFrequency[n] = 0;
        }
        const sorted = [...(draws || [])].sort(
          (a, b) => a.drawNumber - b.drawNumber
        );
        const recentLimit = Math.min(50, exclusiveLen);
        const lastSeen: Record<number, number | null> = {};
        for (let n = 1; n <= 45; n += 1) lastSeen[n] = null;
        for (let i = 0; i < sorted.length; i += 1) {
          const d = sorted[i];
          for (const n of d.numbers) frequency[n] += 1;
        }
        for (let idx = sorted.length - 1; idx >= 0; idx -= 1) {
          const d = sorted[idx];
          for (const n of d.numbers)
            if (lastSeen[n] === null) lastSeen[n] = idx;
        }
        for (let n = 1; n <= 45; n += 1) {
          const pos = lastSeen[n];
          overdue[n] = pos === null ? exclusiveLen : sorted.length - 1 - pos;
        }
        const startRecent = Math.max(0, sorted.length - recentLimit);
        for (let i = startRecent; i < sorted.length; i += 1) {
          const d = sorted[i];
          for (const n of d.numbers) recentFrequency[n] += 1;
        }
        setLocalStats({ frequency, overdue, recentFrequency });
      })
      .finally(() => setLocalLoading(false));
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      <Card className="rounded-xl border border-border bg-surface-card p-6 shadow-sm md:p-7 bg-white">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="font-semibold">핫/콜드/지연 요약</h3>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={mode === 'top' ? 'default' : 'outline'}
                className={`h-8 rounded-md px-3 text-sm`}
                onClick={() => {
                  setMode('top');
                  setShouldFetch(false);
                }}
              >
                Top 모드
              </Button>
              <Button
                type="button"
                variant={mode === 'range' ? 'default' : 'outline'}
                className={`h-8 rounded-md px-3 text-sm`}
                onClick={() => {
                  setMode('range');
                  setShouldFetch(false);
                }}
              >
                회차 범위 모드
              </Button>
            </div>

            {mode === 'top' ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Top</span>
                <Select
                  value={String(top)}
                  onValueChange={(v) => {
                    setTop(Number(v));
                    setShouldFetch(false);
                  }}
                >
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 25, 30].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <div>
                  <div className="text-[10px] text-muted-foreground">
                    From(회차)
                  </div>
                  <Input
                    inputMode="numeric"
                    type="text"
                    className="h-8 w-24"
                    value={range.from}
                    onChange={(e) => {
                      setShouldFetch(false);
                      setRange((r) => ({ ...r, from: e.target.value }));
                    }}
                  />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">
                    To(회차)
                  </div>
                  <Input
                    inputMode="numeric"
                    type="text"
                    className="h-8 w-24"
                    value={range.to}
                    onChange={(e) => {
                      setShouldFetch(false);
                      setRange((r) => ({ ...r, to: e.target.value }));
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-end gap-2">
              <CreditGateButtonComponent
                variant="default"
                label={queryLabel}
                spendKey="analysis"
                amountOverride={queryAmount}
                onProceed={onQuery}
              />
              <CreditGateButtonComponent
                variant="default"
                label={reportLabel}
                spendKey="csv"
                amountOverride={CREDIT_SPEND_COST.csv}
                onProceed={onDownloadReport}
              />
            </div>
          </div>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">계산 중…</p>
        ) : !currentStats ? (
          <p className="mt-4 text-sm text-muted-foreground">
            데이터가 없습니다.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <div className="text-sm font-medium">
                자주 나온 번호(전체 빈도)
              </div>
              <ul className="mt-2 space-y-1">
                {frequencyTop.map(([n, v]) => renderRow(n, v, maxFreq, '회'))}
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium">
                오랫동안 안 나온 번호(지연)
              </div>
              <ul className="mt-2 space-y-1">
                {overdueTop.map(([n, v]) => renderRow(n, v, maxOverdue, '회'))}
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium">
                최근 급상승 번호(최근 빈도)
              </div>
              {mode === 'range' && (
                <div className="mt-1 text-xs text-muted-foreground">
                  최근 {appliedWindow}회 기준
                </div>
              )}
              <ul className="mt-2 space-y-1">
                {recentTop.map(([n, v]) => renderRow(n, v, maxRecent))}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
