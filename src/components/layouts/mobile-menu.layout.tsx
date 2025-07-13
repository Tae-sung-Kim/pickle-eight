'use client';
import { NavLinkComponent } from '@/components';
import { MENU_LIST } from '@/constants';
import { Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetDescription,
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
            'w-[90%] max-w-xs p-0 bg-white/95 backdrop-blur-2xl shadow-2xl border-none',
            'flex flex-col animate-in fade-in-0 slide-in-from-right-10 duration-300'
          )}
        >
          <SheetDescription className="sr-only">
            원하는 메뉴를 선택하세요.
          </SheetDescription>
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
          <nav className="flex flex-col gap-2 px-2 py-4">
            {MENU_LIST.map((group) => (
              <div key={group.group} className="mb-4">
                <div className="flex items-center gap-2 px-2 pb-1">
                  {group.group === 'lotto' && (
                    <span className="text-xl">🎱</span>
                  )}
                  {group.group === 'random' && (
                    <span className="text-xl">🎲</span>
                  )}
                  {group.group === 'quiz' && (
                    <span className="text-xl">🤖</span>
                  )}
                  {/* 필요시 다른 그룹도 추가 */}
                  <span className="text-[15px] font-bold text-primary/90">
                    {group.label}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  {group.items.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <NavLinkComponent
                        key={item.href}
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
                      </NavLinkComponent>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileMenuLayout;
