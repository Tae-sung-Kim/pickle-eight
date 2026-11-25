import { NO_SON_DAYS_NOTICE } from '@/features/no-son-days/constants/no-son-days-notice.constant';

export function NoSonDaysBottomNoticeComponent() {
  return (
    <footer className="mx-auto mt-10 w-full max-w-5xl space-y-1 border-t border-border pt-4 text-xs text-muted-foreground sm:text-sm">
      <p>{NO_SON_DAYS_NOTICE.bottom}</p>
      <p>{NO_SON_DAYS_NOTICE.source}</p>
    </footer>
  );
}
