# lunch 설계서

입력: `docs/lunch/plan.md` (승인 2026-11-19), `docs/lunch/status.md`, `docs/lunch/ui-ux-design.md` (U1~U7 승인 2026-11-19, 1.3 반영)
재사용 참고: `docs/lunch/archive/design-b-restaurants.md` 11.3(룰렛 공용 컴포넌트), 12.2~12.3(컴포넌트 트리·상태 위치), 13(SEO), 17(약관·방침 변경 지점). 위치, 반경, DB, API, rate limit, 지역 선택 관련 내용은 가져오지 않는다.
참고 규칙: `docs/conventions/tech-stack.md`, `code-style.md`, `data-storage.md`, `seo.md`
형식 참고: `docs/dream/design.md`, `docs/tarot/design.md`
기존 구조 참고: `src/app/lunch/today/page.tsx`, `src/constants/menu.constant.ts`, `src/types/menu.type.ts`, `src/constants/theme.constant.ts`, `src/app/sitemap.ts`, `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`, `src/lib/random.ts`, `src/lib/seo.ts`, `next.config.ts`(보안 헤더), `COMPLIANCE.md` 11장
작성일: 2026-11-19
작성: architect
상태: 승인 완료 (2026-11-19). 지도 링크 새 탭 변경, 열린 질문 L1~L6 결정(20장), UI/UX 승인 결정 U1~U7(1.3)을 반영했다.

## 0. 요약

- 서버 저장, API, DB, 환경변수가 없는 순수 프론트 기능이다. 메뉴 48개, 카테고리, 점심운 문구, 고지, FAQ는 모두 코드 상수다. 브라우저 저장소도 쓰지 않는다.
- 라우트는 기존 `/lunch/today` 하나다. 페이지는 서버 컴포넌트이고 설명·고지·FAQ·JSON-LD는 서버 HTML에 들어간다. 클라이언트 경계는 룰렛 영역 root 하나다.
- 결과는 부모(점심 root)가 `secureRandomInt`로 먼저 정하고, 돌림판은 그 결과에서 멈추는 연출만 한다. 돌림판은 점심을 모르는 공용 컴포넌트 `src/components/common/roulette.component.tsx`로 만든다(L1 승인). 회전은 1.0초, 2바퀴(U1).
- 필터는 카테고리 다중 선택(기본 전체)과 국물 3택(전체/국물 있음/국물 없음, 기본 전체)이다. 다시 뽑기는 직전 메뉴를 뺀다. 조건을 바꾸면 결과를 지운다. 후보가 0개면 "국물 조건 없애기" 버튼을 보인다(U7).
- 뽑기 버튼은 돌림판 아래 하나다. 결과가 없으면 "룰렛 돌리기", 결과가 있으면 "다시 뽑기"로 라벨만 바뀐다. 결과 카드 안에는 다시 뽑기 버튼이 없다(U3). 포커스는 이 버튼에 머물고 결과는 `role="status"`가 알린다.
- 지도 링크는 일반 웹 URL(https)이고 새 탭에서 연다. `target="_blank"`, `rel="noopener noreferrer nofollow"`. 검색어는 메뉴 이름뿐이다. 지도 앱이 없어도 현재 모바일 브라우저의 새 탭에서 웹 페이지로 열린다.
- 위치 권한은 어디에서도 요청하지 않는다. `next.config.ts`의 `Permissions-Policy: geolocation=()`를 그대로 둔다(바꾸지 않는다).
- 무작위 결과 검증은 (1) 순수 함수에 난수 함수를 주입해 e2e 스펙에서 직접 호출하고, (2) 브라우저 테스트는 Playwright `addInitScript`로 `crypto.getRandomValues`를 고정한다. 운영 코드에 테스트 전용 경로, 플래그, 쿼리 파라미터를 두지 않는다.
- 새 라이브러리, 새 shadcn 컴포넌트, 새 환경변수, 새 이미지·폰트, 새 색 토큰은 없다.

## 1. 승인된 결정과 plan과 달라진 점

### 1.1 승인된 결정 (2026-11-19 사용자)

| plan 질문 | 결정 | 설계 반영 |
|---|---|---|
| Q1 메뉴 목록 | 6개 카테고리, 48개 기획안 그대로 | 3.3 |
| Q2 국물 필터 | 넣는다. 메뉴 속성 국물/비국물 | 3.1 `broth`, 4.2 |
| Q3 직전 메뉴 | 다시 뽑기에서 제외 | 4.3 |
| Q4 조건 변경 | 결과를 지운다 | 4.4 |
| Q5 지도 링크 | 라벨 "지도에서 찾아보기"(중립). 앱 딥링크 없이 일반 웹 URL을 새 탭으로 연다. 같은 탭 안은 2026-11-19 사용자가 새 탭으로 변경 | 6장 |
| Q6 사행성 | 결과가 보상·경품·금전과 무관하고 오락 목적이라는 문구를 화면에 명시 | 7.2 (문구 U5) |
| Q13 문구 | title·description·메뉴 설명 정정, "메뉴 추천" 표현(검색 키워드) 승인 | 9장, 10장 |
| 나머지 | plan 기본안·추천안 채택 | 아래 |

나머지 질문의 기본안 적용 결과

- Q7 점심운 문구: 카테고리별 4줄, 24줄(L4 승인, 3.4).
- Q8 메뉴 설명·사진: 이름만 둔다.
- Q9 기존 자료: 현재 작업 트리에 `supabase/migrations/0003_restaurants.sql`이 없다(2026-11-19 확인). 이 설계는 DB를 쓰지 않으므로 영향이 없다. 저장소 밖 `지역음식점 파일/` 처리는 사용자 결정이며 설계 범위 밖이다.
- Q10 이벤트 수집: 보내지 않는다. Vercel Web Analytics의 페이지 조회 집계만 남는다.
- Q11 법령: 위치를 받지 않으므로 대상이 줄었다는 기획 판단을 따른다. `COMPLIANCE.md` 기록 방식은 12.3.
- Q12 처리방침: plan 판단대로 수집 항목은 바꾸지 않고, 외부 지도 링크 이동 안내 한 줄만 추가한다(12.2).
- Q14 카테고리 이름: 한식, 중식, 일식, 양식, 분식, 세계·기타.
- Q15 색: `text-menu-lunch`로 통일(U6, 9장).
- Q16 돌림판 재사용: 공용 컴포넌트(5장, L1 승인).
- Q17~Q19: 출시 전 확인과 PM 처리(15장).
- Q20 식품 표현: 메뉴 이름 외 설명 금지 원칙 채택.

### 1.2 plan 문장과 달라지는 곳 (승인 결정에 따른 것, QA 기준)

| plan | 바뀐 기준 | 이유 |
|---|---|---|
| "근처에서 찾기" 라벨 | 쓰지 않는다. 링크 묶음 제목은 "지도에서 찾아보기", 링크 이름은 "카카오맵에서 찾아보기", "네이버지도에서 찾아보기"(AC-13) | Q5 결정 |
| 예외·빈 상태 "카테고리 하나면 최소 6개" | 국물 필터 때문에 후보가 0~5개가 될 수 있다. 0개면 빈 상태 안내와 "국물 조건 없애기" 버튼(4.2) | Q2 결정, U7 |
| 화면 흐름 4 "결과 아래에 지도 검색 링크 두 개와 '다시 뽑기' 버튼" | "다시 뽑기"는 결과 카드 안이 아니라 돌림판 아래의 같은 버튼이다. 결과가 있으면 라벨이 "룰렛 돌리기"에서 "다시 뽑기"로 바뀐다. 결과 카드에는 지도 링크와 고지만 있다 | U3 |
| AC-18 "결과가 나온 뒤 '다시 뽑기' 버튼이 보인다. 누르면 연출 후 새 결과가 나오고 이전 결과 문구가 사라진다" | 뜻은 그대로다. 확인 대상은 돌림판 아래 버튼의 이름이 "다시 뽑기"로 바뀌는지, 누르면 회전 중 결과 카드가 사라졌다가 새 결과가 나오는지다. 결과 카드 안에서 "다시 뽑기"를 찾지 않는다 | U3 |
| AC-19 "[Q3 확정 후]" | 다시 뽑기에서 직전 메뉴가 나오지 않는다. 후보가 1개뿐이면 예외 | Q3 결정 |
| AC-20 "[Q4 확정 후]" | 조건을 바꾸면 결과 영역과 상태 문장이 지워지고 버튼 라벨이 "룰렛 돌리기"로 돌아간다 | Q4 결정, U3 |
| AC-29 "[Q6 확정 후]" | 보상 없음 고지 "룰렛 결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 무관한 오락입니다."가 룰렛 영역 아래에 상시 보인다 | Q6 결정, U5 |

- AC-14(두 링크는 새 탭에서 열린다)는 plan 그대로다. 검증 방법은 14.2.
- PM은 이 표를 QA에게 넘길 때 같이 전달한다. plan.md는 고치지 않는다.

### 1.3 UI/UX 승인 결정 반영 (U1~U7, 2026-11-19 사용자)

| 번호 | 결정 | 설계 반영 |
|---|---|---|
| U1 | 회전 1.0초, 시계 방향 2바퀴 + 목표 각도, ease `[0.2, 0.7, 0.2, 1]` | 5.3, 14.2 대기 시간 |
| U2 | 칸 글자 3단계: 1~12칸 큰 글자, 13~28칸 작은 글자, 29칸 이상 글자 없음 | 5.2 (공용 컴포넌트가 칸 수로 정한다) |
| U3 | 돌림판 아래 버튼 하나. 라벨 "룰렛 돌리기" ↔ "다시 뽑기". 결과 카드 안의 다시 뽑기 버튼은 두지 않는다(돌리는 동안 카드가 사라져 포커스를 잃는 문제를 피한다) | 4.3, 5.4, 8.2, 8.3, 8.4, 14.2 |
| U4 | 소개·사용 순서는 plan 순서(h1 → 고지 → 소개 → 도구) 유지, 내용 압축 | 8.2 순서 변경 없음 |
| U5 | 보상 없음 문구 A안 "룰렛 결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 무관한 오락입니다." | 7.2 |
| U6 | `menu.constant.ts` 점심 `colorClass`를 `text-menu-lunch`로 통일. `design-system.md` 변경 없음 | 9장, 14.1 |
| U7 | 후보 0개 안내에 "국물 조건 없애기" 버튼. 기존 `SET_BROTH('all')`만 쓰고 새 상태 동작은 없다 | 4.2, 8.2, 8.3, 8.4, 14.2 |

화면 모양, 색, 간격, 문구 최종안은 `docs/lunch/ui-ux-design.md`를 따른다. 이 설계서와 다르면 PM에게 올린다.

## 2. 폴더 구조

