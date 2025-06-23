'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface NavLinkComponentProps extends React.ComponentProps<typeof Link> {
  isActive?: boolean;
}

export function NavLinkComponent({
  className,
  href,
  children,
  isActive,
  ...props
}: NavLinkComponentProps) {
  const pathname = usePathname();
  const active = isActive ?? pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium transition-colors hover:text-primary',
        active ? 'text-primary' : 'text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

NavLinkComponent.displayName = 'NavLinkComponent';
