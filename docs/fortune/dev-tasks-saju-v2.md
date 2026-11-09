# fortune 사주 2단계 개발 티켓

입력: `docs/fortune/design-saju-v2.md`(승인 2026-11-09, SQ-1 안 B, SQ-2 안 A(±15, 기본 60~69), SQ-3 안 1, SQ-4 안 1, 1959년 입춘 UTC+9 기준 판단 수락 요청 중), `docs/fortune/ui-ux-design-saju-v2.md`(승인 UD-1 모션 없음, UD-2 `ScrollText`, UD-3 날짜 폼 + 아래 시간 단계)
함께 보는 문서: `docs/fortune/plan.md`(AC-46~60, AC-87~91, 콘텐츠 제작 원칙 2단계), `docs/fortune/dev-tasks.md`(1단계 티켓 형식 참고, 2단계 절 개략. 이 문서로 대체, 원본은 고치지 않음), `docs/fortune/status.md`, `docs/fortune/design.md`(기존 설계, 보충 문서에 없는 내용만 따름), `docs/conventions/code-style.md`, `data-storage.md`, `seo.md`, `design-system.md`
작성일: 2026-11-09
상태: 초안. 사용자 게이트 4건(SJ-04, SJ-G1~G3)과 착수 게이트(SJ-00) 확인 대기.

표기 약속: `FF/` = `src/features/fortune/`. `D/` = `docs/fortune/`. "설계 V번호" = `design-saju-v2.md`의 절, "UI 절" = `ui-ux-design-saju-v2.md`의 절, "R-n" = 1단계 dev-tasks의 공통 규칙(R-7은 문구 작성 전용 규칙으로, C 티켓에 그대로 적용).

## 요약

- DB: 없음. db-dev 티켓 0개. 테이블, 마이그레이션, RLS, API 없음(설계 "DB 스키마", "API 계약").
- 백엔드: 코드 작업 없음. 문서 기록 티켓 1개(SJ-BE1, S2-11 확인 기록, `docs/fortune/calendar-verification.md` 신규). 사주 계산은 브라우저 순수 함수다.
- 프론트엔드: 개발 7개(SJ-FE01~FE07) + 문구·허브 6개(SJ-C1~C4, SJ-H1~H2).
- 기획·UI·PM: planner 1개(SJ-02), ui-ux-designer 1개(SJ-03), PM 3개(SJ-00, SJ-01, SJ-DOC1).
- QA: 4개(SJ-QA1~QA4). QA1은 사주 계산 단위 테스트(Playwright 순수 함수 검사, 프로젝트에 별도 단위 테스트 러너가 없음).
- 사용자 게이트: 4개(SJ-04 S2-11 판단 수락, SJ-G1 십신 샘플 검수, SJ-G2 사주 화면 문장 승인, SJ-G3 허브 개정 승인). 출시 승인은 SJ-FE07 앞의 별도 확인.
- 작업 티켓 합계 23개, 게이트 4개. 문구 재작업이 나오면 C 티켓이 늘 수 있다.
- 계산 기준은 설계대로 확정됨: 23시대 `next-day`, 자시 시작 23:00, 보정 없음, `same-day`는 테스트에서만 쓰고 화면·문구에는 쓰지 않는다.

