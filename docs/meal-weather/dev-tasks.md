# 뭐 먹지 날씨 반영 개발 티켓

작성일: 2026-11-28. 상태: 승인 대기.
입력: `docs/meal-weather/design.md`(승인, DQ1~DQ4 권장안 A), `docs/meal-weather/ui-ux-design.md`(승인, UW-1~5 확정), `docs/meal-weather/plan.md`(승인), `docs/meal-weather/status.md` 결정 기록.
DB 작업: 없음 (design.md "DB 스키마"). 그래서 db-dev 티켓은 만들지 않았다.
티켓 종류: FE(frontend-dev), BE(backend-dev), DOC(문서). 보류(H)는 개발 전 사용자나 PM 승인이 필요한 항목이다.
frontend-dev 티켓은 모두 design.md와 ui-ux-design.md를 둘 다 기준으로 한다.

## 티켓

| ID | 담당 | 내용 | 선행 작업 | 관련 파일 | 디자인 명세 참조 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| FE-0 | frontend-dev | 공통 타입과 상수: 날씨 타입 추가, 임계값·강수 코드 묶음·가중치·캐시 시간·발표 시각 상수 | 없음 | `src/features/meal/types/meal.type.ts` (수정), `src/features/meal/constants/meal-weather.constant.ts` (신규) | 없음 (design.md "타입", "데이터 저장 위치") | tsc 통과. 기존 `MealMenuType` 불변. 숫자 임계값 28·5, 강수 코드 묶음, 가중치 3, TTL 1시간, 발표 시각 02:20·45분이 이 파일에만 있다 | 대기 |
| H-2 | backend-dev | 기상청 공식 자료 대조: 시·도 현행 행정구역, 지역별 대표 지점의 격자 nx·ny, 발표 시각 관례(02:15, 40분), 강수 코드 4(소나기) 정의 | 공식 격자 자료와 기상청 항목 정의를 열어 볼 수 있어야 한다. 못 하면 값을 넣지 않고 PM에게 보고 | `docs/meal-weather/grid-check.md` (신규) | 없음 (design.md "시·도 격자 상수 구조", plan "확인 필요 사실") | 지역별 대표 지점, 행정구역 코드, nx, ny, 자료 이름·버전, 확인 날짜, 발표 시각·코드 4 확인 결과를 기록. 확인 못 한 값은 기록하지 않고 보고한다 | 보류 |
| BE-2 | backend-dev | 분류·변환·발표 시각 순수 함수: 발표 시각 계산, 예보·실황 변환, 분류. `isMealWeatherRegionKey`는 BE-1에서 한다 | FE-0 | `src/features/meal/utils/meal-weather.util.ts` (신규), `unit/meal/meal-weather.test.ts` (신규, 분류·변환·발표 시각 부분) | 없음 (design.md "기상청 응답 → 분류 변환", "분류 규칙") | AC-7 경계값 테스트(28·27, 5·6), 눈 우선, 비 우선, 기온 null 건너뜀, 변환 규칙, 발표 시각 경계(02:14/02:15, 10:39/10:40, 00:10)가 통과. 서버 시간대와 무관. H-2 결과로 코드 4 포함 여부가 바뀌면 상수만 고친다 | 대기 |
| FE-1 | frontend-dev | 가중 뽑기: `pickMealMenu`에 `weightOf` 인자 추가, `getMealWeatherWeightOf` 추가, 태그 빈 구조 생성, 주석 수정 | FE-0, BE-2 | `src/features/meal/utils/meal-pick.util.ts` (수정), `src/features/meal/utils/meal-weather.util.ts` (수정), `src/features/meal/constants/meal-weather-tag.constant.ts` (신규, 빈 구조만), `unit/meal/meal-pick.test.ts` (수정), `unit/meal/meal-weather.test.ts` (가중치 부분) | 없음 (design.md "가중 뽑기 알고리즘") | `weightOf` 생략 시 기존 결과 동일. 모든 가중치 1이면 `pool[r]`. 가중치 [3, 1, 1]의 r 경계(0~2, 3, 4). 직전 메뉴 제외가 가중치보다 먼저. off·unavailable·normal은 가중 1. 태그가 비어 있을 때 기존 분포와 같다. 기존 호출부(`use-meal-roulette.hook.ts`)가 그대로 컴파일된다 | 대기 |
| BE-1 | backend-dev | 시·도 목록 상수 작성, `isMealWeatherRegionKey` 추가, 지역 검사 테스트 | H-2, FE-1 (같은 util 파일 순서) | `src/features/meal/constants/meal-weather-region.constant.ts` (신규), `src/features/meal/utils/meal-weather.util.ts` (수정), `unit/meal/meal-weather.test.ts` (지역 부분) | ui-ux-design.md "날씨 지역 선택 상자"(목록 순서, 짧은 표기 규칙 "서울, 부산, … 전남") | 키 목록과 테스트가 일치. `'Seoul'`, `' seoul'`, `''`, `null`, 숫자, `'__proto__'`는 거부. nx·ny는 H-2 기록과 같다. placeholder 0 값이 없다. 전남·광주 통합 여부는 H-2 결과대로 항목 수를 정한다 | 보류 (H-2 대기) |
| BE-3 | backend-dev | 서버: 기상청 호출 repository(캐시, 동시 요청 묶기, 실황 대체, 키 없음 처리), GET route(지역 검사, IP 분당 30회, 400·429·503), 개발용 Swagger 조각, repository 테스트 | BE-1, BE-2, FE-0 | `src/features/meal/services/meal-weather.repository.ts` (신규), `src/app/api/meal/weather/route.ts` (신규), `src/features/api-docs/specs/meal.openapi.json` (신규), `unit/meal/meal-weather-repository.test.ts` (신규) | 없음 (design.md "API 계약", "기상청 호출", "캐시", "보안") | AC-9 캐시 시각 테스트(59분·60분·자정·지역별 분리). 실패는 캐시하지 않는다. 동시 요청 1회 호출. 키 없음이면 fetch 0회. 던진 에러 메시지에 키·지역 없음. 요청 URL에 nx, ny, base_date, base_time, `dataType=JSON`. route·repository에 `console.` 없음. 응답 본문에 원본 값·지역·격자 없음. `Cache-Control: no-store`. openapi 병합 규칙(`merge-openapi.util.ts` 70행) 통과. tsc, lint 통과 | 대기 |
| FE-2 | frontend-dev | 문구 상수 전부: 날씨 문구, 기존 고지 문장 수정(notice 15·27·33행), FAQ 17행 수정과 날씨 FAQ 1개와 머리 주석 개수, 금지어 추가, 문구 테스트, 문구 기록 | DOC-4 (출처 URL·작성연도), P-1 (날씨 한 줄 템플릿에 `{menu}`를 둘지 결정) | `src/features/meal/constants/meal-notice.constant.ts` (수정), `src/features/meal/constants/meal-faq.constant.ts` (수정), `src/features/meal/constants/meal-copy-rule.constant.ts` (수정), `unit/meal/meal-copy.test.ts` (수정), `unit/meal/meal-notice.test.ts` (수정), `docs/meal-weather/copy-log.md` (신규) | ui-ux-design.md "날씨 한 줄 문구"(확정 4종), "패널 안내 문장", "결과 카드 안 날씨 안내"(출처·정확도·실패 문장), "개발 담당 확인 사항"(상수 이름 목록) | AC-10: 금지어 검사 통과, 템플릿 4종 존재. 출처 문구에 기상청·공공데이터포털·공공누리·`{year}`가 있고 `MEAL_WEATHER_SOURCE_URL`은 `https://`. 기존 "같은 확률", "추천하거나 평가하지" 문장이 meal 상수에서 0건. `meal-seo.constant.ts`는 건드리지 않는다. FAQ 머리 주석 개수가 실제와 같다 | 대기 (DOC-4, P-1 뒤) |
| FE-3 | frontend-dev | 화면과 훅: 서비스, React Query 훅, 날씨 훅, 뽑기 훅의 `spin(weather)`, 날씨 패널, 결과 날씨 안내, root 배치, result의 `weather` prop | FE-0, FE-1, FE-2, BE-1 | `src/features/meal/services/meal-weather.service.ts` (신규), `src/features/meal/queries/use-meal-weather.query.ts` (신규), `src/features/meal/roulette/hooks/use-meal-weather.hook.ts` (신규), `src/features/meal/roulette/hooks/use-meal-roulette.hook.ts` (수정), `src/features/meal/roulette/components/weather-panel.component.tsx` (신규), `src/features/meal/roulette/components/weather-note.component.tsx` (신규), `src/features/meal/roulette/components/root.component.tsx` (수정), `src/features/meal/roulette/components/result.component.tsx` (수정) | ui-ux-design.md 전 절(화면별 레이아웃, 색상, 타이포그래피, 간격·그리드, 컴포넌트 상태, 인터랙션, 접근성, 다크 모드) + design.md "프론트 구조", "props 계약", "상태 위치". frontend-dev는 design.md와 ui-ux-design.md를 둘 다 기준으로 한다 | 지역 미선택 또는 스위치 꺼짐이면 `/api/meal/weather` 요청이 없다. 조회 중이어도 룰렛이 막히지 않는다. 뽑힌 결과의 날씨는 스냅샷이라 지역·스위치를 바꿔도 그대로다. 날씨 한 줄 4종, 출처 링크(새 탭, sr-only 안내), 정확도 문구. 보통은 출처·정확도만. 실패는 실패 안내 한 줄. off는 빈 여백 없음. DOM 순서가 탭 순서다. 새 토큰, `dark:`, 새 CSS 애니메이션, `dangerouslySetInnerHTML`, 저장소·쿠키·URL 사용 없음. 광고 컴포넌트 props에 날씨 값 없음. tsc, lint, 디자인 가드 통과 | 대기 |
| FE-4 | frontend-dev | 방침·약관 문장 추가와 수정 (plan "법적·정책 요구사항" 초안을 입력으로 사용) | 없음. 출시 전 PM 최종 승인 필요 | `src/app/privacy/page.tsx` (수정), `src/app/terms/page.tsx` (수정) | 없음 (디자인 변경 없음, 기존 문단 추가·수정) | privacy 1장 117~121행 뒤에 새 문단, 6장 281~283행에 한 문장 추가. terms 9장 210~217행과 228~230행 수정. terms 239행(운빨 뽑기)은 바꾸지 않는다. "위치 정보를 요청하지 않으며" 유지. 시행일은 PM이 배포일을 준 뒤에만 바꾼다. FE-2 문구와 모순 없음. tsc, lint 통과 | 대기 (PM 문구 승인) |
| FE-5 | frontend-dev | 태그 기준표를 상수에 입력, 보충 메뉴를 끼니 목록 끝에만 추가, 개수 상수 갱신, 메뉴·태그 테스트 | H-1 (기준표 승인), FE-1 | `src/features/meal/constants/meal-weather-tag.constant.ts` (수정), `src/features/meal/constants/meal-menu-lunch.constant.ts`, `meal-menu-dinner.constant.ts`, `meal-menu-breakfast.constant.ts` (수정), `src/features/meal/constants/meal-menu.constant.ts` (수정), `unit/meal/meal-menu.test.ts` (수정), `unit/meal/meal-weather.test.ts` (태그 부분), `docs/meal-weather/copy-log.md` (기록 추가) | 없음 (design.md "메뉴 날씨 태그 데이터 구조") | 기존 메뉴 순서 불변(diff가 추가만 있다). `MEAL_MENU_COUNTS`가 실제 길이와 같다. 태그 id가 모두 해당 끼니 메뉴에 있고 중복 없음. 끼니×날씨 5개 이상(보충 뒤). 보충은 5개 미만이던 날씨에만 붙는다. 보통에는 태그 없음. 개수가 승인된 `weather-tags.md`와 같다 | 보류 (H-1 대기) |
| H-1 | PM (기획 산출물, 사용자 승인) | 날씨 태그 기준표 작성: 끼니×날씨별 태그 메뉴, 보충 메뉴 후보와 개수, 개수 요약, 가중치 3일 때 확률 재계산 | 사용자 승인 | `docs/meal-weather/weather-tags.md` (신규, 기획 산출물) | 없음 | 승인본 존재. 끼니·날씨별 태그 메뉴 수와 보충 수 기록. 개발자는 승인 전 메뉴 데이터를 만들지 않는다 | 보류 |
| H-3 | PM (운영 전) | 운영 환경에 `DATA_GO_KR_API_KEY` 설정과 공공데이터포털 15084084 활용신청 | DOC-4 | 없음 (`.env` 파일은 열지 않는다) | 없음 | 운영 환경에 이름만 설정됨. 개발 티켓은 가짜 fetch와 가짜 키 문자열로 완료한다. 개발자는 `.env`를 읽지 않는다 | 보류 (개발 차단 아님) |
| DOC-4 | PM | 출처·한도 확인: 기상청 홈페이지 주소, 공공누리 제1유형 표시 원문과 작성연도, 개발계정 한도 기준(일/월, Q10), 공공데이터 이용약관 제14조 5항 | 없음 | `docs/meal-weather/source-check.md` (신규, 확인 기록. 설계 파일 목록에 없어 P-6에서 확인 요청) | 없음 | 기록에 확인 날짜와 출처(원문 위치)가 있다. 주소와 표시 원문이 확정되어 FE-2의 `MEAL_WEATHER_SOURCE_URL`과 출처 문구에 쓸 수 있다 | 대기 |
| DOC-2 | PM | `THIRD_PARTY_NOTICES.md` 데이터 항목 추가 | DOC-4 | `THIRD_PARTY_NOTICES.md` (수정) | 없음 | 기상청 단기예보 조회서비스, 공공데이터포털 15084084, 공공누리 제1유형, 출처 표시 방법이 있다 | 대기 |
| DOC-1 | PM | `COMPLIANCE.md` 갱신 | FE-2, BE-3, DOC-4 | `COMPLIANCE.md` (수정. 3행, 1장 15행, 8장, 9장, 11장 159~166행만 `grep -n "^## "`로 찾아 줄 범위로 읽는다) | 없음 | design.md "갱신할 문서" 표의 COMPLIANCE 행 전부 반영. "equal probability"와 "not a recommendation" 문장이 Q1 방향으로 바뀜. 위험 수용 항목 추가. Last updated 날짜 갱신 | 대기 |
| DOC-3 | backend-dev (설계가 지정, 문서 티켓으로 분리) | README 갱신 | BE-3 | `README.md` (수정. 55행, API 표 97~103행, 환경변수 표의 `DATA_GO_KR_API_KEY`) | 없음 | 55행의 "런타임 미사용"이 "날씨 조회(`/api/meal/weather`)에 서버 런타임 사용, 서버 전용, `NEXT_PUBLIC_` 아님"으로 바뀜. `GET /api/meal/weather` 행 추가 | 대기 |

