'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useLatestLottoDrawQuery,
  useLottoDrawByNumberMutation,
} from '@/queries/use-lotto.query';
import type { LottoDrawType, TicketFieldNameType } from '@/types/lotto.type';
import { LottoUtils } from '@/utils/lotto.util';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { LottoCheckResultCardComponent } from './result-card.component';
import { LottoCheckTicketRowComponent } from '@/components/shared/lotto/ticket-row.component';

// 문자열(빈 값 포함)을 숫자로 전처리하는 유틸 스키마
const toNumber = (min: number, max?: number) =>
  z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : v;
    },
    z
      .number({
        required_error: '필수 입력입니다.',
        invalid_type_error: '숫자를 입력하세요.',
      })
      .int('정수를 입력하세요.')
      .min(min, `${min} 이상이어야 합니다.`)
      .refine((n) => (typeof max === 'number' ? n <= max : true), {
        message: `${max} 이하이어야 합니다.`,
      })
  );

const ticketSchema = z
  .object({
    n1: toNumber(1, 45),
    n2: toNumber(1, 45),
    n3: toNumber(1, 45),
    n4: toNumber(1, 45),
    n5: toNumber(1, 45),
    n6: toNumber(1, 45),
  })
  .refine(
    (v) => {
      const nums = [v.n1, v.n2, v.n3, v.n4, v.n5, v.n6];
      if (nums.some((n) => typeof n !== 'number' || Number.isNaN(n))) {
        return true;
      }
      return new Set(nums as number[]).size === 6;
    },
    { message: '번호는 중복될 수 없습니다.', path: ['n6'] }
  );

const schema = z.object({
  drwNo: toNumber(1),
  tickets: z.array(ticketSchema).min(1, '최소 1개의 조합이 필요합니다.'),
});

type FormValues = z.output<typeof schema>;
type FormValuesInput = z.input<typeof schema>;