## 티켓

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| SJ-00 | PM(메인) | 착수 게이트 확인. (a) 1단계 출시 상태. `status.md` 5행은 "출시 스위치·QA 전", 64행은 "개발·QA 완료, commit·배포 전"으로 서로 다르므로 사용자에게 확인(2단계 착수 조건 1). (b) fortune-v2 미커밋 변경 commit(설계 M-S0). (c) 1단계 BE-1c 달력 표 완료 확인(착수 조건 4). (d) `design.md` 13.1·12.2의 "사주 네 기둥"이 설계 V9로 대체됨을 확인하거나 architect에게 수정 요청(착수 조건 3). (e) `git status` 재확인. 세션 시작 스냅샷은 오래됐고 truncated되어 fortune 관련 M 파일 전체를 확인하지 못함 | - | `D/status.md`, 루트 문서 미커밋 목록 | 설계 M-S0, 2단계 착수 조건 1·3·4 | (a)~(e) 결과가 `D/status.md`에 기록됨. 하나라도 미충족이면 SJ-FE01 이후 개발 시작 금지 | 대기 |
| SJ-01 | PM(메인) | 단계 기록(설계 M-S1). SQ-1 안 B, SQ-2 안 A(±15, 기본 60~69), SQ-3 안 1, SQ-4 안 1 확정 기록. 1959 입춘 판단은 SJ-04 결과 대기로 표시. 이 문서 상태를 "개발 준비"로 갱신 | SJ-00 | `D/status.md` | 설계 0.2 | `D/status.md`에 결정 4건과 SJ-04 대기가 적힘 | 대기 |
| SJ-02 | planner | DOC-S2. `D/plan.md` 486행 검색 키워드의 "사주 4기둥"을 "만세력 사주"로 정정(S2-2). SQ-1 안 B, SQ-3 안 1이므로 AC-46·용어 표는 고치지 않음. plan.md는 현재 MM(staged+unstaged)이므로 SJ-00(b) commit 뒤에 수정 | SJ-01 | `D/plan.md` | 설계 V9 keywords, 0.3 | 486행 키워드에 "사주 4기둥" 없음. 변경은 해당 1줄(diff 1줄). 다른 줄 불변 | 대기 |
| SJ-03 | ui-ux-designer | UI-S1. `D/ui-ux-design.md` 사주 절을 `ui-ux-design-saju-v2.md` 승인 내용(UD-1·2·3, 0.1 표, 4장 화면, 5장 계산 기준, 6장 허브, 6.1 메뉴)으로 병합. 병합 전에도 보충 문서가 우선(R-1)이라 개발은 막지 않음. 1단계 절은 고치지 않음 | SJ-01 | `D/ui-ux-design.md` | UI 전체, UI 6.1 메뉴 설명은 "일진" 풀이 검토 메모 포함 | 사주 절만 바뀜(1단계 절 diff 0). UI-2 이후 병합본에 UD-1~3 반영. 개발 티켓은 병합 여부와 무관하게 보충 문서를 직접 참조 | 대기 |
| SJ-04 | 사용자(게이트) | S2-11 판단 수락 여부. 저장소 `solar-term-table.constant.ts`의 1959년 입춘 값 2042242(2월 4일 22:42)와 R-1 해설 값(127.5도 22:13, UTC+9 환산 22:43)은 1분 차이라 KASI 표를 UTC+9 기준으로 본다는 판단(설계 V7). 수락 시 SJ-BE1 진행. 거부 시 사용자가 `DATA_GO_KR_API_KEY`로 직접 재호출(사용자 실행)하고, SJ-BE1은 그 결과를 기록하는 티켓으로 바뀜 | SJ-01 | `D/status.md`(결과 기록) | 설계 V7, 기존 설계 S2-11 | 수락 또는 거부가 `D/status.md`에 기록됨 | 대기 |
| SJ-BE1 | backend-dev | BE-S1, S2-11 확인 기록. `D/calendar-verification.md` 신규 작성(설계는 "수정"으로 적었으나 파일이 없어 신규임). 기록 항목: (1) 1959 입춘 표 값, (2) 해설 두 값(127.5도 22:13, UTC+9 환산 22:43), (3) 판단과 근거, (4) 단일 출처 한계, (5) 1954~1961 표준시 판단 근거. API 호출, 스크립트 수정, `.env` 읽기, `DATA_GO_KR_API_KEY` 문자열 기록 모두 금지 | SJ-04(수락) | `D/calendar-verification.md`(신규). 읽기만: `scripts/fortune-calendar/`, 절기 표 상수 파일 | 설계 V7 | 기록 항목 5개가 모두 있고, 코드·스크립트 diff 0, 키 문자열 0건 | 대기 |
| SJ-FE01 | frontend-dev | FE-S1 뼈대. (1) `FF/types/fortune-saju.type.ts` 전체(설계 V1.1). (2) `FF/constants/fortune-saju.constant.ts`: 천간 10, 지지 12, 십신 10의 이름·한자·오행·음양, `FORTUNE_SAJU_LATE_ZI_STEM_BASIS = 'next-day'`, `FORTUNE_SAJU_DST_NOTICE_YEARS`(1948~1961, 1987, 1988), `FORTUNE_SAJU_SEED_PREFIX`(설계 V1.3). (3) `FF/constants/fortune-saju-notice.constant.ts`: V10.1 키 전부 선언. `FORTUNE_SAJU_PANEL_TEXTS`에 설계 보완 메모 N1의 세 키를 포함. 값은 임시 값으로 두되 `TODO(SJ-C3)` 주석을 붙이고 SJ-C3 승인 전에는 출시하지 않음. (4) `FF/constants/fortune-seo.constant.ts`에 `FORTUNE_SAJU_SEO`(설계 V9, keywords 확정, 제목·설명은 설계 값). (5) `fortune-faq`, `fortune-guide`, `fortune-copy-rule`은 이 티켓에서 고치지 않음(SJ-C3·SJ-H2 담당). 'same-day'·'next-day'는 타입 주석과 테스트 외 어디에도 쓰지 않음. `FORTUNE_SAJU_GLOSS` 등 기존 상수는 import만 | SJ-00 | `FF/types/fortune-saju.type.ts`(신규), `FF/constants/fortune-saju.constant.ts`(신규), `FF/constants/fortune-saju-notice.constant.ts`(신규), `FF/constants/fortune-seo.constant.ts`(수정) | 설계 V1.1, V1.3, V9, V10.1, 보완 메모 N1 | `pnpm typecheck` 통과. 1단계 화면 출력 불변. V10.1 키 목록과 일치. 임시 값에 `TODO(SJ-C3)` 표시. 'same-day' 화면 노출 0 | 대기 |
| SJ-FE02 | frontend-dev | FE-S2 계산·점수. (1) `FF/utils/fortune-saju.util.ts` 전체(설계 V1.2: 일주, 연주, 월주, 시주, 시지, 경계, 차트 결과, 십신, 오행 개수, 표준시 안내 판정). (2) `FF/utils/fortune-reading.util.ts`에서 `BASE_SCORE_SPREAD` 10을 30으로만 바꿈(SQ-2 안 A). 기본 점수 경로(baseScores 경로)에서만 쓰이는지 확인하고 1단계 기본 경로 불변 확인 | SJ-FE01 | `FF/utils/fortune-saju.util.ts`(신규), `FF/utils/fortune-reading.util.ts`(수정, 상수 1개) | 설계 V1.2, V2, V5.1, V5.2 | `pnpm typecheck` 통과. 1단계 기본 경로 결과 불변(SJ-QA1 회귀로 확인). 사례값 검증은 SJ-QA1 | 대기 |
| SJ-FE03 | frontend-dev | FE-S3 흐름 훅 `FF/saju/hooks/use-saju-flow.hook.ts`. useReducer, 설계 V4.1 상태 머신(SQ-1 안 B). 차트·오행·십신·표준시 여부는 상태에 넣지 않고 렌더링 중 계산. 입력·시간·후보는 state만(메모리). 시·분 검증은 0~23시, 0~59분 형식만. 오늘 날짜 늦은 시각은 막지 않음(S2-9) | SJ-FE02 | `FF/saju/hooks/use-saju-flow.hook.ts`(신규) | 설계 V4.1, 7.2, 9. UI 절 4.1~4.3 | 상태 전이표 9행 모두 구현. `age-blocked`에서 입력값이 상태에 남지 않음. `localStorage`·`sessionStorage`·URL 미사용(R-2). `pnpm typecheck` 통과 | 대기 |
| SJ-FE04 | frontend-dev | FE-S4 공용 변경(1단계 4페이지가 쓰는 공용 파일). (1) `FF/shared/components/calc-basis.component.tsx`: 사주 키 7개 추가(설계 V3.1). 기존 키 출력 불변. (2) `FF/shared/components/birth-time-form.component.tsx`: 선택 prop `texts`(title, help, submit, unknown) 추가. 기본값은 현재 문구와 같음. 사주 값은 UI 절 0.3대로 "태어난 시간", `FORTUNE_SAJU_TIME_QUESTION_TEXT`, "사주 보기", "시간 모름" | SJ-FE01 | `FF/shared/components/calc-basis.component.tsx`, `FF/shared/components/birth-time-form.component.tsx` | 설계 V3.1, V4.3. UI 절 0.3 | 1단계 오늘의 운세·띠별·별자리·허브 출력 불변(회귀 확인은 SJ-QA1). `pnpm typecheck`, `pnpm build` 통과. 이 두 파일은 이 티켓만 수정 | 대기 |
| SJ-FE05 | frontend-dev | FE-S5 화면 컴포넌트. `FF/saju/components/`: `root.component.tsx`(`'use client'`, `FortuneSajuComponent`, 동의 게이트 + panel `next/dynamic` ssr false), `panel.component.tsx`(흐름별 화면 조립), `pillars.component.tsx`(기둥 표, caption sr-only, th scope, 일간 강조, 시간 모름 칸), `elements.component.tsx`(오행 5행 dl, 눈금 aria-hidden, 칸 수 8 또는 6), `ten-god.component.tsx`(오늘 일진·내 일간·십신 비교, 모바일 행·md 3칸, 십신 한자 aria-hidden, 한 줄 설명), `guide.component.tsx`(서버, `FortuneSajuGuideComponent`). 재사용: `FortuneBirthFormComponent`, `FortuneLunarConfirmComponent`, `FortuneCandidateChoiceComponent`, `FortuneReadingComponent`(methodNotice=`FORTUNE_METHOD_B_NOTICE`), `FortuneLuckyComponent`, `FortuneAgeBlockedComponent`. 사용자 문장은 상수에서만 import(컴포넌트에 문자열 하드코딩 금지). 아이콘: UD-2 `ScrollText`가 설치된 lucide-react에 있는지 여기서 확인 | SJ-FE03, SJ-FE04 | `FF/saju/components/*.component.tsx`(신규 6개) | UI 절 4.1~4.4, 5, 7, 8, 9. 설계 V4.3, V5.1 | UI 명세 구조 일치(기둥 표 열 순서, 칸 수, 후보 `aria-pressed`, 포커스 순서 UI 9장). M1 모션만 사용. `dark:`·hex·기본 팔레트 없음(design-guard 통과). `pnpm typecheck`, `pnpm build` 통과 | 대기 |
| SJ-FE06 | frontend-dev | FE-S6 페이지 `src/app/fortune/saju/page.tsx`(서버 컴포넌트, `FortuneSajuPage`). 순서: ContentWrapper, JsonLd(BreadcrumbList 홈 > 운세 > 사주, FAQPage `FORTUNE_SAJU_FAQ`), TitleWrapper h1 "사주", 상시 면책, 입력 안내, noscript, `FortuneSajuComponent`, 결과 하단 면책·상담전화, `FortuneSajuGuideComponent`, `FortuneCalcBasisComponent items`(7개 키, 설계 V3.1 순서), `FortuneFaqComponent`, `FortuneDetailNoticeComponent`, 동의 다시 설정. metadata: `buildMetadata` 사용, pathname `FORTUNE_ROUTES.saju`, 그리고 SQ-4 안 1에 따라 `robots: { index: false, follow: false }`. `MENU_LIST`는 건드리지 않음 | SJ-FE05, SJ-C3(작성 완료. 승인 전 상태 가능) | `src/app/fortune/saju/page.tsx`(신규) | 설계 V9, 4, 5. UI 절 4, 5 | `pnpm build` 통과. JS 끈 서버 HTML에 h1 1개, 계산 기준 7항목, FAQ 5개, 면책, 상담전화 5곳, 가이드 있음. 개인 결과 없음. robots noindex 있음. canonical·OG 있음 | 대기 |
| SJ-C1 | frontend-dev(문구 작성, R-7) | C-S1 샘플. 비견, 정재, 편관 3개 십신 × 항목 5 × 구간 3 × 변형 3 = 135문장을 `FF/constants/pools/saju/bigyeon.constant.ts`, `jeongjae.constant.ts`, `pyeongwan.constant.ts`에 작성(`as const satisfies FortuneCategoryPoolType`). 십신 한 줄 설명 10개를 `FORTUNE_SAJU_TEN_GOD_DESCRIPTIONS`에 작성(합니다체, 길흉 단정 없음). 기본 점수표 초안(10 십신 × 5 항목, 60~69, 안 A)은 코드가 아니라 `D/copy-log.md`에 표로 제출. 작성 기록(AI 작성, 작성일, 지침 6개)을 `copy-log.md` 첫머리에 추가. 작성 중 외부 운세 문장 참조 금지(R-7) | SJ-FE01 | `FF/constants/pools/saju/bigyeon.constant.ts`, `jeongjae.constant.ts`, `pyeongwan.constant.ts`(신규), `FF/constants/fortune-saju-notice.constant.ts`(`FORTUNE_SAJU_TEN_GOD_DESCRIPTIONS` 키만), `D/copy-log.md`(기록) | 설계 V6.1, V6.2 1, V1.1(십신 키 매핑: 비견 bigyeon, 정재 jeongjae, 편관 pyeongwan), plan 콘텐츠 제작 원칙 | 135문장이 형식대로(45 × 3). 항목 5, 구간 3, 변형 3 누락 없음. 금지 표현 0. 합니다체. "사주" 미사용(풀 기본). 편관·겁재 등 불안 유발 없이 행동 조언으로 끝남(AC-39, AC-90). `pnpm typecheck` 통과 | 대기 |
| SJ-G1 | 사용자(게이트) | 샘플 검수. 135문장의 톤, 한 줄 설명 10개, 기본 점수표 초안(60~69) 승인 또는 수정 지시. 샘플 3개로 톤을 정한 뒤 나머지 7개를 쓴다(설계 V6.2) | SJ-C1 | `D/copy-log.md`(검수자·검수일 기록) | 설계 V6.2 1, S2-4 | 승인 또는 수정 지시가 `copy-log.md`에 기록됨. 수정 지시가 있으면 SJ-C1 재작업 | 대기 |
| SJ-C2 | frontend-dev(문구 작성, R-7) | C-S2 나머지 7개 십신(겁재 geopjae, 식신 siksin, 상관 sanggwan, 편재 pyeonjae, 정관 jeonggwan, 편인 pyeonin, 정인 jeongin) 315문장을 승인된 톤으로 작성. 합본 `FF/constants/pools/saju-pools.constant.ts`를 만들어 `FORTUNE_SAJU_POOLS`(10개)와 `FORTUNE_SAJU_BASE_SCORES`(확정 점수표)를 둠 | SJ-G1 | `FF/constants/pools/saju/geopjae.constant.ts` 외 6개(신규), `FF/constants/pools/saju-pools.constant.ts`(신규) | 설계 V6.1, V5.1, V5.2(안 A) | 파일 10개 × 45문장 = 450문장. 누락은 컴파일에서 실패. 기본 점수 전부 60~69. 금지 표현 0. `pnpm typecheck` 통과 | 대기 |
| SJ-C3 | frontend-dev(문구 작성, R-7) | C-S3 사주 화면 문장. (1) `fortune-saju-notice.constant.ts` 값 전부: `FORTUNE_SAJU_CALC_BASIS_*` 6개와 `FORTUNE_SAJU_TIME_UNKNOWN_NOTICE`(설계 V3.2 초안 기준), `FORTUNE_SAJU_PANEL_TEXTS`(N1 세 키 포함), `FORTUNE_SAJU_TIME_QUESTION_TEXT`, `FORTUNE_SAJU_BOUNDARY_NOTICE_TEMPLATE`, `FORTUNE_SAJU_CANDIDATE_LABEL_TEMPLATES`, `FORTUNE_SAJU_ELEMENTS_NOTE`, `FORTUNE_SAJU_SOLAR_TERM_NAMES`(12). (2) `FORTUNE_SAJU_FAQ` 5개(질문은 의문형, 1번 답 첫머리 `FORTUNE_SAJU_GLOSS`), 위치는 `fortune-faq.constant.ts`. (3) `FORTUNE_SAJU_GUIDE` 본문(사주와 만세력 / 이용 방법 / 오늘의 운세와의 차이, 계산 기준과 FAQ를 합쳐 600자 이상), 위치는 `fortune-guide.constant.ts`. (4) 메뉴 설명·예시 초안(SQ-3 안 1, "사주" 미사용, "일진" 풀이 방식 제시). 메뉴 상수는 건드리지 않음. 계산 기준 문장은 "23:00~23:59"를 먼저 쓰고 "야자시"는 괄호로 한 번. "정자시", "정통", "정확한", "AI", "same-day", "next-day", "평생 운을 알려" 금지 | SJ-FE01. SJ-C1의 `TEN_GOD_DESCRIPTIONS` 병합 뒤에 같은 notice 파일을 고침(R7) | `FF/constants/fortune-saju-notice.constant.ts`(값), `FF/constants/fortune-faq.constant.ts`(`FORTUNE_SAJU_FAQ` 추가), `FF/constants/fortune-guide.constant.ts`(`FORTUNE_SAJU_GUIDE` 추가), `D/copy-log.md`(기록) | 설계 V3.2, V9, V10.1, V10.2 금지어, 보완 메모 N1. UI 절 0.3, 5, 6.1 | V10.1 키 목록과 일치. 금지어 수동 검사 0건(정식 검사는 SJ-QA2). FAQ 5개, 가이드 600자 이상. `copy-log.md`에 작성 기록. 승인 전까지 `TODO(SJ-C3)` 유지 | 대기 |
| SJ-G2 | 사용자(게이트) | 사주 화면 문장 승인. 계산 기준 7항목과 지원 범위, 시간 단계 안내, 요약 줄 템플릿, 버튼·링크 라벨 3개, 경계 안내, FAQ 5개, 가이드, 메뉴 설명·예시(사주 금지 안 1) | SJ-C3 | `D/copy-log.md`(승인 기록) | 설계 V10.1, V3.2, V9. UI 절 0.3 | 승인 또는 수정 지시가 `copy-log.md`에 기록됨. 수정 지시는 SJ-C3 재작업 | 대기 |
| SJ-H1 | frontend-dev(문구 작성, R-7) | C-S3 허브 개정 문장 초안. (1) `FORTUNE_HUB_GUIDE` 제목(초안 "운세 종류와 차이"). (2) 단락 1 첫 문장에서 "세 가지"를 뺌(사주 없음). (3) 단락 2: 옛 "세 운세 모두 …" 문장을 빼고 방식 구분 문장(사주 괄호 설명 포함) 작성. (4) 새 단락 5 사주 소개: 첫 "사주"는 `FORTUNE_SAJU_GLOSS`. (5) `FORTUNE_HUB_FAQ` 7번째 질문과 답. 질문 문장은 설계 V8.3의 두 안 중 사용자가 고를 수 있게 둘 다 제출. 답의 첫 "사주"는 `FORTUNE_SAJU_GLOSS` | SJ-00(FE01과 병렬 가능) | `D/copy-log.md`(초안 기록). 코드 파일은 SJ-H2 | 설계 V8.2, V8.3. UI 절 6 | "세 가지", "세 운세"가 허브 설명·FAQ에 없음. 사주 첫 등장에 괄호 설명. 질문 어미 "~나요?". 화이트리스트 등록 대상 문장 목록 작성 | 대기 |
| SJ-G3 | 사용자(게이트) | 허브 개정 승인(승인 문구 U-1 변경). 설계 V8.3의 질문 문장 두 안 중 선택 | SJ-H1 | `D/copy-log.md`(승인 기록) | 설계 V8.2, V8.3 | 승인과 선택한 안이 기록됨 | 대기 |
| SJ-H2 | frontend-dev | 허브 상수 반영(출시 묶음과 같은 배포). (1) `FF/constants/fortune-guide.constant.ts`: `FORTUNE_HUB_GUIDE` 개정. (2) `FF/constants/fortune-faq.constant.ts`: `FORTUNE_HUB_FAQ` 7번째 추가. 허브 JSON-LD는 같은 상수를 쓰므로 자동 반영. (3) `FF/constants/fortune-copy-rule.constant.ts`: `FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A` 교체(옛 "세 운세 모두" 제거, 새 문장 등록), `FORTUNE_SAJU_PAGE_FORBIDDEN_TERMS` 신설. 허브 page와 root 컴포넌트는 건드리지 않음 | SJ-G3, SJ-C3(같은 faq·guide 파일을 쓰므로 C3 병합 뒤) | `FF/constants/fortune-guide.constant.ts`, `FF/constants/fortune-faq.constant.ts`, `FF/constants/fortune-copy-rule.constant.ts` | 설계 V8.2, V8.3, V10.2. UI 절 6 | 허브 title·description·keywords·BreadcrumbList에 "사주" 없음(AC-88). 허브 FAQ 7쌍. 허브 ItemList는 메뉴 등록 전이라 사주 항목이 아직 없음(정상). 1단계 방식 A 문장의 바이트 diff는 허브 개정 부분만. `pnpm typecheck` 통과 | 대기 |
| SJ-C4 | frontend-dev | C-S4 유사 문장 점검과 `copy-log.md` 갱신(AC-60). 묶음별 대표 문장을 따옴표로 웹 검색: 십신 묶음 20문장 이상, 계산 기준·FAQ·가이드 10문장 이상, 행운·조언 10문장 이상(해당 시). 결과는 "일치 없음" / "일치 없음(일반 어구)" / "수정함"으로 기록하고 점검일과 한계(전수 검사 아님)를 적음. 같은 풀 안 반복 문장 훑기. 금지어 사전 검사 결과 기록 | SJ-C2, SJ-G2 | `D/copy-log.md` | 설계 V6.2 3·4, plan 콘텐츠 제작 원칙 "유사 문장 점검 절차" | 사주 묶음별 작성자·작성일·검수자·검수일·상태·점검 결과가 있음(AC-60). 일치 문장은 "수정함"으로 바꾸고 재점검 | 대기 |
| SJ-QA1 | qa | QA-S1 사주 계산 단위 테스트. 프로젝트에 단위 테스트 러너가 없으므로 Playwright 순수 함수 검사로 `e2e/fortune-calc.spec.ts`에 사주 블록 추가(1단계 케이스 불변). 경계일: 2025-02-03 23:09(연주 갑진, 시주 갑자, 일주 계묘)와 23:30(연주 을사); 입춘 당일 시간 모름 `need-choice`(`boundary.kind` year, charts 2개); 절기 당일 시간 모름(`kind` month); 1920-01-01 00:30(자월); 2028-12-31 23:30 결과 있음; 2029-01-01 `unsupported`. 23시대: 2026-11-06 22:59/23:00/23:30/23:59, 2026-11-07 00:00/00:30/01:00, 1999-12-31 23:30, 2000-01-01 00:30(AC-56 사례). `same-day`는 비교 테스트에서만 사용. 시간 모름: `hour` null, 3기둥(AC-50 2000-01-01 무오·기묘, 2000-02-10 경진). DST 연도 판정(AC-57 경계 8건, 1988-07-15 00:30 시지 자). 점수: 기본 점수 60~69, 최종 30~95 정수, 같은 일간 같은 날 같은 결과, 10일 연속 십신 10개 전부, 7일 총운 비동일, 연속 300일 모의에서 상·중·하 세 구간 모두 등장(안 A) | SJ-FE02 | `e2e/fortune-calc.spec.ts`(수정, 1단계 케이스 보존) | 설계 V1.2, V2, V5, AC-50~57, AC-90, AC-91 | 위 항목 전부 통과(데스크톱, 모바일 둘 다 `pnpm e2e`, `pnpm e2e:mobile`). 1단계 기본 경로 회귀 통과. 실패는 SJ-FE02로 되돌림 | 대기 |
| SJ-QA2 | qa | QA-S2 문구 검사. `e2e/fortune-copy.spec.ts`에 V10.3 추가: 사주 풀 450문장, `FORTUNE_SAJU_BASE_SCORES` 범위, `fortune-saju-notice` 전체, `FORTUNE_SAJU_SEO`, `FORTUNE_SAJU_FAQ`, `FORTUNE_SAJU_GUIDE`, 허브 개정 문장(AC-88: "세 가지", "세 운세" 없음), 금지어 목록(사주 페이지 추가 금지 포함). 메뉴 검사는 출시 전 기준(사주 항목 없음, 869행 유지). 사주 페이지 서버 HTML 검사는 SJ-FE06 뒤에 실행 | SJ-C4, SJ-H2, SJ-FE06 | `e2e/fortune-copy.spec.ts`(수정) | 설계 V10.2, V10.3. AC-37, AC-56, AC-58, AC-88 | 금지어 0건, 풀 450 검사 통과, 허브 "세 가지" 0건, 'same-day'·'next-day'·"정자시" 화면 노출 0건 | 대기 |
| SJ-QA3 | qa | QA-S3 사주 브라우저 테스트(출시 전, 직접 접속). 신규 `e2e/fortune-saju.spec.ts`. 검사: AC-46(연령 순서), AC-47(연령 판정 저장 없음), AC-49(입력 3단계, 성별·출생지·이름 없음), AC-51(경계 두 후보), AC-52, AC-53, AC-54(일진·십신·점수, 자정 전후 시계 조작), AC-55, AC-56(서버 HTML 계산 기준 6항목, 사례 확인), AC-57(연도별 안내), AC-59(면책·상담전화 5곳·로또 고지), AC-72(동의 전 결과 없음), AC-87(동의 재사용, 동의 다시 설정), AC-89(noindex 제외: title, canonical, OG, JSON-LD, h1 1개, JS 끈 HTML 600자 이상), AC-91(경계 연도). 데스크톱, 모바일 둘 다 | SJ-FE05, SJ-FE06, SJ-G2(문장 확정 뒤 검사) | `e2e/fortune-saju.spec.ts`(신규) | UI 절 4, 5, 9. 설계 V4, V9 | 데스크톱·모바일 모두 통과. 실패는 해당 담당에게 되돌림. 결과 표를 `D/qa-report.md`에 기록 | 대기 |
| SJ-FE07 | frontend-dev | FE-S7 출시 묶음(사용자 출시 승인 뒤, 다른 메뉴 작업과 동시 금지). (1) `src/constants/menu.constant.ts`: 운세 그룹 마지막(별자리 다음)에 사주 항목 추가. `href` `/${MENU_GROUP_NAME_ENUM.FORTUNE}/saju`, `label` '사주', `colorClass` 'text-menu-fortune', `description`·`example`은 SJ-G2 승인 문장(안 1, "사주" 미사용). (2) `src/constants/menu-icon.constant.ts`: `ScrollText`가 없으면 추가. (3) `src/app/fortune/saju/page.tsx`: `robots` 제거. (4) `src/app/terms/page.tsx`: 운세 장에 사주 포함 여부 확인 후 필요하면 수정(privacy는 범위 밖). (5) SJ-H2 허브 문장과 같은 배포 | SJ-QA3, SJ-H2, SJ-G2, SJ-G3, SJ-C4, SJ-03(아이콘 병합 확인), 사용자 출시 승인 | `src/constants/menu.constant.ts`(수정), `src/constants/menu-icon.constant.ts`(필요 시), `src/app/fortune/saju/page.tsx`(수정), `src/app/terms/page.tsx`(확인) | 설계 V8.1, V9, 14(출시 체크). UI 절 6.1. AC-88 | 허브 목록, 헤더 PC 드롭다운, 모바일 메뉴, sitemap, 허브 ItemList에 사주가 나타남. 메뉴 라벨만 "사주", 설명·예시에 "사주" 없음. 페이지에 noindex 없음. 모바일 360px에서 운세 그룹 4항목 줄바꿈과 높이가 깨지지 않음. `pnpm typecheck`, `pnpm build` 통과 | 대기(출시 승인 후) |
| SJ-QA4 | qa | QA-S4 출시 후 회귀. `e2e/fortune.spec.ts`의 AC-65·AC-80 검사를 AC-88 기준으로 바꾸고, 방식 A 페이지의 "사주" 검사 허용 목록에 메뉴 라벨 "사주"를 추가(설명 문장 금지는 유지). `e2e/fortune-copy.spec.ts` 869행 "메뉴에 사주 없음" 검사를 출시 기준으로 바꿈. AC-89 noindex 없음 확인. 1단계 회귀 | SJ-FE07 | `e2e/fortune.spec.ts`(수정), `e2e/fortune-copy.spec.ts`(수정) | AC-88, AC-89, AC-10 | 데스크톱·모바일 통과. 1단계 회귀 통과 | 출시 후 대기 |
| SJ-DOC1 | PM(메인 세션) | DOC-S1 출시 고지 문서 갱신. 루트 문서는 agent 수정 불가(guard-files)이므로 메인 세션이 직접 고치고 사용자 확인을 받음. (1) `README.md` 15행: "아직 공개하지 않습니다" 제거, 사주 설명 추가. README 표(환경변수, API, 테이블)는 변경 없음 확인. (2) `COMPLIANCE.md` 77행, 125행, 11장: 사주 공개, 방식 B 안내 위치, 계산 기준과 표준시 안내 위치, 위험 수용 목록 확인. (3) `THIRD_PARTY_NOTICES.md`: 새 외부 자산이 없으면 변경 없음 확인, "사주 미공개" 표기 제거. (4) `DEPENDENCY_LICENSES.md`: 변경 없음 확인. (5) `src/app/terms/page.tsx`는 SJ-FE07에서 처리 | SJ-FE07(같은 출시 묶음). 루트 문서의 다른 기능 미커밋 변경 commit 뒤 | `README.md`, `COMPLIANCE.md`, `THIRD_PARTY_NOTICES.md`(PM 직접), `DEPENDENCY_LICENSES.md`(확인만) | 설계 "상업적 이용·라이선스", "보안·개인정보", DOC-S1 | 세 문서가 사주 공개 상태와 일치. 법률 확인은 조건이 아니며 위험 수용 목록에만 남음(R-1). 사용자 확인 기록 | 대기 |

