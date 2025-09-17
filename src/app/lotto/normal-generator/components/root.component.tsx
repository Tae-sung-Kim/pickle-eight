'use client';

import { TitleWrapperComponent } from "@/components/title-warpper.component";
import { MENU_GROUP_NAME_ENUM } from "@/constants/menu.constant";
import { generateLottoNumbers } from "@/utils/lotto.util";
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { LottoGeneratorControlsComponent } from './generator-controls.component';
import { LottoNumberListComponent } from './number-list.component';

export function LottoNormalGeneratorComponent() {
  const [orderCount, setOrderCount] = useState(1);
  const [lottoNumberList, setLottoNumberList] = useState<number[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string>('');
  const [rngLabel, setRngLabel] = useState<string>('');

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

    // 생성 기준 메타데이터 설정
    const hasWebCrypto =
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as unknown as { crypto?: Crypto }).crypto !==
        'undefined' &&
      typeof (globalThis as unknown as { crypto: Crypto }).crypto
        .getRandomValues === 'function';
    setRngLabel(
      hasWebCrypto ? 'crypto.getRandomValues' : 'Math.random (fallback)'
    );
    const now = new Date();
    const ts = `${now.toLocaleString('ko-KR', { hour12: false })}`;
    setGeneratedAt(ts);

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
            title="로또 번호 무작위 생성기"
            description="무작위(랜덤) 번호를 생성합니다. AI 예측이 아니며 통계·패턴 분석을 사용하지 않습니다."
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

              {generatedAt && (
                <p className="px-6 text-xs text-muted-foreground">
                  생성 기준: {generatedAt} · RNG: {rngLabel}
                </p>
              )}

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
