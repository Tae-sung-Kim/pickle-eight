export type AdBannerConfigType = {
  unitId: string;
  width: number;
  height: number;
};

export const AD_TOP_BANNER: AdBannerConfigType | null = process.env
  .NEXT_PUBLIC_ADFIT_UNIT_ID
  ? {
      unitId: process.env.NEXT_PUBLIC_ADFIT_UNIT_ID,
      width: 320,
      height: 100,
    }
  : null;
