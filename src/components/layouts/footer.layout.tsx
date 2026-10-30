import Link from 'next/link';
import { ConsentNudgeComponent } from '@/features/consent/components/consent-nudge.component';
import { CookieSettingsButtonComponent } from '@/features/consent/components/cookie-settings-button.component';
import { getKoreaTime } from '@/utils/common.util';

const LINK_CLASS = 'hover:text-primary transition-colors';

export function FooterLayout() {
  const currentYear = getKoreaTime().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-secondary/60 pt-12 pb-8 mt-auto">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between mb-10">
          <div className="space-y-4 md:max-w-sm">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <span
                className="lotto-ball bg-jar"
                data-size="sm"
                aria-hidden="true"
              >
                8
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                {process.env.NEXT_PUBLIC_SITE_NAME}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              운을 데이터로, 재미로.
              <br />
              로또 번호 생성과 분석을 한곳에서 즐겨보세요.
            </p>
          </div>

          <nav
            aria-label="푸터 링크"
            className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"
          >
            <Link href="/terms" className={LINK_CLASS}>
              이용약관
            </Link>
            <Link href="/privacy" className={LINK_CLASS}>
              개인정보처리방침
            </Link>
            <a href="mailto:contact.tskim@gmail.com" className={LINK_CLASS}>
              문의하기
            </a>
            <a
              href="https://t.me/PickleEight"
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              텔레그램
            </a>
          </nav>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            © {currentYear} {process.env.NEXT_PUBLIC_SITE_NAME}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <ConsentNudgeComponent variant="gentle" />
            <CookieSettingsButtonComponent />
          </div>
        </div>
      </div>
    </footer>
  );
}
