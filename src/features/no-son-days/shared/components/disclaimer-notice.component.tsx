import { Info } from 'lucide-react';
import { NO_SON_DAYS_NOTICE } from '@/features/no-son-days/constants/no-son-days-notice.constant';

export function NoSonDaysDisclaimerNoticeComponent() {
  return (
    <aside className="mx-auto mb-6 flex w-full max-w-5xl items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm leading-relaxed text-foreground">
      <Info
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-menu-no-son-days"
      />
      <p>{NO_SON_DAYS_NOTICE.top}</p>
    </aside>
  );
}
