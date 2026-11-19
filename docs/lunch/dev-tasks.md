# lunch 개발 티켓

입력: `docs/lunch/design.md` (승인 2026-11-19, U1~U7 반영 1.3장), `docs/lunch/ui-ux-design.md` (승인 2026-11-19, U1~U7 추천안), `docs/lunch/plan.md` (AC 기준, 승인 2026-11-19), `docs/lunch/status.md`
작성: dev-lead, 2026-11-19
상태: 개발 준비 완료. 사용자 결정 1~4(「사용자가 정할 것」)가 풀리기 전에는 해당 티켓을 시작하지 않는다. 결정이 필요 없는 티켓(T-01, T-02, T-05, T-16 초안 작성 등)은 먼저 진행해도 된다.

## 0. 승인 결정 반영 확인

| 항목 | 결정 | 티켓 반영 |
|---|---|---|
| U1 회전 | 1.0초, 시계 방향 2바퀴 + 목표 각도, ease `[0.2, 0.7, 0.2, 1]` | T-01 |
| U2 칸 글자 | 1~12칸 큰 글자, 13~28칸 작은 글자, 29칸 이상 글자 없음. 공용 컴포넌트가 `items.length`로 정함 | T-01 |
| U3 버튼 하나 | 돌림판 아래 버튼 하나. 라벨 "룰렛 돌리기" / "다시 뽑기"(done일 때만). 결과 카드 안 버튼 없음 | T-10, T-12 |
| U4 소개 압축 | h1 → 고지 → 소개 → 도구 순서 유지, 소개 두세 줄 | T-11 |
| U5 보상 없음 문구 | "룰렛 결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 무관한 오락입니다." | T-06(상수), T-11(서버 블록) |
| U6 메뉴 색 | 점심 `colorClass` `text-orange-600` → `text-menu-lunch`. `design-system.md` 변경 없음 | T-05 |
| U7 후보 0개 | "국물 조건 없애기" 버튼. 기존 `SET_BROTH('all')`만 사용. 누른 뒤 뽑기 버튼으로 포커스 이동 | T-10, T-12 |
| L1 돌림판 위치 | 공용 `src/components/common/roulette.component.tsx` + `src/types/roulette.type.ts` | T-01 |
| L2 국물 경계 | 냉면 국물, 백반 비국물, 누룽지탕 국물, 소바 비국물, 어묵 국물 | T-03 |
| L3 약관 번호 | 점심 새 장을 넣고 뒤 장 번호를 조정. `COMPLIANCE.md` 장 번호 언급도 같이 고침 | T-18, T-19 |
| L4 점심운 | 카테고리별 4줄, 24줄 | T-06, T-08 |
| L6 메뉴 설명·예시 | description "룰렛으로 오늘의 점심 메뉴를 무작위로 뽑고 지도에서 찾아보기.", example "예: 한식·분식만 골라 국물 메뉴로 룰렛 돌리기" | T-05 |
| Q5 지도 링크 | 새 탭. `target="_blank"`, `rel="noopener noreferrer nofollow"`. 라벨 "지도에서 찾아보기" | T-09, T-12 |
| Q13 문구 | title "오늘 뭐 먹지 - 점심 메뉴 룰렛", keywords에 "점심 메뉴 추천" 유지 | T-04 |

설계 문서와 현재 파일의 차이 (PM 확인 필요, 티켓은 아래 기준으로 작성)

- 약관 장 번호: design 12.1은 제3자 서비스 장을 "현재 11장"이라고 적었다. 실제 `src/app/terms/page.tsx`는 8장 "꿈 해몽 서비스"가 이미 들어가 있고, 책임 제한 및 제3자 서비스는 12장, 문의는 18장이다. 점심 장은 8장 다음인 9장으로 넣고, 기존 9~18장은 10~19장으로 밀린다. 제3자 장은 12장에서 13장이 된다. 이 번호로 T-18, T-19를 진행한다. design 12.1 표기는 architect가 정정한다(PM 판단).
- `COMPLIANCE.md` 11장 본문의 약관 장 번호 언급(예: "Terms (chapter 12)")은 점심 장 삽입 뒤 번호가 바뀐다. T-19에서 본문을 읽어 의미 기준으로 다시 맞춘다.
- `docs/lunch/ui-ux-design.md` 1행 아래 "상태: 승인 대기" 문구가 남아 있다. 승인(2026-11-19, U1~U7)으로 고친다(PM).
- `src/features/lunch/lunch-dev-guide.md`는 이전 B안(위치 기반, 5km 반경, 날씨 추천, 식당 목록)을 담은 옛 문서다. 현재 방향과 맞지 않는다. 개발 담당은 이 문서를 참고하지 않는다. 처리는 사용자 결정 6.
- `supabase/migrations/0003_restaurants.sql`은 작업 트리에 없다(2026-11-19 확인). 점심 개발은 DB를 쓰지 않는다. 저장소 밖 `지역음식점 파일/` 처리는 사용자 결정 7.

