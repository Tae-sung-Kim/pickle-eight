import { ReactElement } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LottoBallComponent } from '@/components';
import { LottoDrawStatsComponent } from './stats.component';

export type LottoDrawCardType = {
  readonly drawNumber: number;
  readonly drawDate: string;
  readonly numbers: readonly number[];
  readonly bonusNumber?: number;
  readonly firstWinCount?: number;
  readonly firstPrizeAmount?: number;
  readonly totalSalesAmount?: number;
};

export function LottoDrawCardComponent({
  drawNumber,
  drawDate,
  numbers,
  bonusNumber,
  firstWinCount,
  firstPrizeAmount,
  totalSalesAmount,
}: LottoDrawCardType): ReactElement {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-3xl font-extrabold tracking-tight">
          {drawNumber}회차 상세
        </CardTitle>
        <p className="text-sm text-muted-foreground">추첨일: {drawDate}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 flex-wrap">
          {numbers.map((n) => (
            <LottoBallComponent key={n} number={n} index={n} isBonus={false} />
          ))}
          <span className="text-xl text-muted-foreground">+</span>
          <LottoBallComponent
            key={bonusNumber}
            number={bonusNumber ?? 0}
            index={bonusNumber ?? 0}
            isBonus
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <LottoDrawStatsComponent
            data={firstWinCount ?? 0}
            title="1등 당첨자 수"
            unitName="명"
          />
          <LottoDrawStatsComponent
            data={firstPrizeAmount ?? 0}
            title="1등 당첨금"
            unitName="원"
          />
          <LottoDrawStatsComponent
            data={totalSalesAmount ?? 0}
            title="총 판매금액"
            unitName="원"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default LottoDrawCardComponent;
