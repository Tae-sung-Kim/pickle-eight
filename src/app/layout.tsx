import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FooterLayout, HeaderLayout, NavbarLayout } from '@/components';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Pickle',
  description: '다양한 종류의 랜덤 뽑기',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <HeaderLayout />
        <NavbarLayout />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <FooterLayout />
      </body>
    </html>
  );
}
