'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib';
import { DiceComponent } from './dice-root.component';
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
      'bg-surface-card backdrop-blur-sm border border-border',
      'shadow-sm hover:shadow-md transition-all duration-200',
      isWinner
        ? 'ring-2 ring-success ring-offset-2 bg-success/5'
        : 'hover:border-border'
    )}
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    {isWinner && (
      <div className="absolute -top-2 -right-2 bg-success text-success-foreground text-xs font-bold px-2 py-0.5 rounded-full z-10">
        당첨!
      </div>
    )}

    <div className="flex items-center space-x-4">
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full',
          'bg-muted',
          'text-primary font-bold text-lg',
          'border-2 border-white shadow-sm',
          isWinner && 'text-success'
        )}
      >
        {index + 1}
      </div>

      <div className="flex flex-col">
        <span
          className={cn(
            'font-semibold text-foreground',
            isWinner && 'text-success'
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
      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
    </Button>
  </motion.div>
);

export default DicePlayerComponent;
