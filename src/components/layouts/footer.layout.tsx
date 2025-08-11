import { getKoreaTime } from '@/utils';
import Link from 'next/link';

export function FooterLayout() {
  return (
    <footer className="w-full border-t border-border/40 py-6">
      <div className="px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            © {getKoreaTime().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME}
            . All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </div>
    </footer>
  );
}
