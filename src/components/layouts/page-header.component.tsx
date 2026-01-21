import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export function PageHeaderComponent({
  title,
  description,
  icon: Icon,
  breadcrumbs = [],
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'w-full border-b border-border/50 bg-background/50 backdrop-blur-sm',
        className
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link
              href="/"
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Home</span>
            </Link>
            {breadcrumbs.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                {item.href ? (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Title Section */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-3">
              {Icon && <Icon className="h-8 w-8 text-primary" />}
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground max-w-2xl text-sm sm:text-base leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
