import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { FooterLayout } from '@/components/layouts/footer.layout';
import { HeaderLayout } from '@/components/layouts/header.layout';
import { LoadingComponent } from '@/components/loading.component';
import {
  buildKeywords,
  GLOBAL_KEYWORDS,
} from '@/constants/seo-keywords.constant';
import {
  jsonLdOrganization,
  jsonLdWebSite,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo';
import { ConsentProvider } from '@/providers/consent.provider';
import { QueryClientProviderWrapper } from '@/providers/query-client.provider';
import './globals.css';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { AdFitSlotComponent } from '@/features/ad/components/adfit-slot.component';
import { CookieConsentComponent } from '@/features/consent/components/cookie-consent.component';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} : 로또 번호 생성 · 분석 · 채점의 모든 것`,
  },
  icons: {
    icon: '/icon.svg',
  },
  description:
    '로또 번호 생성, 회차별 당첨 결과 조회, 번호 채점, 통계 분석, 시뮬레이터를 무료로 이용하세요.',
  keywords: buildKeywords(['운빨연구소', '운빨 로또'], GLOBAL_KEYWORDS),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: {
      template: `%s | ${SITE_NAME}`,
      default: `${SITE_NAME} : 로또 번호 생성 · 분석 · 채점의 모든 것`,
    },
    description:
      '로또 번호 생성, 회차별 당첨 결과 조회, 번호 채점, 통계 분석, 시뮬레이터를 무료로 이용하세요.',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/og-image.svg`,
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
      default: `${SITE_NAME} : 로또 번호 생성 · 분석 · 채점의 모든 것`,
    },
    description:
      '로또 번호 생성, 회차별 당첨 결과 조회, 번호 채점, 통계 분석, 시뮬레이터를 무료로 이용하세요.',
    images: [`${SITE_URL}/og-image.svg`],
  },
  authors: [
    {
      name: 'Tae-sung-Kim',
      url: 'https://github.com/Tae-sung-Kim',
    },
  ],
  robots: 'index,follow',
  category: '엔터테인먼트, 도구, 로또',
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
            <LoadingComponent />
            <CookieConsentComponent />
          </ConsentProvider>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}
