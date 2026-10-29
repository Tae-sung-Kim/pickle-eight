'use client';
import { Card } from '@/components/ui/card';
import { LottoBallComponent } from '@/features/lotto/components/ball.component';
import type { LottoGeneratedListType } from '@/features/lotto/types/lotto.type';
import { withUniqueKeys } from '@/utils/common.util';

export function LottoAdvancedGeneratedListComponent({
  items,
}: LottoGeneratedListType) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {withUniqueKeys(items, (t) => t.numbers.join('-')).map(
        ({ key, item: t, position: idx }) => (
          <Card key={key} className="p-3">
            <div className="text-xs text-muted-foreground">조합 #{idx + 1}</div>
            <div className="mt-2 flex gap-1.5 flex-wrap">
              {t.numbers.map((n) => (
                <LottoBallComponent key={n} number={n} />
              ))}
            </div>
          </Card>
        )
      )}
    </div>
  );
}
