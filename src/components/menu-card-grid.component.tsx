import Link from 'next/link';
import type { MenuItemType } from '@/types/menu.type';

export function MenuCardGridComponent({
  items,
}: {
  readonly items: readonly MenuItemType[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted/40"
        >
          <div className="text-sm font-semibold tracking-tight">{it.label}</div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {it.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
