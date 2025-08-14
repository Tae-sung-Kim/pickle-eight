import { Metadata } from 'next';
import { LottoNumberComponent } from './components';
import { generateOgImageUrl } from '@/utils';

export const metadata: Metadata = {
  title: '로또 번호 생성기 - 추천하는 행운의 번호',
  description:
    '추천하는 행운의 로또 번호로 당첨의 기회를 잡아보세요! 무작위 생성 및 통계 기반 추천 번호를 제공합니다.',
  keywords: [
    '로또',
    '로또번호생성',
    '로또추첨',
    '로또번호추천',
    '무료로또번호',
  ],
  openGraph: {
    title: '로또 번호 생성기 - 추천하는 행운의 번호',
    description: '추천하는 행운의 로또 번호로 당첨의 기회를 잡아보세요!',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    images: [
      generateOgImageUrl(
        '로또 번호 생성기 - 추천하는 행운의 번호',
        '추천하는 행운의 로또 번호로 당첨의 기회를 잡아보세요!',
        '로또 번호 생성기'
      ),
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '로또 번호 생성기 - 추천하는 행운의 번호',
    description: '추천하는 행운의 로또 번호로 당첨의 기회를 잡아보세요!',
    images: [
      generateOgImageUrl(
        '로또 번호 생성기 - 추천하는 행운의 번호',
        '추천하는 행운의 로또 번호로 당첨의 기회를 잡아보세요!',
        '로또 번호 생성기'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

export default function LottoPage() {
  return <LottoNumberComponent />;
}
