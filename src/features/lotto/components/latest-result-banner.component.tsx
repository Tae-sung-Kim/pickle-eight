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
import { getBallRange, LottoUtils } from '@/features/lotto/utils/lotto.util';

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
      <section
        aria-busy="true"
        className="animate-pulse rounded-panel bg-jar p-5 md:p-7"
      >
        <div className="h-4 w-32 rounded bg-jar-foreground/15" />
        <div className="mt-3 h-8 w-52 rounded bg-jar-foreground/15" />
        <div className="mt-6 flex gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="size-11 rounded-full bg-jar-foreground/15"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!latestFullDraw) return null;

  return (
    <>
      <section className="rounded-panel bg-jar p-5 text-jar-foreground md:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-jar-muted">
              {latestFullDraw.drawDate} 추첨
            </p>
            <h2 className="mt-1 text-2xl font-extrabold md:text-3xl">
              {latestFullDraw.drawNumber}회 당첨 번호
            </h2>
          </div>
          {!isAlreadyOnCheckPage && !hasSavedNumbers && (
            <Button
              variant="secondary"
              onClick={() => setIsDialogOpen(true)}
              className="self-start sm:self-auto"
            >
              당첨 확인하기
            </Button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {latestFullDraw.numbers.map((num, i) => (
            <LottoBallComponent
              key={num}
              number={num}
              size="lg"
              className="ball-drop"
              style={{ '--i': i } as React.CSSProperties}
            />
          ))}
          <span className="mx-1 text-xl text-jar-muted" aria-hidden="true">
            +
          </span>
          <div className="flex items-center gap-2">
            <LottoBallComponent
              number={latestFullDraw.bonusNumber}
              isBonus
              size="lg"
              className="ball-drop"
              style={{ '--i': 6 } as React.CSSProperties}
            />
            <span className="text-sm text-jar-muted">보너스</span>
          </div>
        </div>

        {!isOnMyNumbersPage &&
          !isAlreadyOnCheckPage &&
          myEntries.length > 0 && (
            <div className="mt-6 border-t border-jar-foreground/15 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">내 번호</p>
                <Link
                  href="/lotto/my-numbers"
                  className="text-xs text-jar-muted underline-offset-4 transition-colors hover:text-jar-foreground hover:underline"
                >
                  {myEntries.length > visibleEntries.length
                    ? `외 ${myEntries.length - visibleEntries.length}개 전체 보기`
                    : '나의 번호 보기'}
                </Link>
              </div>
              <ul className="mt-3 space-y-2.5">
                {visibleEntries.map(({ set, rank, waitingDrawNumber }) => (
                  <li
                    key={set.id ?? set.numbers.join('-')}
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    {set.numbers.map((n) => {
                      // 추첨 전 번호는 최신 회차와 비교하지 않는다
                      const isMatched =
                        rank !== null && latestFullDraw.numbers.includes(n);
                      const isBonusMatched =
                        rank !== null && latestFullDraw.bonusNumber === n;
                      return isMatched || isBonusMatched ? (
                        <LottoBallComponent
                          key={n}
                          number={n}
                          isBonus={isBonusMatched && !isMatched}
                          size="sm"
                        />
                      ) : (
                        <span
                          key={n}
                          data-range={getBallRange(n)}
                          className="flex size-7 items-center justify-center rounded-full border border-jar-foreground/20 text-xs tabular-nums text-jar-muted"
                        >
                          {n}
                        </span>
                      );
                    })}
                    <span
                      className={`ml-1.5 text-xs ${
                        rank !== null && rank > 0
                          ? 'font-bold text-warning'
                          : 'text-jar-muted'
                      }`}
                    >
                      {rank === null
                        ? `${waitingDrawNumber}회 추첨 대기`
                        : rank > 0
                          ? `${rank}등 당첨`
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
