'use client';

import { GenerateFiltersType } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export type GenerateControlsType = {
  readonly count: number;
  readonly filters: GenerateFiltersType;
  readonly onChangeCount: (next: number) => void;
  readonly onChangeFilters: (
    updater: (prev: GenerateFiltersType) => GenerateFiltersType
  ) => void;
};

export function LottoAdvancedGenerateControlsComponent({
  count,
  filters,
  onChangeCount,
  onChangeFilters,
}: GenerateControlsType) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="count">생성 매수</Label>
          <Input
            id="count"
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => onChangeCount(Number(e.target.value))}
          />
        </div>
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="sumMin">합계 최소</Label>
          <Input
            id="sumMin"
            type="number"
            value={filters.sumMin ?? ''}
            onChange={(e) =>
              onChangeFilters((p) => ({
                ...p,
                sumMin:
                  e.target.value === '' ? undefined : Number(e.target.value),
              }))
            }
          />
        </div>
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="sumMax">합계 최대</Label>
          <Input
            id="sumMax"
            type="number"
            value={filters.sumMax ?? ''}
            onChange={(e) =>
              onChangeFilters((p) => ({
                ...p,
                sumMax:
                  e.target.value === '' ? undefined : Number(e.target.value),
              }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="maxConsecutive">최대 연속수</Label>
          <Input
            id="maxConsecutive"
            type="number"
            min={0}
            max={6}
            value={filters.maxConsecutive ?? 6}
            onChange={(e) =>
              onChangeFilters((p) => ({
                ...p,
                maxConsecutive: Number(e.target.value),
              }))
            }
          />
        </div>
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="oddCount">홀수 개수</Label>
          <Input
            id="oddCount"
            type="number"
            min={0}
            max={6}
            value={filters.desiredOddCount ?? ''}
            onChange={(e) =>
              onChangeFilters((p) => ({
                ...p,
                desiredOddCount:
                  e.target.value === '' ? undefined : Number(e.target.value),
              }))
            }
          />
        </div>
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="minBucketSpread">구간 최소개수</Label>
          <Input
            id="minBucketSpread"
            type="number"
            min={1}
            max={5}
            value={filters.minBucketSpread ?? ''}
            onChange={(e) =>
              onChangeFilters((p) => ({
                ...p,
                minBucketSpread:
                  e.target.value === '' ? undefined : Number(e.target.value),
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}

export default LottoAdvancedGenerateControlsComponent;
