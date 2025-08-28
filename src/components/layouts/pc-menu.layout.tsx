'use client';

import { MENU_GROUP_NAME_ENUM, MENU_LIST } from '@/constants';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import NavLinkComponent from '../nav-link.component';
import Link from 'next/link';
import { CreditIndicatorComponent } from '@/components';

export function PcMenuLayout() {
  const pathname = usePathname();

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {MENU_LIST.map(({ group, href, label, items }) => (
          <NavigationMenuItem key={group}>
            <div className="flex items-center">
              {href ? (
                <Link
                  href={href}
                  className="px-4 text-base font-semibold flex items-center gap-2 hover:text-primary"
                >
                  {group === MENU_GROUP_NAME_ENUM.LOTTO && (
                    <span className="text-xl">🎱</span>
                  )}
                  {group === MENU_GROUP_NAME_ENUM.RANDOM_PICKER && (
                    <span className="text-xl">🎲</span>
                  )}
                  {group === MENU_GROUP_NAME_ENUM.QUIZ && (
                    <span className="text-xl">🤖</span>
                  )}
                  {label}
                </Link>
              ) : (
                <span className="px-4 text-base font-semibold flex items-center gap-2">
                  {group === MENU_GROUP_NAME_ENUM.LOTTO && (
                    <span className="text-xl">🎱</span>
                  )}
                  {group === MENU_GROUP_NAME_ENUM.RANDOM_PICKER && (
                    <span className="text-xl">🎲</span>
                  )}
                  {group === MENU_GROUP_NAME_ENUM.QUIZ && (
                    <span className="text-xl">🤖</span>
                  )}
                  {label}
                </span>
              )}
              <NavigationMenuTrigger
                aria-label={`${label} 메뉴 열기`}
                className="px-2 h-9"
                title={`${label} 메뉴 열기`}
              >
                <span className="sr-only">{label} 메뉴 열기</span>
              </NavigationMenuTrigger>
            </div>
            <NavigationMenuContent>
              <ul className="w-[240px] p-1.5">
                {items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <NavigationMenuLink asChild>
                        <NavLinkComponent
                          href={item.href}
                          isActive={isActive}
                          className={cn(
                            'flex w-full !flex-row items-center justify-between gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-gray-100 text-primary font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          <span className="flex-1 min-w-0 truncate">
                            {item.label}
                          </span>
                          {item.isCredit && (
                            <CreditIndicatorComponent
                              size="xs"
                              className="shrink-0"
                            />
                          )}
                        </NavLinkComponent>
                      </NavigationMenuLink>
                    </li>
                  );
                })}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default PcMenuLayout;
