# lucky-draw 개발 티켓

입력: `docs/lucky-draw/design.md`(승인 2026-11-23, S-1~S-6 권장안 A), `docs/lucky-draw/ui-ux-design.md`(승인 2026-11-23, U1 섞기 연출 없음, U2 A, U3 `#4b4690`), `docs/lucky-draw/plan.md`(AC 기준, AC-40은 S-4 A 반영본), `docs/conventions/code-style.md`, `docs/roulette-common/plan.md`(돌림판 칸 색 허용 목록), `docs/menu-meals/dev-tasks.md`(형식 참고)
작성: dev-lead, 2026-11-23
범위: 서버, API, DB, 저장소가 없어 프론트 티켓과 PM·QA 티켓만 있다. 이 문서는 코드와 규칙 문서를 고치지 않는다. 규칙 문서(`docs/conventions/`)는 agent가 고칠 수 없어 PM 티켓으로 뺐다.

## 먼저 볼 사항

1. 경로 정정: 사용자 메모의 `src/styles/globals.css`는 실제 파일이 `src/app/globals.css`다. `src/styles/`에는 `index.css`, `tokens.css`, `utilities.css`만 있고 메뉴 색 토큰이 없다. F-2 대상은 `src/app/globals.css`다(`--menu-dream` 79행, `@theme` 안 `--color-menu-dream` 109행 아래에 추가).
2. 사다리 위 칸: design 3.3은 "위 이름 칸"이라고 적었지만 ui-ux 191~240행이 위 칸을 번호로 바꿨다. 화면 배치는 ui-ux가 정하는 항목이라 ui-ux를 따른다. 데이터는 바뀌지 않는다(입력 순서 번호). F-5에 명시했다.
3. 분포 검증 칸 수: 사다리 n=2, 4, 6, 10이 각 `n×n`칸이라 156칸, 여기에 제비뽑기 순열 검사 6칸을 더해 162칸이다. 칸 하나가 4σ 밖으로 나올 확률은 약 6×10⁻⁵이라 한 번 실행에서 우연히 실패할 확률은 약 1%다. 그래서 Q-1은 실패한 칸이 나오면 같은 테스트를 새 난수로 한 번 더 돌리고, 같은 칸이 두 번 연속 벗어날 때만 실패로 본다. 허용 오차(plan 확정 6번)는 바꾸지 않는다.
4. 아이콘: lucide-react 설치본의 `Columns3`, `LoaderPinwheel`, `Shuffle`, `FerrisWheel` 존재는 이 문서 작성 중 확인하지 못했다. F-2의 `pnpm typecheck`에서 확인한다.
5. 약관 시행일: `EFFECTIVE_DATE`는 배포일이어야 한다. 배포일은 사용자 결정(U-0)이라 F-9는 기존 값 유지로 끝내고, 배포일이 정해지면 한 줄만 고친다.
6. 운세 약관 장 참조: design 7.3은 COMPLIANCE.md 운세 항목의 "chapter 13"을 "chapter 14"로 바꾸라고 했다. 현재 약관에서 운세 장은 7장이다. PM-2가 COMPLIANCE.md의 실제 참조 번호를 보고 맞춘다.
7. 강조색 허용 목록: AC-19의 허용 토큰 확인은 `unit/shared/roulette.test.ts`와 `unit/lucky-draw/lucky-draw-copy.test.ts`의 목록에 `fill-menu-lucky/20 stroke-menu-lucky`를 넣는 것으로 한다. `docs/roulette-common/plan.md`의 허용 목록은 칸 면용이라 바꾸지 않는다(완료된 기획서).
8. 사용자 결정 반영: 제비뽑기 섞는 연출 없음(U1), 돌림판 칸은 종이색 번갈이이고 강조만 `menu-lucky`(U2 A), `menu-lucky`는 `#4b4690`(U3 A). 이 결정으로 design과 ui-ux 사이에 어긋난 곳은 없다.

