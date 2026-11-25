# 손 없는 날 달력 개발 티켓

입력: `docs/no-son-days/design.md`, `docs/no-son-days/ui-ux-design.md`
기준 승인: plan.md(2026-11-25), design.md(D-1=B, D-2=가, D-3=추천안), ui-ux-design.md(열린 질문 6건 추천대로)
작성: dev-lead, 2026-11-25

## 0. dev-lead 판단 (ui-ux-design.md와 design.md의 차이 5건)

| 번호 | 항목 | 판단 | 반영 티켓 |
|---|---|---|---|
| 1 | 연도 화면 모바일 월 바로가기 nav 위치 | design.md 7.2 트리에는 없다. 연도 화면 전용 표시 요소이므로 `src/features/no-son-days/year/components/month-jump-nav.component.tsx`(서버 컴포넌트)로 둔다. `year/components/root.component.tsx`가 상고 고지와 월 목록 사이에 렌더링한다. 링크는 `#month-1`~`#month-12` 앵커이고 새 데이터가 아니다. 구조 변경이 없으므로 architect 되돌림은 하지 않는다. PM에게 design.md 7.2 보강 기록만 남긴다 | FE-4 |
| 2 | 연도 화면 h2 중복 (달력 월 제목 h2와 "달력으로 보기" h2) | 달력 공용 컴포넌트에 `headingLevel: 'h2' | 'h3'` prop을 둔다(기본 `h2`). 허브 달력은 `h2`(위에 섹션 h2가 없음). 연도 화면 달력은 상위 h2 "달력으로 보기" 아래라서 월 제목을 `h3`로 내린다. 목록 카드의 "1월" h2는 그대로 둔다 | FE-3a, FE-4 |
| 3 | breadcrumb 전용 컴포넌트 vs `PageHeaderComponent` 재사용 | 전용 `NoSonDaysBreadcrumbComponent`를 만든다. 이유: `PageHeaderComponent`는 자체 h1, `border-b`, `max-w-6xl` 레이아웃을 가져서 `TitleWrapperComponent` h1 구조와 맞지 않는다. 이 컴포넌트는 수정하지 않는다. 대신 nav 마크업과 클래스(`mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground`, 구분자 `/`, 홈 링크)는 그대로 옮긴다(ui-ux의 "같은 모양"). 와이어프레임의 `>`는 도식이므로 `/`를 따른다 | FE-3a |
| 4 | 광고 null 반환 시 빈 감싸는 요소 간격 | `AdFitSlotComponent`는 `ADS_DISABLED` 또는 설정 없음일 때 `null`을 낸다. 감싸는 요소는 `<div className="my-10 empty:hidden">`로 둔다. 자식이 없으면 `empty:hidden`으로 요소 전체가 숨고 여백도 사라진다. 동의 전에는 `ConsentNudgeComponent`가 자식으로 있으므로 그대로 보인다. `AdFitSlotComponent`에 `className` prop을 추가하지 않는다 | FE-3b |
| 5 | `AdFitSlotComponent` 작업 트리 수정 중 | `src/features/ad/components/adfit-slot.component.tsx`는 git status상 수정 중(커밋 안 됨)이다. 이 기능 담당은 이 파일을 열지도 고치지도 않는다. FE-3b 착수 전에 frontend-dev가 `git diff`로 확인한다. 그때 props(`fixed`, `topOffsetPx`)가 바뀌었거나 `null` 반환 경로가 달라졌다면 작업을 멈추고 PM에게 올린다. 추가로 `features/no-son-days`가 `features/ad`를 import하는 것은 `code-style.md`의 "먼저 재사용할 기존 코드"(광고 슬롯 `src/features/ad/`)에 따라 예외로 허용한다. 다른 기능(`features/fortune` 등)은 import하지 않는다 | FE-3b, PM-1 |

