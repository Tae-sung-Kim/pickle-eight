import { CopyButtonComponent } from '@/components/copy-button.component';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: '후원 | ' + (process.env.NEXT_PUBLIC_SITE_NAME as string),
  description:
    '광고와 무관한 자발적 후원 안내 페이지입니다. 서비스가 도움이 되셨다면 계좌이체로 가볍게 후원하실 수 있습니다.',
  pathname: '/support',
});

export default function SupportPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '후원', item: canonicalUrl('/support') },
  ]);

  const BANK_NAME = '농협' as const;
  const ACCOUNT_NUMBER = '302-1771-0193-81' as const;
  const ACCOUNT_HOLDER = '보무라지' as const;
  const COPY_TEXT = `${BANK_NAME} ${ACCOUNT_NUMBER.replace(/-/g, '')}` as const;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <header className="mb-8">
        <h1 className="text-2xl font-bold">후원</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          이 서비스가 도움이 되셨다면, 커피 한 잔의 마음으로 가벼운 후원을
          부탁드립니다. 모든 후원은 전적으로 자발적이며, 광고와 무관합니다.
        </p>
      </header>

      <section className="rounded-2xl border border-border surface-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">계좌 이체 안내</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          아래 정보로 이체해 주시면 감사히 운영에 보태겠습니다.
        </p>

        <div className="mt-4 grid gap-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">
                은행 / 계좌번호
              </div>
              <div
                className="mt-1 truncate font-mono text-sm font-semibold tracking-wide"
                aria-label="은행 및 계좌번호"
              >
                {BANK_NAME} {ACCOUNT_NUMBER}
              </div>
            </div>
            <CopyButtonComponent text={COPY_TEXT} label="복사" />
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="text-xs text-muted-foreground">예금주</div>
            <div className="mt-1 font-semibold">{ACCOUNT_HOLDER}</div>
          </div>
        </div>
      </section>

      <section className="mt-10 space-y-3 text-sm text-muted-foreground">
        <h2 className="text-base font-semibold text-foreground">법적 고지</h2>
        <p>
          본 페이지의 후원은 순수 자발적 성격이며, 별도의 대가나 서비스 제공을
          전제로 하지 않습니다. 후원금은 서비스 운영 및 유지보수에 사용됩니다.
        </p>
        <p>
          일반적으로 후원은 환불이 어렵습니다. 오입금 등 실수가 있으신 경우 연락
          주시면 확인 후 도와드리겠습니다.
        </p>
        <p>
          수취 주체: 보무라지, 예금주: {ACCOUNT_HOLDER}. 관련 세무·회계 처리는
          법령과 내부 정책을 따릅니다.
        </p>
      </section>
    </main>
  );
}
