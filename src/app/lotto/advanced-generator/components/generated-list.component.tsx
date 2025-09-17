'use client';
import { LottoBallComponent } from '@/components/shared/lotto/ball.component';
import { Card } from '@/components/ui/card';
import { LottoGeneratedListType } from '@/types/lotto.type';

export function LottoAdvancedGeneratedListComponent({
  items,
}: LottoGeneratedListType) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((t, idx) => (
        <Card key={idx} className="p-3">
          <div className="text-xs text-muted-foreground">조합 #{idx + 1}</div>
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {t.numbers.map((n, i) => (
              <LottoBallComponent
                key={`${idx}-${n}-${i}`}
                number={n}
                index={i}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
