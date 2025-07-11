'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { MobileMenuLayout, PcMenuLayout } from '@/components';

export function HeaderLayout() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6">
        {/* 왼쪽: 로고 */}
        <div className="flex-1 min-w-0">
          <Link href="/" className="flex items-center space-x-2 w-fit">
            <Home className="h-5 w-5" />
            <span className="text-lg font-bold whitespace-nowrap">
              {process.env.NEXT_PUBLIC_SITE_NAME}
            </span>
          </Link>
        </div>
        {/* 가운데: PC 메뉴 */}
        <div className="hidden md:flex">
          <PcMenuLayout />
        </div>
        {/* 오른쪽: 여백 */}
        <div className="hidden md:block flex-1 min-w-0" />
        {/* 모바일 메뉴 */}
        <div className="md:hidden flex-none">
          <MobileMenuLayout />
        </div>
      </div>
    </header>
  );
}

export default HeaderLayout;
