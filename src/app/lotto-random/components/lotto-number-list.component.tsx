'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LottoBallComponent from './lotto-ball.component';
import { LottoNumberListPropsType } from '@/types';

export function LottoNumberListComponent({
  numbersList,
  title = '생성된 로또 번호',
}: LottoNumberListPropsType) {
  if (numbersList.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {numbersList.map((numbers, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground">
                  {index + 1}번
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <LottoBallComponent numbers={numbers} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default LottoNumberListComponent;
