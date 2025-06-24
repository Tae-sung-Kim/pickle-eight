'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

type NavLinkComponentProps = Omit<
  React.ComponentProps<typeof Link>,
  'className'
> & {
  isActive?: boolean;
  activeClassName?: string;
  inactiveClassName?: string;
  children: React.ReactNode;
  className?: string | ((props: { isActive: boolean }) => string);
};

export function NavLinkComponent({
  className,
  href,
  children,
  isActive: isActiveProp,
  activeClassName = '',
  inactiveClassName = '',
  ...props
}: NavLinkComponentProps) {
  const pathname = usePathname();
  const isActive = isActiveProp ?? pathname === href;

  // className이 함수인 경우 isActive 값을 전달하여 호출
  const computedClassName =
    typeof className === 'function' ? className({ isActive }) : className;

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center px-4 py-2 rounded-md transition-colors',
        isActive
          ? `bg-accent text-accent-foreground font-medium ${activeClassName}`
          : `text-muted-foreground hover:bg-accent hover:text-accent-foreground ${inactiveClassName}`,
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
