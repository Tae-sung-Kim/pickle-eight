# dream 설계서

입력: `docs/dream/plan.md` (승인 2026-11-19), `docs/research/dream-interpretation.md` (4장 저작권, 5장 법적·표현 주의점)
참고 규칙: `docs/conventions/tech-stack.md`, `code-style.md`, `data-storage.md`, `seo.md`
형식 참고: `docs/tarot/design.md`, `docs/fortune/design.md`
작성일: 2026-11-19
작성: architect
상태: 승인 대기. 20장 열린 질문(D1~D3)에 사용자 답이 필요하다.

## 0. 요약

- 서버 저장, API, DB가 없는 순수 프론트 기능이다. 소재 120개와 고정 문구는 모두 코드 상수(TS 파일)다. 브라우저 저장소도 쓰지 않는다.
- 라우트는 `/dream`(허브)과 `/dream/[slug]`(소재 상세) 두 개다. 둘 다 서버 컴포넌트 페이지이고 빌드 때 정적으로 만든다(`generateStaticParams`). 클라이언트 컴포넌트는 허브의 검색 영역 하나뿐이다.
- 검색은 브라우저 안에서만 한다. 서버는 검색용 가벼운 목록(slug, 이름, 별칭, 카테고리)만 props로 넘기고, 소재 본문은 클라이언트 번들에 넣지 않는다. 검색어는 URL, 저장소, 분석, 네트워크 어디에도 나가지 않는다.
- 위기 표현 감지는 타로의 감지 목록과 정규화 함수를 공용으로 올려 같이 쓰는 안을 추천한다(D1).
- 메뉴는 `MENU_LIST`에 "꿈 해몽" 그룹(하위 1개 "꿈 소재 찾기")을 추가한다. 헤더 PC·모바일 메뉴와 홈은 코드 변경 없이 자동으로 보인다. 소재 상세 120개는 `src/app/sitemap.ts`에 직접 추가한다.
- 새 라이브러리는 없다.
- 표현 규칙, 로또 키워드, 분량, 데이터 규칙은 Playwright 테스트(`e2e/dream-copy.spec.ts`)에서 데이터 상수를 import해 검사하고, 렌더링된 HTML은 `e2e/dream.spec.ts`에서 검사한다(타로·운세 선례).
- 사용자 노출 문구는 모두 합니다체다. 짧은 UI 문구(버튼, 칩)는 명사형이다. 화면 문구의 최종 형태는 `docs/dream/ui-ux-design.md`가 정한다.

## 1. 승인된 결정 (plan 열린 질문의 답)

2026-11-19 사용자가 plan 열린 질문을 모두 기본안으로 확정했다. 이 설계는 아래를 전제로 한다.

| plan 질문 | 결정 | 설계 반영 |
|---|---|---|
| 1 메뉴 색 | UI/UX 단계에서 정한다 | 이 문서는 색 토큰을 정하지 않는다. 고칠 파일과 키만 적는다(9장) |
| 2 메뉴 구조 | 그룹 "꿈 해몽" + 하위 1개 "꿈 소재 찾기" | 9장 |
| 3 소재 수 | 120개 | `DREAM_TOPIC_COUNT = 120` |
| 4 주소 형식 | 영문 로마자 slug | 3.3 |
| 5 용꿈 | 제외 | 12지 동물은 용을 뺀 11개. 동물 24개는 그대로 두고 나머지 13개를 12지 밖 동물로 채운다 |
| 6, 7 복권·자살·자해 소재 | 제외 | 데이터 검사(10장) |
| 8 상담 안내 범위 | 모든 상세 하단에 상시 노출 | 6.2 |
| 9 검색 위기 표현 감지 | 적용. 결과는 막지 않고 서버 전송 없음 | 5장 |
| 10 분량 기준 | 공백 포함 300자 이상, 미달은 출시 전 검사 실패 | 10장 |
| 11 공개 방식 | 동의 게이트 없이 공개 | 동의 상태를 읽거나 쓰지 않는다 |
| 12 연령 | 게이트 없음 | 연령 확인 provider를 쓰지 않는다 |
| 13 법률 검토 | 받지 않고 운영자가 위험을 수용 | 12장 |
| 14 고지 문구 | plan 초안 그대로 승인 | `dream-notice.constant.ts`에 원문 그대로 옮긴다 |
| 15 면책의 복권 문구 | 넣지 않음 | 로또 키워드 0건 유지 |
| 16 원전 | 참고만 하고 인용·판본 표기 없음 | 12장 |
| 17 다른 메뉴 연결 | 띠 동물 소재에서 띠별 운세 링크를 두고 동의 안내를 붙인다. 오늘의 운세 쪽 링크는 후속 | 6.2 |
| 18 홈 | 자동 노출만 | 홈 코드 변경 없음 |
| 21 목표 키워드 | 허브 title에 "꿈 해몽"을 넣고 일반 검색은 목표로 잡지 않음 | 8장 |
| 23 소재 이름 참고 | 참고만 하고 목록을 통째로 옮기지 않음 | 12장 |

19(출시 시점), 20(처리방침 분석 항목), 22(검색량)는 설계 대상이 아니다. 20은 확인 결과 `src/app/privacy/page.tsx` 6장에 "Vercel Web Analytics: 방문 통계. 쿠키를 사용하지 않고 페이지 조회 수 등 집계 정보를 처리" 문구가 이미 있다. 꿈 해몽은 새 수집 항목이 없으므로 기존 분석 설명에 덧붙일 것은 없고, 꿈 해몽 항목만 추가한다(18장 F6).

## 2. 폴더 구조

```
src/app/dream/
  page.tsx                              # 신규. DreamHubPage (서버)
  [slug]/page.tsx                       # 신규. DreamTopicPage (서버). generateStaticParams, generateMetadata
  [slug]/not-found.tsx                  # 신규. 없는 소재 안내 + 허브 링크 (서버)

src/features/dream/
  types/
    dream.type.ts                       # 꿈 해몽 타입 전부 (3.1, 확정)
  constants/
    topics/
      animal.constant.ts                # DREAM_ANIMAL_TOPICS (24)
      people.constant.ts                # DREAM_PEOPLE_TOPICS (14)
      body.constant.ts                  # DREAM_BODY_TOPICS (12)
      nature.constant.ts                # DREAM_NATURE_TOPICS (14)
      action.constant.ts                # DREAM_ACTION_TOPICS (24)
      object.constant.ts                # DREAM_OBJECT_TOPICS (24)
      death.constant.ts                 # DREAM_DEATH_TOPICS (8)
    dream-topics.constant.ts            # DREAM_TOPICS (120 합본), DREAM_TOPIC_COUNT. 서버 전용
    dream-category.constant.ts          # DREAM_CATEGORIES (7개, 순서·이름)
    dream-route.constant.ts             # DREAM_HUB_PATH, DREAM_TTI_PATH
    dream-search.constant.ts            # 검색 최대 길이, 검색어 끝 접미어 목록
    dream-notice.constant.ts            # 상시 면책, 하단 짧은 면책, 풀이 기준, 반복 꿈 안내, 죽음 보충, 상담 안내 첫 문장,
                                        # 판단 책임, 검색칸 안내, 검색 JS 안내, 결과 없음 안내, 자유 서술 미지원 안내,
                                        # 띠별 운세 링크 동의 안내, 허브 상세 안내 6항, 위기 안내 문장
    dream-faq.constant.ts               # DREAM_HUB_FAQ (3~5개)
    dream-seo.constant.ts               # 허브 title·description·keywords·OG alt·heading, 브레드크럼 그룹 이름
    dream-copy-rule.constant.ts         # 금지 표현·로또 키워드·수치 자랑 목록과 허용 예외 문장 (검사 전용, 화면에서 import 금지)
  utils/
    dream-topic.util.ts                 # slug로 찾기, 카테고리별 묶기, 관련 소재, 검색 목록 만들기, 상세 경로. 서버 전용
    dream-search.util.ts                # 정규화, 접미어 제거, 필터, 그룹 묶기. 클라이언트에서도 쓴다
    dream-seo.util.ts                   # 상세 메타데이터 입력값, 상세 JSON-LD 만들기
  shared/components/
    disclaimer-notice.component.tsx     # 상시 면책 (서버, h1 바로 아래)
    basis-notice.component.tsx          # 풀이 기준 (서버, 허브·상세)
    bottom-notice.component.tsx         # 하단 짧은 면책 + 판단 책임 (서버)
    crisis-phones.component.tsx         # 상담 안내 블록, 다섯 곳 (서버, 허브·상세 하단)
    faq.component.tsx                   # FAQ 목록 (서버, 허브·상세)
    breadcrumb.component.tsx            # 화면용 이동 경로 nav (서버, 허브·상세)
  hub/components/
    root.component.tsx                  # 'use client'. DreamHubComponent. 검색 상태와 필터 결과
    search-input.component.tsx          # 검색칸 (Controlled) + 개인 내용 주의 안내
    crisis-notice.component.tsx         # 검색어 위기 감지 시 결과 위 상담 안내 (props만)
    result-status.component.tsx         # 결과 개수 aria-live 문장
    category-list.component.tsx         # 카테고리별 소재 링크 목록
    empty.component.tsx                 # 결과 없음 안내 + "전체 목록 보기" 버튼
    noscript-notice.component.tsx       # <noscript> 검색 JS 안내 (서버)
    detail-notice.component.tsx         # 허브 상세 안내 6항 (서버)
  topic/components/
    root.component.tsx                  # DreamTopicComponent (서버). 상세 본문 조립
    reading.component.tsx               # 한 줄 요약, 민간 풀이, 요즘 생각해 볼 점 (서버)
    soothing.component.tsx              # 민감 소재 완화 블록 + 반복 꿈 안내 + 죽음 보충 (서버)
    tti-link.component.tsx              # 띠 동물만: 띠별 운세 링크 + 동의 안내 (서버)
    related.component.tsx               # 관련 소재 2~4개 링크 (서버)
    back-link.component.tsx             # 허브로 돌아가기 (서버)

src/constants/crisis-term.constant.ts   # (D1 추천안) 위기 표현 목록 공용화
src/lib/crisis-signal.ts                # (D1 추천안) 정규화 + 위기 감지 공용 함수

docs/dream/
  copy-log.md                           # 소재 문구 작성·검수 이력 (11장)

e2e/
  dream-copy.spec.ts                    # 데이터·문구·정적 소스 검사 (10장)
  dream.spec.ts                         # 화면·HTML·SEO 검사 (10장)
```

