'use client';

import { MENU_LIST } from '@/constants';
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

export function PcMenuLayout() {
  const pathname = usePathname();

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {MENU_LIST.map((group) => (
          <NavigationMenuItem key={group.group}>
            <NavigationMenuTrigger className="px-4 text-base font-semibold flex items-center gap-2">
              {group.group === 'lotto' && <span className="text-xl">🎱</span>}
              {group.group === 'random' && <span className="text-xl">🎲</span>}
              {group.group === 'quiz' && <span className="text-xl">🤖</span>}
              {group.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-[200px] p-1.5">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <NavigationMenuLink asChild>
                        <NavLinkComponent
                          href={item.href}
                          isActive={isActive}
                          className={cn(
                            'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-gray-100 text-primary font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          {item.label}
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