## 티켓

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| DB·BE | db-dev, backend-dev | 없음. 서버, API, DB, 테이블, 마이그레이션, 저장소를 쓰지 않는다 | - | - | design "API 계약", "DB 스키마"(515~525행) | 없음 | 없음 |
| PM-1 | PM | `docs/conventions/design-system.md` 메뉴 라벨 색 표에 `운빨 뽑기 / menu-lucky / #4b4690 / 가지` 한 줄 추가. 토큰 이름이 그룹 키(`lucky-draw`)와 달라 `--menu-<key>` 규칙과 어긋나 보이는 점을 표 옆에 메모로 남기고 사용자에게 알린다 | 없음(사용자 U3 승인 완료) | `docs/conventions/design-system.md` 29~33행 부근 | ui-ux 510~516행, design 6장 | 표에 한 줄 추가. 규칙 본문은 바꾸지 않는다 | 대기 |
| F-1 | frontend-dev | 기능 기반. 타입 `types/lucky-draw.type.ts`(design 2.1 전부), 상수 `constants/lucky-draw-limit.constant.ts`(2.5), `constants/lucky-draw-route.constant.ts`(주소와 도구 이름), `constants/lucky-draw-theme.constant.ts`(강조 클래스 `fill-menu-lucky/20 stroke-menu-lucky`, 버튼 `bg-menu-lucky`, 글자 `text-menu-lucky`), 순수 함수 `utils/lucky-draw-random.util.ts`(2.2, `Math.random` 호출 금지), `utils/lucky-draw-ladder.util.ts`(2.3), `utils/lucky-draw-input.util.ts`(2.4). 난수 원천 주입 인자를 design 시그니처대로 둔다 | 없음 | `src/features/lucky-draw/types/`, `constants/`(3개), `utils/`(3개) 신규 | design 2.1~2.5, 3.3 공통 규칙. ui-ux 색상 표 30~55행(버튼과 강조 토큰) | 신규 파일 9개. `Math.random` 0건. 2.2 경계값 표(n=2, 3, 6, 10)가 설계 값과 맞는다. 해당 파일 안에서 타입 오류 없음 | 대기 |
| F-2 | frontend-dev | 공용 색과 메뉴 등록. (a) `src/app/globals.css`: `--menu-lucky: #4b4690; /* 가지 */`(79행 뒤), `--color-menu-lucky: var(--menu-lucky);`(109행 뒤). `.dark` 값은 넣지 않는다. (b) `src/types/menu.type.ts`: `MenuSectionKeyType`에 `'lucky-draw'` 추가. (c) `src/constants/theme.constant.ts`: 네 맵(31~62행)에 `'lucky-draw'` 키를 같은 커밋에서 추가. `FerrisWheel`, `text-menu-lucky`, `bg-menu-lucky/10 text-menu-lucky border-menu-lucky/20`, `bg-background`. (d) `src/constants/menu-icon.constant.ts`: `Columns3`, `LoaderPinwheel`, `Shuffle`, `FerrisWheel`을 import와 `MENU_ICONS`에 추가. (e) `src/constants/menu.constant.ts`: enum에 `LUCKY_DRAW = 'lucky-draw'`(3~9행), `MENU_LIST` 맨 끝(꿈 해몽 다음)에 그룹 추가. label `운빨 뽑기`, href `/lucky-draw`, `comingSoon: true`, 항목 3개(사다리 타기, 돌림판, 제비뽑기)와 아이콘 이름, `colorClass` `text-menu-lucky`, description과 example은 design 6장 초안 그대로 | 없음(F-1과 파일이 겹치지 않아 동시 가능) | `src/app/globals.css`, `src/types/menu.type.ts`, `src/constants/theme.constant.ts`, `src/constants/menu-icon.constant.ts`, `src/constants/menu.constant.ts` | ui-ux 색상 30~76행, 아이콘 97~110행. design 2.5 토큰 표(350~357행), 6장(625~680행) | `pnpm typecheck`에서 이 파일들 때문에 생기는 오류 없음(네 맵 모두 키가 있다). 아이콘 4개가 lucide-react에 있다. 그룹 1개, 항목 3개, `comingSoon: true`. 기존 다섯 그룹 값은 바뀌지 않는다. `menu-lucky`와 흰 종이색(`#eef0e6`, `#f7f8f1`)의 대비가 4.5:1 이상임을 도구로 확인하고 수치를 보고한다(어긋나면 ui-ux-designer에게 알린다) | 대기 |
| F-3 | frontend-dev | 공용 돌림판에 선택 prop `isResultHidden?: boolean`(기본 false)을 더한다(S-2 A). true인 동안에는 당첨 칸 강조(면, 테두리)와 병뚜껑 결과 글자를 그리지 않는다(병뚜껑은 빈 상태). 내부 당첨 인덱스 상태는 그대로 두고, false로 바뀌면 그때 강조와 글자가 나온다. `onSpinEnd` 호출 시점은 바꾸지 않는다. prop을 넘기지 않으면 출력이 지금과 같아야 한다. 메뉴 룰렛 호출부는 건드리지 않는다. `aria-hidden` 래퍼는 유지한다 | 없음 | `src/components/common/roulette.component.tsx`(props 타입 17~26행, props 구조분해 130~139행, 렌더 부분) | design 3.4 "결과 가리기와 공용 돌림판"(495~498행), S-2 A(836~838행), roulette-common plan AC-3, AC-10 | prop 생략과 false일 때 `/meal` 룰렛 출력이 전과 같다(회귀는 Q-3에서 한 번). true일 때 강조 클래스와 병뚜껑 글자가 HTML에 없다. false로 바꾸면 나온다(Q-2 단위 테스트). 기존 `accentClassName`, `spinDurationSec`, `spinTurns`, `colorClassName` 동작 변화 없음 | 대기 |
| F-4 | frontend-dev | 공통 부품, 문구 상수, SEO 유틸. 상수: `constants/lucky-draw-seo.constant.ts`(4 페이지 SEO와 빵부스러기 그룹, 키워드), `constants/lucky-draw-faq.constant.ts`(페이지마다 3개, 화면과 JSON-LD가 같은 배열), `constants/lucky-draw-guide.constant.ts`(헤더 설명, 설명 문단, 사용 순서), `constants/lucky-draw-notice.constant.ts`(상시 고지, 결과 하단 고지, 입력 안내, noscript, 알림과 오류 문장), `constants/lucky-draw-copy-rule.constant.ts`(검사 전용, 화면 코드는 import하지 않는다). 유틸: `utils/lucky-draw-seo.util.ts`(`getLuckyDrawJsonLd(pageKey)`가 BreadcrumbList, FAQPage 두 개만 만든다). 공통 부품 `shared/components/`: `lines-input`, `reveal-mode`, `status`(`role="status" aria-atomic="true"`, 화면에서 숨김), `tool-nav`(잠금 props), `disclaimer-notice`, `result-notice`, `noscript-notice`, `faq`, `guide`. `src/lib/seo.ts`는 고치지 않는다(`getOgTag`가 `MENU_LIST`에서 찾으므로 F-2 등록으로 해결) | F-1 | `src/features/lucky-draw/constants/`(5개), `utils/lucky-draw-seo.util.ts`, `shared/components/`(9개) 신규 | design 3.1(361~370행), 5장(598~623행), 2.4 입력 규칙. ui-ux 문구 382~435행, 알림 458~477행, FAQ 488~507행, 사용 순서 479~486행, 접근성 352~376행 | 신규 파일 생성. 화면 문구를 상수로만 두고 공통 부품이 `LUCKY_DRAW_TOOL_PATHS`를 쓴다. `buildMetadata()`를 쓰도록 할 페이지 상수(`LUCKY_DRAW_HUB_SEO` 등 4개)가 있다. `dangerouslySetInnerHTML` 0건. 금지어를 자가 점검해 Q-2에서 통과할 상태로 둔다. 타입 오류 없음 | 대기 |
| F-5 | frontend-dev | 사다리 타기 화면. `ladder/components/root.component.tsx`(`LuckyDrawLadderComponent`, 'use client'), `board.component.tsx`(위 번호 칸 HTML, SVG, 아래 결과 칸 HTML. 좌표는 design 3.3 규칙), `path.component.tsx`(`motion.polyline` pathLength 0 → 1, 0.8초 ease-in-out, 끝에 `TRACE_END` 한 번, `useReducedMotion`이면 즉시 1과 `queueMicrotask`), `name-picker.component.tsx`(이름 버튼 목록, 44px 이상, 확인함 `Check`), `result-list.component.tsx`(전체 결과 `dl`). `ladder/hooks/use-lucky-draw-ladder.hook.ts`(useReducer, design 3.3 상태와 액션). 페이지 `src/app/lucky-draw/ladder/page.tsx`(서버, `LuckyDrawLadderPage`, `buildMetadata()`, JSON-LD 2종, 서버 HTML에 고지, noscript, 설명, FAQ) | F-4, F-2 | `src/features/lucky-draw/ladder/**`(7개 파일), `src/app/lucky-draw/ladder/page.tsx` 신규 | design 3.1, 3.3(403~452행), 2.3, 2.4. ui-ux 191~240행(사다리 화면), 309~331행(이름 고르기, 판, 전체 결과), 334~350행(경로선 0.8초), 352~376행, 438~456행(사다리 입력 오류 우선순위), 458~477행(알림) | 시작 전에는 그림과 결과 글자가 DOM에 없다. 시작 버튼 라벨은 시작 전과 후에 정확히 "시작"과 "다시 시작"이다. 입력이 바뀌면 결과를 모두 지운다. 공개 방식별 DOM 표(design 3.3)와 같다. 가리기에서는 "결과 보기" 전 이름 고르기가 잠긴다. `data-*`에 이름, id, 결과 인덱스를 넣지 않는다. 320px에서 가로 스크롤이 없다. 동작 줄이기에서 즉시 완성하고 `TRACE_END`가 한 번만 간다. 사다리 생성 실패 안내가 있다. `dark:`와 하드코딩 색 없음(design-guard) | 대기 |
| F-6 | frontend-dev | 돌림판 화면. `roulette/components/root.component.tsx`(`LuckyDrawRouletteComponent`, 'use client'), `spin-panel.component.tsx`(공용 `RouletteComponent`에 `items`(key는 항목 id), `targetIndex`, `spinId`, `onSpinEnd`, `accentClassName = LUCKY_DRAW_ROULETTE_ACCENT_CLASS`, `spinDurationSec = 1.0`, `spinTurns = 2`, `isResultHidden = revealMode === 'hidden' && !isRevealed`를 넘긴다. 칸 색 `colorClassName`은 넘기지 않는다. 돌리기 버튼 포함), `item-list.component.tsx`(남은 항목 태그, 처음부터), `result.component.tsx`(돌림판 밖 결과 카드, `tabIndex -1`, 결과 보기 버튼). `roulette/hooks/use-lucky-draw-roulette.hook.ts`(useReducer, design 3.4 상태와 액션. 빼기는 `all`은 `SPIN_END`, `hidden`은 `REVEAL`에서 적용. `wheelIds`는 다음 돌리기까지 유지). 페이지 `src/app/lucky-draw/roulette/page.tsx`. 페이지 문구에 "룰렛 돌리기"와 "메뉴"를 쓰지 않는다. `Switch`는 `src/components/ui/`에 있는 것만 쓴다(없으면 PM에게 알리고 새 shadcn을 추가하지 않는다) | F-4, F-2, F-3 | `src/features/lucky-draw/roulette/**`(7개 파일), `src/app/lucky-draw/roulette/page.tsx` 신규 | design 3.1, 3.4(454~498행), 2.5 강조 토큰. ui-ux 242~273행(돌림판 화면), 309~331행(결과 영역, 남은 항목, 스위치), 334~350행(회전), 438~456행(돌림판 오류 문구), 458~477행(돌림판 알림) | 1.0초 2바퀴로 돈다. 회전 중에는 돌리기, 입력, 옵션, 도구 전환이 잠긴다. 칸이 2개 미만이면 돌리기가 막힌다. 빼기를 켜면 다음 회전은 남은 칸만 쓴다. 끄면 목록이 복원된다. 가리기에서 결과 보기 전에는 결과 글자가 DOM에 없다. 결과 알림은 `SPIN_END`/`REVEAL`에 한 번만 바뀐다. 회전 래퍼 `aria-hidden`은 공용 컴포넌트 그대로다. 페이지에 "룰렛 돌리기", "메뉴" 0건. `dark:` 없음 | 대기 |
| F-7 | frontend-dev | 제비뽑기 화면. `lots/components/root.component.tsx`(`LuckyDrawLotsComponent`, 'use client'), `order-list.component.tsx`(`ol`/`li` 카드, 번호 배지 `font-mono`, 일괄 공개, 결과 가리기(점선 빈 카드), 한 명씩 열기(닫힌 카드 버튼, 열린 뒤에도 `aria-disabled`로 포커스 유지, 접근 가능한 이름 "n번째 열기"와 "n번째: 항목")). `lots/hooks/use-lucky-draw-lots.hook.ts`(useReducer, design 3.2 상태와 액션). "섞기"와 "다시 섞기"는 같은 액션으로 `shuffleFisherYates`를 핸들러에서 호출한다. 섞는 연출은 없다(U1). 카드 열기 0.2초 opacity, 동작 줄이기에서는 즉시. 페이지 `src/app/lucky-draw/lots/page.tsx` | F-4, F-2 | `src/features/lucky-draw/lots/**`(4개 파일 안팎), `src/app/lucky-draw/lots/page.tsx` 신규 | design 3.1, 3.2(372~401행). ui-ux 275~301행(제비뽑기 화면), 309~331행(순서 카드), 334~350행(카드 열기 0.2초, 섞는 연출 없음), 352~376행, 463~477행과 카드 알림, 488~507행(FAQ) | 섞기 전에는 결과 영역과 카드가 DOM에 없다. 섞은 뒤 카드 수는 입력 줄 수와 같다. 입력이 바뀌면 순서를 지운다. 다시 섞기는 입력을 유지하고 공개 상태와 열린 카드를 지운다. 가리기에서 결과 보기 전에는 글자가 DOM에 없다. 한 명씩 열기에서는 연 카드의 글자만 DOM에 있다. 숫자 배지는 `font-mono` | 대기 |
| F-8 | frontend-dev | 허브. `src/app/lucky-draw/page.tsx`(서버, `LuckyDrawPage`, 허브 SEO 메타, `JsonLdComponent`에 BreadcrumbList와 FAQPage만, `TitleWrapperComponent`로 h1 "운빨 뽑기", 상시 고지, 헤더 설명). `hub/components/root.component.tsx`(`LuckyDrawHubComponent`, 서버, 도구 링크 행 세 개. 행 전체가 링크, h3 이름, 설명, 예시, 인원 한계. 아이콘 타일 `bg-menu-lucky/10 text-menu-lucky`. 모바일 1열, 768px 이상 3열. 3열에서는 아이콘이 위). 사용 순서와 설명 문단(`LuckyDrawGuideComponent page="hub"`), 허브 FAQ 3개, 한 줄 안내 "입력한 이름은 서버로 보내거나 저장하지 않아요." 이 링크 외에 로또, 다른 메뉴, 외부 링크를 두지 않는다 | F-4, F-2 | `src/app/lucky-draw/page.tsx` 신규, `src/features/lucky-draw/hub/components/root.component.tsx` 신규 | design 3.1, 5장, 7장 공통 구성(design 5장 컴포넌트 트리). ui-ux 151~189행(허브와 공통 머리·꼬리), 309~331행(허브 도구 링크 행, hover `border-menu-lucky/40`), 393~398행(헤더 설명), 431행(인원 한계), 479~486행(사용 순서), 488~507행(FAQ) | 서버 HTML에 h1, 헤더 설명, 사용 순서, FAQ 질문이 있다. h1은 하나다. JSON-LD는 BreadcrumbList와 FAQPage 두 개뿐이고 평점과 ItemList가 없다. 도구 링크 세 개와 고지가 있다. 로또나 외부 링크가 0개다. 320px에서 가로 스크롤이 없다 | 대기 |
| F-9 | frontend-dev | 이용약관 `src/app/terms/page.tsx`. (a) 1장 마지막 문단 뒤에 운빨 뽑기 소개 문단 추가. (b) 9장 메뉴 룰렛 뒤에 "10. 운빨 뽑기 서비스" 장 추가, 문단 4개(design 7.1 초안, "보장", "보상"은 S-4 A 예외). (c) 기존 10~19장을 11~20으로 번호만 바꾼다. (d) `EFFECTIVE_DATE`는 기존 값을 둔다(배포일은 U-0 뒤 한 줄만 바꾼다). `src/app/privacy/page.tsx`는 고치지 않는다 | 없음(F-1~F-8과 파일이 겹치지 않는다) | `src/app/terms/page.tsx`(장 제목 215행 부근, 장 번호 10~19행 전체, 날짜 상수) | design 7.1(686~703행), 7.2(705~707행, 방침은 바꾸지 않음). plan AC-48, AC-49, S-4 A | 장 번호가 1~20으로 연속이다. 새 장에 오락 목적, 무작위 결과, 보장 없음, 보상 없음, 입력 미저장, 외부 링크 없음이 있다. 로또 단어가 없다. 기존 장 내용은 바뀌지 않는다(diff로 번호 외 변경이 없음을 확인) | 대기 |
| Q-1 | qa | 순수 함수 단위 테스트 `unit/lucky-draw/lucky-draw-random.test.ts`, `lucky-draw-ladder.test.ts`, `lucky-draw-input.test.ts`. 난수: 2.2 경계표(n=2, 3, 6, 10)를 주입 원천으로 검사, 버릴 값은 다시 뽑고 경계 바로 아래 값은 받는다, 잘못된 n과 원천 값은 `RangeError`, 계속 버리는 원천은 `Error`, `vi.spyOn(Math, 'random')` 호출 0회, `crypto.getRandomValues` 호출 1회 이상, Fisher-Yates는 원천 [2, 1] 주입에서 항등 순서가 나올 수 있어 Sattolo가 아님을 확인, n=3 10만 회 6순열 각 1/6 ± 0.47%p. 사다리: n=2~10 각 1,000개에 `isLuckyDrawLadderValid`와 간격마다 가로선 1개 이상, 배정은 순열, `assignment[i] = slotResultIndexes[trace(i).endColumn]`, 분포는 n=2, 4, 6, 10 각 10만 회 1/n ± 4σ, 항상 0을 주는 원천은 `Error`. 입력: 공백, 빈 줄, CRLF, 15자 경계(이모지 포함, 코드 포인트), 29째와 31째 줄 `overflowCount`, 같은 이름 다른 id, `getLuckyDrawLadderBlock` 네 경우. 분포 실패 규칙은 "먼저 볼 사항" 3번 | F-1 | `unit/lucky-draw/` 신규 3개 | design 8.1(733~744행), 2.2~2.4 | 세 파일 통과. 분포 검사에서 우연 실패가 나오면 재실행 규칙으로 기록한다. 실행 시간이 수 초를 넘으면 PM에게 보고한다(횟수는 줄이지 않는다) | 대기 |
| Q-2 | qa | 문구, SEO, 준수 단위 테스트와 공용 돌림판 테스트. `unit/lucky-draw/lucky-draw-seo.test.ts`(AC-3, 5, 6, 7: 각 페이지 metadata가 `buildMetadata()`와 같은지, 페이지 import가 node에서 어려우면 소스 검사, JSON-LD `@type` 두 개, `aggregateRating`과 `review` 없음, 빵부스러기 이름, `MENU_LIST` 그룹 1개와 항목 3개, `comingSoon`과 사이트맵 경로 계산 일치), `lucky-draw-copy.test.ts`(`unit/helpers/copy-check.util.ts` 재사용. AC-19 허용 토큰 목록에 `fill-menu-lucky/20 stroke-menu-lucky` 추가, 칸 색은 공용 기본 번갈이만, AC-40, 41, 42. 예외 문장은 `lucky-draw-copy-rule.constant.ts` 목록만, "돈"은 단어 단위, 가격, 칼로리, 별점, 후기 없음, 연락처와 아동 권유 없음, `LUCKY_DRAW_ROULETTE_SPIN` 1.0초 2바퀴), `lucky-draw-compliance.test.ts`(AC-50: COMPLIANCE.md에 lucky draw 항목과 "accepts the risk" 문장), `unit/shared/roulette.test.ts` 갱신(F-3: `isResultHidden` 기본 false 동일, true면 강조 클래스와 병뚜껑 글자 없음, false로 바꾸면 나옴. 기존 테스트는 그대로) | F-2, F-3, F-4, PM-2 | `unit/lucky-draw/lucky-draw-seo.test.ts`, `lucky-draw-copy.test.ts`, `lucky-draw-compliance.test.ts` 신규, `unit/shared/roulette.test.ts` 수정 | design 8.1(733~744행), 5장, 6장, 7.3장. plan AC-3~7, AC-19, AC-40~42, AC-50. roulette-common plan AC-9 | 테스트 통과. `unit/shared/roulette.test.ts`의 기존 케이스가 그대로 통과. 공용 파일 수정 없음(QA는 테스트만 고친다) | 대기 |
| Q-3 | qa | E2E. `e2e/helpers/lucky-draw.util.ts`(입력 채우기, 사다리 `<line>` 좌표로 경로 계산, 저장소와 URL 검사), `e2e/lucky-draw.spec.ts`(데스크톱과 모바일 프로젝트). 사다리 "시작" 버튼은 `getByRole('button', { name: '시작', exact: true })`로 찾는다. 시작 뒤에는 "다시 시작"이 되므로 부분 일치로 찾으면 안 된다. 셀렉터는 역할과 이름을 쓰고 결과 정보를 담은 `data-testid`를 만들지 않는다. 항목: AC-1, 2, 4, 7, 8, 9, 10, 14, 15, 16, 17(0.8~2.0초), 18, 20, 21, 22, 23, 24, 26, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 43, 44, 45(`emulateMedia({ reducedMotion: 'reduce' })`, `onSpinEnd`가 한 번), 46(320px `scrollWidth <= clientWidth`, 10명), 47, 48(`/terms`), 49(방침 변경 없음). 마지막에 `pnpm test` 전체와 `pnpm e2e:all`(meal 포함)을 한 번 돌린다(회귀는 여기서만) | F-5, F-6, F-7, F-8, F-9 | `e2e/lucky-draw.spec.ts`, `e2e/helpers/lucky-draw.util.ts` 신규 | design 8.2(746~757행), 3.1~3.4. ui-ux 접근성 352~376행 | 데스크톱과 모바일에서 AC 전 항목 통과. 실패는 해당 dev에게 되돌리고 Q-3을 다시 돌린다. `e2e/meal.spec.ts`와 `unit/meal`이 통과(F-3 회귀). 결과는 `docs/lucky-draw/qa-report.md`에 AC 대응표로 적는다 | 대기 |
| PM-2 | PM | `COMPLIANCE.md` 11장(메뉴 룰렛 항목 뒤)에 `Lucky draw (/lucky-draw, /lucky-draw/ladder, /lucky-draw/roulette, /lucky-draw/lots)` 항목 추가(design 7.3의 내용 목록 그대로. 법률 상태는 "No legal review; the operator accepts the risk (decided 2026-11-23)"). 운세 항목의 약관 장 참조 번호를 실제 약관과 맞춘다(먼저 볼 사항 6번). 1장 개인정보 한 줄은 출시 전에 PM이 정한다. `README.md`는 변경 없음을 확인한다. `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`는 새 라이브러리, 폰트, 이미지가 없어 변경 없음이다(기록만 남긴다) | 없음 | `COMPLIANCE.md`, `README.md`(확인만), `DEPENDENCY_LICENSES.md`(확인만), `THIRD_PARTY_NOTICES.md`(확인만) | design 7.3(709~720행), 7.4(722~725행). plan 법률 검토 장과 AC-50 | 항목 추가, 위험 수용 문장, 참조 번호 정정, 변경 없는 문서 목록 기록 | 대기 |
| PM-3 | PM | 검증. `pnpm typecheck`, `pnpm lint`를 각각 한 번 실행한다. 실패하면 해당 dev에게 되돌린다. 보안 확인: 시크릿과 `NEXT_PUBLIC_` 없음, 입력 글이 요청, URL, 저장소, 분석, `console`에 없음(grep), `dangerouslySetInnerHTML` 없음. 법적 문구가 plan과 design대로 있음. 새 페이지의 메타, JSON-LD, 사이트맵(`comingSoon`이면 주소가 빠짐) 확인. design-guard 통과 확인. `docs/lucky-draw/status.md` 갱신 | Q-2, Q-3 | 전체 | design 8장, 9장(보안, 770행 이전) | typecheck, lint 성공. 보안, 법적, SEO 확인 목록 전부 통과. 결과를 status.md에 기록 | 대기 |
| 사용자 | 사용자 | 결정 두 가지. (a) 약관 시행일(배포일). F-9 뒤 한 줄 수정 요청에 쓴다. (b) 검색량 조회(선택). 결과를 키워드 상수(`lucky-draw-seo.constant.ts`)에만 반영한다 | 없음 | - | - | 결정 내용을 PM에게 전달 | 대기 |
| R-1 | frontend-dev (PM 승인 뒤) | 출시. `menu.constant.ts`의 `comingSoon` 한 줄 제거. 사이트맵에 네 주소가 들어가는지 확인. AdFit 심사 확인과 서치 콘솔 재제출은 사용자가 한다. 출시는 사용자 승인 뒤에만 한다 | PM-3, 사용자 출시 승인 | `src/constants/menu.constant.ts` | plan AC-7 출시 뒤 조건 | `/sitemap.xml`에 네 주소 포함. 준비 중 배지 없음. 운영 배포는 사용자 승인 뒤에만 | 출시 뒤 |

