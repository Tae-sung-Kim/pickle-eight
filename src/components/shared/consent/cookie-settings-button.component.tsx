'use client';

import { useConsentContext } from '@/providers';
import { Button } from '@/components/ui/button';

export function CookieSettingsButtonComponent() {
  const { onOpen } = useConsentContext();
  return (
    <Button
      type="button"
      onClick={onOpen}
      variant="ghost"
      className="text-sm text-muted-foreground transition-colors hover:text-foreground underline"
      aria-label="쿠키 설정 열기"
    >
      쿠키 설정
    </Button>
  );
}

export default CookieSettingsButtonComponent;
