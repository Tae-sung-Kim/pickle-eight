# 홈 재구성 개발 티켓

입력: `docs/home-reposition/design.md` (4절 프론트 구조, 5.3 테스트 기준, 확정 답변 절), `docs/home-reposition/plan.md` (AC-1~AC-8, 조건부 AC, 확정 답변 절)
`docs/home-reposition/ui-ux-design.md`는 없다. ui-ux 단계는 사용자 승인으로 생략했다. 그래서 프론트 티켓의 디자인 명세는 design.md 4.4(컴포넌트 트리)와 기존 마크업 유지 규칙을 기준으로 한다.
규칙 문서: `docs/conventions/code-style.md` (폴더 구조, 네이밍, 상수 이름 규칙, `type` 키워드만 사용, `any` 금지, named export)

## 티켓

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| T-1 | db-dev | 없음 (design.md "DB 스키마: 없음") | - | - | - | 해당 없음 | 없음 |
| T-2 | backend | 없음 (design.md "API 계약: 없음". 배너가 쓰는 기존 `/api/lotto/draws`는 그대로, 홈에서만 호출이 사라진다) | - | - | - | 해당 없음 | 없음 |
| FE-1 | frontend | 신규 상수 파일 작성. `HOME_TITLE`(`` `${SITE_NAME} - 오늘의 운세·메뉴·뽑기 도구 모음` ``, `SITE_NAME`은 `@/lib/seo`에서 import), `HOME_DESCRIPTION`, `HOME_HERO_DESCRIPTION`, `HOME_GROUP_DESCRIPTIONS: Readonly<Record<MENU_GROUP_NAME_ENUM, string>>`. 값은 design.md 4.2 초안을 확정 답변(Q-1)대로 쓴다. `MENU_GROUP_NAME_ENUM`은 `@/constants/menu.constant`에서 import | 없음 | `src/constants/home.constant.ts` (신규), `src/lib/seo.ts` (읽기), `src/constants/menu.constant.ts` (enum 읽기만) | design.md 4.2, 4.3 (ui-ux 명세 없음) | 상수 이름 4개와 형태가 design.md 4.2와 같다. Record 키가 enum 6개 전부다(하나 빠지면 typecheck 실패). 값이 design.md 4.2 문구와 글자 단위로 같다. `features/` import 없음. `any`·`interface` 없음. 4.3 규칙 위반 문구 없음 | 대기 |
| FE-2 | frontend | `MENU_LIST` 그룹 객체 블록을 design.md 4.5 순서로 재배치: fortune, meal, tarot, lucky-draw, dream, lotto. 그룹 객체 내용(group, label, href, items의 순서·라벨·설명·아이콘·색)은 한 글자도 바꾸지 않는다. `MENU_GROUP_NAME_ENUM` 선언 순서, `MenuSectionKeyType`, 주석 처리된 `board` 블록은 그대로 둔다. 재배치 전 각 그룹 블록 텍스트를 보관해 두고 전후를 비교한다 | 없음 | `src/constants/menu.constant.ts` | design.md 4.5 (표의 순서·하위 href 순서가 기준) | 그룹 6개 객체 텍스트가 이동 전과 같다(블록 단위 비교). 그룹 순서와 하위 href 순서가 4.5 표와 일치한다. 기존 단위 테스트(fortune, meal, tarot, lucky-draw)가 통과한다. 허브 페이지 목록 순서는 바뀌지 않는다(하위 순서 유지 확인) | 대기 |
| FE-3 | frontend | `src/app/page.tsx` 수정. (1) `LatestResultBannerComponent` import와 렌더링(감싼 `div` 포함) 삭제. 컴포넌트 파일은 지우지 않는다(`src/app/lotto/layout.tsx`가 계속 쓴다). (2) 파일 안 `TITLE`, `DESCRIPTION`, `HERO_DESCRIPTION` 상수 삭제 후 `home.constant.ts`에서 import. (3) `metadata`와 `baseMeta`의 title·description을 `HOME_TITLE`·`HOME_DESCRIPTION`으로 바꾸고 OG·twitter 이미지 구조는 그대로 둔다. (4) 히어로 p는 `HOME_HERO_DESCRIPTION`. h1은 `SITE_NAME` 그대로. (5) 그룹 설명을 `HOME_GROUP_DESCRIPTIONS[g.group]`로 조회하고, 값이 없으면 기존처럼 하위 항목 라벨을 ", "로 잇는다(`any` 금지, enum 키 캐스팅 방식은 프론트가 정하되 타입이 안전해야 한다). (6) `JsonLdComponent` WebSite, ItemList 구조 유지. (7) `comingSoon` 배지, 링크 대상(`g.href ?? g.items[0].href`), 라벨 줄과 설명 줄 마크업 구조 유지. (8) `'use client'`를 붙이지 않는다. 서버 컴포넌트 유지 | FE-1 | `src/app/page.tsx`, `src/constants/home.constant.ts` (import) | design.md 4.4 (컴포넌트 트리), 4.1, SEO 절 (ui-ux 명세 없음) | `features/lotto` import가 0건이다. `LatestResultBannerComponent` 참조가 page.tsx에 0건이다. h1은 `SITE_NAME` 하나. 히어로 문구가 `HOME_HERO_DESCRIPTION`과 같다. JS를 끈 상태에서도 h1과 서비스 목록(설명 포함)이 서버 HTML에 있다(curl 또는 소스 확인). 링크 라벨 텍스트(`뭐 먹지`, `꿈 해몽`, `운빨 뽑기`, `로또`, `운세`)가 바뀌지 않는다. typecheck 통과 | 대기 |
| FE-4 | frontend | `src/app/layout.tsx` 83행 루트 `category` 값만 `'엔터테인먼트, 도구, 로또'`에서 `'엔터테인먼트, 도구'`로 바꾼다 (D-3 안 1, 상속 그대로) | 없음 | `src/app/layout.tsx` (공용, 한 줄만) | design.md SEO 절 (ui-ux 명세 없음) | `category` 한 줄만 바뀐다. title·description·OG·twitter·keywords·인증 메타 태그·광고 슬롯 줄은 diff가 없다. `src/app/lotto/**`는 건드리지 않는다 | 대기 |
| FE-5 | frontend | 사이트 푸터 문구 교체 (확정 답변 Q-2). `footer.component.tsx` 28~32행의 "운을 데이터로, 재미로." 와 "로또 번호 생성과 분석을 한곳에서 즐겨보세요."를 도구 모음 톤 문구로 바꾼다. 로또 단어를 넣지 않고 금지 표현을 쓰지 않는다. 문구는 PM이 확정한 문장을 쓴다(확정 문장이 없으면 시작하지 않는다). 구조·클래스·링크는 그대로 둔다 | 문구 확정 (PM, 아래 "확인 필요 항목" 1번) | `src/components/layout/footer.component.tsx` | 없음 (design.md에 푸터 명세와 파일 목록이 없다. 확정 답변 Q-2 근거) | 확정 문구로 바뀌었다. 로또 관련 단어(로또, 번호 생성, 당첨, 분석)가 푸터에 없다. 금지 표현(보장, 적중, 확률, 반드시, 틀림없, 100%, 1등, 예측)이 없다. 푸터 링크 개수와 주소가 같다. 모든 페이지에 나오는 공용 파일이라 `/lotto/*` 본문 푸터 문구도 바뀐다(메타데이터는 아님, AC-7 대상 아님) | 대기 |
| FE-6 | frontend | `pc-menu.component.tsx` 31행 `alignRight` 기준을 `index >= MENU_LIST.length - 3`으로 바꾼다 (D-2 안 2, 확정). 한 줄만 바꾼다 | FE-2 (최종 순서 확인용. 파일 충돌은 없음) | `src/components/layout/pc-menu.component.tsx` | design.md 확정 답변 D-2 (ui-ux 명세 없음) | 한 줄만 바뀐다. 1024px과 1280px 뷰포트에서 운빨 뽑기 드롭다운과 로또 드롭다운이 화면 안에 열린다(수동 확인, 결과를 qa-report에 적는다). 꿈 해몽은 드롭다운이 없는 단일 링크라 영향이 없다 | 대기 |
| QA-1 | qa | 단위 테스트 신규 작성 `unit/home/home-copy.test.ts` (vitest). AC-4 순서 검사(그룹 순서, 하위 href 순서, 4개 파일이 `MENU_LIST`를 쓰고 `sort(`, `toSorted(`, `reverse(`가 없음, 사이트맵 URL 중복 없음). AC-5 금지 표현 검사(home.constant의 모든 값). AC-1 보조(`HOME_TITLE`, `HOME_HERO_DESCRIPTION`에 `로또` 없음). 조건부 AC(그룹 설명이 enum 전부에 있고, LOTTO 설명에 `번호 만들기`, `당첨 결과`, `채점`이 모두 있음). 4.3 규칙 2·4·5·6(다른 그룹 라벨 없음, 운세 설명에 `사주` 없음, 꿈 해몽 설명에 `로또`·`당첨`·`번호` 없음, 뭐 먹지 설명에 `추천` 없음). 금지 표현 목록은 테스트 파일 안 상수로 둔다 | FE-1, FE-2, FE-3, FE-6 | `unit/home/home-copy.test.ts` (신규), `unit/helpers/copy-check.util.ts` (`findForbidden` 재사용), `unit/helpers/source-scan.util.ts` (`readSourceFiles` 재사용), `src/constants/home.constant.ts`, `src/constants/menu.constant.ts`, `src/app/sitemap.ts` (읽기) | design.md 5.3, 4.3 (ui-ux 명세 없음) | `npm run test` 중 이 파일이 전부 통과한다(실제 실행 명령은 PM이 정한 방식 그대로). 사이트맵 검사가 `SITEMAP_SKIP_FETCH=1` 동적 import로 안 되면 소스 검사로 대신하고 qa-report에 이유를 적는다. 기존 단위 테스트 파일은 고치지 않는다. AC-4 [단위], AC-5 [단위] 충족 | 대기 |
| QA-2 | qa | E2E 신규 작성 `e2e/home.spec.ts`. AC-1, AC-2, AC-3만 `[E2E]` 흐름으로 만든다. 모바일에서 돌릴 케이스는 `@smoke` 태그를 붙인다(CLAUDE.md 규칙: 모바일은 `@smoke`만). AC-1: h1 한 개, h1과 히어로에 `로또` 없음, 서비스 목록의 그룹 라벨 요소(링크 안 첫 줄)가 그룹마다 한 번씩, `로또`는 목록 한 칸, `준비 중` 없음. AC-2: `운세` 라벨을 누르면 `/fortune`, `로또`를 누르면 `/lotto`(데스크톱·모바일 각각). AC-3: 홈에 `/\d+회 당첨 번호/` h2가 없고, 같은 흐름에서 `/lotto`를 AgeGate 통과(`passLottoAgeGate`) 뒤 배너 제목이 보인다. 데이터 전제는 `request.get('/api/lotto/draws?latest=1')` 성공으로 확인한다(`e2e/lotto.spec.ts` 37행 방식 참고) | FE-3, FE-5, FE-6 | `e2e/home.spec.ts` (신규), `e2e/helpers/` (읽기: `passLottoAgeGate` 위치 확인), `e2e/lotto.spec.ts` 37행 (읽기만) | design.md 5.3 주의사항 (ui-ux 명세 없음) | 해당 spec만 데스크톱 프로젝트로 실행해 통과한다. 모바일 `@smoke` 케이스가 통과한다. 링크 이름 검색은 접근 이름 전체(라벨 + 설명)를 쓰면 실패하므로 라벨 요소 기준이나 `^라벨` 정규식으로 찾는다. 기존 e2e 파일은 고치지 않는다 | 대기 |
| QA-3 | qa | [정적] AC-6, AC-7 확인. `src/app/layout.tsx`의 `category`에 `로또`가 없다. `git diff origin/main -- src/app/lotto src/features/lotto src/lib/seo.ts src/app/sitemap.ts`가 비어 있다. 사이트맵은 `/`, `/lotto` 등록 구조가 같다. 코드 확인은 QA가 하고, 최종 확인은 PM 검증 단계에서 한 번 더 한다 | FE-4, FE-2 | `src/app/layout.tsx`, `src/app/lotto/**`, `src/features/lotto/**`, `src/lib/seo.ts`, `src/app/sitemap.ts` (읽기) | design.md 5.2 보호 대상 (ui-ux 명세 없음) | 위 diff 명령 결과가 빈 값이다. `category` 값이 `'엔터테인먼트, 도구'`다. 결과를 qa-report에 적는다 | 대기 |
| QA-4 | qa | 회귀 AC-8 (마지막에 한 번만). 기존 spec 4개를 데스크톱으로 실행한다: `e2e/lotto.spec.ts`, `e2e/meal.spec.ts`, `e2e/dream.spec.ts`, `e2e/lucky-draw.spec.ts`. 홈 진입 부분(`뭐 먹지`, `꿈 해몽`, `운빨 뽑기`, 준비 중 0건)이 깨지지 않는지 본다. 실패하면 원인을 qa-report에 적고 해당 dev에게 되돌린다 | QA-2, QA-1, QA-3, FE-5 | `e2e/lotto.spec.ts`, `e2e/meal.spec.ts`, `e2e/dream.spec.ts`, `e2e/lucky-draw.spec.ts` (실행만, 수정 금지) | 없음 | 4개 spec 실행 결과가 통과이거나, 실패 원인이 이 기능과 무관한 것으로 확인된다. 기존 e2e 수정은 없다(필요하면 PM에게 먼저 묻는다) | 대기 |

