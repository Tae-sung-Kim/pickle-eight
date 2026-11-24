# menu-meals 설계서

입력: `docs/menu-meals/plan.md`(전체), `docs/research/menu-meals.md`(결론, 6장, 9장)
참고: `docs/lunch/design.md`(기존 점심 설계), `src/features/lunch/` 현재 코드, `e2e/lunch.spec.ts`, `unit/lunch/`
규칙 문서: `docs/conventions/tech-stack.md`, `code-style.md`, `data-storage.md`, `seo.md`
작성일: 2026-11-23
상태: 설계 초안. 사용자 승인 전. 코드는 고치지 않았다.
보완: 2026-11-23 저녁 야식 카테고리 추가(3.7, 1.2 D13·D14, 문서 끝 "plan.md 수정 필요"). D14는 사용자가 B(야식 칩 기본 꺼짐)로 정했다. (야식 카테고리 반영)

## 0. 요약

- 공개 중인 점심 룰렛(`/lunch/today`)을 끼니 3개(점심, 저녁, 아침·브런치) 룰렛으로 넓힌다. 새 주소는 `/meal`, 메뉴 그룹 이름은 "메뉴 룰렛", h1은 "오늘 뭐 먹지"다.
- 한 화면에서 끼니를 하나 고른다. 끼니 값은 React 상태(useReducer)에만 두고 URL, 브라우저 저장소, 쿠키에 넣지 않는다.
- 메뉴 데이터는 끼니별 배열 3개로 나눈다. 점심 48개는 그대로 두고, 저녁은 점심 목록에서 안주 연상 메뉴를 빼고 보충 메뉴를 더하며, 아침·브런치는 전용 카테고리와 목록을 새로 만든다.
- 저녁에만 7번째 카테고리 "야식"(키 `lateNight`)을 둔다. 점심과 아침·브런치는 6개 그대로다. 저녁의 안주 연상 메뉴는 빼지 않고 일부를 야식 카테고리로 옮긴다. 위 줄의 "저녁은 안주 연상 메뉴를 빼고"는 이 결정으로 바뀌었다. 야식 칩은 기본 꺼짐이라 저녁의 기본 후보는 야식을 뺀 6개 카테고리 메뉴다. 자세한 내용은 3.7. (야식 카테고리 반영)
- 옛 주소 `/lunch/today`는 `next.config.ts`의 `redirects()`에서 `statusCode: 301`로 `/meal`에 영구 이동한다. 사이트맵은 `MENU_LIST`에서 자동으로 `/meal`을 넣고, `sitemap.ts`에 옛 주소 제외 목록을 둔다.
- 기능 폴더는 `src/features/lunch/`를 `src/features/meal/`로 옮기는 안을 추천한다(1장 D1). 이름만 옮기는 단계를 먼저 따로 두어 위험을 줄인다.
- API, DB, 새 라이브러리, 새 환경변수는 없다.

## 1. 확정 결정과 PM 선택 요청

### 1.1 사용자 확정 (plan 열린 질문 답, 2026-11-23)

| 항목 | 결정 |
|---|---|
| M1 끼니 | 점심, 저녁, 아침·브런치. 술안주·야식은 하지 않는다 |
| M1 보완 (2026-11-23) | 끼니는 셋 그대로다. 저녁에만 카테고리 "야식"(`lateNight`)을 더한다. 야식은 끼니가 아니라 저녁 안의 카테고리다. "술", "안주", "해장"은 키·라벨·문구 어디에도 쓰지 않는다. 안주 연상 메뉴는 빼지 않는다. 야식 칩은 저녁에서 기본 꺼짐이고, 사용자가 켰을 때만 야식 메뉴가 후보에 들어간다(D14 B) (야식 카테고리 반영) |
| M2 선택 방식 | 한 화면 단일 선택. 끼니별 페이지는 후속 |
| M3·M4 주소·이름 | 새 주소 `/meal`, 그룹 이름 "메뉴 룰렛", 제목(h1) "오늘 뭐 먹지" |
| M13 응답 코드 | `/lunch/today` → `/meal`을 `statusCode: 301`로. 기존 `permanent: true`(308)는 이 항목에 쓰지 않는다 |
| 사이트맵 | `sitemap.ts`에서 옛 주소를 빼고 새 주소를 넣는다. 검색 색인 이동은 배포 후 사용자 작업(M16) |
| M12 안정화 | 점심은 이미 공개 중. "안정화 후 진행" 전제는 무시한다 |
| M11 지도 링크 | 카카오맵, 네이버지도, 구글 지도 3개 모두 승인. 약관·방침은 이미 3개 기준 |
| 검색량 조회 | 건너뛴다. 주소는 나중에 바꿀 수 있다 |

### 1.2 PM 선택 요청 (대안과 추천)

| ID | 질문 | 대안 | 추천 |
|---|---|---|---|
| D1 | 기능 폴더 이름 | A. `features/lunch/` 유지 / B. `features/meal/`로 이동 | B (2장) |
| D2 | 메뉴 그룹 키와 색 토큰 | A. 키 `meal`, 토큰 `menu-meal`(같은 색 값 `#a5481f`) / B. 키 `lunch`, 토큰 `menu-lunch` 유지하고 주소·이름만 변경 | A. 단 `docs/conventions/design-system.md` 색 표 한 줄 변경이라 사용자 승인 필요. 승인이 없으면 B |
| D3 | 아침·브런치 카테고리 체계 (M8) | A. 세 끼니 모두 같은 6개(한식·중식·일식·양식·분식·세계) / B. 점심·저녁은 같은 6개, 아침·브런치만 전용 6개 | B (3.3) |
| D4 | 저녁 제외·보충 목록 (M6, M7) | 3.4 초안 그대로 / 사용자 수정 | 3.4 초안. 순대국·설렁탕은 유지하고 문구에서만 "해장"을 막는 안 |
| D5 | 사이트맵 옛 주소 처리 | A. `MENU_LIST`만 바꾸고 `sitemap.ts`는 그대로(자동으로 빠짐) / B. A에 더해 `sitemap.ts`에 옛 주소 제외 목록을 둔다 | B. 사용자 지시("sitemap.ts에서 옛 주소를 뺀다")와 맞고, 나중에 메뉴를 되돌려도 옛 주소가 다시 들어가지 않는다 |
| D6 | `/lunch` 그룹 주소 (M15) | A. 지금처럼 404 / B. `/lunch` → `/meal` 301 추가 | B. 비용이 한 줄이고 체인이 없다 |
| D7 | 기본 끼니 (M10) | A. 항상 점심 / B. 기기 시각으로 제안 | A. 서버 HTML과 첫 렌더가 같아 hydration 문제가 없다. B는 마운트 뒤 값이 바뀌어 화면이 깜빡이고, 기본값이 틀리면 불만이 생긴다 |
| D8 | 운세 라벨과 문구 수 (M9) | 라벨 "오늘의 점심운 / 저녁운 / 아침운", 끼니마다 카테고리당 4줄(총 72줄, 새로 쓸 줄 48줄). 저녁·아침에서 카테고리 2개씩 샘플 검수 뒤 나머지 작성 | 이 안 |
| D9 | 키워드 "점심 메뉴 추천" (M5) | A. 기존 키워드 유지, "저녁 메뉴 추천" 같은 새 "추천" 키워드는 넣지 않음 / B. "점심 메뉴 추천"도 뺀다 | A. 이전 승인(Q13)을 지키고, 고지와 충돌하는 표현을 늘리지 않는다 |
| D10 | 건강 금지어 "든든한"의 범위 | A. 부분 일치 `든든` / B. plan 문자 그대로 `든든한` | A. 기존 점심운 한 줄("든든하게 하루 중간을 채우는…")이 B를 피해 가므로 A로 막고 그 줄을 새 문장으로 바꾼다 |
| D11 | 출시 전 noindex (plan AC-30 뒷문장) | 적용하지 않는다 | 이 안. 공개 중인 페이지를 옮기는 작업이라 `/meal`과 301이 같은 배포에 함께 나가야 한다. `/meal`을 noindex로 내보내면 301로 넘어간 검색 자산이 끊긴다. 미리보기 배포는 Vercel이 검색 제외 헤더를 붙인다(배포 설정에서 확인 필요) |
| D12 | 시행일과 법률 검토 상태 (M17) | 약관·방침 시행일을 배포일로 바꾸고, COMPLIANCE.md는 "위험 수용"에 새 항목을 더한다 | 이 안. 시행일 변경 시 이전 약관 고지가 필요한지는 법률 확인 필요 |
| D13 | 금지어 "야식"과 카테고리 라벨 "야식"의 충돌 (야식 카테고리 반영) | A. `야식`을 `MEAL_FORBIDDEN_TERMS`에 남기고, 카테고리 라벨 자리(칩, 결과 카드의 카테고리 표시, 결과 알림의 괄호 안)만 검사 예외로 둔다 / B. `야식`을 금지어 목록에서 뺀다 | A. 운세·FAQ·소개·고지·SEO·메뉴 그룹 설명에 "야식"이 새어 들어가는 것을 계속 막는다. 단점은 검사 예외 규칙이 하나 늘어나는 것이다. B는 단순하지만 화면 전체에서 "야식" 검사가 사라진다 (3.7.7) |
| D14 | 저녁의 야식 칩 기본 상태 (야식 카테고리 반영) | 확정(사용자, 2026-11-23): B. 야식 칩은 기본 꺼짐이다. 저녁의 기본 선택은 야식을 뺀 6개다. 끼니를 바꿀 때 야식을 켜는 규칙은 두지 않는다 | 확정. `ui-ux-design.md` 288행의 "모두 켠 채 저녁으로 바꾸면 야식도 켜짐" 제안은 이 결정으로 폐기한다 (3.7.5) |

나머지 열린 질문: M14(옛 주소 유지 기간)는 영구 유지로 설계한다. M16(배포 후 검색 등록), M19(저녁과 음주 시간대 판단)는 사용자 작업이며 설계에 코드 항목이 없다.

## 2. 폴더 구조

### 2.1 D1 비교: `features/lunch` 유지 vs `features/meal` 이동

| 항목 | A. 유지 | B. 이동 (추천) |
|---|---|---|
| 이동 비용 | 없음 | 파일 23개 이동, 이름 변경(F-1: 파일·컴포넌트·훅 `LunchToday*` → `MealRoulette*`, `useLunchToday` → `useMealRoulette` / F-2a: 상수·타입 `LUNCH_*` → `MEAL_*`, `Lunch*Type` → `Meal*Type`), 테스트 import 변경 (ARC-1 반영) |
| 이번 작업에서 어차피 고칠 파일 | 타입, 메뉴, 카테고리, 운세, 고지, FAQ, SEO, 문구 규칙, 뽑기 유틸, 훅, root, 필터, 결과 (23개 중 약 15개) | 같음. 남는 8개(고지 표시 컴포넌트, 지도 유틸 등)만 순수 이동 비용 |
| 이름 혼동 | 저녁·아침 데이터가 `lunch-menu`, `LUNCH_MENUS` 안에 들어간다. 이후 모든 작업자가 혼동한다 | 없음 |
| 테스트 | `unit/lunch/` 고정값을 어차피 다시 쓴다 | 같음. 폴더 이름만 `unit/meal/`로 바뀐다 |
| 위험 | 없음 | 큰 diff. 아래 "이름 이동 단계 분리"로 줄인다 |

추천은 B다. 이번에 대부분 파일의 내용을 바꾸므로 이동만의 추가 비용이 작고, 이름이 끼니 확장과 맞지 않는 상태를 계속 남기는 비용이 더 크다.

이름 이동 단계 분리: 첫 작업(F-1)은 파일 이동과 아래 표의 F-1 이름 변경만 하고 동작과 주소(`/lunch/today`)는 그대로 둔다. 바로 다음 QA(Q-1)가 테스트 import와 F-1에서 바뀐 이름만 따라 고친 뒤 기존 테스트를 그대로 돌린다. 이 상태에서 통과하면 이후 단계는 내용 변경만 남는다.

이름 변경 순서 (확정, ARC-1 반영)

| 단계 | 바꾸는 이름 | 그대로 두는 이름 |
|---|---|---|
| F-1 | 폴더·파일 이름(2.2 최종 이름), 컴포넌트 이름(`LunchToday*Component` → `MealRoulette*Component`)과 그 props 타입, 훅 이름(`useLunchToday` → `useMealRoulette`)과 훅 파일 안의 상태·액션 타입 | 상수(`LUNCH_*`), `meal.type.ts`의 타입(`Lunch*Type`), 상수 파일 안 함수(`getLunchResultAnnouncement`), 유틸 함수(`filterLunchMenus`, `buildLunchMapLinks` 등) |
| F-2a | 상수 `LUNCH_*` → 3.2·4장·5장의 `MEAL_*` 이름, 타입 `Lunch*Type` → 3.1의 `Meal*Type`, 상수 파일 안 함수(`getLunchResultAnnouncement` → `getMealResultAnnouncement`), 지도 유틸 함수(`getLunchMapQuery` → `getMealMapQuery`, `buildLunchMapLinks` → `buildMealMapLinks`). 이 기호를 쓰는 `src/` 안의 import와 참조를 같은 티켓에서 함께 고친다 | `meal-pick.util.ts`의 함수 |
| F-3 | `meal-pick.util.ts`의 함수를 3.6의 이름과 시그니처로 바꾼다(`filterLunchMenus` → `filterMealMenus`, `pickLunchMenu` → `pickMealMenu`, `pickLunchLuckLine` → `pickMealLuckLine`) | - |

- 규칙 한 줄: F-1은 파일·컴포넌트·훅 이름만, 상수·타입 기호는 F-2a, 뽑기 유틸 함수는 F-3에서 바꾼다.
- F-1 직후에는 `meal-menu-lunch.constant.ts` 안에 `LUNCH_MENUS`가 있는 것처럼 파일 이름과 기호 이름이 잠시 다르다. 의도된 중간 상태다.
- F-2a 뒤에는 `unit/meal/`, `e2e/meal.spec.ts`의 상수·타입 import가 깨진다. 테스트는 qa 담당이라 Q-2에서 따라 고치며, 그 전까지 `pnpm typecheck` 실패는 예상된 상태다.

D1에서 A를 고르면 F-1, Q-1을 생략하고, 아래 파일 이름의 `meal-`을 `lunch-`로, 기호의 `MEAL_`을 `LUNCH_`로 읽는다. 새 파일(끼니 상수, 끼니별 메뉴 파일, 끼니 선택 컴포넌트)은 A에서도 같은 구조로 `features/lunch/` 안에 만든다.

### 2.2 최종 구조 (D1 B 기준)

