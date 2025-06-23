'use client';

import { MENU_LIST } from '@/constants';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import NavLinkComponent from '../nav-link.component';

export function PcMenuLayout() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-1 justify-center">
      <div className="hidden border-b md:block">
        <div className="container">
          <NavigationMenu className="h-16">
            <NavigationMenuList className="h-full">
              {MENU_LIST.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <NavigationMenuItem key={item.href} className="h-full">
                    <NavLinkComponent
                      href={item.href}
                      isActive={isActive}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'h-full rounded-none border-b-2 border-transparent hover:bg-transparent hover:text-foreground',
                        isActive
                          ? 'border-primary bg-transparent text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                    </NavLinkComponent>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  );
}
