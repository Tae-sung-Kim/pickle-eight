'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface NavLinkComponentProps
  extends Omit<React.ComponentProps<typeof Link>, 'className'> {
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  isActive?: boolean;
}

export function NavLinkComponent({
  className,
  href,
  children,
  isActive,
  activeClassName = '',
  inactiveClassName = '',
  ...props
}: NavLinkComponentProps) {
  const pathname = usePathname();
  const active = isActive ?? pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center px-4 py-2 rounded-md transition-colors',
        active
          ? `bg-accent text-accent-foreground font-medium ${activeClassName}`
          : `text-muted-foreground hover:bg-accent hover:text-accent-foreground ${inactiveClassName}`,
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

NavLinkComponent.displayName = 'NavLinkComponent';
export default NavLinkComponent;
