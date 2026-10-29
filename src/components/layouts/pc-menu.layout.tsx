'use client';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { MENU_LIST } from '@/constants/menu.constant';
import { MENU_ICONS } from '@/constants/menu-icon.constant';
import { SECTION_ICON_COLOR, SECTION_ICONS } from '@/constants/theme.constant';
import { cn } from '@/lib/utils';
import type { MenuItemType, MenuSectionKeyType } from '@/types/menu.type';
import { NavLinkComponent } from '../nav-link.component';

export function PcMenuLayout() {
  const pathname = usePathname();

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {MENU_LIST.map(({ group, href, label, items }, index) => {
          const groupKey = group as MenuSectionKeyType;
          const Icon = SECTION_ICONS[groupKey] || Sparkles;
          // 오른쪽 끝에 가까운 메뉴는 화면 밖으로 나가지 않게 오른쪽 기준으로 연다
          const alignRight = index >= MENU_LIST.length - 2;

          // 항목이 1개면 드롭다운 없이 바로 이동 (2개 이상이 되면 자동으로 드롭다운)
          if (items.length < 2) {
            const target = href || items[0]?.href || '#';
            return (
              <NavigationMenuItem key={group}>
                <NavigationMenuLink
                  asChild
                  className="h-10 flex-row items-center gap-2 rounded-md bg-transparent px-4 text-sm font-semibold hover:bg-muted/50"
                >
                  <Link href={target}>
                    <Icon
                      className={cn('w-4 h-4', SECTION_ICON_COLOR[groupKey])}
                    />
                    <span>{label}</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={group}>
              <div className="flex items-center">
                <NavigationMenuTrigger className="h-10 px-4 bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/50 font-semibold">
                  <Link href={href || '#'} className="flex items-center gap-2">
                    <Icon
                      className={cn('w-4 h-4', SECTION_ICON_COLOR[groupKey])}
                    />
                    <span>{label}</span>
                  </Link>
                </NavigationMenuTrigger>

                <NavigationMenuContent
                  className={cn(
                    'group-data-[viewport=false]/navigation-menu:rounded-xl group-data-[viewport=false]/navigation-menu:shadow-lg p-1.5',
                    alignRight ? 'left-auto right-0' : 'left-0'
                  )}
                >
                  <ul className="w-[min(22rem,calc(100vw-2rem))] space-y-0.5">
                    {items.map((item: MenuItemType) => {
                      const isActive = pathname.startsWith(item.href);
                      const ItemIcon = MENU_ICONS[item.icon] ?? Sparkles;
                      return (
                        <li key={item.href}>
                          <NavigationMenuLink
                            asChild
                            className={cn(
                              'group flex-row items-start gap-3 rounded-lg p-2.5 transition-colors',
                              isActive
                                ? 'bg-primary/10 text-foreground'
                                : 'text-foreground/90 hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <NavLinkComponent
                              href={item.href}
                              isActive={isActive}
                            >
                              <span
                                className={cn(
                                  'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors',
                                  isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted group-hover:bg-background'
                                )}
                              >
                                <ItemIcon
                                  className={cn(
                                    'size-4',
                                    isActive
                                      ? 'text-primary-foreground'
                                      : item.colorClass
                                  )}
                                />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold leading-5">
                                  {item.label}
                                </span>
                                <span className="mt-0.5 block line-clamp-2 text-xs leading-4 text-muted-foreground">
                                  {item.description}
                                </span>
                              </span>
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
