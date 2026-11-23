# menu-meals 개발 티켓

입력: `docs/menu-meals/design.md`(승인, D1~D12 추천안), `docs/menu-meals/ui-ux-design.md`(U1~U4 사용자 선택 반영), `docs/menu-meals/plan.md`(AC 기준), `docs/menu-meals/status.md`(확정 결정)
작성: dev-lead, 2026-11-23
규칙 문서: `docs/conventions/tech-stack.md`, `docs/conventions/code-style.md`를 읽고 작성했다. 티켓별로 더 필요한 규칙 문서는 "티켓 상세"에 적었다.
범위: db, backend 작업 없음. frontend-dev, qa, PM 담당만 있다. 이 문서는 코드를 고치지 않는다.

## 먼저 볼 사항

1. **U3가 design.md와 어긋난다.** design.md 6.3은 끼니를 바꾸면 "결과·알림 사라짐"이라고 적었다. U3는 같은 알림 영역(`role="status"`)에 "{끼니}로 바꿨습니다. 후보 메뉴 {n}개." 한 문장을 읽게 하는 것이다. 이 티켓은 U3를 따른다. 그래서 design.md 6.2(상태 영역)와 6.3(알림 규칙)을 고쳐야 한다. 고치는 일은 architect 몫이라 ARC-1로 PM을 거쳐 요청한다. ARC-1이 끝나기 전에는 F-3를 시작하지 않는다. 제안 규칙: 끼니를 바꾸면 결과 알림은 지우고, 상태 영역에는 변경 문장 하나만 남긴다. 후보 수 문장은 기존대로 `aria-live`를 붙이지 않는다.
2. **ui-ux-design.md 상태가 "승인 대기"다.** U1(3칸 스위치), U2(모션 없음), U4(6칸 격자)는 design.md와 어긋나지 않는다. PM-0에서 상태를 승인으로 바꾸고 선택을 기록한다.
3. **약관·방침·sitemap은 frontend-dev가 쓸 수 있다.** `guard-files.js`의 frontend-dev 허용 경로에 `src/app/`이 있어 `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`, `src/app/sitemap.ts`를 고칠 수 있다. 그래서 PM 담당이 아니라 F-5, F-4가 맡는다. 거부 경로는 `src/app/api/`와 `*.repository.ts`뿐이다.
4. **frontend-dev가 못 쓰는 파일.** 루트의 `next.config.ts`, `COMPLIANCE.md`, `README.md`, `e2e/`, `unit/`(qa 전용), `docs/conventions/`, `docs/_templates/`, `src/lib/`(backend-dev 전용)는 쓸 수 없다. 그래서 PM-1, PM-2가 맡고, 테스트는 Q-1, Q-2가 맡는다. `src/lib/seo.ts`의 `buildMetadata()`는 고치지 않고 인자만 넘긴다.
5. **파일 삭제 방식.** `guard-bash.js`는 `rm -rf`를 막는다. F-1(옛 폴더 비우기)과 F-4(`src/app/lunch/` 삭제)는 파일 단위 `rm`과 빈 폴더 `rmdir`로 한다. 차단 메시지가 나오면 우회하지 말고 PM에게 보고한다.
6. **F-1의 기호 이름 범위가 설계에서 불분명하다.** design.md 2.1은 F-1에서 "기호 이름 변경(LUNCH_* → MEAL_*)"이라 했고, 3.2는 상수 이름을 `MEAL_STANDARD_CATEGORIES`, `MEAL_LUNCH_MENUS`처럼 적었다. 이 티켓은 F-1에서 파일 이름과 컴포넌트·훅 이름(`LunchToday*` → `MealRoulette*`, `useLunchToday` → `useMealRoulette`)만 바꾸고, 상수 이름은 F-2a에서 3.2 이름으로 한 번에 바꾸는 것으로 잡았다. 다르면 ARC-1에서 design.md를 고친다.
7. **운세 샘플 검수 주체.** design.md D8은 "사용자 검수"라고 적었다. 이 티켓은 PM 검수(PM-R1)로 잡았다. 사용자가 직접 보고 싶으면 PM-R1 완료 조건에 사용자 확인을 추가한다.
8. **시행일.** 약관·방침의 `EFFECTIVE_DATE`는 배포일이다(D12). 배포일을 사용자가 정하기 전에는 F-5에서 기존 값을 둔다. 배포일이 정해지면 F-5를 다시 호출해 그 한 줄만 바꾼다(U-0 뒤).