export function LottoCheckComponent() {
  const [result, setResult] = useState<{
    draw?: LottoDrawType;
    matchesList?: ReturnType<typeof LottoUtils.checkTicket>[];
    tickets?: number[][];
    error?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState,
    // watch,
    reset,
    control,
    setValue,
    getValues,
    setError,
    clearErrors,
  } = useForm<FormValuesInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      tickets: [
        {
          n1: undefined as unknown as number,
          n2: undefined as unknown as number,
          n3: undefined as unknown as number,
          n4: undefined as unknown as number,
          n5: undefined as unknown as number,
          n6: undefined as unknown as number,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tickets',
  });

  // 실시간 티켓 개수 감지 (fields는 렌더 후 갱신되므로 useWatch 사용)
  const ticketsWatch = useWatch({ control, name: 'tickets' });
  const ticketsLen = (ticketsWatch?.length ?? 0) as number;

  // 티켓 추가
  const handleTicketRowAdd = useCallback(() => {
    if (ticketsLen >= 5) {
      toast.error('최대 5개의 티켓까지만 추가할 수 있습니다.');
      return;
    }

    append({
      n1: undefined as unknown as number,
      n2: undefined as unknown as number,
      n3: undefined as unknown as number,
      n4: undefined as unknown as number,
      n5: undefined as unknown as number,
      n6: undefined as unknown as number,
    });
  }, [append, ticketsLen]);

  // const ticketsWatch = watch('tickets');
  // const selectedSet = useMemo(() => {
  //   const all = (ticketsWatch ?? []).flatMap((t) =>
  //     [t?.n1, t?.n2, t?.n3, t?.n4, t?.n5, t?.n6]
  //       .map((v) => Number(v))
  //       .filter((n) => Number.isFinite(n))
  //   );
  //   return new Set(all as number[]);
  // }, [ticketsWatch]);

  const { mutateAsync: fetchDraw } = useLottoDrawByNumberMutation();
  const { data: latestDraw } = useLatestLottoDrawQuery();

  const canSubmit = useMemo(() => formState.isValid, [formState.isValid]);

  // 초기 로드 시 최신 회차 번호를 폼에 세팅
  useEffect(() => {
    const latest = latestDraw?.lastDrawNumber;
    if (!latest || latest <= 0) return;
    reset({
      drwNo: latest,
      tickets: [
        {
          n1: undefined as unknown as number,
          n2: undefined as unknown as number,
          n3: undefined as unknown as number,
          n4: undefined as unknown as number,
          n5: undefined as unknown as number,
          n6: undefined as unknown as number,
        },
      ],
    } as Partial<FormValuesInput>);
  }, [latestDraw, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const parsed = schema.parse(values) as FormValues;
      const draw = await fetchDraw(parsed.drwNo);
      const matchesList = parsed.tickets.map((t) =>
        LottoUtils.checkTicket(
          draw,
          LottoUtils.toTicket([t.n1, t.n2, t.n3, t.n4, t.n5, t.n6])
        )
      );
      const ticketsNums = parsed.tickets.map((t) => [
        t.n1,
        t.n2,
        t.n3,
        t.n4,
        t.n5,
        t.n6,
      ]);
      setResult(() => ({
        draw,
        matchesList,
        tickets: ticketsNums,
        error: undefined,
      }));
    } catch (e) {
      setResult({ error: (e as Error).message });
    }
  });

  // 숫자 입력 정규화: 숫자만, 최대 2자리, 1~45, 0 금지
  const normalizeTicketInput =
    (idx: number, name: TicketFieldNameType) =>
    (e: React.FormEvent<HTMLInputElement>) => {
      const el = e.currentTarget;
      let raw = el.value.replace(/[^0-9]/g, '');
      raw = raw.replace(/^0+/, ''); // 앞자리 0 제거
      if (raw.length > 2) raw = raw.slice(0, 2); // 2자리 제한
      const parsed = raw === '' ? undefined : Number(raw);
      const num = typeof parsed === 'number' ? Math.min(45, parsed) : undefined;
      if (num === 0) {
        setValue(`tickets.${idx}.${name}`, undefined as unknown as number, {
          shouldValidate: true,
          shouldDirty: true,
        });
        el.value = '';
        return;
      }
      setValue(`tickets.${idx}.${name}`, num as unknown as number, {
        shouldValidate: true,
        shouldDirty: true,
      });
      // 화면 값도 정규화 결과로 반영 (45 초과 입력 시 즉시 45로 변경)
      el.value = typeof num === 'number' ? String(num) : '';
    };

  // 같은 행(티켓) 중복 체크는 blur 시에만 수행하여 입력 조합(예: 45)을 방해하지 않음
  const onCheckDuplicateOnBlur =
    (idx: number, name: TicketFieldNameType) => () => {
      const row = getValues(`tickets.${idx}` as const) as
        | {
            n1?: number;
            n2?: number;
            n3?: number;
            n4?: number;
            n5?: number;
            n6?: number;
          }
        | undefined;
      const val = Number(row?.[name]);
      if (!Number.isFinite(val)) {
        clearErrors(`tickets.${idx}.${name}` as const);
        return;
      }
      const dup = (['n1', 'n2', 'n3', 'n4', 'n5', 'n6'] as const)
        .filter((n) => n !== name)
        .some((key) => Number(row?.[key]) === val);
      if (dup) {
        setError(`tickets.${idx}.${name}` as const, {
          type: 'validate',
          message: '같은 티켓에서 중복될 수 없습니다.',
        });
        setValue(`tickets.${idx}.${name}`, undefined as unknown as number, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        clearErrors(`tickets.${idx}.${name}` as const);
      }
    };

  return (
    <>
      <div className="mt-2 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        ※ 채점은 보너스 번호 일치 여부를 별도로 판단하여 등수(2등 등)에
        반영합니다. 반면 분석/생성 통계는 보너스 번호를 포함하지 않습니다.
      </div>
      <Card className="mt-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">입력</CardTitle>
          <CardDescription>
            회차와 번호를 입력 후 채점하기를 누르세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-3">
                <Label htmlFor="drwNo" className="w-20 text-sm">
                  회차
                </Label>
                <Input
                  id="drwNo"
                  type="number"
                  className="w-40"
                  min={1}
                  placeholder="예: 1124"
                  inputMode="numeric"
                  {...register('drwNo', { valueAsNumber: true })}
                />
                {(formState.touchedFields.drwNo || formState.submitCount > 0) &&
                  formState.errors.drwNo && (
                    <span className="text-xs text-destructive">
                      {formState.errors.drwNo.message}
                    </span>
                  )}
              </div>
              <div className="sm:ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 border-primary text-primary hover:bg-primary/10 hover:text-primary"
                  onClick={handleTicketRowAdd}
                >
                  <Plus className="h-4 w-4" />
                  추가
                </Button>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>번호 (1~45, 중복 불가)</span>
              </div>

              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <LottoCheckTicketRowComponent
                    key={field.id}
                    index={idx}
                    renderInput={(name) => (
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={2}
                        placeholder="--"
                        className="w-14 text-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-16"
                        onInput={normalizeTicketInput(idx, name)}
                        {...register(`tickets.${idx}.${name}` as const, {
                          onBlur: onCheckDuplicateOnBlur(idx, name),
                        })}
                      />
                    )}
                    canRemove={fields.length > 1}
                    onRemove={() => remove(idx)}
                  />
                ))}
              </div>

              {formState.errors.tickets && (
                <p className="mt-1 text-xs text-destructive">
                  {formState.errors.tickets?.root?.message as string}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full gap-2 px-5 sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none"
            >
              <Sparkles className="h-4 w-4" />
              채점하기
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && Array.isArray(result?.matchesList) && (
        <div className="mt-8">
          {result?.error && (
            <p className="text-sm text-red-600">오류: {result.error}</p>
          )}
          {result?.draw && result.matchesList && result.tickets && (
            <LottoCheckResultCardComponent
              draw={result.draw}
              matchesList={result.matchesList}
              tickets={result.tickets}
            />
          )}
        </div>
      )}
    </>
  );
}
