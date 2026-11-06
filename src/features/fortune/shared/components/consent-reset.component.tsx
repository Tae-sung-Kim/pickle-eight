'use client';

import type { JSX } from 'react';
import { FORTUNE_CONSENT_RESET_TEXTS } from '@/features/fortune/constants/fortune-notice.constant';
import { useFortuneConsent } from '@/features/fortune/hooks/use-fortune-consent.hook';

/**
 * "동의 다시 설정". 게이트 적용 페이지의 이용 안내 아래에 둔다(허브에는 두지 않는다).
 * granted일 때만 보인다. 누르면 저장된 동의를 지우고 이용 동의 화면으로 돌아간다.
 */
export function FortuneConsentResetComponent(): JSX.Element | null {
  const { status, reset } = useFortuneConsent();

  if (status !== 'granted') return null;

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={reset}
        className="min-h-11 scroll-mb-48 rounded-sm text-sm break-keep text-primary underline underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {FORTUNE_CONSENT_RESET_TEXTS.button}
      </button>
      <p className="text-xs leading-5 break-keep text-muted-foreground">
        {FORTUNE_CONSENT_RESET_TEXTS.description}
      </p>
    </div>
  );
}
