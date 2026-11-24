# 뭐 먹지 동네 이름 입력 지도 검색 개발 티켓

입력: `docs/meal-location/design.md`(승인), `docs/meal-location/ui-ux-design.md`(승인), `docs/meal-location/plan.md`의 AC 표
규칙: `docs/conventions/code-style.md`, `docs/conventions/tech-stack.md`
작성: dev-lead, 2026-11-24

## 확정 결정 (승인 문서 기준)

승인 때 전부 추천안으로 확정됐다. 티켓은 이 값을 기준으로 쓴다.

| 항목 | 확정 |
|---|---|
| plan Q1 입력 규칙 | 최대 20자, 한글 완성형·영문·숫자·공백·`·`(U+00B7)·`-`(U+002D)만 허용 |
| design DQ1 FAQ 지도 답 | 답 문장만 수정. JSON-LD 구조와 질문 수 7개 유지 |
| design DQ2 방침·약관 시행일 | 배포일로 바꾼다. 두 페이지 같은 값 (OPEN-2) |
| design DQ3 비슷한 문자 | 변환 없음. `·`와 `-`만 허용, 나머지는 `invalid_char` |
| design DQ4 결과 짧은 고지 | 동네 이름이 유효할 때만 표시 |
| ui-ux U-L1 데스크톱 배치 | 세로로 쌓는다. 입력란 `max-w-sm`, 고지 목록 `max-w-2xl` |
| ui-ux U-L2 고지 모양 | 틀 없이 점 목록(`list-disc`) 5개 |
| ui-ux U-L3 입력란 테두리 | 이 입력란만 `border-muted-foreground` |
| ui-ux U-L4 모션 | 넣지 않는다. 즉시 나타나고 사라진다 |
| ui-ux U-L5 `aria-describedby` | 오류 id + 고지 id 둘 다 연결 |
| 상시 고지 문장 | ui-ux "상시 고지 문구" 5줄. design 7.6의 6번 항목은 5번에 합쳐져 있다 |

## 확인된 사실과 정정

- 궁합 커밋 전제: design은 `privacy/page.tsx`, `terms/page.tsx`, `COMPLIANCE.md`에 궁합 미커밋 변경이 있다고 적었다. 그런데 기동 스냅샷의 git status에는 meal-location 문서 2개만 변경돼 있고, 궁합은 커밋 `298149c`로 이미 `develop`에 들어가 있다. 그래서 선행 조건은 G-1로 남기고, 시작 전에 `git status`로 다시 확인한다.
- 권한 정정(guard-files): `unit/` 하위는 `qa`만 쓸 수 있고 `frontend-dev`는 못 쓴다. design 7장 표는 `unit/meal/meal-copy.test.ts`, `meal-notice.test.ts` 수정을 FE-2에 두었지만, 이 두 파일 수정은 QA-3으로 옮긴다.
- 권한 정정(COMPLIANCE.md): 루트 `COMPLIANCE.md`는 어느 agent 범위에도 없다. DOC-1은 PM이 직접 한다.
- 권한 정정(menu-meals 문서): `docs/menu-meals/*`는 design대로 PM이 고친다.
- 줄 번호: design의 줄 번호(방침 88~97, 212~218, 약관 219~227, COMPLIANCE 14·160·161·164)는 궁합 커밋 이후 달라졌을 수 있다. 각 담당은 줄 번호가 아니라 문장으로 찾는다.
- 금칙: `npm`, `npx`는 훅이 막는다. 실행은 `pnpm`으로 한다.

## 열린 항목 (실행 전 확인)

- OPEN-1 AC-6 모바일 실행 범위: plan AC-6은 "데스크톱과 모바일 양쪽"을 요구한다. 하네스 규칙은 모바일 프로젝트에서 `@smoke`만 돌린다. 제안: AC-6 테스트를 `@smoke`로 태그하고 320px 뷰포트를 테스트 안에서 직접 지정한다. PM 승인 필요.
- OPEN-2 시행일 값: DQ2 A(배포일)이지만 배포일은 아직 없다. FE-4는 문장만 고치고, `EFFECTIVE_DATE`는 PM이 배포 직전에 같은 값으로 두 파일에 넣는다. 운영 배포는 사용자 확인을 받는다.
- OPEN-3 한글 조합: Playwright `fill`은 조합 이벤트를 내지 않으므로 자동 테스트로 확인할 수 없다. QA-5의 수동 체크리스트로 한다.