## 티켓 상세 (입력 범위와 규칙)

공통 규칙: design, ui-ux의 절 범위만 읽는다. 공용 파일과 규칙 문서를 바꿔야 하면 해당 티켓 담당이 직접 고치지 않고 PM에게 보고한다. frontend-dev는 `e2e/`, `unit/`, `COMPLIANCE.md`, `docs/conventions/`를 고치지 않는다(guard-files). 화면 문구는 상수에서만 가져오고 React가 이스케이프한다. 입력 글과 결과 글은 상태에만 두며 URL, 저장소, 쿠키, 네트워크, 분석, 콘솔로 보내지 않는다.

### PM-1
- 입력: `docs/lucky-draw/ui-ux-design.md` 510~516행, `docs/conventions/design-system.md` 23~38행
- 범위: 메뉴 라벨 색 표에 한 줄만 추가한다. 규칙 문장은 고치지 않는다.

### F-1
- 입력: `docs/lucky-draw/design.md` 2.1(136~199행), 2.2(201~245행), 2.3(247~284행), 2.4(286~313행), 2.5(315~357행), 1.2(42~48행). `docs/conventions/code-style.md` 네이밍(97~115행), 폴더 구조(24~53행)
- 범위: 타입과 상수와 순수 함수. 컴포넌트는 만들지 않는다.
- 규칙: `type`만 쓴다(interface 금지). 함수 이름은 design 시그니처 그대로다. `randomIntBelow`의 `maxExclusive === 1`은 원천을 부르지 않고 0을 돌린다. Fisher-Yates는 `i`에서 `randomIntBelow(i + 1)`을 쓴다.
- 완료: 9개 파일, `Math.random` 0건, 시그니처와 경계 규칙 일치.

