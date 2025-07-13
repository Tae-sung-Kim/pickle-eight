'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LadderComponent } from './ladder.component';
import { LadderResultComponent } from './ladder-result.component';
import { LadderGameSectionComponentPropsType } from '@/types';

export const LadderGameSectionComponent = ({
  ladder,
  config,
  onReset,
  results,
}: LadderGameSectionComponentPropsType) => {
  const { names, prizes } = config;

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <Button
          onClick={onReset}
          variant="outline"
          className="text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          다시 만들기
        </Button>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
          {names.length}명 참가 • {prizes.length}개 상품
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden">
        <div className="h-[600px]">
          <LadderComponent ladder={ladder} names={names} prizes={prizes} />
        </div>
      </div>

      <LadderResultComponent results={results} />
    </div>
  );
};

export default LadderGameSectionComponent;
