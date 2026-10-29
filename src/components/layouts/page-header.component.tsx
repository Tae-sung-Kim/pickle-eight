import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export function PageHeaderComponent({
  title,
  description,
  breadcrumbs = [],
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('w-full border-b border-border', className)}>
      <div className="mx-auto w-full max-w-6xl px-6 py-8 md:px-8">
        {breadcrumbs.length > 0 && (
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              홈
            </Link>
            {breadcrumbs.map((item) => (
              <span key={item.label} className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
