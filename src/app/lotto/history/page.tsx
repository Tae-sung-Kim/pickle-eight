import { LottoHistoryComponent } from './components';
import { Metadata } from 'next';
import { generateOgImageUrl } from '@/utils';
import { LottoWarningAlertComponent } from '@/components/lotto-warning-alert.component';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '로또 당첨 결과 히스토리 - 회차별 당첨번호 조회',
  description:
    '회차별 로또 당첨번호와 보너스 번호, 1등 당첨 인원 등 기록을 범위로 조회하세요. 최신 회차 기준으로 빠르게 확인할 수 있습니다.',
  keywords: [
    '로또',
    '로또히스토리',
    '로또당첨결과',
    '로또당첨번호',
    '로또조회',
  ],
  openGraph: {
    title: '로또 당첨 결과 히스토리 - 회차별 당첨번호 조회',
    description:
      '회차별 로또 당첨번호와 보너스 번호, 1등 당첨 인원 등 기록을 범위로 조회하세요.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/lotto/history',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    images: [
      generateOgImageUrl(
        '로또 당첨 결과 히스토리 - 회차별 당첨번호 조회',
        '회차별 로또 당첨번호와 보너스 번호, 1등 당첨 인원 등 기록을 범위로 조회하세요.',
        '로또 당첨 결과 히스토리'
      ),
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '로또 당첨 결과 히스토리 - 회차별 당첨번호 조회',
    description:
      '회차별 로또 당첨번호와 보너스 번호, 1등 당첨 인원 등 기록을 범위로 조회하세요.',
    images: [
      generateOgImageUrl(
        '로또 당첨 결과 히스토리 - 회차별 당첨번호 조회',
        '회차별 로또 당첨번호와 보너스 번호, 1등 당첨 인원 등 기록을 범위로 조회하세요.',
        '로또 당첨 결과 히스토리'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/lotto/history',
  },
};

export default function LottoHistoryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-2">
        <Link
          href="/lotto"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; 로또 허브
        </Link>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            로또 당첨 결과 히스토리
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            회차 범위를 입력해 조회하세요.
          </p>
        </div>
      </div>

      <LottoWarningAlertComponent
        className="mt-4"
        tone="danger"
        includeAgeNotice
      />

      <LottoHistoryComponent />
    </div>
  );
}
