'use client';

import type { JSX } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMyBudgetQuery, useSaveMyBudgetMutation } from '@/queries';

const schema = z.object({
  currentMonth: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}$/)
    .optional(),
  monthlyCap: z.coerce.number().int().min(0).default(0),
  spent: z.coerce.number().int().min(0).default(0),
});

// Match resolver expectations with schema input type
type FormType = z.input<typeof schema>;

function RatioBadge({ ratio }: { readonly ratio: number }): JSX.Element {
  const pct = Math.round(ratio * 100);
  let cls = 'bg-emerald-100 text-emerald-800';
  if (pct >= 80) cls = 'bg-red-100 text-red-800';
  else if (pct >= 50) cls = 'bg-amber-100 text-amber-800';
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${cls}`}
    >
      {pct}%
    </span>
  );
}

export function BudgetTrackerComponent(): JSX.Element {
  const { data, isFetching } = useMyBudgetQuery();
  const saveMut = useSaveMyBudgetMutation();

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: { monthlyCap: 0, spent: 0 },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      currentMonth: data.currentMonth,
      monthlyCap: data.monthlyCap,
      spent: data.spent,
    });
  }, [data, form]);

  const onSubmit = form.handleSubmit(async (v) => {
    await saveMut.mutateAsync({
      currentMonth: v.currentMonth,
      monthlyCap: v.monthlyCap,
      spent: v.spent,
    });
  });

  const cap = form.watch('monthlyCap') || 0;
  const spent = form.watch('spent') || 0;
  const ratio = cap > 0 ? Math.min(1, spent / cap) : 0;

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="border-border bg-surface-card p-5 bg-white">
        <h3 className="font-semibold">예산 설정</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          책임 있는 이용을 위해 월 예산을 설정하고 진행 상황을 관리하세요.
        </p>
        {isFetching && (
          <p className="mt-3 text-sm text-muted-foreground">불러오는 중…</p>
        )}
        <form
          onSubmit={onSubmit}
          className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <div>
            <Label htmlFor="currentMonth" className="p-3">
              월(YYYY-MM)
            </Label>
            <Input
              id="currentMonth"
              placeholder="2025-09"
              {...form.register('currentMonth')}
            />
          </div>
          <div>
            <Label htmlFor="monthlyCap" className="p-3">
              월 예산
            </Label>
            <Input
              id="monthlyCap"
              type="text"
              inputMode="numeric"
              {...form.register('monthlyCap')}
            />
          </div>
          <div>
            <Label htmlFor="spent" className="p-3">
              이번달 사용
            </Label>
            <Input
              id="spent"
              type="text"
              inputMode="numeric"
              {...form.register('spent')}
            />
          </div>
          <div className="sm:col-span-3 flex items-center gap-3">
            <div className="text-sm">
              진행률: <RatioBadge ratio={ratio} />
            </div>
            <Button type="submit" disabled={saveMut.isPending}>
              저장
            </Button>
          </div>
        </form>
        {cap > 0 && (
          <div className="mt-3 text-xs text-muted-foreground">
            {ratio >= 1 &&
              '예산 한도를 초과했습니다. 다음 달 예산을 재설정하세요.'}
            {ratio >= 0.8 &&
              ratio < 1 &&
              '예산의 80%를 사용했습니다. 신중하세요.'}
            {ratio >= 0.5 && ratio < 0.8 && '예산의 50%를 지났습니다.'}
          </div>
        )}
      </Card>
    </div>
  );
}
