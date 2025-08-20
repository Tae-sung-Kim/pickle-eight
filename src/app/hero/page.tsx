import { HeroBanner, HeroTodayMessageComponent } from './components';
import { Metadata } from 'next';
import { generateOgImageUrl } from '@/utils';

export const metadata: Metadata = {
  title: '오늘의 추천 · 메시지 - Pickle Eight',
  description:
    '오늘의 추천 문구와 메시지를 확인하고 랜덤 도구들을 시작해 보세요.',
  keywords: ['오늘의 추천', '메시지', '추천 문구', '랜덤 추천', 'pickle eight'],
  openGraph: {
    title: '오늘의 추천 · 메시지 - Pickle Eight',
    description:
      '오늘의 추천 문구와 메시지를 확인하고 랜덤 도구들을 시작해 보세요.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/hero',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '오늘의 추천 · 메시지 - Pickle Eight',
        '오늘의 추천 문구와 메시지를 확인하고 랜덤 도구들을 시작해 보세요.',
        '오늘의 추천'
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '오늘의 추천 · 메시지 - Pickle Eight',
    description:
      '오늘의 추천 문구와 메시지를 확인하고 랜덤 도구들을 시작해 보세요.',
    images: [
      generateOgImageUrl(
        '오늘의 추천 · 메시지 - Pickle Eight',
        '오늘의 추천 문구와 메시지를 확인하고 랜덤 도구들을 시작해 보세요.',
        '오늘의 추천'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/hero',
  },
};

export default function HeroPage() {
  return (
    <>
      <HeroBanner />
      <HeroTodayMessageComponent />
    </>
  );
}
