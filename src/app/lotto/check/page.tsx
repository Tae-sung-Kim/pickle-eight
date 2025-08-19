'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LottoDrawType } from '@/types/lotto.type';
import { LottoUtils } from '@/utils/lotto.util';

const schema = z
  .object({
    drwNo: z
      .number({ invalid_type_error: '회차는 숫자여야 합니다.' })
      .int('정수를 입력하세요.')
      .positive('1 이상의 숫자여야 합니다.'),
    n1: z.number().int().min(1).max(45),
    n2: z.number().int().min(1).max(45),
    n3: z.number().int().min(1).max(45),
    n4: z.number().int().min(1).max(45),
    n5: z.number().int().min(1).max(45),
    n6: z.number().int().min(1).max(45),
  })
  .refine(
    (v) => {
      const set = new Set([v.n1, v.n2, v.n3, v.n4, v.n5, v.n6]);
      return set.size === 6;
    },
    { message: '번호는 중복될 수 없습니다.', path: ['n6'] }
  );

type FormValues = z.infer<typeof schema>;

async function fetchDraw(drwNo: number): Promise<LottoDrawType> {
  const res = await fetch(
    `/api/lotto/draws?drwNo=${encodeURIComponent(String(drwNo))}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? '회차 정보를 불러오지 못했습니다.');
  }
  const json = (await res.json()) as { data: LottoDrawType };
  return json.data;
}

function RankBadge({ rank }: { rank: 0 | 1 | 2 | 3 | 4 | 5 }) {
  const label = rank === 0 ? '미당첨' : `${rank}등`;
  const color =
    rank === 1
      ? 'bg-emerald-600'
      : rank === 2
      ? 'bg-blue-600'
      : rank === 3
      ? 'bg-purple-600'
      : rank === 4
      ? 'bg-amber-600'
      : rank === 5
      ? 'bg-gray-700'
      : 'bg-gray-400';
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${color}`}
    >
      {label}
    </span>
  );
}

export default function Page() {
  const [result, setResult] = useState<{
    draw?: LottoDrawType;
    matches?: ReturnType<typeof LottoUtils.checkTicket>;
    error?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState,
    // setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { drwNo: 1100, n1: 1, n2: 2, n3: 3, n4: 4, n5: 5, n6: 6 },
  });

  const numbers = watch(['n1', 'n2', 'n3', 'n4', 'n5', 'n6']);
  const canSubmit = useMemo(() => formState.isValid, [formState.isValid]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setResult(null);
      const draw = await fetchDraw(values.drwNo);
      const ticket = LottoUtils.toTicket([
        values.n1,
        values.n2,
        values.n3,
        values.n4,
        values.n5,
        values.n6,
      ]);
      const matches = LottoUtils.checkTicket(draw, ticket);
      setResult({ draw, matches });
    } catch (e) {
      setResult({ error: (e as Error).message });
    }
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">로또 번호 채점기</h1>
      <p className="text-sm text-muted-foreground mt-1">
        회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 확인하세요.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <div className="flex items-center gap-3">
          <label htmlFor="drwNo" className="w-20 text-sm">
            회차
          </label>
          <input
            id="drwNo"
            type="number"
            className="w-40 rounded-md border px-3 py-2 text-sm"
            {...register('drwNo', { valueAsNumber: true })}
            min={1}
          />
          {formState.errors.drwNo && (
            <span className="text-xs text-red-600">
              {formState.errors.drwNo.message}
            </span>
          )}
        </div>

        <div>
          <div className="mb-2 text-sm">번호 (1~45, 중복 불가)</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(['n1', 'n2', 'n3', 'n4', 'n5', 'n6'] as const).map((name) => (
              <input
                key={name}
                type="number"
                min={1}
                max={45}
                className="rounded-md border px-3 py-2 text-sm"
                {...register(name, { valueAsNumber: true })}
              />
            ))}
          </div>
          {formState.errors.n6 && (
            <p className="mt-1 text-xs text-red-600">
              {formState.errors.n6.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          채점하기
        </button>
      </form>

      <div className="mt-8">
        {result?.error && (
          <p className="text-sm text-red-600">오류: {result.error}</p>
        )}
        {result?.draw && result?.matches && (
          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  회차 {result.draw.drawNumber} · {result.draw.drawDate}
                </div>
                <div className="mt-1 flex gap-1">
                  {result.draw.numbers.map((n) => (
                    <span
                      key={n}
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                        numbers.includes(n)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {n}
                    </span>
                  ))}
                  <span className="mx-2 text-sm">+</span>
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                      numbers.includes(result.draw.bonusNumber)
                        ? 'bg-amber-600 text-white'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {result.draw.bonusNumber}
                  </span>
                </div>
              </div>
              <RankBadge rank={result.matches.rank} />
            </div>

            <div className="mt-3 text-sm">
              일치 개수:{' '}
              <span className="font-medium">{result.matches.matchCount}</span> /
              보너스 일치:{' '}
              <span className="font-medium">
                {result.matches.bonusMatch ? '예' : '아니오'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