## 티켓

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| PM-0 | PM | 승인 반영. ui-ux-design.md 상태를 승인으로 바꾸고 U1~U4 선택을 기록. status.md 갱신 | - | `docs/menu-meals/ui-ux-design.md`, `docs/menu-meals/status.md` | 전체 | 상태 "승인", U1~U4 기록, status.md의 UI 단계 "승인" | 대기 |
| U-0 | 사용자 | 배포일 확정(D12, M17). 법률 검토 상태(위험 수용 + 새 항목) 확인. 구글 지도 포함 재확인(M11은 승인 완료) | - | - | - | 배포일과 결정일을 PM에게 전달 | 대기 |
| ARC-1 | architect (PM 경유) | design.md 6.2·6.3에 U3 규칙 반영. 2.1과 3.2의 상수 이름 규칙 확정(위 1, 6번) | PM-0 | `docs/menu-meals/design.md` (6.2: 444~470행, 6.3: 472~504행, 2.1: 54~68행, 3.2: 201~235행) | ui-ux "접근성 > 라벨·스크린리더"(227행), "열린 질문 U3"(252행) | 수정된 6.2·6.3 승인, 끼니 변경 문장 문구 확정, F-1 상수 이름 규칙 확정 | 대기 |
| F-1 | frontend-dev | 폴더 이동과 이름 변경만. `src/features/lunch/` → `src/features/meal/`, `today/` → `roulette/`, 파일 이름에 `meal-` 접두(design 2.2 최종 이름), 컴포넌트·훅 이름 변경. 동작과 주소(`/lunch/today`)는 그대로 | PM-0 | `src/features/lunch/**` 23개 파일, `src/app/lunch/today/page.tsx` 7~18행(import만) | 없음(동작 변경 없음) | 새 위치에 23개 파일. `src/app/lunch/today/page.tsx` 밖에서 `features/lunch` import 0건. 옛 파일 비움 | 대기 |
| Q-1 | qa | 테스트 파일 이동과 import·이름 수정. `PATH`는 `/lunch/today` 그대로 둔다 | F-1 (바로 다음) | `e2e/lunch.spec.ts` → `e2e/meal.spec.ts`, `unit/lunch/*.test.ts` → `unit/meal/*.test.ts`(import 행) | - | `pnpm typecheck` 통과. 기존 점심 테스트 전부 통과(데스크톱). 이름만 바뀌고 검사 내용은 그대로 | 대기 |
| F-2a | frontend-dev | 타입, 끼니 목록과 카테고리, 점심 48개 이동, 저녁 51개와 아침·브런치 41개 메뉴, 운세 구조와 라벨, 점심 운세 24줄(D10 교체 1줄 포함), 저녁·아침 운세 샘플 16줄(카테고리 2개씩), 금지어와 제외 목록, 고지·FAQ·SEO 상수, `copy-log.md` | Q-1 | `src/features/meal/types/meal.type.ts`, `src/features/meal/constants/*.ts`(2.2 구조), `docs/menu-meals/copy-log.md` (신규) | ui-ux "끼니별 라벨·문구 표시 위치"(155~166행) | design 3.1~3.5, 4, 5장 충족. 메뉴 3장 기준 자체 점검 통과. 아직 `MEAL_MENUS`와 `MEAL_LUCK_LINES`의 나머지 줄은 없어도 된다(F-2b) | 대기 |
| PM-R1 | PM | 검수 1. 저녁·아침 메뉴 전체와 운세 샘플 16줄을 design 3장 기준으로 읽고 검수 (D8) | F-2a | `src/features/meal/constants/meal-menu-dinner.constant.ts`, `meal-menu-breakfast.constant.ts`, `meal-luck.constant.ts`, `docs/menu-meals/copy-log.md` | - | 3장 검수 표(아래 "검수 기준") 전 항목 통과. 실패는 F-2a로 되돌림. 결과를 `copy-log.md`에 기록 | 대기 |
| F-2b | frontend-dev | 저녁·아침 운세 나머지 32줄(끼니당 카테고리 4개 × 4줄 중 샘플 뺀 것). PM-R1 지적 반영 | PM-R1 | `src/features/meal/constants/meal-luck.constant.ts`, `docs/menu-meals/copy-log.md` | ui-ux "끼니별 라벨·문구 표시 위치" | 끼니당 24줄, 카테고리당 4줄, 끼니 안 중복 없음, 다른 끼니 이름 없음 | 대기 |
| F-5 | frontend-dev | 이용약관과 개인정보처리방침 문구 수정. 시행일은 기존 값 유지(U-0 뒤 배포일로) | PM-0 (시행일은 U-0) | `src/app/terms/page.tsx` 46행(EFFECTIVE_DATE), 81~83행, 193행, 196~201행, 210~212행, 248행. `src/app/privacy/page.tsx` 43행(EFFECTIVE_DATE), 200~207행 | 없음(문서 레이아웃 변경 없음) | design 8.1, 8.2 표 반영. "점심 메뉴 룰렛" 0건. 금지어(음주 단어) 0건. 장 번호 1~끝까지 연속. 지도 3개 문장 그대로 | 대기 |
| F-3 | frontend-dev | 뽑기 유틸(3.6), 훅 `SET_MEAL`과 상태(6.3), 끼니 선택 컴포넌트(U1, 3칸 스위치), 필터 패널의 카테고리 props와 6칸 격자(U4), 결과 카드의 `luckLabel` props, root 연결, 끼니 변경 알림 문장(U3, ARC-1 확정 문구), 소개·noscript 문구 | F-2b, ARC-1, PM-0 | `src/features/meal/utils/meal-pick.util.ts`(신규), `src/features/meal/roulette/hooks/use-meal-roulette.hook.ts`, `src/features/meal/roulette/components/*.component.tsx`, `src/features/meal/constants/meal-notice.constant.ts`(U3 문구) | 화면별 레이아웃(67~177행), 끼니 선택 컨트롤(127~134행), 카테고리 칩 레이아웃(136~153행), 컴포넌트 상태(179~192행), 인터랙션 "빼는 안"(194~208행), 접근성(210~233행) | design 6.3 표와 6.4 예외 충족. 끼니 바꾸면 결과 지움, 회전 중 끼니 무시, 0개 후보 안내, 국물 유지, 카테고리 규칙(3.6) 충족. 끼니 값이 URL·저장소·쿠키에 없음 | 대기 |
| F-4 | frontend-dev | `src/app/meal/page.tsx` 신규(MealPage), `src/app/lunch/` 삭제, 메뉴 그룹 키·이름·주소 변경, D2 A 파일 변경(섹션 키, 토큰, 돌림판 색 클래스), 사이트맵 옛 주소 제외 목록, 메타·JSON-LD·FAQ 연결 | F-3 | `src/app/meal/page.tsx`(신규), `src/app/lunch/today/page.tsx`(삭제), `src/constants/menu.constant.ts` 3~5행·71~85행, `src/types/menu.type.ts`(MenuSectionKeyType), `src/constants/theme.constant.ts` 45행·53행, `src/app/globals.css` 76행·106행, `src/components/common/roulette.component.tsx` 244행·251행·268행, `src/app/sitemap.ts` 18~23행 | 화면별 레이아웃(67~123행), 지도 링크(168~172행), design 7.2, 7.3, SEO 장(582~600행) | 빌드 전 로컬 확인: 메뉴 링크가 `/meal`, sitemap에 `/meal`만 있고 `/lunch/today`, `/lunch` 없음, h1 "오늘 뭐 먹지" 하나, JSON-LD 2종, canonical `/meal`. 색 값 `#a5481f` 그대로 | 대기 |
| PM-1 | PM | `next.config.ts`의 `redirects()`에 301 두 건 추가. 기존 로또 3건은 그대로 | F-4와 같은 배포. 파일 작성은 F-4 뒤 | `next.config.ts` 95~113행(redirects 배열 끝) | - | `/lunch/today`→`/meal`, `/lunch`→`/meal` 모두 `statusCode: 301`(`permanent` 없음). 로또 3건 변경 없음. `pnpm build` 통과(PM-3) | 대기 |
| PM-R2 | PM | 검수 2. 전체 데이터, 운세 전 줄, FAQ 7개, 고지, 메타 설명, 약관·방침 문구를 실제 파일과 렌더 결과로 확인. 금지어, 건강 표현, 상표 확인 | F-2b, F-4, F-5 | `src/features/meal/**`, `src/app/meal/page.tsx`, `src/app/terms/page.tsx`, `src/app/privacy/page.tsx` | ui-ux 5.3 문구 표 | 검수 기준 전 항목 통과. 실패는 해당 dev에게 되돌림 | 대기 |
| PM-2 | PM | `COMPLIANCE.md` 1장 14행, 11장 145~153행 갱신(design 8.3). 법률 상태 "위험 수용"과 새 항목, 결정일 기록. `e2e/lunch-copy.spec.ts` 잘못된 참조를 `unit/meal/meal-copy.test.ts`로 교정. `README.md`는 변경 없음 확인. `docs/conventions/design-system.md` 색 표 반영 확인(git 상태상 이미 수정됨) | PM-0. 결정일은 U-0 뒤 | `COMPLIANCE.md`, `README.md`(확인만), `docs/conventions/design-system.md`(확인만) | - | COMPLIANCE.md 두 곳 반영, 결정일 기록. README 변경 없음. design-system 색 표 한 줄 `menu-meal` 확인 | 대기 |
| Q-2 | qa | 9장 테스트 갱신과 추가. `e2e/meal.spec.ts`와 `unit/meal/*` 실행. 데스크톱과 모바일. 전체 회귀는 마지막에 한 번. 320, 360, 390, 1280px에서 세 끼니 스크린샷 확인 | F-4, F-5, PM-1, PM-R2 | `e2e/meal.spec.ts`, `unit/meal/meal-menu.test.ts`, `unit/meal/meal-copy.test.ts`, `unit/meal/meal-notice.test.ts`, `unit/meal/meal-pick.test.ts`(신규), `docs/menu-meals/qa-report.md`(신규) | ui-ux 접근성(210~233행) | design 9.1, 9.2 목록 전부. AC-1~AC-35를 테스트나 확인 항목으로 대응. `qa-report.md`에 대응표와 실패 목록 | 대기 |
| PM-3 | PM | 검증. `pnpm typecheck`, `pnpm lint`, `pnpm build`를 각각 실행. `next start`로 301 응답 확인. sitemap, JSON-LD, 보안, 법적 문구, design-guard 확인 | Q-2 | 전체 | - | 셋 다 성공. 301 상태 코드 확인. design 9장과 plan AC 대응 완료 | 대기 |
| U-1 | 사용자 | 운영 배포 승인. 배포 후 서치어드바이저와 서치 콘솔에서 사이트맵 재제출, 옛 주소 색인 확인, Vercel 미리보기 검색 제외 확인. 수동으로 스크린리더 가운뎃점 읽기 확인 | PM-3, 사용자 승인 | - | - | 사용자 완료 보고 | 배포 후 |
| PM-4 | PM | `docs/TODO.md` 5번 정리, `docs/menu-meals/status.md` 갱신 | U-1 | `docs/TODO.md`, `docs/menu-meals/status.md` | - | 정리 완료 | 배포 후 |

