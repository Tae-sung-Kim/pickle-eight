'use client';

import { MENU_LIST } from '@/constants';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
              {group.group === 'random' && <span className="text-xl">🎲</span>}
              {group.group === 'ai' && <span className="text-xl">🤖</span>}
              {group.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="flex flex-col min-w-[180px] py-2">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <NavigationMenuLink asChild>
                        <NavLinkComponent
                          href={item.href}
                          isActive={isActive}
                          className={cn(
                            'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'text-foreground hover:bg-primary/10 hover:text-primary'
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
