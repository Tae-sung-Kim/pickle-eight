'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LottoBallComponent } from '@/features/lotto/components/ball.component';
import {
  useLatestLottoDrawQuery,
  useLottoDrawByNumberQuery,
} from '@/features/lotto/queries/use-lotto.query';

export function LatestResultBannerComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: latestDraw } = useLatestLottoDrawQuery();
  const { data: latestFullDraw, isLoading: isLatestLoading } =
    useLottoDrawByNumberQuery(latestDraw?.lastDrawNumber);

  const isAlreadyOnCheckPage = pathname === '/lotto/check';

  const handleConfirm = () => {
    setIsDialogOpen(false);
    router.push('/lotto/check');
  };

  if (isLatestLoading) {
    return (
      <section className="animate-pulse border-y border-border py-6">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="mt-3 h-7 w-48 rounded bg-muted" />
        <div className="mt-5 flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-11 w-11 rounded-full bg-muted" />
          ))}
        </div>
      </section>
    );
  }

  if (!latestFullDraw) return null;

  return (
    <>
      <section className="border-y border-border py-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {latestFullDraw.drawDate} 추첨
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {latestFullDraw.drawNumber}회 당첨 번호
            </h2>
          </div>
          {!isAlreadyOnCheckPage && (
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              className="self-start sm:self-auto"
            >
              당첨 확인하기
            </Button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {latestFullDraw.numbers.map((num) => (
            <LottoBallComponent key={num} number={num} />
          ))}
          <span className="mx-2 h-8 w-px bg-border" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <LottoBallComponent number={latestFullDraw.bonusNumber} isBonus />
            <span className="text-sm text-muted-foreground">보너스</span>
          </div>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>당첨 확인 페이지로 이동</DialogTitle>
            <DialogDescription>
              해당 회차({latestFullDraw.drawNumber}회)의 자세한 당첨 내역과
              채점을 위해 당첨 확인 페이지로 이동하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleConfirm}>이동하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
