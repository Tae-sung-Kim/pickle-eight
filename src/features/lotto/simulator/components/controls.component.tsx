'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LottoSimulatorControlsComponentType } from '@/features/lotto/types/lotto.type';
import { clampInt } from '@/features/lotto/utils/lotto.util';

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
}: LottoSimulatorControlsComponentType) {
  const [ticketText, setTicketText] = useState<string>(
    String(ticketCount ?? '')
  );
  const [drawText, setDrawText] = useState<string>(String(drawCount ?? ''));
  useEffect(() => setTicketText(String(ticketCount ?? '')), [ticketCount]);
  useEffect(() => setDrawText(String(drawCount ?? '')), [drawCount]);

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
            <Button
              type="button"
              className="w-full md:w-auto md:ml-auto"
              disabled={!canRun}
              onClick={onRun}
            >
              {running ? '시뮬레이션 중…' : '시뮬레이션'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
