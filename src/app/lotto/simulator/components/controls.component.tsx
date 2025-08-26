import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export type SimulatorControlsComponentType = Readonly<{
  ticketCount: number;
  drawCount: number;
  running: boolean;
  onTicketCountChange: (value: number) => void;
  onDrawCountChange: (value: number) => void;
  onRun: () => void;
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
  onTicketCountChange,
  onDrawCountChange,
  onRun,
}: SimulatorControlsComponentType) {
  const isInvalid =
    ticketCount < 1 || ticketCount > 100 || drawCount < 1 || drawCount > 20000;
  return (
    <Card className="mt-4 py-4">
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
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
            />
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="draw-count" className="w-24 text-sm md:w-28">
              시뮬레이션 회수
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
          <div className="flex md:justify-end">
            <Button
              type="button"
              disabled={running || isInvalid}
              onClick={onRun}
              className="w-full md:w-auto"
            >
              {running ? '실행 중...' : '시뮬레이션 실행'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
