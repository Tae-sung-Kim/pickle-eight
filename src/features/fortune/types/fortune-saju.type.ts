import type {
  FortuneClockTimeType,
  FortuneElementType,
} from '@/features/fortune/types/fortune.type';

export type FortuneStemIndexType = number; // 0 갑 ~ 9 계
export type FortuneBranchIndexType = number; // 0 자 ~ 11 해
export type FortunePillarType = Readonly<{
  stem: FortuneStemIndexType;
  branch: FortuneBranchIndexType;
}>;

export type FortuneTenGodKeyType =
  | 'bigyeon'
  | 'geopjae'
  | 'siksin'
  | 'sanggwan'
  | 'pyeonjae'
  | 'jeongjae'
  | 'pyeongwan'
  | 'jeonggwan'
  | 'pyeonin'
  | 'jeongin';

/**
 * 23:00~23:59 출생의 시주 천간 기준(V2).
 * 'next-day'가 채택값이다. 'same-day'는 학파로 확인되지 않아 채택하지 않았고(plan 용어 정리),
 * 단위 테스트에서 두 값의 차이를 확인하는 데만 쓴다. 화면 문구·안내 상수에 쓰지 않는다
 */
export type FortuneLateZiStemBasisType = 'same-day' | 'next-day';

export type FortuneSajuChartType = Readonly<{
  year: FortunePillarType;
  month: FortunePillarType;
  day: FortunePillarType;
  /** 시간 모름이면 null */
  hour: FortunePillarType | null;
  /** 표에 보이는 글자(8자 또는 6자)의 오행 개수. 지지는 본래 오행으로 센다. 음양은 쓰지 않는다 */
  elements: Readonly<Record<FortuneElementType, number>>;
}>;

/** 경계일 정보. 입춘이면 연주·월주가, 그 밖의 절기(짝수 인덱스)면 월주만 갈린다 */
export type FortuneSajuBoundaryType = Readonly<{
  kind: 'year' | 'month';
  /** 절기 인덱스(짝수). 입춘은 2 */
  termIndex: number;
  /** 그날 절기 시각(KST 시계 시각) */
  time: FortuneClockTimeType;
}>;

export type FortuneSajuChartsResultType =
  | Readonly<{ kind: 'single'; chart: FortuneSajuChartType }>
  /** 경계일 + 시간 모름. charts[0] = 절기 전, charts[1] = 절기 후 */
  | Readonly<{
      kind: 'need-choice';
      boundary: FortuneSajuBoundaryType;
      charts: readonly [FortuneSajuChartType, FortuneSajuChartType];
    }>
  | Readonly<{ kind: 'unsupported' }>;

/** 천간 정보(사실 데이터) */
export type FortuneSajuStemInfoType = Readonly<{
  ko: string; // '갑'
  hanja: string; // '甲'
  element: FortuneElementType;
  isYang: boolean; // 천간 음양. 십신 판정에 쓴다
}>;

/** 지지 정보(사실 데이터). 지지 음양은 두지 않는다(plan 보정 3, AC-55) */
export type FortuneSajuBranchInfoType = Readonly<{
  ko: string; // '자'
  hanja: string; // '子'
  element: FortuneElementType;
}>;

export type FortuneSajuTenGodInfoType = Readonly<{
  name: string; // '정재'
  hanja: string; // '正財' (표시 여부는 ui-ux-design.md)
}>;
