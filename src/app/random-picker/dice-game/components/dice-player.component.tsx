'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DiceComponent } from './dice.component';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { DicePlayerComponentPropsType } from '@/types/dice-game.type';

export const DicePlayerComponent = ({
  name,
  diceValues,
  isRolling,
  isWinner,
  onRemove,
  index,
}: DicePlayerComponentPropsType) => (
  <motion.div
    className={cn(
      'group relative flex items-center justify-between p-4 rounded-xl',
      'bg-white/90 backdrop-blur-sm border border-gray-100',
      'shadow-sm hover:shadow-md transition-all duration-200',
      isWinner
        ? 'ring-2 ring-yellow-400 ring-offset-2 bg-gradient-to-r from-yellow-50 to-amber-50'
        : 'hover:border-gray-200'
    )}
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    {isWinner && (
      <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
        승리!
      </div>
    )}

    <div className="flex items-center space-x-4">
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full',
          'bg-gradient-to-br from-indigo-100 to-blue-100',
          'text-indigo-700 font-bold text-lg',
          'border-2 border-white shadow-sm',
          isWinner && 'from-yellow-100 to-amber-100 text-amber-700'
        )}
      >
        {index + 1}
      </div>

      <div className="flex flex-col">
        <span
          className={cn(
            'font-semibold text-gray-800',
            isWinner && 'text-yellow-900'
          )}
        >
          {name}
        </span>
        {diceValues && (
          <div className="mt-1">
            <DiceComponent
              values={diceValues}
              rolling={isRolling}
              winner={isWinner}
              isDouble={diceValues[0] === diceValues[1]}
            />
          </div>
        )}
      </div>
    </div>

    <Button
      variant="ghost"
      size="icon"
      onClick={onRemove}
      className="opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
    </Button>
  </motion.div>
);

export default DicePlayerComponent;
