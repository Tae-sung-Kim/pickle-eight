import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Fragment, type JSX } from 'react';

export type DreamBreadcrumbItemType = Readonly<{
  label: string;
  /** 없으면 현재 위치(링크 아님, aria-current="page") */
  href?: string;
}>;

export type DreamBreadcrumbComponentPropsType = Readonly<{
  items: readonly DreamBreadcrumbItemType[];
}>;

/**
 * DreamBreadcrumbComponent
 * - 화면용 이동 경로. JSON-LD BreadcrumbList는 페이지가 따로 넣는다. 서버 컴포넌트.
 */
export function DreamBreadcrumbComponent({
  items,
}: DreamBreadcrumbComponentPropsType): JSX.Element {
  return (
    <nav aria-label="이동 경로" className="pt-4">
      <ol className="flex flex-wrap items-center text-sm leading-6">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${item.href ?? 'current'}`}>
            {index > 0 ? (
              <li aria-hidden="true" className="flex items-center px-1">
                <ChevronRight
                  size={14}
                  aria-hidden="true"
                  className="text-muted-foreground"
                />
              </li>
            ) : null}
            <li className="flex min-h-8 items-center">
              {item.href ? (
                <Link
                  href={item.href}
                  prefetch={false}
                  className="rounded-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-foreground">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
