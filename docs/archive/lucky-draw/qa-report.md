# lucky-draw QA 보고서

## Q-1 단위 테스트 (유틸)

대상: `src/features/lucky-draw/utils/` (random, ladder, input)
실행: `pnpm vitest run unit/lucky-draw`
결과: 3개 파일, 57개 테스트 모두 통과 (약 5초). 분포 검사는 재실행 규칙(벗어난 칸이 두 번 연속 같을 때만 실패)을 적용했다.

| 파일 | 대상 AC | 결과 |
|---|---|---|
| `unit/lucky-draw/lucky-draw-random.test.ts` | AC-25, AC-27, AC-28 | 통과. 경계값 표(n=2, 3, 6, 10), 잘못된 n·원천 값 RangeError, 1,000번 거절 Error, Math.random 0회, crypto 호출, Fisher-Yates(Sattolo 아님), n=3 순열 분포 |
| `unit/lucky-draw/lucky-draw-ladder.test.ts` | AC-11, AC-12, AC-13 | 통과. n=2~10 각 1,000개 유효성, 배정 순열, trace 일치, 결과 칸 무작위, n=2/4/6/10 각 10만 회 분포 |
| `unit/lucky-draw/lucky-draw-input.test.ts` | AC-9, AC-16, AC-22 (해석 부분) | 통과. 공백·빈 줄·CRLF, 15자(이모지), 10/28/30개 상한과 앞의 N개만, 같은 이름 다른 id, 차단 사유 4가지 |

소스 버그: 발견하지 못함. 실패한 항목 없음.

## Q-2 단위 테스트 (문구, SEO, 돌림판)

실행: `pnpm vitest run unit/lucky-draw unit/shared unit/meal`
결과: 12개 파일 모두 통과(마지막 실행 전 "돈가스" 정규식 오류 1건을 테스트 쪽에서 고침, 앱 문제 아님).

| 파일 | 대상 | 결과 |
|---|---|---|
| `unit/lucky-draw/lucky-draw-copy.test.ts` | 금지어 26개, 단어 단위 "돈"(돈까스·돈가스 허용), 보장/보상은 예외 문장 안에서만(S-4 A), 메타 설명 4개가 예외 문장 목록과 정확히 일치, 고지 문구. 검사 범위: seo, faq, guide, notice 전 문자열 | 통과 |
| `unit/lucky-draw/lucky-draw-seo.test.ts` | 주소·제목 유일성, FAQ 3개 이상, `getLuckyDrawJsonLd` (BreadcrumbList 단계·위치, FAQPage가 화면 상수와 동일) | 통과 |
| `unit/shared/roulette.test.ts` | `isResultHidden` 렌더, AC-19 허용 토큰 `fill-menu-lucky/20 stroke-menu-lucky` (바늘, 허용 목록 밖 menu 색 없음). 기존 케이스 유지 | 통과 |

한계: `isResultHidden`의 결과 숨김 효과는 회전 종료 뒤 상태라 SSR 단위 테스트로 못 본다. e2e(Q-3)에서 확인해야 한다.
소스 버그: 발견하지 못함.

## Q-3 E2E

파일: `e2e/lucky-draw.spec.ts`(29개), `e2e/helpers/lucky-draw.util.ts`
실행: `pnpm exec playwright test e2e/lucky-draw.spec.ts --project=desktop` 29개 통과. `--project=mobile` 1개 통과(모바일은 `@smoke` 태그만 돈다. 설정 때문). 모바일 폭은 320px 뷰포트 테스트 3개(AC-46)로 데스크톱 프로젝트에서 확인했다.

| AC | 결과 |
|---|---|
| 1, 2, 8, 38, 39 | 통과 (허브, 세 도구 h1 하나, title, description, canonical, 상시·결과 고지. 색인 여부는 'SEO' 테스트가 담당: 준비 중 동안 noindex)

> 메모: plan.md의 AC-2, 8이 색인을 요구하면 "출시 뒤(`comingSoon` 제거 후)" 조건으로 읽는다. 출시 전에는 `getLuckyDrawRobots()`로 네 페이지가 noindex다(design.md 45행). |
| 7 | 통과 (준비 중이라 sitemap에 /lucky-draw 없음) |
| 9, 10, 29 | 통과 (사다리 차단 3가지 안내, 시작 전 결과·그림 DOM 없음) |
| 14, 15, 18, 45 | 통과 (이름별 결과가 전체 목록과 같고 중복 없음, 경로 중 잠금, 동작 줄이기) |
| 16, 17, 18, 44 | 통과 (돌림판 상한 28, 회전 800ms 이상, 잠금, 알림 한 번) |
| 20, 21 | 통과 (빼기, 한 개 남으면 막힘, 처음부터, 꺼짐이면 유지) |
| 22~24, 26 | 통과 (제비뽑기 상한 30, 섞기 전 결과 없음, 항목 한 번씩, 다시 섞기, 입력 변경 시 결과 삭제) |
| 30, 31, 32 | 통과 (공개 방식 옵션 수, 가리기, 한 명씩 열기, 토큰이 DOM·aria-label·data-*에 없음) |
| 31 (isResultHidden) | 통과. 가리기에서 회전 뒤 `svg text`가 칸 수와 같아 가운데 글자가 없고, 굵은 테두리 강조 path가 없다. 결과 보기 뒤 가운데 글자와 강조 칸이 생긴다 |
| 33, 34, 35, 37 | 통과 (저장소·쿠키·URL·요청 주소/본문에 입력 없음, 위치 API 호출 0, 새로고침 시 비어 있음) |
| 36, 47 | 통과 (쿠키 거절, 광고 요청 차단 상태에서 세 도구 동작, main 안에 ins·iframe 없음) |
| 43 | 통과 (키보드로 입력, 라디오, 섞기, 결과 보기, 시작, 이름 고르기, 돌리기) |
| 46 | 통과 (320px 가로 스크롤 없음, 10명·28개·30개, 긴 이름 전체 읽기) |