## 티켓

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 참조 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| DB-0 | 없음 | DB, 테이블, 마이그레이션, API, 환경변수 없음. db-dev 불필요 | - | - | design 0, 11, 13장 | 해당 없음 | 없음 |
| PM-0 | PM(메인 세션) | 꿈 해몽 변경 커밋 상태 확인. `menu.constant.ts`, `terms`, `privacy`, `COMPLIANCE.md`에 꿈 변경이 남아 있으면 커밋하거나 점심 편집 시점을 조정 | - | git 작업 트리 | design 19장, dream dev-tasks 충돌 절 | 위 파일의 꿈 변경이 커밋되었거나, 점심 담당과 같은 파일을 동시에 편집하지 않는다는 기록 | 완료 |
| T-01 | frontend-dev | 공용 돌림판. `RouletteItemType`, `RoulettePropsType`(5.2 그대로), 회전(U1), 칸 글자 3단계(U2), 칸 수 0/1/2 예외, `items` 변경 시 각도 0 리셋, 동작 줄이기 처리, 인라인 SVG, 토큰 색만 | - | `src/types/roulette.type.ts`, `src/components/common/roulette.component.tsx` | design 5장(304~371), 1.3 U1·U2. ui 돌림판 비주얼(199~238), 모션(335~358), 접근성 돌림판 항목(372~400), 개발 확인 사항(429~431) | typecheck 통과. `features/` import 0건(grep). `Math.random` 0건. 칸 수 1, 2, 6, 12, 13, 28, 29, 48에서 렌더 확인. 동작 줄이기에서 최종 각도로 즉시 놓고 `onSpinEnd`를 다음 틱에 1회 호출 | 완료 |
| T-02 | frontend-dev | 점심 타입과 카테고리. `lunch.type.ts`(3.1 그대로), `lunch-category.constant.ts`(6개, 순서 한식·중식·일식·양식·분식·세계·기타) | - | `src/features/lunch/types/lunch.type.ts`, `src/features/lunch/constants/lunch-category.constant.ts` | design 2장(82~135), 3.1, 3.2 | typecheck 통과. 타입 이름과 필드가 3.1과 같다. 카테고리 6개, 순서 일치 | 완료 |
| T-03 | frontend-dev | 메뉴 48개 데이터 작성과 검수. `lunch-menu.constant.ts`(`as const satisfies readonly LunchMenuType[]`, `LUNCH_MENUS`, `LUNCH_MENU_COUNT = 48`). 이름, 카테고리, 국물은 3.3 표를 그대로 옮긴다. id 부여, `mapQuery` 없음, 카테고리마다 구분 주석 한 줄. 상세 절차는 「메뉴 데이터 작성·검수」 | T-02 | `src/features/lunch/constants/lunch-menu.constant.ts` | design 3.2, 3.3(202~218), L2(1.1, 20장) | typecheck 통과. 48개, soup 15 / dry 33, 카테고리별 10/8/8/8/6/8. 국물 경계 5개가 L2와 같다. id가 `/^[a-z]+(-[a-z]+)*$/`에 맞고 40자 이하, 중복 없음. 사용자 표기 확인(순대국 등) 기록 | 완료 |
| T-04 | frontend-dev | 지도·SEO 상수. `lunch-map.constant.ts`(카카오·네이버 key, 링크 이름, 호스트·경로 앞부분 고정). `lunch-seo.constant.ts`(title, description 초안, keywords 7개, OG alt, pathname `/lunch/today`, 브레드크럼 이름) | T-02 | `src/features/lunch/constants/lunch-map.constant.ts`, `src/features/lunch/constants/lunch-seo.constant.ts` | design 6.1, 6.2, 10장, 13장. plan Q13 | typecheck 통과. keywords에 "주변 음식점 찾기", "점심 식당 찾기"가 없다. 호스트 상수가 `map.kakao.com`, `map.naver.com`으로 고정. description의 "지도 앱에서"는 웹 검색 링크이므로 CP-2에서 사용자 확인 | 완료 |
| T-05 | frontend-dev | 메뉴 등록 정정. `menu.constant.ts` 점심 항목의 `description`, `example`(L6 문구), `colorClass`(`text-menu-lunch`, U6). `comingSoon: true`는 그대로 둔다(F-11 전까지). 꿈 그룹은 건드리지 않는다 | PM-0 | `src/constants/menu.constant.ts` | design 9장(563~577), 1.3 U6, 20장 L6. ui 메뉴·헤더(269~272), 색상 통일(55~61) | 점심 항목에 `text-orange-600` 0건. "가격", "혼밥", "별점", "후기", "조건에 맞게 추천" 0건. `comingSoon: true` 유지. typecheck 통과 | 완료 |
| T-06 | frontend-dev | 문구 초안(CP-1). `lunch-luck.constant.ts`(카테고리별 샘플 1줄씩 6줄, 구조는 `Readonly<Record<LunchCategoryKeyType, readonly string[]>>`). `lunch-notice.constant.ts`(상시 오락 고지, 무작위 고지, U5 보상 없음 문장, 외부 링크 안내, 결과 하단 고지, 빈 상태 안내 2종, 버튼 라벨 3종, 결과 알림 문장 함수, noscript 안내, 지도 묶음 제목, 점심운 라벨). `lunch-faq.constant.ts`(4~5개 초안). `docs/lunch/copy-log.md` 생성 | T-02 | `src/features/lunch/constants/lunch-luck.constant.ts`, `lunch-notice.constant.ts`, `lunch-faq.constant.ts`, `docs/lunch/copy-log.md` | design 3.4, 7.1~7.3, 8.2. ui 문구 표(274~304), 점심운 톤(306~310), 빈 상태(181~190), noscript(264~267) | 샘플 6줄과 초안 상수 typecheck 통과. 초안 문장에 7.3 금지 표현이 없다(자체 grep). 메뉴 이름과 국물 언급이 없다. copy-log에 작성자, 날짜, 상태(초안) 기록 | 완료 |
| CP-2 | 사용자 | 문구 샘플 검수. 점심운 샘플 6줄, 고지·FAQ 초안, SEO description 문구("지도 앱에서" 표현), 메뉴 표기(순대국 등) 확인 | T-06, T-03 | `docs/lunch/copy-log.md` 검수 칸 | design 3.4(작성 순서), 7.1 | 승인 또는 수정 지시가 copy-log에 기록됨. 수정이면 T-06 재작업 | 대기(사용자 결정 2) |
| T-07 | frontend-dev | 문구 최종(CP-3). 점심운 나머지 18줄(카테고리당 3줄 추가, 합계 24줄). CP-2 수정 반영. `lunch-copy-rule.constant.ts` 신설(`LUNCH_FORBIDDEN_TERMS`, `LUNCH_COPY_ALLOWED_SENTENCES`는 고지 5문장만). copy-log 최종 행 | CP-2 | `lunch-luck.constant.ts`, `lunch-notice.constant.ts`, `lunch-faq.constant.ts`, `lunch-copy-rule.constant.ts`, `docs/lunch/copy-log.md` | design 3.4, 7.2, 7.3, 14.1. ui 문구 표(274~304) | 점심운 24줄(카테고리당 4줄, 중복 없음). 금지 표현 0건(허용 문장 제외). 허용 문장은 고지 5개뿐 | 완료 |
| T-08 | frontend-dev | 조건 계산. `lunch-pick.util.ts`(`filterLunchMenus`, `pickLunchMenu`, `pickLunchLuckLine`), `lunch-map-link.util.ts`(검색어, URL 만들기). 난수는 `secureRandomInt`만 쓴다 | T-03, T-04, T-06 | `src/features/lunch/utils/lunch-pick.util.ts`, `src/features/lunch/utils/lunch-map-link.util.ts` | design 4.1~4.5(227~302), 6.1(375~385) | 시그니처가 4.1과 같다. 난수 인자는 기본값 `secureRandomInt`. 직전 메뉴 제외는 후보 2개 이상일 때만. 후보 0개면 null. 검색어는 `mapQuery ?? name`, 쿼리 파라미터 없음. typecheck 통과 | 완료 |
| T-09 | frontend-dev | 화면 상태 훅. `today/hooks/use-lunch-today.hook.ts`, useReducer 1개. 액션 4종(`TOGGLE_CATEGORY`, `SET_BROTH`, `SPIN_START`, `SPIN_END`), 파생 값은 렌더링 중 계산 | T-08 | `src/features/lunch/today/hooks/use-lunch-today.hook.ts` | design 8.3(494~534), 4.3~4.5, 5.4 포커스(360~370), 8.4(536~544) | 상태 표(8.3)와 같은 전이. 회전 중 조건 변경 무시. `spinId` 불일치 `SPIN_END` 무시. 라벨은 `spin.status === 'done'`으로만 정함. 저장소, Context, URL 상태 없음(grep) | 완료 |
| T-10 | frontend-dev | 서버 컴포넌트 묶음. `disclaimer-notice`(h1 아래 상시 고지), `intro`(소개 압축 + 사용 순서 h2 "이렇게 이용합니다"), `random-notice`(무작위 + U5 보상 없음), `faq`(LUNCH_FAQ 목록), `noscript-notice` | T-06, T-04 | `src/features/lunch/today/components/disclaimer-notice.component.tsx`, `intro.component.tsx`, `random-notice.component.tsx`, `faq.component.tsx`, `noscript-notice.component.tsx` | design 7.2(425~437), 8.1, 8.2(456~487), 10장. ui 머리 영역(102~118), 무작위·보상 고지(164행 근처), FAQ(260~262), noscript(264~267) | 모두 서버 컴포넌트('use client' 없음). h1 없음. 금지 표현 없음. FAQ 질문·답은 `LUNCH_FAQ` 한 배열만 참조 | 완료 |
| T-11 | frontend-dev | 클라이언트 화면 컴포넌트. `root.component.tsx`(LunchTodayComponent, 'use client'), `filter-panel`, `spin-panel`(돌림판 + 버튼 하나, U3), `status`(role="status", sr-only, 항상 마운트), `result`(메뉴 h2, 배지, 점심운, 지도 묶음, 결과 하단 고지, PC 결과 자리 표시), `map-links`(새 탭 링크 2개, 외부 이동 표시, 외부 링크 안내) | T-01, T-08, T-09, T-06 | `src/features/lunch/today/components/root.component.tsx`, `filter-panel.component.tsx`, `spin-panel.component.tsx`, `status.component.tsx`, `result.component.tsx`, `map-links.component.tsx` | design 4.2(258~276), 5.2~5.4(316~370), 6.2(387~406), 8.2, 8.4, 8.5. ui 필터 패널(170~190), 돌림판 패널(192~197), 결과 카드(240~250, 자리 표시 포함), 지도 링크(252~258), 상태 표(312~333), 접근성(372~400) | 탭 순서: 칩 → 국물 → (국물 조건 없애기) → 뽑기 버튼 → 지도 링크 2개. 같은 버튼이 "룰렛 돌리기"에서 "다시 뽑기"로 바뀐다. 결과 카드에 버튼 없음. 회전 중 `aria-disabled`, `aria-busy`. 링크 `target="_blank"`, `rel="noopener noreferrer nofollow"`, `window.open` 없음(grep). 아이콘만 있는 조작 요소 없음. `ref` prop으로 뽑기 버튼 포커스 이동(forwardRef 금지) | 완료 |
| T-12 | frontend-dev | 페이지 조립. `src/app/lunch/today/page.tsx`: `ComingSoonComponent` 제거, `LunchTodayPage`(서버, 정적). `buildMetadata()` 펼치고 `robots: { index: false, follow: true }`로 덮어쓴다(F-11 전까지). JSON-LD 2개(BreadcrumbList, FAQPage). h1 "오늘 뭐 먹지" 하나 | T-10, T-11, T-04, T-07 | `src/app/lunch/today/page.tsx` | design 8.1, 8.2(트리), 10장(579~598). plan AC-34~36 | typecheck 통과. 서버 HTML에 h1, 설명, 고지, 사용 순서, FAQ 텍스트가 있다. JSON-LD는 BreadcrumbList와 FAQPage뿐. noindex 유지. `comingSoon`은 건드리지 않는다 | 완료 |
| T-13 | qa | 데이터·문구·정적 소스 검사 `e2e/lunch-copy.spec.ts`를 작성한다. 작성은 T-03 뒤에 시작할 수 있고, 실행은 T-07 뒤에 한다 | T-03(작성), T-07(실행) | `e2e/lunch-copy.spec.ts` | design 14.1(654~671), 7.3. plan AC-10~12, 15, 16, 29, 39, 40 | 데스크톱 프로젝트에서 실행. 14.1 표의 모든 행이 테스트로 있다. 점심운 문구에 메뉴 이름과 "국물"이 없다는 검사를 추가한다(설계에 없음, 아래 충돌 절 참고) | 완료 |
| T-14 | qa | 화면 검사 `e2e/lunch.spec.ts`(데스크톱, 모바일). 고정 난수는 `addInitScript`로 `crypto.getRandomValues`를 0으로 덮는다. 새 탭 링크는 `context.route`로 가로채고 `popup` 이벤트로 확인 | T-12 | `e2e/lunch.spec.ts` | design 14.2(673~720), 14.2 새 탭 절(683~692), 1.2 변경 기준(53~66). plan AC-1~40 | 두 프로젝트에서 실행. 운영 코드에 테스트 전용 경로가 없다(grep). 1.2 기준(AC-18 버튼 위치, AC-20 라벨 복귀, AC-29 U5 문장) 반영 | 완료 |
| T-15 | PM(메인 세션) | 법적 문구 초안 `docs/lunch/legal-draft.md` 작성. 내용: 이용약관 9장 점심 장 문구, 13장 제3자 장에 지도 링크 추가 문장, 개인정보처리방침 6장 한 문단, `COMPLIANCE.md` 11장 점심 항목(영문 형식), Q11 위험 수용 기록 문장 후보 | - | `docs/lunch/legal-draft.md` | design 12.1~12.3(611~640), 17장(754~770). plan 법적 절(192~236). `COMPLIANCE.md` 11장 타로·운세 항목 형식 | 초안에 장 번호가 실제 번호(9장, 13장)로 적힘. 금지 표현 없음. 사용자 승인 요청 메시지 준비 | 완료 |
| T-16 | 사용자 | 법적 초안 승인(L 결정) | T-15 | `docs/lunch/legal-draft.md` | design 12, 17장 | 승인 또는 수정 지시 기록 | 완료(사용자 위임, PM 확인) |
| T-17 | frontend-dev | 이용약관과 개인정보처리방침 반영. 약관 `src/app/terms/page.tsx`: 9장 점심 장 신설, 기존 9~18장을 10~19장으로, 제3자 장 12 → 13장. 방침 `src/app/privacy/page.tsx`: 6장 "외부 서비스" 목록 아래 한 문단(처리위탁 목록 안에는 넣지 않음). 꿈 해몽 장(8장)과 문구는 그대로 둔다 | T-16, PM-0 | `src/app/terms/page.tsx`, `src/app/privacy/page.tsx` | design 12.1, 12.2(613~626), 19장(796~807). plan AC-30 | 약관에 점심 장과 번호 연속성 확인(grep으로 장 제목 목록). 방침 6장에 한 문단. 두 파일을 같은 시점에 다른 담당이 고치지 않는다 | 완료 |
| T-18 | PM(메인 세션) | `COMPLIANCE.md` 11장 점심 항목 추가. 약관 장 번호 언급을 실제 번호에 맞춘다(본문 확인). `README.md` 기능 목록 점심 항목(공공데이터 설명이 있으면 정리), `REFACTORING.md` 34~37행 정정. `THIRD_PARTY_NOTICES.md`는 변경 없음을 확인 | T-17 | `COMPLIANCE.md`, `README.md`, `REFACTORING.md` | design 12.3(628~640), 13장(642~648), 15장(729~738). plan Q19 | 11장에 점심 항목 존재(T-21에서 확인). 장 번호 언급이 실제 약관과 맞다. README 환경변수, API, 테이블 표는 변경 없음 | 완료 |
| T-19 | qa | 회귀 실행과 보고. 데스크톱: lunch 2개, `tarot-copy`, `fortune-copy`, `fortune-calc`, 약관 문자열을 보는 기존 스펙(타로·운세·꿈), `fortune-v2`(AC-9). 모바일: lunch 2개. `docs/lunch/qa-report.md` 작성 | T-13, T-14, T-17, T-18 | `docs/lunch/qa-report.md`, e2e 실행만 | design 14.3(723~727), 15장. plan AC-1~40 | AC-1~40 결과 기록. 실패는 담당에게 되돌림. 전체 통과 후 재실행 없음 | 완료 |
| T-20 | PM(메인 세션) | 최종 검증. `pnpm typecheck`, `pnpm lint`, `pnpm build`. 디자인 명세 확인, 보안·법적 고지 확인, 메타·JSON-LD 확인(출시 전 상태). `docs/lunch/status.md` 갱신 | T-19 | - | CLAUDE.md 흐름 7단계. design 16장(보안), 17장 | 세 명령 통과. 실패는 담당에게 되돌림 | 완료 |
| T-21 | frontend-dev | 출시 작업(F-11). `comingSoon: true` 제거(`menu.constant.ts`), `page.tsx`의 robots 덮어쓰기 제거. 15장 체크리스트가 끝난 뒤에만 한다 | 사용자 결정 5, 15장 완료, T-19 통과 | `src/constants/menu.constant.ts`, `src/app/lunch/today/page.tsx` | design 9장(569~570), 10장, 15장 마지막 항목. plan AC-37, AC-38 | `/sitemap.xml`에 `/lunch/today` 포함. 메뉴에 "준비 중" 없음. canonical·og가 `buildMetadata` 결과와 같음. T-19 AC-36~38 재실행 | 완료(사용자 위임, PM 확인) |

