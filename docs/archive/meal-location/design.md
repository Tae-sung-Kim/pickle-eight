# 뭐 먹지 동네 이름 입력 지도 검색 설계서

입력: `docs/meal-location/plan.md` (승인 2026-11-24, 열린 질문 Q1~Q10 모두 권장안으로 확정)
참고: `docs/research/meal-location.md`, `docs/menu-meals/design.md`(지도 링크·검색어 부분, 1045·1049행)
규칙: `docs/conventions/tech-stack.md`, `code-style.md`, `data-storage.md`, `seo.md`

## 0. 확정 사항 요약

| 항목 | 확정 내용 (plan 기준) |
|---|---|
| Q1 입력 규칙 | 최대 20자. 한글 완성형(가~힣), 영문, 숫자, 공백, 가운뎃점(`·` U+00B7), 하이픈(`-`)만 허용. 쉼표 불가 |
| Q2 법적 판단 | "개인정보 수집 없음, 위치정보 아님"으로 기록하고 위험 수용. 상세 주소 안내 문구는 출시 조건 |
| Q3 오류 입력 | 오류 입력은 검색어에서 빼고 메뉴 이름만으로 링크를 연다. 룰렛 돌리기는 막지 않는다 |
| Q4 돌린 뒤 입력 변경 | 미리보기와 링크가 바로 바뀐다. 뽑힌 메뉴는 그대로 |
| Q5 지도 제공자 | 3개(카카오맵, 네이버지도, 구글 지도) 그대로. M11 판단을 바꾸지 않는다 |
| Q6 검색 노출 | 새 페이지·키워드 없음 |
| Q7 입력 유지 | 같은 화면에서 여러 번 돌려도 유지. 새로고침·이동 때 사라짐. 최근 동네 기록 없음 |
| Q8 단어 필터 | 문자 규칙만. 단어 목록 필터 없음 |
| Q9 고지 위치 | 입력란 아래 항상 보임 |
| Q10 좌표 방식 | 범위 밖 |

DB·API 변경 없음 확인 (근거는 3장, 4장).

## 1. 폴더 구조

새 라우트, 새 API, 새 라이브러리는 없다. 기존 `src/features/meal/` 안에서만 바꾼다.

```
src/features/meal/
  types/meal.type.ts                         # 수정: 입력 검사 결과 타입 2개 추가
  constants/
    meal-area.constant.ts                    # 신규: 입력 규칙 상수 (길이, 허용 문자 패턴, 입력란 상한)
    meal-notice.constant.ts                  # 수정: 입력란·오류·고지·미리보기 문구 추가, 외부 링크 안내 문장 수정
    meal-faq.constant.ts                     # 수정: "지도 링크를 누르면" 답 문장 수정 (9장 DQ1)
    meal-copy-rule.constant.ts               # 수정: 금지어 5개 추가
  utils/
    meal-area.util.ts                        # 신규: 입력 규칙 순수 함수 parseMealAreaInput
    meal-map-link.util.ts                    # 수정: 검색어 조합 함수 추가, buildMealMapLinks 인자 추가
  roulette/
    hooks/use-meal-area-input.hook.ts        # 신규: 입력란 표시값 + 확정값 상태, 조합(IME) 처리
    components/
      area-input.component.tsx               # 신규: 동네 이름 입력란, 지우기 버튼, 오류 안내, 상시 고지
      root.component.tsx                     # 수정: 훅 호출, 입력란 배치, 결과에 검사 결과 전달
      result.component.tsx                   # 수정: area prop 받아 map-links로 전달
      map-links.component.tsx                # 수정: area prop, 검색어 미리보기, 결과 짧은 고지

src/app/privacy/page.tsx                     # 수정: 1장 문단 추가, 6장 지도 문단, 시행일(DQ2)
src/app/terms/page.tsx                       # 수정: 9장 둘째 문단, 시행일(DQ2)

unit/meal/
  meal-area.test.ts                          # 신규: 입력 규칙 함수 (AC-4)
  meal-map-link.test.ts                      # 신규: 검색어 조합과 URL 조립
  meal-copy.test.ts                          # 수정: 새 금지어 확인, 지도 FAQ 답 기대 문장
  meal-notice.test.ts                        # 수정: 외부 링크 안내 원문 고정값

e2e/meal-location.spec.ts                    # 신규 (QA 담당). e2e/meal.spec.ts는 기존 검사 유지
```

이름 규칙: "동네"는 코드에서 `area`로 쓴다. 파일 `meal-area.*`, 함수 `parseMealAreaInput`, 훅 `useMealAreaInput`, 컴포넌트 `MealRouletteAreaInputComponent`.

## 2. 데이터 저장 위치

| 데이터 | 위치 | 이유 |
|---|---|---|
| 입력 규칙(최대 길이 20, 허용 문자 패턴, 입력란 상한 100) | 코드 상수 `meal-area.constant.ts` | 모두에게 같고 바뀌지 않는다 |
| 입력란 이름, 예시 문구, 오류 안내, 고지, 미리보기 라벨 | 코드 상수 `meal-notice.constant.ts` | 화면 문구는 이 파일에 모으는 기존 관행. `unit/meal/meal-copy.test.ts`의 `noticeStrings()`가 이 파일의 문자열 export를 자동으로 검사한다(AC-12) |
| 동네 입력값(표시값, 확정값) | React 상태(메모리)만. `useMealAreaInput` 안 `useState` 2개 | plan "입력은 저장하지 않는다". 새로고침·이동 시 사라져야 한다(AC-3). sessionStorage도 쓰지 않는다(data-storage.md의 "입력 중인 폼" 예와 달리, 기획이 복원을 금지함) |
| 입력 검사 결과, 조합한 검색어, 지도 링크 href | 저장 안 함. 렌더링 중 계산 | 값으로 계산되는 것은 상태로 두지 않는다(code-style) |