## 실행 순서

1. 착수 게이트(PM). SJ-00을 끝내고 SJ-01로 `status.md`를 갱신한다. 게이트가 하나라도 미충족이면 2단계부터 멈춘다. 사용자 SJ-04는 병행해서 받는다.
2. 단독 선행. SJ-FE01(뼈대) 완료 후 다음 단계로 간다. 이 티켓은 모든 프론트 티켓의 선행이다.
3. 동시 실행 묶음 A(FE01 뒤). SJ-02(planner, plan.md 1줄), SJ-03(ui-ux-designer, ui-ux-design.md), SJ-BE1(backend-dev, SJ-04 수락 뒤), SJ-FE02(계산·점수), SJ-FE04(공용 2개 파일), SJ-C1(샘플 135문장과 한 줄 설명 10개), SJ-H1(허브 문장 초안, 코드 없음).
   - 같은 `copy-log.md`를 쓰는 SJ-C1, SJ-H1은 한 사람이 순서대로 쓴다. 충돌 R6.
4. 게이트. SJ-G1(샘플 검수, 사용자). 통과하면 SJ-C2를 시작한다. 수정 지시가 나오면 SJ-C1로 되돌린다.
5. 동시 실행 묶음 B.
   - SJ-FE03(FE02 뒤), SJ-QA1(FE02 뒤, 계산 테스트), SJ-C2(G1 뒤), SJ-C3(FE01 뒤, notice·faq·guide 값과 copy-log 기록. SJ-C1 병합 뒤에 notice 파일을 고친다), SJ-G3(허브 문장 승인).
   - SJ-QA1과 SJ-C2는 파일이 겹치지 않으므로 동시 가능. SJ-C3과 SJ-C2는 `copy-log.md`만 겹치므로 기록은 순서대로 쓴다.