## AC 매핑

| AC | 태그 | 처리 | 담당 티켓 |
|---|---|---|---|
| AC-1 | [E2E] | `e2e/home.spec.ts` (데스크톱 + 모바일 `@smoke`) | QA-2 (화면 구조는 FE-3) |
| AC-2 | [E2E] | `e2e/home.spec.ts` (데스크톱 + 모바일 `@smoke`) | QA-2 |
| AC-3 | [E2E] | `e2e/home.spec.ts` (안 A: 배너가 `/lotto`에서 AgeGate 뒤에 보임) | QA-2 (배너 삭제는 FE-3) |
| AC-4 | [단위] | `unit/home/home-copy.test.ts`, 사이트맵 검사 실패 시 소스 검사 대체 | FE-2, QA-1 |
| AC-5 | [단위] | `unit/home/home-copy.test.ts` (금지 표현) | FE-1, QA-1 |
| AC-6 | [정적] | 코드 확인 | FE-4, QA-3 |
| AC-7 | [정적] | `git diff` 빈 값 확인 | QA-3, PM 검증 |
| AC-8 | [E2E] 회귀 | 기존 spec 4개를 마지막에 한 번 | QA-4 |
| 조건부 (그룹 설명) | [단위] | `unit/home/home-copy.test.ts` 안 한 항목 | QA-1 |
| 조건부 (모바일 접힘) | 없음 | 접힘 미적용 (확정 답변 14번) | 없음 |