금지: localStorage, sessionStorage, IndexedDB, 쿠키, URL 쿼리·경로·hash, Supabase, 분석 이벤트, 콘솔 출력, 광고 스크립트 인자. 새 브라우저 저장 키 없음(AC-9).

## 3. API 계약

없음.

확인: `/meal`은 기존에도 API를 부르지 않는다. `src/app/api/` 아래 meal 관련 Route Handler가 없다(현재 csp-report, lotto, og-image만 있음). 이번 기능도 서버로 아무것도 보내지 않는다.

## 4. DB 스키마

없음.

확인: `supabase/migrations/`의 2개 파일은 meal과 관계없다. 새 테이블, 컬럼, RLS 변경 없음. 마이그레이션 없음.

## 5. 입력 규칙 함수 (확정)

### 5.1 위치와 시그니처

- 파일: `src/features/meal/utils/meal-area.util.ts`
- 순수 함수. 부작용 없음(저장, 로그, 전역 접근 없음). 같은 입력이면 항상 같은 결과.

```ts
// src/features/meal/types/meal.type.ts 에 추가
export type MealAreaInputErrorType = 'invalid_char' | 'too_long';

export type MealAreaInputResultType =
  | Readonly<{ status: 'empty' }>
  | Readonly<{ status: 'valid'; value: string }>
  | Readonly<{ status: 'invalid'; reason: MealAreaInputErrorType }>;

// src/features/meal/utils/meal-area.util.ts
export function parseMealAreaInput(raw: string): MealAreaInputResultType;
```

```ts
// src/features/meal/constants/meal-area.constant.ts
/** 정리한 뒤 허용하는 최대 글자 수 (plan Q1) */
export const MEAL_AREA_MAX_LENGTH = 20;
/** 입력란 maxLength. 20이 아니라 넉넉한 상한이다(21자 이상 오류 안내를 보이기 위해, AC-5) */
export const MEAL_AREA_INPUT_HARD_LIMIT = 100;
/** 허용 문자: 한글 완성형, 영문, 숫자, 공백(U+0020), 가운뎃점(U+00B7), 하이픈(U+002D) */
export const MEAL_AREA_ALLOWED_PATTERN = /^[가-힣A-Za-z0-9 ·-]+$/;
```

### 5.2 처리 순서 (이 순서를 바꾸지 않는다)

1. `raw.normalize('NFC')`: 맥 등에서 붙여 넣은 분해형 한글(NFD)을 완성형으로 합친다. NFKC는 쓰지 않는다(전각 문자를 바꾸는 등 범위가 넓다).
2. `replace(/\s+/g, ' ')` 후 `trim()`: 탭, 줄바꿈, NBSP, 전각 공백(U+3000)을 포함한 모든 공백 연속을 한 칸으로 줄이고 앞뒤를 지운다.
3. 결과가 빈 문자열이면 `{ status: 'empty' }`. 공백만 입력한 경우도 여기서 끝난다.
4. `MEAL_AREA_ALLOWED_PATTERN`에 맞지 않으면 `{ status: 'invalid', reason: 'invalid_char' }`.
   - 자음·모음 단독(ㄱ, ㅏ), 이모지, `/ : ? & # % < > " '`, 쉼표, 전각 영숫자, 폭 없는 공백(U+200B) 같은 숨은 문자, 제어 문자는 모두 여기서 거부된다.
   - 문자 검사를 길이 검사보다 먼저 한다. URL처럼 길고 허용되지 않는 입력에 "허용 문자" 안내가 나오게 하기 위해서다.
5. `Array.from(value).length > MEAL_AREA_MAX_LENGTH`면 `{ status: 'invalid', reason: 'too_long' }`. 길이는 2단계 정리 뒤 값 기준(공백 한 칸도 1자).
6. 그 밖은 `{ status: 'valid', value }`. `value`는 정리된 문자열.

허용하지만 막지 않는 경우(plan에 규칙 없음, 문자 규칙만 적용): `-`나 `·`만 있는 입력, 숫자만 있는 입력. 지도 검색어로만 쓰이고 저장·공개되지 않는다(Q8).

### 5.3 화면 쪽 사용 규칙

- 지도 링크와 미리보기는 `status === 'valid'`일 때만 `value`를 쓴다. 원래 입력 문자열(raw)을 링크에 넣는 경로를 만들지 않는다. 그래서 링크 함수는 문자열이 아니라 `MealAreaInputResultType`을 받는다(6장).
- 오류 안내는 `status === 'invalid'`일 때 `reason`에 맞는 문구를 보인다. `empty`면 아무것도 안 보인다.

## 6. 지도 링크 URL 조립 (확정)

`src/features/meal/utils/meal-map-link.util.ts`를 다음과 같이 바꾼다. 지도 URL 앞부분(`MEAL_MAP_PROVIDERS`, `MEAL_MAP_HOSTS`)은 바꾸지 않는다.

```ts
/** 메뉴 쪽 검색어. mapQuery가 없으면 name (기존 그대로) */
export function getMealMapQuery(menu: MealMenuType): string;

/** 지도로 넘길 전체 검색어. 동네가 valid면 "동네 + 한 칸 + 메뉴 검색어", 아니면 메뉴 검색어만 */
export function getMealMapSearchText(
  menu: MealMenuType,
  area: MealAreaInputResultType
): string;

/** 지도 서비스별 검색 링크. 고정 baseUrl 뒤에 encodeURIComponent(전체 검색어)만 붙인다 */
export function buildMealMapLinks(
  menu: MealMenuType,
  area: MealAreaInputResultType
): readonly MealMapLinkType[];
```

