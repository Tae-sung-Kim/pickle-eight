import type { Metadata, Viewport } from 'next';
import {
  LoadingComponent,
  AnalyticsClientComponent,
  CookieConsentComponent,
  FooterLayout,
  HeaderLayout,
  AdFitSlotComponent,
  JsonLdComponent,
} from '@/components';
import { Toaster } from 'sonner';
import {
  QueryClientProviderWrapper,
  ConsentProvider,
  AuthProvider,
  AgeGateProvider,
} from '@/providers';
import { jsonLdWebSite, jsonLdOrganization, SITE_NAME, SITE_URL } from '@/lib';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} : 랜덤(random) 추첨, 게임, 로또, AI 퀴즈의 모든 것`,
  },
  icons: {
    icon: '/icon.svg',
  },
  description: `온라인에서 쉽고 빠르게 이름, 상품, 자리, 메뉴, 사다리, 주사위 등 다양한 항목을 랜덤으로 추첨하고 결과를 공유하세요. 경품 추첨, 자리 배정, 팀 나누기, 오늘의 운세, 메뉴 추천, 빈칸 채우기 퀴즈, 숫자 맞추기 게임 등 다양한 랜덤 도구와 재미있는 게임을 ${SITE_NAME}에서 무료로 즐겨보세요!`,
  keywords: [
    '로또',
    '로또 채점',
    '로또 당첨 확인',
    '로또 당첨 결과 조회',
    '로또 번호 자동 생성',
    '로또 번호 추천',
    '로또 번호 분석',
    '로또 통계 분석',
    '로또 회차 조회',
    '로또 보너스 번호',
    '로또 실시간 결과',
    '경품 추첨기',
    '이벤트 추첨기',
    '이름 랜덤 추첨',
    '이름 뽑기',
    '범위 랜덤 추첨',
    '자리 랜덤 배정',
    '팀 나누기 랜덤',
    '조 편성 랜덤',
    '사다리타기',
    '주사위 굴리기',
    '파티게임',
    '점심 메뉴 추천',
    '저녁 메뉴 추천',
    '술안주 추천',
    '오늘 뭐 먹지',
    '오늘의 운세',
    '숫자 맞추기 게임',
    '빈칸 채우기 퀴즈',
    '사자성어 퀴즈',
    '영단어 퀴즈',
    '상식 퀴즈',
    '속담 퀴즈',
    '결과 캡처',
    '운빨연구소',
    '운빨랜덤',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: {
      template: `%s | ${SITE_NAME}`,
      default: `${SITE_NAME} : 랜덤(random) 추첨, 게임, 로또, AI 퀴즈의 모든 것`,
    },
    description:
      '이름(상품) 추첨, 자리 배정, 사다리 타기, 주사위 굴리기, 로또 번호 생성, 로또 번호 추천, 로또 결과 등 다양한 랜덤 추첨 도구를 한 곳에서 편리하게 이용해보세요! 경품 추첨, 자리 배정, 팀 나누기, 오늘의 운세, 메뉴 추천, 시간대별 추천 메뉴, 할일, 시간대별 할일 등 다양한 기능 제공.',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: SITE_URL + '/og-image.svg',
        width: 1200,
        height: 630,
        alt: '운빨연구소 대표 이미지',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      template: `%s | ${SITE_NAME}`,
      default: `${SITE_NAME} :  랜덤(random) 추첨, 게임, 로또, AI 퀴즈의 모든 것`,
    },
    description:
      '온라인에서 쉽고 빠르게 이름, 상품, 자리, 사다리, 주사위, 할일, 행운, 응원, 메뉴 등 다양한 항목을 랜덤으로 추첨하고 결과를 공유하세요.',
    images: [SITE_URL + '/og-image.svg'],
  },
  authors: [
    {
      name: 'Tae-sung-Kim',
      url: 'https://github.com/Tae-sung-Kim',
    },
  ],
  robots: 'index,follow',
  category: '게임, 엔터테인먼트, 추첨, 도구, 할일, 메뉴',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta
          name="naver-site-verification"
          content="3b2951ae643e0dd91af8ba5dedd85cb450a7018a"
        />
        {/* JSON-LD: WebSite + Organization */}
        <JsonLdComponent data={[jsonLdWebSite(), jsonLdOrganization()]} />
      </head>
      <body className="flex flex-col bg-background text-foreground antialiased min-h-screen">
        <QueryClientProviderWrapper>
          <ConsentProvider>
            <AuthProvider>
              <AgeGateProvider>
                <HeaderLayout />
                {/* 모바일 상단 전용 배너 (데스크톱에서는 숨김: 컴포넌트 내부 md:hidden) */}
                <div className="w-full flex justify-center p-6 pb-0">
                  <AdFitSlotComponent />
                </div>
                <main className="flex-1 py-8">
                  <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                  </div>
                </main>
                <FooterLayout />
                <Toaster />
                <AnalyticsClientComponent />
                <LoadingComponent />
                <CookieConsentComponent />
              </AgeGateProvider>
            </AuthProvider>
          </ConsentProvider>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}
