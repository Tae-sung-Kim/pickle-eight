'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LottoNumberListPropsType } from '@/types';
import { useCapture } from '@/hooks';
import { useRef } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LottoBallComponent } from '@/components';

export function LottoNumberListComponent({
  numbersList,
  title = '생성된 로또 번호',
}: LottoNumberListPropsType) {
  const { onCapture } = useCapture();
  const resultRef = useRef<HTMLDivElement>(null);

  // 공유하기
  const handleShare = () => {
    onCapture(resultRef as React.RefObject<HTMLElement>, {
      fileName: 'result.png',
      shareTitle: '로또 번호 추첨 결과',
    });
  };

  if (numbersList.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted">
        <p className="text-muted-foreground">생성된 로또 번호가 없습니다.</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-xl font-bold text-pink-600">
          {title}
        </CardTitle>
        <Button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1 px-4 py-2 rounded-lg shadow bg-white/80 hover:bg-white transition z-10 text-pink-600 border border-pink-100"
        >
          <Share2 className="w-5 h-5" />
          공유하기
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2" ref={resultRef}>
          {numbersList.map((numbers, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-sm font-medium text-pink-600">
                    {index + 1}
                  </span>
                  <span className="font-medium text-muted-foreground">
                    {index + 1}번 세트
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {numbers.map((num, i) => (
                  <LottoBallComponent
                    key={i}
                    number={num}
                    index={i}
                    isBonus={i >= 6}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default LottoNumberListComponent;