- 컴포넌트 이름: `features/dream/hub/components/root.component.tsx` → `DreamHubComponent`, `topic/components/root.component.tsx` → `DreamTopicComponent`, `shared/components/faq.component.tsx` → `DreamFaqComponent`, `hub/components/search-input.component.tsx` → `DreamHubSearchInputComponent`, `topic/components/related.component.tsx` → `DreamTopicRelatedComponent`.
- 페이지 이름: `DreamHubPage`, `DreamTopicPage`, `DreamTopicNotFound` (default export).
- `features/dream/`은 다른 기능(tarot, fortune, lotto)을 import하지 않는다. 띠별 운세 링크는 경로 문자열(`'/fortune/tti'`)만 쓴다.
- `shared/components/`의 항목은 허브와 상세가 모두 쓰므로 처음부터 shared에 둔다.

## 3. 타입과 소재 데이터 (확정)

### 3.1 타입

`src/features/dream/types/dream.type.ts`. 개발 담당과 문구 작성자가 임의로 바꾸지 않는다.

```ts
export type DreamCategoryKeyType =
  | 'animal'   // 동물
  | 'people'   // 사람·관계
  | 'body'     // 신체
  | 'nature'   // 자연·날씨
  | 'action'   // 행동·상황
  | 'object'   // 사물·장소·재물
  | 'death';   // 죽음·사고 (민감 소재)

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
  /** 목록 표시 이름. 예: '돼지', '이빨 빠지는 꿈' */
  name: string;
  /** h1·title·검색 노출용 이름. 예: '돼지꿈', '이빨 빠지는 꿈', '조상 꿈' */
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
```

- 민감 소재는 `sensitivity`로 구분하고 `soothing`이 반드시 있도록 타입으로 강제한다.
- 작성 이력 필드는 데이터에 넣지 않는다. 화면 번들에 들어갈 이유가 없다. 이력은 `docs/dream/copy-log.md`에 둔다(타로 선례).
- 길흉 필드, 점수, 행운 숫자, 성별 필드는 두지 않는다(plan 결정 2, 3).

### 3.2 파일 분할과 작성 단위

- 카테고리마다 파일 하나, 모두 7개(`constants/topics/*.constant.ts`). 파일당 8~24개라 묶음 단위 작성·검수와 copy-log 묶음이 같아지고 리뷰 diff가 작다.
- 각 배열은 `as const satisfies readonly DreamTopicType[]`로 선언한다. 필드 누락, FAQ 개수(정확히 2), 민감 소재의 `soothing` 누락은 typecheck에서 잡힌다. 개수 범위(별칭 2~5, 문장 수, 분량)는 타입으로 못 잡으므로 10장 데이터 검사에서 잡는다.
- 배열 순서가 곧 허브 목록의 카테고리 안 순서다.
- `dream-topics.constant.ts`가 일곱 배열을 `DREAM_CATEGORIES` 순서로 합쳐 `DREAM_TOPICS: readonly DreamTopicType[]`를 내보낸다. `DREAM_TOPIC_COUNT = 120`.
- 데이터 형식은 타로 D3 선례대로 TS 상수 파일로 한다. JSON은 쓰지 않는다(타입 검사가 약해지고 별도 검증 코드가 필요하다).
- 작성 순서(plan 풀이 규칙 9)
  1. 샘플 10개: 일곱 카테고리에 고루 나눠 해당 카테고리 파일에 쓴다. 민감 소재(죽음 1, 사고 또는 추락 1)를 반드시 포함한다. copy-log 상태는 "샘플".
  2. 사용자 검수와 톤 수정.
  3. 나머지 110개: 카테고리 파일 단위로 쓴다. 한 묶음이 끝날 때마다 `e2e/dream-copy.spec.ts`를 돌려 통과시킨 뒤 copy-log를 갱신한다.
  4. 완성 후 웹 검색 샘플 점검(11장).
- 카테고리별 목표 수(plan 표): 동물 24(12지 11 포함), 사람·관계 14, 신체 12, 자연·날씨 14, 행동·상황 24, 사물·장소·재물 24, 죽음·사고 8. 합계 120. 테스트는 합계 120과 카테고리당 1개 이상만 강제하고(AC-42), 카테고리별 수는 검색량 확인 뒤 사용자 승인으로 조정할 수 있다.

### 3.3 slug 규칙

- 형식: `/^[a-z]+(-[a-z]+)*$/`. 숫자, 대문자, 밑줄, 한글 없음. 40자 이하.
- 영어 일반 명사·동사구를 기본으로 쓴다. 예: `pig`, `snake`, `teeth`, `being-chased`, `ancestor`. 알맞은 영어가 없으면 국어의 로마자 표기법으로 쓴다.
- 모든 slug는 서로 달라야 한다. `dragon`, `lottery`, `lotto`, `taemong`, `suicide` 같은 제외 소재의 slug는 쓰지 않는다.
- 공개 후 바꾸면 `next.config.ts`에 301 redirect가 필요하다(seo.md). 그래서 샘플 검수 때 slug도 같이 확정한다.

### 3.4 문구 구성 규칙 (plan 풀이 규칙을 데이터 필드로 옮긴 것)

| 필드 | 규칙 | 검사 |
|---|---|---|
| `summary` | 1문장, 20~80자, 합니다체, "."로 끝남 | 데이터 검사 |
| `folk` | 3~5문장, 각 원소는 한 문장이고 "."로 끝남 | 데이터 검사 |
| `reflection` | 2~3문장 | 데이터 검사 |
| 분량 | `[...folk, ...reflection].join(' ').length >= 300` (공백 포함, AC-10) | 데이터 검사 |
| `faq` | 2개. 질문은 그 소재 이름을 넣어 쓴다. 답은 길흉을 단정하지 않는다 | 타입 + 데이터 검사 |
| `soothing` | 민감 소재만 1~3문장. 공포 묘사 금지 | 타입 + 데이터 검사 |
| 독자성 | 다른 소재와 같은 문장 금지. 소재 이름만 바꾼 같은 틀 금지 | 데이터 검사(근사) + 사용자 검수 |

- `death` 카테고리 소재는 모두 `sensitivity`가 `'none'`이 아니어야 한다. 다른 카테고리 소재도 악몽·추락·쫓김처럼 불안을 다루면 `'sensitive'`로 둔다. 죽음이나 장례가 나오는 소재는 `'death'`다.
- 사용자 노출 문구 전체에 7장 금지 표현 검사를 적용한다.

## 4. 검색 (확정)

### 4.1 데이터 흐름