추가 판단 (design.md와 맞추는 내용):
- 음력 표 공용 이동(D-2)은 `BE-1`로 분리했다. 운세 회귀 단위 테스트(`pnpm test unit/fortune`)와 `verify.mjs --offline` 통과가 끝나야 `BE-2` 이후가 시작된다.
- `FE-2`(메뉴 등록)는 `BE-3`·`FE-3a`·`FE-4`가 `MENU_GROUP_NAME_ENUM`과 `MenuSectionKeyType`을 쓰므로 먼저 끝낸다. 메뉴 링크가 `/no-son-days`를 가리키므로 `FE-3b` 페이지가 생기기 전에는 사용자에게 보이는 배포를 하지 않는다.
- `FE-1`(문구 상수)은 `BE-3`의 SEO 유틸이 상수를 읽으므로 `BE-3` 전에 끝낸다.
- `unit/home/home-copy.test.ts`는 메뉴 순서 배열 기대값을 가진다. 새 그룹이 들어가면 실패하므로 `FE-2`가 기대값을 같이 고친다(design.md 12장에 없는 파일이라 PM에게 알린다).
- 약관 장 번호 이동(`e2e/lucky-draw.spec.ts` 165행, COMPLIANCE.md)은 `FE-6`에 넣는다. 약관 본문은 `FE-6` 한 번에 맞춘다.
- `BE-1`에서 README.md 88행, THIRD_PARTY_NOTICES.md 51행의 표 경로를 같이 바꾼다(design.md 3.1절 7번). 손 없는 날 문장 추가는 `FE-6`에서 한다.