```
src/app/lunch/today/page.tsx              # 수정: ComingSoon → 실제 페이지 (서버). LunchTodayPage

src/components/common/
  roulette.component.tsx                  # 신규 (L1): 'use client'. RouletteComponent. features import 금지
src/types/
  roulette.type.ts                        # 신규 (L1): RouletteItemType

src/features/lunch/
  types/
    lunch.type.ts                         # 점심 타입 전부 (3.1, 확정)
  constants/
    lunch-category.constant.ts            # LUNCH_CATEGORIES (6개, 순서·이름)
    lunch-menu.constant.ts                # LUNCH_MENUS (48개), LUNCH_MENU_COUNT
    lunch-luck.constant.ts                # LUNCH_LUCK_LINES (카테고리별 점심운 문구)
    lunch-map.constant.ts                 # 지도 서비스 2개: key, label, 검색 URL 앞부분
    lunch-notice.constant.ts              # 상시 고지, 무작위 고지, 보상 없음 고지, 외부 링크 안내, 결과 하단 짧은 고지,
                                          # 빈 상태 안내, 카테고리 0개 안내, noscript 안내, 버튼 라벨
    lunch-faq.constant.ts                 # LUNCH_FAQ (화면과 JSON-LD가 같은 배열)
    lunch-seo.constant.ts                 # title, description, keywords, OG alt, 경로, 브레드크럼 이름
    lunch-copy-rule.constant.ts           # 금지 표현·허용 예외 문장 (e2e 검사 전용, 화면에서 import 금지)
  utils/
    lunch-pick.util.ts                    # 후보 필터, 메뉴 뽑기(직전 제외), 점심운 뽑기 (4장)
    lunch-map-link.util.ts                # 지도 검색어, 검색 URL 만들기 (6장)
  today/
    components/
      root.component.tsx                  # 'use client'. LunchTodayComponent (컨테이너)
      filter-panel.component.tsx          # 카테고리 칩 + 국물 선택 + 후보 수 + 빈 상태 안내 + "국물 조건 없애기" 버튼
      spin-panel.component.tsx            # RouletteComponent + 뽑기 버튼 하나("룰렛 돌리기"/"다시 뽑기")
      status.component.tsx                # role="status" 결과 알림 문장 (항상 마운트, sr-only)
      result.component.tsx                # 메뉴 이름, 카테고리, 오늘의 점심운, 지도 링크, 결과 하단 짧은 고지 (버튼 없음)
      map-links.component.tsx             # 지도 링크 2개 + 외부 이동 표시 + 외부 링크 안내
      disclaimer-notice.component.tsx     # 서버. h1 바로 아래 상시 오락 고지
      intro.component.tsx                 # 서버. 설명 문단, 사용 순서 3단계 (U4 압축)
      random-notice.component.tsx         # 서버. 룰렛 영역 아래 상시 무작위 고지 + 보상 없음 고지
      faq.component.tsx                   # 서버. FAQ 목록
      noscript-notice.component.tsx       # 서버. <noscript> 안내
    hooks/
      use-lunch-today.hook.ts             # useReducer 화면 상태 (8.3)

docs/lunch/
  copy-log.md                             # 점심운·고지·FAQ 문구 작성·검수 이력 (타로·운세 방식)

e2e/
  lunch-copy.spec.ts                      # 데이터·문구·정적 소스 검사 (14.1)
  lunch.spec.ts                           # 화면·HTML·SEO 검사 (14.2)
```

- 컴포넌트 이름: `today/components/root.component.tsx` → `LunchTodayComponent`, `filter-panel.component.tsx` → `LunchTodayFilterPanelComponent`, `map-links.component.tsx` → `LunchTodayMapLinksComponent`, 공용 → `RouletteComponent`. 페이지는 `LunchTodayPage`(default export, 이름 유지).
- 화면이 하나라 `shared/components/`, `services/`, `queries/`는 만들지 않는다.
- `features/lunch/`는 다른 기능(tarot, fortune, dream, lotto)을 import하지 않는다.
- 데이터 파일은 카테고리별로 나누지 않고 `lunch-menu.constant.ts` 한 파일로 둔다. 48개 한 줄짜리 항목이라 한 파일이 검수·diff에 더 편하다. 카테고리 순서대로 적고 카테고리마다 주석 한 줄로 구분한다.

## 3. 타입과 메뉴 데이터 (확정)

### 3.1 타입 (`src/features/lunch/types/lunch.type.ts`)

개발 담당과 문구 작성자가 임의로 바꾸지 않는다.

```ts
export type LunchCategoryKeyType =
  | 'korean'   // 한식
  | 'chinese'  // 중식
  | 'japanese' // 일식
  | 'western'  // 양식
  | 'bunsik'   // 분식
  | 'world';   // 세계·기타

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

export type LunchMapProviderKeyType = 'kakao' | 'naver';

export type LunchMapLinkType = Readonly<{
  provider: LunchMapProviderKeyType;
  /** 링크 이름. 예: '카카오맵에서 찾아보기' */
  label: string;
  href: string;
}>;

export type LunchFaqItemType = Readonly<{ question: string; answer: string }>;
```

- 가격, 칼로리, 맛, 매운 정도, 재료, 설명, 사진 필드는 두지 않는다(plan 제외, Q8, Q20).
- `id` 형식: `/^[a-z]+(-[a-z]+)*$/`, 40자 이하, 중복 없음. 국어의 로마자 표기나 영어 일반명사를 쓴다. 예: `kimchi-jjigae`, `jjajangmyeon`, `donkatsu`, `pasta`.

### 3.2 선언 방식

- `LUNCH_CATEGORIES: readonly LunchCategoryType[]`. 배열 순서가 칩 순서다: 한식, 중식, 일식, 양식, 분식, 세계·기타.
- `LUNCH_MENUS`는 `as const satisfies readonly LunchMenuType[]`로 선언한다. 필드 누락과 잘못된 카테고리·국물 값은 typecheck에서 잡힌다. 개수, 중복, 최소 수는 14.1 데이터 검사로 잡는다.
- `LUNCH_MENU_COUNT = 48`.
- 배열 순서가 돌림판 칸 순서다. 렌더링 중에 섞지 않는다(서버 HTML과 첫 클라이언트 렌더가 같아야 hydration 오류가 없다).

### 3.3 메뉴 48개와 국물 분류 (확정)

국물 판단 기준: "주 요리가 국물에 담겨 나오고 국물을 떠먹는 메뉴"면 `soup`, 그 밖은 `dry`. 곁들이는 국이나 소스는 보지 않는다. 경계 메뉴(★)는 L2에서 사용자가 아래 분류로 확정했다.

| 카테고리 | soup | dry | 수 (soup/dry) |
|---|---|---|---|
| 한식 | 김치찌개, 된장찌개, 순대국, 설렁탕, 칼국수, 냉면★ | 비빔밥, 제육볶음, 불고기, 백반★ | 10 (6/4) |
| 중식 | 짬뽕, 마라탕, 누룽지탕★ | 짜장면, 탕수육, 볶음밥, 마라샹궈, 깐풍기 | 8 (3/5) |
| 일식 | 라멘, 우동 | 돈카츠, 초밥, 규동, 소바★, 카레라이스, 가라아게 | 8 (2/6) |
| 양식 | 없음 | 파스타, 스테이크, 리조또, 피자, 오므라이스, 샌드위치, 햄버거, 그라탕 | 8 (0/8) |
| 분식 | 어묵★ | 떡볶이, 김밥, 라볶이, 쫄면, 튀김 | 6 (1/5) |
| 세계·기타 | 쌀국수, 샤브샤브, 똠얌꿍 | 팟타이, 타코, 케밥, 치킨, 쌈밥 | 8 (3/5) |
| 합계 | 15 | 33 | 48 |

- ★ 경계 메뉴(L2 확정): 냉면 soup(물냉면 기준), 백반 dry(주 요리가 밥상), 누룽지탕 soup, 소바 dry(자루소바 기준), 어묵 soup(분식집 국물 어묵 기준).
- 메뉴 이름은 plan 표의 글자를 그대로 쓴다. 표기 변경(예: "순대국"과 "순댓국")은 문구 단계에서 사용자 확인을 받는다.
- `mapQuery`는 1차에 쓰지 않는다(모두 이름으로 검색). 출시 전 확인(15장)에서 이름만으로 검색이 어색한 메뉴(예: 튀김, 어묵, 백반)가 나오면 그때 이 필드로 보정한다. 보정해도 이름을 포함해야 한다.

### 3.4 점심운 문구 (`lunch-luck.constant.ts`)

- 형식: `LUNCH_LUCK_LINES: Readonly<Record<LunchCategoryKeyType, readonly string[]>>`. 뽑힌 메뉴의 카테고리 배열에서 한 줄을 고른다(4.5).
- 개수(L4 확정): 카테고리당 4줄, 모두 24줄. 국물 여부와 무관한 문장으로 쓴다. 메뉴 이름이나 국물을 넣으면 결과 메뉴와 어긋날 수 있기 때문이다(예: 짜장면이 나왔는데 "국물 요리가 어울리는 날").
- 문장 규칙: 합니다체, 한 문장, "~일 수 있습니다", "~어떨까요" 같은 가벼운 표현. 맛·건강·영양·효능 설명 금지, 7.3 금지 표현 금지. 예: "오늘은 익숙한 한식 한 그릇으로 마음이 편해지는 날일 수 있습니다."
- 작성 순서: 카테고리마다 1줄씩 샘플 6줄 → 사용자 검수 → 나머지 18줄. 이력은 `docs/lunch/copy-log.md`(타로·운세 copy-log 형식)에 남긴다.

## 4. 뽑기 로직 (확정, `lunch-pick.util.ts`)

### 4.1 함수

```ts
/** 필터에 맞는 메뉴를 LUNCH_MENUS 순서 그대로 돌려준다 */
export function filterLunchMenus(
  menus: readonly LunchMenuType[],
  filter: LunchFilterType
): readonly LunchMenuType[];

/**
 * 후보 중 하나를 같은 확률로 뽑는다. 후보가 비면 null.
 * previousId가 후보 안에 있고 후보가 2개 이상이면 그 메뉴를 빼고 뽑는다.
 */
export function pickLunchMenu(
  candidates: readonly LunchMenuType[],
  previousId: string | null,
  randomInt?: (maxExclusive: number) => number // 기본값 secureRandomInt
): LunchMenuType | null;

/** 카테고리의 점심운 문구 중 하나를 같은 확률로 고른다 */
export function pickLunchLuckLine(
  category: LunchCategoryKeyType,
  randomInt?: (maxExclusive: number) => number // 기본값 secureRandomInt
): string;
```

- 난수는 `src/lib/random.ts`의 `secureRandomInt`만 쓴다. `Math.random`, `sort(() => Math.random() - 0.5)`를 쓰지 않는다.
- `randomInt` 인자는 테스트에서 고정 난수를 넣기 위한 순수 함수 인자다. 화면 코드는 이 인자를 넘기지 않는다. 운영 화면에서 결과를 지정할 길이 생기지 않는다.

### 4.2 필터 규칙과 빈 결과

- 카테고리: `filter.categories`에 든 카테고리의 메뉴만 남긴다. 기본은 6개 전체. 순서는 `LUNCH_MENUS` 순서다.
- 국물: `'all'`이면 조건 없음, `'soup'`/`'dry'`면 `menu.broth`가 같은 메뉴만 남긴다. 기본 `'all'`.
- 두 조건은 AND다.
- 후보 수에 따른 화면 처리

| 후보 수 | 뽑기 버튼 | 안내 |
|---|---|---|
| 카테고리 0개 선택 | 비활성(`disabled`) | "카테고리를 하나 이상 고르세요" 의미 안내(AC-5). 버튼 `aria-describedby`로 연결. "국물 조건 없애기" 버튼은 없다(국물을 풀어도 후보가 생기지 않는다) |
| 카테고리 1개 이상, 후보 0개 | 비활성(`disabled`) | "조건에 맞는 메뉴가 없습니다. 국물 조건을 바꾸거나 카테고리를 더 고르세요." + "국물 조건 없애기" 버튼(U7). 예: 양식만 + 국물 있음 |
| 1개 | 활성 | 별도 안내 없음. 직전 메뉴 제외는 적용하지 않는다(4.3) |
| 2개 이상 | 활성 | 없음 |

