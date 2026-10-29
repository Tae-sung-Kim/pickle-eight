import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LottoBallComponent } from '@/features/lotto/components/ball.component';
import { withUniqueKeys } from '@/utils/common.util';

export type SimulatorTicketsComponentType = Readonly<{
  tickets: ReadonlyArray<{
    numbers: readonly [number, number, number, number, number, number];
  }>;
  displayTickets: ReadonlyArray<{
    numbers: readonly [number, number, number, number, number, number];
  }>;
  showAll: boolean;
  onShowAll: () => void;
  onCollapse: () => void;
}>;

export function SimulatorTicketsComponent({
  tickets,
  displayTickets,
  showAll,
  onShowAll,
  onCollapse,
}: SimulatorTicketsComponentType) {
  const previewCount = Math.min(6, tickets.length);
  if (tickets.length === 0) return null;
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          샘플 티켓{' '}
          <span className="ml-1">
            (표시 {displayTickets.length} / 총 {tickets.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!showAll && tickets.length > previewCount && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="px-0 h-auto"
              onClick={onShowAll}
            >
              모두 보기
            </Button>
          )}
          {showAll && tickets.length > previewCount && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="px-0 h-auto"
              onClick={onCollapse}
            >
              간략히
            </Button>
          )}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {withUniqueKeys(displayTickets, (t) => t.numbers.join('-')).map(
          ({ key, item: t, position: idx }) => (
            <Card key={key} className="">
              <CardHeader className="py-3">
                <CardTitle className="text-xs text-muted-foreground">
                  티켓 #{idx + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-1 flex flex-wrap gap-1">
                  {t.numbers.map((n) => (
                    <LottoBallComponent key={n} number={n} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
