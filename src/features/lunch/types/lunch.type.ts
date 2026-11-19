export type LunchCategoryKeyType =
  | 'korean' // 한식
  | 'chinese' // 중식
  | 'japanese' // 일식
  | 'western' // 양식
  | 'bunsik' // 분식
  | 'world'; // 세계·기타

export type LunchCategoryType = Readonly<{
  key: LunchCategoryKeyType;
  /** 화면 이름. 예: '한식', '세계·기타' */
  label: string;
}>;

/** 메뉴 속성. 'soup': 국물 있음, 'dry': 국물 없음 */
export type LunchBrothType = 'soup' | 'dry';

/** 필터 값. 'all'은 국물 조건 없음 */
export type LunchBrothFilterType = 'all' | LunchBrothType;

export type LunchMenuType = Readonly<{
  /** 고정 키. 소문자 영문·하이픈. React key와 직전 메뉴 비교에만 쓰고 화면·URL에 쓰지 않는다 */
  id: string;
  /** 화면 표시 이름. 일반 음식 이름만. 예: '김치찌개' */
  name: string;
  category: LunchCategoryKeyType;
  broth: LunchBrothType;
  /** 지도 검색어. 없으면 name을 쓴다. 넣을 때는 name을 그대로 포함해야 한다(AC-15) */
  mapQuery?: string;
}>;

export type LunchFilterType = Readonly<{
  categories: readonly LunchCategoryKeyType[];
  broth: LunchBrothFilterType;
}>;

export type LunchMapProviderKeyType = 'kakao' | 'naver' | 'google';

export type LunchMapLinkType = Readonly<{
  provider: LunchMapProviderKeyType;
  /** 링크 이름. 예: '카카오맵에서 찾아보기' */
  label: string;
  href: string;
}>;

export type LunchFaqItemType = Readonly<{ question: string; answer: string }>;
