export type FortuneCalendarKindType = 'solar' | 'lunar';

/** 양력 연·월·일 (월 1~12) */
export type FortuneYmdType = Readonly<{
  year: number;
  month: number;
  day: number;
}>;

/** 폼 입력값. 메모리에서만 쓴다. 저장·전송·URL·로그 금지 */
export type FortuneBirthInputType = Readonly<{
  calendar: FortuneCalendarKindType;
  year: number;
  month: number;
  day: number;
  /** 음력일 때만 의미 있음 */
  isLeapMonth: boolean;
}>;

/** 시계 시각(출생 당시 표준시·서머타임 보정 안 함) */
export type FortuneClockTimeType = Readonly<{ hour: number; minute: number }>;

export type FortuneBirthErrorType =
  | 'empty' // 연·월·일 중 하나라도 비어 있음
  | 'invalid-date' // 양력에 없는 날짜 (2월 30일 등)
  | 'before-min' // 1920-01-01 이전 (양력 환산 기준)
  | 'after-max' // 2028-12-31 이후 (지원 범위 밖, D14. 양력 환산 기준)
  | 'future' // KST 오늘보다 뒤
  | 'lunar-no-leap' // 그해 그 달에 윤달이 없음
  | 'lunar-invalid-day' // 그 음력 달에 없는 날 (29일까지인 달의 30일)
  | 'out-of-table'; // 달력 표 범위 밖 (정상 입력에서는 나오지 않음)

export type FortuneBirthResolvedType =
  | Readonly<{ ok: true; solar: FortuneYmdType; isFromLunar: boolean }>
  | Readonly<{ ok: false; error: FortuneBirthErrorType }>;

/**
 * 판정 결과. 경계일이면 시각을 묻고, 시각을 모르면 두 후보를 보인다.
 * unsupported는 절기 표 범위 밖 연도(방어용, 정상 입력에서는 나오지 않음, 4.10)
 */
export type FortuneDetermineType<K extends string> =
  | Readonly<{ kind: 'single'; key: K }>
  | Readonly<{
      kind: 'need-time';
      before: K;
      after: K;
      boundary: FortuneClockTimeType;
    }>
  | Readonly<{ kind: 'unsupported' }>;

export type FortuneCategoryKeyType =
  | 'total'
  | 'money'
  | 'love'
  | 'work'
  | 'health';
export type FortuneBandType = 'high' | 'mid' | 'low';
export type FortuneVariantsType = readonly [string, string, string];
export type FortuneBandPoolType = Readonly<
  Record<FortuneBandType, FortuneVariantsType>
>;
/** 한 묶음(개인 / 띠 하나 / 별자리 하나 / 십신 하나)의 문구 */
export type FortuneCategoryPoolType = Readonly<
  Record<FortuneCategoryKeyType, FortuneBandPoolType>
>;
/** 공통 문구: 한 줄 요약·조언·주의 */
export type FortuneCommonPoolType = Readonly<{
  summary: FortuneBandPoolType;
  advice: FortuneBandPoolType;
  caution: FortuneBandPoolType;
}>;

export type FortuneElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export type FortuneLuckyType = Readonly<{
  element: FortuneElementType;
  color: string; // 예: '초록'
  direction: string; // 예: '동쪽'
  numbers: readonly number[]; // 1~2개, 각 1~10
}>;

export type FortuneScoredTextType = Readonly<{
  score: number;
  band: FortuneBandType;
  text: string;
}>;

export type FortuneReadingType = Readonly<{
  dateKey: string; // KST 'YYYY-MM-DD'
  total: FortuneScoredTextType;
  summary: string;
  money: FortuneScoredTextType;
  love: FortuneScoredTextType;
  work: FortuneScoredTextType;
  health: FortuneScoredTextType;
  lucky: FortuneLuckyType;
  advice: string;
  caution: string;
}>;

export type FortuneTtiKeyType =
  | 'rat'
  | 'ox'
  | 'tiger'
  | 'rabbit'
  | 'dragon'
  | 'snake'
  | 'horse'
  | 'goat'
  | 'monkey'
  | 'rooster'
  | 'dog'
  | 'pig';

export type FortuneStarSignKeyType =
  | 'capricorn'
  | 'aquarius'
  | 'pisces'
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius';

export type FortuneConsentStatusType =
  | 'checking'
  | 'required'
  | 'declined'
  | 'granted';

/** sessionStorage 저장 형식. 이 세 필드 외에는 넣지 않는다 */
export type FortuneConsentStoredType = Readonly<{
  v: 1;
  /** 동의한 안내문 버전. FORTUNE_CONSENT_VERSION과 다르면 무효 */
  version: string;
  /** 동의 시각. new Date().toISOString() (UTC ISO 8601) */
  agreedAt: string;
}>;

export type FortuneFaqItemType = Readonly<{ question: string; answer: string }>;
