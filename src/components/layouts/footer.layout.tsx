import { getKoreaTime } from '@/utils';
import Link from 'next/link';
import {
  CookieSettingsButtonComponent,
  ConsentNudgeComponent,
} from '../shared';

export function FooterLayout() {
  return (
    <footer className="w-full border-t border-border/40 py-6">
      <div className="px-4 sm:px-6">
        <ConsentNudgeComponent variant="gentle" />
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            {getKoreaTime().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME}.
            All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:justify-end">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                이용약관
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/credits-policy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                크레딧 정책
              </Link>
              <Link
                href="/support"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                후원
              </Link>
            </div>
            <CookieSettingsButtonComponent />
            <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground sm:flex-row sm:gap-3">
              <a
                href="mailto:contact.tskim@gmail.com"
                className="max-w-[180px] truncate transition-colors hover:text-foreground"
                aria-label="Contact via Email"
              >
                contact.tskim@gmail.com
              </a>
              <span className="hidden sm:inline-block" aria-hidden>
                •
              </span>
              <a
                href="https://t.me/PickleEight"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
                aria-label="Contact via Telegram"
              >
                텔레그램
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
