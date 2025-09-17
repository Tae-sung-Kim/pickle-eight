import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { LottoLankType } from "@/types/lotto.type";

export type SimulatorResultsSummaryComponentType = Readonly<{
  total: number;
  ranks: Record<LottoLankType, number>;
}>;

export function SimulatorResultsSummaryComponent({
  total,
  ranks,
}: SimulatorResultsSummaryComponentType) {
  const items: Array<{ label: string; value: string }> = [
    { label: '1등', value: ranks[1].toLocaleString() },
    { label: '2등', value: ranks[2].toLocaleString() },
    { label: '3등', value: ranks[3].toLocaleString() },
    { label: '4등', value: ranks[4].toLocaleString() },
    { label: '5등', value: ranks[5].toLocaleString() },
    { label: '낙첨', value: ranks[0].toLocaleString() },
  ];
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">결과 요약</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          총 비교 수: {total.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.label}
              className="rounded-xl bg-muted/40 px-4 py-3 text-sm"
            >
              <div className="text-muted-foreground text-[12px] leading-none">
                {it.label}
              </div>
              <div className="mt-1 font-semibold leading-none tabular-nums text-base">
                {it.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
