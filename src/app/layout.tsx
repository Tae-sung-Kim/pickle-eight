import type { Metadata, Viewport } from 'next';
import { FooterLayout, HeaderLayout } from '@/components';
import { Toaster } from 'sonner';
import './globals.css';
import AnalyticsClientComponent from '@/components/analytics-client.component';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// export const metadata: Metadata = {
//   title: 'Pickle - 랜덤 추첨과 게임의 모든 것',
//   description:
//     '이름 추첨, 자리 배정, 로또 분석 등 다양한 랜덤 추첨 도구를 한 곳에서 편리하게 이용해보세요!',
// };

export const metadata: Metadata = {
  title: 'Pickle-eight : 랜덤 추첨과 게임의 모든 것',
  description:
    '항목 추첨, 자리 배정, 사다리 타기, 주사위 굴리기, 로또 번호 추천 등 다양한 랜덤 추첨 도구를 한 곳에서 편리하게 이용해보세요!',
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
  ],
  alternates: {
    canonical: 'https://pickle-eight.vercel.app',
  },
  openGraph: {
    title: 'Pickle-eight : 랜덤 추첨과 게임의 모든 것',
    description:
      '이름(상품) 추첨, 자리 배정, 사다리 타기, 주사위 굴리기, 로또 번호 추천 등 다양한 랜덤 추첨 도구를 한 곳에서 편리하게 이용해보세요!',
    url: 'https://pickle-eight.vercel.app',
    siteName: 'Pickle-eight',
    // images: [
    //   {
    //     url: 'https://your-domain.com/og-image.png',
    //     width: 1200,
    //     height: 630,
    //   },
    // ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pickle-eight : 랜덤 추첨과 게임의 모든 것',
    description:
      '이름 추첨, 자리 배정, 로또 분석 등 다양한 랜덤 추첨 도구를 한 곳에서 편리하게 이용해보세요!',
    // images: ['https://your-domain.com/og-image.png'],
  },
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
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <HeaderLayout />
        <main className="flex-1 py-8">
          {/* 상하 패딩 추가 */}
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* 자식 요소들 간의 간격을 일관되게 유지 */}
            {children}
          </div>
        </main>
        <FooterLayout />
        <Toaster />
        {/* firebase 하루 유입량 */}
        <AnalyticsClientComponent />
      </body>
    </html>
  );
}