## 메뉴 데이터 작성·검수 절차 (T-03)

- 이름, 카테고리, 국물 값은 design 3.3 표의 글자를 그대로 쓴다. 새로 고르지 않는다. 바꾸려면 사용자 승인을 받는다.
- id는 영문 소문자와 하이픈으로 정한다. 예: `kimchi-jjigae`, `jjajangmyeon`, `donkatsu`, `pasta`. 같은 이름의 다른 표기(예: `jjamppong`과 `jjambbong`)가 생기지 않게 한 번에 48개를 목록으로 적고 중복을 본다.
- 검수 세 단계: (1) 개발 담당이 3.3 표와 1:1로 대조하고 개수와 국물 수를 센다, (2) dev-lead가 표와 파일을 다시 대조한다, (3) T-13 데이터 검사가 개수, 중복, id 형식, 카테고리 6개 이상을 본다.
- 표기 변경은 사용자 확인 대상이다. 특히 "순대국"(설계 표기)과 "순댓국"은 CP-2에서 확인한다.
- 메뉴 설명이나 사진은 넣지 않는다(Q8, Q20).
- `mapQuery`는 1차에 넣지 않는다. 출시 전 확인에서 이름 검색이 어색한 메뉴(튀김, 어묵, 백반 등)가 나오면 그때 보정한다.

