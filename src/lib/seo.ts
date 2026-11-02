/**
 * SEO utilities for building Next.js metadata and JSON-LD payloads.
 * Code style: English, explicit types, no any.
 */

import type { Metadata } from 'next';

import { MENU_LIST } from '@/constants/menu.constant';

/** Site base URL derived from env with trailing slash removed */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pickle-eight.vercel.app'
).replace(/\/+$/, '');

/** Default site name used in titles and OpenGraph */
export const SITE_NAME: string =
  process.env.NEXT_PUBLIC_SITE_NAME ?? '운빨연구소';

/**
 * Build a canonical URL from a pathname.
 * @param pathname - Path starting with '/'
 * @returns absolute canonical URL
 */
export function canonicalUrl(pathname: string): string {
  return `${SITE_URL}${pathname}`;
}

/**
 * Build common metadata for App Router pages.
 * Keeps functions short and single-purpose.
 */
export function buildMetadata(input: {
  title: string;
  description: string;
  pathname: string;
  locale?: string;
}): Metadata {
  const { title, description, pathname, locale = 'ko-KR' } = input;
  const url: string = canonicalUrl(pathname);
  return {
    metadataBase: new URL(SITE_URL),
    // 사이트명은 루트 레이아웃의 title.template이 붙인다
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        [locale]: url,
      },
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  } as const;
}

// ---------- JSON-LD builders ----------

/** "WebSite" JSON-LD for Sitelinks SearchBox eligibility */
export function jsonLdWebSite(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `https://www.google.com/search?q=site:${SITE_URL}+{search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  } as const;
}

/** Organization JSON-LD for brand/entity signals */
export function jsonLdOrganization(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.svg`,
    sameAs: ['https://github.com/Tae-sung-Kim'],
  } as const;
}

/** BreadcrumbList JSON-LD */
export function jsonLdBreadcrumb(
  pathItems: ReadonlyArray<{ name: string; item: string }>
): Record<string, unknown> {
  const itemListElement = pathItems.map((p, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: p.name,
    item: p.item,
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  } as const;
}

/** FAQPage JSON-LD */
export function jsonLdFaq(
  faqs: ReadonlyArray<{ question: string; answer: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  } as const;
}

/**
 * Build Open Graph image descriptor used by Next.js Metadata images.
 * Appends title/subtitle (and optional tag) to `/api/og-image` URL.
 *
 * @param {string} title - Main title text.
 * @param {string} description - Subtitle text.
 * @param {string} alt - Alternative text for the image.
 * @param {string} [tag] - Optional short badge text to display.
 * @returns {{ url: string; width: number; height: number; alt: string }} Image descriptor.
 */
export function generateOgImageUrl(
  title: string,
  description: string,
  alt: string,
  tag?: string
): { url: string; width: number; height: number; alt: string } {
  const params = new URLSearchParams({ title, subtitle: description });
  if (tag) params.set('tag', tag);
  return {
    url: `${SITE_URL}/api/og-image?${params}`,
    width: 1200,
    height: 630,
    alt,
  };
}

type OgTagParams = Readonly<{
  href?: string;
  label?: string;
}>;

/**
 * Return a concise tag for OG image pill.
 */
export function getOgTag(params: OgTagParams = {}): string {
  const href: string | undefined = params.href;
  const label: string | undefined = params.label;
  if (href) {
    // group match
    const group = MENU_LIST.find((g) => g.href === href);
    if (group) return group.label;
    // item match
    for (const g of MENU_LIST) {
      const item = g.items.find((it) => it.href === href);
      if (item) return item.label;
    }
  }
  if (label) return label;
  return process.env.NEXT_PUBLIC_SITE_NAME ?? '운빨연구소';
}
