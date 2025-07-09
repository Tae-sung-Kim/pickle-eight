import type { Metadata, Viewport } from 'next';
import { FooterLayout, HeaderLayout } from '@/components';
import { Toaster } from 'sonner';
import './globals.css';
import AnalyticsClientComponent from '@/components/analytics-client.component';
import { QueryClientProviderWrapper } from '@/providers/query-client.provider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_SITE_NAME} : 랜덤 추첨과 게임의 모든 것`,
  description: `온라인에서 쉽고 빠르게 이름, 상품, 자리, 메뉴, 사다리, 주사위 등 다양한 항목을 랜덤으로 추첨하고 결과를 공유하세요. 경품 추첨, 자리 배정, 팀 나누기, 오늘의 운세, 메뉴 추천, 빈칸 채우기 퀴즈, 숫자 맞추기 게임 등 다양한 랜덤 도구와 재미있는 게임을 ${process.env.NEXT_PUBLIC_SITE_NAME}에서 무료로 즐겨보세요!`,
  keywords: [
    '이름',
    '상품',
    '랜덤',
    '추첨',
    '로또',
    '자리배정',
    '사다리',
    '게임',
    '점심',
    '저녁',
    '메뉴',
    '주사위',
    '운세',
    'Pickle',
    '추첨기',
    '추첨도구',
    '랜덤게임',
    '랜덤추첨기',
    '자동추첨',
    '경품추첨',
    '자리추첨',
    '자리배정기',
    '사다리게임',
    '사다리타기',
    '메뉴추천',
    '점심메뉴추천',
    '저녁메뉴추천',
    '오늘의운세',
    '빈칸채우기게임',
    '숫자맞추기',
    '순서정하기',
    '팀배정',
    '팀나누기',
    '랜덤팀',
    '회식장소추천',
    '모임추천',
    '이벤트추첨',
    '온라인추첨',
    '모바일추첨',
    '무료추첨',
    '실시간추첨',
    '랜덤선택',
    '랜덤추천',
    '챗GPT게임',
    '챗GPT추천',
    'AI추천',
    'AI게임',
    '소셜게임',
    '파티게임',
    '술자리게임',
    '모임게임',
    '간편추첨',
    '빠른추첨',
    '랭킹게임',
    '점수게임',
    '빈칸퀴즈',
    '사자성어퀴즈',
    '영단어퀴즈',
    '상식퀴즈',
    '속담퀴즈',
    // '로또 번호 분석',
    // '로또 당첨 번호 통계',
    '랜덤 자리 배정',
    '랜덤 팀 나누기',
    '사다리 타기 결과 공유',
    // '추첨 결과 캡처',
    '메뉴 랜덤 추천',
    '챗GPT 연동 게임',
    '모바일 추첨',
    // '광고 없는 프리미엄',
    // '커스텀 테마',
    '유저 랭킹',
    '점수 기반 게임',
    '빈칸 채우기 챌린지',
  ],
  alternates: {
    canonical: 'https://pickle-eight.vercel.app',
  },
  openGraph: {
    title: `${process.env.NEXT_PUBLIC_SITE_NAME} : 랜덤 추첨과 게임의 모든 것`,
    description:
      '이름(상품) 추첨, 자리 배정, 사다리 타기, 주사위 굴리기, 로또 번호 추천 등 다양한 랜덤 추첨 도구를 한 곳에서 편리하게 이용해보세요! 경품 추첨, 자리 배정, 팀 나누기, 오늘의 운세, 메뉴 추천 등 다양한 기능 제공.',
    url: 'https://pickle-eight.vercel.app',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    // images: [
    //   {
    //     url: 'https://pickle-eight.vercel.app/og-image.png',
    //     width: 1200,
    //     height: 630,
    //     alt: 'Pickle-eight 대표 이미지',
    //   },
    // ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${process.env.NEXT_PUBLIC_SITE_NAME} : 랜덤 추첨과 게임의 모든 것`,
    description:
      '온라인에서 쉽고 빠르게 이름, 상품, 자리, 메뉴, 사다리, 주사위 등 다양한 항목을 랜덤으로 추첨하고 결과를 공유하세요.',
    // images: ['https://pickle-eight.vercel.app/og-image.png'],
  },
  authors: [{ name: process.env.NEXT_PUBLIC_SITE_NAME + ' Team' }],
  robots: 'index,follow',
  category: '게임, 엔터테인먼트, 추첨, 도구',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <meta
          name="naver-site-verification"
          content="3b2951ae643e0dd91af8ba5dedd85cb450a7018a"
        />
        <meta
          name="google-site-verification"
          content="GriA50nFO1IDBuetooOWR6mLwK6HtmFcwURDYgz6AbI"
        />
        <meta
          name="author"
          content={process.env.NEXT_PUBLIC_SITE_NAME + ' Team'}
        />
        <meta name="robots" content="index,follow" />
        <meta name="subject" content="랜덤 추첨 및 게임 플랫폼" />
        <meta name="copyright" content={process.env.NEXT_PUBLIC_SITE_NAME} />
        <meta name="rating" content="general" />
        <meta name="category" content="게임, 엔터테인먼트, 추첨, 도구" />
        <meta property="og:locale:alternate" content="en_US" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <QueryClientProviderWrapper>
          <HeaderLayout />
          <main className="flex-1 py-8">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <FooterLayout />
          <Toaster />
          <AnalyticsClientComponent />
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}
