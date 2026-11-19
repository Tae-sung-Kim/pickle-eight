export type DreamCategoryKeyType =
  | 'animal' // 동물
  | 'people' // 사람·관계
  | 'body' // 신체
  | 'nature' // 자연·날씨
  | 'action' // 행동·상황
  | 'object' // 사물·장소·재물
  | 'death'; // 죽음·사고 (민감 소재)

export type DreamCategoryType = Readonly<{
  key: DreamCategoryKeyType;
  /** 화면 이름. 예: '동물', '사람·관계' */
  label: string;
}>;

/** 'none': 일반, 'sensitive': 악몽·사고·추락 반복 등, 'death': 죽음·장례처럼 죽음이 나오는 소재 */
export type DreamSensitivityType = 'none' | 'sensitive' | 'death';

export type DreamFaqItemType = Readonly<{ question: string; answer: string }>;

type DreamTopicBaseType = Readonly<{
  /** URL 조각. 소문자 영문과 하이픈만. 공개 후 바꾸지 않는다 */
  slug: string;
  /** 목록 표시 이름. 예: '돼지', '치아' */
  name: string;
  /** h1·title·검색 노출용 이름. 예: '돼지꿈', '치아 꿈', '조상 꿈' */
  keywordName: string;
  category: DreamCategoryKeyType;
  /** 별칭 2~5개. 다른 소재와 겹치지 않는다 */
  aliases: readonly string[];
  /** 한 줄 요약. 1문장, 공백 포함 20~80자 (메타 description에도 쓴다) */
  summary: string;
  /** 민간 풀이. 문장 하나가 배열 원소 하나. 3~5문장 */
  folk: readonly string[];
  /** 요즘 생각해 볼 점. 2~3문장 */
  reflection: readonly string[];
  /** 정확히 2개 */
  faq: readonly [DreamFaqItemType, DreamFaqItemType];
  /** 관련 소재 slug 2~4개. 같은 카테고리, 자기 자신 제외, 중복 없음 */
  related: readonly string[];
  /** 12지 동물(용 제외 11개)만 true. 띠별 운세 링크를 보인다 */
  isTtiAnimal?: boolean;
}>;

export type DreamTopicType = DreamTopicBaseType &
  (
    | Readonly<{ sensitivity: 'none' }>
    | Readonly<{
        sensitivity: 'sensitive' | 'death';
        /** 소재별 완화 문장 1~3개. 공포를 키우는 묘사 금지 */
        soothing: readonly string[];
      }>
  );

/** 허브 검색용 가벼운 항목. 서버가 만들어 클라이언트 root에 props로 넘긴다 */
export type DreamSearchItemType = Readonly<{
  slug: string;
  name: string;
  category: DreamCategoryKeyType;
  aliases: readonly string[];
  /** 정규화된 검색 키: 이름, keywordName, 별칭, 카테고리 이름 */
  searchKeys: readonly string[];
}>;

export type DreamHubGroupType = Readonly<{
  category: DreamCategoryType;
  items: readonly DreamSearchItemType[];
}>;