## 티켓

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| DB-0 | db-dev | 없음. 테이블, 컬럼, 마이그레이션, RLS 없음 (design.md 6장) | - | 없음 | 없음 | 없음 (확인만) | 해당 없음 |
| BE-1 | backend-dev | 음력 표·타입·JDN을 공용으로 이동 (별도 선행 게이트). 운세 유틸 정리, 생성 스크립트 경로 변경, README·THIRD_PARTY 표 경로 변경 | - | 신규: `src/constants/lunar-table.constant.ts`, `src/types/calendar.type.ts`. 이동 원본 삭제: `src/features/fortune/constants/calendar/lunar-table.constant.ts`. 수정: `src/lib/date.ts`(JDN 함수 추가만), `src/features/fortune/utils/fortune-date.util.ts`, `src/features/fortune/utils/fortune-lunar.util.ts`, `src/features/fortune/types/fortune-calendar.type.ts`, `scripts/fortune-calendar/generate.mjs`, `scripts/fortune-calendar/calendar-core.mjs`, `unit/fortune/fortune-calendar.test.ts`(import 한 줄), `README.md`(88행), `THIRD_PARTY_NOTICES.md`(51행) | design.md 2장, 3.1절, D-2 | 1) `pnpm test unit/fortune` 전부 통과(이동 전과 같은 테스트 수) 2) `node scripts/fortune-calendar/verify.mjs --offline` 통과 3) 이동한 표 파일이 `formatLunarTable` 출력과 글자 단위로 같음 4) `FortuneLunarYearType` 제거 후 운세 쪽 타입 오류 없음 5) 손 없는 날 파일을 아직 건드리지 않음 | 대기 |
| BE-2 | backend-dev | 공용 날짜 함수 추가, 양력→음력 변환 공용 lib 신설, 단위 테스트 L-1·L-2·L-4 | BE-1 통과 | 수정: `src/lib/date.ts`(함수 추가만, `getKoreaTime`·`getKoreaDateKey` 불변). 신규: `src/lib/lunar-calendar.ts`, `unit/shared/lunar-calendar.test.ts` | design.md 3.2절, 4장 L-1·L-2·L-4 | 1) `toJulianDayNumber`, `fromJulianDayNumber`, `getWeekdayIndex`, `getKoreaYmd`, `toDateKey`, `findLunarYearRow`, `readLunarMonthLength`, `convertSolarToLunar` 시그니처가 3.2절과 같음 2) L-1 왕복 통과(2026-01-01~2049-12-31 매일) 3) L-2 연속성 통과, 설날이 `newYear`와 같음 4) L-4 범위 밖 null 5) 2049-12-31이 표 안에 있음 확인 | 대기 |
| BE-3 | backend-dev | 손 없는 날 타입, 라우트 상수, 판정·월·연·오늘 상태·처음 달·달 이동 순수 함수, SEO 입력 유틸 | BE-2, FE-1 | 신규: `src/features/no-son-days/types/no-son-days.type.ts`, `src/features/no-son-days/constants/no-son-days-route.constant.ts`, `src/features/no-son-days/utils/no-son-days.util.ts`, `src/features/no-son-days/utils/no-son-days-seo.util.ts` | design.md 2장, 3.3절, 8장(SEO 입력) | 1) 3.3절 타입·함수 시그니처와 같음 2) `getNoSonInitialMonth`가 범위 밖에서도 null이 아닌 커서를 돌려줌 3) `getNoSonDaysYearPaths()`가 24개 4) `features/fortune`, `app/` import 없음 5) `pnpm typecheck` 해당 파일 오류 없음(PM 전체 검증은 PM-1) 6) 단위 테스트는 QA-1이 작성 | 대기 |
| BE-4a | backend-dev | 운세 검증 스크립트에 `--from`, `--to`, `--out` 옵션 추가 (옵션 없으면 기존 동작 그대로) | BE-1 통과 | 수정: `scripts/fortune-calendar/verify.mjs` | design.md 4장 KASI 대조 방법 1~2 | 1) 옵션 없이 실행하면 기존 결과 파일 경로·기본 범위(1920~2028)가 그대로 2) `--out`으로 지정한 경로에만 씀 3) 키와 요청 URL을 결과 파일에 넣지 않음 4) `--offline` 통과 | 대기 |
| USER-1 | 사용자 | `DATA_GO_KR_API_KEY`를 본인 셸에 넣고 검증 스크립트 실행 (AI는 키를 읽지 않는다). 결과 파일 생성 | BE-4a | 생성: `unit/shared/fixtures/kasi-lunar-2026-2049.json` | design.md 4장 KASI 대조 방법 3 | 결과 파일이 생기고 일치 수와 불일치 목록을 사용자가 알려 줌 | 대기 |
| BE-4b | backend-dev | KASI 고정값 단위 테스트 L-3, 검증 기록 작성 (AC-13). 불일치가 있으면 원인을 기록하고 PM에게 올린다 | USER-1 | 신규: `docs/no-son-days/verification.md`. 수정: `unit/shared/lunar-calendar.test.ts`(L-3 추가) | design.md 3.4절, 4장 KASI 대조 방법 4~5, `docs/research/auspicious-days.md` 3.8절 | 1) L-3 통과(고정값 전 표본 일치) 2) `verification.md`에 실행일, 시드, 표본 수, 일치 수, 2026년 11~12월 손 없는 날 표(음력 표·KASI·외부 출처 2곳), 차이 이유 3) 외부 사이트 문장은 옮기지 않고 날짜 사실만 적음 | 대기 (사용자 실행 뒤) |
| FE-1 | frontend-dev | 화면 문구 상수 5개와 금지 표현 목록, 문구 검수 기록 | 없음 (병렬 가능) | 신규: `src/features/no-son-days/constants/no-son-days-notice.constant.ts`, `no-son-days-guide.constant.ts`, `no-son-days-seo.constant.ts`, `no-son-days-view.constant.ts`, `no-son-days-copy-rule.constant.ts`, `docs/no-son-days/copy-log.md` | ui-ux-design.md 문구(335~369행), 디자인 명세 참조 색·타이포 없음. design.md 1장(54~59행), 8장(424~428행) | 1) 상단 고지가 AC-8의 4요지를 모두 담음 2) 문구가 ui-ux 문구표와 글자 단위로 같음(효과 암시 "좋은 날"·"복"·"길일", 단정 "반드시", 업체 추천 표현 없음) 3) 화면 문구가 상수 파일 밖에 하드코딩되지 않음 4) 금지 표현 목록 파일이 `no-son-days-copy-rule.constant.ts`에 있고 화면 코드가 import하지 않음 5) `copy-log.md`에 문구 출처와 검수 결과 기록 6) `pnpm lint` 통과 | 대기 |
| FE-2 | frontend-dev | 메뉴 그룹 등록(D-1=B), 메뉴 아이콘·테마·홈 설명, CSS 토큰 추가, 홈 메뉴 순서 테스트 기대값 갱신 | 없음 (병렬 가능, 단 FE-3a 이전 완료) | 수정: `src/constants/menu.constant.ts`, `src/constants/menu-icon.constant.ts`, `src/types/menu.type.ts`, `src/constants/theme.constant.ts`, `src/constants/home.constant.ts`, `src/app/globals.css`(`--menu-no-son-days: #2e5593` 추가, `--color-menu-no-son-days` 매핑 추가, `.dark` 값 없음), `unit/home/home-copy.test.ts`(순서 배열 기대값에 `no-son-days` 추가) | design.md 12장, D-1 표. ui-ux-design.md 색상(18~43행), 헤더(371~376행), 다크 모드(378~382행) | 1) `MENU_GROUP_NAME_ENUM.NO_SON_DAYS = 'no-son-days'`, 라벨 "손 없는 날", 그룹 href `/no-son-days`, 꿈 해몽 다음·로또 앞 2) 항목 `href`·`label`·`icon`(CalendarDays)·`colorClass`·`description`·`example`이 design.md 12장 초안과 같음(문구는 FE-1과 맞춤) 3) 테마 네 맵과 `MenuSectionKeyType`에 키 추가 4) 운세 그룹·운세 허브 코드를 건드리지 않음 5) `pnpm test unit/home unit/fortune` 통과 6) 다른 기능 상수 import 없음 | 대기 |
| FE-3a | frontend-dev | 허브·연도 화면이 같이 쓰는 컴포넌트와 달 커서 훅 (달력, 칸, 면책 고지, 하단 고지, 규칙 설명, 연도 링크, breadcrumb) | BE-3, FE-1, FE-2 | 신규: `src/features/no-son-days/shared/components/calendar.component.tsx`, `calendar-grid.component.tsx`, `disclaimer-notice.component.tsx`, `bottom-notice.component.tsx`, `rule-guide.component.tsx`, `year-links.component.tsx`, `breadcrumb.component.tsx`, `src/features/no-son-days/shared/hooks/use-calendar-month.hook.ts` | design.md 1장(shared), 7.2절(공용 컴포넌트), 7.3절(달 커서 액션 `prev`·`next`·`sync-today`), 9장. ui-ux-design.md 달력 칸 216~241행, 월 제목·이동 243~257행, 상태 259~280행, 연도 링크 209~214행, 면책 고지 328~333행, 접근성 304~317행 | 1) 달력 `headingLevel` prop(기본 h2), 연도 화면은 h3 2) 칸 3줄 구조와 손 없는 날 표식 "손", 윤달 "윤", 오늘 링, `aria-current`, 스크린 리더 문장 3) 이전·다음 버튼 `aria-disabled`(disabled 속성 없음), 범위 끝 클릭 무시 4) 전환 효과와 "이번 달로" 버튼 없음 5) 연도 링크 `currentYear` prop으로 현재 연도 `span` + `aria-current` 6) breadcrumb는 `PageHeaderComponent` 수정 없이 마크업만 옮김 7) 서버 컴포넌트는 `'use client'` 없음, 클라이언트는 달력과 훅만 8) `dark:` 클래스 없음, 색은 토큰만 9) `design-guard`(tsx 저장 시 검사) 통과 | 대기 |
| FE-3b | frontend-dev | 허브 화면: 라우트, 오늘 상태 컴포넌트, 오늘 보정 훅, 허브 컨테이너, 광고 자리 | FE-3a | 신규: `src/app/no-son-days/page.tsx`, `src/features/no-son-days/hub/components/root.component.tsx`, `hub/components/today-calendar.component.tsx`, `hub/components/today-status.component.tsx`, `hub/hooks/use-korea-today.hook.ts`. 읽기만: `src/features/ad/components/adfit-slot.component.tsx` | design.md 7.1절(허브 행), 7.2절(허브 트리), 7.3절(오늘·처음 달·범위 밖), 3.3절(범위 밖 처음 달), 8장(허브 메타·JSON-LD). ui-ux-design.md 허브 107~157행, 상태 카드 259~268행, 광고 319~326행, 고지 328~333행 | 1) `export const revalidate = 3600`, `getKoreaYmd()`로 서버 오늘, 처음 달은 `getNoSonInitialMonth` 2) `use-korea-today`는 effect 안에서만 기기 날짜를 읽음 3) 상태 카드가 달력보다 먼저 옴, 범위 밖이면 다음 손 없는 날 영역 숨김 4) 광고: 허브 하단 한 곳, 래퍼 `<div className="my-10 empty:hidden">`, 광고 개수 2 이하 5) 광고를 달력·상태 카드·고지 사이에 넣지 않음 6) `buildMetadata()` 사용, h1 한 개, BreadcrumbList JSON-LD 7) `adfit-slot.component.tsx` 수정 없음(착수 전 `git diff` 확인, 이상 있으면 PM에 보고) 8) `features/fortune` import 없음 | 대기 |
| FE-4 | frontend-dev | 연도 화면: 정적 생성 라우트, 12개월 목록, 모바일 월 바로가기, 연도 달력, 연도 링크, 허브 링크 | FE-3a (FE-3b와 병렬 가능) | 신규: `src/app/no-son-days/[year]/page.tsx`, `src/features/no-son-days/year/components/root.component.tsx`, `year/components/month-list.component.tsx`, `year/components/month-jump-nav.component.tsx`. 읽기만: `src/features/no-son-days/shared/*` | design.md 7.1절(연도 행, `generateStaticParams`, `dynamicParams = false`), 7.2절(연도 트리), 8장(연도 메타·키워드). ui-ux-design.md 연도 화면 181~207행, 연도 링크 209~214행, 월 목록 201~204행, 접근성 304~317행 | 1) `generateStaticParams` 24개(2026~2049), `dynamicParams = false`, 페이지 안 `parseNoSonDaysYear` null이면 `notFound()` 2) 순서: breadcrumb, h1, 상단 고지, 월 바로가기(`lg:hidden`, `nav aria-label="월 바로가기"`), 12개월 목록(카드 `id="month-N"`, `scroll-mt-52`), h2 "달력으로 보기" 아래 달력(h3 월 제목), 연도 링크(현재 연도 표시), 허브 링크, 규칙 설명, 하단 고지 3) 광고는 전역 배너 외에 추가하지 않음 4) 메타 title·description에 연도 포함, h1 한 개 5) 목록 항목 음력 "윤" 표기 6) 320px에서 가로 스크롤 없음(QA-2 확인) | 대기 |
| FE-5 | frontend-dev | 사이트맵에 연도 경로 24개 추가 | BE-3, FE-2 | 수정: `src/app/sitemap.ts`(한 블록만 추가) | design.md 8장(사이트맵 행), 14장 | 1) `getNoSonDaysYearPaths()` 결과 24개가 등록됨 2) 허브 `/no-son-days`는 `MENU_LIST` 경로로 이미 포함됨을 확인 3) 우선순위 기존 함수(0.6) 유지 4) 다른 기능 블록 변경 없음 | 대기 |
| FE-6 | frontend-dev | 약관 새 장, 방침 문단, COMPLIANCE.md 항목과 Robots 줄, THIRD_PARTY 문장, lucky-draw e2e 장 번호 한 줄 | BE-1, FE-3b, FE-4 (문구 정확성을 위해 화면 완료 뒤) | 수정: `src/app/terms/page.tsx`(10장 다음에 "11. 손 없는 날 달력 서비스" 추가, 기존 11~20장은 12~21장), `src/app/privacy/page.tsx`(1장 꿈 해몽 문단 다음 문단 추가, `EFFECTIVE_DATE` 변경 없음), `COMPLIANCE.md`(7장 Actions 줄, 11장 No-son days 항목, 운세 항목의 "Terms (chapter 14)" → 15, 운빨 뽑기 장 이동 문장), `THIRD_PARTY_NOTICES.md`(51행 항목에 손 없는 날 같은 표 사용 문장), `e2e/lucky-draw.spec.ts`(165행 `^11\. 광고 및 쿠키$` → `^12\. 광고 및 쿠키$` 한 줄만) | design.md 11장(11.1~11.3절), 14장(충돌 항목). plan.md 법적·정책 요구사항(118~138행), AC-11 | 1) 약관 장 번호가 1부터 이어짐, 손 없는 날 장은 민속 관례·결정 책임·외부 링크 없음·입력 없음을 담음 2) 방침에 "입력값 없음, 저장 없음" 문단, 브라우저 저장소 목록에는 추가 안 함 3) `EFFECTIVE_DATE` 값 변경 없음 4) COMPLIANCE.md 항목에 design.md 11.3절 담을 것을 모두 담음 5) `e2e/lucky-draw.spec.ts`는 165행만 바뀜 6) 다른 약관 작업(공유, 뭐 먹지 지역 등)과 장 번호 순서를 PM이 확인한 뒤 착수 | 대기 |
| QA-1 | qa | 단위 테스트: U-1~U-10(`unit/no-son-days/no-son-days-rule.test.ts`), C-1(`unit/no-son-days/no-son-days-copy.test.ts`). 정적 AC(AC-7, AC-8, AC-10, AC-11, AC-12) 확인 목록 | BE-3, FE-1 (C-1은 FE-1 뒤) | 신규: `unit/no-son-days/no-son-days-rule.test.ts`, `unit/no-son-days/no-son-days-copy.test.ts`, `docs/no-son-days/qa-report.md`(단위·정적 항목) | design.md 4장 U-1~U-10, C-1. plan.md AC-4~AC-9 | 1) U-1~U-10, C-1 통과 2) 정적 AC 항목을 코드·문서로 확인하고 결과를 qa-report에 적음 3) 실패 항목은 해당 dev에게 되돌림 | 대기 |
| QA-2 | qa | E2E 흐름 테스트 `e2e/no-son-days.spec.ts`: AC-1~3(`[E2E]`), 320px 가로 스크롤과 7열 확인, 2026-01·2049-12 범위 밖 버튼 확인(`page.clock`), 모바일 `@smoke` 허브 1개 | FE-3b, FE-4, FE-2 | 신규: `e2e/no-son-days.spec.ts`, `docs/no-son-days/qa-report.md`(E2E 항목). 금지: `e2e/lucky-draw.spec.ts`(FE-6 담당) | design.md 7.3절(`page.clock` 예), ui-ux-design.md 달력 칸 241행(320px 윤달 칸), 접근성 304~317행. plan.md AC-1~3 | 1) `npm`이 아니라 `pnpm`으로 `pnpm e2e --grep no-son-days`(데스크톱) 통과 2) 모바일은 `@smoke` 한 개만 3) 320px에서 가로 스크롤 없음, 윤달 칸 "윤10.29" 줄바꿈 없음 4) 1024px·1280px 헤더 줄바꿈·넘침 확인(결과를 qa-report에) | 대기 |
| QA-3 | qa | 전체 회귀 1회 | QA-1, QA-2, FE-6, FE-5, PM-1의 코드 완료 | 신규: `docs/no-son-days/qa-report.md`(회귀 항목) | 해당 없음 | 1) `pnpm test`(전체 단위) 통과 2) `pnpm e2e --project=desktop` 통과 3) 실패 항목 원인 기록 | 대기 |
| PM-1 | PM (검증 단계) | `pnpm typecheck`, `pnpm lint`, 메타데이터·JSON-LD·sitemap 확인, 광고 상한 확인, 금지 import 확인, 법적 고지 확인, 시행일 확인 | QA-3 | 읽기 중심. 수정이 필요하면 해당 dev에게 되돌림 | design.md 9장, 8장, 14장. plan.md 법적·정책 요구사항 | 1) typecheck, lint 통과 2) `grep`으로 `features/fortune` import 없음 3) 허브·연도 화면 `buildMetadata()`와 BreadcrumbList 확인 4) 광고 2개 이하 5) 고지 문구와 출처 문구 존재 6) 배포 전 확인 항목 기록(AdFit 점술 심사, 같은 광고 단위 중복, 검색량, 시행일) | 대기 |

