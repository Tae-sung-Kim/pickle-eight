import { LottoBallComponent } from '@/components/shared/lotto/ball.component';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CREDIT_POLICY } from '@/constants/ad-credit.constant';
import { useCreditStore } from '@/stores/credit.store';

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
  const { todayEarned } = useCreditStore();
  const previewCount = Math.min(6, tickets.length);
  const remainingCharges = Math.max(
    0,
    Math.floor(
      (CREDIT_POLICY.dailyCap - todayEarned) / CREDIT_POLICY.rewardAmount
    )
  );
  if (tickets.length === 0) return <></>;
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          샘플 티켓{' '}
          <span className="ml-1">
            (표시 {displayTickets.length} / 총 {tickets.length})
          </span>
          {/* 모바일 전용: 남은 충전 횟수 노출 */}
          <span className="ml-2 inline-block rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:hidden">
            남은 충전 {remainingCharges}회
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
        {displayTickets.map((t, idx) => (
          <Card key={idx} className="">
            <CardHeader className="py-3">
              <CardTitle className="text-xs text-muted-foreground">
                티켓 #{idx + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-1 flex flex-wrap gap-1">
                {t.numbers.map((n, i) => (
                  <LottoBallComponent
                    key={`${idx}-${i}-${n}`}
                    number={n}
                    index={i}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