- 후보 0개는 국물 조건이 `'all'`이 아닐 때만 생긴다(모든 카테고리에 메뉴가 6개 이상 있으므로). 그래서 "국물 조건 없애기"를 누르면 항상 후보가 1개 이상이 된다.
- "국물 조건 없애기"는 기존 `setBroth('all')`(`SET_BROTH`)을 부른다. 새 액션, 새 상태 필드가 없다(U7).
- 안내 블록은 항상 마운트된 `role="status"` 껍데기 안에 내용만 조건부로 들어온다(ui-ux-design.md). "국물 조건 없애기" 버튼은 이 `role="status"` 요소 바로 뒤, 밖에 둔다(알림 영역 안에 조작 요소를 넣지 않는다, 5.4).
- 후보 수 문장("후보 메뉴 {n}개")에는 `aria-live`를 두지 않는다(칩을 누를 때마다 읽히면 시끄럽다).
- 돌림판에는 후보 전체를 칸으로 그린다. 후보 0개면 빈 돌림판을 그린다. 모양은 UI/UX.

### 4.3 다시 뽑기와 직전 메뉴 제외 (Q3)

- 상태에 `lastPickedId`(마지막으로 결과가 된 메뉴 id)를 둔다. 결과가 정해질 때(`SPIN_START`) 갱신한다.
- 다음 뽑기에서 `pickLunchMenu(candidates, lastPickedId)`를 부른다. 직전 메뉴가 후보에 있고 후보가 2개 이상이면 그 메뉴를 빼고 남은 후보 중 같은 확률로 뽑는다.
- 조건을 바꿔 결과를 지워도 `lastPickedId`는 남긴다(새로고침 전까지 메모리). 그래서 "조건 변경 → 다시 돌리기"에서도 같은 메뉴가 연속으로 나오지 않는다. 직전 메뉴가 새 후보에 없으면 제외할 것이 없다.
- 후보가 1개면 그 메뉴가 다시 나온다. 예외로 둔다(뽑을 다른 메뉴가 없음).
- 돌림판에는 직전 메뉴 칸도 그대로 그린다(ui-ux-design.md: 숨기거나 흐리게 하지 않는다).
- 버튼은 하나다(U3). "룰렛 돌리기"와 "다시 뽑기"는 같은 버튼, 같은 동작(`spin`)이고 라벨만 다르다.
  - 라벨 규칙: `spin.status === 'done'`이면 "다시 뽑기", 그 밖(`idle`, `spinning`)이면 "룰렛 돌리기". 조건을 바꿔 결과가 지워지면 "룰렛 돌리기"로 돌아간다. 라벨은 상태에서 계산하고 따로 저장하지 않는다.
  - 결과 카드 안에는 다시 뽑기 버튼을 두지 않는다. 돌리는 동안 결과 카드가 사라지므로 카드 안 버튼을 누르면 포커스가 사라지기 때문이다.

### 4.4 조건 변경 (Q4)

- 칩이나 국물 선택을 바꾸면 결과(`spin`)를 `idle`로 돌리고 상태 문장을 비운다. `lastPickedId`는 남긴다(4.3). "국물 조건 없애기"도 같은 처리다.
- 돌아가는 중(`spinning`)에는 조건 변경을 받지 않는다(AC-7). 리듀서에서도 무시한다.

### 4.5 한 번의 뽑기 순서

1. 사용자가 버튼을 누른다. `spinning`이거나 후보가 0개면 아무것도 하지 않는다.
2. 이벤트 핸들러에서 `pickLunchMenu`로 메뉴를, `pickLunchLuckLine`으로 문구를 먼저 정한다.
3. `SPIN_START { spinId, menuId, luckLine }`. `spinId`는 1씩 늘린다. 이전 결과 카드와 알림 문장이 사라진다.
4. 돌림판이 `targetIndex`(후보 배열에서 메뉴 위치)로 1.0초 동안 돌다가 멈추고 `onSpinEnd(spinId)`를 부른다.
5. `SPIN_END { spinId }`. `spinId`가 현재 값과 다르면 무시한다. `done`이 되면 알림 문장, 결과 카드, 버튼 라벨 "다시 뽑기"가 같은 순간에 바뀐다.

연출이 결과를 바꾸지 않는다. 난수는 2단계에서만 쓴다.

## 5. 돌림판 컴포넌트 (L1 승인)

### 5.1 위치 결정

| | A. 공용 `src/components/common/roulette.component.tsx` (승인) | B. `src/features/lunch/today/components/roulette.component.tsx` (채택 안 함) |
|---|---|---|
| 방식 | 점심을 모르는 범용 연출 컴포넌트. 항목 이름과 멈출 위치만 받는다 | 같은 props로 점심 화면 안에 둔다. 두 번째 사용처가 생기면 공용으로 옮긴다 |
| 근거 | `code-style.md` "특정 기능을 모르는 범용 코드는 처음부터 공용" 예외에 맞는다. 결과 결정(난수)을 부모가 갖고 컴포넌트는 연출만 하므로 도메인 지식이 없다. 후속 "운빨 뽑기 도구(돌림판)"가 옮기지 않고 그대로 쓴다 | 규칙 기본값("처음엔 가장 좁은 곳")을 따른다 |
| 단점 | 사용처가 하나뿐이라 인터페이스가 과하게 일반화될 위험. 그래서 props를 최소로 둔다 | 옮길 때 파일 이동, import 수정, 리뷰가 한 번 더 든다. 그 사이 점심 지식이 섞일 수 있다 |

A로 확정. 아래 props만 두고, 사다리타기·제비뽑기용 기능은 미리 넣지 않는다.

### 5.2 인터페이스 (확정)

```ts
// src/types/roulette.type.ts
export type RouletteItemType = Readonly<{ key: string; label: string }>;

// src/components/common/roulette.component.tsx
export type RoulettePropsType = Readonly<{
  items: readonly RouletteItemType[];
  /** 멈출 칸. null이면 멈춘 채로 둔다 */
  targetIndex: number | null;
  /** 바뀔 때마다 targetIndex로 새로 돈다 */
  spinId: number;
  /** 연출이 끝나면(동작 줄이기에서도) 반드시 한 번 부른다 */
  onSpinEnd?: (spinId: number) => void;
  className?: string;
}>;
```

- 컴포넌트는 난수를 만들지 않는다. 멈출 각도는 "목표 칸의 가운데 + 정해진 바퀴 수"로 계산한다. 칸 안에서 멈추는 위치를 무작위로 흔들지 않는다(테스트가 결정적이 된다).
- 버튼, 결과 문구, 알림 영역을 갖지 않는다. 모두 부모가 갖는다.
- `features/`를 import하지 않는다. 색은 토큰 클래스와 CSS 변수만 쓴다. 칸 색 바꾸기는 `className` 또는 CSS 변수로 부모가 넘긴다.
- 그림은 인라인 SVG로 그린다(외부 이미지·아이콘 세트 없음). 층 구성(테두리, 칸, 당첨 칸, 3시 방향 바늘, 고정 병뚜껑과 결과 이름), 크기, 토큰은 ui-ux-design.md를 따른다.
- 칸 글자 3단계(U2, 확정): 컴포넌트가 `items.length`로 정한다. props로 받지 않는다(어느 사용처든 같은 가독성 규칙).

| `items.length` | 칸 글자 |
|---|---|
| 1~12 | 이름 전체, 큰 글자(viewBox 20 단위) |
| 13~28 | 이름 전체, 작은 글자(viewBox 15 단위) |
| 29 이상 | 글자 없음(칸 경계선만). 결과 이름은 멈춘 뒤 병뚜껑과 결과 카드가 전한다 |

- 칸 수 예외: 0개면 칸 없는 빈 원판(바늘 없음, 회전 안 함), 1개면 전체 원 하나, 2개면 반원 둘(ui-ux-design.md).
- `items`가 바뀌면 각도를 0으로 되돌리고 당첨 칸과 병뚜껑 이름을 지운 채 즉시 다시 그린다(전환 효과 없음).
- 회전 중 다시 `spinId`가 바뀌는 일은 부모가 막는다(버튼 잠금). 그래도 바뀌면 새 목표로 다시 시작하고, 이전 `spinId`의 `onSpinEnd`는 부르지 않는다.

### 5.3 모션과 동작 줄이기

- framer-motion을 쓴다(기존 의존성). 사이트 전체에 `MotionConfig reducedMotion="user"`(`src/providers/motion.provider.tsx`)가 있다.
- 회전(U1, 확정): 1.0초, 시계 방향 2바퀴 + 목표 각도, ease `[0.2, 0.7, 0.2, 1]`. 누적 각도로 `animate={{ rotate }}`, 중심 기준. 오버슈트 안착 없음. 값은 컴포넌트 안 상수로 둔다(props 아님).
- 동작 줄이기 설정(`useReducedMotion() === true`): 회전 애니메이션 없이 최종 각도로 바로 놓는다(목표 칸이 바늘 앞에 보인다). `onSpinEnd`는 다음 틱(`queueMicrotask` 또는 `setTimeout 0`)에 직접 부른다. framer-motion이 줄이기 상태에서 완료 콜백을 부르지 않는 경우를 막기 위해서다(AC-6).
- 결과 문장, 결과 카드, 지도 링크, 버튼 라벨 변경은 동작 줄이기와 무관하게 똑같이 나온다.
- 결과 카드는 효과 없이 바로 나타난다(ui-ux-design.md).
- CSS 애니메이션을 쓰면 `motion-reduce:` 대응이 필요하다(design-guard). 이 설계는 framer-motion만 쓴다.

### 5.4 접근성

- 돌림판 SVG는 장식으로 본다: 바깥 요소에 `aria-hidden="true"`. 칸 이름과 병뚜껑 글자를 스크린 리더가 읽지 않게 한다.
- 대신 부모가 텍스트로 알린다
  - 결과 알림: `LunchTodayStatusComponent`는 처음부터 마운트된 `role="status"`(polite, `aria-atomic="true"`) 요소이고 화면에는 보이지 않는다(`sr-only`). `SPIN_END` 때 "뽑힌 메뉴는 ○○(카테고리)입니다" 의미 문장을 넣는다(AC-8). 조건 변경과 `SPIN_START` 때 비운다. 돌기 시작할 때의 "도는 중" 알림은 넣지 않는다(1.0초라 결과 알림과 겹친다, ui-ux-design.md).
  - 지도 링크와 버튼은 알림 영역 밖에 둔다(알림 영역 안에 조작 요소를 넣지 않는다).
- 회전 중 룰렛 영역 컨테이너에 `aria-busy="true"`.
- 포커스(U3, 확정)
  - 뽑기 버튼은 하나이고 돌리는 동안에도, 결과가 나온 뒤에도 같은 자리에 남는다. 누른 뒤 포커스는 이 버튼에 그대로 머문다. 회전 중에는 `aria-disabled="true"`라 포커스를 잃지 않는다.
  - 결과가 나와도 포커스를 옮기지 않는다. 결과는 `role="status"`가 발표한다. 키보드 사용자는 같은 버튼에서 Enter를 다시 눌러 "다시 뽑기"를 하거나, Tab으로 결과 카드의 지도 링크로 간다.
  - 버튼 라벨이 "룰렛 돌리기"에서 "다시 뽑기"로 바뀌어도 같은 요소라 포커스가 유지된다.
  - "국물 조건 없애기"를 누르면 이 버튼은 사라진다(후보가 생기므로). 포커스가 문서 처음으로 떨어지지 않게 누른 직후 뽑기 버튼(이제 활성)으로 포커스를 옮긴다. 뽑기 버튼 `ref`는 root가 갖고 React 19 `ref` prop으로 넘긴다(`forwardRef` 금지).

## 6. 지도 링크 (확정, `lunch-map-link.util.ts`, `lunch-map.constant.ts`)

### 6.1 URL 형식