## 티켓 상세 (읽을 문서 절)

담당 agent에게 넘길 때는 아래 줄 범위만 읽게 한다. 공통으로 `docs/conventions/code-style.md` 전체(116행)와 `docs/conventions/tech-stack.md`를 읽는다.

| ID | 읽을 문서 절 (줄 범위) | 병렬 가능 여부 |
|---|---|---|
| BE-1 | design.md 13~25행(D-1 표 생략 가능), 27~36행(D-2), 45~106행(폴더 구조 중 공용 목록 88~92행), 122~151행(3.1절) | 단독 선행. BE-1 중에는 다른 공용 파일 작업 금지 |
| BE-2 | design.md 153~191행(3.2절) 및 299~318행(4장 L-1·L-2·L-4) | BE-1 뒤. BE-4a와 병렬 가능 |
| BE-3 | design.md 193~285행(3.3절), 108~120행(2장), 419~434행(8장) | BE-2, FE-1 뒤. 다른 작업과 병렬 가능 |
| BE-4a | design.md 321~328행(4장 KASI 대조 방법 1~3) | BE-1 뒤. BE-2와 병렬 가능(파일 다름) |
| USER-1 | design.md 327~328행(PowerShell 예) | BE-4a 뒤. 사용자가 실행 |
| BE-4b | design.md 287~297행(3.4절), 329~333행(4·5번), `docs/research/auspicious-days.md` 3.8절, plan.md 72~85행 중 AC-13(84행) | USER-1 뒤 |
| FE-1 | ui-ux-design.md 335~369행(문구), 368~369행(문구 규칙). design.md 54~59행(상수 파일), 424~428행(SEO 문구). plan.md 121~125행(고지 요지) | 병렬 가능(단독 선행 없음) |
| FE-2 | design.md 13~25행(D-1), 488~501행(12장). ui-ux-design.md 18~43행(색), 371~382행(헤더·다크) | 병렬 가능. FE-3a 전 완료 |
| FE-3a | design.md 45~106행(폴더 구조 shared·hooks), 358~377행(허브 트리 중 공용), 379~394행(연도 트리 중 공용), 401~417행(7.3절). ui-ux-design.md 209~214행, 216~257행, 259~280행, 304~317행, 328~333행 | FE-3b·FE-4 전 완료. FE-5와 병렬 가능 |
| FE-3b | design.md 345~377행(허브 페이지·트리), 401~411행(상태), 419~434행(허브 SEO). ui-ux-design.md 107~157행, 259~268행, 319~326행 | FE-4와 병렬 가능 |
| FE-4 | design.md 347~351행(연도 페이지), 379~394행(연도 트리), 424행(연도 SEO). ui-ux-design.md 181~214행, 304~317행 | FE-3b와 병렬 가능 |
| FE-5 | design.md 419~434행(8장 사이트맵 행), 504~521행(13장 FE-5), 523~533행(14장) | FE-3a·FE-3b·FE-4와 병렬 가능 |
| FE-6 | design.md 463~486행(11장), 523~533행(14장). plan.md 118~138행(법적·정책), 77~84행 중 AC-11(82행) | BE-1, FE-3b, FE-4 뒤. 다른 약관 작업과 순서 맞춤 |
| QA-1 | design.md 299~320행(4장 표). ui-ux-design.md 335~337행(금지어 검사 주의). plan.md 68~85행(AC 목록) | BE-3 뒤, C-1은 FE-1 뒤. FE-3 작업과 병렬 가능 |
| QA-2 | design.md 343~417행(7장, 특히 7.3절 417행). ui-ux-design.md 241행, 304~317행. plan.md 72~74행(AC-1~3) | FE-3b, FE-4 뒤 |
| QA-3 | plan.md 전체 AC 목록(68~85행) | 마지막 한 번 |
| PM-1 | design.md 436~444행(9장 보안), 419~434행(8장), 523~533행(14장). plan.md 118~138행 | QA-3 뒤 |