```
src/app/meal/page.tsx                       # 신규 (서버). MealPage. 기존 src/app/lunch/today/page.tsx 내용을 옮기고 고친다
src/app/lunch/                              # 삭제 (today/page.tsx). 옛 주소는 next.config.ts 301이 처리
src/app/sitemap.ts                          # 수정 (D5): 옛 주소 제외 목록
src/app/terms/page.tsx                      # 수정: 1장 문단, 9장, 13장 문장, 시행일
src/app/privacy/page.tsx                    # 수정: 6장 지도 링크 문단, 시행일
next.config.ts                              # 수정 (PM): redirects()에 301 항목
src/constants/menu.constant.ts              # 수정: 그룹 키·이름·주소·설명
src/constants/theme.constant.ts             # 수정 (D2 A): 섹션 키 lunch → meal, 색 클래스
src/types/menu.type.ts                      # 수정 (D2 A): MenuSectionKeyType 'lunch' → 'meal'
src/app/globals.css                         # 수정 (D2 A): --menu-lunch → --menu-meal (값 그대로)
src/components/common/roulette.component.tsx # 수정 (D2 A): menu-lunch 클래스 3곳 → menu-meal

src/features/meal/                          # features/lunch/에서 이동
  types/
    meal.type.ts                            # lunch.type.ts 이동 + 끼니 타입 (3.1)
  constants/
    meal.constant.ts                        # 신규: MEAL_LIST(끼니 3개), MEAL_DEFAULT_KEY
    meal-category.constant.ts               # lunch-category 이동 + 아침 카테고리, 끼니별 카테고리 묶음
    meal-menu-lunch.constant.ts             # lunch-menu 이동. 점심 48개 데이터 그대로
    meal-menu-dinner.constant.ts            # 신규: 저녁 메뉴
    meal-menu-breakfast.constant.ts         # 신규: 아침·브런치 메뉴
    meal-menu.constant.ts                   # 신규: MEAL_MENUS(끼니별 묶음), MEAL_MENU_COUNTS
    meal-luck.constant.ts                   # lunch-luck 이동 + 끼니별 구조 (4장)
    meal-map.constant.ts                    # lunch-map 이동. 내용 그대로
    meal-notice.constant.ts                 # lunch-notice 이동 + 끼니 문구
    meal-faq.constant.ts                    # lunch-faq 이동 + 끼니 질문
    meal-seo.constant.ts                    # lunch-seo 이동 + 새 주소, 이름, 키워드
    meal-copy-rule.constant.ts              # lunch-copy-rule 이동 + 음주·건강 금지어, 저녁 제외 메뉴 (5장)
  utils/
    meal-pick.util.ts                       # lunch-pick 이동 + 끼니 인자, 카테고리 넘기기 (3.6)
    meal-map-link.util.ts                   # lunch-map-link 이동. 내용 그대로
  roulette/                                 # today/에서 이름 변경 (화면 이름이 주소 /meal과 맞도록)
    components/
      root.component.tsx                    # 'use client'. MealRouletteComponent
      meal-picker.component.tsx             # 신규: 끼니 선택 (MealRouletteMealPickerComponent)
      filter-panel.component.tsx            # 카테고리 목록을 props로 받는다
      spin-panel.component.tsx              # 이동
      status.component.tsx                  # 이동
      result.component.tsx                  # 운세 라벨을 props로 받는다
      map-links.component.tsx               # 이동
      disclaimer-notice.component.tsx       # 이동 (서버)
      intro.component.tsx                   # 이동 (서버). 끼니 설명 포함
      random-notice.component.tsx           # 이동 (서버)
      faq.component.tsx                     # 이동 (서버)
      noscript-notice.component.tsx         # 이동 (서버)
    hooks/
      use-meal-roulette.hook.ts             # use-lunch-today 이동 + SET_MEAL (6.3)

docs/menu-meals/copy-log.md                 # 신규: 저녁·아침 메뉴, 운세, 고지, FAQ 작성·검수 이력 (docs/lunch/copy-log.md 형식)

e2e/meal.spec.ts                            # e2e/lunch.spec.ts 이동 + 수정 (11장)
unit/meal/meal-menu.test.ts                 # unit/lunch/lunch-menu.test.ts 이동 + 수정
unit/meal/meal-copy.test.ts                 # unit/lunch/lunch-copy.test.ts 이동 + 수정
unit/meal/meal-notice.test.ts               # unit/lunch/lunch-notice.test.ts 이동 (import만)
unit/meal/meal-pick.test.ts                 # 신규: 카테고리 넘기기, 끼니별 뽑기
```

- 이름 규칙: root `MealRouletteComponent`, 하위 `MealRoulette<이름>Component`(예: `MealRouletteFilterPanelComponent`), 훅 `useMealRoulette`, 페이지 `MealPage`(default export), 상수 `MEAL_*`, 타입 `Meal*Type`.
- `features/meal/`은 다른 기능을 import하지 않는다. 화면이 하나라 `shared/`, `services/`, `queries/`는 만들지 않는다.
- `src/features/api-docs/utils/merge-openapi.util.ts`의 `lunch-menu` 언급은 예시 주석이라 고치지 않는다.
- `docs/lunch/`는 과거 기록으로 두고 고치지 않는다.
- 야식 카테고리는 새 파일을 만들지 않는다. 바뀌는 파일은 3.7.11 표에 있다. (야식 카테고리 반영)

## 3. 타입과 메뉴 데이터

### 3.1 타입 (`src/features/meal/types/meal.type.ts`, 확정)

```ts
export type MealKeyType = 'lunch' | 'dinner' | 'breakfast';

export type MealType = Readonly<{
  key: MealKeyType;
  /** 화면 이름: '점심' | '저녁' | '아침·브런치' */
  label: string;
  /** 운세 라벨: '오늘의 점심운' | '오늘의 저녁운' | '오늘의 아침운' (D8) */
  luckLabel: string;
}>;

/** 점심·저녁 공통 카테고리 (기존 6개) */
export type MealStandardCategoryKeyType =
  | 'korean' | 'chinese' | 'japanese' | 'western' | 'bunsik' | 'world';

/** 아침·브런치 카테고리 (D3 B) */
export type MealBreakfastCategoryKeyType =
  | 'korean' | 'porridge' | 'bread' | 'sandwich' | 'brunch' | 'quick';

export type MealCategoryKeyType =
  | MealStandardCategoryKeyType
  | MealBreakfastCategoryKeyType;

/** 끼니 → 그 끼니의 카테고리 키 (타입 전용) */
export type MealCategoryKeyByMealType = {
  lunch: MealStandardCategoryKeyType;
  dinner: MealStandardCategoryKeyType;
  breakfast: MealBreakfastCategoryKeyType;
};

export type MealCategoryType<K extends MealCategoryKeyType = MealCategoryKeyType> =
  Readonly<{ key: K; label: string }>;

export type MealBrothType = 'soup' | 'dry';
export type MealBrothFilterType = 'all' | MealBrothType;

export type MealMenuType<K extends MealCategoryKeyType = MealCategoryKeyType> =
  Readonly<{
    /** 끼니 안에서 유일. 소문자 영문·하이픈. React key와 직전 메뉴 비교에만 쓴다 */
    id: string;
    /** 일반 음식 이름만 */
    name: string;
    category: K;
    broth: MealBrothType;
    /** 지도 검색어. 없으면 name. 넣을 때는 name을 그대로 포함 */
    mapQuery?: string;
  }>;

export type MealFilterType = Readonly<{
  categories: readonly MealCategoryKeyType[];
  broth: MealBrothFilterType;
}>;

// 지도·FAQ 타입은 이름만 바꾼다
export type MealMapProviderKeyType = 'kakao' | 'naver' | 'google';
export type MealMapLinkType = Readonly<{ provider: MealMapProviderKeyType; label: string; href: string }>;
export type MealFaqItemType = Readonly<{ question: string; answer: string }>;
```

- D3에서 A(같은 6개)를 고르면 `MealBreakfastCategoryKeyType`을 지우고 `breakfast: MealStandardCategoryKeyType`으로 둔다. 나머지 구조는 같다.
- `id`는 끼니 안에서만 유일하면 된다. 끼니 사이에 같은 메뉴(예: 점심과 저녁의 `kimchi-jjigae`)가 같은 `id`를 써도 된다. 끼니를 바꾸면 직전 메뉴 기록을 지우므로(6.3) 섞이지 않는다.
- 저녁 카테고리 타입(`MealDinnerCategoryKeyType`)과 `MealCategoryKeyType`, `MealCategoryKeyByMealType.dinner` 변경은 3.7.1이 이 절의 코드보다 우선한다. (야식 카테고리 반영)

### 3.2 데이터 구조 결정 (확정)

plan "데이터 구조 원칙"의 두 방법을 비교했다.

| 방법 | 장점 | 단점 |
|---|---|---|
| 끼니별 배열 따로 (채택) | 끼니마다 카테고리가 달라도 된다(김밥이 점심은 분식, 아침은 간편식). 끼니별 검수와 diff가 쉽다. 배열 순서가 곧 돌림판 칸 순서다 | 같은 메뉴를 두 번 적는다 |
| 공통 목록 + 끼니 표시 | 중복이 없다 | 끼니마다 카테고리가 다르면 표현할 수 없다. 끼니별 칸 순서를 따로 정하기 어렵다 |

상수 (확정)

```ts
// meal.constant.ts
export const MEAL_LIST = [
  { key: 'lunch', label: '점심', luckLabel: '오늘의 점심운' },
  { key: 'dinner', label: '저녁', luckLabel: '오늘의 저녁운' },
  { key: 'breakfast', label: '아침·브런치', luckLabel: '오늘의 아침운' },
] as const satisfies readonly MealType[];           // 배열 순서가 선택지 순서
export const MEAL_DEFAULT_KEY: MealKeyType = 'lunch'; // D7

// meal-category.constant.ts
export const MEAL_STANDARD_CATEGORIES = [...];       // 기존 LUNCH_CATEGORIES 6개 그대로
export const MEAL_BREAKFAST_CATEGORIES = [...];      // 3.5
export const MEAL_CATEGORIES: {
  readonly [K in MealKeyType]: readonly MealCategoryType<MealCategoryKeyByMealType[K]>[];
} = { lunch: MEAL_STANDARD_CATEGORIES, dinner: MEAL_STANDARD_CATEGORIES, breakfast: MEAL_BREAKFAST_CATEGORIES };

// meal-menu.constant.ts
export const MEAL_MENUS: {
  readonly [K in MealKeyType]: readonly MealMenuType<MealCategoryKeyByMealType[K]>[];
} = { lunch: MEAL_LUNCH_MENUS, dinner: MEAL_DINNER_MENUS, breakfast: MEAL_BREAKFAST_MENUS };
export const MEAL_MENU_COUNTS = { lunch: 48, dinner: <확정 수>, breakfast: <확정 수> } as const;
```

- 끼니별 메뉴 파일은 카테고리 순서대로 적고 카테고리마다 주석 한 줄로 나눈다(기존 방식). 선언은 `as const satisfies readonly MealMenuType<...>[]`.
- 화면 코드는 `MEAL_MENUS[meal]`, `MEAL_CATEGORIES[meal]`만 쓴다. 끼니별 파일을 직접 import하지 않는다(테스트는 예외).
- 이 절의 상수 이름은 F-2a에서 적용한다(2.1 "이름 변경 순서"). F-1은 상수 이름을 바꾸지 않으므로 F-1 직후에는 옛 이름이 새 파일 안에 남는다. F-2a의 대응: `LUNCH_CATEGORIES` → `MEAL_STANDARD_CATEGORIES`, `LUNCH_MENUS` → `MEAL_LUNCH_MENUS`, `LUNCH_MENU_COUNT` → `MEAL_MENU_COUNTS.lunch`(단일 상수는 지우고 `MEAL_MENU_COUNTS`로 합친다). (ARC-1 반영)
- `MEAL_CATEGORIES.dinner`는 새 상수 `MEAL_DINNER_CATEGORIES`(7개)를 가리키고, `MEAL_MENU_COUNTS.dinner`는 92다. 끼니별 기본 선택 카테고리 `MEAL_DEFAULT_CATEGORIES`를 새로 둔다(3.7.2, 3.7.3). (야식 카테고리 반영)

### 3.3 데이터 규칙 (확정, AC-9)

- 끼니마다 카테고리 6개, 카테고리마다 6개 이상, 끼니 합계 40~60개.
- 끼니 안에서 이름과 `id` 중복 없음. `id` 형식 `^[a-z]+(-[a-z]+)*$`, 40자 이하(기존 검사 유지).
- 이름에는 설명, 사진, 가격, 칼로리, 상표를 넣지 않는다. "카페", "브런치 카페"처럼 가게를 떠올리게 하는 말을 넣지 않는다.
- 국물 기준은 기존과 같다: 주 요리가 국물에 담겨 나오고 국물을 떠먹으면 `soup`, 그 밖은 `dry`. 아침의 경계는 3.5 표에 적는다.
- 음주 관련 단어가 이름에 없어야 한다(5장 금지어). 저녁·아침에는 안주 연상 메뉴 목록(5.2)의 이름이 없어야 한다.
- 위 첫째·다섯째 줄은 3.7.4가 덮어쓴다: 카테고리는 점심 6, 저녁 7, 아침 6개. 저녁 합계는 92개로 40~60 범위의 예외다. 안주 연상 메뉴 목록 검사는 아침에만 한다. (야식 카테고리 반영)

D3 비교 (아침 카테고리)

| 대안 | 장점 | 단점 |
|---|---|---|
| A. 같은 6개 | 끼니를 바꿔도 카테고리 선택이 그대로 남는다. 타입이 하나다 | 아침 중식·일식·세계를 6개씩 채우려면 억지 메뉴가 들어간다(아침 중식 6개 등). 검수 부담이 크고 화면이 어색하다 |
| B. 아침만 전용 6개 (추천) | 아침 메뉴가 자연스럽게 나뉜다. 점심·저녁은 그대로 | 점심·저녁 ↔ 아침을 바꾸면 카테고리 선택이 전체로 돌아간다(3.6 규칙) |

### 3.4 저녁 메뉴 (초안, 사용자 검수 D4)

이 절은 처음 초안의 기록이다. 현재 저녁 목록과 개수는 3.7.3을 따른다. (야식 카테고리 반영)

점심 48개에서 시작해 안주 연상 7개(탕수육, 깐풍기, 마라샹궈, 가라아게, 튀김, 어묵, 치킨)를 뺀다. 그러면 중식 5개, 분식 4개로 6개 기준에 못 미친다.

해결안 비교

| 안 | 내용 | 판단 |
|---|---|---|
| 1. 보충 메뉴 추가 (추천) | 중식과 분식에 식사 성격 메뉴를 더한다 | AC-9 그대로 지킨다 |
| 2. 카테고리 합치기 | 저녁만 분식을 한식에 합치는 등 | 끼니마다 6개 규칙(AC-9)과 필터 일관성이 깨진다 |
| 3. 저녁만 기준 5개 | 기준 완화 | AC-9 위반 |

초안 (★ 보충, ☆ 유지 여부 사용자 판단)

| 카테고리 | 메뉴 (국물) | 수 |
|---|---|---|
| 한식 | 김치찌개(s), 된장찌개(s), 순대국☆(s), 설렁탕☆(s), 칼국수(s), 냉면(s), 비빔밥(d), 제육볶음(d), 불고기(d), 백반(d), ★갈비찜 `galbi-jjim`(d), ★김치찜 `kimchi-jjim`(d), ★생선구이 `saengseon-gui`(d) | 13 (☆ 빼면 11) |
| 중식 | 짬뽕(s), 마라탕(s), 누룽지탕(s), 짜장면(d), 볶음밥(d), ★울면 `ulmyeon`(s), ★잡채밥 `japchae-bap`(d), ★마파두부밥 `mapa-dubu-bap`(d) | 8 |
| 일식 | 라멘(s), 우동(s), 돈카츠(d), 초밥(d), 규동(d), 소바(d), 카레라이스(d) | 7 |
| 양식 | 파스타, 스테이크, 리조또, 피자, 오므라이스, 샌드위치, 햄버거, 그라탕 (모두 d) | 8 |
| 분식 | 떡볶이(d), 김밥(d), 라볶이(d), 쫄면(d), ★라면 `ramyeon`(s), ★잔치국수 `janchi-guksu`(s), ★만두 `mandu`(d), ★주먹밥 `jumeokbap`(d) | 8 |
| 세계·기타 | 쌀국수(s), 샤브샤브(s), 똠얌꿍(s), 팟타이(d), 타코(d), 케밥(d), 쌈밥(d) | 7 |
| 합계 | 국물 17, 건조 34 | 51 (☆ 빼면 49) |

- 순대국·설렁탕은 일반 식사 메뉴로 유지하고, 문구·FAQ에서 "해장"을 금지어로 막는 안을 추천한다. 빼도 한식은 11개로 기준 안이다.
- 넣지 않는 메뉴(안주 연상): 족발, 보쌈, 곱창, 막창, 닭발, 삼겹살, 골뱅이, 오돌뼈, 파전, 부대찌개. 5.2의 검사 목록에 넣는다. 삼겹살·부대찌개는 판단이 갈릴 수 있어 사용자 확인 대상이다.
- 기존 점심 메뉴의 `id`와 국물 값은 저녁에서도 같게 쓴다.

### 3.5 아침·브런치 메뉴 (초안, 사용자 검수 D3·D4)

카테고리 (D3 B, 배열 순서가 칩 순서)

| key | label |
|---|---|
| `korean` | 한식 |
| `porridge` | 죽·수프 |
| `bread` | 빵·토스트 |
| `sandwich` | 샌드위치 |
| `brunch` | 브런치 요리 |
| `quick` | 간편식 |

메뉴 초안