6. 게이트. SJ-G2(사주 화면 문장 승인, 사용자). SJ-H2(허브 상수 반영)는 SJ-G3과 SJ-C3 병합 뒤에 시작한다.
7. 화면 조립. SJ-FE05(FE03, FE04 뒤, UI 확인), 그 뒤 SJ-FE06(FE05와 SJ-C3 병합 뒤). 이 둘은 순서대로 한다.
8. 점검과 QA. SJ-C4(SJ-C2, SJ-G2 뒤, 유사 문장 점검). SJ-QA2(SJ-C4, SJ-H2, SJ-FE06 뒤). SJ-QA3(SJ-FE06, SJ-G2 뒤). QA 실패는 해당 담당에게 되돌리고 같은 QA를 다시 돈다.
9. 출시 묶음(사용자 출시 승인 뒤, 메뉴 작업 없을 때). SJ-FE07(메뉴, noindex 제거, terms 확인)과 SJ-H2 배포, SJ-DOC1(루트 고지 문서) 같은 날 처리.
10. 출시 후. SJ-QA4(출시 기준 e2e 변경과 1단계 회귀).

Critical path: SJ-00 → SJ-FE01 → SJ-FE02 → SJ-FE03 → SJ-FE05 → SJ-FE06 → SJ-QA3 → SJ-FE07 → SJ-QA4.
문구 경로: SJ-C1 → SJ-G1 → SJ-C2 → SJ-C4 → SJ-QA2. 그리고 SJ-C3 → SJ-G2 → SJ-FE07. 사용자 검수 두 번(G1, G2)이 가장 긴 대기 지점이다.

