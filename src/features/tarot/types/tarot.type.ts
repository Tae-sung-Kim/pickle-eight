export type TarotArcanaType = 'major' | 'minor';
export type TarotSuitType = 'wands' | 'cups' | 'swords' | 'pentacles';
export type TarotOrientationType = 'upright' | 'reversed';

/** 방향 하나의 뜻: 키워드 정확히 3개 + 요약 1~2문장 */
export type TarotMeaningType = Readonly<{
  keywords: readonly [string, string, string];
  summary: string;
}>;

export type TarotCardType = Readonly<{
  /** 0~77 고유 번호. localStorage에 저장하는 값이므로 한 번 정하면 바꾸지 않는다 */
  id: number;
  arcana: TarotArcanaType;
  /** 메이저는 null */
  suit: TarotSuitType | null;
  /** 메이저: 카드 번호 0~21. 마이너: 1(에이스)~10, 11 페이지, 12 나이트, 13 퀸, 14 킹 */
  rank: number;
  /** 예: '바보', '완드 에이스', '컵 페이지' */
  nameKo: string;
  /** 예: 'The Fool', 'Ace of Wands', 'Page of Cups' */
  nameEn: string;
  upright: TarotMeaningType;
  reversed: TarotMeaningType;
  /** 카드 보충 문구. 현재는 죽음 카드(id 13)만 사용 */
  note?: string;
}>;

export type TarotDrawnCardType = Readonly<{
  cardId: number;
  isReversed: boolean;
}>;

export type TarotSpreadPositionKeyType = 'past' | 'present' | 'future';

export type TarotSpreadPositionType = Readonly<{
  key: TarotSpreadPositionKeyType;
  /** '과거' | '현재' | '미래' */
  label: string;
  /** 위치 안내 한 줄 */
  guide: string;
}>;

/** 분야 해석 문장을 고르는 수트 그룹. 메이저 22장은 'major', 마이너는 수트 */
export type TarotSuitGroupType = 'major' | TarotSuitType;

/** 분야 4개 */
export type TarotTopicKeyType = 'love' | 'career' | 'money' | 'daily';

/** 분야 칩 선택값. 'all'(전체)이 기본이며 공통 문장을 쓴다 */
export type TarotTopicSelectionType = 'all' | TarotTopicKeyType;

export type TarotTopicType = Readonly<{
  key: TarotTopicSelectionType;
  /** '전체' | '연애·인간관계' | '직업·학업' | '재물·생활' | '일상 조언' */
  label: string;
}>;

/** 방향별 문장 한 쌍 */
export type TarotOrientationTextType = Readonly<
  Record<TarotOrientationType, string>
>;

/** 분야 해석 문장 40개: 수트 그룹 5 x 분야 4 x 방향 2 */
export type TarotTopicReadingMapType = Readonly<
  Record<
    TarotSuitGroupType,
    Readonly<Record<TarotTopicKeyType, TarotOrientationTextType>>
  >
>;

/** 세 장 방향 구성. 역방향 0장 'upright', 3장 'reversed', 그 외 'mixed' */
export type TarotStoryToneType = 'upright' | 'mixed' | 'reversed';

/** 분야 하나의 이야기 문장 세트 */
export type TarotStorySetType = Readonly<{
  /** 위치별 연결 문장 틀. 자리표시자 {card}, {keyword} */
  positions: Readonly<
    Record<TarotSpreadPositionKeyType, TarotOrientationTextType>
  >;
  /** 마무리 문장(자리표시자 없음). 세 장 방향 구성으로 고른다 */
  closing: Readonly<Record<TarotStoryToneType, string>>;
}>;

/** 'all'(공통) + 분야 4개 = 5세트 */
export type TarotStoryMapType = Readonly<
  Record<TarotTopicSelectionType, TarotStorySetType>
>;

/** localStorage 저장 형식 (오늘의 카드) */
export type TarotDailyStoredType = Readonly<{
  v: 1;
  /** KST 기준 'YYYY-MM-DD' */
  date: string;
  /** 0~77 */
  cardId: number;
  isReversed: boolean;
}>;

export type TarotFaqItemType = Readonly<{ question: string; answer: string }>;
