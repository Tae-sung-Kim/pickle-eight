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
            'w-[90%] max-w-xs p-0 bg-white',
            'flex flex-col animate-in fade-in-0 slide-in-from-right-10 duration-300'
          )}
        >
          <SheetDescription className="sr-only">
            원하는 메뉴를 선택하세요.
          </SheetDescription>
          {/* 상단 헤더 */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-4 bg-white">
            <SheetTitle className="text-xl font-bold text-gray-900">
              메뉴
            </SheetTitle>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                aria-label="닫기"
              >
                <X className="h-6 w-6" />
              </Button>
            </SheetClose>
          </div>
          {/* 메뉴 리스트 */}
          <nav className="flex-1 overflow-y-auto px-4 pb-6">
            {MENU_LIST.map(({ group, href, label, items }) => (
              <div key={group} className="mb-6">
                <div className="flex items-center gap-2 px-2 mb-2">
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
                      className="text-xs font-medium text-gray-700 uppercase tracking-wider hover:text-primary"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                            'flex items-center justify-between gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left w-full',
                            isActive
                              ? 'bg-gray-100 text-primary font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          <span className="truncate">{item.label}</span>
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
