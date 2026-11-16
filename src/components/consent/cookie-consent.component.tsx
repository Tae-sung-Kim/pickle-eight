'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useConsentContext } from '@/providers/consent.provider';

export function CookieConsentComponent() {
  const { visible, onAccept, onDecline, onClose } = useConsentContext();
  if (!visible) return null;
  return (
    <section
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-5 sm:pb-6"
      aria-label="쿠키 동의 배너"
    >
      <div className="mx-auto w-full max-w-3xl md:max-w-4xl lg:max-w-5xl rounded-2xl border bg-background/90 shadow-xl ring-1 ring-border backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col items-stretch gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between md:gap-4">
          <p className="flex-1 text-xs sm:text-sm leading-6 text-muted-foreground">
            🙏 광고 수익으로 이 서비스를 무료로 운영하고 있어요. 광고에 동의해
            주시면 큰 힘이 됩니다. 거부해도 모든 기능은 그대로 쓸 수 있고,
            광고용 쿠키는 쓰지 않아요.{' '}
            <Link
              href="/privacy#cookies-consent"
              className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
            >
              자세히 보기
            </Link>
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-2 md:flex-nowrap md:justify-end">
            <Button
              type="button"
              onClick={onDecline}
              variant="outline"
              size="sm"
              className="border-muted-foreground/30 text-muted-foreground hover:bg-muted/50"
              aria-label="쿠키 거부"
            >
              거부
            </Button>
            <Button
              type="button"
              onClick={onAccept}
              variant="default"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary"
              aria-label="쿠키 동의"
            >
              동의
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              size="icon"
              aria-label="닫기"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <span aria-hidden>×</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