## 동시 실행 가능

- 가능: SJ-02(planner)와 SJ-03(ui-ux-designer)과 SJ-BE1(backend-dev)은 서로와 모든 FE 티켓과 동시에 돌아간다. 파일이 겹치지 않는다.
- 가능: SJ-FE02와 SJ-FE04(FE01 뒤). SJ-FE02는 `fortune-reading.util.ts`, SJ-FE04는 공용 컴포넌트 2개로 파일이 다르다.
- 가능: SJ-FE03과 SJ-QA1과 SJ-C2(FE02, G1 뒤). 훅 파일, 테스트 파일, 풀 파일이 다르다.
- 가능: SJ-C1과 SJ-FE02, SJ-FE04(FE01 뒤). 문구 파일과 계산 파일이 다르다. 단 `copy-log.md`는 한 사람이 쓴다.
- 조건부: SJ-C3과 SJ-H1은 같은 `copy-log.md`를 쓴다. SJ-C3과 SJ-H2는 `fortune-faq.constant.ts`, `fortune-guide.constant.ts`를 쓴다. 둘 다 앞 티켓 병합 뒤에 시작한다.
- 불가: SJ-FE05와 SJ-FE06(페이지가 컴포넌트를 import). SJ-FE06과 SJ-FE07(같은 `page.tsx`를 noindex로 만들고 지움). SJ-FE07은 메뉴 작업 다른 기능과 동시에 하지 않는다.
- 불가: 같은 QA 세트를 동시에 돌리지 않는다. 같은 dev 서버를 두 QA가 동시에 쓰면 결과가 섞인다. QA1과 QA2는 파일이 달라도 실행은 순서대로 한다.

