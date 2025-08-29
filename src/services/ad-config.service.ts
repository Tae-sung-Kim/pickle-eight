import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import {
  AdConfigDocType,
  AdPlacementConfigType,
  AdSizeType,
  RawAdConfigType,
  RawAdPlacementType,
  RawAdSizeType,
} from '@/types';

function toNumber(n: unknown, fallback: number): number {
  const v = typeof n === 'string' ? Number(n) : typeof n === 'number' ? n : NaN;
  return Number.isFinite(v) ? v : fallback;
}

function normalizeSize(
  input: RawAdSizeType | undefined,
  fallback: AdSizeType
): AdSizeType {
  if (!input) return fallback;
  const unitId: string =
    typeof input.unitId === 'string' ? input.unitId : fallback.unitId;
  const width: number = toNumber(input.width, fallback.width);
  const height: number = toNumber(input.height, fallback.height);
  return { unitId, width, height };
}

function normalizePlacement(
  input: RawAdPlacementType | undefined,
  fallbackMobile: AdSizeType,
  fallbackDesktop: AdSizeType
): AdPlacementConfigType {
  const mobile = normalizeSize(input?.mobile, fallbackMobile);
  // tolerate common typo deskTop
  const desktopRaw: RawAdSizeType | undefined =
    input?.desktop ?? input?.deskTop;
  const desktop = normalizeSize(desktopRaw, fallbackDesktop);
  return { mobile, desktop };
}

/**
 * Read Ad configuration from Firestore. Returns null when missing.
 */
export async function getAdConfig(): Promise<AdConfigDocType | null> {
  try {
    const ref = doc(db, 'configs', 'ads');
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const raw = snap.data() as RawAdConfigType;

    // fallbacks to keep UI stable even when config is partial
    const fallbackMobile: AdSizeType = { unitId: '', width: 320, height: 100 };
    const fallbackDesktopBody: AdSizeType = {
      unitId: '',
      width: 300,
      height: 250,
    };
    const fallbackDesktopSide: AdSizeType = {
      unitId: '',
      width: 300,
      height: 600,
    };

    const body = normalizePlacement(
      raw.body,
      fallbackMobile,
      fallbackDesktopBody
    );

    // tolerate common typo mobieTop
    const mobileTopRaw = raw.mobileTop ?? raw.mobieTop;
    const mobileTop = mobileTopRaw
      ? { mobile: normalizeSize(mobileTopRaw.mobile, fallbackMobile) }
      : undefined;

    const desktopSideRaw = raw.desktopSide;
    const desktopSide = desktopSideRaw
      ? {
          desktop: normalizeSize(
            desktopSideRaw.desktop ?? desktopSideRaw.deskTop,
            fallbackDesktopSide
          ),
        }
      : undefined;

    const normalized: AdConfigDocType = {
      body,
      ...(mobileTop ? { mobileTop } : {}),
      ...(desktopSide ? { desktopSide } : {}),
    };

    return normalized;
  } catch (e) {
    console.error('Failed to load ad config:', e);
    return null;
  }
}