## 실행 순서

0. 선행 확인 (PM): FE-5 푸터 문구 확정. 이 값이 없으면 FE-5만 보류하고 나머지는 진행한다.
1. 병렬 가능 (파일이 서로 겹치지 않음): FE-1, FE-2, FE-4, FE-6. FE-5는 0번 문구가 정해진 뒤 같이 실행한다.
   - 단일 frontend-dev가 맡을 경우 권장 순서: FE-1 → FE-2 → FE-4 → FE-6 → FE-5 → FE-3. 같은 사람이 맡으면 병렬 실행하지 않는다.
2. FE-1 완료 후: FE-3 (`page.tsx`가 `home.constant.ts`를 import하므로 FE-1이 먼저다).
3. FE-2, FE-3, FE-6 완료 후: QA-1 (순서 검사가 최종 `MENU_LIST`와 4개 소스 파일을 읽는다).
4. FE-3, FE-5, FE-6 완료 후: QA-2 (홈 spec 작성과 실행). QA-1과 QA-2는 파일이 달라 병렬 가능하다.
5. QA-3 (정적 확인). FE-4 완료 후 어느 때나 가능하다.
6. 마지막: QA-4 회귀 한 번 (QA-1, QA-2, QA-3이 통과한 뒤).
7. PM 검증 단계: `pnpm typecheck`와 `pnpm lint`를 각각 한 번 실행한다. AC-7 diff 명령을 다시 돌린다. 메뉴 순서가 헤더·모바일·사이트맵·홈에서 같은지 본다. 실패하면 해당 티켓을 되돌린다.