| 서비스 | 링크 이름 | URL 형식 | 출시 전 확인 |
|---|---|---|---|
| 카카오맵 | 카카오맵에서 찾아보기 | `https://map.kakao.com/link/search/{encodeURIComponent(검색어)}` | 카카오 지도 URL 안내의 검색 링크 형식. 대안 `https://map.kakao.com/?q={검색어}` |
| 네이버지도 | 네이버지도에서 찾아보기 | `https://map.naver.com/p/search/{encodeURIComponent(검색어)}` | 현행 웹 지도 경로. 모바일은 `m.map.naver.com`으로 넘어가는지 확인. 대안 `https://m.map.naver.com/search2/search.naver?query={검색어}` |

- 검색어: `menu.mapQuery ?? menu.name`. "근처", "점심", "맛집" 같은 말을 붙이지 않는다("맛집"은 금지 표현이기도 하다). 붙이는 것이 결과를 바꾸는지는 출시 전 확인 항목이다. 바꾸더라도 승인 없이 넣지 않는다.
- 호스트와 경로는 `lunch-map.constant.ts` 상수로 고정하고 검색어만 `encodeURIComponent`로 붙인다. 데이터나 입력으로 URL 전체를 만들지 않는다.
- 쿼리에 위치, 식별자, 선택 조건, 결과 기록을 넣지 않는다(AC-16). 검색어 외 파라미터가 없다.
- 앱 딥링크(`kakaomap://`, `nmap://`), intent URL, 지도 API, 길찾기, API 키를 쓰지 않는다.

### 6.2 링크 속성 (확정)

```html
<a href="https://map.kakao.com/link/search/%EA%B9%80%EC%B9%98%EC%B0%8C%EA%B0%9C"
   target="_blank"
   rel="noopener noreferrer nofollow">
  카카오맵에서 찾아보기 <span class="sr-only">(새 탭에서 외부 사이트 열림)</span> <svg aria-hidden="true" .../>
</a>
```

- `target="_blank"`: 새 탭으로 연다(Q5 변경 결정, plan F-5·AC-14). 룰렛 결과가 이 페이지에 그대로 남으므로 지도를 본 뒤 탭을 닫거나 돌아오면 결과와 다시 뽑기를 이어 쓸 수 있다.
- `rel="noopener noreferrer nofollow"`
  - `noopener`: 새 탭의 지도 페이지가 `window.opener`로 이 페이지를 조작하지 못하게 한다(탭 가로채기 방지).
  - `noreferrer`: 지도 서비스에 우리 페이지 주소를 Referer로 보내지 않는다. 사이트 기본 `Referrer-Policy: strict-origin-when-cross-origin`이라 원래도 출처(origin)만 가지만, "메뉴 이름 외 정보를 보내지 않는다"는 원칙을 링크 단위로 확실히 한다. `noopener` 효과도 함께 가진다. 유입 경로를 지도 사업자에 알릴 사업상 필요가 없다.
  - `nofollow`: 검색 결과 페이지로 가는 링크는 편집상 추천 링크가 아니다. "추천이 아님" 원칙과 맞고, 크롤러가 따라갈 필요가 없다.
- `next/link`가 아니라 일반 `<a>`를 쓴다(외부 주소, 프리페치 불필요). 모양은 shadcn `Button asChild variant="outline"`(ui-ux-design.md).
- 팝업 차단: 사용자가 직접 누른 링크라 브라우저 팝업 차단 대상이 아니다. `window.open`을 쓰지 않는다. 별도 처리는 하지 않는다(plan 예외·빈 상태).
- 외부 이동 표시: lucide `ExternalLink`(기존 의존성)를 `aria-hidden`으로 두고, 접근성 이름 뒤에 sr-only "(새 탭에서 외부 사이트 열림)"을 붙인다(AC-14, AC-32).
- 카카오·네이버 로고와 브랜드 아이콘은 쓰지 않는다. 텍스트 라벨만 쓴다.
- 링크 묶음 위에 제목 h3 "지도에서 찾아보기"(Q5)를 두고, 바로 아래에 외부 링크 안내(7.2)를 둔다(AC-27).

### 6.3 새 탭 이동과 모바일 동작

- 이 페이지는 그대로 남고 결과는 메모리에 유지된다. 결과를 저장하거나 복원할 필요가 없다(AC-21, AC-23과 충돌 없음).
- 이 사이트는 앱이 아니라 모바일 브라우저로 쓰는 웹 서비스다. 링크는 https 웹 URL이므로 지도 앱이 없어도 현재 모바일 브라우저의 새 탭에서 웹 지도 검색 페이지로 열린다.
- 지도 앱이 설치되어 있으면 OS의 유니버설 링크·앱 링크 처리로 앱이 열릴 수 있다. 이것은 브라우저와 OS 동작이며 우리가 막지 않는다. 앱이 있을 때와 없을 때의 실제 동작은 출시 전 확인 항목이다(15장).
- 카카오톡 등 인앱 브라우저는 `target="_blank"`를 같은 창 이동이나 외부 브라우저 열기로 처리할 수 있다. 출시 전 확인 항목에 넣는다.
- 지도 사이트가 자기 도메인에서 위치 권한을 요청할 수 있다. 이것은 해당 사이트의 동작이다. AC-22는 우리 출처(origin)의 페이지에서 권한 요청이 없는지로 본다.

## 7. 고지와 문구

### 7.1 문구 원칙

- 합니다체. 결과는 "뽑힌 메뉴" 또는 "오늘의 메뉴"로 부른다. "추천"이라는 말은 결과·본문 문구에 쓰지 않는다. 예외: 메타 keywords의 "점심 메뉴 추천"(Q13 승인), 고지 문장의 "추천하거나 평가하지 않습니다".
- 메뉴 이름 외에 메뉴를 설명하지 않는다(맛, 건강, 영양, 효능, 가격, 칼로리).
- 카카오, 네이버는 링크 라벨 텍스트로만 쓴다.
- 최종 문구는 ui-ux-design.md 문구 표를 따른다.

### 7.2 고지 배치 (상수는 `lunch-notice.constant.ts`)

| 고지 | 위치 | 렌더링 | AC |
|---|---|---|---|
| 상시 오락 고지 (plan 초안) | h1 블록 바로 아래. 접기·툴팁 없음 | 서버 | AC-25 |
| 무작위 고지 ("결과는 무작위로 정해지며 특정 메뉴나 식당을 추천하거나 평가하지 않습니다") | 룰렛 영역(클라이언트 root) 바로 아래 상시 블록 | 서버 (`LunchTodayRandomNoticeComponent`) | AC-26 |
| 보상 없음 고지 (U5 확정): "룰렛 결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 무관한 오락입니다." | 무작위 고지와 같은 상시 블록, 바로 다음 줄 | 서버 | AC-29 |
| 외부 링크 안내 (plan 초안) | 결과 카드의 지도 링크 바로 아래 | 클라이언트 (결과가 있을 때) | AC-27 |
| 결과 하단 짧은 고지 (오락 목적 + 무작위) | 결과 카드 맨 아래 | 클라이언트 (결과가 있을 때) | AC-28 |
| JS 꺼짐 안내 | 필터 영역 앞 `<noscript>` | 서버 | plan 예외 |

- 보상 없음 고지는 결과가 없을 때도 보이도록 서버 블록에 둔다. 돌리기 전에 "보상이 없다"는 것을 알 수 있어야 사행성 오해를 줄인다.
- 결과 하단 짧은 고지와 외부 링크 안내는 결과가 없을 때 없어도 된다(plan AC가 "결과 영역 하단", "지도 링크 근처"로 정의).

### 7.3 금지 표현 (`lunch-copy-rule.constant.ts`, 검사 전용)

- `LUNCH_FORBIDDEN_TERMS`: 반드시, 무조건, 보장, 확실, 100%, 최고, 대박, 맛집, 인기, 베스트, 1위, 광고, 추천합니다, 추천 메뉴, 추천 가게, 별점, 후기, 칼로리, 가격, 혼밥, 건강에, 다이어트, 영양, 효능, 근처에서 찾기.
- `LUNCH_COPY_ALLOWED_SENTENCES`: 검사 전 대상 문자열에서 먼저 지우는 고지 문장. 상시 오락 고지("보장하지 않습니다"), 무작위 고지("추천하거나 평가하지 않습니다"), 외부 링크 안내, 결과 하단 짧은 고지, 보상 없음 고지만 넣는다. 검사를 통과시키려고 임의로 늘리지 않는다.
- 화면 코드는 이 파일을 import하지 않는다(14.1 정적 검사).

## 8. 프론트 구조

### 8.1 페이지 (서버/클라이언트 구분)

| 경로 | 파일 | 렌더링 |
|---|---|---|
| `/lunch/today` | `src/app/lunch/today/page.tsx` (수정) | 서버 컴포넌트, 정적. `ComingSoonComponent` 제거. `buildMetadata()` 사용(10장) |

- 클라이언트 경계는 `LunchTodayComponent`(root) 하나다. 그 아래 프레젠테이션 컴포넌트는 `'use client'`를 따로 붙이지 않는다. 예외는 공용 `RouletteComponent`(framer-motion, `'use client'`).
- root는 props 없이 `LUNCH_MENUS`, `LUNCH_CATEGORIES`, `LUNCH_LUCK_LINES`를 직접 import한다. 합쳐 수 KB라 번들 부담이 작고, 서버에서 넘길 가공이 없다.

### 8.2 컴포넌트 트리

순서는 plan 순서(h1 → 고지 → 소개 → 도구)를 유지한다(U4). DOM 순서와 화면 순서가 같다(데스크톱 2열 배치도 DOM 순서는 필터 → 돌림판 열 → 결과 열, ui-ux-design.md).

```
LunchTodayPage (서버, app)
  ContentWrapperComponent type="lunch"
    JsonLdComponent ×2                       # BreadcrumbList, FAQPage
    TitleWrapperComponent                    # h1 "오늘 뭐 먹지" (유일한 h1)
    LunchTodayDisclaimerNoticeComponent      # 서버. 상시 오락 고지 (AC-25)
    LunchTodayIntroComponent                 # 서버. 압축한 설명 문단 + 사용 순서 3단계 h2 "이렇게 이용합니다" (AC-34, U4)
    LunchTodayNoscriptNoticeComponent        # 서버. <noscript>
    LunchTodayComponent ('use client', root)
      LunchTodayFilterPanelComponent
        카테고리 칩 6개 (role="group", aria-pressed)
        국물 3택 (fieldset/legend, radio)
        후보 수 문장 (aria-live 없음)
        빈 상태 안내 (항상 마운트된 role="status" 껍데기, 내용만 조건부)
        "국물 조건 없애기" 버튼 (카테고리 1개 이상 + 후보 0개일 때만, role="status" 밖, U7)
      LunchTodaySpinPanelComponent           # aria-busy (회전 중)
        RouletteComponent (공용, aria-hidden)
        뽑기 버튼 하나: "룰렛 돌리기" / "다시 뽑기" (U3, AC-18)
      LunchTodayStatusComponent              # role="status", sr-only. 항상 마운트 (AC-8)
      LunchTodayResultComponent              # spin.status === 'done'일 때만. 버튼 없음
        메뉴 이름 h2 + 카테고리 배지
        "오늘의 점심운" 라벨 + 문구 (AC-9)
        LunchTodayMapLinksComponent          # h3 "지도에서 찾아보기" + 링크 2개(새 탭) + 외부 링크 안내 (AC-13~17, AC-27)
        결과 하단 짧은 고지 (AC-28)
      (데스크톱만) 결과 카드 자리 표시        # aria-hidden. 모양·문구는 ui-ux-design.md
    LunchTodayRandomNoticeComponent          # 서버. 무작위 고지 + 보상 없음 고지 (AC-26, AC-29)
    LunchTodayFaqComponent                   # 서버. h2 자주 묻는 질문 + 질문 h3 (AC-34)
```