## 티켓 상세

공통 규칙: 데이터 저작은 자체 작성이다. 상표, 가게 이름, 음식 사진을 쓰지 않는다. 화면 문구는 상수로 두고 React가 이스케이프한다. 끼니 값은 React 상태에만 둔다.

### PM-0
- 입력: `docs/menu-meals/ui-ux-design.md` 254~257행과 245~253행, `docs/menu-meals/status.md`
- 범위: 상태 줄과 U1~U4 선택 기록, status.md의 UI 단계 갱신. 다른 내용은 바꾸지 않는다.
- 완료: 상태 "승인", U1 A안(3칸 스위치), U2 빼는 안(즉시 교체), U3 넣는 안(변경 문장 읽기), U4 A안(6칸 격자)을 기록.

### U-0
- 사용자 결정: 배포일(D12, 약관·방침 시행일), 법률 상태 "위험 수용" 유지 여부와 새 항목(음주 연상 판단, 해장 표현, 식품 표현, 구글 지도 약관) 확인. 결과를 PM에게 전달.

### ARC-1
- 입력: `docs/menu-meals/design.md` 2.1(54~68행), 3.2(201~235행), 6.2(444~470행), 6.3(472~504행). `docs/menu-meals/ui-ux-design.md` 열린 질문 U3(252행)
- 범위: 6.2 상태 영역 설명과 6.3 알림 규칙을 U3에 맞게 고친다. 2.1과 3.2의 상수 이름 규칙을 한 가지로 정한다. 다른 장은 건드리지 않는다.
- 규칙 문서: `docs/conventions/code-style.md`(네이밍), `docs/conventions/data-storage.md`(상태 위치)
- 완료: 고친 design.md가 승인되고 U3 문구가 확정. 결정 결과가 F-1, F-3 티켓과 맞다.

