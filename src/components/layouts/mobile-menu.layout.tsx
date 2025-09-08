'use client';
import { NavLinkComponent, CreditIndicatorComponent } from '@/components';
import { MENU_GROUP_NAME_ENUM, MENU_LIST } from '@/constants';
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
import { cn } from '@/lib';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export type MobileMenuLayoutProps = {
  hiddenClass?: string; // default visibility control (tailwind classes)
};

export function MobileMenuLayout({ hiddenClass = '' }: MobileMenuLayoutProps) {
  const pathname = usePathname();
  return (
    <div className={hiddenClass}>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 bg-primary/10 rounded-full text-primary shadow-lg hover:bg-primary/20 transition-all ring-1 ring-primary/10"
            aria-label="메뉴 열기"
          >
            <Menu className="h-10 w-10" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          hideCloseButton={true}
          className={cn(
            'w-[92%] max-w-sm p-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85',
            'flex flex-col animate-in fade-in-0 slide-in-from-right-10 duration-300',
            'rounded-l-2xl shadow-2xl border-l border-primary/10'
          )}
        >
          <SheetDescription className="sr-only">
            원하는 메뉴를 선택하세요.
          </SheetDescription>
          {/* 상단 헤더 */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-5 pb-4 bg-white/90 backdrop-blur border-b bg-gradient-to-b from-primary/5 to-transparent">
            <SheetTitle className="text-xl font-bold text-foreground">
              메뉴
            </SheetTitle>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
          {/* 메뉴 리스트 */}
          <nav className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-thin scrollbar-thumb-primary/25 scrollbar-track-transparent">
            {MENU_LIST.map(({ group, href, label, items }) => (
              <div key={group} className="mb-5">
                <div className="flex items-center gap-2 px-3 mb-2 text-muted-foreground">
                  {group === MENU_GROUP_NAME_ENUM.LOTTO && (
                    <span className="text-xl">🎱</span>
                  )}
                  {group === MENU_GROUP_NAME_ENUM.RANDOM_PICKER && (
                    <span className="text-xl">🎲</span>
                  )}
                  {group === MENU_GROUP_NAME_ENUM.QUIZ && (
                    <span className="text-xl">🤖</span>
                  )}
                  {href ? (
                    <Link
                      href={href}
                      className="text-[11px] font-semibold uppercase tracking-widest hover:text-primary"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span className="text-[11px] font-semibold uppercase tracking-widest">
                      {label}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {items.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <SheetClose asChild key={item.href}>
                        <NavLinkComponent
                          href={item.href}
                          isActive={isActive}
                          className={cn(
                            'group flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl text-[13px] font-medium transition-colors text-left w-full ring-1 ring-transparent',
                            isActive
                              ? 'bg-primary/5 text-primary ring-primary/10'
                              : 'text-foreground hover:bg-primary/5'
                          )}
                        >
                          <span className="truncate inline-flex items-center gap-2">
                            <span
                              className={cn(
                                'block h-1.5 w-1.5 rounded-full transition-colors',
                                isActive
                                  ? 'bg-primary'
                                  : 'bg-muted-foreground/30 group-hover:bg-primary/50'
                              )}
                            />
                            {item.label}
                          </span>
                          {item.isCredit && (
                            <CreditIndicatorComponent size="xs" />
                          )}
                        </NavLinkComponent>
                      </SheetClose>
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
