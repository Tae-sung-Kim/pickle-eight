import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pickle',
  description: '다양한 종류의 랜덤 뽑기',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

import { HeaderLayout } from '@/components/layouts/header.layout';
import { FooterLayout } from '@/components/layouts/footer.layout';
import { NavbarLayout } from '@/components/layouts/navbar.layout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="flex min-h-screen flex-col">
        <HeaderLayout />
        <NavbarLayout />
        <main className="flex-1">{children}</main>
        <FooterLayout />
      </body>
    </html>
  );
}
