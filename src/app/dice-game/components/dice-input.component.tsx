import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { KeyboardEvent, useState } from 'react';
import { DiceInputComponentPropsType } from '@/types';

const DiceInputComponent = ({ addName }: DiceInputComponentPropsType) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleAddName = (e: React.FormEvent) => {
    e.preventDefault();
    if (addName(inputValue)) {
      setInputValue('');
    }
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddName(e);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder="이름을 입력하세요"
          className="pr-12 text-base"
          value={inputValue}
          onKeyUp={handleKeyUp}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <motion.div
          className="absolute right-2"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim()}
            className="h-8 w-8 rounded-full"
            onClick={handleAddName}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
      {isFocused && (
        <motion.p
          className="mt-2 text-xs text-muted-foreground text-center"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          엔터 키를 눌러 추가할 수 있습니다
        </motion.p>
      )}
    </div>
  );
};

export default DiceInputComponent;
