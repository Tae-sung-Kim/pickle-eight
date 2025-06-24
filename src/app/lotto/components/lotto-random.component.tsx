'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CounterComponent } from '@/components';
import { useCallback, useState } from 'react';
import LottoBallComponent from './lotto-ball.component';
import { FaSpinner } from 'react-icons/fa';
import { generateLottoNumbers } from '@/utils';
import { cn } from '@/lib/utils';

export function LottoRandomComponent() {
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
      <div className="rounded-lg bg-muted/50 p-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-1">
            <h2 className="text-lg font-medium">로또 번호 생성</h2>
            <p className="text-sm text-muted-foreground">
              생성할 로또 개수를 선택해주세요 (최대 10개)
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">구매 수량</span>
              <CounterComponent
                value={orderCount}
                min={1}
                max={10}
                onChange={handleOrderCountChange}
                className="w-32"
                showLabel={false}
                showSlider={false}
              />
            </div>
            <Button
              onClick={handleRandomLottoNumber}
              disabled={isGenerating}
              className={cn(
                'min-w-[140px] h-12 text-base font-semibold',
                'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600',
                'text-white shadow-lg hover:shadow-xl',
                'transition-all duration-300 transform hover:scale-105',
                'relative overflow-hidden group',
                isGenerating && 'opacity-80 cursor-not-allowed',
                'active:scale-95' // 버튼 누를 때 약간 작아지는 효과
              )}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isGenerating ? (
                  <>
                    <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                    <span>생성 중...</span>
                  </>
                ) : (
                  <>
                    <span className="mr-1">🎯</span>
                    <span>행운의 번호 받기</span>
                  </>
                )}
              </span>
              {/* 호버 시 움직이는 빛 효과 */}
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 group-hover:animate-pulse transition-opacity duration-300"></span>
            </Button>
          </div>
        </div>
      </div>

      {lottoNumberList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">생성된 로또 번호</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lottoNumberList.map((numbers, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">
                      {index + 1}번
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <LottoBallComponent numbers={numbers} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LottoRandomComponent;