### F-2
- 입력: `docs/lucky-draw/ui-ux-design.md` 30~76행(색), 97~110행(아이콘). `docs/lucky-draw/design.md` 2.5(350~357행), 6장(625~680행), 폴더 구조 공용 파일 변경 표(118~131행)
- 범위: 토큰 두 줄, 메뉴 타입 한 줄, 네 맵 한 키씩, 아이콘 4개, 메뉴 그룹 한 개. 네 맵과 `MenuSectionKeyType`은 같은 커밋에서 바꾼다.
- 규칙: `dark:`를 쓰지 않는다. `.dark` 토큰을 만들지 않는다. 메뉴 description과 example은 design 6장 문구를 그대로 쓴다.
- 완료: 토큰 대비 수치 보고, 아이콘 이름 확인, typecheck 안에서 이 파일들 오류 없음.

### F-3
- 입력: `docs/lucky-draw/design.md` 3.4의 결과 가리기 항목(495~498행), 1.2(42~48행). `docs/roulette-common/plan.md` 강조 규칙, AC-1, AC-3, AC-10. 공용 파일 현재 props는 17~26행과 130~139행
- 범위: `isResultHidden` 하나. 강조와 병뚜껑 글자 렌더를 조건으로 감싼다.
- 규칙: 상태, 타이머, `onSpinEnd` 호출 방식은 건드리지 않는다. 메뉴 룰렛 출력은 바뀌지 않아야 한다.
- 완료: 위 완료 조건. Q-2 테스트로 검사.