### F-1
- 입력: `src/features/lunch/**`(constants 8개, types 1개, utils 2개, today/components 9개, today/hooks 1개), `src/app/lunch/today/page.tsx` 7~18행
- 범위: design 2.2의 최종 파일 이름으로 옮긴다(`lunch-menu.constant.ts` → `meal-menu-lunch.constant.ts` 등). `today/` → `roulette/`. 컴포넌트와 훅 이름 변경(6번 항목). 옛 폴더의 파일은 `rm`으로 지운다. 동작은 바꾸지 않는다. 페이지 import만 새 경로로 바꾼다.
- 규칙 문서: `docs/conventions/code-style.md`(폴더 구조, 파일 접미사, 네이밍)
- 완료: 새 위치 23개 파일. `src/app/lunch/today/page.tsx` 밖에서 `features/lunch` 참조 0건. 옛 폴더에 파일이 없음.
- 주의: F-1 뒤 `pnpm typecheck`는 테스트 import 때문에 실패한다. Q-1을 바로 이어서 한다.

### Q-1
- 입력: `e2e/lunch.spec.ts`(2~5행 import, 9행 `PATH`), `unit/lunch/lunch-menu.test.ts`, `unit/lunch/lunch-copy.test.ts`, `unit/lunch/lunch-notice.test.ts`
- 범위: 파일을 `e2e/meal.spec.ts`, `unit/meal/`로 옮기고 import와 F-1에서 바뀐 이름만 고친다. `PATH`와 검사 내용은 그대로 둔다. `unit/helpers/`와 `e2e/helpers/`는 다른 기능도 쓰므로 고치지 않는다.
- 규칙 문서: `docs/conventions/tech-stack.md`(Playwright, Vitest), `docs/conventions/code-style.md`(테스트 위치)
- 완료: `pnpm typecheck` 통과. 기존 점심 테스트가 데스크톱에서 통과. 다른 기능 테스트에 영향 없음.