- `area` 인자는 필수다(기본값 없음). 호출처는 `map-links.component.tsx` 하나뿐이다(검색으로 확인).
- 조합: `` area.status === 'valid' ? `${area.value} ${getMealMapQuery(menu)}` : getMealMapQuery(menu) ``. 중복 제거 없음("강남역 짬뽕" + 짬뽕 → "강남역 짬뽕 짬뽕", plan 예외 절).
- 인코딩: 전체 검색어를 `encodeURIComponent` 한 번에 처리한다. 공백은 세 지도 모두 `%20`, 가운뎃점은 `%C2%B7`, 하이픈은 그대로.
- 결과 예 (`강남역` + `짬뽕`):
  - `https://map.kakao.com/link/search/%EA%B0%95%EB%82%A8%EC%97%AD%20%EC%A7%AC%EB%BD%95`
  - `https://map.naver.com/p/search/%EA%B0%95%EB%82%A8%EC%97%AD%20%EC%A7%AC%EB%BD%95`
  - `https://www.google.com/maps/search/?api=1&query=%EA%B0%95%EB%82%A8%EC%97%AD%20%EC%A7%AC%EB%BD%95`
- 바꾸지 않는 것: 호스트, 경로, 구글 `api=1`, 링크 속성(`target="_blank"`, `rel="noopener noreferrer nofollow"`), 새 쿼리 파라미터 없음, 좌표 없음, 앱 딥링크 없음.
- 기존 `e2e/meal.spec.ts` 212행 검사(`href`에 `encodeURIComponent(name)` 포함)는 입력이 있어도 통과한다. 글자 단위 인코딩이라 부분 문자열이 유지된다.
- 파일 머리 주석 "다른 말을 붙이지 않는다"는 "검사를 통과한 동네 이름만 앞에 붙인다"로 고친다.

## 7. 프론트 구조

### 7.1 페이지 (서버/클라이언트 구분)

- `src/app/meal/page.tsx`: 바꾸지 않는다. 서버 컴포넌트 그대로.
- 클라이언트 경계: 기존 `MealRouletteComponent`(`root.component.tsx`, `'use client'`) 하나 그대로. 새 컴포넌트는 그 안에서 렌더링되므로 `'use client'`를 따로 붙이지 않는다.

### 7.2 컴포넌트 트리

```
MealPage (서버, 변경 없음)
└ MealRouletteComponent (root, 'use client')        ← useMealRoulette() + useMealAreaInput()
  ├ MealRouletteMealPickerComponent                 (변경 없음)
  ├ MealRouletteFilterPanelComponent                (변경 없음)
  ├ MealRouletteAreaInputComponent  [신규]          ← value, error, onChange, onCompositionEnd, onClear
  │   ├ Label (`@/components/ui/label`)
  │   ├ Input (`@/components/ui/input`)
  │   ├ 지우기 Button (`@/components/ui/button`, 값이 있을 때만, F-7)
  │   ├ 오류 안내 <p id=errorId>  (invalid일 때만)
  │   └ 상시 고지 목록 <ul id=noticeId> (MEAL_AREA_NOTICE_LINES, 접지 않음)
  ├ MealRouletteSpinPanelComponent                  (변경 없음)
  ├ MealRouletteResultComponent                     ← area prop 추가
  │   └ MealRouletteMapLinksComponent               ← area prop 추가
  │       ├ 검색어 미리보기 (area valid일 때만, F-4)
  │       ├ 지도 링크 3개 (buildMealMapLinks(menu, area))
  │       ├ MEAL_EXTERNAL_LINK_NOTICE_TEXT (문장 수정)
  │       └ MEAL_AREA_RESULT_NOTICE_TEXT (area valid일 때만, DQ4)
  └ MealRouletteStatusComponent                     (변경 없음. 결과 알림 문장에 동네를 넣지 않는다)
```

- DOM 순서: 입력란은 필터 패널 다음, 돌림판·뽑기 버튼 앞에 둔다. 탭 순서가 "끼니 → 카테고리 → 국물 → (국물 조건 없애기) → 동네 입력란 → (지우기) → 룰렛 돌리기 → 지도 링크"가 된다(AC-6). 정확한 배치와 간격은 ui-ux-design.md에서 정한다.
- 미리보기 위치: 결과 카드 안, 지도 링크 바로 위. 링크와 미리보기가 같은 `getMealMapSearchText` 결과를 쓰게 하려고 `map-links.component.tsx` 안에 둔다(미리보기와 실제 href가 어긋나지 않게).

### 7.3 props 계약 (확정)

```ts
// area-input.component.tsx
export type MealRouletteAreaInputComponentPropsType = Readonly<{
  /** 입력란 표시값 (조합 중 글자 포함) */
  value: string;
  /** 확정값 검사 오류. 없으면 null */
  error: MealAreaInputErrorType | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => void;
  onClear: () => void;
}>;

// result.component.tsx: 기존 props에 추가
area: MealAreaInputResultType;

// map-links.component.tsx: 기존 props에 추가
area: MealAreaInputResultType;
```

### 7.4 상태 위치와 한글 조합 처리

- 훅: `src/features/meal/roulette/hooks/use-meal-area-input.hook.ts` (`useMealAreaInput`). root에서 호출한다.
- 기존 `useMealRoulette` 리듀서에는 넣지 않는다. 입력은 끼니 변경(`SET_MEAL`), 필터 변경, 뽑기와 상관없이 유지되어야 해서(Q7, AC-2) 따로 두는 것이 단순하고, 기존 리듀서·테스트를 건드리지 않는다.