## 문구 작성 절차 (copy-log 요약, T-06~T-07)

- 작성 담당은 frontend-dev 에이전트 한 명으로 한다(사용자 결정 1). 메인 세션(PM)이 직접 쓰지 않는다.
- 작성자는 다른 사이트의 풀이 문장, 메뉴 소개 문장, 외부 문구를 보지 않는다. 설계서와 ui 문구 표만 근거로 쓴다.
- 점심운 24줄은 같은 파일 하나에 들어가므로 병렬 작성하지 않는다. 카테고리를 나눠 병렬로 쓰면 파일과 copy-log가 충돌한다. 순서는 샘플 6줄 → 사용자 검수 → 나머지 18줄이다.
- 고지, FAQ, SEO 문구는 점심운과 다른 파일이므로 같은 담당이 이어서 쓴다. 필요하면 점심운 작업과 나란히 할 수 있으나 copy-log 쓰기는 한 번에 한 담당만 한다.
- 점심운 문장 규칙(design 3.4): 합니다체, 한 문장, 가벼운 가능성 표현("~일 수 있습니다", "~어떨까요"), 맛·건강·영양·효능 설명 없음, 메뉴 이름과 국물을 말하지 않음, 금지 표현(design 7.3) 없음.
- FAQ 답에서 "보장"은 쓰지 않는다. 상시 고지 문장("보장하지 않습니다")만 예외다. FAQ에서 결과가 보장되는지 물을 때는 "정확성이나 영업 여부를 약속하지 않습니다"처럼 다른 말로 답한다.
- copy-log 행에는 문구 ID(카테고리, 순번), 작성자, 작성일, 상태(초안, 검수 승인, 확정)를 적는다.
- 웹 검색 유사도 점검은 design에 없으므로 기본은 하지 않는다. 필요하면 사용자 결정 8.