### F-2a
- 입력: `docs/menu-meals/design.md` 3.1(137~196행), 3.2(201~235행), 3.3(238~244행), 3.4(253~279행), 3.5(281~310행), 4(337~356행), 5.1·5.2(361~377행), 5.3(381~404행), 2.2(70~133행)
- 범위: 타입 파일, 끼니 목록(`MEAL_LIST`, `MEAL_DEFAULT_KEY`), 카테고리 목록(점심·저녁 공통 6개, 아침 전용 6개), 점심 48개 데이터(내용과 id, 국물 값 그대로), 저녁 51개, 아침 41개, 운세 구조와 라벨, 점심 운세 24줄(`든든` 포함 한 줄은 D10에 따라 새 문장으로 바꾼다), 저녁·아침 운세 샘플 16줄(카테고리 2개씩), 금지어 목록(`MEAL_FORBIDDEN_TERMS`, `MEAL_FORBIDDEN_PATTERNS`에 `술` 패턴), 안주 연상 제외 목록, 고지·FAQ·SEO 상수, 지도 상수, `docs/menu-meals/copy-log.md`(신규)
- 규칙 문서: `docs/conventions/code-style.md`(상수 UPPER_SNAKE, 기능 접두사, `type`만 사용), `docs/conventions/data-storage.md`(상수 위치), `docs/conventions/seo.md`(FAQ, 키워드, 메타)
- 완료: design 3장과 4장의 구조를 따른다. 메뉴 목록 데이터는 `as const satisfies`로 선언한다. 저녁·아침에 `MEAL_ALCOHOL_ASSOCIATED_MENU_NAMES` 이름이 없다.
- 검수 기준 (PM-R1, PM-R2 공통, design 3장):
  - 끼니마다 카테고리 6개
  - 카테고리마다 6개 이상
  - 끼니 합계 40~60개(저녁 51, 아침 41)
  - 끼니 안에서 이름과 id 중복 없음. id는 `^[a-z]+(-[a-z]+)*$`, 40자 이하
  - 이름에 설명, 사진, 가격, 칼로리, 상표 없음. "카페", "브런치 카페" 같은 가게 단어 없음
  - 국물 기준 준수. 아침은 죽을 `dry`로 둔다
  - 저녁·아침에 안주 연상 메뉴(5.2 목록) 없음
  - 운세와 문구에 음주 단어 없음(술, 안주, 한잔, 소주, 맥주, 해장, 숙취, 야식, 음주)
  - 금지어 `든든`, `건강한`, `균형`, `속 편한`, `결식`, `칼로리`, `영양`, `건강에`, `다이어트`, 그리고 치료 관련 표현 없음
  - 기존 금지 목록(반드시, 무조건, 보장, 확실, 100%, 최고, 대박, 맛집, 인기, 베스트, 1위, 광고, 추천합니다, 추천 메뉴) 없음
  - 운세 문장: 합니다체, 한 문장, 가벼운 가능성 표현, 메뉴 이름·국물·맛 언급 없음, 다른 끼니 이름 없음

### PM-R1
- 입력: F-2a의 메뉴 파일 두 개와 운세 파일, `copy-log.md`
- 범위: 저녁·아침 메뉴 전체, 운세 샘플 16줄. 점심은 기존 48개라 검수 대상이 아니다(design 3.4 판단). 문구 한 줄이 틀리면 F-2a로 되돌리고, PM이 직접 고치는 것은 보충(빠진 메뉴 추가) 뿐이다.
- 완료: 검수 기준 전부 통과, 결과를 `copy-log.md`에 적음.

### F-2b
- 입력: `src/features/meal/constants/meal-luck.constant.ts`, design 4장(349~355행)
- 범위: 저녁·아침의 나머지 카테고리 문구 32줄. PM-R1에서 지적된 줄을 고친다. 두 번째 쓰기는 같은 파일이므로 F-2a와 동시에 하지 않는다.
- 완료: 끼니당 24줄, 카테고리당 4줄, 끼니 안 중복 없음. `copy-log.md`에 작성 이력.

