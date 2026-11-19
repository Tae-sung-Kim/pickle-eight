import Link from 'next/link';
import type { JSX } from 'react';

import { DREAM_CATEGORY_COUNT_TEMPLATE } from '@/features/dream/constants/dream-notice.constant';
import type { DreamHubGroupType } from '@/features/dream/types/dream.type';

export type DreamHubCategoryListComponentPropsType = Readonly<{
  groups: readonly DreamHubGroupType[];
  /** 제목 id 접두어. 카테고리 key를 붙인다 */
  idPrefix: string;
}>;

/**
 * DreamHubCategoryListComponent
 * - 카테고리별 h2 + 소재 링크 목록. 링크는 prefetch={false}(검색으로 바뀌어도 프리페치 요청이 없게).
 */
export function DreamHubCategoryListComponent({
  groups,
  idPrefix,
}: DreamHubCategoryListComponentPropsType): JSX.Element | null {
  const visibleGroups = groups.filter((group) => group.items.length > 0);
  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <div className="divide-y divide-border border-y border-border">
      {visibleGroups.map((group) => {
        const headingId = `${idPrefix}-${group.category.key}`;
        return (
          <section
            key={group.category.key}
            aria-labelledby={headingId}
            className="grid gap-3 py-5 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8 md:py-6"
          >
            <div>
              <h2
                id={headingId}
                className="text-lg leading-tight font-semibold break-keep text-foreground"
              >
                {group.category.label}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {DREAM_CATEGORY_COUNT_TEMPLATE.replace('{n}', () =>
                  String(group.items.length)
                )}
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/dream/${item.slug}`}
                    prefetch={false}
                    className="inline-flex min-h-11 items-center rounded-md border border-border bg-card px-3 text-base font-medium break-keep text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
