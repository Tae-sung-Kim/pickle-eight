'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { MobileMenuLayout, PcMenuLayout } from '@/components';

export function HeaderLayout() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* 로고 - 왼쪽 고정 */}
        <div className="flex-1">
          <Link href="/" className="flex items-center space-x-2 w-fit">
            <Home className="h-6 w-6" />
            <span className="text-xl font-bold">
              {process.env.NEXT_PUBLIC_SITE_NAME}
            </span>
          </Link>
        </div>

        {/* PC navigation */}
        {/* PC 네비게이션 - 중앙 정렬 */}
        <PcMenuLayout />
        {/* 오른쪽 여백을 위한 빈 div */}
        <div className="hidden md:block flex-1" />
        {/* Mobile Navigation */}
        {/* 모바일 네비게이션 - 오른쪽 고정 */}
        <MobileMenuLayout />
      </div>
    </header>
  );
}

export default HeaderLayout;
