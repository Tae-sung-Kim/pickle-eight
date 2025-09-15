'use client';

import type { JSX } from 'react';
import { Card } from '@/components/ui/card';
import { useGenerationLogsQuery } from '@/queries';
import Link from 'next/link';
import type { LottoGenerateFiltersType } from '@/types';

function buildConstraintsUrl(filters?: LottoGenerateFiltersType): string {
  const base = '/lotto/dashboard#constraints';
  if (!filters) return base;
  const p = new URLSearchParams();
  const trySet = (k: string, v?: number | string | readonly number[]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      if (v.length > 0) p.set(k, v.join(','));
      return;
    }
    p.set(k, String(v));
  };
  trySet('sumMin', filters.sumMin);
  trySet('sumMax', filters.sumMax);
  trySet('maxConsecutive', filters.maxConsecutive);
  trySet('desiredOddCount', filters.desiredOddCount);
  trySet('minBucketSpread', filters.minBucketSpread);
  trySet('excludeNumbers', filters.excludeNumbers);
  trySet('fixedNumbers', filters.fixedNumbers);
  const qs = p.toString();
  return qs ? `/lotto/dashboard?${qs}#constraints` : base;
}

export function FairnessLogComponent(): JSX.Element {
  const { data = [], isFetching } = useGenerationLogsQuery(30);

  return (
    <div className="grid grid-cols-1 gap-8">
      <Card className="rounded-xl border border-border bg-surface-card p-6 shadow-sm md:p-7 bg-white">
        <h3 className="font-semibold">최근 생성 기록</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          RNG 유형, 시드(있다면), 적용된 제약, 클릭 횟수 등을 표시합니다. 일부
          항목은 프라이버시를 위해 마스킹될 수 있습니다.
        </p>
        {isFetching ? (
          <p className="mt-4 text-sm text-muted-foreground">불러오는 중…</p>
        ) : data.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            아직 기록이 없습니다.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-3">
            {data.map((row) => (
              <li key={row.id} className="rounded-lg border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{row.ts}</div>
                  <div className="text-xs text-muted-foreground">
                    RNG: {row.rngType}
                  </div>
                </div>
                {row.seed && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    seed: {row.seed}
                  </div>
                )}
                {row.filters && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    filters: {JSON.stringify(row.filters)}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  {typeof row.clickCount === 'number' && (
                    <div className="text-xs text-muted-foreground">
                      clicks: {row.clickCount}
                    </div>
                  )}
                  <Link
                    className="text-xs font-medium text-primary hover:underline"
                    href={buildConstraintsUrl(row.filters)}
                  >
                    재현하기
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
