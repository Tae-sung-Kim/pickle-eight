import type { Metadata } from 'next';
import Link from 'next/link';
import { MenuCardGridComponent } from '@/components/menu-card-grid.component';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { MENU_LIST } from '@/constants/menu.constant';
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
  const groups = MENU_LIST.filter((g) => g.items.length > 0);

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
            url: canonicalUrl(g.href ?? g.items[0].href),
          })),
        }}
      />
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        {SITE_NAME}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {DESCRIPTION}
      </p>

      <div className="mt-8 space-y-10">
        {groups.map((g) => (
          <div key={g.group}>
            {g.href ? (
              <Link
                href={g.href}
                className="text-lg font-semibold tracking-tight hover:underline"
              >
                {g.label}
              </Link>
            ) : (
              <h2 className="text-lg font-semibold tracking-tight">
                {g.label}
              </h2>
            )}
            <div className="mt-4">
              <MenuCardGridComponent items={g.items} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
