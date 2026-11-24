export type LuckyDrawToolKeyType = 'ladder' | 'roulette' | 'lots';
export type LuckyDrawPageKeyType = 'hub' | LuckyDrawToolKeyType;

/**
 * all: 일괄 공개, hidden: 결과 가리기, one-by-one: 한 명씩 열기(사다리만).
 * 제비뽑기는 공개 방식이 없다(카드 열기로 대신).
 */
export type LuckyDrawRevealModeType = 'all' | 'hidden' | 'one-by-one';

/** 공개 방식을 쓰는 도구 */
export type LuckyDrawRevealToolKeyType = Exclude<LuckyDrawToolKeyType, 'lots'>;

/** 입력 한 줄. 같은 이름이 여러 줄이어도 id가 다르다 */
export type LuckyDrawEntryType = Readonly<{ id: string; label: string }>;

export type LuckyDrawLineRuleType = Readonly<{
  minCount: number;
  maxCount: number;
  /** 코드 포인트 기준 글자 수 */
  maxLength: number;
}>;

export type LuckyDrawParsedLinesType = Readonly<{
  entries: readonly LuckyDrawEntryType[];
  /** maxCount를 넘어서 빠진 줄 수 */
  overflowCount: number;
  /** maxLength를 넘어서 빠진 줄 수 */
  tooLongCount: number;
}>;

/** [0, 2^32) 정수를 하나 돌려주는 난수 원천. 운영은 crypto, 테스트는 주입 */
export type LuckyDrawUint32SourceType = () => number;

export type LuckyDrawLadderType = Readonly<{
  columnCount: number;
  /** rows[r][g] === true: r번째 높이에서 g번 세로선과 g+1번 세로선을 잇는 가로선 */
  rows: readonly (readonly boolean[])[];
}>;

/** level 0 = 맨 위 이름 칸, level r+1 = r번째 가로선 높이, level rowCount+1 = 맨 아래 결과 칸 */
export type LuckyDrawLadderPointType = Readonly<{
  column: number;
  level: number;
}>;

export type LuckyDrawLadderTraceType = Readonly<{
  endColumn: number;
  points: readonly LuckyDrawLadderPointType[];
}>;

export type LuckyDrawLadderGameType = Readonly<{
  participants: readonly LuckyDrawEntryType[];
  results: readonly LuckyDrawEntryType[];
  ladder: LuckyDrawLadderType;
  /** 아래 결과 칸 c에 놓인 결과의 인덱스 (results 기준) */
  slotResultIndexes: readonly number[];
  /** 참가자 i가 도착하는 결과의 인덱스 */
  assignment: readonly number[];
}>;

/** 제비뽑기: 열린 카드 한 장. position은 0부터, 화면 번호는 position + 1 */
export type LuckyDrawLotsOpenedCardType = Readonly<{
  position: number;
  label: string;
}>;

/**
 * 제비뽑기: 섞은 카드 묶음.
 * 위치 → 항목 대응은 클로저 안에만 있고, 묶음 전체를 밖으로 내보내는 속성·메서드가 없다.
 * JSON.stringify(deck)은 {"size":N}만 나온다.
 */
export type LuckyDrawLotsDeckType = Readonly<{
  size: number;
  /** position 카드 한 장의 항목만 돌려준다 */
  open: (position: number) => LuckyDrawLotsOpenedCardType;
}>;

export type LuckyDrawFaqItemType = Readonly<{
  question: string;
  answer: string;
}>;

export type LuckyDrawSeoType = Readonly<{
  title: string;
  description: string;
  pathname: string;
  keywords: readonly string[];
  ogImageAlt: string;
  /** h1 */
  heading: string;
  /** h1 아래 설명 문단 (서버 렌더링) */
  headerDescription: string;
  /** 빵부스러기 마지막 이름 (허브는 사용하지 않음) */
  breadcrumbName: string;
}>;

/** 공유 카드 한 줄 (사다리, 제비뽑기) */
export type LuckyDrawShareRowType = Readonly<{ left: string; right: string }>;

/** 미리보기 옵션 */
export type LuckyDrawLadderShareOptionsType = Readonly<{ isMasked: boolean }>;
export type LuckyDrawRouletteShareOptionsType = Readonly<{
  isMasked: boolean;
  shouldIncludeCandidates: boolean;
}>;

/** 공유 카드 틀에 넘기는 값 (components/share의 ShareCardFrameType과 같은 모양) */
export type LuckyDrawShareFrameType = Readonly<{
  featureName: string;
  pathname: string;
  notice: string;
  accent: 'lucky';
}>;

export type LuckyDrawLadderShareCardType = Readonly<{
  frame: LuckyDrawShareFrameType;
  body: Readonly<{
    rows: readonly LuckyDrawShareRowType[];
    hiddenCount: number;
  }>;
}>;

export type LuckyDrawRouletteShareCardType = Readonly<{
  frame: LuckyDrawShareFrameType;
  body: Readonly<{
    picked: string;
    /** null이면 후보 영역이 없다 */
    candidates: readonly string[] | null;
    hiddenCount: number;
  }>;
}>;

export type LuckyDrawLotsShareCardType = Readonly<{
  frame: LuckyDrawShareFrameType;
  body: Readonly<{
    rows: readonly LuckyDrawShareRowType[];
    hiddenCount: number;
  }>;
}>;

export type LuckyDrawLadderBlockType =
  | 'too-few'
  | 'too-many'
  | 'count-mismatch'
  | null;