### F-5
- 입력: `src/app/terms/page.tsx`(46행, 81~83행, 193행, 196~201행, 210~212행, 248행), `src/app/privacy/page.tsx`(43행, 200~207행). 문장 초안은 design 8.1(608~619행), 8.2(623~628행)
- 범위: 1장 셋째 문단, 9장 제목·첫 문단·둘째 문단, 13장 문장, 방침 6장 지도 문단, 시행일. 장 번호와 구조는 바꾸지 않는다. 지도 3개 문장과 외부 링크 문장은 그대로. 법률 검토 항목(`docs/lunch/legal-draft.md` 4장)은 바꾸지 않는다.
- 규칙 문서: `docs/conventions/code-style.md`(페이지 default export)
- 완료: 8.1·8.2 표 반영, 금지어 0건, "점심 메뉴 룰렛" 0건, `EFFECTIVE_DATE` 값은 U-0 결과. 나머지 문장은 바꾸지 않는다.

### F-3
- 입력: design 3.6(312~335행), 6.2(444~470행), 6.3(472~504행), 6.4(505~515행). ui-ux 화면별 레이아웃(67~123행), 끼니 선택 컨트롤(127~134행), 카테고리 칩(136~153행), 라벨·문구 위치(155~166행), 빈 상태(174~177행), 컴포넌트 상태(179~192행), 인터랙션(194~208행), 접근성(210~233행)
- 범위:
  - `meal-pick.util.ts`: `filterMealMenus`, `pickMealMenu`(기존 `secureRandomInt` 사용, `src/lib/random`은 import만), `pickMealLuckLine`, `carryOverMealCategories`
  - 훅: `SET_MEAL` 액션, `setMeal`, `categoryOptions`, `luckLabel` 반환
  - 끼니 선택: `fieldset`+`legend`("끼니"), 라디오 3개와 label, 3칸 스위치 모양(U1). 회전 중 `aria-disabled`, 변경 무시
  - 필터 패널: 카테고리 props, 6칸 격자(모바일 2열, 640px 이상 3열, 768px 이상 6열). 칩 높이 44px
  - 결과: `luckLabel` props
  - 알림: ARC-1 확정 문구 하나. 결과 알림은 끼니 변경 때 지운다
  - 소개와 noscript 문구: design 5.3 초안 사용(최종 문구는 PM 승인)
- 규칙 문서: `docs/conventions/code-style.md`(React 패턴: Container/Presentational, useReducer, Controlled Component, 재사용 목록), `docs/conventions/design-system.md`(색 토큰, 모션, 다크 모드 금지, `motion-reduce`)
- 완료:
  - 색은 토큰 클래스만 쓴다. `dark:` 없음. 모션 클래스 없음(U2)
  - `design-guard.js` 통과
  - 끼니를 바꾸면 결과와 결과 알림이 지워지고, 카테고리는 3.6 규칙대로, 국물은 유지
  - 끼니 값은 URL, 저장소, 쿠키 어디에도 없음
  - 링크, 훅 단위 동작은 F-3 자체 점검 통과. 최종 검증은 Q-2

### F-4
- 입력: design 7.2(535~547행), 7.3(549~580행), 2.2(70~133행), 6.1(436~442행), SEO 장(582~600행). ui-ux 화면별 레이아웃(67~123행), 지도 링크(168~172행)
- 범위:
  - `src/app/meal/page.tsx`(서버, `MealPage`, `buildMetadata()`로 메타, `searchParams` 읽지 않음). 구성은 design 6.2 트리
  - `src/app/lunch/today/page.tsx` 삭제
  - `menu.constant.ts`: enum `LUNCH` → `MEAL = 'meal'`, 그룹 label "메뉴 룰렛", href `/meal`, 항목 label "오늘 뭐 먹지", description과 example은 AC-31 단어 제외
  - `menu.type.ts`: `'lunch'` → `'meal'`
  - `theme.constant.ts`: 키와 클래스 `menu-meal`
  - `globals.css`: `--menu-meal`, `--color-menu-meal`, 값 `#a5481f` 그대로
  - `roulette.component.tsx`: `fill-menu-meal`, `stroke-menu-meal` 3곳
  - `sitemap.ts`: `SITEMAP_REDIRECTED_ROUTES`(`/lunch/today`, `/lunch`)로 제외. `/meal`은 `MENU_LIST`에서 자동
  - `ContentWrapperComponent type="meal"`
