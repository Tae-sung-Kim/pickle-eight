'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNameManager } from '@/hooks';
import { NameInputComponent, NameListComponent } from '@/components';
import { Sparkles, Users, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NameRandomPage() {
  const { names, addName, removeName, reset } = useNameManager();
  const [winner, setWinner] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isPicking, setIsPicking] = useState(false);

  const handleAddName = () => {
    if (addName(inputValue)) {
      setInputValue('');
    }
  };

  const handlePickRandom = async () => {
    if (names.length === 0) return;
    setIsPicking(true);

    // Add some suspense with a small delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const randomIndex = Math.floor(Math.random() * names.length);
    const picked = names[randomIndex];
    setWinner(picked);
    setIsPicking(false);
  };

  const handleReset = () => {
    reset();
    setWinner('');
    setInputValue('');
  };

  if (winner) {
    return (
      <div className="container mx-auto min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                축하합니다! 🎉
              </h1>
              <p className="text-muted-foreground">당첨자를 발표합니다</p>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={cn(
                'relative p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100',
                'border border-amber-200 shadow-lg'
              )}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                당첨자
              </div>
              <div className="text-4xl font-bold text-amber-600 py-4">
                {winner}
              </div>
            </motion.div>

            <Button
              onClick={handleReset}
              size="lg"
              className="w-full max-w-xs mx-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 추첨하기
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto space-y-8 py-12"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2 text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            이름 추첨기
          </h1>
          <p className="text-muted-foreground">
            추첨할 이름을 추가하고 행운의 당첨자를 뽑아보세요
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <NameInputComponent
              value={inputValue}
              onChange={setInputValue}
              onAdd={handleAddName}
              placeholder="이름 입력 후 엔터 또는 추가 버튼"
              buttonText="추가"
            />

            {names.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">
                      참가자 목록 ({names.length}명)
                    </h3>
                  </div>
                  <Button
                    onClick={handleReset}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    모두 지우기
                  </Button>
                </div>

                <NameListComponent
                  list={names}
                  onRemove={removeName}
                  className="max-h-60 overflow-y-auto"
                />

                <Button
                  onClick={handlePickRandom}
                  disabled={isPicking || names.length === 0}
                  size="lg"
                  className="w-full mt-4"
                >
                  {isPicking ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                      추첨 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      추첨하기
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
