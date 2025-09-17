'use client';

import { TitleWrapperComponent } from "@/components/title-warpper.component";
import { MENU_GROUP_NAME_ENUM } from "@/constants/menu.constant";
import { useCapture } from "@/hooks/use-capture.hook";
import { useNameManager } from "@/hooks/use-name-manager.hook";
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { NameRandomInputCardComponent } from './input-card.component';
import { NameRandomWinnerViewComponent } from './winner-view.component';

export function NameRandomComponent() {
  const { names, addName, removeName, reset } = useNameManager();
  const [winner, setWinner] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [isPicking, setIsPicking] = useState<boolean>(false);

  const { onCapture } = useCapture();

  const handleAddName = () => {
    if (addName(inputValue)) {
      setInputValue('');
    }
  };

  const handlePickRandom = async () => {
    if (names.length === 0) return;
    setIsPicking(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const randomIndex = Math.floor(Math.random() * names.length);
    const picked = names[randomIndex];
    setWinner(picked);
    setIsPicking(false);
  };

  const handleReset = () => {
    reset();
    setWinner('');
    setInputValue('');
  };

  const onShare = useCallback(
    (target: React.RefObject<HTMLElement>) => {
      onCapture(target, {
        fileName: 'winner.png',
        shareTitle: '축하합니다! 🎉',
        shareText: `축하합니다! ${winner}님이 당첨되었습니다!`,
      });
    },
    [onCapture, winner]
  );

  if (winner) {
    return (
      <NameRandomWinnerViewComponent
        names={names}
        winner={winner}
        onReset={handleReset}
        onShare={onShare}
      />
    );
  }

  return (
    <div className="container mx-auto h-fit p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto space-y-8 py-12"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2 text-center"
        >
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.RANDOM_PICKER}
            title="항목 랜덤 추첨기"
            description="추첨할 항목을 추가하고 행운의 당첨자를 뽑아보세요"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <NameRandomInputCardComponent
            names={names}
            inputValue={inputValue}
            isPicking={isPicking}
            onChangeInput={setInputValue}
            onAdd={handleAddName}
            onRemove={removeName}
            onReset={handleReset}
            onPick={handlePickRandom}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default NameRandomComponent;