- 규칙 문서: `docs/conventions/seo.md`(메타, JSON-LD, sitemap), `docs/conventions/design-system.md`(메뉴 색 표), `docs/conventions/code-style.md`(페이지 default export)
- 완료: 로컬 확인 기준은 완료 조건 열에 적은 것. `/lunch/today` 라우트 파일이 없다. 색 값이 바뀌지 않는다. 다른 기능의 `MenuSectionKeyType` 사용처에 타입 오류가 없다.
- 주의: 이 파일들은 다른 메뉴 작업과 병합 충돌이 날 수 있다(충돌 위험 4번).

### PM-1
- 입력: `next.config.ts` 95~113행, design 7.1(518~533행)
- 범위: `redirects()` 배열 끝에 `{ source: '/lunch/today', destination: '/meal', statusCode: 301 }`, `{ source: '/lunch', destination: '/meal', statusCode: 301 }` 추가. 기존 3건은 건드리지 않는다.
- 완료: 두 건 모두 301. `permanent`와 `statusCode`를 같이 쓰지 않는다. F-4와 같은 배포 단위로 나간다.

### PM-R2
- 입력: F-2b 결과와 F-4, F-5 결과. 렌더 확인은 `pnpm build` 뒤 `next start`(PM-3과 같이)
- 범위: 검수 기준 전체, FAQ 7개(design 5.3 목록), 고지 5문장 원문(변경 없음), 메타 설명 문구(SEO 표), 약관·방침의 금지어와 상표
- 완료: 통과 또는 되돌림 기록 완료.

### PM-2
- 입력: `COMPLIANCE.md` 1장 14행, 11장 145~153행. design 8.3(630~639행). `docs/conventions/design-system.md`의 메뉴 색 표
- 범위: 1장 항목 이름과 경로, 11장 항목 이름과 파일 경로, 새 줄(끼니 셋, 음주 금지, 안주 연상 제외 기준), 저작 이력 참조(`docs/menu-meals/copy-log.md`), 법률 상태와 결정일(U-0 뒤). 새 위험 수용 항목 목록은 design 8.3 그대로.
- 완료: COMPLIANCE.md 두 곳 반영. README에 변경 없음 확인. design-system 색 표 한 줄 확인. 결정일이 U-0 결과와 맞음.

### Q-2
- 입력: design 9.1(650~673행), 9.2(674~682행), 보안(683~693행), 상업(695~713행). plan AC-1~AC-35. ui-ux 접근성(210~233행)
- 범위: `e2e/meal.spec.ts` 갱신과 추가(끼니 기본값, 선택지 3개, 끼니 변경 시 결과 지움, 저장소 검사, 위치 권한 없음, 쿠키 거절, 키보드 흐름, 서버 HTML, JSON-LD 2종, BreadcrumbList 이름, 301, 사이트맵). `unit/meal/` 갱신(고정값 대신 끼니별 검사, 금지어, 운세 구조, pick 신규). 세 끼니 스크린샷(320, 360, 390, 1280px). 데스크톱과 모바일 프로젝트 모두 실행. 마지막에 전체 회귀 1회.
- 규칙 문서: `docs/conventions/tech-stack.md`(테스트 도구), `docs/conventions/code-style.md`(테스트 위치)
- 완료: `qa-report.md`에 AC-1~AC-35 대응표. 실패는 해당 dev에게 되돌리고 다시 실행.

### PM-3
- 입력: `package.json` 스크립트. 명령: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `next start` 후 301 응답 확인
- 완료: 세 명령 성공. design 9장과 plan AC 대응 완료. JSON-LD 2종, sitemap 옛 주소 없음, 음주 단어 검사, 보안(시크릿 없음, RLS 해당 없음) 확인.

### U-1
- 배포는 운영 배포이므로 사용자 확인 뒤에 한다(CLAUDE.md 파괴적 변경 규칙). 배포 뒤 검색 등록 작업은 사용자가 한다(M16).

### PM-4
- `docs/TODO.md` 5번 정리, `docs/menu-meals/status.md` 갱신.

## 실행 순서

1. **준비 단계 (병행 가능)**: PM-0. U-0은 사용자 결정 요청으로 병행한다. ARC-1은 PM-0 뒤에 시작한다.
2. **이름 이동 단계 (직렬)**: F-1 → Q-1. 둘 사이에 다른 티켓을 끼우지 않는다. ARC-1과 F-1은 병행 가능하다(파일이 겹치지 않음).
3. **데이터 단계**: F-2a → PM-R1 → F-2b. 셋 다 `src/features/meal/`과 `copy-log.md`를 쓰므로 직렬이다.
4. **병행 구간**: F-5, PM-2, PM-1 작성(PM-1은 F-4 뒤 배포). F-5는 F-2a, F-2b와 파일이 겹치지 않아 동시에 가능하다.
5. **기능 단계 (직렬)**: F-3(ARC-1, F-2b 필요) → F-4(F-3 필요)
6. **검수와 테스트**: PM-R2(F-2b, F-4, F-5 필요) → Q-2(F-4, F-5, PM-1, PM-R2 필요) → PM-3(Q-2 필요)
7. **배포**: U-0 결과로 PM-2 결정일과 F-5 시행일 반영 → 사용자 배포 승인 → 같은 배포에 F-4와 PM-1 포함 → U-1 → PM-4

