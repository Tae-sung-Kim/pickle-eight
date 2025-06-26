import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FaSpinner } from 'react-icons/fa';

interface DiceRollButtonPropsType {
  onClick: () => void;
  onReset: () => void;
  disabled: boolean;
  isRolling: boolean;
  showReset?: boolean;
}

export const DiceRollButtonComponent = ({
  onClick,
  disabled,
  isRolling,
  showReset,
  onReset,
}: DiceRollButtonPropsType) => (
  <motion.div
    className="flex justify-center gap-4 mt-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className={cn(
        'px-8 py-6 text-lg font-bold bg-primary hover:bg-primary/90',
        'shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150',
        'min-w-[180px] flex items-center justify-center',
        isRolling && 'opacity-75 cursor-not-allowed'
      )}
    >
      {isRolling ? (
        <>
          <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
          <span>굴리는 중...</span>
        </>
      ) : showReset ? (
        '다시 굴리기'
      ) : (
        '주사위 굴리기'
      )}
    </Button>
    {showReset && (
      <Button
        variant="outline"
        onClick={onReset}
        disabled={disabled}
        size="lg"
        className={cn(
          'px-8 py-6 text-lg font-medium border-2 hover:bg-accent/50 transition-colors',
          'min-w-[180px] flex items-center justify-center'
        )}
      >
        <RefreshCw className="w-5 h-5 mr-2" />
        <span>초기화</span>
      </Button>
    )}
  </motion.div>
);

export default DiceRollButtonComponent;
