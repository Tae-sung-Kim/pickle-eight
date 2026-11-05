import { MessageCircleQuestion } from 'lucide-react';
import type { JSX } from 'react';

import { TAROT_EXPERT_NOTICE_TEXT } from '@/features/tarot/constants/tarot-notice.constant';

/**
 * TarotExpertNoticeComponent
 * - 건강·법률·투자 표현 감지 시 결과에 덧붙이는 참고 안내. 경고색을 쓰지 않는다.
 */
export function TarotExpertNoticeComponent(): JSX.Element {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-card p-4 text-sm text-foreground">
      <MessageCircleQuestion
        size={16}
        aria-hidden="true"
        className="mt-1 shrink-0 text-muted-foreground"
      />
      <p className="max-w-[68ch] leading-6">{TAROT_EXPERT_NOTICE_TEXT}</p>
    </div>
  );
}
