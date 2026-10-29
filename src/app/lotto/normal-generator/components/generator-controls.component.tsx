'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { LottoGeneratorControlsPropsType } from '@/features/lotto/types/lotto.type';

export function LottoGeneratorControlsComponent({
  orderCount,
  isGenerating,
  onOrderCountChange,
  onGenerate,
}: LottoGeneratorControlsPropsType) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">생성할 게임 수</span>
          <span className="text-lg font-semibold tabular-nums">
            {orderCount}게임
          </span>
        </div>
        <Slider
          value={[orderCount]}
          min={1}
          max={10}
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
