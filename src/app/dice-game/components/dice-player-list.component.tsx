'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DicePlayerComponent } from './dice-player.component';
import { DicePlayerListComponentPropsType } from '@/types';

export const DicePlayerListComponent = ({
  names,
  diceValues,
  isRolling,
  winnerIndexes,
  onRemove,
}: DicePlayerListComponentPropsType) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {names.length > 0 ? (
        <motion.div
          className="relative"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 25,
              },
            }}
          >
            {names.map((name, index) => (
              <DicePlayerComponent
                key={`${name}-${index}`}
                name={name}
                diceValues={diceValues[index] as [number, number] | undefined}
                isRolling={isRolling}
                isWinner={winnerIndexes.includes(index)}
                onRemove={() => onRemove(index)}
                index={index}
              />
            ))}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-12 text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-lg">참가자를 추가해주세요</p>
          <p className="text-sm mt-1">
            위의 입력창에 이름을 입력하고 추가해보세요
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DicePlayerListComponent;
