'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { LOTTO_MAX_GAMES } from '@/features/lotto/constants/lotto.constant';
import type { LottoGeneratorControlsPropsType } from '@/features/lotto/types/lotto.type';
import { clampInt } from '@/features/lotto/utils/lotto.util';

export function LottoGeneratorControlsComponent({
  orderCount,
  isGenerating,
  onOrderCountChange,
  onGenerate,
}: LottoGeneratorControlsPropsType) {
  // 입력 중에는 빈 값도 허용하기 위해 문자열로 따로 보관
  const [text, setText] = useState<string>(String(orderCount));

  useEffect(() => {
    setText(String(orderCount));
  }, [orderCount]);

  const handleInputChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    setText(digits);
    if (digits !== '') {
      onOrderCountChange(clampInt(digits, 1, LOTTO_MAX_GAMES));
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="lotto-order-count"
            className="text-sm text-muted-foreground"
          >
            생성할 게임 수 (최대 {LOTTO_MAX_GAMES})
          </label>
          <div className="flex shrink-0 items-center gap-2">
            <Input
              id="lotto-order-count"
              type="text"
              inputMode="numeric"
              value={text}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={() => setText(String(orderCount))}
              className="h-9 w-16 text-center text-lg font-semibold tabular-nums"
            />
            <span className="whitespace-nowrap text-lg font-semibold">
              게임
            </span>
          </div>
        </div>
        <Slider
          value={[orderCount]}
          min={1}
          max={LOTTO_MAX_GAMES}
          step={1}
          onValueChange={(value) => onOrderCountChange(value[0])}
        />
      </div>

      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        size="lg"
        className="sm:w-44"
      >
        {isGenerating ? '생성 중' : '번호 뽑기'}
      </Button>
    </div>
  );
}