## 충돌 위험

| 번호 | 파일 | 위험 | 대응 |
|---|---|---|---|
| R1 | `src/constants/menu.constant.ts` | fortune-v2 미커밋 변경(staged M). 모든 기능이 쓰므로 메뉴 변경은 한 곳에서 | SJ-FE07에서만 고침. 다른 기능 메뉴 작업과 동시 금지. SJ-00(b) commit 확인 |
| R2 | `src/features/fortune/constants/fortune-notice.constant.ts` | fortune-v2 T-3 미커밋(staged M). 사주는 import만 하고 고치지 않음 | 사주는 `fortune-saju-notice.constant.ts`를 새로 씀. SJ-00(b) commit 뒤 착수 |
| R3 | `D/plan.md` | MM 상태(staged와 unstaged 둘 다). 사주 2단계 plan 정정과 충돌 | SJ-00(b) commit 뒤 SJ-02만 수정. 다른 편집 금지 |
| R4 | `D/status.md` | 여러 티켓이 상태를 쓰고 싶어짐. staged M 상태 | PM(메인 세션)만 수정 |
| R5 | 루트 `COMPLIANCE.md`, `THIRD_PARTY_NOTICES.md`, `README.md` | 작업 트리에 다른 기능 미커밋 변경(M). 사주 고지 수정과 섞임 | SJ-DOC1 전에 commit 확인. PM만 수정. agent 수정 금지(guard-files) |
| R6 | `D/copy-log.md` | SJ-C1, SJ-C2, SJ-C3, SJ-C4, SJ-H1, SJ-G1~G3 기록이 모두 씀 | 한 번에 한 티켓만 편집. 승인 기록은 사용자 결과가 나온 뒤 기록 |
| R7 | `FF/constants/fortune-saju-notice.constant.ts` | SJ-FE01(뼈대, TODO 값), SJ-C1(`TEN_GOD_DESCRIPTIONS`), SJ-C3(나머지 값)이 씀 | FE01 → C1 → C3 순서로 병합. C3은 C1 병합 뒤 rebase |
| R8 | `FF/constants/fortune-faq.constant.ts`, `FF/constants/fortune-guide.constant.ts` | SJ-C3(사주 FAQ·가이드 추가)과 SJ-H2(허브 FAQ·가이드 개정)가 씀. 허브 문구는 1단계 승인 문구라 사용자 승인 필요 | C3 병합 → H2 순서. H2는 G3 승인 뒤에만 |
| R9 | `FF/constants/fortune-copy-rule.constant.ts` | SJ-C3(금지어 확인), SJ-H2(화이트리스트, 사주 금지어)가 씀. 화이트리스트는 승인 문구만 넣음(설계 V10.2) | H2가 담당. C3은 목록 제안만 |
| R10 | `FF/constants/fortune-seo.constant.ts` | fortune-v2 또는 1단계 변경과 겹칠 수 있음(git 목록에서 확인 불가) | SJ-FE01만 1회 수정. SJ-00(e)에서 상태 확인 |
| R11 | `FF/utils/fortune-reading.util.ts` | 1단계 세 화면이 같이 씀 | SJ-FE02만 수정. 바꾸는 것은 `BASE_SCORE_SPREAD` 한 줄. QA1 회귀로 확인 |
| R12 | `FF/shared/components/calc-basis.component.tsx`, `FF/shared/components/birth-time-form.component.tsx` | 1단계 네 페이지가 같이 씀 | SJ-FE04만 수정. 기존 키·기본 라벨 출력 불변을 QA1에서 확인 |
| R13 | `FF/constants/pools/saju/*`, `saju-pools.constant.ts` | SJ-C1(3개), SJ-C2(7개 + 합본). 합본 파일은 C2가 만들고 C1은 만들지 않음 | C1 파일 3개, C2 파일 7개와 합본. 두 티켓 파일이 겹치지 않음 |
| R14 | `src/app/fortune/saju/page.tsx` | FE06(noindex 추가)과 FE07(noindex 제거)이 같은 파일 | 순서대로 실행. FE07은 QA3 통과 뒤 |
| R15 | `src/app/terms/page.tsx`, `src/app/privacy/page.tsx` | privacy/page.tsx는 fortune-v2 미커밋(staged M). terms는 출시 확인 대상 | 사주 범위에서는 privacy 건드리지 않음. terms는 FE07에서만 확인·수정 |
| R16 | `e2e/fortune-calc.spec.ts` | QA1(사주 블록 추가)만 씀. 1단계 케이스 보존 | QA1만 수정. 1단계 케이스 삭제 금지 |
| R17 | `e2e/fortune-copy.spec.ts` | QA2(V10.3 추가) → QA4(869행 메뉴 검사 출시 기준 변경). 같은 파일을 두 번 고침 | QA2와 QA4 순서 고정. 869행은 QA4 전까지 그대로 둠. 1단계 메뉴 검사와 충돌 |
| R18 | `e2e/fortune.spec.ts` | 출시 후 QA4만 씀. AC-65·AC-80을 AC-88로 교체 | 출시 전에는 건드리지 않음(1단계 출시 상태 검사 유지) |
| R19 | `e2e/fortune-saju.spec.ts` | 신규. QA3만 씀. e2e/fortune-v2.spec.ts(staged A)와 파일명은 다름 | 겹침 없음. SJ-00(e)에서 다른 fortune spec 변경 여부를 확인 |
| R20 | `D/ui-ux-design.md`, `D/calendar-verification.md` | UI-S1은 ui-ux-designer만, BE-S1은 backend-dev만 씀 | 다른 담당 편집 금지 |
| R21 | `FF/saju/components/*` | `'use client'` 범위와 `dark:`·hex 금지. design-guard가 잡는 경우 있음 | SJ-FE05에서 design-guard 통과 확인. 모션은 M1만 |
| R22 | `src/constants/menu-icon.constant.ts` | UD-2 `ScrollText` 설치 여부 미확인. 파일이 다른 기능 공용 | SJ-FE05에서 설치 여부 확인, SJ-FE07에서만 추가 |