| 카테고리 | 메뉴 (국물) | 수 |
|---|---|---|
| 한식 | 미역국 `miyeokguk`(s), 소고기뭇국 `sogogi-mutguk`(s), 계란국 `gyeran-guk`(s), 된장찌개 `doenjang-jjigae`(s), 순두부찌개 `sundubu-jjigae`(s), 계란말이 `gyeran-mari`(d), 김치볶음밥 `kimchi-bokkeumbap`(d), 비빔밥 `bibimbap`(d) | 8 |
| 죽·수프 | 전복죽 `jeonbok-juk`(d), 호박죽 `hobak-juk`(d), 야채죽 `yachae-juk`(d), 팥죽 `pat-juk`(d), 양송이수프 `mushroom-soup`(s), 감자수프 `potato-soup`(s) | 6 |
| 빵·토스트 | 토스트 `toast`, 프렌치토스트 `french-toast`, 베이글 `bagel`, 크루아상 `croissant`, 와플 `waffle`, 팬케이크 `pancake`, 스콘 `scone` (모두 d) | 7 |
| 샌드위치 | 햄치즈 샌드위치 `ham-cheese-sandwich`, 에그 샌드위치 `egg-sandwich`, 파니니 `panini`, 잉글리시 머핀 `english-muffin`, 부리토 `burrito`, 핫도그 `hot-dog` (모두 d) | 6 |
| 브런치 요리 | 오믈렛 `omelette`, 에그 베네딕트 `eggs-benedict`, 스크램블드에그 `scrambled-eggs`, 샥슈카 `shakshuka`, 프리타타 `frittata`, 키시 `quiche`, 해시브라운 `hash-brown` (모두 d) | 7 |
| 간편식 | 김밥 `gimbap`, 주먹밥 `jumeokbap`, 유부초밥 `yubu-chobap`, 컵밥 `cup-bap`, 시리얼 `cereal`, 떡 `tteok`, 군고구마 `goguma` (모두 d) | 7 |
| 합계 | 국물 7, 건조 34 | 41 |

국물 경계 (사용자 확인)
- 죽은 `dry`로 둔다. 국물에 담겨 나오는 요리가 아니라는 기존 기준을 따른다. 수프는 떠먹는 국물이라 `soup`.
- 해장 연상이 강한 콩나물국밥, 북엇국, 황태해장국은 아침에 넣지 않는다.
- "건강", "든든" 같은 말로 메뉴를 설명하지 않는다. 메뉴 이름에 "샐러드", "그래놀라"처럼 건강식으로 읽히는 이름은 이번 초안에서 뺐다.
- D3 A를 고르면 이 표를 버리고 같은 6개 카테고리로 다시 쓴다.

### 3.6 뽑기 로직 (`meal-pick.util.ts`, 확정)

```ts
/** 필터에 맞는 메뉴를 menus 순서 그대로. 카테고리와 국물은 AND (기존과 같음) */
export function filterMealMenus(menus: readonly MealMenuType[], filter: MealFilterType): readonly MealMenuType[];

/** 같은 확률로 하나. 후보가 비면 null. previousId가 후보에 있고 후보가 2개 이상이면 제외 (기존과 같음) */
export function pickMealMenu(candidates: readonly MealMenuType[], previousId: string | null, randomInt?: RandomIntFnType): MealMenuType | null;

/** 끼니와 카테고리의 운세 문구 중 하나를 같은 확률로 */
export function pickMealLuckLine(meal: MealKeyType, category: MealCategoryKeyType, randomInt?: RandomIntFnType): string;

/**
 * 끼니를 바꿀 때 카테고리 선택을 넘긴다.
 * 새 끼니에 있는 카테고리 중 지금 선택된 것만 새 끼니의 칩 순서로 남긴다.
 * 하나도 남지 않으면 새 끼니의 카테고리 전체를 선택한다.
 */
export function carryOverMealCategories(selected: readonly MealCategoryKeyType[], nextMeal: MealKeyType): readonly MealCategoryKeyType[];
```

- 난수는 기존 `secureRandomInt`(`src/lib/random`)를 쓴다.
- `carryOverMealCategories` 결과: 점심 ↔ 저녁은 같은 키라 선택이 그대로 남는다(plan "조건 유지"). 점심·저녁 → 아침은 `korean`만 겹친다. 선택이 모두 새 끼니에 있을 때만(예: 한식만) 그대로 남고, 하나라도 없으면(점심 6개 전체, 한식+중식 등) 새 끼니의 기본 선택이 된다(2026-11-23 코드 리뷰 반영: 후보가 조용히 한식으로 줄던 문제). 카테고리 0개 상태에서 끼니를 바꾸면 전체 선택이 된다.
- 국물 조건은 끼니를 바꿔도 그대로 둔다.
- `pickMealLuckLine`은 해당 끼니에 그 카테고리 문구가 없으면 빈 문자열을 돌려준다. 단위 테스트가 모든 끼니·카테고리에 4줄이 있음을 보장하므로 화면에서는 생기지 않는다.
- 저녁에 야식 카테고리가 생겨 점심 ↔ 저녁도 키가 완전히 같지 않다. 위 주석과 결과 설명의 "전체 선택"은 "새 끼니의 기본 선택(`MEAL_DEFAULT_CATEGORIES`)"으로 읽는다. 저녁의 기본 선택은 야식을 뺀 6개다. 시그니처는 그대로이며, 바뀐 동작은 3.7.5가 이 절보다 우선한다. (야식 카테고리 반영)

### 3.7 저녁 야식 카테고리 (야식 카테고리 반영)

사용자 결정 (2026-11-23)

- 끼니는 점심, 저녁, 아침·브런치 셋 그대로다.
- 저녁에만 7번째 카테고리를 둔다. 키 `lateNight`, 라벨 "야식". 점심과 아침·브런치는 6개 그대로다.
- "술", "안주", "해장"은 키, 라벨, 문구 어디에도 쓰지 않는다.
- 안주 연상 메뉴를 빼지 않는다. 지금 저녁 목록에 있는 안주 연상 메뉴 중 14개를 야식으로 옮기고, 6개는 원래 카테고리에 둔다. 새 야식 메뉴 12개를 더한다. 메뉴는 이름만 쓰고 설명하지 않는다.
- 야식 칩은 기본 꺼짐이다(D14 B). 저녁을 고르면 야식을 뺀 6개 카테고리만 켜져 있고, 야식 메뉴는 사용자가 야식 칩을 켰을 때만 후보에 들어간다.
- 야식 칩은 단독 선택이다(사용자 결정 B, 2026-11-23). 야식을 켜면 다른 칩이 모두 꺼지고, 다른 칩을 켜면 야식이 꺼진다. 순수 함수 `toggleMealCategory`(`meal-pick.util.ts`)가 처리하고 `carryOverMealCategories`는 그대로다. 야식 전용 메뉴 14개를 더해 저녁은 106개, 야식은 40개다. 전용 메뉴는 다른 카테고리와 이름이 같을 수 있고(id에 `-late`), 이름은 같은 카테고리 안에서만 유일하다. 단독 선택이라 룰렛에 같은 이름이 두 번 나오지 않는다.

#### 3.7.1 타입 변경 (`meal.type.ts`, 확정)

```ts
/** 점심 카테고리 6개. 저녁은 이 6개에 야식을 더한다 */
export type MealStandardCategoryKeyType =
  | 'korean' | 'chinese' | 'japanese' | 'western' | 'bunsik' | 'world';

/** 저녁 카테고리 7개 = 점심 6개 + 야식 */
export type MealDinnerCategoryKeyType =
  | MealStandardCategoryKeyType
  | 'lateNight'; // 야식

/** 아침·브런치 카테고리 (변경 없음) */
export type MealBreakfastCategoryKeyType =
  | 'korean' | 'porridge' | 'bread' | 'sandwich' | 'brunch' | 'quick';

export type MealCategoryKeyType =
  | MealStandardCategoryKeyType
  | MealDinnerCategoryKeyType
  | MealBreakfastCategoryKeyType;

export type MealCategoryKeyByMealType = {
  lunch: MealStandardCategoryKeyType;
  dinner: MealDinnerCategoryKeyType;   // 변경
  breakfast: MealBreakfastCategoryKeyType;
};
```

- 분리 방식: 점심 타입(`MealStandardCategoryKeyType`)은 그대로 두고, 저녁 전용 유니온을 새로 만든다. 그러면 `MEAL_CATEGORIES.dinner`, `MEAL_MENUS.dinner`, `MEAL_LUCK_LINES.dinner`가 타입으로 7개 키를 요구하고, 점심 데이터나 점심 운세에 `lateNight`이 들어가면 타입 오류가 난다.
- 쓰지 않는 방식: `lateNight`을 `MealStandardCategoryKeyType`에 넣고 점심에서만 빼는 방식. 점심 운세 `Record`가 7개 키를 요구하게 되어 점심 구조가 깨진다.
- 키 이름 `lateNight`: 카테고리 키는 React key와 상태 값으로만 쓰이고 화면, URL, DOM id에 나오지 않는다. 기존 키는 소문자 한 단어지만 카멜 표기를 허용한다. `^[a-z]+(-[a-z]+)*$` 형식 규칙은 메뉴 `id`에만 적용하고 카테고리 키에는 적용하지 않는다.
- `MealFilterType`, `MealMenuType`의 기본 제네릭은 `MealCategoryKeyType`을 따르므로 따로 고치지 않는다.
- 기본 꺼짐 여부는 타입 필드(`MealCategoryType`에 플래그)로 두지 않고 3.7.2의 상수로 둔다. 칩 목록과 기본 선택 목록을 따로 두면 화면 코드가 플래그를 해석할 필요가 없다.

#### 3.7.2 카테고리 목록과 기본 선택 (`meal-category.constant.ts`, 확정)

```ts
/** 점심 카테고리 6개. 저녁 앞 6개도 같은 순서다 */
export const MEAL_STANDARD_CATEGORIES = [ /* 기존 6개 그대로 */ ]
  as const satisfies readonly MealCategoryType<MealStandardCategoryKeyType>[];

/** 저녁 카테고리 7개. 배열 순서가 칩 순서다 */
export const MEAL_DINNER_CATEGORIES = [
  ...MEAL_STANDARD_CATEGORIES,
  { key: 'lateNight', label: '야식' },
] as const satisfies readonly MealCategoryType<MealDinnerCategoryKeyType>[];

/** 끼니별 칩 목록. 화면 코드는 이 값만 쓴다 */
export const MEAL_CATEGORIES = {
  lunch: MEAL_STANDARD_CATEGORIES,
  dinner: MEAL_DINNER_CATEGORIES,       // 변경
  breakfast: MEAL_BREAKFAST_CATEGORIES,
}; // 타입 선언은 3.2와 같다

/**
 * 끼니별 기본 선택 카테고리 (신규). 끼니의 첫 상태와 "전체 선택"으로 돌아갈 때 쓴다.
 * 저녁은 야식을 뺀 6개다(야식 칩 기본 꺼짐, D14 B).
 */
export const MEAL_DEFAULT_CATEGORIES: {
  readonly [K in MealKeyType]: readonly MealCategoryType<MealCategoryKeyByMealType[K]>[];
} = {
  lunch: MEAL_STANDARD_CATEGORIES,
  dinner: MEAL_STANDARD_CATEGORIES,
  breakfast: MEAL_BREAKFAST_CATEGORIES,
};
```

- 야식은 맨 끝(7번째 칩)이다. 앞 6개 칩의 순서와 라벨은 점심과 같다.
- "전체 선택"의 정의: 이 문서에서 끼니 전환이나 첫 상태의 "전체 선택"은 `MEAL_DEFAULT_CATEGORIES[meal]`의 키 전부를 뜻한다. 점심·아침은 칩 6개 전부, 저녁은 야식을 뺀 6개다. 사용자가 저녁에서 야식 칩까지 켜면 7개가 모두 켜지지만, 이것은 사용자가 고른 상태일 뿐 기본값이 아니다.
- 훅의 첫 상태(`INITIAL_STATE.filter.categories`)도 `MEAL_DEFAULT_CATEGORIES[MEAL_DEFAULT_KEY]`에서 만든다. 기본 끼니가 점심이라 값은 지금과 같다.
- 화면 코드는 칩 목록으로 `MEAL_CATEGORIES[meal]`을 쓴다. 필터 패널은 이미 `categoryOptions` props로 받으므로 고치지 않는다.

#### 3.7.3 저녁 메뉴 (`meal-menu-dinner.constant.ts`, 확정 목록)

지금 코드(80개: 한식 30, 중식 11, 일식 10, 양식 8, 분식 10, 세계·기타 11)에서 아래처럼 바꾼다.

| 카테고리 | 수 | 국물 soup/dry | 바뀌는 내용 |
|---|---|---|---|
| 한식 | 18 | 10/8 | 12개를 야식으로 옮긴다: 족발, 보쌈, 곱창, 막창, 닭발, 삼겹살구이, 골뱅이무침, 오돌뼈, 파전, 닭갈비, 찜닭, 쭈꾸미볶음. 부대찌개는 한식에 둔다 |
| 중식 | 11 | 4/7 | 변경 없음. 탕수육, 깐풍기, 마라샹궈는 중식에 둔다 |
| 일식 | 10 | 2/8 | 변경 없음. 가라아게는 일식에 둔다 |
| 양식 | 8 | 0/8 | 변경 없음 |
| 분식 | 9 | 3/6 | 튀김을 야식으로 옮긴다. 어묵은 분식에 둔다 |
| 세계·기타 | 10 | 3/7 | 치킨을 야식으로 옮긴다 |
| 야식 | 26 | 1/25 | 옮긴 14개 + 새 메뉴 12개 |
| 합계 | 92 | 23/69 | 기본 선택(야식 제외 6개)의 후보는 66개, 국물 22/44 |

- 남는 한식 18개: 김치찌개, 된장찌개, 순대국, 설렁탕, 칼국수, 냉면, 비빔밥, 제육볶음, 불고기, 백반, 쌈밥, 곰탕, 육개장, 삼계탕, 갈비찜, 김치찜, 생선구이, 부대찌개.
- 옮기는 14개는 `id`와 국물 값을 그대로 쓰고 `category`만 `lateNight`으로 바꾼다. 모두 `dry`다.
- 야식 배열 순서(돌림판 칸 순서): 옮긴 메뉴를 원래 순서대로(족발, 보쌈, 곱창, 막창, 닭발, 삼겹살구이, 골뱅이무침, 오돌뼈, 파전, 닭갈비, 찜닭, 쭈꾸미볶음, 튀김, 치킨) 적고, 그 뒤에 새 메뉴를 아래 표 순서로 적는다. 야식 묶음은 파일 맨 끝, 세계·기타 다음이다.

새 야식 메뉴 12개 (이름만 쓰고 설명하지 않는다)

| 이름 | `id` | 국물 |
|---|---|---|
| 양념치킨 | `yangnyeom-chicken` | dry |
| 후라이드치킨 | `fried-chicken` | dry |
| 닭강정 | `dakgangjeong` | dry |
| 감자탕 | `gamjatang` | soup |
| 순대볶음 | `sundae-bokkeum` | dry |
| 닭똥집볶음 | `dakttongjip-bokkeum` | dry |
| 오징어볶음 | `ojingeo-bokkeum` | dry |
| 감자튀김 | `french-fries` | dry |
| 먹태구이 | `meoktae-gui` | dry |
| 두부김치 | `dubu-kimchi` | dry |
| 닭꼬치 | `dak-kkochi` | dry |
| 김치전 | `kimchi-jeon` | dry |

- 앞 10개는 사용자 후보 그대로다. 남은 2개(닭꼬치, 김치전)는 설계에서 골랐다. 사용자 검수에서 바꿀 수 있고, 바꾸면 이 표와 3.7.10 고정값을 함께 고친다.
- 저녁 안에서 이름과 `id`가 겹치지 않는다. `id`는 모두 형식 규칙과 40자 이하를 지킨다. 이름에 금지어(5.1)와 `술` 패턴이 없다.
- "치킨", "양념치킨", "후라이드치킨"은 이름이 달라 중복 규칙에 걸리지 않는다. 비슷한 칸이 세 개라 사용자가 "치킨"을 빼고 싶으면 야식 25개, 합계 91개로 고정값을 바꾼다(사용자 검수 항목).
- `mapQuery`는 넣지 않는다. 지도 검색어는 이름 그대로다.
- 파일 머리 주석의 "80개", 카테고리별 수, "야식 수요로 이전에 뺐던 메뉴 20개를 복원했다"를 92개와 7개 카테고리 수로 바꾼다. 선언은 `as const satisfies readonly MealMenuType<MealDinnerCategoryKeyType>[]`로 바꾼다.
- `meal-menu.constant.ts`의 `MEAL_MENU_COUNTS.dinner`를 80에서 92로 바꾼다. 92는 저녁 목록 전체 수이며, 화면의 기본 후보 수(66)와 다르다.