- 블록 제목은 h2, 지도 링크 묶음과 FAQ 질문은 h3. h1은 하나다.
- 결과 카드는 `<section aria-labelledby={메뉴 이름 h2 id}>`로 두고 순위 번호(`<ol>`)를 쓰지 않는다.
- 결과 알림(`role="status"`)과 결과 카드를 나눈다. 알림 영역에는 짧은 문장만 넣는다(5.4).
- 결과 카드 자리 표시는 장식이며(`aria-hidden`) 상태가 아니라 `spin.status`로 렌더링 중 계산한다.

### 8.3 상태 위치 (`today/hooks/use-lunch-today.hook.ts`, useReducer, 확정)

```ts
type LunchSpinStateType =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'spinning'; spinId: number; menuId: string; luckLine: string }>
  | Readonly<{ status: 'done'; spinId: number; menuId: string; luckLine: string }>;

type LunchTodayStateType = Readonly<{
  filter: LunchFilterType;          // 기본: categories 6개 전체, broth 'all'
  spin: LunchSpinStateType;
  spinSeq: number;                  // 마지막으로 쓴 spinId
  lastPickedId: string | null;      // 직전 메뉴 (4.3)
}>;

type LunchTodayActionType =
  | { type: 'TOGGLE_CATEGORY'; category: LunchCategoryKeyType }
  | { type: 'SET_BROTH'; broth: LunchBrothFilterType }
  | { type: 'SPIN_START'; spinId: number; menuId: string; luckLine: string }
  | { type: 'SPIN_END'; spinId: number };
```

상태·이벤트 표 (U3, U7 반영, 새 액션 없음)

| 사용자 행동 | 부르는 함수 | 액션 | 조건 | 결과 |
|---|---|---|---|---|
| 카테고리 칩 누름 | `toggleCategory(key)` | `TOGGLE_CATEGORY` | `spinning`이면 무시 | 필터 변경, `spin = idle`, 알림 비움, 버튼 라벨 "룰렛 돌리기" |
| 국물 라디오 바꿈 | `setBroth(value)` | `SET_BROTH` | `spinning`이면 무시 | 같음 |
| "국물 조건 없애기" 누름 (U7) | `setBroth('all')` | `SET_BROTH` | 버튼은 후보 0개일 때만 있음 | 같음 + 뽑기 버튼으로 포커스 이동(5.4) |
| "룰렛 돌리기" / "다시 뽑기" 누름 (같은 버튼) | `spin()` | `SPIN_START` | `spinning`이거나 후보 0개면 무시 | 메뉴·문구 결정, `lastPickedId` 갱신, 결과 카드·알림 사라짐, `aria-busy` |
| 돌림판 멈춤 | `handleSpinEnd(spinId)` | `SPIN_END` | `spinning`이고 `spinId` 같을 때만 | `done`: 알림 문장, 결과 카드, 버튼 라벨 "다시 뽑기" |

- `SPIN_START`: `spin = spinning`, `spinSeq = spinId`, `lastPickedId = menuId`.
- 후보 목록, 후보 수, `targetIndex`, 결과 메뉴 객체, 지도 링크, 버튼 라벨, 버튼 비활성 여부, "국물 조건 없애기" 표시 여부는 상태로 두지 않고 렌더링 중 계산한다(`useMemo`는 선택).
  - `spinButtonLabel = spin.status === 'done' ? '다시 뽑기' : '룰렛 돌리기'` (문구는 `lunch-notice.constant.ts`)
  - `canSpin = candidates.length > 0 && spin.status !== 'spinning'`
  - `showClearBroth = filter.categories.length > 0 && candidates.length === 0`
- 훅은 `{ state, candidates, resultMenu, canSpin, spinButtonLabel, showClearBroth, toggleCategory, setBroth, spin, handleSpinEnd }`를 돌려준다. `spin()` 안에서 4.5의 1~3단계를 한다. 뽑기 버튼 `ref`와 "국물 조건 없애기" 뒤 포커스 이동은 root가 한다.
- 전역 store(zustand), Context, URL 상태(`useSearchParams`, `router.*`, `history.*`), 브라우저 저장소를 쓰지 않는다(AC-21, AC-23).
- `ConsentProvider`, 연령 확인, 운세 동의를 읽지 않는다. 쿠키 동의와 무관하게 동작한다(AC-24).
- 초기 상태가 고정값이라 서버 HTML과 첫 클라이언트 렌더가 같다. 마운트 후에 바뀌는 값이 없다.

### 8.4 입력 요소와 잠금

- 카테고리 칩: shadcn `Button` + `type="button"` + `aria-pressed`. 텍스트 이름은 카테고리 이름(AC-32). 칩 묶음은 `role="group"` + `aria-label="카테고리"`.
- 국물 선택: `<fieldset><legend>` 안의 기본 `<input type="radio">` 3개(전체, 국물 있음, 국물 없음)와 `<label>`. 새 shadcn 컴포넌트(ToggleGroup, RadioGroup)는 Radix 패키지가 늘어나므로 추가하지 않는다. 모양은 UI/UX.
- "국물 조건 없애기": shadcn `Button` `type="button"` `variant="outline"`. 텍스트 이름이 있다(AC-32).
- 회전 중 잠금(AC-7): 뽑기 버튼, 칩, 국물 선택에 `aria-disabled="true"`를 주고 핸들러에서 무시한다. 포커스가 사라지지 않게 회전 중에는 `disabled` 대신 `aria-disabled`를 쓴다. 라디오는 `fieldset disabled`가 포커스를 잃게 하므로 `onChange`에서 무시하고 `aria-disabled`를 준다. "국물 조건 없애기"는 후보 0개일 때만 있고 그때는 돌릴 수 없으므로 회전 중에 존재하지 않는다.
- 후보 0개(카테고리 0개 포함)에는 뽑기 버튼에 기본 `disabled`를 주고 `aria-describedby`로 안내 블록을 가리킨다(AC-5). 이때 포커스는 칩, 라디오, "국물 조건 없애기"에 있으므로 문제가 없다.
- 탭 순서: 칩 6개 → 국물(탭 정지점 하나) → ("국물 조건 없애기", 있을 때) → 뽑기 버튼 → (결과가 있으면) 카카오맵 링크 → 네이버지도 링크.
- 지도 링크는 회전 중에는 결과 카드가 없으므로 잠글 대상이 없다.

### 8.5 예외·빈 상태

| 상황 | 화면 |
|---|---|
| 카테고리 0개 | 버튼 비활성 + 안내 (AC-5) |
| 후보 0개 (국물 조건 때문) | 버튼 비활성 + 조건 변경 안내 + "국물 조건 없애기" (4.2, U7) |
| 후보 1개 | 정상 뽑기. 같은 메뉴가 연속으로 나올 수 있다 |
| 회전 중 조작 | 무시 (AC-7) |
| 조건 변경 | 결과·알림 지움, 버튼 라벨 "룰렛 돌리기" (AC-20) |
| 새로고침 | 모두 초기화 (AC-21) |
| 동작 줄이기 | 회전 없이 결과 (AC-6) |
| JS 꺼짐 | `<noscript>` 안내. 설명·사용 순서·고지·FAQ는 서버 HTML. 서버가 그린 칩·버튼은 보이지만 동작하지 않는다는 점을 안내 문구에 담는다 |
| 지도 링크 새 탭 | 이 페이지의 결과는 그대로 남는다 |
| 지도 사이트 오류·차단 | 외부 사이트 문제라 처리하지 않는다 |

- 전역 `error.tsx`로 넘길 오류 경로가 없다(네트워크 요청 없음).

## 9. 메뉴 등록 변경 지점

| 파일 | 변경 | 시점 | 값 |
|---|---|---|---|
| `src/constants/menu.constant.ts` lunch 항목 | `description`, `example` 정정 | 개발 중 (F-8) | L6 승인: description "룰렛으로 오늘의 점심 메뉴를 무작위로 뽑고 지도에서 찾아보기.", example "예: 한식·분식만 골라 국물 메뉴로 룰렛 돌리기". "가격", "혼밥", "별점", "후기", "조건에 맞게 추천" 금지(AC-39) |
| 같은 파일 lunch 항목 `colorClass` | `text-orange-600` → `text-menu-lunch` | 개발 중 (F-8과 같이) | U6 확정. `design-system.md`는 이미 `menu-lunch`를 정의하고 있어 변경 없음 |
| 같은 파일 lunch 그룹 `comingSoon: true` | 제거 | 출시 작업 (F-11)만 | 15장 체크리스트 완료 후 |
| `src/app/lunch/today/page.tsx` | noindex 해제 | 출시 작업 (F-11) | 10장. `comingSoon`과 같은 PR |
| `src/types/menu.type.ts` | 변경 없음 (`'lunch'` 이미 있음) | | |
| `src/constants/theme.constant.ts` | 변경 없음 (`lunch` 항목 이미 있음, `text-menu-lunch` 사용 중) | | |
| `src/constants/menu-icon.constant.ts` | 변경 없음 (`Utensils` 사용 중) | | |
| `src/app/sitemap.ts` | 변경 없음. `comingSoon`을 풀면 `MENU_LIST`에서 `/lunch/today`가 자동으로 들어간다 | | |

- 헤더 PC·모바일 메뉴와 홈은 `MENU_LIST`를 읽으므로 고치지 않는다. `comingSoon` 해제 후 "준비 중" 배지가 사라지는지만 QA가 본다(AC-36, AC-38).
- 그룹 href와 항목 href가 같은 `/lunch/today`다. sitemap은 `Set`으로 중복을 없앤다(기존 동작).

## 10. SEO

