'use client';

import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LottoCheckTicketRowComponent } from '@/app/lotto/check/components/ticket-row.component';

export type SimulatorCustomTicketsComponentType = Readonly<{
  tickets: ReadonlyArray<{
    numbers: readonly [string, string, string, string, string, string];
  }>;
  onChange: (
    v: ReadonlyArray<{
      numbers: readonly [string, string, string, string, string, string];
    }>
  ) => void;
}>;

const MAX_CUSTOM_TICKETS = 50 as const;

export function SimulatorCustomTicketsComponent({
  tickets,
  onChange,
}: SimulatorCustomTicketsComponentType) {
  const addTicket = useCallback((): void => {
    if (tickets.length >= MAX_CUSTOM_TICKETS) return;
    const next = [...tickets, { numbers: ['', '', '', '', '', ''] as const }];
    onChange(next);
  }, [tickets, onChange]);

  const removeTicket = useCallback(
    (idx: number): void => {
      const next = tickets.filter((_, i) => i !== idx);
      onChange(next);
    },
    [tickets, onChange]
  );

  const updateNumber = useCallback(
    (idx: number, pos: number, value: string): void => {
      const digits = value.replace(/\D+/g, '').slice(0, 2);
      const current = [...tickets[idx].numbers];
      current[pos] = digits;
      const next = tickets.map((t, i) =>
        i === idx
          ? {
              numbers: current as [
                string,
                string,
                string,
                string,
                string,
                string
              ],
            }
          : t
      );
      onChange(next);
    },
    [tickets, onChange]
  );

  const onBlurUnique = useCallback(
    (idx: number, pos: number): void => {
      const row = tickets[idx].numbers;
      const v = row[pos];
      if (!v) return;
      const hasDup = row.some((x, i) => i !== pos && x === v);
      if (!hasDup) return;
      const nextRow = [...row];
      nextRow[pos] = '';
      const next = tickets.map((t, i) =>
        i === idx
          ? {
              numbers: nextRow as [
                string,
                string,
                string,
                string,
                string,
                string
              ],
            }
          : t
      );
      onChange(next);
    },
    [tickets, onChange]
  );

  return (
    <Card className="mt-4">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">사용자 지정 티켓</CardTitle>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={addTicket}>
            티켓 추가
          </Button>
          <span className="text-xs text-muted-foreground">
            최대 {MAX_CUSTOM_TICKETS}장
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {tickets.length === 0 && (
            <p className="text-xs text-muted-foreground">
              아직 티켓이 없습니다. &quot;티켓 추가&quot;를 눌러 생성하세요.
            </p>
          )}
          {tickets.map((t, idx) => (
            <LottoCheckTicketRowComponent
              key={idx}
              index={idx}
              renderInput={(name) => {
                type NameKey = 'n1' | 'n2' | 'n3' | 'n4' | 'n5' | 'n6';
                const map: Record<NameKey, number> = {
                  n1: 0,
                  n2: 1,
                  n3: 2,
                  n4: 3,
                  n5: 4,
                  n6: 5,
                } as const;
                const pos = map[name as NameKey];
                return (
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    placeholder="--"
                    className="w-14 text-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-16"
                    value={t.numbers[pos]}
                    onInput={(e) => {
                      const target = e.currentTarget;
                      target.value = target.value
                        .replace(/\D+/g, '')
                        .slice(0, 2);
                    }}
                    onChange={(e) => updateNumber(idx, pos, e.target.value)}
                    onBlur={() => onBlurUnique(idx, pos)}
                  />
                );
              }}
              canRemove={tickets.length > 1}
              onRemove={() => removeTicket(idx)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default SimulatorCustomTicketsComponent;
