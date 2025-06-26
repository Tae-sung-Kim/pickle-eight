import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCw, Dice5 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FaSpinner } from 'react-icons/fa';
import { DiceRollButtonPropsType } from '@/types';

export const DiceRollButtonComponent = ({
  onClick,
  disabled,
  isRolling,
  showReset,
  onReset,
}: DiceRollButtonPropsType) => (
  <motion.div
    className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md mx-auto"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className={cn(
        'px-8 py-7 text-lg font-bold',
        'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700',
        'text-white shadow-lg hover:shadow-xl active:scale-[0.98]',
        'transition-all duration-200 transform-gpu',
        'flex-1 min-h-[60px]',
        'group relative overflow-hidden',
        isRolling && 'opacity-90 cursor-progress',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
    >
      <AnimatePresence mode="wait">
        {isRolling ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center"
          >
            <FaSpinner className="mr-3 h-5 w-5 animate-spin" />
            <span>굴리는 중...</span>
          </motion.span>
        ) : (
          <motion.span
            key="ready"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center"
          >
            <Dice5 className="mr-3 h-5 w-5 group-hover:animate-bounce" />
            <span>{showReset ? '다시 굴리기' : '주사위 굴리기'}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </Button>

    <AnimatePresence>
      {showReset && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full sm:w-auto"
        >
          <Button
            variant="outline"
            onClick={onReset}
            disabled={disabled}
            size="lg"
            className={cn(
              'w-full sm:w-auto px-8 py-7 text-lg font-medium',
              'border-2 border-gray-200 hover:bg-gray-50',
              'text-gray-700 hover:text-gray-900',
              'transition-all duration-200',
              'min-h-[60px]'
            )}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            <span>초기화</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default DiceRollButtonComponent;
