'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCapture, useNameManager } from '@/hooks';
import { getRandomValue, getWinnerIndexes } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import DiceInputListComponent from './input-list.component';
import DicePlayerListComponent from './player-list.component';
import DiceRollButtonComponent from './roll-button.component';
import { TitleWrapperComponent } from '@/components';
import { MENU_GROUP_NAME_ENUM } from '@/constants';

export function DiceGameComponent() {
  const { names, addName, removeName, reset } = useNameManager();
  const [diceValues, setDiceValues] = useState<number[][]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [winnerIndexes, setWinnerIndexes] = useState<number[]>([]);

  const { onCapture } = useCapture();
  const resultRef = useRef<HTMLDivElement>(null);

  // 주사위 굴리기
  const rollDice = () => {
    if (names.length < 2) return;

    setIsRolling(true);
    setWinnerIndexes([]);

    const newDiceValues = names.map(() => [getRandomValue(), getRandomValue()]);

    setTimeout(() => {
      setDiceValues(newDiceValues);

      setTimeout(() => {
        const winners = getWinnerIndexes(newDiceValues);
        setWinnerIndexes(winners);
        setIsRolling(false);
      }, 1000);
    }, 500);
  };

  // 결과 갭쳐
  const handleCapture = () => {
    onCapture(resultRef as React.RefObject<HTMLElement>, {
      fileName: 'result.png',
      shareTitle: '축하합니다! 🎉',
    });
  };

  const handleRemoveDice = (index: number) => {
    setDiceValues((prev) => {
      const newValues = [...prev];
      newValues.splice(index, 1);
      return newValues;
    });
    removeName(index);
    setWinnerIndexes([]);
  };

  const resetGame = () => {
    reset();
    setDiceValues([]);
    setWinnerIndexes([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto max-w-4xl"
    >
      <TitleWrapperComponent
        type={MENU_GROUP_NAME_ENUM.RANDOM_PICKER}
        title="주사위 굴리기"
        description="참가자들을 추가하고 주사위를 굴려 승자를 가려보세요!"
      />

      <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
        {/* <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  참가자 목록
                </CardTitle>
                <p className="text-indigo-100">
                  {names.length}명이 참여 중입니다.
                </p>
              </div>
              {names.length > 0 && (
                <button
                  onClick={resetGame}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4 inline-block mr-1" />
                  초기화
                </button>
              )}
            </div>
          </CardHeader> */}
        <CardContent className="p-6">
          <div className="mb-8">
            <DiceInputListComponent addName={addName} />
          </div>

          <div ref={resultRef}>
            <DicePlayerListComponent
              names={names}
              diceValues={diceValues}
              isRolling={isRolling}
              winnerIndexes={winnerIndexes}
              onRemove={handleRemoveDice}
            />

            <AnimatePresence>
              {winnerIndexes.length > 0 && names[winnerIndexes[0]] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg"
                >
                  <div className="flex items-center justify-center gap-2 text-success">
                    <Trophy className="w-5 h-5 text-success" />
                    <span className="font-bold">🎉 축하합니다! </span>
                    <span className="font-extrabold text-success">
                      {winnerIndexes.map((idx) => names[idx]).join(', ')}{' '}
                    </span>
                    님{winnerIndexes.length > 1 ? '들' : ''}이
                    {winnerIndexes.length > 1 ? ' 공동 ' : ' '}승리하셨습니다!
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {names.length > 0 && (
            <div className="mt-8 flex justify-center">
              <DiceRollButtonComponent
                onClick={rollDice}
                disabled={isRolling || names.length < 2}
                isRolling={isRolling}
                showReset={winnerIndexes.length > 0}
                onReset={resetGame}
                onShare={handleCapture}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default DiceGameComponent;