#### 3.7.4 데이터 규칙 변경 (3.3 덮어쓰기, 확정)

| 규칙 | 점심 | 저녁 | 아침·브런치 |
|---|---|---|---|
| 카테고리 수 (칩) | 6 | 7 | 6 |
| 기본 선택 카테고리 수 | 6 | 6 (야식 제외) | 6 |
| 카테고리마다 최소 개수 | 6 | 6 (야식 26 포함 모든 카테고리 기준 안) | 6 |
| 끼니 합계 | 40~60 | 92 고정 (40~60 범위의 예외) | 40~60 |
| 안주 연상 메뉴 목록 검사 (`MEAL_ALCOHOL_ASSOCIATED_MENU_NAMES`) | 대상 아님 | 대상 아님 | 대상 |
| 이름·`id` 중복, `id` 형식, 금지어 | 기존 검사 | 기존 검사 | 기존 검사 |

- "카테고리 6개" 검사는 끼니별 기대값 `{ lunch: 6, dinner: 7, breakfast: 6 }`으로 바꾼다. "최소 6개" 규칙은 모든 끼니의 모든 카테고리에 그대로 적용한다.
- 저녁 합계는 범위가 아니라 `MEAL_MENU_COUNTS.dinner === 92`와 카테고리별 고정값으로 검사한다.
- `MEAL_ALCOHOL_ASSOCIATED_MENU_NAMES` 17개 목록은 그대로 둔다. 주석은 "아침·브런치 목록에 넣지 않는 메뉴 이름. 점심·저녁은 검사 대상이 아니다"로 바꾼다. 새 야식 메뉴 이름을 이 목록에 더하지 않는다.

#### 3.7.5 `carryOverMealCategories` 동작 (D14 B 확정)

시그니처는 3.6 그대로(`selected`, `nextMeal` 두 인자)다. 규칙은 하나만 바꾼다: 남는 키가 없을 때 돌아가는 값을 칩 전체가 아니라 기본 선택으로 한다.

```ts
/**
 * 끼니를 바꿀 때 카테고리 선택을 넘긴다.
 * 1. 새 끼니의 칩(MEAL_CATEGORIES[nextMeal]) 중 지금 선택된 것만 칩 순서로 남긴다.
 * 2. 하나도 남지 않으면 새 끼니의 기본 선택(MEAL_DEFAULT_CATEGORIES[nextMeal])을 쓴다.
 *    저녁의 기본 선택은 야식을 뺀 6개다.
 */
export function carryOverMealCategories(
  selected: readonly MealCategoryKeyType[],
  nextMeal: MealKeyType
): readonly MealCategoryKeyType[];
```

- 끼니를 바꿀 때 야식을 켜는 규칙은 두지 않는다. 야식은 사용자가 저녁에서 칩을 눌렀을 때만 켜진다.
- 훅 `SET_MEAL`의 호출(`carryOverMealCategories(state.filter.categories, action.meal)`)은 바뀌지 않는다.
- 지금 코드는 2번에서 `MEAL_CATEGORIES[nextMeal]` 전체를 돌려준다. 저녁으로 갈 때 남는 키가 없으면 야식까지 7개가 켜지므로 이 한 곳을 `MEAL_DEFAULT_CATEGORIES[nextMeal]`로 바꾼다.

결과

| 이전 끼니와 선택 | 새 끼니 | 결과 |
|---|---|---|
| 점심 6개 전체 (기본) | 저녁 | 앞 6개 켜짐, 야식 꺼짐 |
| 점심 한식·세계·기타 | 저녁 | 한식, 세계·기타. 야식 꺼짐 |
| 저녁 7개 모두 켬 | 점심 | 점심 6개 (야식은 사라진다) |
| 저녁 앞 6개 (기본) | 점심 | 점심 6개 |
| 저녁 한식·야식 | 점심 | 한식 |
| 저녁 야식만 | 점심 | 겹치는 것이 없어 점심 기본 선택 6개 |
| 저녁 야식만 | 아침·브런치 | 겹치는 것이 없어 아침 기본 선택 6개 |
| 저녁 한식·야식 | 아침·브런치 | 한식 |
| 아침 죽·수프만 | 저녁 | 겹치는 것이 없어 저녁 기본 선택(야식 제외 6개) |
| 아침 한식 포함 | 저녁 | 한식. 야식 꺼짐 |
| 점심 6개 전체 | 아침·브런치 | 아침 기본 선택 전체 (2026-11-23 변경, 전에는 한식만) |
| 카테고리 0개 | 어느 끼니든 | 새 끼니의 기본 선택. 저녁이면 야식 제외 6개 |

- 국물 조건은 끼니를 바꿔도 그대로다.
- `ui-ux-design.md` 288행의 확인 요청("모두 켠 채 저녁으로 바꾸면 야식도 켜짐")은 이 결정으로 폐기한다. 같은 줄의 "저녁에서 야식만 켜 둔 채 점심이나 아침으로 가면 전체 선택"은 위 표와 같다(점심·아침의 기본 선택이 곧 칩 전체다). `ui-ux-design.md` 135행·178행의 "없으면 전체 선택"은 저녁의 경우 "야식 제외 6개"로 읽는다. 이 문서 반영은 ui-ux-designer가 한다.

#### 3.7.6 운세 구조 (`meal-luck.constant.ts`, 확정)

```ts
dinner: {
  korean: [...4줄], chinese: [...], japanese: [...], western: [...], bunsik: [...], world: [...],
  lateNight: [...4줄],   // 추가
},
```

- 저녁은 7개 카테고리 × 4줄 = 28줄, 전체는 24 + 28 + 24 = 76줄이다. 타입(3.7.1)이 `lateNight` 키를 요구하므로 빠뜨리면 타입 오류가 난다.
- 끼니 안 중복 금지: 야식 4줄은 저녁 28줄 안에서 같은 문장이 없어야 하고, 메뉴·카테고리 이름을 가린 뒤에도 같거나 한 단어만 다른 문장이 없어야 한다(기존 검사를 28줄로 넓힌다).
- 기존 규칙 그대로: 합니다체, 한 문장, 가벼운 가능성 표현. 메뉴 이름, 국물, 맛 언급 없음. 다른 끼니 이름(점심, 아침, 브런치) 없음.
- 금지: `술` 패턴, 안주, 한잔, 소주, 맥주, 해장, 숙취, 음주(5.1 목록), 그리고 "야식"이라는 말 자체(D13 A 기준). 금지어 목록에는 없지만 작성과 검수에서 "건배", "회식", "2차", "취하다"처럼 음주 자리를 떠올리게 하는 말도 쓰지 않는다. 이 말을 금지어 목록에 더할지는 PM이 정한다(더하지 않아도 이번 설계는 성립한다).
- 라벨은 저녁 그대로 "오늘의 저녁운"이다. 야식 전용 라벨을 만들지 않는다.
- 초안 4줄 (사용자 검수 뒤 확정, 이력은 `docs/menu-meals/copy-log.md`)
  1. 오늘은 하루를 다 보낸 뒤 느긋하게 쉬어 가는 밤이 어울릴 수 있습니다.
  2. 오늘은 늦은 시간에도 편한 차림으로 마음을 풀어 보면 어떨까요.
  3. 오늘은 가까운 사람과 소소한 이야기를 나누는 밤이 될 수 있습니다.
  4. 오늘은 하루의 끝자락에서 작은 즐거움을 찾아보는 날일 수 있습니다.
- 파일 머리 주석의 "카테고리당 4줄, 끼니당 24줄"을 "카테고리당 4줄. 점심·아침 24줄, 저녁 28줄"로 바꾼다.

#### 3.7.7 문구와 금지어 영향 ("카테고리 6개" 가정이 깨지는 곳 포함)

| 위치 | 지금 | 조치 |
|---|---|---|
| `meal-copy-rule.constant.ts` `MEAL_FORBIDDEN_TERMS`의 `야식` | 금지어 | D13 A: 그대로 둔다. 검사 전용 상수 `MEAL_ALLOWED_CATEGORY_LABELS: readonly string[] = ['야식']`를 같은 파일에 추가한다. 검사 코드는 카테고리 라벨 검사에서 이 값을 건너뛰고, 결과 알림과 결과 영역 텍스트에서는 이 라벨을 먼저 지운 뒤 금지어를 찾는다. D13 B: `야식`을 목록에서 지우고 예외 상수를 만들지 않는다 |
| `meal-copy-rule.constant.ts` 제외 목록 주석 | "점심·저녁 목록은 검사 대상이 아니다(저녁은 야식 수요로 복원…)" | 3.7.4 문장으로 바꾼다 |
| `meal-category.constant.ts` 주석 | "점심·저녁 카테고리 6개", "하나도 남지 않으면 전체" 취지 | "점심 카테고리 6개" + 저녁 상수 주석 + `MEAL_DEFAULT_CATEGORIES` 주석 |
| `meal-pick.util.ts` `carryOverMealCategories` 주석 | "새 끼니의 카테고리 전체를 선택한다" | "새 끼니의 기본 선택" (3.7.5) |
| `meal.type.ts` 주석 | "점심·저녁 공통 카테고리" | 3.7.1 주석 |
| `meal-menu-dinner.constant.ts` 머리 주석 | 80개, 6개 카테고리 수 | 3.7.3 |
| `meal-luck.constant.ts` 머리 주석 | 끼니당 24줄 | 3.7.6 |
| `meal-menu.constant.ts` | `dinner: 80` | 92 |
| 후보 수 문장 `MEAL_CANDIDATE_COUNT_TEMPLATE` ("후보 메뉴 {n}개") | 끼니 메뉴 수와 같다고 가정하기 쉽다 | 문구는 그대로. 값은 늘 `filterMealMenus` 결과 수다. 저녁 기본 상태는 66, 야식까지 켜면 92 |
| 결과 알림 `getMealResultAnnouncement` | "뽑힌 메뉴는 {메뉴}({카테고리})입니다." | 함수 그대로. 야식 메뉴가 뽑히면 "(야식)"이 들어간다. D13 A면 검사 예외 대상 |
| 결과 카드 카테고리 표시, 카테고리 칩 | 카테고리 라벨 | 같음. D13 A면 검사 예외 대상 |
| 고지 5문장, 소개(`MEAL_INTRO_TEXT`), 사용 순서(`MEAL_STEPS`), noscript 안내, 빈 상태 안내, FAQ 7개 | 카테고리 수를 말하지 않는다 | 변경 없음. "야식"을 새로 넣지 않는다 |
| SEO title, description, 키워드, OG alt, BreadcrumbList | 카테고리 수를 말하지 않는다 | 변경 없음. "야식" 키워드를 넣지 않는다(plan 키워드 후보에 없음) |
| 메뉴 그룹 설명·예시 (`menu.constant.ts`) | "점심·저녁·아침", "저녁에 한식·분식만…" | 변경 없음. "야식"을 넣지 않는다 |
| 약관 9장, 방침 6장 | 끼니와 "카테고리"만 말한다 | 변경 없음 |
| COMPLIANCE.md 145~146행 | late-night snack이 없다는 취지의 문장 | 3.7.9 (PM) |
| `ui-ux-design.md` 124·139·150·154·178·288·310행 | 칩 6개, "없으면 전체 선택", 저녁 후보 약 51, 야식 자동 켜짐 제안 | ui-ux-designer가 3.7.2·3.7.5·3.7.8 기준으로 고친다. 288행 제안은 폐기 |
| 이 문서 1.1 M1, 5.1, 5.2, 8.3, 상업적 이용 "음주" 줄 | "야식 없음", "저녁에서 안주 연상 메뉴 제외" | 이 절과 D13 기준으로 읽는다. 각 줄 끝에 표시를 달았다 |

#### 3.7.8 화면 영향

- 칩: 저녁의 카테고리 칩이 7개가 된다. 저녁을 고른 직후에는 앞 6개가 켜지고 "야식" 칩만 꺼져 있다. 칩 줄바꿈과 320px 배치(가로 스크롤 없음, AC-26)는 ui-ux-design.md에서 확인한다. 끼니 선택 칸 3개는 바뀌지 않는다.
- 접근성: 칩의 켜짐·꺼짐은 기존과 같이 `<button aria-pressed>`로 알린다. 야식 칩도 같은 컴포넌트, 같은 마크업이며 기본 상태에서 `aria-pressed="false"`다. 야식 전용 안내 문장, `aria-describedby`, 새 알림 영역은 두지 않는다. 끼니 변경 알림 문장(6.3 "{끼니} 메뉴로 바꿨어요.")도 그대로다.
- 후보 수 표시: "후보 메뉴 {n}개"는 기존처럼 `filterMealMenus(MEAL_MENUS[meal], filter).length`다. 저녁 기본 상태는 66개, 야식을 켜면 92개, 국물 있음이면 기본 22개, 야식까지 켜면 23개다.
- 돌림판 칸: 저녁 기본 상태는 66칸, 야식까지 켜면 92칸이다. 칸 표시 방식의 가독성은 ui-ux-design.md에서 확인한다.
- 빈 상태: 규칙은 기존과 같다(후보 0개면 버튼 비활성, 안내, "국물 조건 없애기"). 야식을 켜고 앞 6개를 모두 끈 뒤 "국물 있음"이면 후보는 감자탕 1개라 빈 상태가 아니다. 후보가 1개라 직전 메뉴 제외 규칙은 적용되지 않는다(3.6 기존 규칙). **카테고리를 모두 끄면(사용자 결정, 2026-11-23) "선택 없음 = 그 끼니의 기본 후보 전체"로 본다.** 점심·아침은 그 끼니 메뉴 전체, 저녁은 야식을 뺀 66개가 후보다(야식은 칩을 직접 켰을 때만 나온다). 국물 필터는 그 위에 적용된다. `filterMealMenus`가 `categories`가 비었을 때 `lateNight`를 뺀 메뉴를 후보로 돌려준다. "카테고리를 하나 이상 고르세요." 안내와 `MEAL_EMPTY_NO_CATEGORY_TEXT` 상수는 없앴다. 칩은 모두 꺼진 상태 그대로 보인다. 후보 0개(국물 조건 때문)일 때의 안내와 "국물 조건 없애기"는 유지한다.
- 상태와 reducer 구조는 바뀌지 않는다. `TOGGLE_CATEGORY`는 기존처럼 `MEAL_CATEGORIES[state.meal]` 칩 순서로 정렬하므로 야식은 켜면 맨 끝에 들어간다.

#### 3.7.9 COMPLIANCE.md (PM 처리)

- 145~146행의 late-night snack 관련 문장을 아래 뜻으로 바꾼다: 끼니는 점심, 저녁, 아침·브런치 셋이다. 저녁에만 "야식" 카테고리가 있고 기본 꺼짐이라 사용자가 켰을 때만 후보에 들어간다. "술", "안주", "해장" 같은 말은 카테고리 키, 라벨, 메뉴 이름, 문구, FAQ, 메타, 약관 문장에 없고 검사로 막는다. 저녁 목록은 안주 연상 메뉴를 빼지 않는다(사용자 결정, 2026-11-23). 안주 연상 메뉴 제외 검사는 아침·브런치에만 한다.
- 위험 수용 항목 추가: 저녁 야식 카테고리와 안주 연상 메뉴 이름이 음주 연상으로 읽힐 위험(M19와 연결), 카카오 AdFit의 주류 관련 정책 해당 여부. 둘 다 법률 확인 필요로 PM에게 올린다.

#### 3.7.10 테스트 영향 범위 (QA 담당)

unit

