'use client';

import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ClientCsvButtonComponent,
  CreditGateButtonComponent,
} from '@/components';
import { creditBuildCostLabel, LottoGenerator } from '@/utils';
import { toast } from 'sonner';
import type {
  LottoConstraintPresetType,
  LottoGenerateFiltersType,
} from '@/types';
import {
  useConstraintPresetsQuery,
  useDeleteConstraintPresetMutation,
  useSaveConstraintPresetMutation,
  useSaveGenerationLogMutation,
} from '@/queries';
import { useSearchParams } from 'next/navigation';

// helper: empty string -> undefined, then coerce to int range
const toOptionalInt = (min: number, max: number) =>
  z
    .preprocess(
      (v) => (v === '' || v === null ? undefined : v),
      z.coerce.number().int().min(min).max(max)
    )
    .optional();

const schema = z
  .object({
    count: z.coerce.number().int().min(1).max(20).default(3),
    excludeNumbers: z.string().trim().optional(),
    fixedNumbers: z.string().trim().optional(),
    sumMin: toOptionalInt(6, 270),
    sumMax: toOptionalInt(6, 270),
    maxConsecutive: toOptionalInt(0, 6),
    desiredOddCount: toOptionalInt(0, 6),
    minBucketSpread: toOptionalInt(1, 5),
    presetName: z.string().trim().max(40).optional(),
  })
  .refine((v) => !v.sumMin || !v.sumMax || v.sumMin <= v.sumMax, {
    path: ['sumMax'],
    message: 'sumMax must be >= sumMin',
  });

// Use schema input type to match resolver expectations
type FormType = z.input<typeof schema>;

type GeneratedRow = Readonly<{
  numbers: readonly [number, number, number, number, number, number];
}>;

function parseNums(s?: string | null): number[] {
  if (!s) return [];
  return s
    .split(/[ ,]+/)
    .map((x) => Number(x))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 45);
}

function toFilters(v: FormType): LottoGenerateFiltersType {
  const f: LottoGenerateFiltersType = {};
  const asNum = (x: unknown): number | undefined =>
    typeof x === 'number' && Number.isFinite(x) ? x : undefined;
  const sumMin = asNum((v as Record<string, unknown>).sumMin);
  const sumMax = asNum((v as Record<string, unknown>).sumMax);
  const maxConsecutive = asNum((v as Record<string, unknown>).maxConsecutive);
  const desiredOddCount = asNum((v as Record<string, unknown>).desiredOddCount);
  const minBucketSpread = asNum((v as Record<string, unknown>).minBucketSpread);
  if (sumMin !== undefined) f.sumMin = sumMin;
  if (sumMax !== undefined) f.sumMax = sumMax;
  if (maxConsecutive !== undefined) f.maxConsecutive = maxConsecutive;
  if (desiredOddCount !== undefined) f.desiredOddCount = desiredOddCount;
  if (minBucketSpread !== undefined) f.minBucketSpread = minBucketSpread;
  const ex = parseNums(
    (v as Record<string, unknown>).excludeNumbers as string | undefined
  );
  if (ex.length) f.excludeNumbers = Array.from(new Set(ex));
  const fx = parseNums(
    (v as Record<string, unknown>).fixedNumbers as string | undefined
  );
  if (fx.length) f.fixedNumbers = Array.from(new Set(fx));
  return f;
}

