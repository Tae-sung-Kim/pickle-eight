'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

type NavLinkComponentPropsType = Omit<
  React.ComponentProps<typeof Link>,
  'className'
> & {
  isActive?: boolean;
  children: React.ReactNode;
  className?: string | ((props: { isActive: boolean }) => string);
};

export function NavLinkComponent({
  className,
  href,
  children,
  isActive: isActiveProp,
  ...props
}: NavLinkComponentPropsType) {
  const pathname = usePathname();
  const isActive = isActiveProp ?? pathname === href;

  // className이 함수인 경우 isActive 값을 전달하여 호출
  const computedClassName =
    typeof className === 'function' ? className({ isActive }) : className;

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center transition-colors', // px, py 등은 외부에서!
        computedClassName
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

NavLinkComponent.displayName = 'NavLinkComponent';
export default NavLinkComponent;
