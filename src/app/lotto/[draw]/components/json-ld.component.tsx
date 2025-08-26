import { ReactElement } from 'react';

export type JsonLdType = {
  readonly url: string;
  readonly draw: string;
  readonly valid: boolean;
  readonly description: string;
};

export function JsonLdComponent({
  url,
  draw,
  valid,
  description,
}: JsonLdType): ReactElement {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '로또',
        item: `${url.replace(/\/lotto\/.+$/, '/lotto')}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: valid ? `${draw}회차` : '잘못된 회차',
        item: url,
      },
    ],
  } as const;

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: valid
      ? `로또 ${draw}회차 - 당첨번호 상세`
      : '로또 회차 - 잘못된 회차',
    url,
    description,
  } as const;

  const json = [breadcrumb, webPage] as const;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default JsonLdComponent;