## 동시 실행 가능

- PM-0 ‖ U-0(사용자 결정)
- ARC-1 ‖ F-1 (파일 겹침 없음. ARC-1은 `docs/menu-meals/design.md`, F-1은 `src/`)
- F-2a ‖ F-5 ‖ PM-2 (`src/features/meal/`, `src/app/terms|privacy`, 루트 `COMPLIANCE.md`)
- F-5 ‖ F-3 ‖ F-4 (F-5는 `src/app/terms`, `src/app/privacy`만 씀)
- PM-1 작성 ‖ F-5 ‖ PM-2 (`next.config.ts`만 씀)
- PM-R1 ‖ F-5

동시 실행 금지: F-1 ↔ Q-1(연속 실행), F-2a ↔ F-2b ↔ F-3 ↔ F-4(`src/features/meal/` 같은 파일), Q-1 ↔ Q-2, Q-2 ↔ F-4(테스트가 바뀌는 중에 화면이 바뀌면 결과가 섞임).

## 충돌 위험

1. `src/features/meal/**`: F-1, F-2a, F-2b, F-3, F-4가 모두 건드린다. 특히 `meal-notice.constant.ts`, `meal.type.ts`, `meal-luck.constant.ts`, 훅, root 컴포넌트. 직렬로만 실행한다.
2. 상수 이름: F-1에서 바뀐 이름을 F-2a에서 한 번 더 바꾼다. 그 뒤 F-3, F-4에서는 상수 이름을 바꾸지 않는다. 바꾸면 Q-2에서 따라간다(설계 6번 항목).
3. `unit/meal/**`, `e2e/meal.spec.ts`: Q-1, Q-2만 고친다. `unit/helpers/`와 `e2e/helpers/`는 다른 기능도 쓰므로 바꾸면 전체 회귀 때 다른 기능 테스트가 깨진다.
4. 공용 파일: `src/constants/menu.constant.ts`, `menu.type.ts`, `theme.constant.ts`, `globals.css`, `roulette.component.tsx`, `sitemap.ts`. F-4에서만 바꾼다. 최근 메뉴 파일 변경이 잦아(design 파일 충돌 위험 장) 다른 기능 브랜치와 병합 충돌이 날 수 있다. 다른 메뉴 작업과 시점을 맞춘다.
5. `src/app/lunch/today/page.tsx`: F-1에서 import만 바꾸고 F-4에서 지운다. 그 사이 다른 티켓이 건드리지 않는다.
6. `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`: F-5만 고친다. 다른 기능도 자주 고치므로 병합 충돌 가능성을 확인한다.
7. `next.config.ts`, `COMPLIANCE.md`, `README.md`, `docs/conventions/*`, `docs/menu-meals/status.md`, `docs/menu-meals/ui-ux-design.md`: PM만 고친다. `guard-files.js`가 agent의 `docs/conventions/`와 `docs/_templates/` 수정을 막는다.
8. `docs/menu-meals/copy-log.md`: F-2a → PM-R1(기록) → F-2b 순서로만 쓴다. 동시에 쓰면 이력이 섞인다.
9. `docs/menu-meals/design.md`: ARC-1만 고친다. 다른 티켓은 설계를 바꾸지 않고 문제가 있으면 PM에게 보고한다.
10. `src/lib/`(`seo.ts`의 `buildMetadata`, `getOgTag`, `random`): frontend-dev가 쓸 수 없다. 메타 변경이 `src/lib/`를 요구하면 backend-dev 또는 PM 판단으로 넘긴다. 이 티켓들은 인자만 넘긴다고 적었다.
11. 삭제 명령: `rm -rf`는 차단된다. F-1, F-4 삭제는 파일 단위 `rm`과 `rmdir`로 한다.
12. 디자인 가드: F-3, F-4에서 tsx를 고칠 때마다 `design-guard.js`가 색 하드코딩, `dark:`, CSS 애니메이션 `motion-reduce` 누락을 본다. 이 설계에는 새 모션이 없으므로 `motion-reduce`는 해당 없음.
13. U3 설계 보완(ARC-1)이 끝나기 전 F-3 시작 금지. 승인 없이 F-3이 알림 문장을 넣으면 design 6.3과 어긋난다.
14. 배포 순서: F-4(`/meal` 페이지)와 PM-1(301)은 같은 배포에 나간다. 하나만 나가면 404 또는 중복 페이지가 생긴다.
