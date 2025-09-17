'use client';
import { DOT_POSITIONS } from "@/constants/dice-game.constant";
import { cn } from "@/lib/utils";
import { DiceComponentPropsType } from '@/types/dice-game.type';
import { AnimatePresence, motion } from 'framer-motion';

const getDiceDots = (value: number) => {
  return Array.from({ length: value }, (_, i) => ({
    id: i,
    position: DOT_POSITIONS[value as keyof typeof DOT_POSITIONS][i],
  }));
};

export const DiceComponent = ({
  values,
  rolling,
  winner = false,
  isDouble = false,
}: DiceComponentPropsType) => (
  <div className="flex gap-3 items-center">
    {values.map((value, idx) => {
      const dots = getDiceDots(value);
      const doubleEffect =
        value === values[0] && value === values[1] && idx === 1;

      return (
        <motion.div
          key={idx}
          className={cn(
            'relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg',
            'bg-surface-card shadow-[0_4px_0_rgba(0,0,0,0.1)]',
            'border-2 border-border',
            'flex items-center justify-center',
            winner && 'ring-2 ring-success ring-offset-2',
            isDouble && doubleEffect && 'bg-info/10'
          )}
          animate={{
            rotate: rolling ? [0, 360] : 0,
            y: rolling ? [0, -5, 0] : 0,
          }}
          transition={{
            duration: 0.6,
            repeat: rolling ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          <div className="absolute inset-0 rounded-lg bg-white/40" />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/70 to-transparent" />

          <AnimatePresence mode="wait">
            <motion.div
              key={value}
              className="w-full h-full p-2 grid grid-cols-3 grid-rows-3 gap-1"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              {dots.map((dot) => (
                <motion.span
                  key={dot.id}
                  className={cn(
                    'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full',
                    'bg-current',
                    dot.position === 'top-left' && 'col-start-1 row-start-1',
                    dot.position === 'top-right' && 'col-start-3 row-start-1',
                    dot.position === 'middle-left' && 'col-start-1 row-start-2',
                    dot.position === 'center' &&
                      'col-start-2 row-start-2 self-center justify-self-center',
                    dot.position === 'middle-right' &&
                      'col-start-3 row-start-2',
                    dot.position === 'bottom-left' && 'col-start-1 row-start-3',
                    dot.position === 'bottom-right' &&
                      'col-start-3 row-start-3',
                    winner ? 'text-success' : 'text-foreground',
                    isDouble && doubleEffect && 'text-info'
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.1 * dot.id,
                    type: 'spring',
                    stiffness: 500,
                    damping: 15,
                  }}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {isDouble && doubleEffect && (
            <motion.div
              className="absolute -top-2 -right-2 bg-info text-info-foreground text-[10px] font-bold px-2 py-0.5 rounded-full z-10 whitespace-nowrap shadow-md"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              더블!
            </motion.div>
          )}
        </motion.div>
      );
    })}
  </div>
);

export default DiceComponent;
