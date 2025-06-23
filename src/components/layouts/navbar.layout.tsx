'use client';

import { usePathname } from 'next/navigation';
import { NavLinkComponent } from '../nav-link.component';

const navItems = [
  { href: '/lotto', label: '로또 번호' },
  // { href: '/random-number', label: '숫자 뽑기' },
  // { href: '/random-name', label: '이름 뽑기' },
];

export function NavbarLayout() {
  const pathname = usePathname();

  return (
    <nav className="hidden border-b md:block">
      <div className="container">
        <div className="flex h-16 items-center space-x-8">
          {navItems.map((item) => (
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
