'use client';

import Link from 'next/link';
import { Home, Menu } from 'lucide-react';

import {
  Button,
  NavLinkComponent,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components';
import { MENU_LIST } from '@/constants';

export function HeaderLayout() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <Home className="h-6 w-6" />
            <span className="text-xl font-bold">Pickle</span>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-[300px] sm:max-w-[400px]"
            >
              <SheetTitle className="sr-only">메뉴</SheetTitle>
              <SheetDescription className="sr-only">
                네비게이션 메뉴
              </SheetDescription>
              <nav className="flex flex-col space-y-4 mt-8">
                {MENU_LIST.map((d) => (
                  <NavLinkComponent
                    key={d.href}
                    href={d.href}
                    className="text-lg"
                  >
                    {d.label}
                  </NavLinkComponent>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default HeaderLayout;
