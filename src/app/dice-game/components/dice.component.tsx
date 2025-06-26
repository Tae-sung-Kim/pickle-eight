import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @param values 두 개의 주사위 값 [number, number]
 * @param rolling 애니메이션 동작 여부
 */
export type DiceComponentPropsType = {
  values: [number, number];
  rolling: boolean;
  winner?: boolean;
};

export const DiceComponent = ({
  values,
  rolling,
  winner = false,
}: DiceComponentPropsType) => (
  <div className="flex gap-4 items-center">
    {values.map((value, idx) => (
      <motion.div
        key={idx}
        className={cn(
          'relative w-20 h-20 rounded-lg overflow-hidden',
          winner && 'ring-4 ring-yellow-400 ring-offset-2'
        )}
        animate={{
          scale: rolling ? [1, 1.1, 1] : 1,
          rotate: rolling ? [0, 360] : 0,
        }}
        transition={{
          duration: 0.5,
          repeat: rolling ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        <Card className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-background">
          <AnimatePresence mode="wait">
            <motion.span
              key={value}
              className="text-3xl font-bold text-foreground"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </Card>
      </motion.div>
    ))}
  </div>
);

export default DiceComponent;
