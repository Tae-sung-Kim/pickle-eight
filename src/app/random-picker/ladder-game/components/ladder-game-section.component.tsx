'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import { LadderComponent } from './ladder.component';
import { LadderResultComponent } from './ladder-result.component';
import { LadderGameSectionComponentPropsType } from '@/types';
import { useCapture } from '@/hooks';
import { useRef } from 'react';

export const LadderGameSectionComponent = ({
  ladder,
  config,
  results,
  onReset,
}: LadderGameSectionComponentPropsType) => {
  const { names, prizes } = config;
  const { onCapture } = useCapture();
  const resultRef = useRef<HTMLDivElement>(null);

  // 결과 공유하기
  const handleShare = () => {
    onCapture(resultRef as React.RefObject<HTMLElement>, {
      fileName: 'result.png',
      shareTitle: '축하합니다! 🎉',
    });
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <Button
          onClick={onReset}
          variant="outline"
          className="text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          다시 만들기
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          className="text-foreground hover:bg-muted"
        >
          <Share2 className="h-4 w-4 mr-2" />
          공유하기
        </Button>
        <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {names.length}명 참가 • {prizes.length}개 상품
        </div>
      </div>

      <div
        className="bg-surface-card rounded-xl shadow-sm border border-border p-6 overflow-hidden"
        ref={resultRef}
      >
        <div className="h-[600px]">
          <LadderComponent ladder={ladder} names={names} prizes={prizes} />
        </div>
      </div>

      <LadderResultComponent results={results} />
    </div>
  );
};

export default LadderGameSectionComponent;