| 파일 | 영향 |
|---|---|
| `unit/meal/meal-menu.test.ts` | 카테고리 수 기대값을 끼니별 `{ lunch: 6, dinner: 7, breakfast: 6 }`로 바꾼다. `EXPECTED.dinner = { total: 92, perCategory: [18, 11, 10, 8, 9, 10, 26], soup: 23 }`. 합계 40~60 검사는 점심·아침에만 한다. "안주 연상 메뉴 17개가 저녁·아침에 없다" 테스트는 아침만 검사하도록 이름과 대상을 바꾼다. 새: `MEAL_DEFAULT_CATEGORIES`가 점심·아침은 칩 목록과 같고, 저녁은 `lateNight`을 뺀 6개(칩 순서)다. 참고: 지금 테스트의 `dinner` 고정값(60개)은 현재 코드(80개)와도 이미 맞지 않는다 |
| `unit/meal/meal-copy.test.ts` | 운세 개수 검사를 `MEAL_CATEGORIES[meal].length` 기준으로 바꾼다(저녁 7카테고리, 28줄, 중복 없음 28). "72줄" 테스트 이름을 76줄로 바꾼다. 카테고리 라벨·결과 알림 금지어 검사에 D13 A 예외(`MEAL_ALLOWED_CATEGORY_LABELS`)를 적용한다. "금지어 목록에 AC-11 단어가 있다" 검사의 `야식`은 D13 A면 그대로, B면 뺀다 |
| `unit/meal/meal-pick.test.ts` | 시그니처는 그대로다. 기존 "점심 → 저녁" 두 기대값(`['world','korean']` → `['korean','world']`, STANDARD → STANDARD)은 그대로 통과해야 한다. 바뀌는 기대값: "0개 → 새 끼니 전체"에 `carryOverMealCategories([], 'dinner')` → 야식 제외 6개를 더한다. 새 경우: 저녁 7개 → 점심 6개, 저녁 한식·야식 → 점심 한식, 저녁 야식만 → 점심 6개, 저녁 야식만 → 아침 6개, 아침 죽·수프만 → 저녁 야식 제외 6개, 어떤 경우에도 점심·아침 결과에 `lateNight`이 없음. `pickMealLuckLine('dinner', 'lateNight')`은 야식 4줄 안에서, `pickMealLuckLine('lunch', 'lateNight')`은 빈 문자열 |
| `unit/meal/meal-notice.test.ts` | 영향 없음 |

e2e (`e2e/meal.spec.ts`, `e2e/helpers/meal.util.ts`)

- 저녁을 고르면 카테고리 칩이 7개이고 마지막이 "야식"이다. 앞 6개는 `aria-pressed="true"`, 야식은 `aria-pressed="false"`다. 점심·아침으로 바꾸면 "야식" 칩이 없다.
- 저녁 기본 상태의 후보 수 문장이 "후보 메뉴 66개"다. 야식 칩을 켜면 "후보 메뉴 92개"가 된다.
- 저녁 기본 상태에서 여러 번 돌린 결과 이름이 야식 메뉴 목록에 없다(야식 제외 66개 안에 있다). 야식 칩을 켠 뒤에는 결과가 저녁 92개 목록 안에 있다.
- 끼니 전환 시 칩 선택 상태가 3.7.5 표와 같다. 특히 점심 기본 → 저녁에서 야식이 꺼져 있고, 저녁 야식만 → 점심에서 점심 6개가 모두 켜진다.
- 저녁에서 야식만 켜고 "국물 있음"으로 돌리면 결과가 감자탕이다.
- 키보드: 야식 칩도 Tab으로 닿고 Space·Enter로 켜고 끌 수 있다(기존 칩 검사에 저녁을 더한다).
- 결과 영역 금지어 검사는 D13 A면 결과의 카테고리 표시와 알림에서 "야식" 라벨을 예외로 처리한다. 운세 줄과 그 밖의 본문에는 예외를 두지 않는다.
- AC-26: 320px에서 저녁 칩 7개 상태로도 가로 스크롤이 없다.
- 끼니별 카테고리 라벨 목록은 `MEAL_CATEGORIES[meal]`에서, 기본 켜짐 목록은 `MEAL_DEFAULT_CATEGORIES[meal]`에서 읽는다. 다른 e2e 파일은 영향이 없다.

#### 3.7.11 담당 작업과 순서

| 순서 | ID | 담당 | 작업 | 의존 |
|---|---|---|---|---|
| 0 | P-Y | PM | D13 사용자 선택(D14는 B로 확정). 새 야식 메뉴 12개와 운세 4줄 초안 사용자 검수 | - |
| 0 | U-Y | ui-ux-designer | `ui-ux-design.md`의 야식 관련 줄(3.7.7 표)을 D14 B 기준으로 정리. 288행 제안 폐기 기록 | P-Y와 함께 가능 |
| 1 | F-Y | frontend | `meal.type.ts`(3.7.1), `meal-category.constant.ts`(3.7.2), `meal-menu-dinner.constant.ts`·`meal-menu.constant.ts`(3.7.3), `meal-luck.constant.ts`(3.7.6), `meal-copy-rule.constant.ts`(3.7.4, 3.7.7), `meal-pick.util.ts`의 `carryOverMealCategories` 2번 규칙(3.7.5), 훅 `INITIAL_STATE`를 `MEAL_DEFAULT_CATEGORIES` 기준으로(3.7.2), `docs/menu-meals/copy-log.md` 기록 | P-Y, U-Y |
| 2 | Q-Y | qa | 3.7.10 테스트 갱신. `unit/meal/`, `e2e/meal.spec.ts` 데스크톱·모바일 | F-Y |
| 2 | PM-Y | PM | COMPLIANCE.md(3.7.9) | P-Y. F-Y와 파일이 겹치지 않아 동시에 가능 |
| 3 | PM-3 | PM | `pnpm typecheck`, `pnpm lint` 한 번씩 | Q-Y, PM-Y |

- db, backend: 없음.
- 파일 충돌 지점: `meal.type.ts`, `meal-category.constant.ts`, `meal-luck.constant.ts`, `meal-pick.util.ts`, 훅은 F-Y 한 작업에서만 고친다. F-Y가 끝나기 전에는 타입 변경 때문에 `MEAL_LUCK_LINES.dinner`와 저녁 메뉴 선언에서 타입 오류가 나므로, 이 파일들을 한 커밋에서 함께 바꾼다. `carryOverMealCategories` 시그니처가 그대로라 테스트 호출은 깨지지 않지만, F-Y 직후 `unit/meal/meal-menu.test.ts`·`meal-copy.test.ts`의 고정값은 실패한다. Q-Y를 바로 이어서 실행한다.

## 4. 끼니별 운세 문구 구조 (`meal-luck.constant.ts`, 확정)

```ts
export const MEAL_LUCK_LINES: {
  readonly [K in MealKeyType]: Readonly<Record<MealCategoryKeyByMealType[K], readonly string[]>>;
} = {
  lunch: { korean: [...4줄], chinese: [...], japanese: [...], western: [...], bunsik: [...], world: [...] },
  dinner: { korean: [...], ... },
  breakfast: { korean: [...], porridge: [...], bread: [...], sandwich: [...], brunch: [...], quick: [...] },
};
```

- 끼니마다 카테고리당 정확히 4줄, 끼니당 24줄, 전체 72줄. 끼니 안에서 중복 없음.
- 점심 24줄은 기존 문구를 그대로 쓴다. 단 D10 A를 고르면 "든든하게"가 든 한식 한 줄을 새 문장으로 바꾼다.
- 저녁 24줄, 아침 24줄은 새로 쓴다. 저녁과 아침에서 카테고리 2개씩(8줄씩) 먼저 쓰고 사용자 검수를 받은 뒤 나머지를 쓴다(D8). 이력은 `docs/menu-meals/copy-log.md`.
- 문장 규칙: 합니다체, 한 문장, 가벼운 가능성 표현. 메뉴 이름, 국물, 맛 언급 없음(기존 검사 그대로).
- 다른 끼니 이름을 넣지 않는다: 점심 문구에 "저녁", "아침" 없음. 저녁 문구에 "점심", "아침" 없음. 아침 문구에 "점심", "저녁" 없음(AC-13 검사).
- 라벨은 `MEAL_LIST[].luckLabel`에서 가져온다. 기존 `LUNCH_LUCK_LABEL` 상수는 지운다.
- 결과 상태에 문구를 저장하는 방식(뽑을 때 문구를 정해 `spin` 상태에 넣는다)은 기존과 같다.
- 저녁은 `lateNight` 4줄이 더해져 28줄, 전체 76줄이다. 야식 문구 규칙은 3.7.6. (야식 카테고리 반영)

## 5. 문구 규칙과 금지어 (`meal-copy-rule.constant.ts`, 검사 전용)

화면 코드는 이 파일을 import하지 않는다(기존 원칙).

### 5.1 금지 표현

- 기존 `LUNCH_FORBIDDEN_TERMS` 전체를 `MEAL_FORBIDDEN_TERMS`로 옮긴다.
- 추가 (음주): `안주`, `한잔`, `소주`, `맥주`, `해장`, `숙취`, `야식`, `음주`.
- 추가 (건강·영양): `든든`(D10 A), `건강한`, `균형`, `속 편한`, `결식`. `칼로리`, `영양`, `건강에`, `다이어트`는 이미 있다.
- "술"은 부분 일치로 넣으면 "기술", "예술" 등을 잘못 잡는다. 대신 `MEAL_FORBIDDEN_PATTERNS`에 `/(?<![가-힣])술/`(앞에 한글 음절이 없는 "술")을 넣는다. "술", "술자리", "술안주"는 잡고 "기술"은 잡지 않는다.
- 허용 예외 문장(`MEAL_COPY_ALLOWED_SENTENCES`)은 기존 고지 5문장 그대로다. 늘리지 않는다.
- 금지어 `야식`과 저녁 카테고리 라벨 "야식"의 충돌은 D13으로 정한다. D13 A면 `야식`은 그대로 두고 카테고리 라벨 자리만 `MEAL_ALLOWED_CATEGORY_LABELS`로 예외 처리한다(3.7.7). 고지 예외 문장 목록은 늘리지 않는다. (야식 카테고리 반영)

### 5.2 저녁·아침 제외 메뉴 (검사 전용)

```ts
/** 저녁·아침 목록에 있으면 안 되는 안주 연상 메뉴 이름 (D4 확정 뒤 고정) */
export const MEAL_ALCOHOL_ASSOCIATED_MENU_NAMES: readonly string[] = [
  '탕수육', '깐풍기', '마라샹궈', '가라아게', '튀김', '어묵', '치킨',
  '족발', '보쌈', '곱창', '막창', '닭발', '삼겹살', '골뱅이', '오돌뼈', '파전', '부대찌개',
];
```

- 점심 목록은 이 검사 대상이 아니다(점심은 기존 48개 유지, plan 판단).
- 야식 카테고리 반영 뒤에는 저녁도 이 검사 대상이 아니다. 아침·브런치만 검사한다. 목록 17개는 그대로 둔다(3.7.4). (야식 카테고리 반영)

### 5.3 화면 문구 초안 (최종은 ui-ux-design.md 문구 표와 사용자 승인)

| 상수 | 초안 |
|---|---|
| `MEAL_PAGE_DESCRIPTION` | 돌림판을 돌려 오늘의 점심, 저녁, 아침 메뉴를 뽑아 봅니다. |
| `MEAL_INTRO_TEXT` | 점심, 저녁, 아침·브런치 메뉴가 고민될 때 돌림판으로 오늘의 메뉴를 하나 뽑아 보는 서비스입니다. 끼니를 하나 고르고 카테고리와 국물 조건을 정하면 그 끼니의 메뉴 가운데 같은 확률로 정해지고, 뽑힌 메뉴는 지도에서 바로 찾아볼 수 있습니다. |
| `MEAL_STEPS` | 끼니를 고릅니다. / 카테고리와 국물 조건을 고릅니다. / 룰렛 돌리기를 누릅니다. / 뽑힌 메뉴를 지도에서 찾아봅니다. |
| `MEAL_PICKER_GROUP_LABEL` | 끼니 |
| `MEAL_NOSCRIPT_TEXT` | 끼니 선택과 돌림판은 JavaScript가 켜져 있어야 동작합니다. 브라우저 설정에서 JavaScript를 켜 주시기 바랍니다. 소개와 자주 묻는 질문은 그대로 읽으실 수 있습니다. |
| 고지 5문장 | 기존 원문 그대로. "점심"이 들어 있지 않아 바꿀 필요가 없다 |
| 결과 알림 | `getMealResultAnnouncement(name, categoryLabel)` = "뽑힌 메뉴는 {메뉴}({카테고리})입니다." (기존과 같음) |

FAQ 초안 (`MEAL_FAQ`, 7개, 화면과 JSON-LD가 같은 배열)

1. 오늘 뭐 먹지는 어떤 서비스인가요? → 점심, 저녁, 아침·브런치 메뉴가 고민될 때 돌림판을 돌려 오늘의 메뉴를 하나 뽑아 보는 오락용 서비스입니다. 로그인이나 입력 없이 이용하실 수 있습니다.
2. (신규) 어떤 끼니를 고를 수 있나요? → 점심, 저녁, 아침·브런치 가운데 하나를 고르면 그 끼니의 메뉴 목록 안에서만 뽑습니다. 끼니를 바꾸면 이전 결과는 지워집니다.
3. 메뉴는 어떻게 뽑나요? → 고른 끼니와 카테고리, 국물 조건에 맞는 메뉴 가운데 무작위로 하나가 정해지며, 메뉴마다 같은 확률입니다. 후보가 둘 이상이면 바로 앞에 뽑힌 메뉴는 이번 후보에서 제외합니다.
4. 뽑힌 메뉴는 추천인가요? → 기존 답 그대로.
5. 지도 링크를 누르면 어디로 이동하나요? → 기존 답 그대로(3개 제공자).
6. 지도에 나온 식당 정보가 맞는지 알려 주나요? → 기존 답 그대로.
7. (신규) 예전 점심 룰렛 주소로 들어가면 어떻게 되나요? → 예전 주소로 들어오시면 이 페이지로 자동으로 이동합니다. 점심 메뉴는 끼니에서 점심을 고르면 그대로 뽑을 수 있습니다.

- 답에 "보장"을 쓰지 않는다. 답끼리 같은 문장이 없어야 한다(기존 검사).
- 외부 링크 FAQ는 배열 순서가 바뀌므로 테스트는 인덱스가 아니라 질문 문장으로 찾는다(11장).
- 위 문구와 FAQ에는 카테고리 수가 없어 야식 카테고리로 바꿀 곳이 없다. "야식"을 새로 넣지 않는다. 야식 칩이 기본 꺼짐이라는 안내 문장도 두지 않는다(칩의 `aria-pressed`와 후보 수 문장으로 충분하다). 결과 알림에는 야식 메뉴일 때 라벨 "야식"이 괄호 안에 들어간다(D13, 3.7.7). (야식 카테고리 반영)

## 데이터 저장 위치

| 데이터 | 위치 | 이유 |
|---|---|---|
| 끼니 목록, 카테고리, 끼니별 메뉴, 운세 문구, 고지, FAQ, SEO 값, 지도 URL 앞부분 | 코드 상수 (`src/features/meal/constants`) | 모두에게 같고 자주 바뀌지 않는다. 합쳐 수십 KB 이하라 번들 부담이 작다 |
| 선택한 끼니, 카테고리·국물 조건, 회전 상태, 결과, 직전 메뉴 | React 상태(useReducer, 메모리) | plan AC-20. 저장하면 안 되는 값이다. sessionStorage, localStorage, IndexedDB, 쿠키, URL 모두 쓰지 않는다 |
| 검사 전용 금지어·제외 메뉴 | 코드 상수 (`meal-copy-rule.constant.ts`) | 테스트만 읽는다 |
| 리다이렉트 목록 | `next.config.ts` | Next.js 설정 |
| 사이트맵 제외 목록 | `src/app/sitemap.ts` 안 상수 | D5 |
| 야식 카테고리, 끼니별 기본 선택(`MEAL_DEFAULT_CATEGORIES`), 야식 메뉴, 야식 운세, 검사 예외 라벨 | 코드 상수 (위 첫째·셋째 줄과 같은 파일) | 저장 위치는 바뀌지 않는다. 야식 칩을 켰는지도 다른 카테고리처럼 React 상태에만 두고 기억하지 않는다. 새로고침하면 다시 꺼진다 (야식 카테고리 반영) |

Supabase는 쓰지 않는다(회원가입 없음, 공유 데이터 없음).

## API 계약

