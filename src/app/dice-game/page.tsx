// src/app/dice-game/page.tsx
'use client';

import { useState } from 'react';
import { useNameManager } from '@/hooks';
import { getRandomValue, getWinnerIndexes } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DiceInputComponent from './components/dice-input.component';
import DicePlayerListComponent from './components/dice-player-list.component';
import DiceRollButtonComponent from './components/dice-roll-button';

export default function DiceGamePage() {
  const { names, addName, removeName, reset } = useNameManager();
  const [diceValues, setDiceValues] = useState<number[][]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);

  const rollDice = () => {
    if (names.length < 2) return;

    setIsRolling(true);
    setWinnerIndex(null);

    const newDiceValues = names.map(() => [getRandomValue(), getRandomValue()]);

    setTimeout(() => {
      setDiceValues(newDiceValues);

      setTimeout(() => {
        const winners = getWinnerIndexes(newDiceValues);
        setWinnerIndex(winners[0]);
        setIsRolling(false);
      }, 1000);
    }, 500);
  };

  const handleRemoveDice = (index: number) => {
    setDiceValues((prev) => {
      const newValues = [...prev];
      newValues.splice(index, 1);
      return newValues;
    });
    removeName(index);
    setWinnerIndex(null);
  };

  const resetGame = () => {
    reset();
    setDiceValues([]);
    setWinnerIndex(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            🎲 주사위 게임
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center mb-6">
            참가자들을 추가하고 주사위를 굴려 승자를 가려보세요!
          </p>

          <div className="mb-8">
            <DiceInputComponent addName={addName} />
          </div>

          <DicePlayerListComponent
            names={names}
            diceValues={diceValues}
            isRolling={isRolling}
            winnerIndex={winnerIndex}
            onRemove={handleRemoveDice}
          />

          {names.length > 0 && (
            <DiceRollButtonComponent
              onClick={rollDice}
              disabled={isRolling || names.length < 2}
              isRolling={isRolling}
              showReset={winnerIndex !== null}
              onReset={resetGame}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
