'use client';

import React, { useMemo, useState } from 'react';
import { useLottoDrawsQuery } from '@/queries';
import { LottoBallComponent } from '@/components';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LottoHistoryPage() {
  const [from, setFrom] = useState<number>(1);
  const [to, setTo] = useState<number>(10);

  const enabled = useMemo(
    () =>
      Number.isInteger(from) && Number.isInteger(to) && from > 0 && to >= from,
    [from, to]
  );

  const { data, isError, error, refetch, isFetching } = useLottoDrawsQuery({
    from,
    to,
    enabled,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            로또 당첨 결과 히스토리
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            회차 범위를 입력해 조회하세요.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="from" className="w-16 text-sm">
            From
          </Label>
          <Input
            value={from}
            onChange={(e) => setFrom(Number(e.target.value))}
            className="w-full text-sm"
            min={1}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="to" className="w-16 text-sm">
            To
          </Label>
          <Input
            value={to}
            onChange={(e) => setTo(Number(e.target.value))}
            className="w-full text-sm"
            min={from}
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            onClick={() => refetch()}
            disabled={!enabled || isFetching}
            variant="secondary"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            조회
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {isError && (
          <p className="text-sm text-red-600">
            오류: {(error as Error).message}
          </p>
        )}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            데이터가 없습니다. 범위를 변경해 다시 시도해주세요.
          </p>
        )}
        {data && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left">회차</th>
                  <th className="px-3 py-2 text-left">추첨일</th>
                  <th className="px-3 py-2 text-left">당첨번호</th>
                  <th className="px-3 py-2 text-left">보너스</th>
                  <th className="px-3 py-2 text-left">1등(명)</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .slice()
                  .sort((a, b) => b.drawNumber - a.drawNumber)
                  .map((d) => (
                    <tr key={d.drawNumber} className="border-t">
                      <td className="px-3 py-3">{d.drawNumber}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {d.drawDate}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          {d.numbers.map((n, idx) => (
                            <LottoBallComponent
                              key={n}
                              number={n}
                              index={idx}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <LottoBallComponent
                          number={d.bonusNumber}
                          index={0}
                          isBonus
                        />
                      </td>
                      <td className="px-3 py-3">{d.firstWinCount ?? '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
