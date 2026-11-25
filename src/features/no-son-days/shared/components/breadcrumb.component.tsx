import Link from 'next/link';
import { NO_SON_DAYS_HUB_PATH } from '@/features/no-son-days/constants/no-son-days-route.constant';
import { NO_SON_DAYS_SEO } from '@/features/no-son-days/constants/no-son-days-seo.constant';

type NoSonDaysBreadcrumbPropsType = Readonly<{
  /** 연도 화면이면 연도. 없으면 허브 */
  year?: number;
}>;

/** PageHeaderComponent의 breadcrumb 마크업·클래스를 그대로 옮김 */
export function NoSonDaysBreadcrumbComponent({
  year,
}: NoSonDaysBreadcrumbPropsType) {
  const hubName = NO_SON_DAYS_SEO.hub.breadcrumbName;
  return (
    <nav
      aria-label="breadcrumb"
      className="mx-auto mb-3 flex w-full max-w-5xl flex-wrap items-center gap-2 text-xs text-muted-foreground"
    >
      <Link href="/" className="transition-colors hover:text-foreground">
        홈
      </Link>
      <span className="flex items-center gap-2">
        <span aria-hidden="true">/</span>
        {year === undefined ? (
          <span className="text-foreground">{hubName}</span>
        ) : (
          <Link
            href={NO_SON_DAYS_HUB_PATH}
            className="transition-colors hover:text-foreground"
          >
            {hubName}
          </Link>
        )}
      </span>
      {year !== undefined && (
        <span className="flex items-center gap-2">
          <span aria-hidden="true">/</span>
          <span className="text-foreground">{`${year}년`}</span>
        </span>
      )}
    </nav>
  );
}
