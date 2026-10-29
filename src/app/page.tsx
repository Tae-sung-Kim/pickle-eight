import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { MENU_LIST } from '@/constants/menu.constant';
import { HeroComponent } from '@/features/hero/components/hero.component';
import { buildMetadata, canonicalUrl, jsonLdWebSite } from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME as string;
const TITLE = `${SITE_NAME} - 로또 분석 · 번호 생성`;
const DESCRIPTION =
  '로또 번호 생성/분석, 당첨번호 확인 등 운빨 관련 도구를 무료로 사용하세요.';

const baseMeta = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  pathname: '/',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [generateOgImageUrl(TITLE, DESCRIPTION, SITE_NAME)],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [generateOgImageUrl(TITLE, DESCRIPTION, SITE_NAME)],
  },
};

export default function RootPage() {
  const groups = MENU_LIST.filter((g) => typeof g.href === 'string');

  return (
    <section className="px-6 py-10 md:px-8 md:py-12">
      <JsonLdComponent data={jsonLdWebSite()} />
      <JsonLdComponent
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: groups.map((g, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: g.label,
            url: canonicalUrl(g.href as string),
          })),
        }}
      />
      <HeroComponent siteName={SITE_NAME} description={DESCRIPTION} />

      <div className="mt-10 space-y-10">
        {groups.map((g) => (
          <div key={g.group}>
            <Link
              href={g.href as string}
              className="text-lg font-semibold tracking-tight hover:underline"
            >
              {g.label}
            </Link>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted/40"
                >
                  <div className="text-sm font-semibold tracking-tight">
                    {it.label}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {it.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
