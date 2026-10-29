'use client';
import { Share2 } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { LottoBallComponent } from '@/features/lotto/components/ball.component';
import { LottoSaveNumbersButtonComponent } from '@/features/lotto/components/save-numbers-button.component';
import type { LottoNumberListPropsType } from '@/features/lotto/types/lotto.type';
import { useCapture } from '@/hooks/use-capture.hook';
import { withUniqueKeys } from '@/utils/common.util';

export function LottoNumberListComponent({
  numbersList,
  title = '생성된 번호',
}: LottoNumberListPropsType) {
  const { onCapture } = useCapture();
  const resultRef = useRef<HTMLDivElement>(null);

  const handleShare = () => {
    onCapture(resultRef as React.RefObject<HTMLElement>, {
      fileName: 'result.png',
      shareTitle: '로또 번호 추첨 결과',
    });
  };

  if (numbersList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        아직 생성된 번호가 없습니다.
      </p>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="flex items-center gap-1">
          <LottoSaveNumbersButtonComponent numbersList={numbersList} />
          <Button type="button" variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            공유하기
          </Button>
        </div>
      </div>
      <div ref={resultRef}>
        {withUniqueKeys(numbersList, (n) => n.join('-')).map(
          ({ key, item: numbers, position: index }) => (
            <div
              key={key}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border py-4"
            >
              <span className="w-14 text-sm tabular-nums text-muted-foreground">
                {index + 1}게임
              </span>
              <div className="flex flex-wrap gap-2">
                {numbers.map((num) => (
                  <LottoBallComponent key={num} number={num} />
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
