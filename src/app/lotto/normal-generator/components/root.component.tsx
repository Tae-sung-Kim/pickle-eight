'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { generateLottoNumbers } from '@/utils';
import { LottoNumberListComponent } from './number-list.component';
import { LottoGeneratorControlsComponent } from './generator-controls.component';
import { TitleWrapperComponent } from '@/components';
import { MENU_GROUP_NAME_ENUM } from '@/constants';

export function LottoNormalGeneratorComponent() {
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
    <div className="container mx-auto h-fit p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2 text-center"
        >
          <TitleWrapperComponent
            type={MENU_GROUP_NAME_ENUM.LOTTO}
            title="로또 번호 생성기"
            description="추천하는 행운의 번호로 당첨의 기회를 잡아보세요!"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-border bg-white/70 backdrop-blur p-6 shadow-sm ring-1 ring-black/5">
            <div className="space-y-6">
              <div className="rounded-xl p-6">
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

export default LottoNormalGeneratorComponent;
