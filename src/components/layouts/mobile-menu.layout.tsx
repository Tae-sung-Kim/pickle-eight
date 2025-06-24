import { NavLinkComponent } from '@/components';
import { MENU_LIST } from '@/constants';
import { Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MobileMenuLayout() {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent/50"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">메뉴 열기</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          hideCloseButton={true}
          className="w-[85%] max-w-sm p-0 bg-background/95 backdrop-blur-sm [&>button:first-child]:hidden"
        >
          <div className="relative">
            <div className="px-6 pt-6 pb-4 border-b flex justify-between items-center">
              <SheetTitle className="text-lg font-semibold">메뉴</SheetTitle>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">닫기</span>
                </Button>
              </SheetClose>
            </div>
          </div>

          <nav className="flex flex-col p-4">
            {MENU_LIST.map((item) => (
              <SheetTrigger key={item.href} asChild>
                <NavLinkComponent
                  href={item.href}
                  className={({ isActive }) =>
                    cn(
                      'px-4 py-3 rounded-lg text-base font-medium transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      isActive
                        ? 'bg-accent text-accent-foreground font-semibold'
                        : 'text-foreground/90'
                    )
                  }
                >
                  {item.label}
                </NavLinkComponent>
              </SheetTrigger>
            ))}
          </nav>

          {/* 로그인은 나중에 */}
          {/* <div className="sticky bottom-0 left-0 right-0 p-4 border-t bg-background/80 backdrop-blur-sm">
            <Button className="w-full" variant="outline">
              로그인
            </Button>
          </div> */}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileMenuLayout;