## 실행 순서

0단계 (지금, 코드 없음)
- 사용자 결정 1~8 중 1~4를 먼저 받는다(「사용자가 정할 것」).
- PM-0: 꿈 해몽 변경 커밋 상태 확인.
- T-15: 법적 초안 작성(PM).

1단계 (병렬, 파일 겹침 없음)
- T-01(공용 돌림판), T-02(타입·카테고리), T-05(메뉴 등록 정정, PM-0 뒤), T-15(PM 초안).

2단계 (병렬, T-02 뒤)
- T-03(메뉴 48개), T-04(지도·SEO 상수), T-06(문구 초안, copy-log 생성). 세 개는 파일이 다르다.
- T-13 작성(qa)은 T-03 뒤에 시작해도 된다. 실행은 아직 하지 않는다.

3단계 (사용자 검수 대기 중에 할 수 있는 것)
- CP-2(사용자 검수, T-06 · T-03 뒤).
- T-08(조건 계산, T-03·T-04·T-06 뒤): 샘플 상수로 시작해도 되고 최종 문구가 와도 된다.
- T-10(서버 컴포넌트, T-06·T-04 뒤): 문구 상수 모양만 필요하므로 검수 전에 시작할 수 있다.
- T-16(사용자 법적 초안 승인, T-15 뒤).