## 실행 순서

1. [병렬] BE-1(음력 표 공용 이동, 게이트), FE-1(문구 상수), FE-2(메뉴 등록)
   - BE-1 완료 조건(운세 회귀 테스트 통과)을 PM이 확인한 뒤 다음 단계로 넘어간다.
2. [병렬] BE-2(공용 날짜·음력 lib, BE-1 뒤), BE-4a(검증 스크립트 옵션, BE-1 뒤)
3. BE-3(손 없는 날 타입·함수, BE-2와 FE-1 뒤)
   - 같은 시점: QA-1 단위 테스트 작성 시작(BE-3 뒤)
4. [병렬] FE-3a(shared 컴포넌트와 훅, BE-3·FE-1·FE-2 뒤), FE-5(사이트맵, BE-3 뒤)
   - 같은 시점: USER-1(사용자가 KASI 키로 실행, BE-4a 뒤)
5. [병렬] FE-3b(허브, FE-3a 뒤), FE-4(연도 화면, FE-3a 뒤)
   - USER-1이 끝나면 BE-4b(L-3과 verification.md)
6. FE-6(약관·방침·COMPLIANCE·lucky-draw e2e 한 줄, FE-3b·FE-4·BE-1 뒤)
7. QA-2(E2E 흐름, FE-3b·FE-4 뒤)
8. QA-3(전체 회귀 1회, 모든 코드 완료 뒤)
9. PM-1(검증: typecheck, lint, 정적 확인)
10. 배포 전 사용자 확인(검색량, AdFit 심사, 같은 광고 단위 중복, 시행일)

