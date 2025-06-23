'use client';

import { MENU_LIST } from '@/constants';
import { usePathname } from 'next/navigation';
import { NavLinkComponent } from '../nav-link.component';

export function NavbarLayout() {
  const pathname = usePathname();

  return (
    <nav className="hidden border-b md:block">
      <div className="container">
        <div className="flex h-16 items-center space-x-8">
          {MENU_LIST.map((item) => (
            <NavLinkComponent
              key={item.href}
              href={item.href}
              isActive={pathname.startsWith(item.href)}
            >
              {item.label}
            </NavLinkComponent>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default NavbarLayout;
