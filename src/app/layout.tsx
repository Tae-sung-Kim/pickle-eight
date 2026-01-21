import { AnalyticsClientComponent } from '@/components/analytics-client.component';
import { FooterLayout } from '@/components/layouts/footer.layout';
import { HeaderLayout } from '@/components/layouts/header.layout';
import { LoadingComponent } from '@/components/loading.component';
import {
  GLOBAL_KEYWORDS,
  buildKeywords,
} from '@/constants/seo-keywords.constant';
import {
  SITE_NAME,
  SITE_URL,
  jsonLdOrganization,
  jsonLdWebSite,
} from '@/lib/seo';
import { AgeGateProvider } from '@/providers/age-gate.provider';
import { AuthProvider } from '@/providers/auth.provider';
import { ConsentProvider } from '@/providers/consent.provider';
import { QueryClientProviderWrapper } from '@/providers/query-client.provider';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { AdFitSlotComponent } from '@/components/shared/adfit/adfit-slot.component';
import { CookieConsentComponent } from '@/components/shared/consent/cookie-consent.component';

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
  keywords: buildKeywords(
    [
      '경품 추첨기',
      '이벤트 추첨기',
      '이름 랜덤 추첨',
      '이름 뽑기',
      '범위 랜덤 추첨',
      '자리 랜덤 배정',
      '팀 나누기 랜덤',
      '조 편성 랜덤',
      '사다리타기',
      '파티게임',
      '술안주 추천',
      '오늘의 운세',
      '속담 퀴즈',
      '결과 캡처',
      '운빨연구소',
      '운빨랜덤',
    ],
    GLOBAL_KEYWORDS
  ),
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
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
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
                  <AdFitSlotComponent fixed topOffsetPx={64} />
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
