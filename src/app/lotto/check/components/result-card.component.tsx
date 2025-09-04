import type { LottoCheckResultCardType, LottoLankType } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LottoCheckRankBadgeComponent } from './rank-badge.component';
import { LottoBallComponent } from '@/components';

export function LottoCheckResultCardComponent({
  draw,
  matchesList,
  tickets,
}: LottoCheckResultCardType) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">회차 {draw.drawNumber} 회</CardTitle>
          <CardDescription>추첨일 · {draw.drawDate}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-1 flex items-center gap-2">
          {Array.isArray(draw.numbers) &&
            draw.numbers.length > 0 &&
            draw.numbers.map((n, idx) => (
              <LottoBallComponent key={n} number={n} index={idx} />
            ))}
          <span className="mx-2 text-sm">+</span>
          {(() => {
            const bonusIndex = Array.isArray(draw.numbers)
              ? draw.numbers.length
              : 6;
            return (
              <LottoBallComponent
                number={draw.bonusNumber}
                index={bonusIndex}
                isBonus
              />
            );
          })()}
        </div>

        {matchesList && tickets && (
          <div className="mt-4 space-y-3 text-sm">
            {matchesList.map((m, i) => {
              const nums = tickets[i] ?? [];
              const winSet = new Set(draw.numbers);
              const bonus = draw.bonusNumber;
              return (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{i + 1}</span>
                    <span>
                      일치 {m.matchCount}개 / 보너스{' '}
                      {m.bonusMatch ? '예' : '아니오'}
                    </span>
                    <LottoCheckRankBadgeComponent
                      rank={m.rank as LottoLankType}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {nums.map((n, idx) => {
                      const isWin = winSet.has(n);
                      const isBonus = n === bonus;
                      const base =
                        'inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm';
                      const cls = isWin
                        ? 'bg-success text-success-foreground border-success/30'
                        : isBonus
                        ? 'bg-warning text-warning-foreground border-warning/30'
                        : 'bg-surface-card text-foreground border-border';
                      return (
                        <span key={idx} className={`${base} ${cls}`}>
                          {n}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
