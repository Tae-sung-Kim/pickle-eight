'use client';
import { NavLinkComponent } from '@/components/nav-link.component';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { MENU_LIST } from '@/constants/menu.constant';
import { SECTION_ICON_COLOR } from '@/constants/theme.constant';
import { cn } from '@/lib/utils';
import type { MenuSectionKeyType } from '@/types/menu.type';
import type { MenuItemType } from '@/types/menu.type';
import {
  Bot,
  Circle,
  Dice5,
  Menu,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditIndicatorComponent } from '../shared/credit/credit-indicator.component';

export type MobileMenuLayoutProps = {
  hiddenClass?: string;
};

export function MobileMenuLayout({ hiddenClass = '' }: MobileMenuLayoutProps) {
  const pathname = usePathname();

  const SECTION_ICONS: Record<MenuSectionKeyType, LucideIcon> = {
    lotto: Circle,
    'random-picker': Dice5,
    quiz: Bot,
  };

  return (
    <div className={hiddenClass}>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-primary/10 rounded-full text-primary shadow-sm hover:bg-primary/20 transition-all ring-1 ring-primary/10"
            aria-label="메뉴 열기"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          hideCloseButton={true}
          className={cn(
            'w-[85%] max-w-sm p-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85',
            'flex flex-col animate-in fade-in-0 slide-in-from-right-10 duration-300',
            'rounded-l-2xl shadow-2xl border-l border-primary/10'
          )}
        >
          <SheetDescription className="sr-only">
            원하는 메뉴를 선택하세요.
          </SheetDescription>
          {/* 상단 헤더 */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-5 pb-4 bg-white/90 backdrop-blur border-b border-primary/5">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              <span className="text-primary">메뉴</span>
            </SheetTitle>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
          {/* 메뉴 리스트 */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-primary/25 scrollbar-track-transparent space-y-8">
            {MENU_LIST.map(({ group, href, label, items }) => {
              const groupKey = group as MenuSectionKeyType;
              const Icon = SECTION_ICONS[groupKey] || Sparkles;

              return (
                <div key={group} className="space-y-3">
                  <div className="flex items-center gap-2 px-2 text-muted-foreground/80">
                    <Icon
                      className={cn('w-4 h-4', SECTION_ICON_COLOR[groupKey])}
                    />
                    {href ? (
                      <SheetClose asChild>
                        <Link
                          href={href}
                          prefetch
                          className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors"
                        >
                          {label}
                        </Link>
                      </SheetClose>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {label}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {items.map((item: MenuItemType) => {
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <SheetClose asChild key={item.href}>
                          <NavLinkComponent
                            href={item.href}
                            isActive={isActive}
                            className={cn(
                              'group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all text-left w-full',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <span className="truncate inline-flex items-center gap-2.5">
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
                            {!item.isCredit && item.isConditionalCredit && (
                              <CreditIndicatorComponent
                                size="xs"
                                showText={true}
                                className="border-dashed opacity-70"
                              />
                            )}
                          </NavLinkComponent>
                        </SheetClose>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