## 보류 티켓 (개발 전 승인 또는 확인이 필요한 항목)

- H-1: 날씨 태그 기준표. 승인 전에는 FE-5를 시작하지 않는다. 태그 없이도 AC-1~6 E2E는 동작한다(뽑힌 메뉴와 상관없이 날씨 줄이 나오므로).
- H-2: 격자와 기상청 항목 대조. 이 티켓이 끝나야 BE-1이 열린다. BE-1이 막히면 BE-3, FE-3, E2E도 같이 막힌다. 대조할 수 없으면 값을 넣지 않고 PM에게 보고한다.
- H-3: 운영 키 설정. 개발은 막지 않는다. 개발자는 `.env`를 열지 않고 `DATA_GO_KR_API_KEY` 이름만 쓴다.

## 실행 순서

1. 준비 (파일이 겹치지 않아 동시에 시작): FE-0, DOC-4, H-2, H-1 작성. P-1은 PM이 architect와 확인한다.
2. 병렬: BE-2, FE-2(DOC-4와 P-1 뒤), FE-4(PM 승인 뒤 최종 확인), DOC-2(DOC-4 뒤).
3. FE-1: BE-2 뒤. `meal-weather.util.ts`를 BE-2와 같이 고치므로 순서를 지킨다.
4. BE-1: H-2 완료와 FE-1 뒤. 이 단계가 전체의 가장 큰 막힘이다.
5. 병렬: BE-3(BE-1 뒤), FE-3(FE-1, FE-2, BE-1 뒤), FE-5(H-1 승인과 FE-1 뒤).
6. 병렬: DOC-3(BE-3 뒤), DOC-1(FE-2, BE-3, DOC-4 뒤).
7. 검증 (PM): `typecheck`와 `lint`를 각각 한 번 실행. 실패하면 해당 dev에게 되돌린다.
8. QA (티켓 밖, 참고): E2E `e2e/meal-weather.spec.ts`는 FE-3, FE-4, BE-3 뒤에 만든다. AC-14 정적 확인은 FE-5 뒤. 전체 회귀는 한 번만 돌린다.