### F-4
- 입력: `docs/lucky-draw/design.md` 3.1(361~370행), 5장(598~623행). `docs/lucky-draw/ui-ux-design.md` 382~435행(고지, 헤더 설명, 라벨), 438~477행(오류, 알림), 479~507행(사용 순서, FAQ), 352~376행(접근성 라벨). `src/lib/seo.ts` `buildMetadata` 인자 구조(32~96행, 읽기만)
- 범위: 상수 다섯 개, 유틸 하나, 공통 부품 아홉 개. 페이지와 도구 화면은 만들지 않는다.
- 규칙: 공통 부품 이름은 design 트리(1절, 폴더 구조)와 같다(`LuckyDrawLinesInputComponent` 등). 지정 props는 design 2절과 3절을 따른다. `LuckyDrawStatusComponent`는 도구마다 하나만 렌더링된다.
- 완료: 자가 점검. 금지어와 예외 문장은 copy-rule 상수 목록과 일치하도록 둔다.

### F-5
- 입력: `docs/lucky-draw/design.md` 3.1, 3.3(403~452행), 2.3(247~284행), 2.4(286~313행). `docs/lucky-draw/ui-ux-design.md` 191~240행, 309~331행, 334~350행(사다리 경로 0.8초, `motion.polyline`), 352~376행, 438~477행
- 범위: 사다리 화면과 페이지. 사다리 생성은 `lucky-draw-ladder.util.ts`(F-1)를 쓴다.
- 규칙: 위 칸은 번호다(먼저 볼 사항 2번). SVG `viewBox`는 `0 0 {n×100} {(rowCount+1)×40}`, `preserveAspectRatio="none"`, 세로선과 가로선 2px, 경로선 4px, `vector-effect="non-scaling-stroke"`, 좌표는 소수 셋째 자리. SVG는 `aria-hidden`. 사다리는 `game`이 있을 때만 그린다. `framer-motion`의 `MotionConfig reducedMotion="user"`를 쓴다.
- 완료: 위 완료 조건.

