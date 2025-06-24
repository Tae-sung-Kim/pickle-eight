'use client';
import { useCallback, useState } from 'react';
import {
  LottoGeneratorControlsComponent,
  LottoNumberListComponent,
} from './components';
import { generateLottoNumbers } from '@/utils';

export default function LottoPage() {
  const [orderCount, setOrderCount] = useState(1);
  const [lottoNumberList, setLottoNumberList] = useState<number[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOrderCountChange = (newValue: number) => {
    setOrderCount(newValue);
  };

  const handleRandomLottoNumber = useCallback(async () => {
    setIsGenerating(true);

    // 시뮬레이션을 위한 약간의 지연
    await new Promise((resolve) => setTimeout(resolve, 300));

    const lottoNumberList: number[][] = [];

    Array.from({ length: orderCount }, () => {
      lottoNumberList.push(generateLottoNumbers());
    });

    setLottoNumberList(lottoNumberList);
    setIsGenerating(false);
  }, [orderCount]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight"> 로또 번호 생성기</h1>
        <p className="text-muted-foreground">
          AI가 추천하는 행운의 번호로 당첨의 기회를 잡아보세요!
        </p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-6">
          <div className="rounded-lg bg-muted/50 p-4">
            <LottoGeneratorControlsComponent
              orderCount={orderCount}
              isGenerating={isGenerating}
              onOrderCountChange={handleOrderCountChange}
              onGenerate={handleRandomLottoNumber}
            />
          </div>

          <LottoNumberListComponent
            numbersList={lottoNumberList}
            title="생성된 로또 번호"
          />
        </div>
      </div>
    </div>
  );
}
