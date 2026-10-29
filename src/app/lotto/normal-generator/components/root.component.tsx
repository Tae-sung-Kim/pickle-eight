'use client';

import { useCallback, useState } from 'react';
import { generateLottoNumbers } from '@/features/lotto/utils/lotto.util';
import { LottoGeneratorControlsComponent } from './generator-controls.component';
import { LottoNumberListComponent } from './number-list.component';

export function LottoNormalGeneratorComponent() {
  const [orderCount, setOrderCount] = useState(1);
  const [lottoNumberList, setLottoNumberList] = useState<number[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string>('');
  const [rngLabel, setRngLabel] = useState<string>('');

  const handleRandomLottoNumber = useCallback(async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    setLottoNumberList(
      Array.from({ length: orderCount }, () => generateLottoNumbers())
    );

    const hasWebCrypto =
      typeof globalThis.crypto?.getRandomValues === 'function';
    setRngLabel(
      hasWebCrypto ? 'crypto.getRandomValues' : 'Math.random (fallback)'
    );
    setGeneratedAt(new Date().toLocaleString('ko-KR', { hour12: false }));
    setIsGenerating(false);
  }, [orderCount]);

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">번호 무작위 생성</h2>
        <p className="max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
          무작위(랜덤) 번호를 생성합니다. AI 예측이 아니며 통계·패턴 분석을
          사용하지 않습니다.
        </p>
      </div>

      <LottoGeneratorControlsComponent
        orderCount={orderCount}
        isGenerating={isGenerating}
        onOrderCountChange={setOrderCount}
        onGenerate={handleRandomLottoNumber}
      />

      {generatedAt && (
        <p className="text-xs text-muted-foreground">
          생성 시각 {generatedAt}, 난수 소스 {rngLabel}
        </p>
      )}

      <LottoNumberListComponent
        numbersList={lottoNumberList}
        title="생성된 번호"
      />
    </div>
  );
}
