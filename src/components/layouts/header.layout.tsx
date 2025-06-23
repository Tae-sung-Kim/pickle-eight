'use client';

import Link from 'next/link';
import { Home, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NavLinkComponent } from '../nav-link.component';

export function HeaderLayout() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
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
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="text-left">메뉴</SheetTitle>
              <nav className="flex flex-col space-y-4 mt-8">
                <NavLinkComponent href="/lotto" className="text-lg">
                  로또 번호
                </NavLinkComponent>
                {/* <NavLinkComponent href="/random-number" className="text-lg">
                  숫자 뽑기
                </NavLinkComponent>
                <NavLinkComponent href="/random-name" className="text-lg">
                  이름 뽑기
                </NavLinkComponent> */}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
