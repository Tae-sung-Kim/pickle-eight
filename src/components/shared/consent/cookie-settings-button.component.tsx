'use client';
import { Button } from '@/components/ui/button';
import { useConsentContext } from "@/providers/consent.provider";

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
