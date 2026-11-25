import { NO_SON_DAYS_VIEW } from '@/features/no-son-days/constants/no-son-days-view.constant';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/** 모바일 전용 월 바로가기. 앵커 링크만 쓴다 */
export function NoSonDaysMonthJumpNavComponent() {
  return (
    <nav
      aria-label={NO_SON_DAYS_VIEW.monthJumpLabel}
      className="mx-auto mb-6 w-full max-w-5xl lg:hidden"
    >
      <ul className="grid grid-cols-6 gap-2">
        {MONTHS.map((month) => (
          <li key={month}>
            <a
              href={`#month-${month}`}
              className="flex h-11 items-center justify-center rounded-lg border border-border bg-card text-sm text-foreground transition-colors hover:bg-menu-no-son-days/10"
            >
              {NO_SON_DAYS_VIEW.monthCard.title(month)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