- 허브 페이지(서버)가 `buildDreamSearchItems(DREAM_TOPICS)`로 `DreamSearchItemType[]`를 만들고 `buildDreamHubGroups(items)`로 카테고리별로 묶어 `DreamHubComponent`에 props로 넘긴다.
- 클라이언트 번들에는 slug, 이름, 별칭, 카테고리만 들어간다. 본문(`folk`, `reflection`, `faq`, `soothing`)은 들어가지 않는다.
- `hub/components/` 아래 파일은 `dream-topics.constant.ts`, `constants/topics/*`, `dream-topic.util.ts`, `dream-copy-rule.constant.ts`를 import하지 않는다(10장 정적 검사).

### 4.2 함수 (`features/dream/utils/dream-search.util.ts`)

```ts
/** NFC 정규화 → 소문자 → 문자·숫자(\p{L}\p{N}) 외 전부 제거 */
export function normalizeDreamSearchText(text: string): string;

/** 정규화된 검색어 끝의 '꿈해몽', '꿈풀이', '해몽', '풀이', '꿈'을 더 이상 안 바뀔 때까지 떼어 낸다. 결과가 빈 문자열이 되면 떼기 전 값을 돌려준다 */
export function stripDreamQuerySuffix(normalized: string): string;

/** 검색어가 비면(정규화 후 빈 문자열) 전체를 돌려준다. 아니면 searchKeys 중 하나라도 검색어를 포함하는 항목만 남긴다 */
export function filterDreamSearchItems(
  groups: readonly DreamHubGroupType[],
  query: string
): readonly DreamHubGroupType[];   // 항목이 0개인 카테고리는 뺀다
```

- `searchKeys`는 서버에서 만들 때 같은 정규화를 적용하고 접미어는 떼지 않는다. 예: "이빨 빠지는 꿈" → `이빨빠지는꿈`. 검색어 "이빨빠지는" → `이빨빠지는`이 포함되므로 일치한다(AC-4). "돼지꿈 해몽" → `돼지꿈해몽` → 접미어 제거 → `돼지` → 이름 "돼지"와 일치한다(US-1).
- 띄어쓰기, 대소문자, 특수문자 차이를 무시한다(AC-4). 공백만 입력하면 빈 검색어로 보고 전체를 보인다(AC-2).
- 비교는 `String.prototype.includes`만 쓴다. 검색어로 `RegExp`를 만들지 않는다(특수문자 오류와 ReDoS 방지).
- 카테고리 이름도 검색 키다(plan 부수 결정). "동물"을 입력하면 동물 소재 전체가 나온다.
- 120개라 디바운스나 별도 인덱스 없이 렌더링 중에 바로 계산한다(`useMemo`는 선택).

### 4.3 입력칸과 상태

- 상태: `DreamHubComponent`의 `useState<string>('')` 하나. 필터 결과, 결과 개수, 위기 감지 결과는 렌더링 중 계산값이다. 상태로 두지 않는다.
- 저장소, URL(쿼리스트링, 해시), zustand, Context에 올리지 않는다. `useSearchParams`, `router.push/replace`, `history.*`를 쓰지 않는다(AC-44).
- 입력 요소
  - shadcn `Input`(`src/components/ui/input.tsx`), `type="search"`, `autoComplete="off"`, `enterKeyHint="search"`, `maxLength={DREAM_SEARCH_MAX_LENGTH}`(50). `onChange`에서도 `slice(0, 50)`.
  - `name` 속성을 주지 않는다. `<form>`으로 감싸지 않는다. Enter는 아무것도 보내지 않는다.
  - textarea와 다른 입력칸은 만들지 않는다(AC-20).
  - 검색칸 바로 아래 plan의 개인 내용 주의 안내를 둔다(AC-20). 입력칸 `aria-describedby`로 연결한다.
- 허브 목록의 소재 링크는 `next/link`에 `prefetch={false}`를 준다. 검색으로 목록이 바뀔 때 새로 보이는 링크의 프리페치 요청이 생기지 않게 하기 위해서다(AC-6). 120개 링크를 한꺼번에 프리페치하는 비용도 막는다.
- 결과 없음(`filterDreamSearchItems` 결과가 0개): `DreamHubEmptyComponent`가 "일치하는 꿈 소재가 없습니다" 의미 안내, 자유 서술 검색 미지원 안내, "전체 목록 보기" 버튼을 보인다. 버튼은 검색어를 비우고 입력칸에 포커스를 돌린다(AC-5). 로또·복권·태몽 검색도 같은 처리다. 번호나 다른 링크를 보이지 않는다.
- 검색어를 화면에 다시 보여 줄 때는 React 텍스트로만 그린다.
- JS가 꺼진 경우: 서버 HTML에 전체 목록(초기 상태, 검색어 빈 값)이 있다(AC-8). 검색칸 근처에 `<noscript>`로 "검색은 자바스크립트가 필요합니다" 의미 안내를 둔다. `DreamHubNoscriptNoticeComponent`는 서버 컴포넌트로 클라이언트 root의 형제 위치에 둔다.
- hydration: 서버 HTML과 첫 클라이언트 렌더가 모두 검색어 빈 값이라 같다.

## 5. 위기 표현 감지 (확정, 공유 방식은 D1)

- 대상: 허브 검색칸의 현재 입력값.
- 방식: 타로와 같은 정규화(NFC, 소문자, 문자·숫자 외 제거) 후 위기 표현 목록과 부분 일치. 목록은 타로의 `TAROT_CRISIS_TERMS`와 같은 목록을 쓴다(D1 추천안: 공용으로 올림).
- 동작
  - 감지되면 검색 결과 영역 위에 `DreamHubCrisisNoticeComponent`를 보인다. 결과 목록은 그대로 보인다(막지 않음, "계속 보기" 버튼 없음).
  - 안내 번호는 `CRISIS_PHONES` 중 `showInCrisisPanel === true`인 세 곳(109, 1577-0199, 1588-9191)이다. 타로 입력 감지 패널과 같다(2026-11-05 타로 결정). 다섯 곳 전체는 페이지 하단 상담 안내 블록에 항상 있다.
  - 감지 결과는 렌더링 중 계산값이다. 콘솔 출력, 네트워크 요청, 분석 이벤트, 저장소 기록을 하지 않는다.
  - 안내 영역은 `role="status"`(polite)로 둔다. 입력 중 경고음처럼 끊지 않게 `alert`는 쓰지 않는다. 시각 배치는 UI/UX가 정한다.
- 미탐이 있으므로 하단 상담 안내를 항상 함께 둔다(plan 위험 수용 항목).
- 상세 페이지에는 입력이 없으므로 감지가 없다.

## 6. 라우팅과 페이지 구성

### 6.1 라우트 (확정)

| 경로 | 파일 | 렌더링 |
|---|---|---|
| `/dream` | `src/app/dream/page.tsx` | 서버 컴포넌트, 정적. `export const metadata` |
| `/dream/[slug]` | `src/app/dream/[slug]/page.tsx` | 서버 컴포넌트, 정적. `generateStaticParams`로 120개를 빌드 때 만든다 |
| 없는 slug | `src/app/dream/[slug]/not-found.tsx` | 서버 컴포넌트. 안내 문구 + `/dream` 링크 + 홈 링크 |

- `generateStaticParams()`는 `DREAM_TOPICS.map(({ slug }) => ({ slug }))`를 돌려준다.
- `params`는 `Promise<{ slug: string }>`다(Next.js 16, 기존 `src/app/lotto/[draw]/page.tsx`와 같은 형식).
- `generateMetadata`와 페이지 본문 모두 `getDreamTopicBySlug(slug)`가 `null`이면 `notFound()`를 부른다.
- 404 확인 항목(AC-16): QA가 없는 slug에 대해 응답 상태 404와 허브 링크를 확인한다. 루트 `src/app/loading.tsx` 때문에 스트리밍 응답이 되어 상태가 200으로 나오거나, 루트 `not-found.tsx`가 대신 보이면 frontend-dev는 고치지 말고 PM에게 보고한다. 그때의 대안은 `export const dynamicParams = false`(없는 slug는 항상 404, 화면은 루트 404 페이지)이고, 루트 404 페이지에 링크를 더해야 하면 공용 파일 변경이라 사용자 승인을 받는다.
- 소재 상세 주소에 쿼리를 붙인 링크를 만들지 않는다(AC-44).

### 6.2 화면 구성

허브 `/dream`

