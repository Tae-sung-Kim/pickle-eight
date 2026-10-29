'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
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
import { useMyNumberSetsQuery } from '@/features/lotto/queries/use-lotto-user.query';
import {
  LOTTO_BONUS_COLOR,
  LottoUtils,
} from '@/features/lotto/utils/lotto.util';

/** 배너에 미리 보여주는 내 번호 최대 개수 */
const MY_NUMBERS_PREVIEW_COUNT = 3;

export function LatestResultBannerComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: latestDraw } = useLatestLottoDrawQuery();
  const { data: latestFullDraw, isLoading: isLatestLoading } =
    useLottoDrawByNumberQuery(latestDraw?.lastDrawNumber);

  const { data: mySets = [] } = useMyNumberSetsQuery();

  const isAlreadyOnCheckPage = pathname === '/lotto/check';
  const isOnMyNumbersPage = pathname === '/lotto/my-numbers';
  const hasSavedNumbers = mySets.length > 0;

  // 저장 번호 전체: 최신 회차에 유효하면 등수, 아직 추첨 전이면 대기 회차.
  // 당첨된 것 → 추첨 대기 → 미당첨 순
  const myEntries = useMemo(() => {
    if (!latestFullDraw) return [];
    const draw = latestFullDraw;
    return mySets
      .map((set) => {
        if (!LottoUtils.isNumberSetValidForDraw(set, draw)) {
          return {
            set,
            rank: null,
            waitingDrawNumber: set.startDrawNumber ?? draw.drawNumber + 1,
            order: 10,
          };
        }
        const { rank } = LottoUtils.checkTicket(draw, { numbers: set.numbers });
        return {
          set,
          rank,
          waitingDrawNumber: null,
          order: rank > 0 ? rank : 20,
        };
      })
      .sort((a, b) => a.order - b.order);
  }, [mySets, latestFullDraw]);
  const visibleEntries = myEntries.slice(0, MY_NUMBERS_PREVIEW_COUNT);

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
          {!isAlreadyOnCheckPage && !hasSavedNumbers && (
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
          <span className="mx-1 text-xl text-muted-foreground">+</span>
          <div className="flex items-center gap-2">
            <LottoBallComponent number={latestFullDraw.bonusNumber} isBonus />
            <span className="text-sm text-muted-foreground">보너스</span>
          </div>
        </div>

        {!isOnMyNumbersPage &&
          !isAlreadyOnCheckPage &&
          myEntries.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">내 번호</p>
                <Link
                  href="/lotto/my-numbers"
                  className="text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  {myEntries.length > visibleEntries.length
                    ? `외 ${myEntries.length - visibleEntries.length}개 · 전체 보기`
                    : '나의 번호'}
                </Link>
              </div>
              <ul className="mt-3 space-y-2">
                {visibleEntries.map(({ set, rank, waitingDrawNumber }) => (
                  <li
                    key={set.id ?? set.numbers.join('-')}
                    className="flex flex-wrap items-center gap-2"
                  >
                    {set.numbers.map((n) => {
                      // 추첨 전 번호는 최신 회차와 비교하지 않는다
                      const isMatched =
                        rank !== null && latestFullDraw.numbers.includes(n);
                      const isBonusMatched =
                        rank !== null && latestFullDraw.bonusNumber === n;
                      return (
                        <span
                          key={n}
                          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                            isMatched
                              ? 'border-primary bg-primary font-bold text-primary-foreground'
                              : isBonusMatched
                                ? `${LOTTO_BONUS_COLOR} font-bold`
                                : 'border-border bg-muted text-muted-foreground'
                          }`}
                        >
                          {n}
                        </span>
                      );
                    })}
                    <span
                      className={`ml-1 text-xs ${
                        rank !== null && rank > 0
                          ? 'font-semibold text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {rank === null
                        ? `${waitingDrawNumber}회 추첨 대기`
                        : rank > 0
                          ? `${rank}등`
                          : '미당첨'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
