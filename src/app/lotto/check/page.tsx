import { Metadata } from 'next';
import { LottoCheckComponent } from './components';
import { LottoWarningAlertComponent } from '@/components';
import { generateOgImageUrl } from '@/utils';

export const metadata: Metadata = {
  title: '로또 번호 채점기 - 당첨 등수 확인',
  description:
    '회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 빠르게 확인하세요. 실시간 채점과 결과 요약을 제공합니다.',
  keywords: ['로또', '로또채점', '로또번호확인', '로또당첨확인', '로또조회'],
  openGraph: {
    title: '로또 번호 채점기 - 당첨 등수 확인',
    description:
      '회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 빠르게 확인하세요. 실시간 채점과 결과 요약을 제공합니다.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/lotto/check',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    images: [
      generateOgImageUrl(
        '로또 번호 채점기 - 당첨 등수 확인',
        '회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 빠르게 확인하세요. 실시간 채점과 결과 요약을 제공합니다.',
        '로또 번호 채점기'
      ),
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '로또 번호 채점기 - 당첨 등수 확인',
    description:
      '회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 빠르게 확인하세요. 실시간 채점과 결과 요약을 제공합니다.',
    images: [
      generateOgImageUrl(
        '로또 번호 채점기 - 당첨 등수 확인',
        '회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 빠르게 확인하세요. 실시간 채점과 결과 요약을 제공합니다.',
        '로또 번호 채점기'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/lotto/check',
  },
};

export default function LottoCheckPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">로또 번호 채점기</h1>
      <p className="text-sm text-muted-foreground mt-1">
        회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 확인하세요.
      </p>

      <LottoWarningAlertComponent
        className="mt-4"
        tone="danger"
        includeAgeNotice
      />

      <LottoCheckComponent />
    </div>
  );
}
