import { Smartphone } from 'lucide-react';
import type { JSX } from 'react';

import { TAROT_DAILY_STORAGE_NOTICE } from '@/features/tarot/constants/tarot-notice.constant';

/**
 * TarotDailyStorageNoticeComponent
 * - 오늘의 카드가 이 기기에 저장된다는 안내(AC-8). 서버 컴포넌트.
 */
export function TarotDailyStorageNoticeComponent(): JSX.Element {
  return (
    <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
      <Smartphone size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span>{TAROT_DAILY_STORAGE_NOTICE}</span>
    </p>
  );
}
