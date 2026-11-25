export type AdBannerConfigType = {
  unitId: string;
  width: number;
  height: number;
};

// 로컬 개발 등에서 광고 영역 전체를 숨길 때 'true'로 설정
export const ADS_DISABLED: boolean =
  process.env.NEXT_PUBLIC_ADFIT_DISABLED === 'true';

export const AD_TOP_BANNER: AdBannerConfigType | null =
  !ADS_DISABLED && process.env.NEXT_PUBLIC_ADFIT_UNIT_ID
    ? {
        unitId: process.env.NEXT_PUBLIC_ADFIT_UNIT_ID,
        width: 320,
        height: 100,
      }
    : null;

// 하단 배너 (320x100). 환경변수가 없으면 null
export const AD_BOTTOM_BANNER: AdBannerConfigType | null =
  !ADS_DISABLED && process.env.NEXT_PUBLIC_ADFIT_UNIT_ID_BOTTOM
    ? {
        unitId: process.env.NEXT_PUBLIC_ADFIT_UNIT_ID_BOTTOM,
        width: 320,
        height: 100,
      }
    : null;
