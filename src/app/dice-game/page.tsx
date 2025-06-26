'use client';

import { useCallback, useEffect, useState } from 'react';
import { DiceComponent } from './components/dice.component';
import { Button } from '@/components/ui/button';
import DiceInputComponent from './components/dice-input.component';
import { getRandomValue, getWinnerIndexes } from '@/utils';
import { useNameManager } from '@/hooks';
import { X } from 'lucide-react';

export default function DiceGamePage() {
  const { names, addName, removeName } = useNameManager();

  const [diceValues, setDiceValues] = useState<number[][]>([]);

  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number[] | null>(null);

  // 주사위 굴릴 때
  const handleRoll = useCallback(() => {
    setRolling(true);
    setResult(null);
    let rolls = 0;
    let lastValues: number[][] = diceValues; // 마지막 값을 저장할 변수
    const interval = setInterval(() => {
      const newValues = Array.from({ length: names.length }, () => [
        getRandomValue(),
        getRandomValue(),
      ]);
      setDiceValues(newValues);
      lastValues = newValues; // 마지막 값을 갱신
      rolls++;
      if (rolls > 15) {
        clearInterval(interval);
        setRolling(false);
        setResult(getWinnerIndexes(lastValues)); // 마지막 값으로 우승자 판정
      }
    }, 70);
  }, [names]);

  // 참가자 수 변경 시
  useEffect(() => {
    setDiceValues(Array.from({ length: names.length }, () => [1, 1]));
    setResult(null);
  }, [names]);

  return (
    <main className="max-w-md mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold mb-4">주사위 게임</h1>
      <DiceInputComponent addName={addName} />

      <div className="flex gap-4 justify-center my-6">
        {diceValues.map((values, i) => (
          <div key={i} className="flex flex-col items-center">
            <DiceComponent
              values={values as [number, number]}
              rolling={rolling}
            />
            <span className="mt-2 text-sm">{names[i]}</span>

            <Button
              onClick={() => {
                removeName(i);
              }}
              className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              aria-label="주사위 제거"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
      <Button onClick={handleRoll} disabled={rolling}>
        {rolling ? '굴리는 중...' : '굴리기'}
      </Button>
      {result && (
        <div className="mt-6 text-center font-semibold text-green-600">
          우승: {result.map((i) => names[i]).join(', ')}
        </div>
      )}
    </main>
  );
}
