'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LottoBallComponent } from './lotto-ball.component';
import { LottoNumberListPropsType } from '@/types';

export function LottoNumberListComponent({
  numbersList,
  title = '생성된 로또 번호',
}: LottoNumberListPropsType) {
  if (numbersList.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted">
        <p className="text-muted-foreground">생성된 로또 번호가 없습니다.</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
        <CardTitle className="text-xl font-bold text-pink-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
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