### F-6
- 입력: `docs/lucky-draw/design.md` 3.1, 3.4(454~498행), 2.5 강조 토큰(350~357행). `docs/lucky-draw/ui-ux-design.md` 242~273행, 309~331행, 334~350행, 438~477행. `src/components/common/roulette.component.tsx` props(17~26행, 130~139행)
- 범위: 돌림판 화면과 페이지. 공용 파일은 F-3에서만 고쳐졌고 F-6은 읽기만 한다.
- 규칙: 칸 색은 넘기지 않는다(강조만). `wheelIds`는 회전 시작 시 고정. 빼기 적용 시점은 design 3.4의 표현대로. "돌리기" 막힘 사유 한 줄은 최소 높이 24px로 둔다(레이아웃 이동 방지).
- 완료: 위 완료 조건.

### F-7
- 입력: `docs/lucky-draw/design.md` 3.1, 3.2(372~401행). `docs/lucky-draw/ui-ux-design.md` 275~301행, 309~331행, 334~350행(카드 열기 0.2초, 섞는 연출 없음), 352~376행, 463~477행, 488~507행
- 범위: 제비뽑기 화면과 페이지.
- 규칙: `order`가 `null`이면 결과 영역을 만들지 않는다. 카드는 `ol`/`li`. 열린 카드도 버튼으로 남긴다(포커스 유지).
- 완료: 위 완료 조건.