테스트 쪽 수정: 사다리 `dl`이 FAQ에도 있어 결과 목록 범위를 "전체 결과" 섹션으로 좁혔다. 앱 버그 아님.

참고: `pnpm e2e -- <파일>`은 파일 필터가 안 먹고 전체가 돈다. `pnpm exec playwright test <파일>`을 쓴다.

## 2026-11-23 개정 재검증 (제비뽑기 카드 방식, 돌림판 결과 가리기 B안)

변경 사유: 결과 가리기가 칸 글자까지 숨기고(칸 면 단일 색, 강조·가운데 글자 없음), 제비뽑기가 카드 한 장 뽑기로 바뀌었다.

테스트 변경
- 단위 신규 `unit/lucky-draw/lucky-draw-lots.test.ts`: 덱 공정성(10만 회, 6가지 대응 1/6 ± 4σ), 같은 이름 중복, open 범위 오류, 항목 수 범위 오류, `JSON.stringify(deck)` = `{"size":3}`, 리듀서(runId 무시, 중복 열기 무시, OPEN_REST, SET_TEXT·SHUFFLE 초기화, 연 항목 외 글자가 상태에 없음).
- 단위 `unit/shared/roulette.test.ts`: "숨김 무관 같은 마크업" 케이스를 교체. 생략과 false 동일, 숨김 시 `<text>` 0개, 칸 면 단일 색, 칸 수와 바늘 동일.
- 단위 `*seo*`, `*copy*`: 키워드 이동, FAQ 개수(돌림판 4, 제비뽑기 4), 허브 첫 답, 역할 비교 문구, 메뉴 설명.
- e2e: 제비뽑기를 카드 방식으로 다시 작성(AC-22, 23, 24, 26, 26a, 26b, 26c, 43, 45, 46). 돌림판 AC-31, AC-31a 추가. 허브 비교 문구, 서버 HTML FAQ, 약관 AC-48 추가. 개인정보 AC-35에 카드 열기를 포함. 도우미에 카드·돌림판 SVG 함수 추가.
- 테스트 쪽 보정: 비활성(aria-disabled) 카드는 Playwright 기본 클릭이 대기하므로 재클릭 검사에 `force: true`를 썼다. 앱 문제 아님.

결과
- `pnpm vitest run unit/lucky-draw unit/shared unit/meal`: 13 파일, 370 통과.
- `pnpm exec playwright test e2e/lucky-draw.spec.ts`: 데스크톱 34건 통과(모바일 프로젝트는 smoke만 실행).
- `e2e/meal.spec.ts` 데스크톱: 10건 통과, 1건 실패. 실행마다 다른 테스트가 실패하는 무작위성 문제(메뉴 이름이 저녁 일반 목록과 야식 목록에 모두 있을 때 `lateNames`에 포함 검사, 또는 끼니 변경 뒤 목록 검사). 이번 변경과 무관, 점심 메뉴 데이터 변경 쪽 의심. 담당 frontend-dev.
- `pnpm typecheck`, `pnpm biome check .`: 통과.

코드 리뷰 반영 후 보강
- 추가: e2e 3건(4개 페이지 robots noindex, 돌림판 처음부터 시 결과 상자 사라짐, 제비뽑기 글 수정 뒤 첫 섞기에 닫힘 안내 없음). 리듀서는 export되지 않아 단위 테스트 대신 e2e로 대체. `getLuckyDrawRobots`는 코드에 없어 단위 테스트를 쓰지 못함.
- robots 검사는 출시 전 noindex 기대였고, 출시로 "noindex 아님"으로 뒤집혔다(아래 출시 후 확인).

## 출시 후 확인 (2026-11-23)

- 테스트 정리: lotto.spec.ts·meal.spec.ts의 "준비 중" 검사를 헤더·홈 전체 0개로 복원. lucky-draw.spec.ts의 robots 검사를 "noindex 아님"으로 변경, AC-7에 사이트맵 네 주소(`/lucky-draw`, `/ladder`, `/roulette`, `/lots`)와 홈·헤더 노출·배지 없음 검사 추가. 위 "앱 쪽 회귀" 절과 옛 robots 실패 기록은 해소됐다.
- 결과: `pnpm vitest run` 30 파일 698 통과, `pnpm typecheck`·`pnpm biome check .` 통과. `playwright --project=desktop` 93건 중 91 통과, 2 실패(`meal.spec.ts:66` AC-7·10·12·13, `meal.spec.ts:160` AC-25). 둘 다 앞서 적은 meal 무작위 실패와 같은 종류이며 운빨 뽑기와 무관. 담당 frontend-dev.

## 테스트 정리 (QA 규칙 개정)

- 사유: 같은 화면을 반복해 여는 중복을 줄이려 흐름 단위로 합침. e2e 36개(936줄)에서 21개(약 770줄)로, 공통 검사(메타, h1, 고지, 320px 가로 스크롤)는 한 번씩만 두었다. 검증 항목은 줄이지 않았다.
- 단위: `lucky-draw-seo.test.ts`의 상수 모양 검사(주소, 제목, FAQ 개수)와 `lucky-draw-copy.test.ts`의 메타·예외 문장 모양 검사를 뺐다. 난수·사다리·덱 테스트는 그대로다.
- 결과: `pnpm vitest run unit/lucky-draw` 287 통과, `playwright e2e/lucky-draw.spec.ts --project=desktop` 21 통과(1회). typecheck, biome 결과는 아래 확인.
