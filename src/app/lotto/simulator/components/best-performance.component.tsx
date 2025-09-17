import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LottoLankType } from "@/types/lotto.type";
import type { ReactElement } from 'react';

export type BestPerformance = Readonly<{
  rank: LottoLankType;
  matches: number;
  bonus: boolean;
}>;

export function SimulatorBestPerformanceComponent({
  best,
}: {
  best: BestPerformance | null;
}): ReactElement | null {
  if (!best) return null;
  return (
    <Card className="shadow-none">
      <CardHeader className="py-3">
        <CardTitle className="text-base">최고 성과</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-muted/40 px-3 py-2">
            <div className="text-muted-foreground text-[11px] leading-none">
              등수
            </div>
            <div className="mt-1 font-medium leading-none">{best.rank}등</div>
          </div>
          <div className="rounded-lg bg-muted/40 px-3 py-2">
            <div className="text-muted-foreground text-[11px] leading-none">
              일치
            </div>
            <div className="mt-1 font-medium leading-none">
              {best.matches}개
            </div>
          </div>
          <div className="rounded-lg bg-muted/40 px-3 py-2">
            <div className="text-muted-foreground text-[11px] leading-none">
              보너스
            </div>
            <div className="mt-1 font-medium leading-none">
              {best.bonus ? '일치' : '불일치'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
