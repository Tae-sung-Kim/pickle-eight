import { MENU_LIST } from '@/constants';
import { MenuSectionKeyType } from '@/types';
import Link from 'next/link';
import { useMemo } from 'react';
import { cn } from '@/lib';

export function BackHubPageComponent({
  type,
  className,
}: {
  type: MenuSectionKeyType;
  className?: string;
}) {
  const { href, label } = useMemo(
    () => MENU_LIST.find((f) => f.group === type) ?? { href: '/', label: '' },
    [type]
  );

  return (
    <div className={cn('pt-2 md:pt-3 mb-4', className)}>
      <Link
        href={href ?? '/'}
        replace
        aria-label={`${label}로 이동`}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
      >
        &larr; {label} 허브
      </Link>
    </div>
  );
}
export default BackHubPageComponent;