```ts
export function useMealAreaInput(): Readonly<{
  inputValue: string;                 // 입력란 표시값
  area: MealAreaInputResultType;      // parseMealAreaInput(committedValue), 렌더링 중 계산
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => void;
  clear: () => void;
}>;
```

- 상태 2개: `inputValue`(입력란 표시용), `committedValue`(검사·미리보기·링크용). `committedValue`는 이벤트 시점에 따라 정해지므로 계산 값이 아니라 상태다.
- `handleChange`: 항상 `inputValue`를 바꾼다. `event.nativeEvent.isComposing`이 false일 때만 `committedValue`도 바꾼다.
- `handleCompositionEnd`: `event.currentTarget.value`로 `committedValue`를 바꾼다. 브라우저마다 compositionend와 마지막 input 이벤트 순서가 달라서 둘 다 처리한다.
- 결과: 조합 중(자음만 있는 상태 등)에는 미리보기, 링크, 오류 안내가 바뀌지 않고 글자가 확정된 뒤 반영된다(plan 예외 절). 조합이 끝나지 않은 채 다른 곳을 누르면 blur로 조합이 끝나며 반영된다.
- `clear`: 두 값을 모두 `''`로. 지우기 버튼을 누른 뒤 입력란으로 포커스를 돌리는 것은 `area-input.component.tsx` 안의 ref로 처리한다(상태 아님).
- 회전 중에도 입력란은 잠그지 않는다. 회전 중에는 결과 카드가 없어 링크·미리보기가 보이지 않으므로 어긋남이 없다.

### 7.5 입력란 속성 (확정)

| 속성 | 값 | 이유 |
|---|---|---|
| 요소 | `<input type="text">` (shadcn `Input`) | `type="search"`는 브라우저별 지우기 버튼·기록 동작이 달라 쓰지 않는다 |
| `<form>` | 감싸지 않는다 | Enter로 GET 제출되면 입력값이 이 사이트 URL에 붙는다(AC-3, AC-9). Enter는 아무 동작도 하지 않는다 |
| `name` | 넣지 않는다 | 브라우저 자동완성 기록 대상이 되지 않게 |
| `autoComplete` | `"off"` | 최근 입력 기억 금지(Q7) |
| `spellCheck` | `false` | 일부 브라우저의 클라우드 맞춤법 검사로 입력이 외부로 나가지 않게 |
| `autoCorrect`, `autoCapitalize` | `"off"` | 영문 지명 자동 변경 방지 |
| `enterKeyHint` | `"done"` | 모바일 키보드에 "검색/이동" 대신 완료 표시 |
| `maxLength` | `MEAL_AREA_INPUT_HARD_LIMIT`(100) | 20으로 두면 21자 이상 오류 안내를 볼 수 없다(AC-5). 큰 붙여넣기만 막는다 |
| `id` | `useId()` | Label 연결 |
| `aria-invalid` | `error !== null` | 오류 상태 전달 |
| `aria-describedby` | 오류 안내 id(있을 때) + 고지 id | 입력란 근처 고지를 읽게 |
| `placeholder` | `MEAL_AREA_INPUT_PLACEHOLDER` | F-8. 라벨을 대신하지 않는다 |

- 오류 안내를 스크린 리더에 바로 알릴지(`aria-live`)는 ui-ux-design.md에서 정한다. 결과 알림(`MealRouletteStatusComponent`)과 겹치지 않게 한다.

### 7.6 문구 상수 (이름 확정, 문장은 초안)

`meal-notice.constant.ts`에 "// --- 동네 입력 ---" 절로 추가한다. 문장은 ui-ux-design.md에서 확정하되, 아래 금지 조건을 지킨다.

- 금지 조건: `MEAL_FORBIDDEN_TERMS` 전부(특히 "보장", "추천", "맛집")와 새 금지어 "주변", "근처", "현재 위치", "내 위치", "GPS"를 쓰지 않는다. 새 문장은 허용 문장 목록(`MEAL_COPY_ALLOWED_SENTENCES`, 5문장 고정)에 넣지 않는다. 그래서 plan 고지 6번의 "주변인지는 보장하지 않으며"는 아래처럼 바꿔 쓴다.

| 상수 | 초안 | plan 고지 요소 |
|---|---|---|
| `MEAL_AREA_INPUT_LABEL` | 동네 이름 (선택) | F-1 |
| `MEAL_AREA_INPUT_PLACEHOLDER` | 예: 강남역, 역삼동 | F-8 |
| `MEAL_AREA_CLEAR_BUTTON_LABEL` | 동네 이름 지우기 | F-7 (aria-label) |
| `MEAL_AREA_ERROR_TEXT.invalidChar` | 한글, 영문, 숫자, 띄어쓰기, 가운뎃점(·), 하이픈(-)만 쓸 수 있습니다. 이 입력은 검색어에 넣지 않습니다. | Q3 |
| `MEAL_AREA_ERROR_TEXT.tooLong` | `` `동네 이름은 ${MEAL_AREA_MAX_LENGTH}자까지 적을 수 있습니다. 이 입력은 검색어에 넣지 않습니다.` `` | Q3 |
| `MEAL_AREA_NOTICE_LINES` (배열) | 1) 동네 이름은 적지 않아도 됩니다. 적으면 뽑힌 메뉴 이름과 함께 지도 검색어로 쓰입니다. 2) 적은 내용은 이 화면에만 있고 서버로 보내거나 저장하지 않으며, 새로고침하면 사라집니다. 3) 지도 링크를 누르면 검색어(동네 이름과 메뉴 이름)가 해당 지도 사이트로 전달되고, 그 뒤에는 그 사이트의 약관과 개인정보처리방침이 적용됩니다. 4) 상세 주소, 건물 번호, 전화번호 같은 개인 정보는 적지 마세요. 5) 위치 권한은 요청하지 않습니다. 지도 결과가 적은 동네 안의 가게인지는 확인하지 않으며, 결과는 지도 사이트가 정합니다. | 1~6 |
| `MEAL_AREA_PREVIEW_LABEL` | 지도 검색어 | F-4 |
| `MEAL_AREA_RESULT_NOTICE_TEXT` | 적은 동네 이름은 저장하지 않으며, 지도 링크를 누를 때만 검색어로 해당 지도 사이트에 전달됩니다. | 3, 4 (결과 화면) |
| `MEAL_EXTERNAL_LINK_NOTICE_TEXT` (수정, 허용 문장) | 지도 검색 페이지는 카카오·네이버·구글이 각각 운영하는 외부 사이트이며 새 탭에서 열립니다. 이동 후에는 해당 사이트의 정책이 적용되고, 검색어로는 뽑힌 메뉴 이름과 적은 경우 동네 이름만 전달됩니다. 검색 결과와 영업 정보는 해당 서비스 기준입니다. | 4, 7 |

