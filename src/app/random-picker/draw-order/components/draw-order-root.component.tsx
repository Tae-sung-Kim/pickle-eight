'use client';

import { useState } from 'react';
import { useNameManager } from '@/hooks';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { DrawOrderCircleComponent } from './circle.component';
import { DrawOrderGuideComponent } from './guide.component';
import DrawOrderInputListComponent from './input-list.component';

// 결과값 섞기
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function DrawOrderComponent() {
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState<string[]>([]);

  // 참가자 이름 관리를 위한 커스텀 훅 사용
  const { names: participants, addName, removeName, reset } = useNameManager();

  const [shuffledPrizeOrder, setShuffledPrizeOrder] = useState<string[]>([]);
  const [revealedResults, setRevealedResults] = useState<
    Record<string, string | undefined>
  >({});

  // 추첨 시작
  const handleStartDraw = () => {
    setShuffledPrizeOrder(shuffle([...items]));
    setRevealedResults({});
    setStarted(true);
  };

  // 다시 하기
  const handleRetry = () => {
    setStarted(false);
    setRevealedResults({});
    reset();
    setItems([]);
  };

  const handleReveal = (participantId: string) => {
    if (revealedResults[participantId]) return;
    const revealedCount = Object.keys(revealedResults).length;
    setRevealedResults((prev) => ({
      ...prev,
      [participantId]: shuffledPrizeOrder[revealedCount],
    }));
  };

  // 상품/번호 추가
  const addItem = (item: string) => {
    setItems((prev) => [...prev, item]);
  };

  // 상품/번호 제거
  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // 시작 조건
  const canStart = participants.length > 0 && items.length > 0;

  // 애니메이션 변수
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (!started) {
    return (
      <div className="bg-muted py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold mb-3 text-primary">
              랜덤 매칭 추첨하기
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              참가자와 상품을 등록하고 공정한 랜덤 매칭 추첨을 진행해보세요.
            </p>
          </motion.div>

          <motion.div
            className="space-y-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div variants={item}>
                <DrawOrderInputListComponent
                  label="참가자 목록"
                  placeholder="참가자 이름 입력"
                  list={participants}
                  onAdd={addName}
                  onRemove={removeName}
                />
              </motion.div>

              <motion.div variants={item}>
                <DrawOrderInputListComponent
                  label="상품/번호 목록"
                  placeholder="상품 또는 번호 입력"
                  list={items}
                  onAdd={addItem}
                  onRemove={removeItem}
                />
              </motion.div>
            </div>

            <motion.div className="pt-4" variants={item}>
              <Button
                onClick={handleStartDraw}
                disabled={!canStart}
                size="lg"
                className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
                  !canStart
                    ? 'opacity-60 cursor-not-allowed bg-muted text-muted-foreground'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-95 transform transition-transform duration-200'
                } rounded-xl`}
              >
                <span className="flex items-center justify-center gap-2">
                  추첨 시작하기
                  <ArrowRight
                    className={`w-5 h-5 transition-transform duration-300 ${
                      !canStart ? '' : 'group-hover:translate-x-1'
                    }`}
                  />
                </span>
              </Button>

              {!canStart && (
                <p className="text-sm text-center text-muted-foreground mt-3">
                  {participants.length === 0 && items.length === 0
                    ? '참가자와 상품을 추가해주세요.'
                    : participants.length === 0
                    ? '최소 1명 이상의 참가자가 필요합니다.'
                    : '최소 1개 이상의 상품/번호가 필요합니다.'}
                </p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex items-center justify-center min-h-[400px]">
          <DrawOrderCircleComponent
            participants={participants.map((name, idx) => ({
              id: String(idx),
              name,
            }))}
            revealedResults={revealedResults}
            onReveal={handleReveal}
            onRetry={handleRetry} // ← 반드시 props로 넘겨야 함
          />
        </div>
        <DrawOrderGuideComponent />
      </div>
    </div>
  );
}

export default DrawOrderComponent;
