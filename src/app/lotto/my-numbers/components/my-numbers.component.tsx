'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useMemo } from 'react';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ClientCsvButtonComponent } from '@/features/lotto/components/client-csv-button.component';
import { LottoCheckTicketRowComponent } from '@/features/lotto/components/ticket-row.component';
import {
  useDeleteNumberSetMutation,
  useMyNumberResultsQuery,
  useMyNumberSetsQuery,
  useSaveNumberSetMutation,
} from '@/features/lotto/queries/use-lotto-user.query';
import { LOTTO_BONUS_COLOR } from '@/features/lotto/utils/lotto.util';

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

// Form values accept string|number for numeric fields to allow empty/typing states
type NumInput = string | number;
type FormType = {
  label?: string;
  isFavorite: boolean;
  n1: NumInput;
  n2: NumInput;
  n3: NumInput;
  n4: NumInput;
  n5: NumInput;
  n6: NumInput;
};

export function MyNumbersComponent(): JSX.Element {
  const { data: list = [], isFetching } = useMyNumberSetsQuery();
  const saveMut = useSaveNumberSetMutation();
  const delMut = useDeleteNumberSetMutation();
  const resultsQ = useMyNumberResultsQuery();
  const resultById = useMemo(
    () => new Map((resultsQ.data?.items ?? []).map((r) => [r.id, r])),
    [resultsQ.data]
  );

  const form = useForm<FormType>({
    resolver: zodResolver(schema) as Resolver<FormType>,
    defaultValues: {
      label: '',
      isFavorite: false,
      n1: '',
      n2: '',
      n3: '',
      n4: '',
      n5: '',
      n6: '',
    },
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
    const nums = [
      values.n1,
      values.n2,
      values.n3,
      values.n4,
      values.n5,
      values.n6,
    ]
      .map((v) => Number(v))
      .slice(0, 6)
      .sort((a, b) => a - b) as [
      number,
      number,
      number,
      number,
      number,
      number,
    ];
    await saveMut.mutateAsync({
      numbers: nums,
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
    });
  });

  const numberFields = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'] as const;
  type NumberFieldName = (typeof numberFields)[number];
  type ErrorFields = Partial<Record<NumberFieldName, { message?: string }>>;

  const isDuplicate = (name: NumberFieldName, val: string): boolean => {
    const num = Number(val);
    if (!Number.isInteger(num)) return false;
    for (const f of numberFields) {
      if (f === name) continue;
      const v = form.getValues(f as unknown as keyof FormType) as unknown as
        | string
        | number
        | undefined;
      const ov = typeof v === 'number' ? v : Number(v);
      if (Number.isInteger(ov) && ov === num) return true;
    }
    return false;
  };

  const numberErrors = form.formState.errors as unknown as ErrorFields;
  const firstNumberErrorMsg =
    numberFields
      .map((f) => numberErrors[f]?.message)
      .find((m): m is string => typeof m === 'string' && m.length > 0) || null;

  return (
    <div className="grid grid-cols-1 gap-8">
      <Card className="rounded-xl border border-border bg-surface-card p-6 shadow-sm md:p-7 bg-white">
        <h3 className="font-semibold">번호 저장</h3>
        <form
          onSubmit={onSubmit}
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="sm:col-span-3">
            <Label htmlFor="label" className="p-3">
              레이블
            </Label>
            <Input
              id="label"
              placeholder="예: 매주 고정"
              {...form.register('label')}
            />
          </div>
          <div className="sm:col-span-3 w-full">
            <LottoCheckTicketRowComponent
              index={0}
              canRemove={false}
              onRemove={() => {}}
              renderInput={(name) => (
                <Controller
                  name={name as unknown as keyof FormType}
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      inputMode="numeric"
                      type="text"
                      autoComplete="off"
                      pattern="[0-9]*"
                      value={(field.value as string) ?? ''}
                      aria-invalid={Boolean(
                        (form.formState.errors as unknown as ErrorFields)[
                          name as NumberFieldName
                        ]
                      )}
                      className="h-10 w-12 text-center sm:w-14"
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') {
                          form.clearErrors(name as NumberFieldName);
                          field.onChange(raw);
                          return;
                        }
                        if (!/^\d{1,2}$/.test(raw)) {
                          return; // ignore non-numeric or >2 digits typing
                        }
                        field.onChange(raw);
                      }}
                      onBlur={() => {
                        const val = String(field.value ?? '');
                        if (val === '') {
                          form.clearErrors(name as NumberFieldName);
                          return;
                        }
                        const num = Number(val);
                        if (!Number.isInteger(num) || num < 1 || num > 45) {
                          form.setError(name as NumberFieldName, {
                            type: 'range',
                            message: '1~45 사이의 정수를 입력하세요.',
                          });
                          return;
                        }
                        if (isDuplicate(name as NumberFieldName, val)) {
                          form.setError(name as NumberFieldName, {
                            type: 'duplicate',
                            message: '중복 번호는 입력할 수 없어요.',
                          });
                          return;
                        }
                        form.clearErrors(name as NumberFieldName);
                      }}
                    />
                  )}
                />
              )}
            />
          </div>
          {firstNumberErrorMsg && (
            <div className="sm:col-span-3 -mt-2 text-xs text-destructive">
              {firstNumberErrorMsg}
            </div>
          )}
          <div className="sm:col-span-3 mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="favorite"
                checked={form.watch('isFavorite') ?? false}
                onCheckedChange={(v) => form.setValue('isFavorite', v)}
              />
              <Label htmlFor="favorite" className="p-3">
                즐겨찾기
              </Label>
            </div>
            <Button type="submit" disabled={saveMut.isPending}>
              저장
            </Button>
          </div>
        </form>
      </Card>

      <Card className="rounded-xl border border-border bg-surface-card p-6 shadow-sm md:p-7 bg-white">
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
          <p className="mt-4 text-sm text-muted-foreground">불러오는 중…</p>
        ) : list.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            아직 저장된 번호가 없습니다.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-3">
            {list.map((it) => {
              const item = it.id ? resultById.get(it.id) : undefined;
              const results = item?.results ?? [];
              // 이 번호가 유효한 회차 중 가장 최근 추첨 결과
              const recent = results[0];
              const startDrawNumber =
                it.startDrawNumber ?? item?.startDrawNumber ?? null;
              const nextDrawNumber = resultsQ.data
                ? resultsQ.data.latestDrawNumber + 1
                : null;
              const waitingDrawNumber = startDrawNumber ?? nextDrawNumber;
              const isWinning = recent !== undefined && recent.rank > 0;

              return (
                <li
                  key={it.id}
                  className="flex flex-col sm:flex-row sm:items-start justify-between rounded-lg border bg-card/50 p-3 transition hover:bg-card gap-3 sm:gap-0"
                >
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {it.label || '무제'}
                      </span>
                      {it.isFavorite && (
                        <span className="text-[10px] bg-warning/20 text-foreground px-1.5 py-0.5 rounded font-medium">
                          ★ 즐겨찾기
                        </span>
                      )}
                      {startDrawNumber !== null && (
                        <span className="text-[10px] text-muted-foreground">
                          {startDrawNumber}회부터 적용
                        </span>
                      )}
                    </div>

                    {/* 번호 목록 및 당첨 상태 (작은 뱃지) */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                      {it.numbers.map((n) => {
                        // 가장 최근 유효 회차의 당첨 번호와 일치하는 번호를 강조
                        const isMatched =
                          recent?.winningNumbers.includes(n) ?? false;
                        const isBnsMatched = recent?.bonusNumber === n;

                        return (
                          <span
                            key={n}
                            className={`text-xs w-6 h-6 flex items-center justify-center rounded-full border ${
                              isMatched
                                ? 'bg-primary text-primary-foreground border-primary font-bold shadow-sm'
                                : isBnsMatched
                                  ? `${LOTTO_BONUS_COLOR} font-bold shadow-sm`
                                  : 'bg-muted border-border text-muted-foreground'
                            }`}
                          >
                            {n}
                          </span>
                        );
                      })}

                      {recent ? (
                        <div
                          className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                            isWinning
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-muted text-muted-foreground border-border/50 opacity-60'
                          }`}
                        >
                          {recent.drawNumber}회:{' '}
                          {isWinning ? `${recent.rank}등` : '미당첨'}
                        </div>
                      ) : (
                        !resultsQ.isLoading && (
                          <div className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium border bg-muted text-muted-foreground border-border/50">
                            {waitingDrawNumber !== null
                              ? `${waitingDrawNumber}회 추첨 대기`
                              : '추첨 대기'}
                          </div>
                        )
                      )}
                    </div>

                    {results.length > 0 && (
                      <details className="mt-1 text-xs">
                        <summary className="cursor-pointer text-muted-foreground">
                          회차별 결과 ({results.length}회)
                        </summary>
                        <ul className="mt-2 space-y-1">
                          {results.map((r) => (
                            <li
                              key={r.drawNumber}
                              className="flex flex-wrap items-center gap-x-3 tabular-nums"
                            >
                              <span className="w-12">{r.drawNumber}회</span>
                              <span className="text-muted-foreground">
                                {r.drawDate}
                              </span>
                              <span>
                                일치 {r.matchCount}개
                                {r.matchCount === 5 && r.bonusMatch
                                  ? ' + 보너스'
                                  : ''}
                              </span>
                              <span
                                className={
                                  r.rank > 0
                                    ? 'font-semibold text-primary'
                                    : 'text-muted-foreground'
                                }
                              >
                                {r.rank > 0 ? `${r.rank}등` : '미당첨'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
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
                        })
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
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
