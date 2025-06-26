'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LottoGeneratorControlsPropsType } from '@/types';
import { cn } from '@/lib/utils';

export function LottoGeneratorControlsComponent({
  orderCount,
  isGenerating,
  onOrderCountChange,
  onGenerate,
}: LottoGeneratorControlsPropsType) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">로또 번호 생성</h2>
            <p className="text-sm text-muted-foreground">
              AI가 추천하는 행운의 번호를 생성합니다
            </p>
          </div>
          <div className="flex h-12 w-16 items-center justify-center rounded-full bg-pink-100 text-lg font-bold text-pink-600">
            {orderCount}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              생성할 게임 수
            </span>
            <span className="text-sm font-medium text-pink-600">최대 10개</span>
          </div>
          <Slider
            value={[orderCount]}
            min={1}
            max={10}
            step={1}
            onValueChange={(value) => onOrderCountChange(value[0])}
            className="py-4"
          />
        </div>
      </div>

      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        size="lg"
        className={cn(
          'w-full py-6 text-base font-bold',
          'bg-gradient-to-r from-pink-500 to-rose-500',
          'hover:from-pink-600 hover:to-rose-600',
          'shadow-lg hover:shadow-xl',
          'transition-all duration-300',
          'disabled:opacity-70'
        )}
      >
        {isGenerating ? (
          <span className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
            번호 생성 중...
          </span>
        ) : (
          <span className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5" />
            행운의 번호 뽑기
          </span>
        )}
      </Button>
    </motion.div>
  );
}

export default LottoGeneratorControlsComponent;