- `MEAL_AREA_ERROR_TEXT`는 `{ invalidChar, tooLong }` 객체로 둔다. `reason` 값(`'invalid_char' | 'too_long'`)과의 대응은 컴포넌트에서 한 줄로 고른다.
- 고지 7번(오락 목적, 무작위, 추천 아님, 제휴 없음, 식당 정보 보장 없음)은 기존 고지 5문장이 그대로 맡는다.
- `MEAL_FAQ` "지도 링크를 누르면 어디로 이동하나요?" 답 수정 초안(DQ1): "카카오맵, 네이버지도 또는 구글 지도의 검색 페이지가 새 탭에서 열립니다. 구글 지도는 구글이 운영하는 외부 사이트입니다. 검색어로는 뽑힌 메뉴 이름과, 동네 이름을 적은 경우 그 동네 이름만 전달되며, 이동 후에는 해당 서비스의 정책이 적용됩니다."
- `MEAL_FAQ` 첫 답의 "로그인이나 입력 없이 이용하실 수 있습니다."는 입력이 선택이라 사실과 맞으므로 그대로 둔다.
- 새 문구는 `docs/meal-location/copy-log.md`에 기존 관행(`docs/menu-meals/copy-log.md`)대로 기록한다.

### 7.7 금지어 추가

`meal-copy-rule.constant.ts`의 `MEAL_FORBIDDEN_TERMS`에 "주변", "근처", "현재 위치", "내 위치", "GPS"를 한 묶음(주석: "위치 검색처럼 읽히는 표현, meal-location")으로 추가한다. 현재 `src/features/meal/` 문자열 상수와 `MENU_LIST`의 meal 항목에는 이 단어가 없다(검색 확인, `meal-seo.constant.ts`의 주석 한 줄만 있음. 주석은 검사 대상 아님). 기존 "근처에서 찾기"는 그대로 둔다.

## SEO

| URL | title | description | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/meal` (기존) | 변경 없음 | 변경 없음 | 종류 변경 없음(BreadcrumbList, FAQPage). FAQPage의 지도 답 문장 1개만 바뀜(DQ1) | 변경 없음 (`MENU_LIST` 그대로) |

- 서버/클라이언트: 입력란, 고지, 미리보기는 클라이언트 경계 안에서 그린다. 검색 노출 대상이 아니다. 서버 HTML에 들어가는 본문(소개, FAQ, 상시 고지)은 그대로다.
- 키워드 추가 금지: "주변 음식점", "근처 맛집", "동네 맛집", "식당 찾기"(plan 검색 노출 절). `MEAL_HUB_SEO`를 건드리지 않는다.
- 새 페이지, 리다이렉트, canonical 변경 없음.

## 보안

- RLS: 해당 없음(DB 변경 없음).
- 시크릿·환경변수: 없음. 새 `NEXT_PUBLIC_` 값 없음. 지도 API 키 없음.
- 입력 검증: 5장 규칙을 클라이언트 순수 함수로 적용한다. 서버로 가지 않으므로 서버 검증은 없다. 검증을 통과한 값만 검색어에 쓰고, 그 위에 `encodeURIComponent`를 한 번 더 적용한다(허용 문자에 `/ ? # & %`가 없지만 인코딩은 그대로 둔다).
- XSS: 미리보기와 오류 안내는 React 텍스트 노드로만 그린다. `dangerouslySetInnerHTML` 금지. 입력값을 `href`의 스킴·호스트 자리에 넣지 않는다(고정 `baseUrl` 뒤에만 붙음). 입력값을 JSON-LD, 메타데이터, `title`에 넣지 않는다.
- URL·기록: 이 사이트 URL(쿼리, 경로, hash)을 바꾸지 않는다. `router.push`, `useSearchParams`, `history.*`를 쓰지 않는다. `<form>` 없음(7.5). 지도 링크는 `noreferrer`라 이 사이트 주소가 지도 사이트로 가지 않는다. 지도 사이트 URL(검색어 포함)은 이용자의 브라우저 기록에 남을 수 있으며, 이는 이용자가 직접 연 외부 페이지다.
- 저장소·로그: 새 저장 키 없음. `console.*` 없음. 분석 이벤트(`track` 등) 없음. Vercel Web Analytics는 페이지 경로만 기록하며 경로가 바뀌지 않으므로 입력이 들어가지 않는다.
- 광고 스크립트: 입력값을 광고 컴포넌트(`AdFitSlotComponent`, 레이아웃의 고정 슬롯)나 광고 스크립트 인자로 넘기지 않는다. 남는 위험: 같은 페이지에서 실행되는 외부 스크립트는 기술적으로 DOM을 읽을 수 있다. 서비스가 넘기지 않는다는 것까지만 보장하며, 이 점을 COMPLIANCE.md 위험 수용 항목에 적는다.
- 위치: Geolocation API 호출 없음. `next.config.ts` 131행 `Permissions-Policy: geolocation=()` 그대로(AC-10). CSP 변경 없음.
- API 남용: 서버 호출이 없어 rate limit 대상 없음.
- 민감정보: 상세 주소·전화번호를 기술적으로 막을 수 없으므로(숫자 허용) 고지 4)로 안내한다(Q2 출시 조건).

