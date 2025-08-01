'use client';

import React, { useRef, useState } from 'react';
import { ParticipantType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCapture } from '@/hooks';

type DrawOrderCircleComponentPropsType = {
  participants: ParticipantType[];
  revealedResults: Record<string, string | undefined>;
  onReveal: (participantId: string) => void;
  onRetry?: () => void; // "다시 하기" 콜백
};

/**
 * 참가자 동그라미 추첨 UI - 클릭 시 회전 후 결과 노출, "다시 하기" 버튼 포함
 */
export function DrawOrderCircleComponent({
  participants,
  revealedResults,
  onReveal,
  onRetry,
}: DrawOrderCircleComponentPropsType) {
  const [spinningId, setSpinningId] = useState<string | null>(null);
  const [revealingId, setRevealingId] = useState<string | null>(null);

  const { onCapture } = useCapture();
  const resultRef = useRef<HTMLDivElement>(null);

  const handleClick = (id: string, revealed: boolean) => {
    if (revealed || spinningId || revealingId) return;
    setSpinningId(id);
    setRevealingId(id);
    setTimeout(() => {
      setSpinningId(null);
      onReveal(id);
      setTimeout(() => setRevealingId(null), 100);
    }, 900); // 회전 애니메이션 시간
  };

  // 공유하기
  const handleShare = () => {
    onCapture(resultRef as React.RefObject<HTMLElement>, {
      fileName: 'result.png',
      shareTitle: '랜덤 매칭 추첨 결과',
    });
  };

  return (
    <div className="relative w-full">
      {/* 다시 하기 버튼 */}
      {onRetry && (
        <Button
          type="button"
          onClick={onRetry}
          className="absolute m-3 left-0 top-0 flex items-center gap-1 px-4 py-2 rounded-lg shadow bg-white/80 hover:bg-white transition z-10 text-gray-700"
        >
          <RotateCw className="w-5 h-5 text-gray-700" />
          <span className="font-semibold">다시 하기</span>
        </Button>
      )}

      <Button
        type="button"
        onClick={handleShare}
        className="absolute m-3 right-0 top-0 flex items-center gap-1 px-4 py-2 rounded-lg shadow bg-white/80 hover:bg-white transition z-10 text-gray-700"
      >
        <Share2 className="w-5 h-5 text-gray-700" />
        공유하기
      </Button>

      <div
        className={`grid ${
          participants.length > 4 ? 'grid-cols-3' : 'grid-cols-2'
        } gap-8 justify-items-center items-center w-full min-h-[500px] bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl p-8`}
        ref={resultRef}
      >
        {participants.map((p, idx) => {
          const revealed = !!revealedResults[p.id];
          const spinning = spinningId === p.id;
          const revealing = revealingId === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                spinning
                  ? { opacity: 1, scale: 1, rotate: [0, 360, 0, 360, 0, 360] }
                  : { opacity: 1, scale: 1, rotate: 0 }
              }
              transition={
                spinning
                  ? { duration: 0.9, type: 'tween', ease: 'easeInOut' }
                  : { delay: idx * 0.08, duration: 0.35, type: 'spring' }
              }
              whileTap={!revealed && !spinning ? { scale: 0.95 } : undefined}
              className={`
                w-40 h-40 rounded-full flex flex-col items-center justify-center
                text-2xl font-bold shadow-xl transition-all duration-300
                border-4
                ${
                  revealed
                    ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white border-yellow-300 shadow-[0_0_40px_0_rgba(255,215,0,0.6)] animate-pulse'
                    : 'bg-gradient-to-br from-blue-200 to-indigo-400 text-blue-900 border-blue-300 hover:shadow-2xl'
                }
                ${revealed ? 'cursor-default' : 'hover:scale-105'}
              `}
              onClick={() => handleClick(p.id, revealed)}
              disabled={revealed || spinning || revealing}
              type="button"
              style={{
                boxShadow: revealed
                  ? '0 0 40px 0 rgba(255,215,0,0.5), 0 8px 32px 0 rgba(0,0,0,0.08)'
                  : undefined,
                transition: 'box-shadow 0.3s',
              }}
            >
              <span
                className={`transition-all duration-300 ${
                  revealed ? 'text-white drop-shadow-lg' : ''
                }`}
              >
                {p.name}
              </span>
              <AnimatePresence>
                {revealedResults[p.id] && !spinning && !revealing && (
                  <motion.span
                    className="mt-2 text-2xl font-extrabold tracking-wide bg-yellow-300 text-yellow-900 rounded-xl px-4 py-2 shadow-lg animate-bounce"
                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.45, type: 'spring' }}
                  >
                    {revealedResults[p.id]}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