없음. 서버로 보내는 요청이 없다. 분석 이벤트도 보내지 않는다(plan 기본안).

| 메서드 | 경로 | 요청 | 응답 | 에러 |
|---|---|---|---|---|
| - | - | - | - | - |

참고: 주소 이동은 API가 아니라 Next.js 리다이렉트다(7장).

## DB 스키마

없음. 테이블, 컬럼, 인덱스, RLS, 마이그레이션 모두 없음.

## 프론트 구조

### 6.1 페이지 (서버/클라이언트 구분)

| 경로 | 파일 | 렌더링 |
|---|---|---|
| `/meal` | `src/app/meal/page.tsx` (신규, `MealPage`) | 서버 컴포넌트, 정적. `searchParams`를 읽지 않는다. `buildMetadata()` 사용 |
| `/lunch/today` | 없음 (파일 삭제) | `next.config.ts` 301 |

- 클라이언트 경계는 `MealRouletteComponent`(root) 하나다. 공용 `RouletteComponent`는 기존처럼 따로 `'use client'`.
- 초기 상태가 고정값(점심, 전체 카테고리, 국물 전체)이라 서버 HTML과 첫 클라이언트 렌더가 같다.

### 6.2 컴포넌트 트리

```
MealPage (서버, app)
  ContentWrapperComponent type="meal"            # D2 B면 "lunch"
    JsonLdComponent                              # BreadcrumbList, FAQPage
    TitleWrapperComponent                        # h1 "오늘 뭐 먹지" (유일한 h1)
    MealRouletteDisclaimerNoticeComponent        # 서버. 상시 오락 고지
    MealRouletteNoscriptNoticeComponent          # 서버
    MealRouletteComponent ('use client', root)
      MealRouletteMealPickerComponent            # 신규. 끼니 3택
      MealRouletteFilterPanelComponent           # categories 옵션을 props로 받는다
      MealRouletteSpinPanelComponent
        RouletteComponent (공용)
      MealRouletteStatusComponent                # role="status". 결과 알림과 끼니 변경 알림이 함께 쓰는 한 영역 (ARC-1 반영)
      MealRouletteResultComponent                # luckLabel을 props로 받는다
        MealRouletteMapLinksComponent            # 3개, 기존과 같음
    MealRouletteIntroComponent                   # 서버. 끼니 설명이 든 소개 + 사용 순서 4단계
    MealRouletteRandomNoticeComponent            # 서버
    MealRouletteFaqComponent                     # 서버. FAQ 7개
```

- 끼니 선택 영역은 필터 위에 둔다. 모양은 ui-ux-design.md가 정한다. 의미 구조는 확정한다: `<fieldset><legend>끼니</legend>` 안에 기본 `<input type="radio">` 3개와 `<label>`(기존 국물 선택과 같은 방식). 새 shadcn 컴포넌트(RadioGroup, ToggleGroup)는 추가하지 않는다.
- 회전 중에는 끼니 라디오에 `aria-disabled="true"`를 주고 `onChange`에서 무시한다(기존 국물 잠금과 같음, plan "연출 중 끼니 바꾸기 막기").
- 탭 순서: 끼니(탭 정지점 하나) → 카테고리 칩 → 국물 → ("국물 조건 없애기") → 뽑기 버튼 → 지도 링크.
- 필터 패널은 지금 `LUNCH_CATEGORIES`를 직접 import한다. 끼니마다 카테고리가 다르므로 `categoryOptions: readonly MealCategoryType[]` props로 받게 바꾼다. root도 결과 카테고리 이름을 `MEAL_CATEGORIES[state.meal]`에서 찾는다.
- 결과 컴포넌트는 `LUNCH_LUCK_LABEL` 대신 `luckLabel` props를 받는다.
- 알림 영역 (U3, ARC-1 반영)
  - 스크린리더 알림은 `MealRouletteStatusComponent` 하나만 쓴다. 기존 마크업(화면에 보이지 않는 `<p role="status" aria-atomic="true">`)을 그대로 두고, 새 알림 영역이나 컴포넌트를 만들지 않는다. `role="status"`가 polite 알림이므로 `aria-live` 속성을 따로 더하지 않는다.
  - 이 영역에는 한 번에 한 문장만 들어간다: 결과 알림(5.3) 또는 끼니 변경 알림(6.3), 아니면 빈 문자열. 문자열은 root가 렌더링 중에 계산해 `message` props로 넘긴다. 상태 컴포넌트는 받은 문자열만 그린다.
  - 필터 패널의 후보 수 문장에는 기존대로 `aria-live`를 붙이지 않는다. 후보 0개일 때의 빈 상태 안내(`emptyNoticeId`)는 기존과 같다.
  - 끼니 선택 컴포넌트에는 알림 문자열이나 `aria-live`를 두지 않는다. 포커스는 끼니 선택에 그대로 남는다.
- 컴포넌트 트리와 props는 바뀌지 않는다. 저녁에서 필터 패널이 받는 `categoryOptions`가 7개가 되고, 야식 칩은 기본 `aria-pressed="false"`다. 돌림판 칸은 저녁 기본 66개, 야식까지 켜면 92개다. 칩 줄바꿈과 칸 가독성은 ui-ux-design.md에서 확인한다(3.7.8). (야식 카테고리 반영)

### 6.3 상태 위치 (`roulette/hooks/use-meal-roulette.hook.ts`, useReducer, 확정)

```ts
export type MealRouletteStateType = Readonly<{
  meal: MealKeyType;                 // 기본 MEAL_DEFAULT_KEY ('lunch')
  filter: MealFilterType;            // 기본: 그 끼니 카테고리 전체, broth 'all'
  spin: MealSpinStateType;           // 기존 LunchSpinStateType 이름만 변경
  spinSeq: number;
  lastPickedId: string | null;
  hasMealChanged: boolean;           // 신규 (ARC-1 반영). 끼니 변경 알림을 낼지. 기본 false
}>;

type MealRouletteActionType =
  | { type: 'SET_MEAL'; meal: MealKeyType }            // 신규
  | { type: 'TOGGLE_CATEGORY'; category: MealCategoryKeyType }
  | { type: 'SET_BROTH'; broth: MealBrothFilterType }
  | { type: 'SPIN_START'; spinId: number; menuId: string; luckLine: string }
  | { type: 'SPIN_END'; spinId: number };
```

| 사용자 행동 | 함수 | 액션 | 조건 | 결과 |
|---|---|---|---|---|
| 끼니 바꿈 | `setMeal(key)` | `SET_MEAL` | `spinning`이면 무시. 같은 끼니면 상태 그대로(알림도 다시 내지 않음) | `meal` 변경, `filter.categories = carryOverMealCategories(...)`, 국물 유지, `spin = idle`, `lastPickedId = null`, `hasMealChanged = true`. 결과와 결과 알림은 사라지고, 알림 영역에는 끼니 변경 문장 하나만 남는다. 버튼 라벨 "룰렛 돌리기" (ARC-1 반영) |
| 카테고리 칩 | `toggleCategory` | `TOGGLE_CATEGORY` | 기존과 같음 | 칩 순서는 `MEAL_CATEGORIES[state.meal]` 기준. `hasMealChanged = false` (ARC-1 반영) |
| 국물 | `setBroth` | `SET_BROTH` | 기존과 같음 | 기존과 같음. `hasMealChanged = false` (ARC-1 반영) |
| 뽑기 | `spin()` | `SPIN_START` | 기존과 같음 | 후보는 `filterMealMenus(MEAL_MENUS[state.meal], filter)`, 문구는 `pickMealLuckLine(state.meal, picked.category)`. `hasMealChanged = false` (ARC-1 반영) |
| 돌림판 멈춤 | `handleSpinEnd` | `SPIN_END` | 기존과 같음 | 기존과 같음 |

- `lastPickedId`를 끼니 변경 때 지우는 이유: 끼니 사이에 같은 `id`가 있을 수 있어, 점심에서 뽑은 메뉴가 저녁 후보에서 빠지는 일을 막는다.
- 렌더링 중 계산: 후보, 결과 메뉴(`MEAL_MENUS[state.meal]`에서 찾음), 카테고리 옵션, 끼니 이름과 운세 라벨(`MEAL_LIST`에서 찾음), `canSpin`, 버튼 라벨, `showClearBroth`, 알림 문자열. 상태로 두지 않는다.
- 훅 반환값: 기존 반환값 + `setMeal`, `categoryOptions`, `luckLabel`, `mealLabel`(ARC-1 반영).
- URL에 넣지 않는 방식: `useSearchParams`, `router.*`, `history.*`, `location.hash`를 쓰지 않는다. 페이지는 `searchParams`를 받지 않는다. 끼니를 바꿔도 주소는 `/meal` 그대로다. 그 결과 새로고침, 뒤로 가기, 공유 링크는 항상 점심 기본 상태로 열린다(plan 원칙에 따른 의도된 동작). Vercel Web Analytics는 경로만 기록하므로 끼니 값이 남지 않는다.
- 전역 store, Context, 브라우저 저장소, 쿠키 동의 상태를 쓰지 않는다. 쿠키 동의와 무관하게 동작한다(AC-22).
- 야식 카테고리로 상태·액션 타입과 `SET_MEAL` 호출 인자는 바뀌지 않는다. 위 `filter` 주석의 "그 끼니 카테고리 전체"는 `MEAL_DEFAULT_CATEGORIES[meal]`로 읽는다(저녁은 야식 제외 6개). `carryOverMealCategories`의 내부 규칙만 3.7.5대로 바뀐다. (야식 카테고리 반영)

알림 규칙 (U3, 확정, ARC-1 반영)

- 알림 문자열 계산(root, 렌더링 중). 결과가 우선이고, 결과가 없을 때만 끼니 변경 문장을 쓴다.

```ts
const announcement = resultMenu
  ? getMealResultAnnouncement(resultMenu.name, categoryLabel)
  : state.hasMealChanged
    ? getMealChangeAnnouncement(mealLabel)
    : '';
```

- 문구 함수는 `meal-notice.constant.ts`에 둔다: `export function getMealChangeAnnouncement(mealLabel: string): string`. 화면 문구는 상수 파일에서만 만든다.
- 문구 후보 (`{끼니}`는 `MEAL_LIST[].label`: 점심, 저녁, 아침·브런치)

| 안 | 문구 | 장점 | 단점 |
|---|---|---|---|
| A (추천) | `{끼니} 메뉴로 바꿨어요.` | 한 문장이라 polite 알림이 짧게 끝난다. "메뉴로"를 붙여 끼니 이름의 받침과 상관없이 조사가 항상 "로"다(점심·저녁도 "점심으로"를 따로 처리할 필요가 없다). 후보 수가 없어 0개일 때 문장을 따로 둘 필요가 없다 | 바뀐 후보 수는 알려 주지 않는다. 후보 수는 필터 패널의 후보 수 문장에서 읽을 수 있다 |
| B | `{끼니} 메뉴로 바꿨어요. 후보는 {n}개예요.` | ui-ux U3 원안처럼 카테고리가 바뀐 결과까지 알려 준다 | 두 문장이다. 후보 0개일 때 문장을 따로 정해야 하고, 빈 상태 안내(`role="status"`)와 겹쳐 읽힐 수 있다 |
| C | `{끼니} 메뉴로 바꿨습니다.` | 결과 알림("…입니다.")과 문체가 같다 | 확정 방향(서비스 문구 `…해요`체)과 다르다 |

- 확정 문구: A안 `{끼니} 메뉴로 바꿨어요.` (예: "저녁 메뉴로 바꿨어요.", "아침·브런치 메뉴로 바꿨어요."). 결과 알림은 기존 합니다체 그대로 둔다. plan의 합니다체 규칙은 운세 문구 원칙이라 이 알림 문장에는 해당하지 않는다.
- 금지어 확인: "추천", "보장", 음주·건강 금지어(5.1)가 없다. Q-2에서 이 문장(세 끼니 모두)을 기존 금지어 검사 대상에 넣는다.
- 알림이 나오지 않는 경우: 처음 열 때(`hasMealChanged` 기본 false라 서버 HTML과 첫 렌더가 같다), 회전 중 끼니 변경(무시), 같은 끼니를 다시 고름(상태 그대로).
- 끼니를 바꾼 뒤 카테고리·국물을 바꾸거나 돌리기를 시작하면 끼니 변경 문장을 지운다. 돌림판이 멈추면 기존처럼 결과 알림이 나온다.
- 6.4 "끼니 변경" 행의 "결과·알림 지움"은 결과와 결과 알림을 지운다는 뜻이다. 끼니 변경 문장은 이 절 규칙을 따른다.
- 끼니 값과 `hasMealChanged`는 React 상태(메모리)에만 둔다. 저장소·URL·쿠키에 넣지 않는다(데이터 저장 위치 표와 같음).

### 6.4 예외·빈 상태

| 상황 | 화면 |
|---|---|
| 끼니 변경 | 결과·알림 지움. 카테고리는 3.6 규칙, 국물 유지 |
| 회전 중 끼니 변경 | 무시 |
| 카테고리 0개 | 막지 않는다. 그 끼니 기본 후보 전체(저녁은 야식 제외 66개)로 뽑는다 |
| 후보 0개 | 기존과 같다(버튼 비활성, 안내, "국물 조건 없애기") |
| 아침 + 국물 있음 + 한식·죽·수프 외 카테고리만 | 후보 0개 처리 |
| 저녁 기본 상태 (야식 꺼짐) | 후보 66개. 야식 메뉴는 후보와 돌림판 칸에 없다 (야식 카테고리 반영) |
| 저녁 + 국물 있음 + 야식만 | 후보 1개(감자탕). 빈 상태가 아니다. 후보가 1개라 직전 메뉴 제외는 적용하지 않는다 (야식 카테고리 반영) |
| 저녁에서 다른 끼니로 변경 | 야식 선택은 사라진다. 야식만 켜져 있었으면 새 끼니 기본 선택. 나머지는 3.7.5 표 (야식 카테고리 반영) |
| 옛 주소 접속 | 서버 301로 `/meal`. 클라이언트 상태는 처음부터 시작 |
| JS 꺼짐 | 소개, 끼니 설명, 고지, FAQ는 서버 HTML. noscript 안내에 끼니 선택도 동작하지 않는다고 적는다 |

## 7. 주소 변경: 리다이렉트, 사이트맵, 메뉴 그룹

### 7.1 리다이렉트 (`next.config.ts`, PM 처리, 확정)

기존 로또 3건(`permanent: true`)은 그대로 두고 아래를 추가한다.

```ts
{ source: '/lunch/today', destination: '/meal', statusCode: 301 },
// D6 B를 고르면 추가
{ source: '/lunch', destination: '/meal', statusCode: 301 },
```

- `statusCode`와 `permanent`는 같이 쓰지 않는다(Next.js 문서, 리서치 6장).
- 한 단계 이동이다. 체인과 순환이 없다. `source`는 정확한 경로라 `/lunch`가 `/lunch/today`를 가로채지 않는다.
- 쿼리 문자열은 Next.js가 그대로 넘긴다. 사용자 값으로 목적지를 만들지 않으므로 오픈 리다이렉트 위험이 없다.
- 유지 기간: 영구(M14). 지우지 않는다.
- `src/app/lunch/today/page.tsx`는 지운다. 리다이렉트가 파일 라우트보다 먼저 처리되지만, 남겨 두면 빌드 결과에 죽은 라우트가 생긴다.
- 리다이렉트와 `/meal` 페이지는 같은 배포에 들어가야 한다. 하나만 나가면 404 또는 중복 페이지가 생긴다.
- 야식 카테고리는 주소를 만들지 않는다. 리다이렉트 변경 없음. (야식 카테고리 반영)

### 7.2 사이트맵 (`src/app/sitemap.ts`, D5 B, 확정)

- `/meal`은 `MENU_LIST`의 그룹 `href`와 항목 `href`에서 자동으로 들어간다(둘 다 `/meal`, 기존 `Set`으로 중복 제거). `sitemap.ts`에 `/meal`을 직접 적지 않는다(한 곳에서만 관리).
- 옛 주소 제외 목록을 둔다.

```ts
/** 영구 이동한 옛 주소. next.config.ts redirects()의 source와 같게 유지한다 */
const SITEMAP_REDIRECTED_ROUTES: ReadonlySet<string> = new Set(['/lunch/today', '/lunch']);
// allRoutes를 만든 뒤 .filter((route) => !SITEMAP_REDIRECTED_ROUTES.has(route))
```