| URL | title (템플릿이 " \| 운빨연구소"를 붙임) | description | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/lunch/today` | 오늘 뭐 먹지 - 점심 메뉴 룰렛 | 룰렛으로 오늘의 점심 메뉴를 무작위로 골라 보는 오락 서비스입니다. 뽑힌 메뉴는 지도 앱에서 바로 검색할 수 있습니다. | BreadcrumbList, FAQPage | 출시 때 `comingSoon` 제거로 자동 등록. 그 전에는 미등록 + noindex |

- 메타데이터: `buildMetadata({ title, description, pathname: '/lunch/today', keywords, ogImage: { alt: '오늘 뭐 먹지 점심 메뉴 룰렛 안내 이미지' } })`. tag는 메뉴 라벨 기본값. 값은 `lunch-seo.constant.ts`.
  - description의 "지도 앱에서"는 실제로는 지도 웹 페이지로 간다. ui-ux-design.md 문구 표에 다듬은 문장이 있으면 그것을 따른다(뜻은 같고 길이만 다르다).
- keywords: 오늘 뭐 먹지, 점심 뭐 먹지, 점심 메뉴 추천, 점심 룰렛, 점심 메뉴 룰렛, 오늘 점심 메뉴, 점심 메뉴 고르기. "주변 음식점 찾기", "점심 식당 찾기"는 넣지 않는다(plan).
- robots
  - 출시 전: `{ ...buildMetadata(...), robots: { index: false, follow: true } }`로 덮어쓴다(AC-36).
  - 출시 후: 덮어쓰기를 지운다(AC-37). `comingSoon` 제거와 같은 PR에서 한다.
  - 참고: 페이지가 `MENU_LIST`의 lunch 그룹 `comingSoon` 값을 읽어 robots를 정하면 스위치가 하나가 된다. 기존 페이지에 이런 방식이 없으므로 이번에는 두 곳을 같이 고치는 방식으로 확정한다. 개발 담당이 임의로 바꾸지 않는다.
- BreadcrumbList: 홈(`/`) > 점심(`/lunch/today`, 그룹 href) > 오늘 뭐 먹지(`/lunch/today`). `jsonLdBreadcrumb`, 첫 항목 `{ name: SITE_NAME, item: canonicalUrl('/') }`.
- FAQPage: `LUNCH_FAQ` 한 배열을 화면과 `jsonLdFaq`가 같이 쓴다. 4~5개. 주제(plan): 무엇을 하는 서비스인지, 메뉴는 어떻게 뽑는지(고른 조건 안에서 같은 확률, 직전 메뉴 제외), 추천인지(아니다), 지도 링크는 어디로 가는지(카카오맵·네이버지도 웹 검색 페이지가 새 탭에서 열림, 메뉴 이름만 전달, 위치를 묻지 않음), 결과가 보장되는지(아니다, 보상 없음). "어떤 메뉴가 들어 있나"는 카테고리 이름과 개수를 답에 넣는다(`LUNCH_CATEGORIES`, `LUNCH_MENUS`에서 개수를 계산해 문장을 만든다).
- Restaurant, LocalBusiness, ItemList, Review 구조화 데이터는 쓰지 않는다(AC-35).
- 서버 HTML: h1, 상시 고지, 설명 문단, 사용 순서 3단계, 무작위·보상 없음 고지, FAQ(AC-34). 소개는 압축하지만 서버 HTML에 그대로 있다(U4). 룰렛 영역도 첫 렌더는 서버에서 HTML로 나오지만 검색 노출 콘텐츠로 기대하지 않는다.
- 이미지: 음식 사진 없음. OG는 기존 `/api/og-image`.
- URL: `/lunch/today` 유지. redirect 없음.
- 루트 레이아웃의 `category: '엔터테인먼트, 도구, 로또'` 상속은 점심 금지 표현과 충돌하지 않으므로 덮어쓰지 않는다.

## 11. 데이터 저장 위치

| 데이터 | 위치 | 이유 |
|---|---|---|
| 메뉴 48개(이름, 카테고리, 국물, 검색어) | 코드 상수 (`lunch-menu.constant.ts`) | 모두에게 같고 자주 안 바뀐다. `data-storage.md` 예시 "점심 메뉴 목록" 그대로 |
| 카테고리, 점심운 문구, 고지, 버튼 라벨, FAQ, SEO 문구, 지도 URL 앞부분 | 코드 상수 | 같은 이유 |
| 금지 표현 목록 | 코드 상수 (검사 전용, 화면 번들 제외) | 같은 이유 |
| 조건 선택(카테고리, 국물) | 메모리(React 상태)만 | 승인 결정: 새로고침하면 사라진다. URL에 넣으면 접속 로그에 남는다(plan) |
| 룰렛 결과, 점심운 문구, 직전 메뉴 id | 메모리만 | 같은 이유(AC-21, AC-23). 지도는 새 탭으로 열리므로 결과를 보존하려고 저장할 필요가 없다 |
| localStorage, sessionStorage, 쿠키, IndexedDB, Supabase | 쓰지 않음 | 개인 데이터와 서버 데이터가 없다 |

## 12. 법적 문서 변경 지점

### 12.1 이용약관 (`src/app/terms/page.tsx`, L3 승인)

현재 장: 1 서비스 개요, 2 연령, 3 데이터 출처, 4 비제휴, 5 저장 데이터, 6 타로, 7 운세, 8 광고 및 쿠키, 9 금지 행위, 10 지식재산권, 11 책임 제한 및 제3자 서비스, 12~17.

- 점심 새 장 "점심 메뉴 룰렛 서비스"를 서비스 장 묶음 끝(7 운세 다음, 꿈 해몽 장이 먼저 들어가면 그 다음)에 넣고 뒤 장 번호를 하나씩 민다.
- 점심 장 내용(문구는 PM 검토): 오락 목적, 결과는 고른 조건 안에서 무작위로 정해지며 추천·평가가 아님, 메뉴 목록은 자체 작성이며 외부 데이터를 쓰지 않음, 식당 정보·영업 여부·검색 결과 보장 없음, 지도 링크는 새 탭에서 카카오·네이버 사이트를 열며 이동 후에는 해당 사이트의 약관과 정책이 적용됨, 결과는 금전·상품·포인트·경품 등 보상과 무관함, 위치를 요청하지 않고 조건·결과를 저장하지 않음(AC-30).
- 책임 제한 및 제3자 서비스 장(현재 11장, 번호가 밀림): 열거에 "지도 검색 링크(카카오맵, 네이버지도)"를 더한다.
- 3장(데이터 출처)은 로또 내용만 있다. 점심 메뉴가 자체 목록이라는 문장은 점심 장에 둔다. 3장은 고치지 않는다.
- 번호를 밀면 `COMPLIANCE.md`의 약관 장 번호 언급(운세 항목의 "Terms (chapter 11)" 등)을 같은 커밋에서 고친다(12.3). 꿈 해몽 약관 변경과의 순서는 19장.

### 12.2 개인정보처리방침 (`src/app/privacy/page.tsx`)

- 수집 항목(1장), 브라우저 저장소(2장), 이용 목적(3장), 법적 근거(4장)는 바꾸지 않는다. 점심 기능이 새로 처리하는 정보가 없다. 현재 방침에 위치 문구가 없다(2026-11-19 확인).
- 6장 "외부 서비스 이용 및 처리위탁": 목록 아래에 한 문단 추가. 의미: "점심 메뉴 룰렛의 지도 검색 링크(카카오맵, 네이버지도)를 누르면 해당 사업자의 사이트가 새 탭에서 열리며, 이동한 사이트에는 해당 사업자의 개인정보처리방침이 적용됩니다. 이때 검색어로 메뉴 이름만 전달됩니다." 지도 서비스는 처리위탁이 아니므로 위탁 목록(`<ul>`) 안에 넣지 않는다(Q12 추천안).

### 12.3 `COMPLIANCE.md` 11장 (PM 처리)

타로·운세와 같은 영어 형식으로 "Lunch (`/lunch/today`)" 항목을 추가한다. 넣을 내용:

- Entertainment notice directly under the h1 (always visible); random-pick and no-reward notice always visible below the roulette area ("룰렛 결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 무관한 오락입니다."); short notice below the result. Wording: `src/features/lunch/constants/lunch-notice.constant.ts`.
- Picks are uniformly random among the selected filters (category, broth), excluding the previous pick when two or more candidates remain. Results are never presented as recommendations. Forbidden phrasing: `src/features/lunch/constants/lunch-copy-rule.constant.ts`, checked by `e2e/lunch-copy.spec.ts`.
- No reward of any kind (cash, goods, points, coupons) is tied to a result.
- External map links: Kakao Map and Naver Map web search URLs, opened in a new tab (`target="_blank"`, `rel="noopener noreferrer nofollow"`), query is the menu name only, no logos, no app deep links, no map API.
- No location permission is requested; `Permissions-Policy: geolocation=()` stays site-wide. Filters and results stay in browser memory only; nothing is stored or sent. No analytics events.
- Menu list and copy are original (authorship log: `docs/lunch/copy-log.md`). No public data is used. Revenue is AdFit display ads only.
- 법률 검토 상태 한 줄: 사용자가 Q11을 정하면 기록한다. 제안 기본값은 운세와 같은 문장 형식 "No legal review has been obtained for the lunch feature; the operator accepts the risk (decided YYYY-MM-DD)." 이고, 대상 항목(위치정보 관련 법령 해당 여부, 사행성 규제 해당 여부, 식품 표시·광고 기준, 지도 링크 정책)을 같이 적는다. 사용자가 "검토 완료"를 고르면 그 날짜와 범위를 적는다.
- 6장(보안 헤더)은 바꾸지 않는다.
- 약관 장 번호가 바뀌므로(L3) 운세 항목의 "Terms (chapter 11)" 같은 장 번호 언급을 같은 커밋에서 고친다.

## 13. 외부 의존성

- 새 npm 라이브러리 없음. 쓰는 것: `framer-motion`(돌림판), `lucide-react`(`ExternalLink`, `Check`), shadcn `Button`(기존), `cn()`.
- 새 shadcn 컴포넌트 없음. 국물 선택은 기본 radio로 만든다(8.4).
- 새 색 토큰 없음. `menu-lunch`, `jar`, `jar-foreground` 등 기존 토큰만 쓴다(ui-ux-design.md).
- 런타임 외부 호출 없음. 지도 서비스는 사용자가 링크를 누를 때 새 탭에서 열리는 페이지 이동뿐이다.
- `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md` 변경 없음.

## 14. 검증 방식 (AC를 어떻게 확인하는가)

타로·꿈 선례대로 Playwright로만 한다. 새 도구, `package.json` 스크립트, 운영 코드의 테스트 전용 경로는 만들지 않는다.

### 14.1 `e2e/lunch-copy.spec.ts` (상수 import, 데스크톱 프로젝트에서만)

| 검사 | AC |
|---|---|
| `LUNCH_MENUS.length === LUNCH_MENU_COUNT === 48`, 카테고리 6개 모두 6개 이상, 모든 메뉴의 카테고리가 `LUNCH_CATEGORIES`에 있음, 이름·id 중복 없음, id 형식 | AC-40 |
| 국물 값이 3.3 표와 같음(경계 메뉴 5개 포함), soup 15개·dry 33개 | L2 |
| `mapQuery`가 있으면 `name`을 포함 | AC-15 |
| `filterLunchMenus`: 카테고리 1개 × 국물 3택 모든 조합에서 결과가 조건을 지킴, 카테고리 0개면 빈 배열, 순서가 `LUNCH_MENUS` 순서, 후보 0개가 되는 조합은 모두 broth가 `'all'`이 아님(4.2, U7 전제) | AC-2, AC-4, AC-5 |
| `pickLunchMenu`: 고정 난수 함수(예: 항상 0, 항상 n-1, 순환)를 넣어 결과가 후보 안에 있음. 직전 메뉴가 후보에 있고 후보 2개 이상이면 절대 나오지 않음(후보 전체 × 모든 난수 값 전수). 후보 1개면 그 메뉴. 후보 0개면 null | AC-2, AC-19 |
| 균등성: 각 후보 인덱스가 정확히 한 난수 값에 대응(전수 대응 검사). 통계 검사는 하지 않는다 | plan "같은 확률" |
| `LUNCH_LUCK_LINES`: 6개 카테고리 모두 정확히 4줄, 합계 24줄, 중복 없음 | AC-9, L4 |
| `buildLunchMapLinks`: 48개 메뉴 모두 호스트가 `map.kakao.com`/`map.naver.com`, 프로토콜 https, 경로의 검색어를 `decodeURIComponent`하면 검색어와 같음, 쿼리 파라미터 없음 | AC-15, AC-16 |
| 보상 없음 고지 상수가 U5 문장과 같음 | AC-29 |
| `MENU_LIST` lunch 항목 `colorClass === 'text-menu-lunch'` | U6 |
| 금지 표현 0건(허용 문장 제거 후): 점심운 문구, 고지, 버튼 라벨, FAQ, SEO 문구, `MENU_LIST` lunch 항목 | AC-10, AC-11, AC-12, AC-39 |
| 정적 소스 검사: `src/features/lunch/**`, `src/app/lunch/**`, `src/components/common/roulette.component.tsx`에 `localStorage`, `sessionStorage`, `document.cookie`, `indexedDB`, `navigator.geolocation`, `fetch(`, `@/lib/http`, `useSearchParams`, `router.push`, `router.replace`, `history.`, `track(`, `Math.random`, `window.open`, `kakaomap://`, `nmap://`가 없음 | AC-16, AC-22, AC-23 |
| 정적 소스 검사: 화면 코드가 `lunch-copy-rule.constant.ts`를 import하지 않음. 공용 `roulette.component.tsx`가 `@/features/`를 import하지 않음 | 7.3, 5.2 |
| `/terms`, `/privacy`, `COMPLIANCE.md`에 점심 항목 의미 문구가 있음(문자열 검사) | AC-30 |

### 14.2 `e2e/lunch.spec.ts` (데스크톱·모바일)

결과 고정 방법 (운영 코드 변경 없음)

- `page.addInitScript`로 페이지 스크립트보다 먼저 `crypto.getRandomValues`를 덮어써 정해진 수열로 배열을 채운다. `src/lib/random.ts`는 1024개 풀을 `getRandomValues`로 채우고 거부 샘플링(`r < threshold`)을 하므로, 모두 0을 넣으면 `secureRandomInt(n)`은 항상 0을 돌려준다. 즉 "후보의 첫 메뉴"가 결정적으로 나온다.
- 이 덮어쓰기는 테스트 브라우저 안에서만 일어난다. 운영 번들에는 테스트 플래그, 쿼리 파라미터, 전역 훅, `NEXT_PUBLIC_` 테스트 변수가 없다.
- 고정이 필요 없는 테스트(AC-2, AC-4)는 실제 난수로 돌리고 "결과가 후보 목록에 있음"으로 본다(plan 원칙).
- 결과 대기: 동작 줄이기 테스트는 `page.emulateMedia({ reducedMotion: 'reduce' })`로 즉시 끝난다. 일반 모션 테스트는 `role="status"` 문장이 채워질 때까지 기다린다. 회전은 1.0초(U1)이므로 제한 시간은 3초 정도로 둔다.
- 뽑기 버튼 찾기: 같은 요소의 이름이 바뀌므로 `getByRole('button', { name: '룰렛 돌리기' })`와 `{ name: '다시 뽑기' }`로 상태를 확인하되, 같은 요소인지 보려면 처음 찾은 locator를 `elementHandle`로 잡아 두거나 돌림판 패널 범위 안의 유일한 버튼으로 찾는다.

새 탭 지도 링크 검증 방법 (AC-13~17, AC-31)

- 외부 사이트에 실제로 접속하지 않는다. 테스트 시작 시 `context.route('https://map.kakao.com/**', …)`, `context.route('https://map.naver.com/**', …)`로 가로채 빈 HTML(200)로 응답한다. `page.route`가 아니라 `context.route`를 쓰는 이유는 새 탭(popup)이 같은 context의 다른 page이기 때문이다. 모바일 리다이렉트를 대비해 `m.map.naver.com/**`, `m.map.kakao.com/**`도 같이 가로챈다.
- 속성 검사: 두 링크의 `target`이 `_blank`이고 `rel`에 `noopener`, `noreferrer`, `nofollow`가 모두 있다. 접근성 이름에 외부 이동 표시가 있다.
- 열림 검사: `const [popup] = await Promise.all([page.waitForEvent('popup'), link.click()]);` 후 `popup.url()`의 호스트가 해당 지도 서비스이고, 경로 검색어를 디코드하면 결과 메뉴 이름이 들어 있으며(AC-15), 쿼리·해시에 메뉴 이름 외 값이 없다(AC-16).
- 원래 탭 유지: popup이 열린 뒤에도 `page.url()`이 `/lunch/today` 그대로이고 결과 카드의 메뉴 이름, 점심운 문구, 돌림판 아래 "다시 뽑기" 버튼이 그대로 보인다.
- `noopener` 동작: popup 안에서 `await popup.evaluate(() => window.opener)`가 `null`이다.
- `noreferrer` 동작: 가로챈 popup 요청의 `request.headers()['referer']`가 없다.
- 키보드: 링크에 `focus()` 후 `keyboard.press('Enter')`로 같은 `popup` 이벤트가 나온다(AC-17, AC-31).
- 모바일 프로젝트에서도 같은 방법으로 popup 이벤트를 확인한다. 실제 기기의 앱 열림·인앱 브라우저 동작은 Playwright로 볼 수 없으므로 출시 전 수동 확인(15장)이다.

| 시나리오 | 방법 | AC |
|---|---|---|
| 로그인 없이 돌리기, 결과 이름이 현재 후보 이름 목록에 있음 | 화면 텍스트와 `LUNCH_MENUS` 대조 | AC-1, AC-2 |
| 기본 칩 6개 모두 `aria-pressed="true"`, 국물 "전체" 선택, 버튼 이름 "룰렛 돌리기" | | AC-3 |
| 카테고리 하나만 켜고 10회 돌리기, 모두 그 카테고리 | 동작 줄이기 켬(속도) | AC-4 |
| 칩 모두 끄면 버튼 `disabled` + 안내, "국물 조건 없애기" 없음 | | AC-5 |
| 양식만 + 국물 있음: 버튼 `disabled` + 조건 안내 + "국물 조건 없애기". 누르면 국물 "전체"가 선택되고, 안내와 버튼이 사라지고, 뽑기 버튼이 활성이며 포커스가 뽑기 버튼에 있음 | `toBeFocused()` | 4.2, U7 |
| 동작 줄이기에서 돌림판 transform이 회전 중간값을 거치지 않음(클릭 직후 최종 각도), 결과가 나옴 | `emulateMedia`, 요소 `transform` 확인 | AC-6 |
| 회전 중 뽑기 버튼·칩·라디오 `aria-disabled="true"`, 눌러도 결과·필터 불변, 결과 1회만, `aria-busy="true"` | 일반 모션 | AC-7 |
| 결과 후 `role="status"`에 메뉴 이름. 포커스가 뽑기 버튼에 그대로 있음 | `toBeFocused()` | AC-8, U3 |
| "오늘의 점심운" 라벨 + 문구, 결과 카드에 가격·별점·칼로리 등 없음, 결과 카드 안에 버튼이 없음 | | AC-9, AC-12, U3 |
| 지도 링크 2개 이름, `href` 호스트·검색어, `target="_blank"`, `rel` 3종, 외부 이동 표시, popup 열림, 원래 탭 결과 유지 | 위 "새 탭 지도 링크 검증 방법" | AC-13~17 |
| 결과 후 같은 버튼의 이름이 "다시 뽑기". 누르면 회전 중 결과 카드가 사라지고, 끝나면 새 결과 카드가 나오고, 이전 결과 문구가 없음 | 같은 요소 확인(위 "뽑기 버튼 찾기") | AC-18, U3 |
| 고정 난수(모두 0)에서 첫 결과 = 후보 첫 메뉴, 다시 뽑기 결과 = 후보 둘째 메뉴(직전 제외 후 첫 메뉴) | `addInitScript` | AC-19 |
| 결과 후 칩 하나를 바꾸면 결과 카드와 알림 문장이 사라지고 버튼 이름이 "룰렛 돌리기"로 돌아감 | | AC-20 |
| 새로고침 후 칩 전체 선택, 국물 전체, 결과 없음, 버튼 "룰렛 돌리기" | | AC-21 |
| 위치 권한 요청 없음: `addInitScript`로 `navigator.geolocation.getCurrentPosition`·`watchPosition` 호출 횟수를 세어 0회. 응답 헤더 `Permissions-Policy`에 `geolocation=()` | 룰렛·링크 클릭 전후, 원래 탭 기준 | AC-22 |
| 돌린 뒤 localStorage·sessionStorage 키 목록이 로드 직후와 같음(동의 키 제외), `document.cookie`에 새 쿠키 없음, `page.url()`이 `/lunch/today` 그대로(쿼리·해시 없음) | | AC-23 |
| 쿠키 동의 거절 상태와 AdFit 요청 차단 상태에서 전체 흐름 동작 | 기존 `declineCookies` 방식 | AC-24 |
| h1 바로 다음 블록이 상시 오락 고지, 무작위 고지·보상 없음 고지(U5 문장)가 결과 전에도 보임, 외부 링크 안내·결과 하단 고지 | | AC-25~29 |
| 키보드만으로 칩 → 국물 → 뽑기 버튼(룰렛 돌리기) → 같은 버튼 Enter(다시 뽑기) → Tab으로 링크(popup) | Tab, Space, Enter, 방향키 | AC-31 |
| 모든 버튼·칩·링크에 접근성 이름 | `getByRole` 이름 | AC-32 |
| `javaScriptEnabled: false` 컨텍스트 또는 `request.get` HTML에 h1, 설명, 사용 순서, FAQ, 고지 | | AC-34 |
| JSON-LD는 BreadcrumbList, FAQPage 두 개뿐, FAQ 화면 텍스트와 JSON-LD 일치 | | AC-35 |
| 출시 전: robots noindex, 메뉴 "준비 중", sitemap에 없음 / 출시 후: noindex 없음, canonical·OG가 `buildMetadata` 결과와 같음, "준비 중" 없음, `/sitemap.xml`에 `/lunch/today` | 출시 상태별 테스트를 `MENU_LIST` lunch 그룹 `comingSoon` 값으로 나눈다(`test.skip`) | AC-36~38 |
| 모바일 프로젝트에서 위 시나리오 반복 | `pnpm e2e:all` | AC-33 |

- 금지 표현의 렌더링 HTML 검사는 `<main>` 안쪽에서 광고 슬롯 요소(`src/features/ad/` 컴포넌트가 그리는 영역)를 뺀 텍스트로 한다. 헤더·푸터·쿠키 배너는 범위 밖이다(꿈 설계 7.2와 같은 해석).

### 14.3 기존 테스트 영향

- `src/app/sitemap.ts`를 고치지 않으므로 `e2e/fortune-v2.spec.ts`의 sitemap diff 검사와 충돌하지 않는다.
- `e2e/tarot-copy.spec.ts`, `fortune-copy.spec.ts`, `fortune-calc.spec.ts`가 `MENU_LIST`를 import한다. lunch 항목 문구·`colorClass` 변경과 `comingSoon` 해제 후 이 세 스펙을 회귀로 한 번 돌린다(마지막 회귀에 포함).
- 약관 장 번호를 밀므로 약관 문자열을 검사하는 기존 스펙(타로·운세·꿈의 약관 검사)이 장 번호까지 보는지 QA가 확인하고, 보면 회귀에서 같이 맞춘다.

## 15. 출시 전 체크리스트

- [ ] Q17 지도 링크(사용자 확인): 카카오맵·네이버지도 웹 검색 URL 형식이 PC Chrome, iOS Safari, Android Chrome, 카카오톡 인앱 브라우저에서 새 탭(또는 해당 브라우저의 새 창 처리)으로 검색 결과를 여는지. 앱이 없을 때 웹으로 열리는지, 앱이 있을 때 동작. 메뉴 이름만으로 사용자 근처가 기준이 되는지(지도 중심 기본값인지), "근처"를 붙이면 달라지는지. 두 서비스의 링크 이용 조건과 상표 표기 규칙
- [ ] Q6 사행성 관련 규제 해당 여부(사용자). Q11 위치정보·14세 미만 관련 판단(사용자). Q20 식품 표시·광고 기준(사용자). `COMPLIANCE.md`에 "위험 수용" 또는 "검토 완료" 기록
- [ ] 점심운 문구 24줄과 고지·FAQ 검수, `docs/lunch/copy-log.md` 갱신
- [ ] 이용약관 점심 장·제3자 서비스 장·장 번호, 개인정보처리방침 6장 한 문단, `COMPLIANCE.md` 11장(장 번호 언급 포함), `README.md` 기능 목록, `REFACTORING.md` 34~37행 정정(PM)
- [ ] `e2e/lunch-copy.spec.ts`, `e2e/lunch.spec.ts` 데스크톱·모바일 통과, `pnpm typecheck`, `pnpm lint`
- [ ] 돌림판 두 톤 칸의 깜박임 기준 재검산(ui-ux-design.md 요청)
- [ ] 수동 스크린 리더 확인(VoiceOver 또는 NVDA 한 번): 결과 알림이 한 번 읽히는지, 버튼 이름이 "다시 뽑기"로 바뀌어 읽히는지, 링크 이름에 새 탭 안내가 읽히는지
- [ ] F-11: `comingSoon` 제거와 noindex 해제를 같은 PR로, `/sitemap.xml`·메타·JSON-LD 확인(AC-37, AC-38)

## 16. 보안

- RLS: 해당 없음(DB 없음).
- 시크릿·환경변수: 새 환경변수 없음. `NEXT_PUBLIC_`로 새로 노출하는 값 없음. 지도 링크에 API 키가 필요 없다. README 환경변수·API·테이블 표 변경 없음.
- 입력 검증: 자유 입력이 없다. 칩과 라디오 값은 타입이 정한 enum 안에서만 바뀐다. 리듀서는 모르는 카테고리 키를 무시한다.
- XSS: 메뉴 이름·문구는 상수이고 React 텍스트로만 그린다. `dangerouslySetInnerHTML`은 기존 `JsonLdComponent`만 쓴다. 지도 URL은 고정 호스트 + `encodeURIComponent`라 `javascript:` 같은 스킴이 들어갈 수 없다.
- 탭 가로채기: `target="_blank"` 링크에 `noopener`(와 `noreferrer`)를 넣어 새 탭이 `window.opener`로 이 페이지를 바꾸지 못하게 한다.
- API 남용: API가 없어 rate limit 대상이 없다. 페이지는 정적으로 CDN에서 나간다.
- 위치: 위치 API를 호출하지 않는다. `Permissions-Policy: geolocation=()`를 그대로 두어 브라우저 수준에서도 막는다.
- 외부 전달: 지도 링크는 메뉴 이름만 담고 `noreferrer`로 Referer를 보내지 않는다.
- 브라우저 저장소: 쓰지 않는다. 민감정보 없음.
- 분석: 사용자 이벤트를 보내지 않는다. Vercel Web Analytics는 페이지 경로만 집계하고, 조건·결과가 URL에 없으므로 수집되지 않는다.
- CSP: 새 외부 스크립트·이미지·연결 출처가 없어 바꾸지 않는다. 외부 링크 이동은 CSP 대상이 아니다.

## 17. 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 메뉴 48개 이름과 분류 | 자체 작성(일반 음식 이름, 프랜차이즈 상표 없음) | 자체. 일반 명칭이라 권리 문제는 낮다고 보나 판단은 법률 확인 필요 | 가능(운영자 판단) |
| 점심운 문구, 고지, FAQ, SEO 문구 | 자체 작성(AI 작성 + 사용자 검수), copy-log로 이력 관리 | 자체 저작. AI 작성물 권리 귀속은 법률 확인 필요 | 가능(타로·운세와 같은 위험 수용 방식, Q11에서 함께 기록) |
| 지도 검색 링크 | 카카오맵, 네이버지도 웹 | 각 서비스 이용약관 | 링크 이동만. API·로고 미사용. 링크 이용 조건 확인 필요(Q17, 출시 전) |
| "카카오맵", "네이버지도" 명칭 | 각 사 상표 | 상표 | 링크 라벨 텍스트로만 사용(식별 목적). 로고 미사용. 표기 규칙 확인 필요(Q17) |
| 돌림판 그림 | 자체 인라인 SVG | 자체 | 가능 |
| 아이콘 | `lucide-react` (기존) | ISC | 가능 |
| 폰트 | Pretendard (기존) | SIL OFL 1.1 | 가능 |
| 공공데이터 | 쓰지 않음 | 해당 없음 | 해당 없음. 출처 표기·공공누리 조건 없음 |
| 새 라이브러리·이미지 | 없음 | 해당 없음 | 고지 문서 변경 없음 |

- 개인정보: 처리하지 않는다. 위치, 식별자, 조건, 결과를 받거나 저장하지 않는다.
- 사행성: 결과와 보상(금전, 상품, 포인트, 쿠폰, 경품)의 연결이 없다. 규제 해당 여부 판단은 "법률 확인 필요"이며 사용자가 결정한다(Q6, 출시 전).
- 수익: AdFit 광고만. 가게 광고, 제휴 링크, 지도 서비스 제휴 없음.

## 18. 담당별 작업 순서

- db: 없음.
- backend: 없음(API, 서버 로직, 환경변수 없음).
- frontend (frontend-dev, 기준 문서는 이 설계서와 `docs/lunch/ui-ux-design.md`)
  - F-1 공용 돌림판: `src/types/roulette.type.ts`, `src/components/common/roulette.component.tsx` (L1, U1 회전, U2 글자 3단계)
  - F-2 뼈대: `lunch.type.ts`, `lunch-category`, `lunch-menu`(3.3 확정 표), `lunch-map`, `lunch-seo`, `lunch-copy-rule` 상수, `lunch-pick.util.ts`, `lunch-map-link.util.ts`
  - F-3 문구 상수: `lunch-luck`(샘플 6줄 → 검수 → 24줄, L4), `lunch-notice`(U5 보상 없음 문구, 버튼 라벨 포함), `lunch-faq`. 최종 문장은 `ui-ux-design.md`를 따른다. `docs/lunch/copy-log.md` 작성(문구 작성자, dev-lead가 담당을 정한다)
  - F-4 화면 상태: `today/hooks/use-lunch-today.hook.ts` (8.3 상태·이벤트 표)
  - F-5 화면: `today/components/*`, `src/app/lunch/today/page.tsx`(noindex 유지, JSON-LD). 버튼 하나(U3), "국물 조건 없애기"와 포커스 이동(U7), 소개 압축(U4)
  - F-6 정책 문서: `src/app/terms/page.tsx`(12.1, 새 장 + 번호 조정), `src/app/privacy/page.tsx`(12.2)
  - F-8 메뉴 문구·색: `menu.constant.ts` lunch 항목 `description`, `example`(L6), `colorClass` → `text-menu-lunch`(U6)
  - F-11 출시 작업: `comingSoon` 제거 + noindex 해제. 15장 체크리스트 완료 후에만
- qa
  - Q-1 `e2e/lunch-copy.spec.ts`(F-2 이후 데이터 검사부터 먼저 쓸 수 있다)
  - Q-2 `e2e/lunch.spec.ts`(F-5 이후)
- PM: `COMPLIANCE.md` 11장(12.3, 약관 장 번호 언급 포함), `README.md` 기능 목록, `REFACTORING.md` 34~37행, `docs/lunch/status.md`
- 의존 순서
  1. F-1, F-2 → F-4 → F-5.
  2. F-3 샘플 → 사용자 검수 → F-3 나머지.
  3. F-6, F-8은 화면 작업과 파일이 겹치지 않아 언제든 할 수 있다. 단 19장 충돌 순서를 따른다. F-6과 PM의 `COMPLIANCE.md` 장 번호 수정은 같은 커밋으로 묶는다.
  4. Q-1은 F-2 이후, Q-2와 AC 전체 통과는 F-3~F-6, F-8 이후.
  5. F-11은 15장 완료 후 마지막.

## 19. 파일 충돌 위험

- `src/constants/menu.constant.ts`: 작업 트리에 "어디 가" 삭제 변경이 스테이징되어 있고, 꿈 해몽(dream) 작업이 같은 파일에 `DREAM` enum과 그룹을 추가한다. 점심은 lunch 항목의 `description`, `example`, `colorClass`(F-8)와 `comingSoon`(F-11)만 고친다. 줄은 다르지만 같은 파일이라, 스테이징된 변경과 dream F3을 먼저 커밋한 뒤 순서대로 고친다(동시 작업 금지).
- `src/types/menu.type.ts`, `src/constants/theme.constant.ts`, `src/constants/menu-icon.constant.ts`, `src/app/globals.css`: 점심은 고치지 않는다(9장, U6은 `menu.constant.ts`만 고친다). dream이 고친다.
- `src/app/sitemap.ts`: 점심은 고치지 않는다. dream이 고친다.
- `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`, `COMPLIANCE.md`: dream F6도 항목을 더한다. 한 번에 한 담당만 고친다. 점심은 약관에 새 장을 넣고 번호를 민다(L3). dream이 약관에 장을 넣는다면 dream을 먼저 반영하고, 점심이 그 뒤에 들어가 번호를 다시 맞추며 `COMPLIANCE.md`의 장 번호 언급을 같은 커밋에서 고친다. 가능하면 두 기능의 약관 변경을 한 담당이 이어서 처리한다.
- `README.md`, `REFACTORING.md`, `docs/TODO.md`: 작업 트리에 미커밋 변경이 있다. PM이 한 번에 고친다.
- `src/components/common/roulette.component.tsx`, `src/types/roulette.type.ts`: 공용 위치라 후속 "운빨 뽑기 도구"와 겹친다. 이번에는 frontend 한 명만 만든다. 후속에서 props나 글자 3단계 규칙을 바꾸면 점심 화면 회귀를 돌린다.
- `src/features/lunch/types/lunch.type.ts`, `constants/lunch-menu.constant.ts`: F-2가 만든다. 메뉴·국물 값 변경은 사용자 승인을 거친다.
- `src/features/lunch/constants/lunch-luck.constant.ts`, `lunch-notice.constant.ts`, `lunch-faq.constant.ts`, `docs/lunch/copy-log.md`: 문구 작성자와 frontend가 만나는 곳. F-3에서 한 번에 확정 문구로 쓴다.
- `next.config.ts`: 고치지 않는다(`Permissions-Policy` 유지).
- `docs/conventions/design-system.md`: 변경 없음(U6은 기존 토큰 사용).

## 20. 결정 완료 항목 (2026-11-19 사용자 승인)

| 번호 | 주제 | 결정 |
|---|---|---|
| Q5 변경 | 지도 링크 열기 방식 | 같은 탭 안을 버리고 새 탭으로 연다. `target="_blank"`, `rel="noopener noreferrer nofollow"`. plan AC-14와 일치(6.2, 14.2) |
| L1 | 돌림판 위치 | 공용 `src/components/common/roulette.component.tsx` + `src/types/roulette.type.ts`. 결과는 부모가 정하고 컴포넌트는 연출만(5장) |
| L2 | 국물 경계 메뉴 | 냉면 국물, 백반 비국물, 누룽지탕 국물, 소바 비국물, 어묵 국물(3.3) |
| L3 | 약관 점심 조항 | 새 장을 넣고 뒤 장 번호를 조정한다. `COMPLIANCE.md` 장 번호 언급을 같이 고친다(12.1) |
| L4 | 점심운 문구 | 카테고리별 4줄, 24줄. 메뉴·국물을 언급하지 않는다(3.4) |
| L5 | 뒤로 가기 시 결과 | 해당 없음. 새 탭으로 열리므로 이 페이지의 결과가 남는다(6.3) |
| L6 | 메뉴 탭 설명·예시 | 9장 초안 승인 |
| U1~U7 | UI/UX 결정 | 1.3 표 |

남은 열린 질문은 없다. 출시 전 확인 항목은 15장이다.

이 밖에 설계에서 정한 것(바꾸려면 알려 주시기 바랍니다): 직전 메뉴 제외는 조건 변경 뒤에도 적용한다(4.3). 보상 없음 고지는 결과 전에도 보이는 서버 블록에 둔다(7.2). 지도 링크에 `nofollow`를 더한다(6.2). 검색어에 "근처"를 붙이지 않는다(6.1). "국물 조건 없애기"를 누르면 포커스를 뽑기 버튼으로 옮긴다(5.4). 회전 중 버튼 라벨은 "룰렛 돌리기"다(4.3 라벨 규칙).