4단계 (CP-2 승인 뒤, T-16 승인 뒤)
- T-07(문구 최종, CP-2 뒤).
- T-17(약관·방침, T-16과 PM-0 뒤). T-07과 파일이 다르므로 동시 가능.
- T-09(훅, T-08 뒤).

5단계 (병렬, T-01·T-08·T-09 뒤)
- T-11(클라이언트 컴포넌트, T-01·T-08·T-09·T-06 뒤). 이 단계에서 T-07과 동시에 해도 파일이 다르다. 최종 문구가 바뀌면 상수만 고친다.

6단계
- T-12(페이지 조립, T-10·T-11·T-04·T-07 뒤).
- T-14 작성(qa, T-12 뒤). 실행은 T-12 뒤.

7단계 (qa 실행은 한 번에 하나만)
- T-13 실행(T-07 뒤) → T-14 실행(T-12 뒤). 두 실행을 동시에 돌리지 않는다(test-results 충돌).
- T-18(COMPLIANCE, README, REFACTORING, T-17 뒤).

8단계
- T-19(회귀 실행과 qa-report, T-13·T-14·T-17·T-18 뒤).
- T-20(PM 최종 검증, T-19 뒤).

보류
- T-21(출시 작업): 사용자 결정 5(출시 일정)와 법률 확인(Q6, Q11, Q17, Q20)이 끝난 뒤에만 한다. 이 배치에서 하지 않는다.

각 단계가 끝날 때 PM이 `pnpm typecheck`를 한 번 돌린다. 실패하면 해당 담당에게 되돌린다.

## 동시 실행 가능