## 티켓

| ID | 담당 | 내용 | 선행 작업 | 관련 파일 | 디자인 명세 참조 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| G-1 | PM | 궁합 커밋 게이트. 시작 전 `git status`로 privacy, terms, COMPLIANCE.md에 미커밋 변경이 없는지 확인 | - | `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `COMPLIANCE.md` | - | 미커밋 변경 없음을 확인하고 `status.md`에 기록. 통과 전에는 FE-4, DOC-1을 시작하지 않는다 | 대기 |
| DB-1 | db-dev | 없음. DB 변경 없음 (design 4장) | - | - | - | 없음 | 해당 없음 |
| BE-1 | backend-dev | 없음. API 없음, 서버 전송 없음 (design 3장) | - | - | - | 없음 | 해당 없음 |
| FE-1 | frontend-dev | 입력 검사 타입 2개 추가, 입력 규칙 함수 신규, 지도 검색어 조합과 URL 조립 변경 | - | `src/features/meal/types/meal.type.ts` (수정), `src/features/meal/constants/meal-area.constant.ts` (신규), `src/features/meal/utils/meal-area.util.ts` (신규), `src/features/meal/utils/meal-map-link.util.ts` (수정) | design 5장, 6장. 화면 명세 없음 | `parseMealAreaInput`이 design 5.2의 6단계 순서 그대로 동작한다. `buildMealMapLinks(menu, area)`는 `area` 기본값 없이 받는다. `encodeURIComponent`는 전체 검색어에 한 번만 쓴다. 호스트, 경로, 구글 `api=1`, 링크 속성은 그대로다. 파일 머리 주석을 고친다. biome 통과. typecheck 오류는 `map-links.component.tsx`의 `buildMealMapLinks(menu)` 호출 1곳뿐이며 FE-3에서 없앤다 | 대기 |
| FE-2 | frontend-dev | 문구와 상수: 동네 입력 절 추가, 외부 링크 안내 문장 수정, FAQ 지도 답 수정(DQ1), 금지어 5개 추가, 문구 기록 작성 | FE-1 (`MEAL_AREA_MAX_LENGTH` 사용) | `src/features/meal/constants/meal-notice.constant.ts` (수정), `src/features/meal/constants/meal-faq.constant.ts` (수정), `src/features/meal/constants/meal-copy-rule.constant.ts` (수정), `docs/meal-location/copy-log.md` (신규) | ui-ux "상시 고지 문구", "입력 영역 상태별 화면"의 오류 문구, "검색어 미리보기", "결과 화면 짧은 고지" 절. design 7.6, 7.7, DQ1 | 모든 문장이 ui-ux 확정 문구와 글자 단위로 같다. `MEAL_EXTERNAL_LINK_NOTICE_TEXT`를 고쳐도 `MEAL_COPY_ALLOWED_SENTENCES`의 5개 구조는 그대로다(이 목록이 상수를 참조한다). 새 문장은 허용 목록에 넣지 않는다. 금지어 "주변, 근처, 현재 위치, 내 위치, GPS"를 한 묶음으로 추가하고 기존 금지어는 유지한다. `tooLong` 문장은 `MEAL_AREA_MAX_LENGTH`를 쓴다. FAQ 질문 수 7개와 첫 답은 그대로다. `copy-log.md` 작성 | 대기 |
| FE-3 | frontend-dev | 화면: 동네 입력 훅, 입력 컴포넌트, root 배치, 결과 카드의 미리보기와 짧은 고지, `map-links`와 `result`에 `area` 전달 | FE-1, FE-2 | `src/features/meal/roulette/hooks/use-meal-area-input.hook.ts` (신규), `src/features/meal/roulette/components/area-input.component.tsx` (신규), `src/features/meal/roulette/components/root.component.tsx` (수정), `src/features/meal/roulette/components/result.component.tsx` (수정), `src/features/meal/roulette/components/map-links.component.tsx` (수정) | ui-ux 전 장: 화면별 레이아웃, 입력 영역 상태별 화면, 색상, 타이포그래피, 간격·그리드, 접근성, 인터랙션. design 7.2~7.5 | DOM 순서가 필터 패널 → 입력 영역 → 스핀 패널이다(CSS `order` 금지). 입력 속성은 design 7.5 표 그대로다. 라벨은 `htmlFor`로 연결한다. 오류 안내의 `aria-live="polite"` 영역은 항상 그린다. `aria-describedby`는 오류 id(있을 때)와 고지 id를 모두 가리킨다. 지우기 버튼은 값이 있을 때만 그리고, 누르면 입력란에 포커스를 돌린다. 미리보기(`dl`)와 짧은 고지는 유효할 때만 그린다. 외부 링크 안내는 항상 그린다. 조합 중에는 `committedValue`를 바꾸지 않는다(`isComposing` 검사 + `compositionend`). 회전 중 입력을 잠그지 않는다. `form`, router, storage, `console`, `dangerouslySetInnerHTML`을 쓰지 않는다. 색은 토큰만 쓰고 `dark:`는 없다. `bg-menu-meal/10`, `border-muted-foreground`, `md:text-base`를 쓴다. typecheck 전체 0 오류, biome 통과, design-guard 통과 | 대기 |
| FE-4 | frontend-dev | 법적 문구: 방침 1장 문단 추가, 방침 6장 지도 문단 수정, 약관 9장 둘째 문단 수정, 두 페이지 시행일 | G-1 통과, OPEN-2 (값은 PM이 배포 직전에 넣는다) | `src/app/privacy/page.tsx` (수정), `src/app/terms/page.tsx` (수정) | 화면 명세 없음. 문장은 design 갱신 표(332~334행) 초안 | 방침 1장: 타로·운세(궁합 포함) 문단 뒤에 새 문단을 넣는다. 방침 6장: "검색어로 뽑힌 메뉴 이름과, 이용자가 동네 이름을 적은 경우 그 동네 이름이 전달됩니다", "고른 끼니와 조건, 적은 동네 이름, 뽑힌 결과를"로 바꾸고, 상세 주소·전화번호 안내 문장을 끝에 더한다. 약관 9장 둘째 문단도 같은 기준으로 고치고, 지도 검색 결과 책임 문장을 더한다. "위치 정보를 요청하지 않으며"는 유지한다. "입력을 받지 않는다" 문장이 있으면 고친다(현재 검색으로는 없음, 확인만). 두 페이지 `EFFECTIVE_DATE`는 같은 값이다. 기존 타로·운세·궁합 문장은 건드리지 않는다 | 대기 |
| DOC-1 | PM (직접) | `COMPLIANCE.md` Meal 항목: 요약 행(14행 부근), 검색어 문장(160행 부근), 입력 문장(161행 부근), 위험 수용 항목(164행 부근) 추가 | G-1 통과, FE-2 (문장 확정) | `COMPLIANCE.md` | design 갱신 표 4행 | "No input is collected" 대체 문장, "with the menu name as the only query" 대체, "The query is the menu name only..." 대체. "no location permission is requested"와 `geolocation=()` 문장 유지. 위험 수용 항목 4개(이용자가 적은 지명의 개인정보 해당 여부, 위치정보법 적용 여부, 이용자 입력이 붙은 검색 링크의 지도 약관 적합성, 같은 페이지 외부 광고 스크립트의 DOM 접근 가능성) 추가, 결정일 2026-11-24 | 대기 |
| DOC-2 | PM | `docs/menu-meals/plan.md` F-6, AC-19 문장 끝에 대체 안내 덧붙임. `docs/menu-meals/design.md` XSS 문장(1045행) 갱신 | - (FE와 병렬 가능) | `docs/menu-meals/plan.md`, `docs/menu-meals/design.md` | design 갱신 표 336~337행 | 본문은 지우지 않는다. 덧붙임 문장: "동네 이름을 적은 경우는 `docs/meal-location/plan.md` AC-1·AC-2가 대체(2026-11-24)". design.md 1049행(위치 요청 없음)은 그대로 | 대기 |
| QA-1 | qa | 단위 테스트 신규: 입력 규칙 함수 (AC-4) | FE-1 | `unit/meal/meal-area.test.ts` (신규), `src/features/meal/utils/meal-area.util.ts` (읽기) | design 테스트 범위 단위 1번 | 빈 입력, 정리, valid 목록, 길이 20/21, `invalid_char` 목록, 검사 순서(21자 + 금지 문자 → `invalid_char`), NFC, 순수성 케이스 전부 vitest 통과 | 대기 |
| QA-2 | qa | 단위 테스트 신규: 지도 검색어 조합과 URL 조립 (AC-2, AC-5 보강) | FE-1 | `unit/meal/meal-map-link.test.ts` (신규), `src/features/meal/utils/meal-map-link.util.ts` (읽기) | design 테스트 범위 단위 2번 | 빈·오류 입력의 href가 `baseUrl + encodeURIComponent(메뉴)`와 같다. 유효 입력은 `동네 + 한 칸 + 메뉴`로 조합된다. `mapQuery` 메뉴 처리. 중복 제거 없음. host와 구글 파라미터 키(`api`, `query`) 검사. vitest 통과 | 대기 |
| QA-3 | qa | 기존 단위 테스트 수정: 외부 링크 고정값 교체, 지도 FAQ 기대 문장 교체, 새 금지어 검사 추가 (AC-12) | FE-2 완료 직후 (이 사이에 meal vitest를 게이트로 쓰지 않는다) | `unit/meal/meal-notice.test.ts` (수정), `unit/meal/meal-copy.test.ts` (수정) | design 테스트 범위 "기존 단위 테스트 수정" | 허용 문장 5개 검사는 그대로. `noticeStrings()`가 새 문구를 자동으로 검사한다. 새 금지어 5개 검사 추가. vitest meal 전체 통과 | 대기 |
| FE-3 완료 후 | - | (FE-3과 QA-3은 파일이 겹치지 않아 같은 단계에서 병렬 가능) | - | - | - | - | - |
| QA-4 | qa | e2e 신규: AC-1, 2, 3, 5, 6, 7, 8 | FE-3 | `e2e/meal-location.spec.ts` (신규), `e2e/helpers/meal.util.ts` (재사용, 수정 안 함) | ui-ux "입력 영역 상태별 화면", "검색어 미리보기", "결과 화면 짧은 고지", 접근성 절 | AC-1, 2, 3, 5, 7, 8: `--project=desktop`으로 통과. AC-6: `@smoke`로 태그하고 320px 뷰포트를 지정해 mobile 프로젝트에서 통과 (OPEN-1). AC-8은 요청 URL과 본문, `localStorage`, `sessionStorage`, `document.cookie`에 입력 문자열이 없는지 확인한다. 지도 링크 요청에만 입력 문자열이 있다. `e2e/meal.spec.ts`는 수정하지 않는다. 실행은 이 spec만 | 대기 |
| QA-5 | qa | 정적, 수동, 회귀 확인: AC-9, AC-10, AC-11, 한글 조합 수동 체크, 회귀 1회 | QA-4, FE-4, DOC-1, DOC-2 | `docs/meal-location/qa-report.md` (신규), 변경 파일 전체 | design 테스트 범위 "정적" 절, 수동 확인 | AC-9: design 정적 절의 grep 목록(`localStorage|sessionStorage|indexedDB|document.cookie|console\.|track\(|router\.|useSearchParams|history\.|dangerouslySetInnerHTML|<form`)에서 새·수정 파일 결과 0건. AC-10: `next.config.ts`의 `geolocation=()` 유지, `navigator.geolocation` 호출 없음. AC-11: 문서 4곳(COMPLIANCE, 방침, 약관, menu-meals) 문장 확인. 한글 조합 수동 4항목(자음 상태에서 미리보기·링크 불변, 글자 확정 뒤 반영, 입력란 밖 클릭 시 반영, 오류 안내 갱신). 회귀 1회: `e2e/meal.spec.ts` desktop과 `unit/meal` 전체. 실패 항목은 담당에게 되돌린다 | 대기 |
| PM-1 | PM | 검증 단계: `pnpm typecheck`, `pnpm lint` 각 1회. 법적 고지, 보안, 메타데이터·JSON-LD·sitemap 변경 없음 확인. `status.md` 갱신 | 전 티켓 완료 | `docs/meal-location/status.md` | design 보안, 법적 절 | 두 명령 통과. 검색 노출: FAQ 답 1개만 바뀌고 title, description, sitemap은 그대로. 실패하면 담당에게 되돌린다 | 대기 |

## 실행 순서

0. 게이트: G-1 확인 (PM). OPEN-1은 실행 전, OPEN-2는 배포 전에 정한다.
1. 병렬: FE-1 ‖ DOC-2 ‖ FE-4 (FE-4는 G-1 통과 후). FE-1과 FE-4는 frontend-dev가 맡아도 파일이 겹치지 않는다.
2. 병렬 (FE-1 완료 후): FE-2 ‖ QA-1 ‖ QA-2
3. 병렬 (FE-2 완료 후): QA-3 ‖ FE-3 ‖ DOC-1. QA-3은 FE-2 직후 바로 돌려 `unit/meal` 실패 구간을 줄인다. DOC-1은 G-1 통과 뒤에만 한다.
4. QA-4 (FE-3 완료 후)
5. QA-5 (QA-4, FE-4, DOC-1, DOC-2 완료 후)
6. PM-1 검증: `pnpm typecheck`, `pnpm lint`. 실패하면 담당에게 되돌리고 고친 뒤 다시 돌린다.
7. 보고 후 배포 승인 요청 (배포 날짜로 `EFFECTIVE_DATE` 확정, 운영 배포는 사용자 확인).

FE-1부터 FE-3까지는 frontend-dev가 순서대로 맡는다. QA-4는 FE-3 뒤에만 실행한다.

## 동시 실행 가능

- 1단계: FE-1, DOC-2, FE-4 (FE-4는 G-1 뒤). 파일 겹침 없음.
- 2단계: FE-2, QA-1, QA-2. FE-2는 `src/features/meal/constants/`만, QA-1·2는 `unit/meal/`의 새 파일만 쓴다.
- 3단계: QA-3, FE-3, DOC-1. QA-3은 `unit/meal/` 기존 두 파일, FE-3은 `src/features/meal/roulette/`, DOC-1은 `COMPLIANCE.md`다.
- 순서가 필요한 것: FE-1 → FE-2 → FE-3, FE-3 → QA-4 → QA-5, FE-2 → QA-3 (같은 흐름), G-1 → FE-4, DOC-1.
- 같은 agent를 두 번 동시에 띄울 때는 파일이 겹치지 않을 때만 한다.

## 충돌 위험

1. 궁합 미커밋 (G-1): `privacy/page.tsx`, `terms/page.tsx`, `COMPLIANCE.md`가 궁합 변경과 섞일 수 있다. 기동 스냅샷에서는 깨끗하다. 시작 전에 다시 확인한다.
2. 시행일 중복 편집: 두 방침·약관의 `EFFECTIVE_DATE`는 FE-4 한 담당만 고친다. PM은 FE-4가 끝난 뒤에 값을 맞춘다.
3. `meal-notice.constant.ts`: FE-2만 수정한다. FE-3이 import하므로 FE-2 전에 FE-3을 시작하지 않는다.
4. `meal.type.ts`, `meal-map-link.util.ts`: FE-1만 수정한다.
5. `map-links.component.tsx`: FE-1 뒤부터 FE-3 전까지 typecheck가 `buildMealMapLinks(menu)` 호출에서 실패한다. 이 구간에서 typecheck를 게이트로 쓰지 않는다.
6. `root.component.tsx`, `result.component.tsx`, `map-links.component.tsx`: FE-3 한 담당이 순서대로 고친다.
7. `unit/meal/meal-copy.test.ts`, `meal-notice.test.ts`: FE-2로 기대값이 바뀌면 실패 상태가 된다. QA-3이 바로 고친다. frontend-dev는 `unit/`을 못 쓴다(guard-files).
8. `COMPLIANCE.md`: 루트 파일이라 agent 범위가 없다. PM이 직접 고친다.
9. `docs/menu-meals/plan.md`, `design.md`: PM만 고친다. frontend-dev 범위에 `docs/`가 있어도 맡기지 않는다.
10. `docs/meal-location/status.md`: 미커밋 변경이 있다. PM만 고친다.
11. `e2e/meal.spec.ts`: 수정하지 않는다. 새 검사는 `e2e/meal-location.spec.ts`에만 쓴다.
12. 줄 번호 드리프트: design의 줄 번호는 궁합 커밋 이후 달라졌을 수 있다. 문장으로 찾는다.
13. 디자인 가드: `src/features/meal/roulette/components/*.tsx`를 고치면 `design-guard`가 검사한다. 토큰 외 색, `dark:`, CSS 애니메이션의 `motion-reduce:` 누락을 본다. 이번 변경에는 CSS 애니메이션이 없다.