## 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 새 라이브러리 | 없음 | - | - |
| UI 요소 | 기존 shadcn `Input`, `Label`, `Button` | 기존 등록(MIT) | 가능. `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md` 변경 없음 |
| 아이콘(지우기 버튼에 쓸 경우) | 기존 `lucide-react` | 기존 등록(ISC) | 가능 |
| 카카오맵·네이버지도·구글 지도 검색 링크 | 기존과 같은 웹 검색 URL | API 미사용, 링크만 | 기존 M11·Q17 위험 수용 그대로. 검색어에 이용자 입력이 앞에 붙어도 URL 형식은 같다. 지도 사업자 약관상 문제 여부는 법률 확인 필요(기존 위험 수용 항목에 포함) |
| 문구 | 이 서비스가 직접 작성 | - | 가능 |

- 개인정보 처리: 서비스는 입력값을 수집·저장·전송하지 않는다. 이용자가 링크를 누르면 지도 사업자에게 검색어로 전달된다(외부 사이트 연결, 처리위탁 아님). 동네 이름의 개인정보 해당 여부와 위치정보법 적용 여부는 **법률 확인 필요**. plan Q2에 따라 확인 전까지 위험 수용으로 기록한다.
- 지역 광고, 지역 제휴 링크, 동네별 통계 없음(plan 상업적 이용 절).
- AdFit 정책 원문 확인은 기존 점검 항목과 같이 출시 전 확인.

## 갱신할 문서

| 문서 | 위치 | 바꿀 내용 | 담당 |
|---|---|---|---|
| `COMPLIANCE.md` | 14행 (Meal 요약) | "No input is collected" → 선택 입력인 동네 이름 필드가 있고 React 상태에만 있다는 문장. "with the menu name as the only query" → "with the menu name, optionally prefixed by a neighborhood name the user typed, as the query". "no location permission is requested" 유지 | PM (문서) |
| `COMPLIANCE.md` | 160행 | "The query is the menu name only, no location, no user data." → 검색어는 메뉴 이름, 이용자가 적은 동네 이름이 있으면 그 앞에 붙는다. 좌표·식별자 없음. 허용 문자·길이 규칙과 상세 주소 안내 고지를 적는다 | PM |
| `COMPLIANCE.md` | 161행 | "No input is collected." → 동네 이름 입력은 선택이고 React 상태에만 있으며 서버·저장소·URL·분석·콘솔·광고 인자로 가지 않는다. "no location permission is requested"와 `geolocation=()` 문장 유지 | PM |
| `COMPLIANCE.md` | 164행 (위험 수용) | 추가 항목: 이용자가 적은 지명의 개인정보 해당 여부, 위치정보법 적용 여부(단말 위치 아님), 이용자 입력이 붙은 검색 링크의 지도 약관 적합성, 같은 페이지 외부 광고 스크립트의 DOM 접근 가능성. 결정일 기록 | PM |
| `src/app/privacy/page.tsx` | 1장 (88~97행 타로·운세 문단 뒤) | 새 문단 추가 초안: "뭐 먹지에서 적은 동네 이름은 서버로 전송하거나 저장하지 않으며, 이용자의 브라우저 메모리에서만 사용합니다. 지도 검색 링크를 누를 때만 검색어로 해당 지도 사업자에게 전달되며, 페이지를 벗어나거나 새로고침하면 사라집니다." (타로·운세 문단과 같은 형식) | frontend-dev |
| `src/app/privacy/page.tsx` | 6장 지도 문단 (212~218행) | "이때 검색어로 뽑힌 메뉴 이름만 전달됩니다" → "이때 검색어로 뽑힌 메뉴 이름과, 이용자가 동네 이름을 적은 경우 그 동네 이름이 전달됩니다". "고른 끼니와 조건, 뽑힌 결과를" → "고른 끼니와 조건, 적은 동네 이름, 뽑힌 결과를". "위치 정보를 요청하지 않으며" 유지. 끝에 "동네 이름 입력란에는 상세 주소나 전화번호 같은 개인정보를 적지 않도록 안내합니다." 추가 | frontend-dev |
| `src/app/terms/page.tsx` | 9장 둘째 문단 (219~227행) | 같은 "메뉴 이름만" 문장을 위와 같이 바꾼다. "고른 끼니와 조건, 적은 동네 이름, 뽑힌 결과를 서버로 전송하거나 저장하지 않습니다". "위치 정보를 요청하지 않으며" 유지. 추가 문장 초안: "지도 검색 결과가 이용자가 적은 동네의 음식점인지는 해당 지도 서비스가 정하며, 본 서비스는 이를 확인하지 않습니다." | frontend-dev |
| 방침·약관 시행일 | 각 `EFFECTIVE_DATE` | DQ2 결과대로 | frontend-dev |
| `docs/menu-meals/plan.md` | F-6 (62행), AC-19 (368행) | 문장 끝에 "동네 이름을 적은 경우는 `docs/meal-location/plan.md` AC-1·AC-2가 대체(2026-11-24)"를 붙인다. 본문은 지우지 않는다 | PM |
| `docs/menu-meals/design.md` | 1045행 (XSS), 1049행 (위치) | 1045행: "`encodeURIComponent(메뉴 이름)`" → "`encodeURIComponent(검사 통과한 동네 이름 + 한 칸 + 메뉴 이름)`, 상세는 `docs/meal-location/design.md` 6장". 1049행은 그대로(위치 요청 없음 유지) | PM |
| `docs/meal-location/copy-log.md` | 신규 | 7.6 문구 작성 기록 | frontend-dev 또는 ui-ux-designer (dev-lead가 지정) |
| `README.md`, `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md` | - | 변경 없음 (새 환경변수·API·테이블·라이브러리 없음) | - |

