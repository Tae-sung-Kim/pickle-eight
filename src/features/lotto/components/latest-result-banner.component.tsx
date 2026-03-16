'use client';

import {
  useLatestLottoDrawQuery,
  useLottoDrawByNumberQuery,
} from '@/features/lotto/queries/use-lotto.query';
import { LottoBallComponent } from '@/features/lotto/components/ball.component';
import { Plus } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function LatestResultBannerComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: latestDraw } = useLatestLottoDrawQuery();
  const { data: latestFullDraw, isLoading: isLatestLoading } =
    useLottoDrawByNumberQuery(latestDraw?.lastDrawNumber);

  // 현재 페이지가 이미 당첨 확인 페이지인 경우 배너를 클릭해도 팝업을 띄우지 않고 닫힌 상태 유지
  const isAlreadyOnCheckPage = pathname === '/lotto/check';

  const handleBannerClick = () => {
    if (isAlreadyOnCheckPage) return;
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    setIsDialogOpen(false);
    router.push('/lotto/check');
  };

  if (isLatestLoading) {
    return (
      <section className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50 p-6 sm:p-8 animate-pulse mb-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 w-24 bg-gray-200 rounded-full" />
            <div className="h-8 w-32 bg-gray-200 rounded-md" />
            <div className="h-4 w-40 bg-gray-200 rounded-md" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-12 w-12 rounded-full bg-gray-200" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!latestFullDraw) return null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleBannerClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleBannerClick();
          }
        }}
        className={`group block relative overflow-hidden rounded-xl border-2 border-primary/10 bg-gradient-to-br from-white to-emerald-50/30 p-6 sm:p-8 mb-6 transition-all ${isAlreadyOnCheckPage ? 'cursor-default' : 'hover:border-primary/40 hover:shadow-md active:scale-[0.99] cursor-pointer'}`}
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div
            className={`space-y-1.5 text-center sm:text-left transition-transform ${isAlreadyOnCheckPage ? '' : 'group-hover:translate-x-1'}`}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              최신 당첨 결과{isAlreadyOnCheckPage ? '' : ' 확인하기'}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              제{' '}
              <span className="text-primary">{latestFullDraw.drawNumber}</span>
              회
            </h2>
            <p
              className={`text-sm text-muted-foreground transition-colors ${isAlreadyOnCheckPage ? '' : 'group-hover:text-primary/70'}`}
            >
              추첨일: {latestFullDraw.drawDate}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <div className="flex gap-2 sm:gap-3">
              {latestFullDraw.numbers.map((num, idx) => (
                <LottoBallComponent key={idx} number={num} index={idx} />
              ))}
            </div>
            <div className="mx-1 flex h-12 items-center justify-center text-muted-foreground/40 sm:mx-2">
              <Plus className="size-5" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <LottoBallComponent
                number={latestFullDraw.bonusNumber}
                index={6}
                isBonus
              />
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                Bonus
              </span>
            </div>
          </div>
        </div>
      </div>

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