## 설계 보완 메모

설계 문서와 승인 사항 사이에서 확인된 빈칸이나 불일치다. 승인 문서는 고치지 않고, 아래 내용을 이 티켓에 반영한다. 설계 보완은 PM이 architect에게 전달한다.

- N1. ui-ux 0.3 요청 세 문구 키. 설계 V10.1의 `FORTUNE_SAJU_PANEL_TEXTS` 항목에 추가한다. (a) 입력 요약 줄 템플릿, 예: "양력 {연}년 {월}월 {일}일 기준"(음력은 확인 줄이 대신함), (b) "계산 기준 보기" 링크 라벨, (c) "생년월일 확인" 버튼 라벨(`submitLabel`). 키 이름은 SJ-FE01이 code-style에 맞춰 정하고 설계에 적는다. 값은 SJ-C3이 쓰고 SJ-G2가 승인한다.
- N2. 착수 조건 (3). `design.md` 13.1·12.2에 "사주 네 기둥"이 아직 남아 있다. design-saju-v2 V9가 우선이라고 설계에 적혀 있으나 원문은 그대로다. SJ-00(d)에서 architect에게 고치게 한다.
- N3. 착수 조건 (1)과 status 불일치. SJ-00(a)에서 확인한다.
- N4. 폴더 구조의 `calendar-verification.md (수정)`는 실제로 파일이 없다. SJ-BE1에서 신규로 만든다.
- N5. 테스트 방식. 설계와 1단계 dev-tasks에 따라 계산 단위 테스트는 Playwright 순수 함수 검사(`e2e/fortune-calc.spec.ts`)로 한다. `package.json`에 단위 테스트 러너가 없고 `e2e`, `e2e:mobile` 스크립트가 있다. 러너를 새로 들이는 것은 PM 확인 대상이다.
- N6. 십신 샘플 3개 매핑. 설계 V1.1의 키로 비견 `bigyeon`, 정재 `jeongjae`, 편관 `pyeongwan`이다. 사용자가 지정한 조합과 같다.
- N7. 메뉴 설명의 "일진". 설계와 UI 절 6.1 모두 "일진"이 설명에 처음 나온다고 적는다. SJ-C3과 SJ-G2에서 풀어 쓸지 결정한다.
- N8. FAQ 질문 "평생 운이나 성격도 알 수 있나요?"에 "평생 운"이 들어간다. 금지어 "평생 운을 알려"와 겹치지 않는지 SJ-QA2가 확인한다.
- N9. 2단계 SEO. `FORTUNE_SAJU_SEO.keywords`에서 "사주 4기둥"은 제외(S2-2). plan 486행 정정은 SJ-02다.

## 사용자 확인 목록

- SJ-04: S2-11 판단 수락 여부(1959 입춘 UTC+9 기준). 거부 시 사용자가 키로 재호출.
- SJ-G1: 십신 샘플 3개(135문장), 한 줄 설명 10개, 기본 점수표 초안.
- SJ-G2: 사주 화면 문장 전체(계산 기준, 입력 문구, 경계 안내, FAQ 5개, 가이드, 메뉴 설명).
- SJ-G3: 허브 개정 문장과 질문 문장 두 안 중 선택.
- 출시 승인(SJ-FE07 앞): 1단계 출시 상태(SJ-00(a))와 함께 확인.
- 법률 확인은 이 목록에 없다(위험 수용 목록, 착수·출시 조건 아님).
