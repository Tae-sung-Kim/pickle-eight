'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Share2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib';

export type WinnerViewProps = {
  readonly names: readonly string[];
  readonly winner: string;
  onReset: () => void;
  onShare: (target: React.RefObject<HTMLElement>) => void;
};

export function NameRandomWinnerViewComponent({
  names,
  winner,
  onReset,
  onShare,
}: WinnerViewProps) {
  const winnerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto h-fit flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-6"
        >
          <div
            ref={winnerRef}
            className="p-5 rounded-2xl border border-border bg-white/70 backdrop-blur shadow-sm ring-1 ring-black/5"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                축하합니다! 🎉
              </h1>
              <p className="text-muted-foreground">당첨자를 발표합니다</p>
            </div>

            <div className="my-4">
              <div className="font-semibold mb-2 text-sm text-muted-foreground">
                추첨 대상자 ({names.length}명)
              </div>
              <div className="rounded-xl bg-muted/60 px-4 py-3 border border-border flex flex-wrap gap-x-3 gap-y-2 items-center text-base">
                {names.map((name, idx) => (
                  <span
                    key={`${name}-${idx}`}
                    className={
                      name === winner
                        ? 'text-primary font-bold'
                        : 'text-foreground'
                    }
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
                'relative p-8 rounded-2xl bg-white/80 backdrop-blur',
                'border border-border shadow-md mt-4 ring-1 ring-black/5'
              )}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-success text-success-foreground px-4 py-1 rounded-full text-sm font-medium shadow">
                당첨자
              </div>
              <div className="text-4xl font-bold text-success py-4">
                {winner}
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              onClick={onReset}
              size="lg"
              className="w-full sm:w-auto max-w-xs mx-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 추첨하기
            </Button>
            <Button
              onClick={() => onShare(winnerRef as React.RefObject<HTMLElement>)}
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

export default NameRandomWinnerViewComponent;
