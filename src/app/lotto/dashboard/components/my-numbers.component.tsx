'use client';

import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  useAutoCompareQuery,
  useDeleteNumberSetMutation,
  useMyNumberSetsQuery,
  useSaveNumberSetMutation,
  useLatestLottoDrawQuery,
} from '@/queries';
import { ClientCsvButtonComponent } from '@/components';

const schema = z
  .object({
    label: z.string().trim().max(30).optional(),
    isFavorite: z.boolean().default(false),
    n1: z.coerce.number().int().min(1).max(45),
    n2: z.coerce.number().int().min(1).max(45),
    n3: z.coerce.number().int().min(1).max(45),
    n4: z.coerce.number().int().min(1).max(45),
    n5: z.coerce.number().int().min(1).max(45),
    n6: z.coerce.number().int().min(1).max(45),
  })
  .superRefine((val, ctx) => {
    const arr = [val.n1, val.n2, val.n3, val.n4, val.n5, val.n6];
    const uniq = new Set(arr);
    if (uniq.size !== 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '번호는 6개 모두 서로 달라야 합니다.',
      });
    }
  });

// Use schema input type to align with resolver expectations
type FormType = z.input<typeof schema>;

export function MyNumbersComponent(): JSX.Element {
  const { data: list = [], isFetching } = useMyNumberSetsQuery();
  const saveMut = useSaveNumberSetMutation();
  const delMut = useDeleteNumberSetMutation();
  const latestQ = useLatestLottoDrawQuery({ enabled: true });

  const [range, setRange] = useState<{ from: string; to: string }>(() => ({
    from: '',
    to: '',
  }));
  const [compareKey, setCompareKey] = useState<{
    from: number;
    to: number;
  } | null>(null);

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: '',
      isFavorite: false,
      n1: '',
      n2: '',
      n3: '',
      n4: '',
      n5: '',
      n6: '',
    } as unknown as FormType,
  });

  const csvHeaders = useMemo(() => ['label', 'numbers', 'favorite'], []);
  const csvRows = useMemo<ReadonlyArray<readonly (string | number)[]>>(
    () =>
      list.map(
        (it) =>
          [
            it.label || '',
            it.numbers.join('-'),
            it.isFavorite ? 'Y' : 'N',
          ] as const
      ),
    [list]
  );

  const onSubmit = form.handleSubmit(async (values) => {
    await saveMut.mutateAsync({
      numbers: [
        values.n1,
        values.n2,
        values.n3,
        values.n4,
        values.n5,
        values.n6,
      ]
        .slice(0, 6)
        .sort((a, b) => a - b) as unknown as [
        number,
        number,
        number,
        number,
        number,
        number
      ],
      label: values.label?.trim() || undefined,
      isFavorite: Boolean(values.isFavorite),
    });
    form.reset({
      label: '',
      isFavorite: false,
      n1: '',
      n2: '',
      n3: '',
      n4: '',
      n5: '',
      n6: '',
    } as unknown as FormType);
  });

  const canCompare = compareKey != null;
  const cmp = useAutoCompareQuery(
    compareKey?.from ?? 1,
    compareKey?.to ?? 1,
    canCompare
  );

  const setDefaultRange = () => {
    const latest = latestQ.data?.lastDrawNumber ?? 1;
    const to = String(latest);
    const from = String(Math.max(1, latest - 9));
    setRange({ from, to });
  };

  const rangeValid = useMemo(() => {
    const f = Number(range.from);
    const t = Number(range.to);
    return Number.isFinite(f) && Number.isFinite(t) && f >= 1 && t >= f;
  }, [range]);

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="border-border bg-surface-card p-5">
        <h3 className="font-semibold">번호 저장</h3>
        <form
          onSubmit={onSubmit}
          className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <div className="sm:col-span-3">
            <Label htmlFor="label">레이블</Label>
            <Input
              id="label"
              placeholder="예: 매주 고정"
              {...form.register('label')}
            />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:col-span-3 sm:grid-cols-6">
            <Input inputMode="numeric" type="text" {...form.register('n1')} />
            <Input inputMode="numeric" type="text" {...form.register('n2')} />
            <Input inputMode="numeric" type="text" {...form.register('n3')} />
            <Input inputMode="numeric" type="text" {...form.register('n4')} />
            <Input inputMode="numeric" type="text" {...form.register('n5')} />
            <Input inputMode="numeric" type="text" {...form.register('n6')} />
          </div>
          <div className="flex items-center gap-2 sm:col-span-3">
            <Switch
              id="favorite"
              checked={form.watch('isFavorite') ?? false}
              onCheckedChange={(v) => form.setValue('isFavorite', v)}
            />
            <Label htmlFor="favorite">즐겨찾기</Label>
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={saveMut.isPending}>
              저장
            </Button>
          </div>
        </form>
      </Card>

      <Card className="border-border bg-surface-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">저장된 번호</h3>
          <ClientCsvButtonComponent
            className="h-8"
            headers={csvHeaders}
            rows={csvRows}
            filename="my-number-sets.csv"
            baseLabel="CSV 내보내기"
          />
        </div>
        {isFetching ? (
          <p className="mt-3 text-sm text-muted-foreground">불러오는 중…</p>
        ) : list.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            아직 저장된 번호가 없습니다.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-3">
            {list.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {it.label || '무제'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {it.numbers.join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      form.reset({
                        label: it.label ?? undefined,
                        isFavorite: Boolean(it.isFavorite),
                        n1: String(it.numbers[0]),
                        n2: String(it.numbers[1]),
                        n3: String(it.numbers[2]),
                        n4: String(it.numbers[3]),
                        n5: String(it.numbers[4]),
                        n6: String(it.numbers[5]),
                      } as unknown as FormType)
                    }
                  >
                    불러오기
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={delMut.isPending}
                    onClick={async () => {
                      if (!it.id) return;
                      await delMut.mutateAsync(it.id);
                    }}
                  >
                    삭제
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="border-border bg-surface-card p-5">
        <h3 className="font-semibold">자동 비교</h3>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="from">From (회차)</Label>
            <Input
              id="from"
              type="text"
              inputMode="numeric"
              value={range.from}
              onChange={(e) =>
                setRange((r) => ({
                  ...r,
                  from: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="to">To (회차)</Label>
            <Input
              id="to"
              type="text"
              inputMode="numeric"
              value={range.to}
              onChange={(e) =>
                setRange((r) => ({
                  ...r,
                  to: e.target.value,
                }))
              }
            />
          </div>
          <Button type="button" variant="secondary" onClick={setDefaultRange}>
            최근 10주 자동
          </Button>
          <Button
            type="button"
            onClick={() =>
              setCompareKey({
                from: Number(range.from),
                to: Number(range.to),
              })
            }
            disabled={list.length === 0 || !rangeValid}
          >
            비교 실행
          </Button>
        </div>
        {cmp.isFetching && (
          <p className="mt-3 text-sm text-muted-foreground">비교 중…</p>
        )}
        {!cmp.isFetching && cmp.data && cmp.data.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3">
            {cmp.data.map((row) => {
              const best = row.results.reduce(
                (acc, r) =>
                  r.rank > 0 && (acc === 0 || r.rank < acc) ? r.rank : acc,
                0 as 0 | 1 | 2 | 3 | 4 | 5
              );
              return (
                <div
                  key={row.id ?? row.label ?? row.numbers.join('-')}
                  className="rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{row.label || '무제'}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.numbers.join(', ')}
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    최고 성적: {best === 0 ? '미당첨' : `${best}등`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
