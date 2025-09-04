/**
 * SEO utilities for building Next.js metadata and JSON-LD payloads.
 * Code style: English, explicit types, no any.
 */

import type { Metadata } from 'next';

/** Site base URL derived from env with trailing slash removed */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pickle-eight.vercel.app'
).replace(/\/+$/, '');

/** Default site name used in titles and OpenGraph */
export const SITE_NAME: string = 'Pickle Eight';

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
    title: {
      default: `${title} | ${SITE_NAME}`,
      template: `%s | ${SITE_NAME}`,
    },
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
