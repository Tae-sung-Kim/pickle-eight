'use client';
import { CreditIndicatorComponent } from '@/components/shared/credit/credit-indicator.component';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { MENU_LIST } from '@/constants/menu.constant';
import { SECTION_ICON_COLOR } from '@/constants/theme.constant';
import { cn } from '@/lib/utils';
import type { MenuSectionKeyType } from '@/types/menu.type';
import type { MenuItemType } from '@/types/menu.type';
import { Bot, Circle, Dice5, type LucideIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavLinkComponent } from '../nav-link.component';

export function PcMenuLayout() {
  const pathname = usePathname();

  const SECTION_ICONS: Record<MenuSectionKeyType, LucideIcon> = {
    lotto: Circle,
    'random-picker': Dice5,
    quiz: Bot,
  };

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {MENU_LIST.map(({ group, href, label, items }) => {
          const groupKey = group as MenuSectionKeyType;
          const Icon = SECTION_ICONS[groupKey] || Sparkles;

          return (
            <NavigationMenuItem key={group}>
              <div className="flex items-center">
                <NavigationMenuTrigger className="h-10 px-4 bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/50 font-semibold">
                  <Link href={href || '#'}>
                    <Icon
                      className={cn('w-4 h-4', SECTION_ICON_COLOR[groupKey])}
                    />
                    <span>{label}</span>
                  </Link>
                </NavigationMenuTrigger>

                <NavigationMenuContent>
                  <ul className="w-[260px] p-2 space-y-1">
                    {items.map((item: MenuItemType) => {
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <li key={item.href}>
                          <NavigationMenuLink asChild>
                            <NavLinkComponent
                              href={item.href}
                              isActive={isActive}
                              className={cn(
                                'group flex w-full items-center justify-between gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all outline-none',
                                isActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                              )}
                            >
                              <span className="flex-1 min-w-0 truncate inline-flex items-center gap-2.5">
                                <span
                                  className={cn(
                                    'h-1.5 w-1.5 rounded-full transition-colors',
                                    isActive
                                      ? 'bg-primary'
                                      : 'bg-muted-foreground/40 group-hover:bg-primary/60'
                                  )}
                                />
                                {item.label}
                              </span>
                              {item.isCredit && (
                                <CreditIndicatorComponent
                                  size="xs"
                                  className="shrink-0"
                                />
                              )}
                              {!item.isCredit && item.isConditionalCredit && (
                                <CreditIndicatorComponent
                                  size="xs"
                                  showText={true}
                                  className="shrink-0 border-dashed opacity-70 group-hover:opacity-100"
                                />
                              )}
                            </NavLinkComponent>
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </div>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
