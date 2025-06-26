import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { DiceComponent } from './dice.component';
import { cn } from '@/lib/utils';

interface DicePlayerComponentPropsType {
  name: string;
  diceValues: [number, number] | undefined;
  isRolling: boolean;
  isWinner: boolean;
  onRemove: () => void;
  index: number;
}

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
      'flex items-center justify-between p-4 rounded-lg border',
      isWinner ? 'bg-yellow-50 border-yellow-200' : 'bg-card'
    )}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ delay: index * 0.1 }}
  >
    <div className="flex items-center space-x-4">
      <span className="font-medium">{name}</span>
      {diceValues && (
        <DiceComponent
          values={diceValues}
          rolling={isRolling}
          winner={isWinner}
        />
      )}
    </div>
    <Button
      variant="ghost"
      size="icon"
      onClick={onRemove}
      className="text-muted-foreground hover:text-destructive"
    >
      <X className="h-4 w-4" />
    </Button>
  </motion.div>
);

export default DicePlayerComponent;
