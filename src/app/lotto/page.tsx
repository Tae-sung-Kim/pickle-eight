import type { Metadata } from 'next';
import { MenuListComponent } from '@/components/menu-list.component';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM, MENU_LIST } from '@/constants/menu.constant';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';
import { getOgTag } from '@/utils/seo.util';

const PATHNAME = `/${MENU_GROUP_NAME_ENUM.LOTTO}`;
const TITLE = '로또 - 번호 생성 · 분석 · 당첨 확인';
const DESCRIPTION =
  '로또 번호 생성, 당첨번호 확인, 회차별 기록, 통계 분석, 나의 번호 보관 등 로또 관련 기능을 모아봤어요.';

const baseMeta = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  pathname: PATHNAME,
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        `${TITLE} | ${process.env.NEXT_PUBLIC_SITE_NAME as string}`,
        DESCRIPTION,
        '로또',
        getOgTag({ href: PATHNAME })
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        `${TITLE} | ${process.env.NEXT_PUBLIC_SITE_NAME as string}`,
        DESCRIPTION,
        '로또',
        getOgTag({ href: PATHNAME })
      ),
    ],
  },
};

export default function LottoPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || '운빨연구소';
  const items =
    MENU_LIST.find((g) => g.group === MENU_GROUP_NAME_ENUM.LOTTO)?.items ?? [];

  const crumbs = jsonLdBreadcrumb([
    { name: siteName, item: canonicalUrl('/') },
    { name: '로또', item: canonicalUrl(PATHNAME) },
  ]);

  return (
    <section>
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <JsonLdComponent
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: items.map((it, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: it.label,
            url: canonicalUrl(it.href),
            description: it.description,
          })),
        }}
      />
      <MenuListComponent items={items} />
    </section>
  );
}
