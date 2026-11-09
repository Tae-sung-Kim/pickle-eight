import type { FortuneElementType } from '@/features/fortune/types/fortune.type';

/**
 * 사주 화면 표시용 사실 데이터(문장이 아님). fortune-saju.constant.ts를 고치지 않고 SJ-FE05가 따로 둔다.
 * 오행 순서는 목 화 토 금 수(상생 순서, 기존 행운 표와 같다)
 */
export const FORTUNE_SAJU_ELEMENT_ROWS: readonly Readonly<{
  key: FortuneElementType;
  name: string;
}>[] = [
  { key: 'wood', name: '목' },
  { key: 'fire', name: '화' },
  { key: 'earth', name: '토' },
  { key: 'metal', name: '금' },
  { key: 'water', name: '수' },
];

/** 오행 눈금 칸 수. 표에 보이는 글자 수와 같다(4기둥 8, 3기둥 6) */
export const FORTUNE_SAJU_SCALE_CELLS_WITH_HOUR = 8;
export const FORTUNE_SAJU_SCALE_CELLS_WITHOUT_HOUR = 6;

/**
 * 계산 기준 영역의 앵커 id. 시간 단계의 "계산 기준 보기" 링크가 이동한다.
 * 페이지(SJ-FE06)가 FortuneCalcBasisComponent를 이 id의 요소로 감싼다(공용 컴포넌트는 id를 받지 않는다)
 */
export const FORTUNE_SAJU_CALC_BASIS_ANCHOR_ID = 'saju-calc-basis';
