import { Toaster } from 'sonner';
import HeroPage from './hero/page';
import HomePage from './home/page';
import { Metadata } from 'next';
import { generateOgImageUrl } from '@/utils';

export const metadata: Metadata = {
  title: 'Pickle Eight - 랜덤 추첨·로또·자리배정·퀴즈',
  description:
    '로또 번호 생성/분석, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈, 추천 등 다양한 랜덤 도구를 무료로 사용하세요.',
  keywords: [
    '랜덤',
    '로또',
    '이름 추첨',
    '자리 배정',
    '사다리',
    '주사위',
    '퀴즈',
    '추천',
    'pickle eight',
  ],
  openGraph: {
    title: 'Pickle Eight - 랜덤 추첨·로또·자리배정·퀴즈',
    description:
      '로또 번호 생성/분석, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈, 추천 등 다양한 랜덤 도구를 무료로 사용하세요.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        'Pickle Eight - 랜덤 추첨·로또·자리배정·퀴즈',
        '로또 번호 생성/분석, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈, 추천 등 다양한 랜덤 도구를 무료로 사용하세요.',
        'Pickle Eight'
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pickle Eight - 랜덤 추첨·로또·자리배정·퀴즈',
    description:
      '로또 번호 생성/분석, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈, 추천 등 다양한 랜덤 도구를 무료로 사용하세요.',
    images: [
      generateOgImageUrl(
        'Pickle Eight - 랜덤 추첨·로또·자리배정·퀴즈',
        '로또 번호 생성/분석, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈, 추천 등 다양한 랜덤 도구를 무료로 사용하세요.',
        'Pickle Eight'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/',
  },
};

export default function RootPage() {
  return (
    <>
      <div className="bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 flex flex-col">
        <div className="max-w-5xl mx-auto w-full px-4 py-10">
          <HeroPage />
          <HomePage />
        </div>
      </div>
      <Toaster />
    </>
  );
}