## 동시 실행 가능

- 1단계: FE-0, DOC-4, H-2, H-1 작성. 서로 파일이 다르다.
- 2단계: BE-2, FE-2, FE-4, DOC-2. 서로 파일이 다르다.
- 5단계: BE-3, FE-3, FE-5. 서로 파일이 다르다. FE-3과 BE-3은 API 계약만 맞으면 된다. 실제 호출 확인은 QA가 한다.
- 6단계: DOC-1, DOC-3. 둘 다 PM과 backend-dev가 맡고 파일이 다르다.
- 같은 단계라도 파일이 겹치면 순서대로 한다 (아래 "충돌 위험").

## 충돌 위험

- `src/features/meal/types/meal.type.ts`, `meal-weather.constant.ts`: FE-0만 고친다. 모든 티켓이 import하므로 FE-0을 먼저 끝낸다.
- `src/features/meal/utils/meal-weather.util.ts`: BE-2 → FE-1 → BE-1 순서로 고친다. 같은 사람이 이어서 하거나 순서를 지킨다.
- `unit/meal/meal-weather.test.ts`: BE-2(분류·변환·발표 시각), FE-1(가중치), BE-1(지역), FE-5(태그) 네 티켓이 같이 쓴다. 위 순서대로 한다.
- `src/features/meal/constants/meal-notice.constant.ts`, `meal-faq.constant.ts`, `meal-copy-rule.constant.ts`, `unit/meal/meal-copy.test.ts`, `unit/meal/meal-notice.test.ts`: FE-2 한 티켓만 고친다. `meal-copy-rule.constant.ts`는 notice 상수를 import하므로 FE-2 안에서 함께 맞춘다.
- `docs/meal-weather/copy-log.md`: FE-2가 만들고 FE-5가 항목을 덧붙인다. FE-2 뒤에 FE-5를 한다.
- `use-meal-roulette.hook.ts`, `root.component.tsx`, `result.component.tsx`: FE-3 한 티켓만 고친다. spin 시그니처와 props가 이어져 있다.
- `meal-menu-lunch|dinner|breakfast.constant.ts`, `meal-menu.constant.ts`, `unit/meal/meal-menu.test.ts`: FE-5 한 티켓만 고친다. 기준표 승인 전에는 아무도 건드리지 않는다.
- `meal-weather-tag.constant.ts`: FE-1이 빈 구조를 만들고 FE-5가 내용을 채운다. 순서대로 한다.
- `src/features/meal/services/`: BE-3(`meal-weather.repository.ts`)과 FE-3(`meal-weather.service.ts`)이 같은 폴더를 쓰지만 파일이 다르다. 충돌 없음. 파일 이름 접두어가 같아 헷갈리지 않게 리뷰에서 확인한다.
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `COMPLIANCE.md`의 `EFFECTIVE_DATE`와 날짜: 다른 기능이 같은 시기에 날짜를 바꾸면 하나로 맞춘다. 지금 작업 트리에는 이 파일들의 커밋되지 않은 변경이 없다.
- `README.md`: DOC-3 한 티켓만 고친다. COMPLIANCE만 DOC-1이 고친다.
- `e2e/helpers/meal.util.ts`: QA가 `stubWeather`를 추가만 한다. 기존 함수는 `meal.spec.ts`, `meal-location.spec.ts`가 쓰므로 바꾸지 않는다.
- `src/features/meal/constants/meal-seo.constant.ts`: 어느 티켓도 건드리지 않는다(설계 결정, P-5).
- `docs/meal-weather/grid-check.md`: H-2가 만든다. DOC-4 결과는 `source-check.md`에 따로 쓴다.
- `use-meal-roulette.hook.ts`가 부르는 `pickMealMenu`는 FE-1에서 인자를 추가만 한다(선택 인자). 호출부는 FE-3에서 바꾼다. FE-1 뒤 FE-3 전까지 호출부가 컴파일되는지 확인한다.