## 테스트 범위

### 단위 (vitest)

`unit/meal/meal-area.test.ts` (신규, AC-4)
- empty: `''`, `'   '`, `'\t\n'`, 전각 공백만(`'　'`), NBSP만.
- 정리: `' 강남역 '` → `'강남역'`, `'2호선   강남역'` → `'2호선 강남역'`, 탭·줄바꿈이 섞인 입력 → 한 칸.
- valid: `'강남역'`, `'역삼동'`, `'Gangnam'`, `'역삼1동'`, `'을지로3가'`, `'종로·광화문'`, `'서울-강남'`.
- 길이: 정리 뒤 20자 valid, 21자 `too_long`. 연속 공백이 한 칸으로 줄어 20자가 되는 입력은 valid.
- invalid_char: `'https://a'`, `'a/b'`, `'a:b'`, `'a?b'`, `'a&b'`, `'<b>'`, `'강남역😀'`, `'강남,역삼'`, `'ㄱ'`, `'ㅏ'`, `'강남역!'`, `'#'`, `'%'`, `'"'`, `"'"`, 전각 `'Ａ'`, 폭 없는 공백 `'강​남'`, `'ㆍ'`(U+318D, DQ3 A안 기준).
- 순서: 21자 이상이면서 허용되지 않는 문자가 있으면 `invalid_char`.
- NFC: `'강남역'.normalize('NFD')` → valid `'강남역'`.
- 순수성: 같은 입력을 두 번 넣으면 결과가 같다(`toEqual`).

`unit/meal/meal-map-link.test.ts` (신규)
- empty·invalid: 링크 3개, 각 href가 `MEAL_MAP_PROVIDERS[i].baseUrl + encodeURIComponent(name)`과 정확히 같다.
- valid `'강남역'`: `getMealMapSearchText` → `'강남역 짬뽕'`, href는 `baseUrl + encodeURIComponent('강남역 짬뽕')`, `%20` 포함.
- `mapQuery`가 있는 메뉴(테스트용 객체): `'동네 ' + mapQuery`.
- 중복 제거 없음: `'강남역 짬뽕'` + 짬뽕 → `'강남역 짬뽕 짬뽕'`.
- URL 형태 유지: `new URL(href).host`가 `MEAL_MAP_HOSTS` 값 중 하나, 구글은 `searchParams` 키가 `api`, `query` 두 개뿐, 카카오·네이버는 `searchParams`가 비어 있음.

기존 단위 테스트 수정
- `unit/meal/meal-notice.test.ts`: `EXTERNAL` 고정값을 7.6의 확정 문장으로 바꾼다. 허용 문장 5개 검사는 그대로.
- `unit/meal/meal-copy.test.ts`: 321행 근처 `'뽑힌 메뉴 이름만 전달'` 기대를 새 FAQ 답 기준(`'뽑힌 메뉴 이름과'`, `'동네 이름'` 포함)으로 바꾼다. 금지어 목록에 새 5개가 들어 있는지 확인하는 검사를 추가한다. 새 문구는 `noticeStrings()`가 자동으로 검사한다(AC-12).

### E2E (QA 담당, 참고)

- 새 spec `e2e/meal-location.spec.ts`: AC-1, 2, 3, 5, 6, 7, 8. `e2e/helpers/meal.util.ts`의 `mapLinks`, `stubMaps`, `watchGeolocation`, `countGeolocation` 재사용.
- AC-8: `page.on('request')`로 이 사이트 도메인 요청의 URL과 본문에 입력 문자열(인코딩 전·후 모두)이 없는지, `localStorage`·`sessionStorage`·`document.cookie`에 없는지 확인.
- 한글 조합: Playwright `fill`은 조합 이벤트를 내지 않는다. 조합 중 동작은 수동 확인 항목으로 둔다(`keyboard.insertText`로는 재현 불가).
- `e2e/meal.spec.ts` 기존 AC-17~19, 21, 22, 25, 26 검사는 입력 없이 그대로 통과해야 한다(회귀).

### 정적 (QA·PM 확인)

- AC-9: 새·수정 파일에서 `localStorage|sessionStorage|indexedDB|document.cookie|console\.|track\(|router\.|useSearchParams|history\.|dangerouslySetInnerHTML|<form` 검색 결과 없음. 입력값이 광고 컴포넌트 props로 가지 않음.
- AC-10: `next.config.ts`의 `geolocation=()` 그대로, `navigator.geolocation` 호출 없음.
- AC-11: 갱신할 문서 표대로 바뀌었는지.

## 담당별 작업 순서

