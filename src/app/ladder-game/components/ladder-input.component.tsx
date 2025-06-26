'use client';

import { motion } from 'framer-motion';
import { Plus, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNameManager } from '@/hooks';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { LadderInputComponentPropsType } from '@/types';

export function LadderInputComponent({
  onCreateLadder,
}: LadderInputComponentPropsType) {
  const { names, addName, removeName } = useNameManager();
  const [nameInput, setNameInput] = useState('');
  const [prizes, setPrizes] = useState<string[]>([]);
  const [prizeInput, setPrizeInput] = useState('');

  const handleAddName = () => {
    if (nameInput.trim() && addName(nameInput.trim())) {
      setNameInput('');
    }
  };

  const handleAddPrize = () => {
    const trimmedPrize = prizeInput.trim();
    if (trimmedPrize && !prizes.includes(trimmedPrize)) {
      setPrizes([...prizes, trimmedPrize]);
      setPrizeInput('');
    }
  };

  const handleCreate = () => {
    if (names.length < 2 || prizes.length < 2) {
      toast.error('참가자와 상품은 각각 2명/개 이상 필요해요!', {
        position: 'top-center',
      });
      return;
    }
    onCreateLadder({ names, prizes });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 p-6"
    >
      <div className="grid gap-8 md:grid-cols-2">
        {/* 참가자 입력 섹션 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">참가자 추가</h3>
            <span className="text-sm text-muted-foreground">
              {names.length}명 추가됨
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddName()}
              placeholder="이름 입력"
              className="flex-1"
            />
            <Button
              onClick={handleAddName}
              disabled={!nameInput.trim()}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {names.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {names.map((name, idx) => (
                <div
                  key={idx}
                  className="flex items-center bg-muted px-3 py-1 rounded-full text-sm"
                >
                  <span>{name}</span>
                  <button
                    onClick={() => removeName(idx)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 상품 입력 섹션 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">상품/결과 추가</h3>
            <span className="text-sm text-muted-foreground">
              {prizes.length}개 추가됨
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              value={prizeInput}
              onChange={(e) => setPrizeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPrize()}
              placeholder="상품 또는 결과 입력"
              className="flex-1"
            />
            <Button
              onClick={handleAddPrize}
              disabled={!prizeInput.trim()}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {prizes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {prizes.map((prize, idx) => (
                <div
                  key={idx}
                  className="flex items-center bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{prize}</span>
                  <button
                    onClick={() =>
                      setPrizes(prizes.filter((_, i) => i !== idx))
                    }
                    className="ml-1 text-amber-600 hover:text-amber-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={handleCreate}
          disabled={names.length < 2 || prizes.length < 2}
          size="lg"
          className={cn(
            'w-full py-6 text-base font-bold',
            'bg-gradient-to-r from-indigo-500 to-purple-600',
            'hover:from-indigo-600 hover:to-purple-700',
            'shadow-lg hover:shadow-xl',
            (names.length < 2 || prizes.length < 2) && 'opacity-70'
          )}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          사다리 생성하기
        </Button>
      </div>
    </motion.div>
  );
}

export default LadderInputComponent;