### F-8
- 입력: `docs/lucky-draw/design.md` 5장(598~623행, SEO 표와 JSON-LD 규칙), 7장 공통 구성(540~592행 컴포넌트 트리). `docs/lucky-draw/ui-ux-design.md` 151~189행, 309~331행(허브 링크 행), 393~398행, 431행, 479~486행, 488~507행
- 범위: 허브 페이지와 허브 컴포넌트.
- 규칙: 허브 JSON-LD는 BreadcrumbList(홈 > 운빨 뽑기)와 FAQPage만. ItemList는 넣지 않는다(plan AC-5).
- 완료: 위 완료 조건.

### F-9
- 입력: `docs/lucky-draw/design.md` 7.1(686~703행), 7.2(705~707행). `docs/lucky-draw/plan.md` AC-48, AC-49, AC-40(S-4 A 예외 목록). 약관 현재 장 구조: 1장 `1. 서비스 개요`(약 63~65행), 9장 메뉴 룰렛(192행), 10장 광고 및 쿠키(215행), 19장 문의(294행)
- 범위: 약관 페이지의 한 문단 추가, 한 장 추가, 장 번호 10~19를 11~20으로 바꾼다.
- 규칙: 기존 문장은 바꾸지 않는다. 방침 페이지는 건드리지 않는다.
- 완료: 위 완료 조건.

### Q-1
- 입력: `docs/lucky-draw/design.md` 8.1(731~744행), 2.2 경계표(203~245행). `docs/lucky-draw/plan.md` AC-9, AC-11~13, AC-16, AC-22, AC-25, AC-27, AC-28. `unit/helpers/` 는 재사용 가능한 것만 쓴다
- 범위: 세 테스트 파일.
- 완료: 위 완료 조건.

### Q-2
- 입력: `docs/lucky-draw/design.md` 8.1(733~744행), 5장, 6장, 7.3장. `docs/lucky-draw/plan.md` AC-3~7, AC-19, AC-40~42, AC-50. 기존 `unit/shared/roulette.test.ts`(1~108행)
- 범위: 테스트 파일 세 개 신규, 공용 테스트 한 개 갱신.
- 완료: 위 완료 조건.

### Q-3
- 입력: `docs/lucky-draw/design.md` 8.2(746~757행). `docs/lucky-draw/plan.md` 완료 조건 AC-1~AC-49(109~177행). `docs/lucky-draw/ui-ux-design.md` 접근성(352~376행). 기존 `e2e/helpers/common.util.ts`는 읽기만
- 범위: E2E 한 파일과 도우미 한 파일.
- 완료: 위 완료 조건.

### PM-2
- 입력: `docs/lucky-draw/design.md` 7.3(709~720행), 7.4(722~725행). `COMPLIANCE.md` 11장(110행 이후)과 운세 항목의 약관 장 참조
- 완료: 위 완료 조건.

### PM-3
- 입력: `docs/lucky-draw/design.md` 8장 전체, 보안(759~770행), 상업적 이용(772~789행). `docs/lucky-draw/plan.md` 법적·정책 요구사항(216~270행)
- 완료: 위 완료 조건.

## 실행 순서

