'use client';
import { NavLinkComponent } from '@/components';
import { MENU_LIST } from '@/constants';
import { Menu, X, ChevronRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function MobileMenuLayout() {
  const pathname = usePathname();
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 bg-primary/10 rounded-full text-primary shadow-lg hover:bg-primary/20 transition-all"
            aria-label="메뉴 열기"
          >
            <Menu className="h-10 w-10" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          hideCloseButton={true}
          className={cn(
            // 부드러운 fade+slide 애니메이션, 플랫한 카드 느낌
            'w-[90%] max-w-xs p-0 bg-white/95 backdrop-blur-2xl shadow-2xl border-none',
            'flex flex-col animate-in fade-in-0 slide-in-from-right-10 duration-300'
          )}
        >
          {/* 상단 헤더 */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-4 bg-white/90 backdrop-blur shadow-sm">
            <SheetTitle className="text-xl font-extrabold tracking-tight text-primary">
              메뉴
            </SheetTitle>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 bg-primary/10 text-primary rounded-full shadow hover:bg-primary/20 transition-all"
                aria-label="닫기"
              >
                <X className="h-7 w-7" />
              </Button>
            </SheetClose>
          </div>
          {/* 메뉴 리스트 */}
          <nav className="flex flex-col gap-1 px-2 py-4">
            {MENU_LIST.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <SheetTrigger key={item.href} asChild>
                  <NavLinkComponent
                    href={item.href}
                    isActive={isActive}
                    className={cn(
                      'flex items-center w-full px-5 py-3 rounded-lg text-base font-medium transition-all duration-200 group relative',
                      isActive
                        ? 'bg-primary/10 text-primary font-bold border border-primary/20 shadow-md'
                        : 'text-foreground bg-white',
                      'hover:bg-primary/10 hover:text-primary hover:scale-[1.01] active:scale-[0.98]',
                      'focus-visible:ring-2 focus-visible:ring-primary/30'
                    )}
                  >
                    {item.label}
                    <ChevronRight
                      className={cn(
                        'ml-auto h-5 w-5 transition-all',
                        isActive
                          ? 'text-primary opacity-80'
                          : 'opacity-30 group-hover:opacity-80'
                      )}
                    />
                  </NavLinkComponent>
                </SheetTrigger>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileMenuLayout;