- db: 없음
- backend: 없음
- frontend:
  1. FE-1 타입·규칙: `meal.type.ts` 타입 2개, `meal-area.constant.ts`, `meal-area.util.ts`, `meal-map-link.util.ts` 변경. (선행 없음)
  2. FE-2 문구: `meal-notice.constant.ts`(새 문구, 외부 링크 안내 수정), `meal-faq.constant.ts`(DQ1), `meal-copy-rule.constant.ts`(금지어), 같은 티켓에서 `unit/meal/meal-notice.test.ts`, `unit/meal/meal-copy.test.ts` 기대값 수정(그래야 테스트가 깨진 채 남지 않음). FE-1의 `MEAL_AREA_MAX_LENGTH`에 의존. ui-ux-design.md 문구 확정 뒤.
  3. FE-3 화면: `use-meal-area-input.hook.ts`, `area-input.component.tsx`, `root.component.tsx`, `result.component.tsx`, `map-links.component.tsx`. FE-1, FE-2 뒤. ui-ux-design.md 기준.
  4. FE-4 법적 문구: `privacy/page.tsx`, `terms/page.tsx`, 시행일(DQ2). FE-2와 파일이 겹치지 않아 병렬 가능. 단, 아래 충돌 위험 1번 해소 뒤.
  5. 문서: COMPLIANCE.md, `docs/menu-meals/plan.md`·`design.md` 표현 갱신은 PM. `copy-log.md`는 dev-lead가 지정.
- qa: 단위 신규 2개(`meal-area.test.ts`, `meal-map-link.test.ts`)는 FE-1 직후 작성 가능. E2E는 FE-3, FE-4 뒤.

## 파일 충돌 위험

- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `COMPLIANCE.md`: 지금 작업 트리에 궁합(compatibility) 기능 변경이 커밋되지 않은 채 올라가 있다(git status M). 같은 파일, 특히 `EFFECTIVE_DATE`를 같이 건드린다. compatibility가 커밋된 뒤 FE-4와 COMPLIANCE 갱신을 시작한다.
- `src/features/meal/constants/meal-notice.constant.ts`: 새 문구와 외부 링크 안내 수정이 한 파일이다. FE-2 한 티켓으로 묶는다.
- `src/features/meal/types/meal.type.ts`, `meal-map-link.util.ts`: FE-1에서 먼저 끝내야 FE-3이 컴파일된다.
- `root.component.tsx`, `result.component.tsx`, `map-links.component.tsx`: props 연결이 이어져 있어 FE-3 한 티켓으로 순서대로 고친다.
- `unit/meal/meal-copy.test.ts`, `unit/meal/meal-notice.test.ts`: FE-2와 같은 티켓에서 고친다. QA가 동시에 이 파일을 고치지 않는다(QA는 새 파일만).
- `e2e/meal.spec.ts`: 고치지 않는다(기존 검사 유지). 새 검사는 `e2e/meal-location.spec.ts`에만.
- `docs/meal-location/status.md`: 커밋되지 않은 변경이 있다. PM만 고친다.

## PM 확인 요청

- DQ1. FAQ 지도 답 문장 수정 (plan "JSON-LD는 바꾸지 않는다"와의 관계)
  - 지금 답 "검색어로는 뽑힌 메뉴 이름만 전달되며"는 기능이 들어가면 사실과 다르다. 이 답은 FAQPage JSON-LD에도 같은 배열로 들어간다.
  - A(권장): 답 문장만 7.6 초안으로 고친다. JSON-LD 종류·구조·질문 수(7개)는 그대로다. 장점: 고지와 FAQ가 맞는다. 단점: 검색엔진에 노출되는 FAQ 답 한 개가 바뀐다.
  - B: FAQ를 그대로 둔다. 장점: 검색 노출 문구 변화 없음. 단점: 화면과 JSON-LD에 틀린 안내가 남고, 방침·약관과 어긋난다.
- DQ2. 방침·약관 시행일
  - A(권장): 두 페이지 `EFFECTIVE_DATE`를 배포일로 바꾼다(menu-meals D12·M17과 같은 방식). compatibility 변경과 같은 날 배포하면 날짜 하나로 맞춘다. 단점: 시행일 변경 시 이전 약관 고지 필요 여부는 법률 확인 필요(기존 위험 수용).
  - B: 시행일을 그대로 둔다. 장점: 작업이 작다. 단점: 문장이 바뀌었는데 날짜가 같아 변경 시점을 알 수 없다.
- DQ3. 비슷한 모양의 가운뎃점·하이픈 (`ㆍ` U+318D, `・` U+30FB, `‧` U+2027, `–` `—` 등)
  - A(권장): plan 그대로 `·`(U+00B7)와 `-`(U+002D)만 허용하고 나머지는 `invalid_char`로 안내한다. 장점: 규칙이 단순하고 기획과 같다. 단점: 일부 모바일 키보드로 친 `ㆍ`가 오류가 된다(오류 안내에 허용 문자를 보이므로 고칠 수 있음).
  - B: 정리 단계에서 비슷한 문자를 `·`, `-`로 바꾼다. 장점: 이용자 편의. 단점: 기획에 없는 변환 규칙이 늘고 테스트가 커진다.
- DQ4. 결과 화면 짧은 고지(`MEAL_AREA_RESULT_NOTICE_TEXT`) 표시 조건
  - A(권장): 동네 이름이 검색어에 들어갈 때(valid)만 보인다. 입력이 없으면 해당 내용이 없으므로 결과 카드가 길어지지 않는다. 외부 전달 고지(4번)는 수정된 `MEAL_EXTERNAL_LINK_NOTICE_TEXT`가 항상 맡는다.
  - B: 항상 보인다. 장점: plan "결과 화면의 짧은 고지에도 나온다"를 글자 그대로 따른다. 단점: 입력하지 않은 이용자에게도 입력 관련 문장이 보인다.
  - ui-ux-design.md 단계에서 화면 배치와 함께 정해도 된다.
