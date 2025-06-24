import { CounterComponent } from '@/components';
import { Button } from '@/components/ui/button';
import { FaSpinner } from 'react-icons/fa';
import { cn } from '@/lib/utils';

type LottoGeneratorControlsProps = {
  orderCount: number;
  isGenerating: boolean;
  onOrderCountChange: (value: number) => void;
  onGenerate: () => void;
};

export function LottoGeneratorControlsComponent({
  orderCount,
  isGenerating,
  onOrderCountChange,
  onGenerate,
}: LottoGeneratorControlsProps) {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">로또 번호 생성</h2>
        <p className="text-sm text-muted-foreground">
          생성할 로또 개수를 선택해주세요 (최대 10개)
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">구매 수량</span>
          <CounterComponent
            value={orderCount}
            min={1}
            max={10}
            onChange={onOrderCountChange}
            className="w-32"
            showLabel={false}
            showSlider={false}
          />
        </div>
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className={cn(
            'min-w-[140px] h-12 text-base font-semibold',
            'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600',
            'text-white shadow-lg hover:shadow-xl',
            'transition-all duration-300 transform hover:scale-105',
            'relative overflow-hidden group',
            isGenerating && 'opacity-80 cursor-not-allowed',
            'active:scale-95' // 버튼 누를 때 약간 작아지는 효과
          )}
        >
          <span className="relative z-10 flex items-center justify-center">
            {isGenerating ? (
              <>
                <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <span className="mr-1">🎯</span>
                <span>행운의 번호 받기</span>
              </>
            )}
          </span>
          {/* 호버 시 움직이는 빛 효과 */}
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 group-hover:animate-pulse transition-opacity duration-300"></span>
        </Button>
      </div>
    </div>
  );
}

export default LottoGeneratorControlsComponent;