- 1단계 4개(T-01, T-02, T-05, T-15)는 파일이 겹치지 않는다.
- 2단계 3개(T-03, T-04, T-06)는 파일이 다르다. copy-log는 T-06만 쓴다.
- T-10(서버 컴포넌트)과 T-08(조건 계산)은 파일이 다르므로 동시 가능.
- T-07(문구 최종)과 T-17(약관·방침)은 동시 가능.
- T-07과 T-11은 파일이 다르므로 동시 가능. 단 T-11 완료 후 문구 변경이 있으면 T-11 결과를 다시 본다.
- qa 실행(T-13, T-14, T-19)은 동시에 돌리지 않는다. qa 작성(T-13 작성, T-14 작성)은 다른 담당과 동시 가능.
- 순서가 필요한 것: T-02 → T-03, T-04, T-06 → T-08 → T-09 → T-11 → T-12. T-01 → T-11. T-06 → CP-2 → T-07 → T-12. T-15 → T-16 → T-17 → T-18. 모든 것 → T-19 → T-20.

## 가드 범위 점검 (`.claude/hooks/guard-files.js`)

| 파일 | 담당 | 가드 결과 | 조치 |
|---|---|---|---|
| `src/components/common/roulette.component.tsx` | frontend-dev | 허용. frontend-dev 범위에 `src/components/`가 있어 공용 폴더도 된다 | 없음. 공용이지만 frontend-dev가 만든다 |
| `src/types/roulette.type.ts` | frontend-dev | 허용(`src/types/`) | 없음 |
| `src/features/lunch/**` | frontend-dev | 허용(`src/features/`) | 없음 |
| `src/features/lunch/lunch-dev-guide.md` | 모든 개발 담당 | 허용되지만 옛 방향 문서 | 참고 금지. 처리는 사용자 결정 6 |
| `src/app/lunch/today/page.tsx`, `src/app/terms/page.tsx`, `src/app/privacy/page.tsx` | frontend-dev | 허용(`src/app/`, `api/` 제외) | 없음 |
| `src/constants/menu.constant.ts` | frontend-dev | 허용(`src/constants/`) | 없음. 꿈 변경과 충돌은 PM-0 |
| `src/lib/random.ts` (`secureRandomInt`) | frontend-dev | 차단 대상(`src/lib/`는 frontend-dev 범위 밖). 점심 설계는 이 파일을 고치지 않는다 | 호출만 한다. 수정이 필요해지면 backend-dev 몫으로 PM에게 보고 |
| `e2e/lunch.spec.ts`, `e2e/lunch-copy.spec.ts` | qa | 허용(`e2e/`) | 없음 |
| `docs/lunch/*.md` (copy-log, legal-draft, qa-report, status, dev-tasks) | frontend-dev, qa, dev-lead, PM | 허용(`docs/`) | 없음 |
| `docs/conventions/design-system.md` | - | 점심 변경 없음(U6은 기존 토큰) | 없음 |
| `COMPLIANCE.md`, `README.md`, `REFACTORING.md`(루트) | 모든 agent | 차단(어느 agent 범위에도 루트 문서가 없다) | PM이 직접 편집(T-18) |
| `THIRD_PARTY_NOTICES.md`, `DEPENDENCY_LICENSES.md`, `next.config.ts` | - | 점심 변경 없음 | 확인만 |
| `src/app/sitemap.ts` | - | 점심은 수정하지 않는다(design 9장, 14.3, 19장). 출시 뒤 목록에는 `/lunch/today`가 자동으로 들어간다 | 없음 |
| `src/app/api/` | - | 점심은 API 없음 | 없음 |

## 사용자가 정할 것

1. 문구 작성 담당. 기본안: frontend-dev 에이전트 한 명이 직렬로 쓴다(T-06, T-07). 대안: 메인 세션이 직접 쓰는 것은 PM 직접 작성 금지 규칙과 맞지 않아 권하지 않는다.
2. CP-2 검수: 점심운 샘플 6줄, 고지·FAQ 초안, SEO description의 "지도 앱에서" 표현(웹 링크이므로 "지도에서"로 다듬는 안을 dev-lead가 제안한다), 지도 묶음 제목. 승인 뒤 나머지 작성.
3. 메뉴 표기: "순대국" 유지 여부, 3.3 표의 나머지 이름 최종 승인(T-03 뒤).
4. 법적 초안 승인(T-16): 약관 9장, 13장 문장, 방침 6장 문단, `COMPLIANCE.md` 11장 초안. 승인 뒤 T-17, T-18을 진행한다.
5. 출시 일정(Q18)과 출시 조건. 출시 전 법률·정책 확인 항목은 다음과 같다. Q6 사행성 관련 규제 해당 여부, Q11 위치정보·14세 미만 판단과 `COMPLIANCE.md`의 "위험 수용" 또는 "검토 완료" 기록, Q20 식품 표시·광고 기준, Q17 지도 링크 정책과 모바일·인앱 브라우저 동작. 이 확인이 끝나기 전에는 T-21을 하지 않는다.
6. `src/features/lunch/lunch-dev-guide.md`(옛 B안 문서) 처리. 보관 이동(`docs/lunch/archive/`) 또는 삭제. 삭제는 사용자 확인 뒤에만 한다.
7. Q9: `supabase/migrations/0003_restaurants.sql`(작업 트리에 없음)과 저장소 밖 `지역음식점 파일/` 처리. 점심 개발과 무관하며 사용자가 정한다.
8. 웹 검색 유사도 점검 여부. design에 없다. 필요하면 dream처럼 샘플 점검을 추가한다(T-06 뒤, 문구 확정 전).

