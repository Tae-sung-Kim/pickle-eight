'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCapture, useNameManager } from '@/hooks';
import { NameInputComponent, NameListComponent } from '@/components';
import { Sparkles, Users, RefreshCw, Share2 } from 'lucide-react';
import { cn } from '@/lib';

export function NameRandomComponent() {
  const { names, addName, removeName, reset } = useNameManager();
  const [winner, setWinner] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isPicking, setIsPicking] = useState(false);

  const { onCapture } = useCapture();

  const winnerRef = useRef<HTMLDivElement>(null);

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

  const onShare = useCallback(async () => {
    if (!winnerRef.current) return;

    onCapture(winnerRef as React.RefObject<HTMLElement>, {
      fileName: 'winner.png',
      shareTitle: '축하합니다! 🎉',
      shareText: `축하합니다! ${winner}님이 당첨되었습니다!`,
    });
  }, [onCapture, winner]);

  if (winner) {
    return (
      <div className="bg-muted container mx-auto h-fit flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            <div ref={winnerRef} className="p-4 bg-muted">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  축하합니다! 🎉
                </h1>
                <p className="text-muted-foreground">당첨자를 발표합니다</p>
              </div>

              {/* 추첨 대상자 목록 추가 */}
              <div className="my-4">
                <div className="font-semibold mb-2 text-sm text-muted-foreground">
                  추첨 대상자 ({names.length}명)
                </div>
                <div className="rounded-xl bg-surface-card/90 shadow border border-border px-4 py-3 flex flex-wrap gap-x-3 gap-y-2 items-center text-base">
                  {names.map((name, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        name === winner
                          ? 'text-primary font-bold'
                          : 'text-foreground'
                      )}
                    >
                      {name}
                      {idx < names.length - 1 && (
                        <span className="mx-1 text-muted-foreground/50">·</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={cn(
                  'relative p-8 rounded-2xl bg-muted',
                  'border border-border shadow-lg mt-4'
                )}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-success text-success-foreground px-4 py-1 rounded-full text-sm font-medium">
                  당첨자
                </div>
                <div className="text-4xl font-bold text-success py-4">
                  {winner}
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                onClick={handleReset}
                size="lg"
                className="w-full sm:w-auto max-w-xs mx-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 추첨하기
              </Button>
              <Button
                onClick={onShare}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto max-w-xs mx-auto"
              >
                <Share2 className="mr-2 h-4 w-4" />
                결과 공유하기
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted container mx-auto h-fit p-4">
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
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            항목 랜덤 추첨기
          </h1>
          <p className="text-muted-foreground">
            추첨할 항목을 추가하고 행운의 당첨자를 뽑아보세요
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border bg-surface-card p-6 shadow-sm border-border">
            <NameInputComponent
              value={inputValue}
              disabled={inputValue.length < 1}
              onChange={setInputValue}
              onAdd={handleAddName}
              isIcon={true}
              placeholder="추첨할 항목 입력 후 엔터 또는 추가 버튼"
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

export default NameRandomComponent;