## 동시 실행 가능

- FE-1, FE-2, FE-4, FE-6, FE-5: 파일이 서로 다르다. 단, 같은 frontend-dev 한 명이 맡으면 순서대로 한다(실행 순서 1번).
- QA-1과 QA-2: 신규 파일이 서로 다르다. 둘 다 FE 완료 뒤에 돈다.
- T-1, T-2: 없음.

## 충돌 위험

- `src/constants/menu.constant.ts` (FE-2): 그룹 블록 이동이라 diff가 크게 보인다. 다른 메뉴 추가·라벨 수정 작업과 동시에 하지 않는다. 블록 텍스트 전후 비교로 내용이 같은지 확인한다.
- `src/components/layout/pc-menu.component.tsx` (FE-6): 헤더를 고치는 다른 작업과 겹치지 않게 한다. 한 줄만 바꾼다.
- `src/app/layout.tsx` (FE-4): 사이트 전체 공용 파일. `category` 한 줄만 바꾼다. 인증 메타 태그와 광고 슬롯 줄을 건드리지 않는다.
- `src/components/layout/footer.component.tsx` (FE-5): 모든 페이지 공용 파일. 다른 작업과 동시에 고치지 않는다. 로또 페이지 푸터 문구도 함께 바뀐다(메타데이터 보호와 별개).
- `src/app/page.tsx` (FE-3): 홈 전용이지만 FE-1 import 의존이 있다. FE-1 전에 시작하지 않는다.
- `src/constants/home.constant.ts` (FE-1): 신규. FE-3과 QA-1이 읽는다. 이름을 바꾸면 두 곳을 같이 고친다.
- `src/app/lotto/**`, `src/features/lotto/**`, `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/types/menu.type.ts`, 기존 `e2e/*.spec.ts`: 보호 대상. frontend와 qa 모두 건드리지 않는다. 배너 컴포넌트 파일도 지우지 않는다.
- `src/components/layout/mobile-menu.component.tsx`: 코드 변경 없음. `MENU_LIST` 순서를 그대로 따른다. 모바일 로또 6개 항목이 맨 아래에 펼쳐지는 것을 QA-2 모바일 케이스에서 확인한다.
- `unit/home/`, `e2e/home.spec.ts`: 신규라 충돌 없음.
- 홈 링크 접근 이름: 링크 안에 설명 문구가 들어가 있어 `exact` 이름 검색이 홈 링크에는 맞지 않는다. 기존 `meal.spec.ts` 280행은 헤더 링크가 `.first()`로 먼저 잡혀 통과한다. 헤더 링크 순서가 바뀌지 않으면 영향이 없다. QA-4에서 확인한다.

## 확인 필요 항목 (PM)

1. FE-5 푸터 문구 확정 문장. 확정 답변 Q-2는 "도구 모음 톤으로 바꾼다"만 정했고 문장은 없다. 문장을 정해 주기 전에는 FE-5를 시작하지 않는다.
2. FE-5 범위 확인. design.md의 폴더 구조와 4절에는 푸터가 없다. 확정 답변 Q-2에 따라 티켓에 넣었다. design.md에 푸터 항목을 추가할지 architect에게 보완을 요청할지 정해 주세요. 푸터 문구 검사를 AC-5에 넣을지도 정해 주세요(현재는 수동 확인).
3. 로또 페이지 푸터 문구 변경: `/lotto/*` 하단 푸터 문구도 바뀐다. 메타데이터와 AC-7에는 영향이 없지만, 로또 페이지 본문 변경이므로 허용되는지 확인해 주세요.
4. 모바일 케이스 실행: AC-1, AC-2는 "데스크톱과 모바일"이라고 쓰였다. CLAUDE.md의 모바일 `@smoke`만 규칙과 맞추려고 해당 케이스에 `@smoke`를 붙이는 방식으로 정했다. 다르게 하려면 알려 주세요.
