'use client';

import { MENU_LIST } from '@/constants';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import NavLinkComponent from '../nav-link.component';

export function PcMenuLayout() {
  const pathname: string = usePathname();

  return (
    <div className="hidden md:flex w-full border-b border-border bg-white z-20">
      <nav className="w-full flex justify-center">
        <div className="flex items-center h-14 w-full max-w-screen-xl">
          <NavigationMenu className="w-full">
            <NavigationMenuList className="flex flex-row h-full items-center justify-center w-full">
              {MENU_LIST.map((item) => {
                const isActive: boolean = pathname.startsWith(item.href);
                return (
                  <NavigationMenuItem key={item.href} className="h-full">
                    <NavLinkComponent
                      href={item.href}
                      isActive={isActive}
                      className={cn(
                        // 더 좁은 패딩, 더 작은 폰트까지 반영
                        'flex items-center h-14 px-0.5 xs:px-1 sm:px-1.5 md:px-2 lg:px-3 xl:px-4 text-[11px] xs:text-xs sm:text-sm md:text-base font-medium whitespace-nowrap border-b-2 transition-colors duration-150',
                        isActive
                          ? 'border-primary text-primary font-bold'
                          : 'border-transparent text-muted-foreground hover:text-foreground',
                        'hover:border-primary/70'
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
      </nav>
    </div>
  );
}

export default PcMenuLayout;
