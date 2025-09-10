import { getCollection } from '@/services';
import { AdBannerConfigType, AdsConfigDocType } from '@/types';

function parseDimension(
  value: string | number | undefined,
  fallback: number
): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = parseInt(value, 10);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export async function getTopBannerAdConfig(): Promise<AdBannerConfigType | null> {
  const docs = await getCollection<AdsConfigDocType>('ads_config');
  if (!docs.length) return null;
  const tb = docs[0]?.top_banner;
  if (!tb?.unitId) return null;
  return {
    unitId: tb.unitId,
    width: parseDimension(tb.width, 320),
    height: parseDimension(tb.height, 100),
  };
}
