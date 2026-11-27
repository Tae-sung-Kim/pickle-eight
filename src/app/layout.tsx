import type { Metadata, Viewport } from 'next';
import { LoadingComponent } from '@/components/common/loading.component';
import { FooterComponent } from '@/components/layout/footer.component';
import { HeaderComponent } from '@/components/layout/header.component';
import { Toaster } from '@/components/ui/sonner';
import { HOME_DESCRIPTION, HOME_TITLE } from '@/constants/home.constant';
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
import { MotionProvider } from '@/providers/motion.provider';
import { QueryClientProviderWrapper } from '@/providers/query-client.provider';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { CookieConsentComponent } from '@/components/consent/cookie-consent.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { AdFitSlotComponent } from '@/features/ad/components/adfit-slot.component';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: HOME_TITLE,
  },
  description: HOME_DESCRIPTION,
  keywords: buildKeywords(['운빨연구소', '운빨 로또'], GLOBAL_KEYWORDS),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: {
      template: `%s | ${SITE_NAME}`,
      default: HOME_TITLE,
    },
    description: HOME_DESCRIPTION,
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
      default: HOME_TITLE,
    },
    description: HOME_DESCRIPTION,
    images: [`${SITE_URL}/og-image.svg`],
  },
  authors: [
    {
      name: 'Tae-sung-Kim',
      url: 'https://github.com/Tae-sung-Kim',
    },
  ],
  robots: 'index,follow',
  category: '엔터테인먼트, 도구',
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
            <MotionProvider>
              <HeaderComponent />
              <AdFitSlotComponent sticky topOffsetPx={64} />
              <main className="flex-1 py-8">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
              <div className="mx-auto w-full max-w-7xl flex justify-center px-4 sm:px-6 lg:px-8 pb-6 empty:hidden">
                <AdFitSlotComponent unit="bottom" />
              </div>
              <FooterComponent />
              <Toaster />
              <LoadingComponent />
              <CookieConsentComponent />
            </MotionProvider>
          </ConsentProvider>
        </QueryClientProviderWrapper>
        <Analytics />
      </body>
    </html>
  );
}
