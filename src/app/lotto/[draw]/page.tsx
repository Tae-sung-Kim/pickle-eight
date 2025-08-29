import type { Metadata } from 'next';
import { LottoDrawType } from '@/types';
import { getLottoDrawByNumber } from '@/services';
import {
  BackHubPageComponent,
  ContentWrapperComponent,
  LottoWarningAlertComponent,
  JsonLd,
} from '@/components';
import { ReactElement } from 'react';
import { MENU_GROUP_NAME_ENUM } from '@/constants';
import { LottoDrawCardComponent } from './components';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';

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
  const valid = isValidDraw(draw);
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pickle-eight.vercel.app'
  ).replace(/\/+$/, '');
  const url = `${siteUrl}/${MENU_GROUP_NAME_ENUM.LOTTO}/${draw}`;
  const baseTitle = valid
    ? `로또 ${draw}회차 - 당첨번호 상세`
    : '로또 회차 - 잘못된 회차';
  const title = `${baseTitle} | Pickle Eight`;
  const description = valid
    ? `${draw}회차 당첨 번호, 보너스 번호, 추첨일 및 간단 통계를 확인하세요.`
    : '요청하신 회차 값이 올바르지 않습니다.';
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: valid
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: [{ url: '/og-image.svg' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.svg'],
    },
    keywords: valid
      ? [
          `로또 ${draw}회차`,
          '로또 당첨 번호',
          '로또 결과',
          '보너스 번호',
          '로또 통계',
        ]
      : ['로또 회차 오류', '잘못된 회차'],
  };
}

export default async function LottoDrawPage({
  params,
}: {
  params: Promise<Params>;
}): Promise<ReactElement> {
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
  const pageUrl = canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/${draw}`);
  const pageDescription = valid
    ? `${draw}회차 당첨 번호, 보너스 번호, 추첨일 및 간단 통계를 확인하세요.`
    : '요청하신 회차 값이 올바르지 않습니다.';

  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '로또 허브', item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}`) },
    { name: valid ? `${draw}회차` : '잘못된 회차', item: pageUrl },
  ]);

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: valid
      ? `로또 ${draw}회차 - 당첨번호 상세`
      : '로또 회차 - 잘못된 회차',
    url: pageUrl,
    description: pageDescription,
  } as const;

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.LOTTO}>
      <JsonLd data={[jsonLdWebSite(), crumbs, webPage]} />
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.LOTTO} />
      <LottoWarningAlertComponent
        className="mt-4"
        tone="warning"
        includeAgeNotice
      />

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
        <div className="mx-auto max-w-5xl p-8">
          <LottoDrawCardComponent
            drawNumber={data.drawNumber}
            drawDate={data.drawDate}
            numbers={numbers}
            bonusNumber={bonus}
            firstWinCount={data.firstWinCount}
            firstPrizeAmount={data.firstPrizeAmount}
            totalSalesAmount={data.totalSalesAmount}
          />
        </div>
      )}
    </ContentWrapperComponent>
  );
}
