import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { DicePlayerComponent } from './dice-player.component';

interface DicePlayerListComponentProps {
  names: string[];
  diceValues: number[][];
  isRolling: boolean;
  winnerIndex: number | null;
  onRemove: (index: number) => void;
}

export const DicePlayerListComponent = ({
  names,
  diceValues,
  isRolling,
  winnerIndex,
  onRemove,
}: DicePlayerListComponentProps) => (
  <AnimatePresence>
    {names.length > 0 && (
      <motion.div
        className="space-y-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="grid gap-4">
          {names.map((name, index) => (
            <DicePlayerComponent
              key={index}
              name={name}
              diceValues={diceValues[index] as [number, number] | undefined}
              isRolling={isRolling}
              isWinner={winnerIndex === index}
              onRemove={() => onRemove(index)}
              index={index}
            />
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default DicePlayerListComponent;
