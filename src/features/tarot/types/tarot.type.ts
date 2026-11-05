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

export type TarotQuestionTopicKeyType = 'love' | 'career' | 'money' | 'daily';

export type TarotQuestionTopicType = Readonly<{
  key: TarotQuestionTopicKeyType;
  /** '연애·인간관계' | '직업·학업' | '재물·생활' | '일상 조언' */
  label: string;
  /** 칩을 누르면 입력칸에 채울 예시 (투자·도박 예시 금지) */
  examples: readonly string[];
}>;

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