```
DreamHubPage (서버, app)
  ContentWrapperComponent type="dream"
    JsonLdComponent  [BreadcrumbList 홈 > 꿈 해몽]
    DreamBreadcrumbComponent            # 홈 > 꿈 해몽. "꿈 해몽"은 /dream 링크, aria-current="page" (AC-15)
    TitleWrapperComponent               # h1 "꿈 해몽" (페이지의 유일한 h1)
    DreamDisclaimerNoticeComponent      # 상시 면책 (AC-7, AC-27)
    DreamHubNoscriptNoticeComponent     # <noscript>
    DreamHubComponent ('use client', props: groups)
      DreamHubSearchInputComponent      # 검색칸 + 개인 내용 주의 안내
      DreamHubCrisisNoticeComponent     # 위기 감지 시만
      DreamHubResultStatusComponent     # "소재 N개" aria-live="polite" (검색어가 있을 때만 문장, 빈 값이면 전체 개수)
      DreamHubCategoryListComponent     # 카테고리별 h2 + 소재 링크 목록 (AC-8)
      DreamHubEmptyComponent            # 결과 없음일 때만
    DreamBasisNoticeComponent           # 풀이 기준
    DreamHubDetailNoticeComponent       # 상세 안내 6항 (AC-29)
    DreamFaqComponent items=DREAM_HUB_FAQ
    DreamCrisisPhonesComponent          # 상담 안내 다섯 곳
```

소재 상세 `/dream/[slug]`

```
DreamTopicPage (서버, app)
  ContentWrapperComponent type="dream"
    JsonLdComponent  [BreadcrumbList 홈 > 꿈 해몽 > 소재, FAQPage(topic.faq)]
    DreamBreadcrumbComponent            # 홈 > 꿈 해몽 > {keywordName}
    TitleWrapperComponent               # h1 "{keywordName} 해몽" (유일한 h1), description은 카테고리 안내 한 줄(UI/UX 확정)
    DreamDisclaimerNoticeComponent      # 상시 면책 (AC-27)
    DreamTopicComponent (서버, props: topic, relatedTopics)
      DreamTopicReadingComponent        # 한 줄 요약, h2 민간 풀이, h2 요즘 생각해 볼 점 (AC-9)
      DreamTopicSoothingComponent       # sensitivity가 none이 아닐 때: soothing + 반복 꿈 안내, death면 죽음 보충 추가 (AC-23)
      DreamTopicTtiLinkComponent        # isTtiAnimal일 때: /fortune/tti 링크 + "운세 화면은 이용 동의 안내가 먼저 나옵니다" 의미 문장
      DreamBasisNoticeComponent         # 풀이 기준 + 허브 링크 (AC-12)
      DreamTopicRelatedComponent        # h2 관련 소재, 링크 2~4개 (AC-13)
      DreamFaqComponent items=topic.faq # h2 자주 묻는 질문 (AC-14)
    DreamBottomNoticeComponent          # 하단 짧은 면책 + 판단 책임 (AC-28)
    DreamCrisisPhonesComponent          # 상담 안내 다섯 곳 (AC-24)
    DreamTopicBackLinkComponent         # 꿈 해몽으로 돌아가기 → /dream (AC-15)
```

- 상시 면책은 기존 타로·운세 페이지와 같은 위치(`TitleWrapperComponent` 블록 바로 다음)에 둔다. 접기, 툴팁, 스크롤 후 노출을 쓰지 않는다.
- 반복 꿈 안내는 민감 소재의 완화 블록 안에 둔다. 모든 상세의 하단에는 짧은 면책(전문가 상담 문장 포함)과 상담 안내 블록이 항상 있다.
- `DreamCrisisPhonesComponent`는 공용 `CRISIS_PHONES` 다섯 곳 전체를 순서 그대로 그리고, 각 번호는 공용 `CrisisPhoneComponent`(터치 `tel:` 링크, PC 글자)로 그린다. 첫 문장은 plan 승인 문구("마음이 많이 힘드시다면 혼자 견디지 마시고 아래 상담 기관에 이야기해 보시기 바랍니다.")를 `dream-notice.constant.ts`에 두고 쓴다. 번호를 꿈 기능 안에 다시 적지 않는다(AC-24).
- 관련 소재는 데이터의 `related` slug 순서대로 그린다. `getDreamRelatedTopics(topic)`가 slug를 소재로 바꾼다.
- 광고: 루트 레이아웃의 상단 AdFit 슬롯 1개만 노출된다. 이번 설계는 꿈 페이지에 슬롯을 추가하지 않는다. 광고 로드 여부와 무관하게 모든 본문은 서버 HTML에 있으므로 AC-30을 만족한다.
- 동의: `ConsentProvider`, 운세 동의, 연령 확인을 읽지 않는다(AC-22).

### 6.3 데이터 조회 함수 (`features/dream/utils/dream-topic.util.ts`, 서버 전용)

```ts
export function getDreamTopicBySlug(slug: string): DreamTopicType | null;   // 모듈 범위 Map으로 찾는다
export function getDreamRelatedTopics(topic: DreamTopicType): readonly DreamTopicType[];
export function buildDreamSearchItems(topics: readonly DreamTopicType[]): readonly DreamSearchItemType[];
export function buildDreamHubGroups(items: readonly DreamSearchItemType[]): readonly DreamHubGroupType[]; // DREAM_CATEGORIES 순서
export function getDreamTopicPath(slug: string): string;                    // `/dream/${slug}`
export function getDreamTopicPaths(): readonly string[];                    // sitemap용 120개
```

## 7. 표현 규칙 검사

### 7.1 목록 (`dream-copy-rule.constant.ts`, 검사 전용)

화면 코드는 이 파일을 import하지 않는다. 사용자가 항목을 추가·삭제할 수 있다. 아래는 설계 확정 초안이다.

- `DREAM_FORBIDDEN_TERMS` (부분 일치)
  - 타로 목록 전체: 100%, 적중, 정확히 맞, 백발백중, 족집게, 무조건, 반드시, 확실히, 보장, 틀림없, 운명이 바뀐, 인생이 바뀐, 운명을 바꿔, 대박, 합격합니다, 헤어집니다, 성공합니다
  - 운세 목록 중 꿈과 충돌하지 않는 것: 예측, 필승, 구매하세요, 사세요, 책임을 지지 않, 일절 책임, 모든 책임, 법적 책임이 없, 책임 없음, 정통, 전문가 수준, AI 분석, AI가, 투자하세요, 주식, 코인, 비트코인, 매수, 대출, 부동산, 횡재, 벼락부자, 병에 걸, 수술, 사망, 재앙, 액운, 저주, 파산, 불행, 점신, 포스텔러, 토정비결
  - 운세 목록에서 뺀 것(D2): `죽음`(죽음·장례 소재 이름과 승인된 죽음 보충 문구에 필요), `사고가 나`, `사고를 당`(사고 소재 이름에 필요). 대신 아래 꿈 특유 단정 표현으로 막는다
  - 길흉 라벨(AC-11): 길몽, 흉몽, 대길, 대흉, 길흉, 길조, 흉조, 길한 꿈, 흉한 꿈, 좋은 꿈입니다, 나쁜 꿈입니다, 징조
  - 예지 단정: 예고, 예언, 예지몽, 곧 일어, 곧 생기, 곧 찾아, 곧 들어, 찾아온다, 찾아옵니다, 일이 일어납, 일이 생깁니다
  - 재물·행운 보장: 돈이 들어, 재물이 들어, 복이 온, 복이 들어, 복이 찾아, 행운이 찾아, 행운이 온, 부자가 됩
  - 죽음 단정: 죽음을 뜻한, 죽음을 의미, 죽는다는 뜻, 죽게 됩
  - 성별·임신·출산: 태몽, 임신, 출산, 성별, 아들을 낳, 딸을 낳, 아들이다, 딸이다
  - 건강·수면 판단: 진단, 불면증, 수면장애, 수면 장애, 악몽장애, 우울증, 질병
  - 투자·도박: 투자, 도박, 베팅, 경마, 토토
  - 출처 주장(풀이 규칙 6): 원전에 따르면, 해몽서에 따르면, 해몽서에 나온, 전통 해몽서
- `DREAM_FORBIDDEN_PATTERNS` (정규식): `/게 됩니다/`, `/게 될 거예요/`, `/게 될 것입니다/`, `/(생길|일어날|찾아올|들어올) 것입니다/`
- `DREAM_LOTTO_TERMS` (AC-18): 로또, 복권, 당첨, 꿈번호, 꿈 번호, 행운의 숫자, 행운 번호, 행운번호
- `DREAM_BOAST_TERMS` (AC-26): 1위, 국내 최초, 최다, 명이 이용, 명이 선택, 누적, 년 전통, 년의 전통, 년 역사. 패턴 `/\d{4}년/`, `/\d+\s?(만|천)?\s?명/`
- `DREAM_COPY_ALLOWED_SENTENCES`: 검사 전 대상 문자열에서 먼저 지우는 부정 고지 문장. `dream-notice.constant.ts`의 상시 면책, 풀이 기준, 허브 상세 안내 6항 중 "예측"·"보장"이 들어간 문장만 넣는다. 그 밖의 문장(FAQ 포함)은 예외가 아니다(AC-17). 검사를 통과시키려고 임의로 늘리지 않는다.
- 위기 표현 목록(5장)은 소재 데이터 검사(AC-25)에도 쓴다.

