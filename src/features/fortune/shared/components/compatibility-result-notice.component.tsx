import type { JSX } from 'react';

import { FORTUNE_COMPATIBILITY_RESULT_NOTICE } from '@/features/fortune/constants/fortune-compatibility-notice.constant';

/**
 * FortuneCompatibilityResultNoticeComponent
 * - 결과 하단 고지 상자. 오락 고지 문장 하나만 둔다(상담전화 없음). 동의 전·이용 불가 상태에서도 항상 렌더링한다. 서버 컴포넌트.
 */
export function FortuneCompatibilityResultNoticeComponent(): JSX.Element {
  return (
    <section className="rounded-panel border border-border bg-background p-4 text-sm leading-6 sm:p-5">
      <p className="text-muted-foreground break-keep">
        {FORTUNE_COMPATIBILITY_RESULT_NOTICE}
      </p>
    </section>
  );
}