## 충돌 위험

| 파일 | 이 기능 | 다른 쪽 변경 | 위험 | 처리 |
|---|---|---|---|---|
| `src/constants/menu.constant.ts` | T-05(점심 항목 description, example, colorClass), T-21(comingSoon 제거) | 꿈 해몽 그룹 추가가 같은 파일에 있음(작업 트리에 미커밋 변경) | 높음. 인접 줄 | PM-0. 꿈 변경을 먼저 커밋. 점심은 한 담당씩 |
| `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`, `COMPLIANCE.md` 11장 | T-17, T-18 | 꿈 해몽 8장과 처리방침 1장 문단, 꿈 항목(이미 반영) | 높음. 장 번호 밀림 | 꿈 반영본을 기준으로 점심이 번호를 민다. 한 번에 한 담당. COMPLIANCE는 PM만 |
| 약관 장 번호 언급(`COMPLIANCE.md` 본문, 다른 문서) | T-18 | 점심 장 삽입으로 9장 이후 번호 변경 | 중간 | T-18에서 실제 번호로 맞춤. design 12.1 표기 정정은 architect |
| `src/app/sitemap.ts` | 없음(점심은 고치지 않음) | 꿈 해몽 상세 120개 추가 가능 | 낮음. 점심이 고치면 fortune-v2 AC-9가 깨진다 | 점심은 수정 금지. 수정 요청이 생기면 T-19 목록을 다시 본다 |
| `src/components/common/roulette.component.tsx`, `src/types/roulette.type.ts` | T-01 | 후속 "운빨 뽑기 도구"(사다리타기, 제비뽑기)가 나중에 사용 | 중간 | 이번에는 T-01 한 담당만 만든다. props나 글자 3단계를 나중에 바꾸면 점심 회귀를 돌린다 |
| `src/features/lunch/constants/lunch-luck.constant.ts`, `lunch-notice.constant.ts`, `lunch-faq.constant.ts`, `docs/lunch/copy-log.md` | T-06, T-07 | 같은 담당이 순차 작성 | 중간 | 작성 직렬. copy-log 쓰기는 한 번에 한 담당 |
| `e2e/lunch*.spec.ts`와 `test-results/` | T-13, T-14, T-19 | 실행 동시성 | 중간 | qa 실행은 한 번에 하나만 |
| `e2e/fortune-v2.spec.ts`(AC-9) | T-19 회귀 | `git diff` 기반 검사. 점심은 sitemap을 고치지 않으므로 영향 없음. 약관·방침 파일이 목록에 있는지 T-19에서 확인 | 낮음 | 목록에 약관·방침이 있으면 QA가 보고하고 사용자 결정 |
| 약관·방침 문자열 검사 기존 스펙(타로·운세·꿈) | T-19 회귀 | 장 번호 변경 | 중간 | 장 번호까지 보는 검사면 점심 번호에 맞춰 같은 커밋에서 고친다 |
| `src/features/lunch/lunch-dev-guide.md` | 모든 개발 담당 | 옛 B안(위치, 날씨, 5km) 내용 | 중간. 잘못 따르면 방향이 틀린다 | 참고 금지를 티켓에 적음. 처리는 사용자 결정 6 |
| `docs/lunch/ui-ux-design.md` 헤더 | - | "승인 대기" 문구 잔존 | 낮음 | PM이 승인 표기로 고침 |
| `src/lib/random.ts` | 호출만 | 변경 없음 | 낮음 | 수정 금지. 구현 중 필요해지면 PM 보고 |
| 점심운 문구 검사 공백 | T-13 | design 14.1에 "점심운에 메뉴 이름과 국물이 없다" 검사가 없다 | 중간 | T-13에 검사 추가(설계 보완 제안, dev-lead가 qa에 넘김) |
| FAQ 문구 "보장" | T-07 | 금지 표현 "보장"과 FAQ 답이 부딪칠 수 있다 | 낮음 | 작성 절차의 규칙을 따른다 |
| 결과 자리 표시(PC) 위치 | T-11 | ui 명세는 있으나 design 8.2 트리에 소속 컴포넌트가 없다 | 낮음 | `result.component.tsx`가 결과가 없을 때 그린다(T-11) |
