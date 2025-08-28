'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CreditGateButtonComponent } from '@/components/shared/gates';
import { useCreditCostLabel } from '@/hooks';
import { CreditBalancePillComponent } from '@/components';

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
  const label = useCreditCostLabel({
    spendKey: 'simulator',
    baseLabel: '시뮬레이션',
    isBusy: running,
    busyLabel: '시뮬레이션 중…',
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
              type="number"
              min={1}
              max={100}
              value={ticketCount}
              onChange={(e) =>
                onTicketCountChange(clampInt(e.target.value, 1, 100))
              }
              onBlur={(e) =>
                onTicketCountChange(clampInt(e.target.value, 1, 100))
              }
              className="w-full"
              disabled={mode === 'custom'}
            />
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="draw-count" className="w-24 text-sm md:w-28">
              회수
            </Label>
            <Input
              id="draw-count"
              type="number"
              min={1}
              max={20000}
              value={drawCount}
              onChange={(e) =>
                onDrawCountChange(clampInt(e.target.value, 1, 20000))
              }
              onBlur={(e) =>
                onDrawCountChange(clampInt(e.target.value, 1, 20000))
              }
              className="w-full"
            />
          </div>

          <div className="flex items-end md:justify-end justify-between gap-3 md:col-span-3">
            {canRun ? (
              <CreditGateButtonComponent
                className="w-full md:w-auto"
                label={label}
                spendKey="simulator"
                onProceed={onRun}
              />
            ) : (
              <Button
                type="button"
                className="w-full md:w-auto"
                disabled
                aria-disabled
              >
                {label}
              </Button>
            )}
            <CreditBalancePillComponent />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SimulatorControlsComponent;
