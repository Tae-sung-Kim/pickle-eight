import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LottoLankType } from "@/types/lotto.type";

export type SimulatorProbabilitiesComponentType = Readonly<{
  total: number;
  ranks: Record<LottoLankType, number>;
}>;

export function SimulatorProbabilitiesComponent({
  total,
  ranks,
}: SimulatorProbabilitiesComponentType) {
  const denom = total > 0 ? total : 1;
  const items: Array<{ label: string; value: string }> = [
    {
      label: '1등',
      value: (ranks[1] / denom).toLocaleString(undefined, {
        style: 'percent',
        minimumFractionDigits: 6,
      }),
    },
    {
      label: '2등',
      value: (ranks[2] / denom).toLocaleString(undefined, {
        style: 'percent',
        minimumFractionDigits: 6,
      }),
    },
    {
      label: '3등',
      value: (ranks[3] / denom).toLocaleString(undefined, {
        style: 'percent',
        minimumFractionDigits: 6,
      }),
    },
    {
      label: '4등',
      value: (ranks[4] / denom).toLocaleString(undefined, {
        style: 'percent',
        minimumFractionDigits: 6,
      }),
    },
    {
      label: '5등',
      value: (ranks[5] / denom).toLocaleString(undefined, {
        style: 'percent',
        minimumFractionDigits: 6,
      }),
    },
    {
      label: '낙첨',
      value: (ranks[0] / denom).toLocaleString(undefined, {
        style: 'percent',
        minimumFractionDigits: 4,
      }),
    },
  ];
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">추정 확률</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.label} className="rounded-xl bg-muted/40 px-4 py-3">
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
