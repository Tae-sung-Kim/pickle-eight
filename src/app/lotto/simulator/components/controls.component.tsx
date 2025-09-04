'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  CreditGateButtonComponent,
  CreditBalancePillComponent,
} from '@/components';
import { useAdCredit } from '@/hooks';
import { useEffect, useState } from 'react';

export type SimulatorControlsComponentType = Readonly<{
  ticketCount: number;
  drawCount: number;
  running: boolean;
  mode: 'random' | 'custom';
  onModeChange: (m: 'random' | 'custom') => void;
  onTicketCountChange: (value: number) => void;
  onDrawCountChange: (value: number) => void;
  onRun: () => void;
  canRun?: boolean;
}>;

function clampInt(value: string, min: number, max: number): number {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return min;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function parseClamp(
  value: string,
  min: number,
  max: number
): number | undefined {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, n));
}

export function SimulatorControlsComponent({
  ticketCount,
  drawCount,
  running,
  mode,
  onModeChange,
  onTicketCountChange,
  onDrawCountChange,
  onRun,
  canRun = true,
}: SimulatorControlsComponentType) {
  const [ticketText, setTicketText] = useState<string>(
    String(ticketCount ?? '')
  );
  const [drawText, setDrawText] = useState<string>(String(drawCount ?? ''));
  useEffect(() => setTicketText(String(ticketCount ?? '')), [ticketCount]);
  useEffect(() => setDrawText(String(drawCount ?? '')), [drawCount]);
  // 실시간 크레딧 계산을 위해 텍스트 입력을 우선 사용
  const ticketForCost = (parseClamp(ticketText, 1, 100) ?? ticketCount) - 1;
  const drawForCost = parseClamp(drawText, 1, 20000) ?? drawCount;
  // Dynamic simulator cost rules (updated)
  // - random: base 2 + floor(ticketCount/10)
  // - custom: base 3 + floor(ticketCount/2)
  // + floor((drawCount - 1) / 500)  // 1~500:+0, 501~1000:+1, ...
  const amountOverride =
    (mode === 'random'
      ? 2 + Math.floor(Math.max(0, ticketForCost) / 10)
      : 3 + Math.floor(Math.max(0, ticketForCost) / 2)) +
    Math.floor((Math.max(1, drawForCost) - 1) / 500);

  const { buildCostLabel } = useAdCredit();

  const label = buildCostLabel({
    spendKey: 'simulator',
    baseLabel: '시뮬레이션',
    isBusy: running,
    busyLabel: '시뮬레이션 중…',
    amountOverride,
  });

  return (
    <Card className="mt-4 py-4">
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
          <div className="flex items-center gap-3">
            <Label htmlFor="mode" className="w-24 text-sm md:w-20">
              모드
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === 'random' ? 'default' : 'outline'}
                onClick={() => onModeChange('random')}
                className="h-9 px-3"
              >
                랜덤
              </Button>
              <Button
                type="button"
                variant={mode === 'custom' ? 'default' : 'outline'}
                onClick={() => onModeChange('custom')}
                className="h-9 px-3"
              >
                사용자 지정
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="ticket-count" className="w-24 text-sm md:w-20">
              티켓 수
            </Label>
            <Input
              id="ticket-count"
              type="text"
              inputMode="numeric"
              min={1}
              max={100}
              value={ticketText}
              onChange={(e) => setTicketText(e.target.value)}
              onBlur={(e) =>
                onTicketCountChange(clampInt(e.target.value, 1, 100))
              }
              className="w-full"
              disabled={mode === 'custom'}
            />
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="draw-count" className="w-24 text-sm md:w-28">
              횟수
            </Label>
            <Input
              id="draw-count"
              type="text"
              inputMode="numeric"
              min={1}
              max={20000}
              value={drawText}
              onChange={(e) => setDrawText(e.target.value)}
              onBlur={(e) =>
                onDrawCountChange(clampInt(e.target.value, 1, 20000))
              }
              className="w-full"
            />
          </div>

          <div className="flex flex-col-reverse md:flex-row items-stretch md:items-end gap-2 md:gap-3 md:col-span-3">
            {canRun ? (
              <CreditGateButtonComponent
                className="w-full md:w-auto md:ml-auto"
                label={label}
                spendKey="simulator"
                onProceed={onRun}
                amountOverride={amountOverride}
              />
            ) : (
              <Button
                type="button"
                className="w-full md:w-auto md:ml-auto"
                disabled
                aria-disabled
              >
                {label}
              </Button>
            )}
            <CreditBalancePillComponent className="self-end md:self-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SimulatorControlsComponent;