## 동시 실행 가능

- 1단계: BE-1, FE-1, FE-2 (서로 다른 파일)
- 2단계: BE-2와 BE-4a (`src/lib/`와 `scripts/fortune-calendar/`로 다름)
- 4단계: FE-3a와 FE-5 (FE-5는 `src/app/sitemap.ts`만 건드림)
- 5단계: FE-3b와 FE-4 (라우트와 year·hub 폴더가 다름. shared 파일은 둘 다 수정하지 않음. 수정이 필요하면 FE-3a로 되돌림)
- 테스트: QA-1(단위)은 FE-3a·FE-3b·FE-4와 병렬 가능. QA-2는 FE-3b·FE-4 뒤.
- 사용자 작업(USER-1)은 BE-4a 뒤 언제든 가능. BE-4b와 AC-13 확인은 USER-1 뒤.

## 충돌 위험

| 파일 | 위험 | 조치 |
|---|---|---|
| `src/lib/date.ts` | BE-1(JDN 이동)과 BE-2(함수 추가)가 같은 파일 | BE-1 → BE-2 순서로 한다. 기존 `getKoreaTime`·`getKoreaDateKey`는 바꾸지 않는다. 현재 작업 트리에서 이 파일은 수정 중이 아니다 |
| `src/features/ad/components/adfit-slot.component.tsx` | 작업 트리에서 수정 중(커밋 안 됨). 이 기능의 광고 자리가 의존 | 이 기능은 열거나 고치지 않는다. FE-3b 착수 전에 `git diff`로 확인하고, 변경으로 `null` 반환 경로나 props가 바뀌었으면 PM에 올린다 |
| `src/hooks/use-share.hook.ts`, `src/lib/share-env.ts` | 공유 작업이 수정 중(스테이지됨·수정됨) | 이 기능은 공유 파일을 쓰지 않는다. 건드리지 않는다 |
| `docs/conventions/design-system.md` | PM이 메뉴 라벨 색 행을 추가함 | 담당 agent는 수정하지 않는다. 이미 반영됨(35행) |
| `src/constants/menu.constant.ts`, `menu-icon.constant.ts`, `theme.constant.ts`, `home.constant.ts`, `src/types/menu.type.ts`, `src/app/globals.css` | 메뉴를 바꾸는 다른 기능과 겹침. 헤더·홈 7그룹 폭 영향 | FE-2만 고친다. QA-3에서 헤더 폭(1024px, 1280px)을 확인한다 |
| `unit/home/home-copy.test.ts` | 메뉴 순서 기대값이 바뀌어 실패함 | FE-2가 같이 고친다. design.md 밖의 파일이므로 PM에 알린다 |
| `unit/fortune/fortune-copy.test.ts`, `meal-copy.test.ts`, `lucky-draw-copy.test.ts` 등 `MENU_LIST`를 쓰는 테스트 | 그룹 추가로 영향 가능 | QA-3 전체 회귀에서 확인한다 |
| `src/features/fortune/*` 음력 파일, `scripts/fortune-calendar/*.mjs`, `unit/fortune/fortune-calendar.test.ts` | 운세 쪽 음력 기능과 겹침 | BE-1과 BE-4a만 고친다. 운세의 다른 작업과 동시에 하지 않는다 |
| `src/app/sitemap.ts` | 다른 기능도 경로를 추가함 | FE-5가 한 블록만 추가한다 |
| `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`, `COMPLIANCE.md`, `THIRD_PARTY_NOTICES.md`, `README.md` | 장 번호와 문서를 여러 기능이 같이 고침. `EFFECTIVE_DATE` 공유 | FE-6은 다른 약관 작업과 순서를 맞춘다. `EFFECTIVE_DATE`는 이 작업에서 바꾸지 않는다. 장 번호 충돌이 있으면 PM이 정한다 |
| `e2e/lucky-draw.spec.ts` | 165행 한 줄만 FE-6이 고침. QA 담당이 이 파일을 건드리면 충돌 | QA-2는 `e2e/no-son-days.spec.ts`만 만든다 |
| `README.md` 88행, `THIRD_PARTY_NOTICES.md` 51행 | BE-1(경로)과 FE-6(문장)이 같은 파일을 고침 | BE-1 → FE-6 순서로 한다 |
| `src/features/no-son-days/shared/components/` | FE-3a가 만들고 FE-3b·FE-4가 쓴다 | FE-3b·FE-4는 shared를 수정하지 않는다. 필요하면 FE-3a로 되돌린다 |
| 광고 단위 중복 | 허브에 레이아웃 배너와 하단 AdFit이 같은 광고 단위로 두 번 들어감(D-3) | 배포 전 AdFit 정책 확인. 불가하면 허브 하단 광고를 빼고 배포한다(PM 결정) |
| `features/no-son-days` → `features/ad` import | 기능 간 import 규칙의 예외 | 재사용 목록에 명시되어 허용한다. PM-1에서 `features/fortune` import가 없는지 확인한다 |
| 음력 표 행 수 | 표 파일은 자동 생성 파일이라 손으로 고치면 `verify.mjs`가 실패함 | 표 본문은 고치지 않는다. 생성 스크립트 경로만 바꾼다 |
| 사용자 KASI 키 | AI가 키를 읽거나 저장하지 않는다. 결과 파일에 키·요청 URL을 넣지 않는다 | USER-1은 사용자가 셸에서 직접 실행한다 |
