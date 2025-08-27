'use client';

import Link from 'next/link';
import { Home, Coins } from 'lucide-react';
import { MobileMenuLayout, PcMenuLayout } from '@/components';
import { useCreditStore } from '@/stores';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { CREDIT_POLICY } from '@/constants';
import { useMemo } from 'react';

export function HeaderLayout() {
  const { total, todayEarned } = useCreditStore();
  const tooltipText = useMemo<string>(() => {
    if (todayEarned >= CREDIT_POLICY.dailyCap) {
      return `오늘 획득 ${todayEarned}/${CREDIT_POLICY.dailyCap} · 일일 한도 도달`;
    }
    return `오늘 획득 ${todayEarned}/${CREDIT_POLICY.dailyCap} · 획득 조건은 크레딧 + 버튼에서 확인`;
  }, [todayEarned]);

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
        {/* 오른쪽: 크레딧 표시 (PC) */}
        <div className="hidden md:flex flex-1 min-w-0 justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs cursor-default select-none">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Credits</span>
                <span className="tabular-nums font-semibold">{total}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>{tooltipText}</TooltipContent>
          </Tooltip>
        </div>
        {/* 모바일 메뉴 */}
        <div className="md:hidden flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs cursor-default select-none">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="tabular-nums font-semibold">{total}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>{tooltipText}</TooltipContent>
          </Tooltip>
          <MobileMenuLayout />
        </div>
      </div>
    </header>
  );
}

export default HeaderLayout;
