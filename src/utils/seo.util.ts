import { MENU_LIST } from "@/constants/menu.constant";

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
    if (group) return `${group.label} 허브`;
    // item match
    for (const g of MENU_LIST) {
      const item = g.items.find((it) => it.href === href);
      if (item) return item.label;
    }
  }
  if (label) return label;
  return process.env.NEXT_PUBLIC_SITE_NAME ?? '운빨연구소';
}