### 7.2 검사 범위

- 데이터와 상수: `DREAM_TOPICS` 전 필드, `dream-notice`, `dream-faq`, `dream-seo`, `dream-category` 상수, `MENU_LIST`의 꿈 그룹, 상세 메타데이터 입력값(`dream-seo.util.ts` 결과 120개).
- 렌더링 HTML: 허브와 상세 120개를 `request.get`으로 받아 `<head>`(title, meta, JSON-LD)와 `<main>` 안쪽만 검사한다. 헤더 메뉴, 푸터, 광고 슬롯, 쿠키 배너, Next.js RSC 데이터 스크립트는 사이트 공통 영역이라 범위에서 뺀다. 공통 헤더에는 로또 메뉴 링크와 "로또" 글자가 늘 있기 때문이다(AC-17, AC-18, AC-19, AC-26 해석).
- 루트 레이아웃 메타데이터의 `category: '엔터테인먼트, 도구, 로또'`가 꿈 페이지에 상속되어 `<head>`에 "로또"가 들어간다. 그래서 꿈 허브와 상세의 metadata는 `buildMetadata()` 결과를 펼친 뒤 `category: '엔터테인먼트, 꿈 해몽'`으로 덮어쓴다(홈 `src/app/page.tsx`가 `buildMetadata` 결과를 펼쳐 쓰는 선례와 같다). 루트 레이아웃은 고치지 않는다.

## 8. SEO

