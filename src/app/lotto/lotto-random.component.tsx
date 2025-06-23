'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CounterComponent } from '@/components';
import { useCallback, useState } from 'react';

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

    const generateLottoNumbers = (): number[] => {
      const numbers = new Set<number>();
      while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
      }
      return Array.from(numbers).sort((a, b) => a - b);
    };

    Array.from({ length: orderCount }, () => {
      lottoNumberList.push(generateLottoNumbers());
    });

    setLottoNumberList(lottoNumberList);
    setIsGenerating(false);
  }, [orderCount]);

  // 로또 번호에 따른 색상 클래스 반환
  const getNumberColor = (num: number): string => {
    if (num <= 10) return 'bg-red-100 text-red-800';
    if (num <= 20) return 'bg-blue-100 text-blue-800';
    if (num <= 30) return 'bg-yellow-100 text-yellow-800';
    if (num <= 40) return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  };

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
            <CounterComponent
              value={orderCount}
              min={1}
              max={10}
              onChange={handleOrderCountChange}
              label="구매 수량"
              className="w-32"
            />
            <Button
              onClick={handleRandomLottoNumber}
              disabled={isGenerating}
              className="min-w-[120px]"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  생성 중...
                </>
              ) : (
                '행운의 번호 받기'
              )}
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
                      {numbers.map((num, i) => (
                        <span
                          key={`${index}-${i}`}
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${getNumberColor(
                            num
                          )} font-bold`}
                        >
                          {num}
                        </span>
                      ))}
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
