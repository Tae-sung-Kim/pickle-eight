import { ConsentNudgeComponent } from '@/components/shared/consent/consent-nudge.component';
import { CookieSettingsButtonComponent } from '@/components/shared/consent/cookie-settings-button.component';
import { getKoreaTime } from '@/utils/common.util';
import { Home, Mail, Send } from 'lucide-react';
import Link from 'next/link';

export function FooterLayout() {
  const currentYear = getKoreaTime().getFullYear();

  return (
    <footer className="w-full border-t border-border/50 bg-muted/30 pt-12 pb-8 mt-auto">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* 1. Brand Section */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                {process.env.NEXT_PUBLIC_SITE_NAME}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              운을 데이터로, 재미로.
              <br />
              다양한 랜덤 도구와 로또 분석을
              <br />
              한곳에서 즐겨보세요.
            </p>
          </div>

          {/* 2. Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm tracking-wider text-foreground">
              서비스
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/lotto"
                  className="hover:text-primary transition-colors"
                >
                  로또 번호 생성
                </Link>
              </li>
              <li>
                <Link
                  href="/random-picker"
                  className="hover:text-primary transition-colors"
                >
                  이름/번호 추첨
                </Link>
              </li>
              <li>
                <Link
                  href="/random-picker/seat"
                  className="hover:text-primary transition-colors"
                >
                  자리 배정
                </Link>
              </li>
              <li>
                <Link
                  href="/random-picker/ladder"
                  className="hover:text-primary transition-colors"
                >
                  사다리 타기
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm tracking-wider text-foreground">
              고객 지원
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/support"
                  className="hover:text-primary transition-colors"
                >
                  후원하기
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact.tskim@gmail.com"
                  className="hover:text-primary transition-colors flex items-center gap-2"
                >
                  문의하기
                </a>
              </li>
            </ul>
          </div>

          {/* 4. Legal & Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm tracking-wider text-foreground">
              정보
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/credits-policy"
                  className="hover:text-primary transition-colors"
                >
                  크레딧 정책
                </Link>
              </li>
            </ul>
            <div className="pt-2 flex gap-3">
              <a
                href="mailto:contact.tskim@gmail.com"
                className="p-2 rounded-full bg-background border border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-all"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/PickleEight"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-background border border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-all"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
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