- 로또 옛 주소 3건은 이번 범위가 아니라 넣지 않는다(기획서에 없음).
- 우선순위는 기존 규칙(로또 외 0.6) 그대로.
- 야식 카테고리로 사이트맵 변경 없음. (야식 카테고리 반영)

### 7.3 메뉴 그룹 (`src/constants/menu.constant.ts`, 확정, D2 A 기준)

```ts
export enum MENU_GROUP_NAME_ENUM {
  LOTTO = 'lotto',
  MEAL = 'meal',      // LUNCH = 'lunch'에서 변경
  TAROT = 'tarot',
  FORTUNE = 'fortune',
  DREAM = 'dream',
}

{
  group: MENU_GROUP_NAME_ENUM.MEAL,
  label: '메뉴 룰렛',
  href: `/${MENU_GROUP_NAME_ENUM.MEAL}`,
  items: [
    {
      href: `/${MENU_GROUP_NAME_ENUM.MEAL}`,
      label: '오늘 뭐 먹지',
      icon: 'Utensils',
      colorClass: 'text-menu-meal',
      description: '룰렛으로 오늘의 점심·저녁·아침 메뉴를 무작위로 뽑고 지도에서 찾아보기.',
      example: '예: 저녁에 한식·분식만 골라 국물 메뉴로 룰렛 돌리기',
    },
  ],
},
```

- 메뉴 목록 안 위치(두 번째)는 그대로다.
- 설명·예시에 "추천", "가격", "혼밥", "별점", "후기", "술", "안주"가 없다(AC-31).
- D2 A의 함께 바꿀 곳: `src/types/menu.type.ts`(`'lunch'` → `'meal'`), `src/constants/theme.constant.ts`(4개 맵의 `lunch` 키와 `menu-lunch` 클래스), `src/app/globals.css`(`--menu-lunch`, `--color-menu-lunch` → `--menu-meal`, `--color-menu-meal`, 값 `#a5481f` 그대로), `src/components/common/roulette.component.tsx`(`fill-menu-lunch`, `stroke-menu-lunch` 3곳), `docs/conventions/design-system.md` 색 표 한 줄(사용자 승인 뒤 PM). 화면 색은 바뀌지 않는다.
- D2 B를 고르면 enum 키와 토큰은 그대로 두고 `label`, `href`(`'/meal'` 문자열), `description`, `example`만 바꾼다.
- 설명과 예시는 야식 카테고리 때문에 바꾸지 않는다. "야식"을 넣지 않는다. (야식 카테고리 반영)

## SEO

