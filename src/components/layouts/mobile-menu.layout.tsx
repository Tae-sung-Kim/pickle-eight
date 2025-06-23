import { NavLinkComponent } from '@/components';
import { MENU_LIST } from '@/constants';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function MobileMenuLayout() {
  return (
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
              <NavLinkComponent key={d.href} href={d.href} className="text-lg">
                {d.label}
              </NavLinkComponent>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileMenuLayout;
