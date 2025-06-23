'use client';
import { Button } from '@/components/ui/button';
import { Counter } from '@/components/counter';
import { useCallback, useState } from 'react';

export default function LottoRandomComponent() {
  const [orderCount, setOrderCount] = useState(1);
  const [lottoNumberList, setLottoNumberList] = useState<number[][]>([]);

  // 구매 수량 결정
  const handleOrderCountChange = (newValue: number) => {
    setOrderCount(newValue);
  };

  // 구매 수량에 맞게 랜덤번호 생성
  const handleRandomLottoNumber = useCallback(() => {
    const lottoNumberList: number[][] = [];

    // 중복되지 않는 6개의 숫자 생성
    const generateLottoNumbers = (): number[] => {
      const numbers = new Set<number>();
      while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
      }
      return Array.from(numbers).sort((a, b) => a - b);
    };

    Array.from({ length: orderCount }, () => {
      const unique6 = generateLottoNumbers();

      lottoNumberList.push(unique6);
    });

    setLottoNumberList(lottoNumberList);
  }, [orderCount]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <Counter
          value={orderCount}
          min={1}
          max={99}
          onChange={handleOrderCountChange}
          label="구매 수량"
        />
        <Button onClick={handleRandomLottoNumber}>
          {orderCount}개 번호 생성
        </Button>
      </div>

      <ul className="list-disc">
        {lottoNumberList.map((d) => (
          <li className="m-10" key={d.toString()}>
            {d.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}