| URL | title | description | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/meal` | 오늘 뭐 먹지 - 점심·저녁·아침 메뉴 룰렛 (템플릿이 " \| 운빨연구소"를 붙인다) | 룰렛으로 오늘의 점심, 저녁, 아침 메뉴를 무작위로 골라 보는 오락 서비스입니다. 뽑힌 메뉴는 지도에서 바로 검색할 수 있습니다. | BreadcrumbList, FAQPage | 등록 (`MENU_LIST`에서 자동) |
| `/lunch/today` | 없음 (301 → `/meal`) | 없음 | 없음 | 제외 (`SITEMAP_REDIRECTED_ROUTES`) |
| `/lunch` (D6 B) | 없음 (301 → `/meal`) | 없음 | 없음 | 제외 |

- title, description은 초안이다. 최종 문구는 사용자 승인. 상수는 `meal-seo.constant.ts`의 `MEAL_HUB_SEO`.
- 메타데이터: `buildMetadata({ title, description, pathname: '/meal', keywords, ogImage: { alt } })`. 직접 객체를 만들지 않는다. `robots`는 `buildMetadata` 기본(index, follow). 출시 전 noindex 단계는 두지 않는다(D11).
- canonical, og:url, BreadcrumbList 주소는 모두 `/meal`(AC-5).
- OG 이미지 태그: `getOgTag({ href: '/meal' })`가 그룹 이름 "메뉴 룰렛"을 돌려준다. alt 초안: "오늘 뭐 먹지 메뉴 룰렛 안내 이미지". 음식 사진은 쓰지 않는다.
- 키워드 (D9 A): 오늘 뭐 먹지, 점심 뭐 먹지, 점심 메뉴 추천(기존 승인), 점심 룰렛, 점심 메뉴 룰렛, 오늘 점심 메뉴, 점심 메뉴 고르기, 저녁 뭐 먹지, 저녁 메뉴 룰렛, 저녁 메뉴 고르기, 아침 뭐 먹지, 메뉴 룰렛. "주변 음식점 찾기", "식당 찾기", 새 "추천" 키워드는 넣지 않는다. 점심 키워드를 남겨 옛 페이지의 검색 문구가 새 페이지에도 담기게 한다.
- BreadcrumbList: 홈(`/`) > 메뉴 룰렛(`/meal`) > 오늘 뭐 먹지(`/meal`). `MEAL_BREADCRUMB.group.name = '메뉴 룰렛'`.
- FAQPage: `MEAL_FAQ` 7개, 화면과 같은 배열.
- 가게 정보 구조화 데이터(Restaurant, LocalBusiness 등)는 쓰지 않는다(AC-28).
- 서버 HTML에 h1, 설명 문단, 끼니 설명(소개 문단과 사용 순서), FAQ가 들어간다(AC-27). 끼니 선택과 룰렛은 클라이언트 상호작용이지만 초기 상태가 서버에서 그려진다.
- h1은 하나. `layout.tsx` 인증 메타 태그는 건드리지 않는다.
- 배포 후 사용자 작업(M16): 서치어드바이저·서치 콘솔 사이트맵 재제출, 옛 주소 색인 상태 확인. 네이버의 301 처리 방식은 공식 확인이 없다(리서치 6장, 확인 필요).
- 야식 카테고리로 URL, title, description, 키워드, JSON-LD, sitemap 모두 바꾸지 않는다. "야식 메뉴 룰렛" 같은 키워드는 plan에 없어 넣지 않는다. 넣으려면 PM이 plan을 먼저 고친다. 서버 HTML의 첫 상태는 점심이라 야식 칩은 서버 HTML에 나오지 않는다. (야식 카테고리 반영)

## 8. 법적 문서 반영

문장은 초안이다. 최종 문구는 사용자 승인. 장 번호와 구조는 바꾸지 않는다.

### 8.1 이용약관 (`src/app/terms/page.tsx`, frontend)

| 위치 (현재 행) | 변경 |
|---|---|
| 1장 셋째 문단 (81~83행) | "또한 본 서비스는 점심, 저녁, 아침·브런치 가운데 끼니를 골라 메뉴를 룰렛으로 무작위로 뽑아 보고 지도 검색 페이지로 이동할 수 있는 메뉴 룰렛 기능을 오락 목적으로 제공합니다." |
| 9장 제목 (193행) | "9. 메뉴 룰렛 서비스" |
| 9장 첫 문단 (196~201행) | "메뉴 룰렛 서비스는 오락을 목적으로 제공됩니다. 이용자가 고른 끼니(점심, 저녁, 아침·브런치)와 카테고리, 국물 조건 안에서 메뉴가 같은 확률로 무작위로 정해지며, …" 이하 기존 문장 유지. "메뉴 목록은 끼니마다 이 서비스가 직접 작성한 것이며 외부 데이터를 사용하지 않습니다." |
| 9장 둘째 문단 (210~212행) | "점심 메뉴 룰렛 서비스는" → "메뉴 룰렛 서비스는", "고른 조건과 뽑힌 결과를" → "고른 끼니와 조건, 뽑힌 결과를" |
| 13장 (248행) | "점심 메뉴 룰렛 서비스에서" → "메뉴 룰렛 서비스에서". plan은 12장이라고 적었으나 실제 책임 제한 장은 13장이다 |
| 시행일 (46행 `EFFECTIVE_DATE`) | 배포일 (D12) |

- 지도 제공자 문장(카카오맵, 네이버지도, 구글 지도)은 그대로다(M11 승인).
- 새 문장에 금지어(5장)가 없어야 한다(AC-11). 장 번호 1~끝 연속(AC-32).
- 리서치 5.3의 Google Maps 추가 약관 링크는 기획 범위에 없어 넣지 않는다. 필요 여부는 법률 확인 필요로 COMPLIANCE.md 위험 수용 항목에 남긴다.
- 약관 문장은 카테고리 이름이나 수를 말하지 않아 야식 카테고리로 바꿀 곳이 없다. (야식 카테고리 반영)

### 8.2 개인정보처리방침 (`src/app/privacy/page.tsx`, frontend)

| 위치 (현재 행) | 변경 |
|---|---|
| 6장 지도 링크 문단 (200~207행) | "점심 메뉴 룰렛의" → "메뉴 룰렛의", "점심 메뉴 룰렛은 위치 정보를" → "메뉴 룰렛은 위치 정보를", "이용자가 고른 조건과" → "이용자가 고른 끼니와 조건," |
| 시행일 (43행 `EFFECTIVE_DATE`) | 배포일 (D12) |

수집 항목과 저장 문구는 바꾸지 않는다.

### 8.3 COMPLIANCE.md (PM 처리)

- 1장 14행: `Lunch (/lunch/today)` → `Meal roulette (/meal; /lunch/today redirects permanently with 301)`. "Selected filters" → "Selected meal, filters".
- 11장 145~153행 항목 이름을 `Meal roulette (/meal): lunch, dinner, breakfast/brunch`로 바꾸고 아래를 고친다.
  - 파일 경로: `src/features/lunch/constants/...` → `src/features/meal/constants/meal-notice.constant.ts`, `meal-copy-rule.constant.ts`.
  - 검사 위치: 지금 적힌 `e2e/lunch-copy.spec.ts`는 저장소에 없다. `unit/meal/meal-copy.test.ts`로 바로잡는다.
  - 새 줄: 끼니는 점심, 저녁, 아침·브런치 셋이다. 술안주·야식 끼니가 없다. 메뉴 이름, 문구, FAQ, 메타, 약관 문장에 음주 관련 단어가 없고 검사로 막는다. 저녁·아침 목록에서 안주 연상 메뉴를 뺀 기준(5.2 목록)을 적는다.
  - 저작 이력: `docs/lunch/copy-log.md`에 `docs/menu-meals/copy-log.md`를 더한다.
  - 법률 검토 상태 (D12): "위험 수용"을 유지하고 결정일을 적는다. 새 위험 수용 항목: 저녁 메뉴의 음주 연상 판단, "해장" 표현 차단 기준, 아침 메뉴·문구의 식품 표시·광고 해당 여부, Google Maps Platform 약관 3.2.2가 검색 링크에 적용되는지, 약관 시행일 변경 방식.
  - 남은 출시 전 점검: 301 응답 확인, 사이트맵 옛 주소 제외 확인, AdFit 현재 운영정책 원문 확인.
- 위 "새 줄"의 "저녁·아침 목록에서 안주 연상 메뉴를 뺀 기준"은 야식 카테고리 결정으로 바뀌었다. 저녁 야식 카테고리(기본 꺼짐), 안주 연상 메뉴 검사 범위(아침만), 새 위험 수용 항목은 3.7.9를 따른다. (야식 카테고리 반영)

### 8.4 README.md, 라이선스 문서

- README: 변경 없음. 새 환경변수, API, 테이블이 없다. 지금 README에는 점심 기능 줄도 없다.
- `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`: 변경 없음. 새 라이브러리, 폰트, 이미지가 없다.
- 야식 카테고리로도 변경 없음. (야식 카테고리 반영)

## 9. 테스트 영향과 갱신 범위 (QA 담당)

QA는 `e2e/meal.spec.ts`와 `unit/meal/`만 돌리고 전체 회귀는 마지막에 한 번 돌린다(M18).

### 9.1 `e2e/lunch.spec.ts` → `e2e/meal.spec.ts`

| 기존 | 변경 |
|---|---|
| import `@/features/lunch/...` | `@/features/meal/...` |
| `PATH = '/lunch/today'` | `'/meal'` |
| `MENU_NAMES = LUNCH_MENUS` | 세 끼니 이름 합집합(결과 영역 찾기용)과 끼니별 이름 목록 |
| `CATEGORY_LABELS` | `MEAL_CATEGORIES.lunch` 라벨 (기본 끼니) |
| `openPage`의 "한식" 칩 확인 | 그대로 쓸 수 있다(세 끼니 모두 "한식"이 있다) |
| AC-5 빈 상태 테스트 (양식만 남기고 국물 있음) | 점심 데이터가 그대로라 통과한다 |
| 지도 테스트의 원래 탭 주소 확인 | `'/meal'` |
| AC-38 메뉴 진입: 링크 이름 "점심", `/lunch/today$` | 링크 이름 "메뉴 룰렛"(그룹) 또는 "오늘 뭐 먹지"(항목), `/meal$` (plan AC-3) |
| SEO: canonical `PATH`, sitemap에 `PATH` 포함 | canonical `/meal`, sitemap에 `/meal</loc>` 포함, `/lunch/today</loc>`·`/lunch</loc>` 없음 (AC-4) |
| `LUNCH_LUCK_LABEL` 확인 | 선택한 끼니의 `luckLabel` |

새 테스트

- 301: `request.get('/lunch/today', { maxRedirects: 0 })` 상태 301, `location` 경로 `/meal`. D6 B면 `/lunch`도 같다. 따라간 최종 응답 200, h1 "오늘 뭐 먹지"(AC-2).
- 끼니: 기본 점심 선택 하나(AC-6), 선택지 3개 이름(AC-8), 끼니를 바꾸면 결과 사라짐(AC-7), 저녁·아침에서 뽑은 이름이 그 끼니 목록 안에 있음(AC-10), 운세 라벨이 끼니와 같음(AC-12), 운세 문구가 그 끼니·카테고리 목록 안에 있음(AC-13).
- 저장: 끼니를 바꾸고 돌린 뒤 localStorage, sessionStorage 키 0개, 쿠키에 끼니·결과 없음, `page.url()`의 경로 `/meal`, 쿼리와 해시 없음(AC-20).
- 위치 권한 요청 없음(AC-21), 쿠키 거절 상태 동작(AC-22), 키보드로 끼니 선택 포함 전체 흐름(AC-25).
- 서버 HTML에 끼니 설명과 FAQ 7개 질문(AC-27), JSON-LD 두 종류만(AC-28), BreadcrumbList 이름 "홈(사이트 이름) > 메뉴 룰렛 > 오늘 뭐 먹지"(AC-29), noindex 없음(AC-30 앞문장).
- `/terms` 9장, `/privacy` 6장 문단 문구와 금지어 검사(AC-11, AC-32, AC-33).
- 야식 카테고리 e2e 항목은 3.7.10. (야식 카테고리 반영)

### 9.2 `unit/lunch/` → `unit/meal/`

| 파일 | 변경 |
|---|---|
| `meal-menu.test.ts` | 기존 점심 고정값(48개, 10/8/8/8/6/8, 국물 15/33, 경계 메뉴)은 `MEAL_MENUS.lunch` 검사로 그대로 유지. 새로: 세 끼니 각각 카테고리 6개, 카테고리당 6개 이상, 합계 40~60, 끼니 안 이름·id 중복 없음, id 형식, `MEAL_MENU_COUNTS` 일치. 저녁·아침에 `MEAL_ALCOHOL_ASSOCIATED_MENU_NAMES` 없음. 저녁·아침 카테고리별 수와 국물 수는 D4 확정 값으로 고정 |
| `meal-copy.test.ts` | 운세: 끼니마다 6카테고리 × 4줄, 끼니당 24줄, 중복 없음, 다른 끼니 이름 없음, 메뉴 이름·국물·맛 언급 없음, 이름 바꿔치기 검사(끼니 안). 금지어: 5장 목록과 `술` 패턴을 고지·라벨·FAQ·SEO·끼니 라벨에 적용. FAQ 7개. 외부 링크 FAQ는 인덱스 `[3]` 대신 질문 문장으로 찾는다. 메뉴 그룹 검사는 `g.group === 'meal'`, 색 `text-menu-meal`(D2 B면 기존 값) |
| `meal-notice.test.ts` | import 경로와 상수 이름만. 고지 5문장 원문은 그대로 |
| `meal-pick.test.ts` (신규) | `carryOverMealCategories`: 점심 → 저녁 유지, 점심(한식 포함) → 아침 한식만, 점심(한식 없음) → 아침 전체, 0개 → 전체. `pickMealLuckLine`이 해당 끼니 목록에서만 고름. `filterMealMenus`, `pickMealMenu` 기존 동작 |

- 위 표의 "세 끼니 각각 카테고리 6개, 합계 40~60", "저녁·아침에 제외 메뉴 없음", "6카테고리 × 4줄, 24줄", `carryOverMealCategories`의 "전체" 기대값은 야식 카테고리 반영으로 바뀌었다. 바뀐 고정값과 범위는 3.7.10을 따른다. (야식 카테고리 반영)

## 보안

- 시크릿·환경변수: 새로 없음. `NEXT_PUBLIC_` 노출 없음.
- RLS: 해당 없음(DB 없음).
- 입력 검증: 사용자 입력이 라디오, 칩, 버튼뿐이다. 값은 상수 키 집합 안에서만 오가며 reducer가 모르는 값은 무시한다. 자유 입력이 없다.
- XSS: 화면 문구는 모두 상수이고 React가 이스케이프한다. JSON-LD는 기존 `JsonLdComponent`로 상수만 넣는다. 지도 링크는 고정 앞부분 + `encodeURIComponent(메뉴 이름)`(기존과 같음). 동네 이름을 적은 경우는 검사를 통과한 값이 `동네 + 한 칸 + 메뉴`로 붙는다(`docs/meal-location/design.md`, 2026-11-24).
- 리다이렉트: 목적지가 고정값이라 오픈 리다이렉트가 없다.
- API 남용·rate limit: API가 없어 해당 없음.
- 브라우저 저장소: 쓰지 않는다. 민감정보가 없다.
- 위치: 요청하지 않는다. 사이트 전체 `Permissions-Policy: geolocation=()` 유지. CSP는 바꾸지 않는다(지도 링크는 새 탭 이동이라 CSP 대상이 아니다).
- 외부 링크 속성 `target="_blank"`, `rel="noopener noreferrer nofollow"` 유지.
- 야식 카테고리로 보안 항목은 바뀌지 않는다. 칩 목록이 `MEAL_CATEGORIES[state.meal]`에서만 나오고 `TOGGLE_CATEGORY`가 그 칩 순서로 걸러 내므로, `lateNight`은 점심·아침 상태에 남지 않는다. (야식 카테고리 반영)

## 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 끼니별 메뉴 이름 목록 | 자체 작성 (일반 음식 명칭) | 자체 저작 | 가능. 목록 자체의 저작권 판단은 법률 확인 필요(리서치 7장), 위험 수용 |
| 운세 문구, 고지, FAQ, 소개 문구 | 자체 작성 | 자체 저작 | 가능. 이력 `docs/menu-meals/copy-log.md` |
| 상표 | 사용 안 함 (프랜차이즈 이름, 카페 이름 없음) | 해당 없음 | 해당 없음 |
| 카카오맵 검색 링크 | `map.kakao.com` 웹 검색 URL | API 미사용, 링크만 | 사용자 승인. 링크 이용 조건 공식 답변은 확인 필요(위험 수용) |
| 네이버지도 검색 링크 | `map.naver.com` 웹 검색 URL | API 미사용, 링크만 | 사용자 승인. 공식 문서 확인 필요(위험 수용) |
| 구글 지도 검색 링크 | Google Maps URLs (`api=1`, 키 불필요) | API 키 없음 | 사용자 승인. Maps Platform 약관 3.2.2 적용 여부 법률 확인 필요(위험 수용) |
| 아이콘 `Utensils` | lucide-react (기존) | ISC | 가능 |
| 돌림판 모션 | framer-motion (기존) | MIT | 가능 |
| OG 이미지 | 기존 생성 방식, 음식 사진 없음 | 자체 | 가능 |
| 광고 | 카카오 AdFit (기존) | AdFit 정책 | 주류 콘텐츠가 없도록 유지. 현재 운영정책 원문은 사용자 확인 필요(리서치 4.1) |
| 야식 메뉴 이름 12개 | 자체 작성 (일반 음식 명칭, 상표 없음) | 자체 저작 | 가능. 위 첫 줄과 같은 판단 (야식 카테고리 반영) |

- 개인정보: 처리하지 않는다. 끼니, 조건, 결과를 서버로 보내지 않고 저장하지 않는다. 방침 수집 항목 변경 없음.
- 제휴·대가: 없음. 배달, 예약, 가게 광고, 제휴 링크를 넣지 않는다. 넣으면 추천·보증 표시 의무가 생긴다(리서치 5.4).
- 식품 표시·광고: 메뉴 이름만 쓰고 건강·영양·맛 표현을 금지어로 막는다. 해당 여부는 법률 확인 필요(위험 수용).
- 음주: 술안주·야식 끼니 없음, 안주 연상 메뉴 제외, 음주 단어 금지. 저녁 끼니와 음주 시간대 판단은 사용자(M19).
- 음주 (보완): 끼니로서의 술안주·야식은 여전히 없다. 다만 저녁에 "야식" 카테고리가 생기고(기본 꺼짐) 안주 연상 메뉴를 빼지 않는다(사용자 결정). 음주 단어는 계속 금지한다. 야식 카테고리와 안주 연상 메뉴가 음주 연상으로 읽힐 위험, AdFit 주류 정책 해당 여부는 법률 확인 필요로 PM에게 올린다(3.7.9). (야식 카테고리 반영)

## 담당별 작업 순서

- db: 없음.
- backend: 없음. API와 서버 로직이 없다.
- frontend / qa / PM: 아래 순서. 화살표는 앞 작업이 끝나야 시작한다는 뜻이다.

| 순서 | ID | 담당 | 작업 | 의존 |
|---|---|---|---|---|
| 0 | P-0 | PM | 1.2 D1~D12 사용자 승인. D2 A면 design-system.md 색 표 변경 승인 | - |
| 0 | U | ui-ux-designer | 끼니 선택 UI, 문구 표(5.3 초안 확정), 모션 여부 | 이 설계 승인 |
| 1 | F-1 | frontend | 이름 이동만: `features/lunch/` → `features/meal/`, `today/` → `roulette/`, 파일·기호 이름 변경. 동작과 주소(`/lunch/today`) 그대로. `src/app/lunch/today/page.tsx`의 import만 고친다 | P-0(D1 B) |
| 2 | Q-1 | qa | 테스트 파일 이동(`unit/meal/`, `e2e/meal.spec.ts`)과 import·이름만 수정. PATH는 아직 `/lunch/today`. 기존 테스트 통과 확인 | F-1 |
| 3 | F-2 | frontend | 타입(3.1), 끼니·카테고리·끼니별 메뉴 상수(3.2~3.5), 운세 구조(4장), 금지어(5장), 고지·FAQ·SEO 상수, `copy-log.md` | Q-1, D3·D4 확정, 운세 샘플 검수(D8) |
| 4 | F-3 | frontend | `meal-pick.util.ts`(3.6), 훅 `SET_MEAL`(6.3), `meal-picker.component.tsx`, root·필터·결과·소개·noscript 연결 | F-2, U |
| 5 | F-4 | frontend | `src/app/meal/page.tsx` 생성, `src/app/lunch/` 삭제, `menu.constant.ts`, D2 A 파일들(`menu.type.ts`, `theme.constant.ts`, `globals.css`, `roulette.component.tsx`), `sitemap.ts` 제외 목록 | F-3 |
| 5 | PM-1 | PM | `next.config.ts` 301 항목(7.1). F-4와 같은 커밋·같은 배포 | F-4와 함께 |
| 3~5 병행 | F-5 | frontend | 약관·방침 문구와 시행일(8.1, 8.2) | P-0. F-2~F-4와 파일이 겹치지 않아 동시에 가능 |
| 3~5 병행 | PM-2 | PM | COMPLIANCE.md(8.3), design-system.md(D2 A) | P-0 |
| 6 | Q-2 | qa | 9장 테스트 갱신·추가. `e2e/meal.spec.ts` 데스크톱·모바일, `unit/meal/` 실행. 마지막에 전체 회귀 한 번 | F-4, PM-1, F-5 |
| 7 | PM-3 | PM | `pnpm typecheck`, `pnpm lint`, `pnpm build`. 보안·법적 문구·메타·JSON-LD·sitemap 확인 | Q-2 |
| 배포 후 | M16 | 사용자 | 사이트맵 재제출, 옛 주소 색인 확인 | 배포 |
| 보완 | P-Y, U-Y → F-Y → Q-Y, PM-Y | PM, ui-ux-designer, frontend, qa | 야식 카테고리 작업. 순서와 범위는 3.7.11 (야식 카테고리 반영) | 위 작업이 이미 끝난 현재 코드 기준 |

- frontend-dev는 `next.config.ts`, `COMPLIANCE.md`, `e2e/`, `unit/`, `docs/conventions/`를 고칠 수 없다(`guard-files.js` 범위). 그래서 PM-1, PM-2, Q-1, Q-2로 나눴다.
- F-1 직후에는 테스트 import가 깨져 `pnpm typecheck`가 실패한다(`tsconfig`가 `**/*.ts`를 포함). Q-1을 바로 이어서 실행하고, 그 사이에 다른 작업을 끼우지 않는다.
- D1 A를 고르면 F-1, Q-1을 생략하고 F-2부터 `features/lunch/` 안에서 진행한다. 이 경우 테스트 파일 이동은 Q-2에서 한다.

## 파일 충돌 위험

- `src/features/meal/**` (이동 후 전부): F-1 → F-2 → F-3 순서로만 고친다. 동시 실행 금지. 특히 `meal-notice.constant.ts`, `meal.type.ts`, 훅, root는 세 단계가 모두 건드린다.
- `unit/meal/**`, `e2e/meal.spec.ts`: Q-1과 Q-2만 고친다. F-2~F-4가 상수 이름을 더 바꾸면 Q-2에서 따라간다. F-1 이후에는 상수 이름을 바꾸지 않는 것을 원칙으로 한다.
- `src/constants/menu.constant.ts`: 최근 90일에 9번 바뀐 파일이다. F-4만 고치고, 같은 기간 다른 기능 브랜치가 메뉴를 고치면 병합 충돌이 난다. 다른 메뉴 작업과 시점을 맞춘다.
- `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`: 다른 기능도 자주 고친다. F-5 한 작업에서만 고치고 `EFFECTIVE_DATE`는 마지막에 배포일로 정한다.
- `src/types/menu.type.ts`, `src/constants/theme.constant.ts`, `src/app/globals.css`, `src/components/common/roulette.component.tsx`: 공용 파일이다(D2 A). F-4에서 한 번에 바꾸고, `MenuSectionKeyType`을 쓰는 레이아웃(`pc-menu`, `mobile-menu`, `coming-soon`, `content-wrapper`, `title-wrapper`)은 타입만 따라오면 되므로 고칠 필요가 없다. 같은 시기에 다른 기능이 새 섹션 키를 더하면 충돌한다.
- `next.config.ts`: PM만 고친다. `redirects()` 배열 끝에 추가하고 기존 3건은 건드리지 않는다.
- `src/app/sitemap.ts`: F-4만 고친다. 꿈 해몽 소재 경로 코드와 같은 함수라 꿈 해몽 작업과 겹치면 순서를 정한다.
- `COMPLIANCE.md`: PM만 고친다. 11장 다른 기능 항목과 같은 파일이라 다른 기능 문서 작업과 동시에 하지 않는다.
- `src/app/lunch/today/page.tsx`: F-1에서 import만 고치고 F-4에서 지운다. 그 사이 다른 작업이 이 파일을 고치지 않는다.
- 야식 카테고리: `meal.type.ts`, `meal-category.constant.ts`, `meal-menu-dinner.constant.ts`, `meal-menu.constant.ts`, `meal-luck.constant.ts`, `meal-copy-rule.constant.ts`, `meal-pick.util.ts`, 훅은 F-Y 한 작업, 한 커밋에서만 고친다. `unit/meal/**`, `e2e/meal.spec.ts`, `e2e/helpers/meal.util.ts`는 Q-Y만 고친다. `COMPLIANCE.md`는 PM-Y만, `docs/menu-meals/ui-ux-design.md`는 U-Y만 고친다. 지금 작업 트리에 커밋되지 않은 meal 변경이 많으므로, F-Y는 그 변경이 정리된 뒤 시작한다. (야식 카테고리 반영)

## plan.md 수정 필요 (야식 카테고리 반영)

아래 plan.md 항목은 야식 카테고리 결정과 어긋난다. 설계는 3.7 기준으로 진행하며, plan.md는 PM이 planner를 통해 고친다. 이 문서에서는 plan.md를 고치지 않았다.

| plan.md 위치 | 지금 문장 (요지) | 어긋나는 점 | 고칠 방향 |
|---|---|---|---|
| "범위 밖" 42행 | 야식 끼니는 하지 않는다 | 끼니로서는 여전히 맞다. 저녁 안 "야식" 카테고리가 생긴 점이 빠져 있다 | "야식 끼니는 없다. 저녁 안에 '야식' 카테고리를 두고 기본 꺼짐으로 한다(사용자 결정 2026-11-23)" 한 줄 추가 |
| 기능 F-2 54행 | 끼니마다 6개 카테고리 | 저녁은 7개 | 점심·아침 6개, 저녁 7개(야식 포함, 야식은 기본 꺼짐) |
| 기능 F-3 55행, 끼니 선택 방식 90행 | 기존 점심 조건을 끼니마다 같은 방식으로 적용. 끼니를 바꾸면 조건은 유지 | 저녁만 기본 꺼진 카테고리가 있고, 저녁에서 나가면 야식 선택은 사라진다 | "저녁의 야식 칩은 기본 꺼짐. 끼니를 바꾸면 겹치는 카테고리만 유지하고, 남는 것이 없으면 새 끼니 기본 선택" 추가 |
| US-5 72행 | 음주 관련 내용이 노출되지 않는다 | 안주 연상 메뉴 이름이 저녁에 나온다(야식을 켰을 때와 일부 기존 카테고리) | "음주 관련 단어가 노출되지 않는다"로 범위를 좁힌다 |
| 끼니별 메뉴 데이터 133~141행 | 저녁에서 안주 연상 메뉴를 뺀다. 족발, 보쌈, 곱창, 닭발 등은 저녁에 넣지 않는다 | 저녁은 안주 연상 메뉴를 빼지 않고 14개를 야식으로 옮긴다 | 3.7.3 기준으로 바꾼다 |
| 끼니별 목표 144행 | 끼니마다 6개 카테고리, 합계 40~60개 | 저녁 7개 카테고리, 92개(기본 후보 66개) | 점심·아침 40~60, 저녁 92(상한 예외) |
| 운세 금지어 158행 | 야식 금지 | 카테고리 라벨 "야식"과 충돌 | D13 결과대로: A면 "카테고리 라벨 자리만 예외", B면 목록에서 삭제 |
| 운세 문구 수 161행 | 끼니 3개 72줄 | 저녁 28줄, 전체 76줄 | 76줄 |
| AC-9 309행 | 끼니 3개 각각 카테고리 6개, 음주 관련 메뉴 없음 | 저녁 카테고리 7개. 저녁에 안주 연상 메뉴가 있다 | 점심·아침 6개, 저녁 7개. 안주 연상 메뉴 검사는 아침만. 음주 단어가 든 메뉴 이름은 모든 끼니에 없다 |
| AC-11 313행 | 화면 어디에도 "야식"이 없다. 고지 문구 예외는 없다 | 저녁 칩, 결과 카테고리 표시, 결과 알림에 "야식"이 나온다 | D13 A면 "저녁 카테고리 라벨 '야식'(칩, 결과 카테고리 표시, 결과 알림)은 예외"를 더한다. D13 B면 금지 단어 목록에서 "야식"을 뺀다 |
| AC 추가 필요 | 없음 | 야식 기본 꺼짐을 확인하는 완료 조건이 없다 | 예: "저녁을 고르면 야식 칩은 꺼져 있고 후보에 야식 메뉴가 없다. 야식 칩을 켜면 야식 메뉴가 후보에 들어간다" |
| AC-8, AC-12, AC-13 | 끼니는 셋, 라벨은 끼니별 | 어긋나지 않는다 | 변경 없음 |