1. **1단계(병렬)**: PM-1, PM-2, F-9, F-1, F-2, F-3. 파일이 서로 겹치지 않는다. 사용자 결정(배포일, 검색량)은 이 단계와 같이 요청한다.
2. **2단계(병렬)**: F-4(F-1 뒤), Q-1(F-1 뒤). 두 작업은 파일이 겹치지 않는다.
3. **3단계(병렬)**: F-5, F-6, F-7, F-8(F-4 뒤, F-6은 F-3도 필요). 이 단계에서 Q-2를 함께 돌릴 수 있다(F-2, F-3, F-4, PM-2 뒤, `unit/`만 쓴다). PM이 `pnpm typecheck`를 이 단계 끝에 한 번 돌린다. 네 dev가 서로 완성되지 않은 파일을 보고 typecheck를 돌리지 않게 한다.
4. **4단계(직렬)**: Q-3(F-5~F-9 뒤). 테스트가 끝나면 PM-3(Q-2, Q-3 뒤).
5. **출시(사용자 승인 뒤)**: R-1, 그리고 사용자 배포 승인.

## 동시 실행 가능

- PM-1 ‖ PM-2 ‖ F-9 ‖ F-1 ‖ F-2 ‖ F-3 (각각 다른 파일)
- F-4 ‖ Q-1 (F-1 뒤)
- F-5 ‖ F-6 ‖ F-7 ‖ F-8 (각자 자기 폴더와 페이지 파일)
- Q-2 ‖ F-5~F-8 (QA는 `unit/`만, dev는 `src/`만 쓴다)
- Q-2 ‖ Q-3 준비(도우미 작성), 단 Q-3 실행은 화면이 끝난 뒤

동시 실행 금지:
- F-1 ↔ F-4(F-4가 F-1의 타입과 상수를 import한다)
- F-2 ↔ F-5~F-8 중 메뉴 상수를 읽는 작업은 F-2 끝난 뒤 시작(토큰 없이 클래스만 쓰면 색이 안 나온다)
- F-5 ↔ F-6 ↔ F-7 ↔ F-8 ↔ F-4(`shared/components/`를 고치면 네 작업이 깨진다. 고칠 일이 생기면 F-4 담당에게 되돌린다)
- Q-3 ↔ 화면 작업(테스트 중 화면이 바뀌면 결과가 섞인다)

## 충돌 위험

1. `src/constants/menu.constant.ts`, `src/types/menu.type.ts`, `src/constants/theme.constant.ts`, `src/constants/menu-icon.constant.ts`, `src/app/globals.css`: F-2 한 작업에서만 고친다. 메뉴 순서와 색 토큰은 최근에도 여러 번 바뀌었으므로 병합 충돌 가능성이 높다. 다른 메뉴 작업과 시점을 맞춘다.
2. `MenuSectionKeyType`: 키를 더하면 `Record<MenuSectionKeyType, ...>` 맵 네 개가 같이 바뀌어야 typecheck가 통과한다. F-2 한 커밋에서 같이 바꾼다. 다른 기능이 섹션 키를 더하면 충돌한다.
3. `src/components/common/roulette.component.tsx`: 메뉴 룰렛이 쓰는 공용 파일이다. F-3에서만 고치고, 기존 props의 기본 동작을 바꾸지 않는다. `/meal` 회귀를 Q-3에서 확인한다.
4. `src/features/lucky-draw/constants/`, `types/`, `utils/`: F-1은 타입, limit, route, theme, random, ladder, input을 만든다. F-4는 seo, faq, guide, notice, copy-rule, seo util을 만든다. 같은 폴더라 파일 이름이 겹치지 않게 확인하고, F-4는 F-1 뒤에 시작한다.
5. `src/features/lucky-draw/shared/components/`: F-4만 만든다. F-5~F-8이 import만 한다. 고칠 일이 생기면 F-4에게 되돌린다.
6. `LuckyDrawStatusComponent`, `LuckyDrawToolNavComponent`: 세 도구가 같이 쓰므로 이름과 props를 design 그대로 둔다.
7. `src/app/terms/page.tsx`: F-9만 고친다. 장 번호가 10~19 전부 바뀌므로 다른 약관 수정과 겹치면 충돌이 크다.
8. `COMPLIANCE.md`: PM-2만 고친다. 운세 항목의 장 참조 번호도 같은 작업에서 맞춘다.
9. `docs/conventions/design-system.md`: PM-1만 고친다. frontend-dev와 qa는 규칙 문서를 못 고친다(guard-files).
10. `unit/shared/roulette.test.ts`: Q-2만 고친다. 기존 케이스는 지우지 않는다.
11. `unit/lucky-draw/`: Q-1과 Q-2가 같은 폴더에 파일을 만든다. 파일 이름이 겹치지 않는지 확인한다.
12. `e2e/lucky-draw.spec.ts`, `e2e/helpers/lucky-draw.util.ts`: Q-3만 쓴다. `e2e/helpers/common.util.ts`와 `meal.util.ts`는 다른 기능도 쓰므로 고치지 않는다.
13. `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/layout.tsx`: 고치지 않는다. `getOgTag`가 `MENU_LIST`에서 항목을 찾으므로 F-2 등록이 빠지면 OG 태그 라벨이 비어 보인다. F-8 완료 조건에 넣었다.
14. `src/app/lucky-draw/**`: 페이지 네 개가 각자 폴더를 쓴다. 허브 `page.tsx`만 F-8이 쓴다.
15. 검증 중 `pnpm typecheck`는 다른 dev의 미완성 파일 때문에 실패할 수 있다. 3단계 끝에 PM이 한 번 돌리고, 실패는 원인이 된 티켓 담당에게 보낸다.
16. 출시 전까지 `comingSoon: true`다. 페이지는 주소로 열리므로 QA는 노출 여부를 주소 직접 접속으로 확인한다.