export function ConstraintsGeneratorComponent(): JSX.Element {
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: { count: 3 },
  });
  const [items, setItems] = useState<GeneratedRow[]>([]);
  const [clicks, setClicks] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rngType = useMemo(() => {
    const hasWebCrypto =
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as unknown as { crypto?: Crypto }).crypto !==
        'undefined' &&
      typeof (globalThis as unknown as { crypto: Crypto }).crypto
        .getRandomValues === 'function';
    return hasWebCrypto ? 'webcrypto' : 'math';
  }, []);

  const now = useMemo(() => new Date().toISOString(), []);

  const saveLogMut = useSaveGenerationLogMutation();

  const onGenerate = form.handleSubmit((v) => {
    setErrorMsg(null);
    const filters = toFilters(v);
    try {
      const out = LottoGenerator.generate(Number(v.count), filters);
      setItems(out.map((o) => ({ numbers: o.numbers })));
      setClicks((c) => c + 1);
      // fire-and-forget fairness log (errors are not critical to UX)
      saveLogMut.mutate(
        { rngType, filters, clickCount: clicks + 1 },
        {
          onError: (err: unknown) => {
            const status = (err as { response?: { status?: number } })?.response
              ?.status;
            if (status === 429) {
              toast.warning(
                '잠시 후 다시 시도해주세요. 요청이 너무 많습니다(쿨다운).'
              );
            }
          },
        }
      );
    } catch (e) {
      setItems([]);
      setErrorMsg(
        '조건이 너무 엄격합니다. 필터를 완화하거나 제외/고정 번호를 조정해 다시 시도하세요. _' +
          e
      );
    }
  });

  const countVal = Number(form.watch('count') ?? 1);
  const genExtraSteps = Math.max(0, Math.ceil((countVal - 3) / 2));
  const genAmountOverride = 1 + genExtraSteps;
  const generateLabel = creditBuildCostLabel({
    spendKey: 'advanced',
    baseLabel: '생성',
    isBusy: false,
    busyLabel: '생성 중…',
    amountOverride: genAmountOverride,
  });

  // Prefill from URL params (e.g., reproduce from fairness logs)
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!searchParams) return;
    const q = (key: string) => searchParams.get(key);
    const v: Partial<FormType> = {};
    if (q('count')) v.count = Number(q('count')) as number;
    if (q('sumMin')) v.sumMin = Number(q('sumMin')) as number;
    if (q('sumMax')) v.sumMax = Number(q('sumMax')) as number;
    if (q('maxConsecutive'))
      v.maxConsecutive = Number(q('maxConsecutive')) as number;
    if (q('desiredOddCount'))
      v.desiredOddCount = Number(q('desiredOddCount')) as number;
    if (q('minBucketSpread'))
      v.minBucketSpread = Number(q('minBucketSpread')) as number;
    if (q('excludeNumbers'))
      v.excludeNumbers = q('excludeNumbers') ?? undefined;
    if (q('fixedNumbers')) v.fixedNumbers = q('fixedNumbers') ?? undefined;
    if (Object.keys(v).length > 0) form.reset({ ...form.getValues(), ...v });
  }, [searchParams, form]);

  const presetsQ = useConstraintPresetsQuery();
  const savePresetMut = useSaveConstraintPresetMutation();
  const deletePresetMut = useDeleteConstraintPresetMutation();

  const applyPreset = (p: LottoConstraintPresetType) => {
    const f = p.filters || {};
    form.reset({
      count: 5,
      excludeNumbers: (f.excludeNumbers || []).join(', '),
      fixedNumbers: (f.fixedNumbers || []).join(', '),
      sumMin: f.sumMin,
      sumMax: f.sumMax,
      maxConsecutive: f.maxConsecutive,
      desiredOddCount: f.desiredOddCount,
      minBucketSpread: f.minBucketSpread,
      presetName: p.name,
    });
  };

  const savePreset = form.handleSubmit(async (v) => {
    const filters = toFilters(v);
    await savePresetMut.mutateAsync({
      name: v.presetName || 'Preset',
      filters,
    });
  });

  const csvHeaders = useMemo(() => ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'], []);
  const csvRows = useMemo<ReadonlyArray<readonly (string | number)[]>>(
    () => items.map((it) => it.numbers as unknown as readonly number[]),
    [items]
  );

  return (
    <div className="grid grid-cols-1 gap-8">
      <Card className="rounded-xl border border-border bg-surface-card p-6 shadow-sm md:p-7 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">조건 입력</h3>
          <ClientCsvButtonComponent
            className="h-8"
            headers={csvHeaders}
            rows={csvRows}
            filename="generated-numbers.csv"
            baseLabel="결과 CSV 내보내기"
          />
        </div>
        <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3 grid grid-cols-1 gap-3 sm:grid-cols-6">
            <div>
              <Label htmlFor="count" className="p-3">
                개수
              </Label>
              <Input
                id="count"
                type="text"
                inputMode="numeric"
                {...form.register('count')}
              />
            </div>
            <div>
              <Label htmlFor="sumMin" className="p-3">
                합계 최소
              </Label>
              <Input
                id="sumMin"
                type="text"
                inputMode="numeric"
                {...form.register('sumMin')}
              />
            </div>
            <div>
              <Label htmlFor="sumMax" className="p-3">
                합계 최대
              </Label>
              <Input
                id="sumMax"
                type="text"
                inputMode="numeric"
                {...form.register('sumMax')}
              />
            </div>
            <div>
              <Label htmlFor="maxConsecutive" className="p-3">
                연속 제한
              </Label>
              <Input
                id="maxConsecutive"
                type="text"
                inputMode="numeric"
                {...form.register('maxConsecutive')}
              />
            </div>
            <div>
              <Label htmlFor="desiredOddCount" className="p-3">
                홀수 개수
              </Label>
              <Input
                id="desiredOddCount"
                type="text"
                inputMode="numeric"
                {...form.register('desiredOddCount')}
              />
            </div>
            <div>
              <Label htmlFor="minBucketSpread" className="p-3">
                버킷 최소
              </Label>
              <Input
                id="minBucketSpread"
                type="text"
                inputMode="numeric"
                {...form.register('minBucketSpread')}
              />
            </div>
          </div>
          <div className="sm:col-span-3">
            <Label htmlFor="excludeNumbers" className="p-3">
              제외 번호(쉼표/공백 구분)
            </Label>
            <Input
              id="excludeNumbers"
              placeholder="예: 1, 2, 3"
              {...form.register('excludeNumbers')}
            />
          </div>
          <div className="sm:col-span-3">
            <Label htmlFor="fixedNumbers" className="p-3">
              고정 번호(쉼표/공백 구분)
            </Label>
            <Input
              id="fixedNumbers"
              placeholder="예: 7 14 21"
              {...form.register('fixedNumbers')}
            />
          </div>
          <div className="sm:col-span-3 flex items-end gap-3">
            <CreditGateButtonComponent
              label={generateLabel}
              spendKey="advanced"
              amountOverride={genAmountOverride}
              onProceed={() => {
                void onGenerate();
              }}
            />
          </div>
        </form>
      </Card>

      <Card className="rounded-xl border border-border bg-surface-card p-6 shadow-sm md:p-7 bg-white">
        <h3 className="font-semibold">생성 결과</h3>
        <div className="mt-2 text-xs text-muted-foreground">
          생성 근거: {now} · RNG: {rngType}
        </div>
        {errorMsg && (
          <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMsg}
          </div>
        )}
        {items.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            아직 생성된 번호가 없습니다.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-2">
            {items.map((it, idx) => (
              <li key={idx} className="rounded-lg border p-3 text-sm">
                {it.numbers.join(', ')}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="rounded-xl border border-border bg-surface-card p-6 shadow-sm md:p-7 bg-white">
        <h3 className="font-semibold">프리셋</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label htmlFor="presetName" className="p-3">
              프리셋 이름
            </Label>
            <Input
              id="presetName"
              placeholder="예: 합150±, 2연속 이하"
              {...form.register('presetName')}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              type="button"
              onClick={savePreset}
              disabled={presetsQ.isFetching}
            >
              저장
            </Button>
          </div>
        </div>
        {presetsQ.isFetching ? (
          <p className="mt-4 text-sm text-muted-foreground">불러오는 중…</p>
        ) : (presetsQ.data?.length ?? 0) === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            저장된 프리셋이 없습니다.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-2">
            {presetsQ.data!.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="text-sm font-medium">{p.name}</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => applyPreset(p)}
                  >
                    적용
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletePresetMut.isPending}
                    onClick={() => p.id && deletePresetMut.mutate(p.id)}
                  >
                    삭제
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