| URL | title (템플릿이 " \| 운빨연구소"를 붙임) | description 초안 | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/dream` | 꿈 해몽: 꿈 소재 사전 | 돼지꿈, 뱀꿈, 이빨 빠지는 꿈처럼 꿈에 나온 소재를 검색하거나 카테고리에서 골라 민간에서 전해 온 풀이와 요즘 생각해 볼 점을 읽어 보실 수 있습니다. 오락과 자기 성찰을 위한 참고 콘텐츠입니다. | BreadcrumbList (홈 > 꿈 해몽) | 등록. `MENU_LIST` 꿈 그룹 href로 자동 |
| `/dream/<slug>` | {keywordName} 해몽: 민간 풀이와 생각해 볼 점 | {summary} 민간에서 전해 온 풀이와 요즘 생각해 볼 점을 함께 정리했습니다. | BreadcrumbList (홈 > 꿈 해몽 > {keywordName}), FAQPage (topic.faq) | 등록. `sitemap.ts`에서 120개 추가 |
| 없는 slug | Next.js 기본 404 메타 | 없음 | 없음 | 없음 |

- 메타데이터는 `buildMetadata()`로 만든다(seo.md). 위 7.2의 `category` 덮어쓰기만 더한다.
  - 허브: `keywords`: 꿈 해몽, 꿈해몽, 꿈풀이, 꿈 해몽 사전, 꿈 풀이 사전, 꿈 소재 찾기. `ogImage: { alt: '꿈 해몽 꿈 소재 사전 안내 이미지' }` (tag는 메뉴 라벨 "꿈 해몽"이 자동).
  - 상세: `dream-seo.util.ts`의 `buildDreamTopicSeo(topic)`가 title, description, keywords(`{keywordName} 해몽`, `{keywordName}`, 별칭 앞 3개, 중복 제거, 최대 6개), `ogImage: { alt: '{keywordName} 해몽 안내 이미지', tag: '꿈 해몽' }`를 만든다. 상세 경로는 `MENU_LIST`에 없어서 tag를 명시한다.
  - 제외 키워드(꿈 번호, 꿈 로또, 복권, 당첨, 행운 번호, 태몽)는 넣지 않는다. 7장 검사 대상이다.
  - description의 예시 소재 이름은 실제 데이터에 있는 이름으로 맞춘다.
- 문구는 초안이다. 최종 문구는 UI/UX 단계 문구 표에서 확정하되 위 구조(허브 title에 "꿈 해몽", 상세 title에 소재 이름)는 바꾸지 않는다(AC-38).
- 서버 렌더링: 허브 목록, 상세 본문, FAQ, 면책, 상담 안내는 모두 서버 HTML에 있다(AC-7, AC-8, AC-9, AC-14). 허브 목록은 클라이언트 컴포넌트지만 첫 렌더가 서버에서 HTML로 나온다.
- JSON-LD: `jsonLdBreadcrumb`, `jsonLdFaq`(`src/lib/seo.ts`)와 `JsonLdComponent`를 쓴다. 브레드크럼 첫 항목은 `{ name: SITE_NAME, item: canonicalUrl('/') }`, 둘째는 `{ name: '꿈 해몽', item: canonicalUrl('/dream') }`. 상세 FAQPage는 화면과 같은 `topic.faq` 배열로 만든다(AC-14). 리뷰·평점·Article은 넣지 않는다(AC-39). 허브의 FAQPage와 ItemList는 plan에 없어 넣지 않는다.
- sitemap: `src/app/sitemap.ts`의 경로 합치기에 `getDreamTopicPaths()` 결과를 더한다. 우선순위·갱신 주기는 기존 규칙(그 밖 0.6, weekly)을 그대로 쓴다. 꿈 그룹은 `comingSoon` 없이 등록하므로 `/dream`은 메뉴 경로로 자동 포함된다(AC-37).
- h1은 페이지마다 `TitleWrapperComponent` 하나뿐이다. 안의 블록 제목은 h2, FAQ 질문은 h3 이하(AC-40).
- 이미지: 없음. OG 이미지는 기존 `/api/og-image`를 쓴다.
- URL: 소문자·하이픈. 공개된 URL이 없으므로 redirect는 없다.

## 9. 메뉴 등록 (고칠 곳)

| 파일 | 변경 | 값을 정하는 곳 |
|---|---|---|
| `src/constants/menu.constant.ts` | `MENU_GROUP_NAME_ENUM`에 `DREAM = 'dream'` 추가. `MENU_LIST`의 운세 그룹 다음, 점심 그룹 앞에 `{ group: DREAM, label: '꿈 해몽', href: '/dream', items: [{ href: '/dream', label: '꿈 소재 찾기', icon, colorClass, description, example }] }` 추가. `comingSoon` 없음 | 아이콘 이름, `colorClass`, description, example 문구는 UI/UX |
| `src/types/menu.type.ts` | `MenuSectionKeyType`에 `'dream'` 추가 | 이 문서 |
| `src/constants/theme.constant.ts` | `SECTION_ICONS.dream`, `SECTION_ICON_COLOR.dream`, `SECTION_BADGE_COLOR.dream`, `BACKGROUND_COLORS.dream`(`'bg-background'`) 추가. `Record<MenuSectionKeyType, …>`라 하나라도 빠지면 typecheck가 실패한다 | 아이콘·색 클래스는 UI/UX |
| `src/constants/menu-icon.constant.ts` | 하위 항목 `icon` 이름에 맞는 lucide 아이콘 추가 | UI/UX |
| `src/app/globals.css` | 메뉴 색 토큰. `--menu-where`를 `--menu-dream`으로 이름만 바꿀지 새 토큰을 둘지 UI/UX가 정한다. 현재 `--menu-where`는 globals.css 안에서만 쓴다(검색 확인) | UI/UX |
| `docs/conventions/design-system.md` | 메뉴 라벨 색 표의 "어디 가" 행을 꿈 해몽으로 바꾼다. 규칙 문서라 사용자 승인 후 PM이 고친다 | UI/UX 결정 + 사용자 승인 |
| `src/app/sitemap.ts` | 소재 상세 120개 추가 (8장) | 이 문서 |

- 헤더 PC 메뉴(`pc-menu.component.tsx`), 모바일 메뉴(`mobile-menu.component.tsx`), 홈(`src/app/page.tsx`)은 `MENU_LIST`와 `SECTION_*` 맵을 그대로 읽으므로 고치지 않는다(AC-35, AC-36).
- 그룹 href와 하위 항목 href가 같은 `/dream`이다. sitemap은 `Set`으로 중복을 없앤다. 메뉴 화면에서 같은 링크가 두 번 보이는지는 UI/UX가 확인한다.
- `getOgTag({ href: '/dream' })`는 그룹 라벨 "꿈 해몽"을 돌려준다.

## 10. 검증 방식 (AC를 어떻게 확인하는가)

타로 D4 선례대로 Playwright 테스트로 한다. 새 도구나 `package.json` 스크립트는 추가하지 않는다.

### 10.1 `e2e/dream-copy.spec.ts` (브라우저 없이 상수 import + 일부 HTML 요청)

데이터 검사는 데스크톱 프로젝트에서만 돌린다(`test.skip(testInfo.project.name !== 'desktop')`). 같은 검사를 모바일에서 반복할 이유가 없다.

| 검사 | AC |
|---|---|
| `DREAM_TOPICS.length === DREAM_TOPIC_COUNT === 120`, 7개 카테고리 모두 1개 이상 | AC-42 |
| slug 형식 `/^[a-z]+(-[a-z]+)*$/`, 40자 이하, 중복 없음 | AC-43 |
| 별칭 2~5개. 정규화한 별칭이 전체 소재에서 중복 없음. 별칭이 다른 소재의 정규화한 `name`·`keywordName`과 같지 않음 | AC-43, AC-3 |
| `summary` 1문장·20~80자, `folk` 3~5, `reflection` 2~3, 각 원소 "."로 끝남, 분량 300자 이상 | AC-10 |
| `faq` 2개, 질문·답 비어 있지 않음 | AC-14 |
| `related` 2~4개, 존재하는 slug, 자기 자신 아님, 같은 카테고리, 중복 없음 | AC-13 |
| `death` 카테고리는 모두 `sensitivity !== 'none'`, 민감 소재의 `soothing` 1~3문장 | AC-23 |
| `isTtiAnimal` 11개, 모두 동물 카테고리. 이름·별칭·slug에 용·`dragon` 없음 | plan 결정, 질문 5 |
| 금지 표현·패턴 0건(허용 문장 제거 후) | AC-11, AC-17 |
| 로또 키워드 0건 | AC-18 |
| 수치 자랑 0건 | AC-26 |
| 소재 데이터 전체(이름, 별칭, 본문)에 위기 표현(정규화 후) 0건 | AC-25 |
| 독자성 근사 검사: 서로 다른 소재에 같은 문장이 없음. 각 문장에서 그 소재의 `name`·`keywordName`을 자리표시로 바꾼 뒤에도 다른 소재 문장과 같지 않음 | plan 풀이 규칙 8 |
| 정적 소스 검사: `src/features/dream/**`, `src/app/dream/**`에 `localStorage`, `sessionStorage`, `fetch(`, `axios`, `@/lib/http`, `useSearchParams`, `router.push`, `router.replace`, `history.`, `track(`, `<textarea`, `dangerouslySetInnerHTML`이 없음 | AC-6, AC-20, AC-21, AC-44 |
| 정적 소스 검사: `hub/components/**`가 소재 본문 파일과 `dream-copy-rule.constant.ts`를 import하지 않음 | 4.1 |
| `DREAM_FORBIDDEN_TERMS`가 타로 `TAROT_FORBIDDEN_TERMS` 전체를 포함함(목록이 따로 줄어드는 것 방지) | AC-17 |
| 상담 블록이 공용 `CRISIS_PHONES`를 쓰고 다섯 번호가 순서대로 일치 | AC-24 |
| `docs/dream/copy-log.md` 소재 표 행 수 = 120, 모든 slug가 한 번씩 있음, 작성자·작성일·상태 칸이 비어 있지 않음 | AC-33 |
| copy-log 웹 검색 기록이 묶음당 20문장 이상, 고지·FAQ 10문장 이상 | AC-34 |
| 개인정보처리방침·이용약관·`COMPLIANCE.md`에 꿈 해몽 항목과 필수 의미 문구가 있음(문자열 검사) | AC-31, AC-32 |
| 허브 + 상세 120개 HTML의 `<head>`와 `<main>`에서 금지 표현·로또 키워드·수치 자랑·길흉 라벨 0건, `href="/lotto` 0건 | AC-11, AC-17~19, AC-26 |

### 10.2 `e2e/dream.spec.ts` (데스크톱·모바일)

- 허브: h1 1개, 검색칸, 카테고리 목록(AC-1). "돼지" 입력 후 결과는 이름·별칭에 "돼지"가 있는 소재만, 지우면 전체, 공백만이면 전체(AC-2). 데이터의 모든 별칭으로 검색해 해당 소재가 나옴(AC-3, 별칭 수가 많으므로 입력칸 `fill`로 빠르게). "이빨빠지는"(AC-4). 없는 검색어의 안내와 "전체 목록 보기"(AC-5).
- AC-6: 페이지가 다 뜬 뒤 `page.on('request')`를 걸고 검색어를 입력한다. 요청이 0건이어야 한다. 개발 서버의 HMR(websocket, `_next/webpack-hmr`)만 예외로 둔다. 어떤 요청 URL에도 검색어가 없어야 하고, `page.url()`이 바뀌지 않아야 한다(AC-44).
- AC-7, AC-8, AC-9, AC-14: `javaScriptEnabled: false` 컨텍스트로 열어 면책, 목록 링크 수(= 120), 본문 블록, FAQ가 있는지 본다. FAQ 화면 텍스트와 JSON-LD FAQPage를 비교한다.
- AC-12, AC-13, AC-15, AC-23, AC-24, AC-27, AC-28, AC-29: 대표 소재(일반 1, 민감 1, 죽음 1, 띠 동물 1)로 블록 존재와 링크 이동을 본다.
- AC-16: 없는 slug의 응답 상태 404, 안내 문구, `/dream` 링크.
- AC-21: 로드 전후 localStorage·sessionStorage 키 목록을 비교한다. 사이트 공통 동의 키(`consent.provider.tsx`의 키)는 제외한다.
- AC-22, AC-30: 쿠키 동의 거절 상태, AdFit 요청 차단(`page.route`로 abort) 상태에서 검색·상세 열람이 동작한다.
- AC-35, AC-36, AC-37, AC-38, AC-39, AC-40, AC-41: 헤더 PC·모바일 메뉴, 홈 카드, `/sitemap.xml`의 121개 주소, robots·canonical·OG, BreadcrumbList, h1 개수, 허브 → 검색 → 상세 → 관련 소재 흐름.
- AC-20: `<main>` 안의 `input`이 검색칸 1개뿐이고 `textarea`가 0개.

### 10.3 기존 테스트 영향

- `e2e/fortune-v2.spec.ts`의 "AC-9: 메타·sitemap·JSON-LD 소스 파일은 HEAD와 diff가 없다"는 `src/app/sitemap.ts`를 검사 목록에 넣고 있다. 꿈 해몽이 sitemap.ts를 고치면 이 테스트가 실패한다(D3).
- `e2e/fortune-calc.spec.ts`의 "다른 그룹 항목이 운세 경로를 쓰지 않는다" 검사는 `/dream`이라 영향 없다.
- 타로 테스트: D1 추천안(위기 목록 공용화)을 고르면 `tarot.spec.ts`, `tarot-copy.spec.ts` 회귀를 한 번 돌린다. 타로 쪽 export 이름을 유지하므로 테스트 수정은 없을 것으로 본다.

## 11. copy-log 운영

- 위치: `docs/dream/copy-log.md` (신규). 문구 작성자가 만들고 갱신한다. 형식은 타로 copy-log를 따른다.
- 구성
  1. 작성 원칙: 리서치 4.3의 1~6항(외부 풀이 문장 미참조, 번역·어순 변경 금지, 소재 이름 목록 통째 복사 금지, AI 입력에 다른 사이트 문장 넣지 않음, 원전·고서 인용 없음), plan 풀이 규칙 1~8 요약.
  2. 한계: 웹 검색 점검은 전수 검사가 아니며 "일치 없음"은 "찾지 못했다"라는 뜻이다.
  3. 소재 표(소재 1개당 1행, 120행)

| slug | 소재 이름 | 카테고리 | 묶음 | 작성자 | 작성일 | 검수자 | 검수일 | 상태 | 웹 검색 샘플 확인 |
|---|---|---|---|---|---|---|---|---|---|
| pig | 돼지 | 동물 | DR-S | AI(Claude) | 2026-xx-xx | 사용자 | 2026-xx-xx | 샘플 / 초안 / 검수 완료 / 수정 필요 | 해당 없음 / 일치 없음 / 수정함 |

  4. 묶음 코드: `DR-S`(샘플 10), `DR-1` 동물, `DR-2` 사람·관계, `DR-3` 신체, `DR-4` 자연·날씨, `DR-5` 행동·상황, `DR-6` 사물·장소·재물, `DR-7` 죽음·사고, `DR-N` 고지·FAQ·SEO·메뉴 문구. 샘플 소재는 `DR-S`로 남기고, 나머지는 카테고리 묶음 코드를 쓴다.
  5. 웹 검색 샘플 기록: `| 묶음 | 검색한 문장 | 검색일 | 검색 엔진 | 결과(일치 없음 / 수정함) | 수정 후 문장 |`. 묶음 `DR-1`~`DR-7`과 `DR-S`를 합쳐 묶음당 20문장 이상, `DR-N` 10문장 이상(AC-34).
  6. 교정 기록: 사용자 검수에서 바뀐 문장 요약.
- 10.1 테스트가 소재 표 행 수와 slug 일치를 검사하므로 표 형식(첫 열 slug, 헤더 문구)을 바꾸지 않는다.

## 12. 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 소재 풀이 문구 120개, FAQ, 고지, SEO 문구 | 자체 작성(AI 작성 + 사용자 검수), copy-log로 이력 관리 | 자체 저작. AI 작성물의 권리 귀속은 법률 확인 필요 | 가능. 법률 검토 없이 운영자가 위험을 수용(plan 질문 13 결정) |
| 소재 이름 목록 | 일반 지식과 여러 사이트 이름 참고. 목록·배열을 통째로 옮기지 않고 자체 편집 | 이름 자체는 사실 나열로 보이나 편집저작물 판단은 법률 확인 필요 | 가능(위험 수용). 특정 사이트의 선택·순서를 따라가지 않는다 |
| 전통 해몽서·고서 원문·현대 해몽서 | 쓰지 않음 | 해당 없음 | 해당 없음. 인용·번역·판본 표기 없음 |
| 공공누리 자료 | 쓰지 않음 | 해당 없음 | 해당 없음 |
| 상담전화 번호 | 기존 공용 상수 `CRISIS_PHONES` | 공공 정보(사실) | 가능. 출시 전 번호·운영 시간 재확인 |
| 아이콘 | `lucide-react` (기존 의존성) | ISC | 가능. 메뉴·UI 아이콘에만 쓴다 |
| 폰트 | Pretendard (기존) | SIL OFL 1.1 | 가능. 새 폰트 없음 |
| 이미지 | 없음. OG는 기존 `/api/og-image` | 해당 없음 | 해당 없음 |
| 새 라이브러리 | 없음 | 해당 없음 | `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md` 변경 없음 |

- 개인정보: 처리하지 않는다. 입력은 검색어뿐이고 화면 안에서만 쓴다.
- 출시 전 확인(PM): AdFit 사행성 항목 심사, 로또 관련 개정안 상태, 상담 번호 재확인. 확인 결과가 다르면 PM에게 올린다(법률 확인 필요 항목은 운영자 위험 수용으로 결정됨).

## 13. 데이터 저장 위치

| 데이터 | 위치 | 이유 |
|---|---|---|
| 소재 120개(이름, 별칭, 풀이, FAQ, 관련 소재, 민감 표시) | 코드 상수 (`features/dream/constants/topics/`) | 모두에게 같고 자주 안 바뀐다. `data-storage.md`의 "코드 안 상수/JSON" 기준. 수정 이력이 코드 리뷰로 남는다 |
| 카테고리, 고지 문구, 허브 FAQ, SEO 문구, 검색 설정 | 코드 상수 | 같은 이유 |
| 금지 표현 목록 | 코드 상수(검사 전용, 화면 번들 제외) | 같은 이유 |
| 위기 표현 목록 | 코드 상수(D1에 따라 공용 또는 기능 안) | 같은 이유 |
| 상담전화 번호 | 기존 공용 상수 `src/constants/crisis-phone.constant.ts` | 타로·운세와 같은 값을 써야 한다(AC-24) |
| 검색어 | 메모리(React state)만 | plan 법적 요구사항. 서버, localStorage, sessionStorage, 쿠키, URL, 전역 store, 분석 이벤트 모두 금지 |
| 필터 결과, 위기 감지 결과 | 렌더링 중 계산값 | 저장할 이유가 없다 |
| localStorage, sessionStorage, IndexedDB, Supabase | 쓰지 않음 | 개인 데이터와 서버 데이터가 없다. 회원가입 없는 기능 |

## 14. API 계약

없음.

근거: 서버로 보내거나 서버에서 받는 데이터가 없다. 소재 데이터는 빌드 때 HTML로 나가는 정적 상수다. `features/dream/`은 `http`(axios), `fetch`, React Query를 쓰지 않는다. rate limit 대상 API도 없다.

| 메서드 | 경로 | 요청 | 응답 | 에러 |
|---|---|---|---|---|
| 없음 | | | | |

## 15. DB 스키마

없음. 테이블, 컬럼, 인덱스, RLS 정책, 마이그레이션 모두 없다. 근거는 14장과 같다(plan 결정 6 "DB를 쓰지 않는다").

## 16. 프론트 구조

- 페이지 (서버/클라이언트 구분)
  - `/dream`: 서버 컴포넌트(정적). 클라이언트 경계는 `DreamHubComponent` 하나다. 그 아래 프레젠테이션 컴포넌트는 `'use client'`를 따로 붙이지 않는다.
  - `/dream/[slug]`: 서버 컴포넌트(정적 120개). 클라이언트 컴포넌트 없음.
  - `/dream/[slug]` 404: 서버 컴포넌트.
- 컴포넌트 트리: 6.2.
- 상태 위치
  - 검색어: `DreamHubComponent`의 `useState` 하나. 하위 컴포넌트는 props만 받는다(Container / Presentational, Controlled Component).
  - 커스텀 훅, useReducer, zustand, Context는 만들지 않는다. 상태가 하나라 필요 없다.
  - "전체 목록 보기" 후 입력칸 포커스는 root가 `ref`를 검색칸에 prop으로 넘겨 처리한다(React 19 `ref` prop, `forwardRef` 금지).
- 재사용: `ContentWrapperComponent`, `TitleWrapperComponent`, `JsonLdComponent`, `CrisisPhoneComponent`, `CRISIS_PHONES`, shadcn `Input`·`Button`, `cn()`, `buildMetadata`, `jsonLdBreadcrumb`, `jsonLdFaq`, `canonicalUrl`, `SITE_NAME`.
- 모션: 이 설계는 모션을 요구하지 않는다. 넣을지는 UI/UX가 `design-system.md` 기준으로 정한다.

### 16.1 접근성

- 페이지마다 h1 1개. 블록 제목 h2(카테고리 이름, 민간 풀이, 요즘 생각해 볼 점, 관련 소재, 자주 묻는 질문, 상담 안내, 풀이 기준). FAQ 질문은 h3.
- 검색칸에 보이는 `<label>`(또는 UI/UX가 정하면 sr-only 라벨)을 연결한다. 개인 내용 주의 안내는 `aria-describedby`로 연결한다.
- 결과 개수 문장은 `aria-live="polite"` 영역 하나에서 바뀐다. 위기 안내는 `role="status"`.
- 카테고리 목록은 `<section aria-labelledby>` + `<ul>` + 링크. 링크 이름은 소재 이름이다.
- 이동 경로는 `<nav aria-label="이동 경로">` + `<ol>`, 현재 위치에 `aria-current="page"`.
- "전체 목록 보기"는 `<button type="button">`. 누르면 검색어를 비우고 입력칸에 포커스를 돌린다.
- 상담전화는 공용 `CrisisPhoneComponent`의 접근성 규칙(숨은 쪽은 `display: none`)을 따른다.
- 색은 디자인 토큰만 쓴다. `dark:` 클래스를 쓰지 않는다(design-guard).
- 모바일 검색칸 글자 크기 16px 이상(확대 방지). 터치 영역 크기는 UI/UX 기준.

## 17. 보안

- RLS: 해당 없음(DB 없음).
- 시크릿·환경변수: 새 환경변수 없음. 기존 `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`만 쓴다(이미 공개값). README 환경변수 표 변경 없음.
- 입력 검증: 검색어는 `maxLength` 50 + `slice`. 정규화 후 `includes` 비교만 한다. 검색어로 정규식을 만들지 않는다.
- XSS: 모든 문구와 검색어는 React 텍스트로 그린다. `dangerouslySetInnerHTML`은 기존 `JsonLdComponent`(`<` 이스케이프 처리)만 쓴다. 소재 데이터에 HTML 태그를 넣지 않는다(문구는 순수 텍스트, 줄바꿈은 배열 원소로).
- 경로 입력: `slug`는 `getDreamTopicBySlug`의 Map 조회로만 쓴다. 파일 경로나 다른 조회에 쓰지 않는다. 없는 값은 `notFound()`.
- API 남용: API가 없다. 페이지는 정적 생성이라 CDN에서 나간다. 없는 slug 요청은 404(6.1의 확인 항목에서 `dynamicParams` 처리를 함께 본다).
- 브라우저 저장소: 쓰지 않는다. 검색어를 콘솔, 분석 이벤트, 오류 보고에 남기지 않는다.
- 분석: Vercel Web Analytics는 페이지 경로만 집계한다. 검색어가 URL에 들어가지 않으므로 수집되지 않는다(AC-6).

## 18. 담당별 작업 순서

- db: 없음.
- backend: 없음(API·서버 로직 없음). 공용 모듈 이동(D1)은 frontend가 맡는다.
- frontend (frontend-dev)
  - F1 공용: (D1 추천안이면) `src/constants/crisis-term.constant.ts`, `src/lib/crisis-signal.ts` 신설. 타로 `tarot-safety.constant.ts`는 `TAROT_CRISIS_TERMS`를 공용 상수로 다시 내보내고, `tarot-safety.util.ts`의 정규화·감지 함수는 공용 함수를 부르게 바꾼다. export 이름과 동작은 그대로다. 타로 회귀 테스트 1회.
  - F2 뼈대: `dream.type.ts`, `dream-category`, `dream-route`, `dream-search`, `dream-notice`(plan 승인 문구), `dream-faq`, `dream-seo`, `dream-copy-rule` 상수, 빈 카테고리 파일 7개와 `dream-topics.constant.ts`, utils 3개. 문구 상수의 최종 문장은 ui-ux-design.md를 따른다.
  - F3 메뉴: 9장 표의 파일. UI/UX 확정값(아이콘, 색 토큰) 필요. `sitemap.ts` 추가 포함.
  - F4 허브: `src/app/dream/page.tsx`, `hub/components/*`, `shared/components/*`.
  - F5 상세: `src/app/dream/[slug]/page.tsx`, `not-found.tsx`, `topic/components/*`.
  - F6 정책 문서: `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`에 꿈 해몽 항목 추가(기존 문구를 먼저 읽는다). `COMPLIANCE.md` 11장에 꿈 해몽 항목(오락·참고용, 제휴 없음, 상담 안내, 저장 없음, 로또 연결 없음) 추가.
- 콘텐츠 (문구 작성자. 타로 선례는 메인 세션 AI. dev-lead가 담당을 정한다)
  - C1 샘플 10개 작성 + `docs/dream/copy-log.md` 생성 → 사용자 검수(slug 포함 확정).
  - C2 나머지 110개를 카테고리 파일 단위로 작성. 묶음마다 `e2e/dream-copy.spec.ts`의 데이터 검사 통과 후 copy-log 갱신.
  - C3 웹 검색 샘플 점검과 기록.
- qa
  - Q1 `e2e/dream-copy.spec.ts`, `e2e/dream.spec.ts` 작성(10장). C2 진행 중에 데이터 검사를 먼저 쓸 수 있다.
  - Q2 (D3 결정에 따라) `e2e/fortune-v2.spec.ts` AC-9 diff 검사 목록 조정.
- 의존 순서
  1. UI/UX 승인 → F3(색·아이콘 값 필요)와 문구 상수 최종 문장.
  2. F2 → C1(데이터 파일이 타입을 필요로 함) → 사용자 샘플 검수 → C2 → C3.
  3. F1 → F4(허브 위기 감지).
  4. F2 → F4, F5. F4와 F5는 `shared/components/`를 같이 쓰므로 F4에서 shared를 먼저 만들고 F5를 잇는다.
  5. F6은 다른 작업과 파일이 겹치지 않아 언제든 할 수 있다.
  6. Q1의 HTML 검사와 AC 전체 통과는 C2·C3, F3~F6이 끝난 뒤.

## 19. 파일 충돌 위험

- `src/constants/menu.constant.ts`, `src/types/menu.type.ts`, `src/constants/theme.constant.ts`, `src/constants/menu-icon.constant.ts`, `src/app/globals.css`: 작업 트리에 "어디 가" 삭제 변경이 스테이징되어 있고, 점심(lunch) 작업(`docs/archive/lunch/`, `supabase/migrations/0003_restaurants.sql`)이 같은 파일을 고칠 수 있다. 스테이징된 변경을 먼저 커밋하고, 점심 작업과는 순서대로 진행하거나 worktree로 나눈다.
- `src/app/sitemap.ts`: 점심 작업과 겹칠 수 있다. `e2e/fortune-v2.spec.ts` AC-9가 이 파일의 변경을 실패로 본다(D3).
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `COMPLIANCE.md`: 점심 등 다른 기능도 항목을 더할 수 있다. 한 번에 한 담당만 고친다.
- `src/features/tarot/constants/tarot-safety.constant.ts`, `src/features/tarot/utils/tarot-safety.util.ts`: D1 추천안에서만 고친다. 타로 담당 작업과 겹치지 않게 한다.
- `src/features/dream/constants/topics/*.constant.ts`, `docs/dream/copy-log.md`: 문구 작성자 전용. frontend-dev는 타입 오류 수정 외에는 고치지 않는다. 카테고리 파일이 나뉘어 있어 묶음끼리는 동시에 작업할 수 있다.
- `src/features/dream/constants/dream-notice.constant.ts`: frontend-dev(F2)와 UI/UX 확정 문구가 만나는 곳. F2에서 한 번에 확정 문구로 쓴다.
- `docs/conventions/design-system.md`: 규칙 문서라 agent가 고치지 않는다. 사용자 승인 후 PM이 고친다.

## 20. 열린 질문 (사용자 선택 필요)

| 번호 | 주제 | 추천안 | 대안 |
|---|---|---|---|
| D1 | 위기 표현 목록 공유 방식 | 공용으로 올린다. `src/constants/crisis-term.constant.ts`(목록)와 `src/lib/crisis-signal.ts`(정규화·감지)를 새로 만들고 타로는 기존 export 이름을 유지한 채 공용을 쓰게 바꾼다. 장점: `code-style.md` "다른 기능 코드는 공용으로 올린 뒤 쓴다" 규칙을 지키고, 목록이 한 곳이라 어긋나지 않는다. 타로 D1(난수 공용화) 선례와 같다. 단점: 타로 파일 2개를 건드린다(동작 변화 없음). | 꿈 기능 안에 같은 목록을 복사한다(`dream-safety.constant.ts`). 장점: 타로 코드를 건드리지 않는다. 단점: 목록이 두 곳에 생겨 한쪽만 고칠 위험이 있다. 테스트로 두 목록이 같은지 검사해야 한다. |
| D2 | 금지 표현 목록 구성 | 7.1안. 타로 목록 전체 + 운세 목록 중 꿈과 충돌하지 않는 항목 + 꿈 특유 표현. 운세 목록의 "죽음", "사고가 나", "사고를 당"은 뺀다. 이유: 승인된 범위에 죽음·장례·사고 소재와 죽음 보충 문구("죽음이 나오는 꿈이 실제 죽음을 뜻하지는 않으며")가 있어 그대로 넣으면 검사가 항상 실패한다. 죽음 단정은 "죽음을 뜻한", "죽음을 의미" 등으로 따로 막는다. "예측", "보장"은 금지로 두고 면책 문장만 허용 예외로 둔다. | 운세 목록을 그대로 다 쓰고, 죽음·사고 소재의 이름과 문구에서 해당 단어를 피해 쓴다(예: "죽는 꿈", "다치는 꿈"). 장점: plan 문장("타로·운세 목록을 그대로")과 글자 그대로 맞다. 단점: 소재 이름과 승인된 죽음 보충 문구를 바꿔야 하고, 검색 키워드("죽음 꿈")와 멀어진다. |
| D3 | 기존 회귀 테스트 수정 | `e2e/fortune-v2.spec.ts` AC-9의 diff 검사 목록에서 `src/app/sitemap.ts`를 뺀다. 운세 URL이 sitemap에 남아 있는지는 같은 파일의 다른 AC-9 테스트와 `fortune.spec.ts`가 이미 확인한다. | sitemap.ts를 고치지 않고 꿈 상세를 별도 sitemap(`/dream/sitemap.xml`)으로 낸다. 장점: 기존 테스트를 건드리지 않는다. 단점: plan AC-37("/sitemap.xml에 120개 포함")을 바꿔야 하고, 검색엔진에 sitemap 주소를 따로 알려야 한다. |

이 밖에 설계에서 정한 것(사용자 확인이 필요하면 알려 주시기 바랍니다): 관련 소재는 자동 계산이 아니라 소재마다 직접 고른 slug 2~4개로 둔다. 반복 꿈 안내는 민감 소재의 완화 블록에만 둔다. 꿈 페이지의 메타데이터 `category`를 덮어써 "로또" 글자를 없앤다. 검색 위기 안내는 세 곳, 하단 상담 안내는 다섯 곳을 보인다.
