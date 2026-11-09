import type {
  FortuneLateZiStemBasisType,
  FortuneSajuBranchInfoType,
  FortuneSajuStemInfoType,
  FortuneSajuTenGodInfoType,
  FortuneTenGodKeyType,
} from '@/features/fortune/types/fortune-saju.type';

/** 사주 사실 데이터(design-saju-v2 V1.3). 화면 문장은 fortune-saju-notice.constant.ts에 둔다 */

export const FORTUNE_SAJU_STEMS: readonly FortuneSajuStemInfoType[] = [
  { ko: '갑', hanja: '甲', element: 'wood', isYang: true },
  { ko: '을', hanja: '乙', element: 'wood', isYang: false },
  { ko: '병', hanja: '丙', element: 'fire', isYang: true },
  { ko: '정', hanja: '丁', element: 'fire', isYang: false },
  { ko: '무', hanja: '戊', element: 'earth', isYang: true },
  { ko: '기', hanja: '己', element: 'earth', isYang: false },
  { ko: '경', hanja: '庚', element: 'metal', isYang: true },
  { ko: '신', hanja: '辛', element: 'metal', isYang: false },
  { ko: '임', hanja: '壬', element: 'water', isYang: true },
  { ko: '계', hanja: '癸', element: 'water', isYang: false },
];

export const FORTUNE_SAJU_BRANCHES: readonly FortuneSajuBranchInfoType[] = [
  { ko: '자', hanja: '子', element: 'water' },
  { ko: '축', hanja: '丑', element: 'earth' },
  { ko: '인', hanja: '寅', element: 'wood' },
  { ko: '묘', hanja: '卯', element: 'wood' },
  { ko: '진', hanja: '辰', element: 'earth' },
  { ko: '사', hanja: '巳', element: 'fire' },
  { ko: '오', hanja: '午', element: 'fire' },
  { ko: '미', hanja: '未', element: 'earth' },
  { ko: '신', hanja: '申', element: 'metal' },
  { ko: '유', hanja: '酉', element: 'metal' },
  { ko: '술', hanja: '戌', element: 'earth' },
  { ko: '해', hanja: '亥', element: 'water' },
];

export const FORTUNE_SAJU_TEN_GODS: Record<
  FortuneTenGodKeyType,
  FortuneSajuTenGodInfoType
> = {
  bigyeon: { name: '비견', hanja: '比肩' },
  geopjae: { name: '겁재', hanja: '劫財' },
  siksin: { name: '식신', hanja: '食神' },
  sanggwan: { name: '상관', hanja: '傷官' },
  pyeonjae: { name: '편재', hanja: '偏財' },
  jeongjae: { name: '정재', hanja: '正財' },
  pyeongwan: { name: '편관', hanja: '偏官' },
  jeonggwan: { name: '정관', hanja: '正官' },
  pyeonin: { name: '편인', hanja: '偏印' },
  jeongin: { name: '정인', hanja: '正印' },
};

/** 23시대 출생의 시주 천간 기준(V2 확정) */
export const FORTUNE_SAJU_LATE_ZI_STEM_BASIS: FortuneLateZiStemBasisType =
  'next-day';

/** 표준시·서머타임 안내 대상 출생 연도(S2-10, 연도 단위) */
export const FORTUNE_SAJU_DST_NOTICE_YEARS: readonly number[] = [
  1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960,
  1961, 1987, 1988,
];

/** 시드 `${prefix}|${일간 0~9}|${KST 오늘}` */
export const FORTUNE_SAJU_SEED_PREFIX = 'fortune-v1|saju';
