import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FooterLayout, HeaderLayout } from '@/components';
import { Toaster } from 'sonner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Pickle - 랜덤 추첨과 게임의 모든 것',
  description:
    '이름 추첨, 자리 배정, 로또 분석 등 다양한 랜덤 추첨 도구를 한 곳에서 편리하게 이용해보세요!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="flex flex-col bg-background text-foreground antialiased">
        <HeaderLayout />
        <main className="flex-1 py-8">
          {/* 상하 패딩 추가 */}
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {/* 자식 요소들 간의 간격을 일관되게 유지 */}
              {children}
            </div>
          </div>
        </main>
        <FooterLayout />
        <Toaster />
      </body>
    </html>
  );
}
