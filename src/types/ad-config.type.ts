/**
 * Ad configuration type for runtime-controlled AdFit units.
 */
export type AdSizeType = {
  readonly unitId: string;
  readonly width: number;
  readonly height: number;
};

export type AdPlacementConfigType = {
  readonly mobile: AdSizeType;
  readonly desktop: AdSizeType;
};

export type AdConfigType = {
  /** Body area used on both mobile and desktop */
  readonly body: AdPlacementConfigType;
  /** Mobile-only top banner */
  readonly mobileTop?: {
    readonly mobile: AdSizeType;
  };
  /** Desktop-only side banner (e.g., 300x600) */
  readonly desktopSide?: {
    readonly desktop: AdSizeType;
  };
};

export type AdConfigDocType = AdConfigType;

// Raw types directly reflecting Firestore shape (tolerant to typos and string numbers)
export type RawAdSizeType = {
  readonly unitId?: unknown;
  readonly width?: unknown;
  readonly height?: unknown;
};

export type RawAdPlacementType = {
  readonly mobile?: RawAdSizeType;
  readonly desktop?: RawAdSizeType;
  // common typo tolerance
  readonly deskTop?: RawAdSizeType;
};

export type RawAdConfigType = {
  readonly body?: RawAdPlacementType;
  readonly mobileTop?: { readonly mobile?: RawAdSizeType };
  // common typo tolerance
  readonly mobieTop?: { readonly mobile?: RawAdSizeType };
  readonly desktopSide?: {
    readonly desktop?: RawAdSizeType;
    readonly deskTop?: RawAdSizeType;
  };
};
