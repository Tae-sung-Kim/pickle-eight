import Link from 'next/link';
import { MENU_ICONS } from '@/constants/menu-icon.constant';
import type { MenuItemType } from '@/types/menu.type';

/** 도구 목록: 카드 대신 구분선이 있는 행. 행 전체가 링크다 */
export function MenuListComponent({
  items,
}: {
  readonly items: readonly MenuItemType[];
}) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {items.map((it) => {
        const Icon = MENU_ICONS[it.icon];
        return (
          <li key={it.href}>
            <Link
              href={it.href}
              className="group flex items-center gap-4 px-1 py-4 transition-colors hover:bg-secondary/70 focus-visible:outline-2 focus-visible:outline-ring md:px-3"
            >
              {Icon && (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block text-base font-bold">{it.label}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {it.description}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
