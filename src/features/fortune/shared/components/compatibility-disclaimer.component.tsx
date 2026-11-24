import type { JSX } from 'react';

import { FORTUNE_COMPATIBILITY_DISCLAIMER_TEXT } from '@/features/fortune/constants/fortune-compatibility-notice.constant';

/**
 * FortuneCompatibilityDisclaimerComponent
 * - 궁합 상시 면책(운세 면책 + 궁합 과학적 근거 없음 문장). h1 바로 아래에 둔다. 서버 컴포넌트.
 */
export function FortuneCompatibilityDisclaimerComponent(): JSX.Element {
  return (
    <p className="mx-auto max-w-2xl rounded-lg border border-border bg-card px-4 py-3 text-center text-sm leading-6 break-keep text-muted-foreground">
      {FORTUNE_COMPATIBILITY_DISCLAIMER_TEXT}
    </p>
  );
}
