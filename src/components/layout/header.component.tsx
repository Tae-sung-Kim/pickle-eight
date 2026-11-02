'use client';
import Link from 'next/link';
import { MobileMenuComponent } from '@/components/layout/mobile-menu.component';
import { PcMenuComponent } from '@/components/layout/pc-menu.component';

export function HeaderComponent() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <div className="flex-1 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <span
              className="lotto-ball bg-jar"
              data-size="sm"
              aria-hidden="true"
            >
              8
            </span>
            <span className="text-lg font-extrabold tracking-tight whitespace-nowrap truncate max-w-[110px] sm:max-w-[180px] max-[560px]:hidden">
              {process.env.NEXT_PUBLIC_SITE_NAME}
            </span>
          </Link>
        </div>
        <div className="hidden lg:flex">
          <PcMenuComponent />
        </div>
        <div className="lg:hidden ml-auto flex items-center gap-1.5 max-[400px]:gap-1 whitespace-nowrap">
          <div className="shrink-0">
            <MobileMenuComponent />
          </div>
        </div>
      </div>
    </header>
  );
}
