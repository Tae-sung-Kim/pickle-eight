import type { Metadata } from 'next';
import Link from 'next/link';
import type { LottoDrawType } from '@/types';
import { getLottoDrawByNumber } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
import { LottoWarningAlertComponent } from '@/components';

type Params = { draw: string };

function isValidDraw(draw: string): boolean {
  const n = Number(draw);
  if (!Number.isInteger(n)) return false;
  return n > 0 && n < 100000; // 상한은 임시 값
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { draw } = await params;
  const title = isValidDraw(draw)
    ? `로또 ${draw}회차 - 당첨번호 상세 | Pickle Eight`
    : '로또 회차 - 잘못된 회차 | Pickle Eight';
  const description = isValidDraw(draw)
    ? `${draw}회차 당첨 번호, 보너스 번호 및 간단 통계를 확인하세요.`
    : '요청하신 회차 값이 올바르지 않습니다.';
  return {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/lotto/${draw}`,
    },
  };
}

export default async function LottoDrawPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { draw } = await params;
  const valid = isValidDraw(draw);
  let data: LottoDrawType | null = null;
  if (valid) {
    try {
      data = await getLottoDrawByNumber(Number(draw));
    } catch (e) {
      console.log(e);
      data = null;
    }
  }

  const numbers = data?.numbers ?? [];
  const bonus = data?.bonusNumber;
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-4">
        <Link href="/lotto" className="text-sm text-primary hover:underline">
          ← 로또 허브로 돌아가기
        </Link>
      </div>
      <div className="mb-4">
        <LottoWarningAlertComponent tone="warning" includeAgeNotice />
      </div>

      {!valid && (
        <>
          <h1 className="text-2xl font-bold tracking-tight">잘못된 회차</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            요청하신 회차 값이 올바르지 않습니다.
          </p>
        </>
      )}
      {valid && !data && (
        <>
          <h1 className="text-2xl font-bold tracking-tight">{draw}회차 상세</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        </>
      )}
      {valid && data && (
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              {data.drawNumber}회차 상세
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              추첨일: {data.drawDate}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 flex-wrap">
              {numbers.map((n) => (
                <span
                  key={n}
                  className="h-12 w-12 rounded-full bg-muted text-foreground ring-1 ring-border flex items-center justify-center font-semibold shadow-sm"
                >
                  {n}
                </span>
              ))}
              <span className="text-xl text-muted-foreground">+</span>
              <span className="h-12 w-12 rounded-full bg-primary/20 text-primary ring-1 ring-primary/30 flex items-center justify-center font-semibold shadow-sm">
                {bonus}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {typeof data.firstWinCount === 'number' && (
                <div className="rounded-md border bg-surface-card p-4 border-border">
                  <div className="text-xs text-muted-foreground">
                    1등 당첨자 수
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {data.firstWinCount.toLocaleString()}명
                  </div>
                </div>
              )}
              {typeof data.firstPrizeAmount === 'number' && (
                <div className="rounded-md border bg-surface-card p-4 border-border">
                  <div className="text-xs text-muted-foreground">
                    1등 당첨금
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {data.firstPrizeAmount.toLocaleString()}원
                  </div>
                </div>
              )}
              {typeof data.totalSalesAmount === 'number' && (
                <div className="rounded-md border bg-surface-card p-4 border-border">
                  <div className="text-xs text-muted-foreground">
                    총 판매금액
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {data.totalSalesAmount.toLocaleString()}원
                  </div>
                </div>
              )}
            </div>

            {/* <div className="mt-8 flex flex-wrap items-center gap-2">
              <Link href="/lotto">
                <Button variant="secondary" size="sm">
                  돌아가기
                </Button>
              </Link>
              <Link href="/lotto/stats/frequency">
                <Button variant="outline" size="sm">
                  자주 나온 번호 보기
                </Button>
              </Link>
            </div> */}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