## PM 확인 요청

- P-1 (FE-2 시작 전 선결): 날씨 한 줄 템플릿. ui-ux-design.md(UW-1 확정)는 한 줄에 메뉴 이름을 넣지 않으므로 `{menu}`가 없고 `getMealWeatherLine`의 `menuName` 인자도 쓰이지 않는다. design.md의 "상수" 설명과 다르다. 권장: ui-ux를 따르고, architect가 design.md 해당 문장과 `getMealWeatherLine` 시그니처를 고친다. 결정 전에는 FE-2를 시작하지 않는다.
- P-2: plan.md AC-1의 문구("오늘은 비가 와요. ○○ 어때요?")는 Q1 결정과 충돌한다. ui-ux의 확정 문구로 PM이 고친 뒤 QA에 넘긴다.
- P-3: design.md "프론트 구조"의 "상시 고지" 표현은 안내 2가 접힌다는 UW-2 결정과 다르다. 컴포넌트 계약은 바뀌지 않는다. architect가 문장만 고친다.
- P-4: DQ1~DQ4와 Q1~Q10 권장안은 사용자가 자리를 비운 동안 확정되었다(status.md 메모). 복귀 뒤 재확인이 필요하다. 특히 DQ3(가중치 3)와 DQ4(보통 날씨 출처). 값은 FE-0의 상수 한 곳에 있어 바꾸기 쉽다.
- P-5: 설계 "갱신할 문서" 표의 README 갱신은 BE-3에서 떼어 DOC-3으로 분리했다(담당은 backend-dev 유지). `meal-seo.constant.ts` description은 설계대로 바꾸지 않는다(plan은 수정을 허용만 했다).
- P-6: DOC-4 기록용 `docs/meal-weather/source-check.md`는 설계 파일 목록에 없는 문서 한 개다. 추가해도 되는지 확인한다.
- P-7: H-2가 막히면 BE-1, BE-3, FE-3, E2E가 모두 멈춘다. 그동안 FE-0, BE-2, FE-1, FE-2, FE-4는 진행할 수 있다. 일정에 반영한다.
- P-8: `status.md` 단계 4(개발 준비)를 dev-tasks 승인 대기로 PM이 갱신한다. dev-lead는 status.md를 건드리지 않았다.
- P-9: `EFFECTIVE_DATE` 값(배포일)은 PM이 정한다. 개발자는 날짜를 임의로 넣지 않는다.
- P-10: H-3(운영 키)과 DOC-4(공공데이터 한도, 약관)는 출시 전 PM 작업이다. 개발 완료 조건에는 넣지 않았다.

## 확인 기록 (dev-lead)

- 티켓 목록은 design.md의 "담당별 작업 순서"와 "파일 충돌 위험"을 따르되, 보류 항목과 문서 항목을 떼어 나눴다.
- design.md에 없는 API나 테이블은 만들지 않았다. 새 파일은 design.md 파일 목록의 것과 P-6의 `source-check.md` 한 개뿐이다.
- 이 문서에는 구현 코드를 쓰지 않았다. 코드 파일은 만들거나 고치지 않았다.
- 규칙 문서(각 담당이 읽을 것): 전원 `docs/conventions/tech-stack.md`. `code-style.md`는 "아키텍처"(5행), "폴더 구조"(24행), "Next.js·React 규칙"(56행), "React 패턴"(63행), "먼저 재사용할 기존 코드"(85행), "네이밍 규칙"(97행) 절을 읽는다. `data-storage.md`는 FE-0, BE-3, FE-3. `seo.md`는 FE-2, DOC-1. `design-system.md`는 FE-3과 ui-ux 참조 (색·타이포·반경·모션·다크 모드 절).
