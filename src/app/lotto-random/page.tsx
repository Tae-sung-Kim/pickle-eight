'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LottoGeneratorControlsComponent,
  LottoNumberListComponent,
} from './components';
import { generateLottoNumbers } from '@/utils';

export default function LottoPage() {
  const [orderCount, setOrderCount] = useState(1);
  const [lottoNumberList, setLottoNumberList] = useState<number[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOrderCountChange = (newValue: number) => {
    setOrderCount(newValue);
  };

  const handleRandomLottoNumber = useCallback(async () => {
    setIsGenerating(true);

    // 시뮬레이션을 위한 약간의 지연
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newLottoNumberList: number[][] = [];

    Array.from({ length: orderCount }, () => {
      newLottoNumberList.push(generateLottoNumbers());
    });

    setLottoNumberList(newLottoNumberList);
    setIsGenerating(false);
  }, [orderCount]);

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-4xl space-y-8"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2 text-center"
        >
          <h1 className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            로또 번호 생성기
          </h1>
          <p className="text-lg text-muted-foreground">
            AI가 추천하는 행운의 번호로 당첨의 기회를 잡아보세요!
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="space-y-6">
              <div className="rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 p-6">
                <LottoGeneratorControlsComponent
                  orderCount={orderCount}
                  isGenerating={isGenerating}
                  onOrderCountChange={handleOrderCountChange}
                  onGenerate={handleRandomLottoNumber}
                />
              </div>

              <LottoNumberListComponent
                numbersList={lottoNumberList}
                title="생성된 로또 번호"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
