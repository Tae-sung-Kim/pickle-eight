# tarot 개발 티켓

입력: `docs/tarot/design.md`, `docs/tarot/ui-ux-design.md` (둘 다 승인 완료, 2026-11-04)
함께 보는 문서: `docs/tarot/plan.md`(결정 16건, AC 37개), `docs/research/tarot.md`, `docs/conventions/` 전체
작성일: 2026-11-04
상태: 승인 (2026-11-04). 확정 사항: 카드 문구(CT-1, CT-2, CT-3a, CT-3b)는 메인 세션이 아니라 frontend-dev가 작성한다(사용자 결정, 웹 참조 없이 처음부터). 메인 세션은 결과를 보고하고 사용자 검수만 연결한다. CT-4 웹 검색 샘플 규모는 제안대로(메이저 8장, 수트별 4장, 가이드·FAQ·위치 안내 각 2문장 이상).

## 요약

- 티켓 26개 + "없음" 확인 티켓 2개(DB-0, BE-0). DB·API가 없는 기능이라 db-dev, backend-dev의 기능 티켓은 없다. backend-dev는 `src/lib` 공용 수정 1건(SH-1)만 맡는다. frontend-dev가 `src/lib`를 고칠 수 없기 때문이다(3장).
- 새 라이브러리, 새 환경변수, 새 API, 새 테이블, 새 폰트는 없다.
- 카드 문구 78장 작성(CT)은 에이전트가 아니라 메인 세션(Claude)이 쓰고 사용자가 검수한다. CT-1 뒤에 사용자 검수 지점에서 반드시 멈춘다.
- 로또 코드를 건드리는 공용화는 SH-1, SH-2, QA-0으로 분리했다. 로또 동작 불변을 확인 항목으로 둔다.

## 1. 공통 규칙 (모든 티켓 적용, 티켓의 "공통 규칙" 표기는 이 번호)

### R-1 저작권·자체 제작 (카드 그림, 카드 문구, 모든 사용자 노출 문구)
- 외부 이미지, 외부 아이콘 세트, 외부 폰트, 외부 덱 도안, 스톡 이미지, 다른 사이트·책·앱의 문장을 쓰지 않는다. 복사, 번역, 어순만 바꾼 옮겨 쓰기도 금지다.
- 카드 그림은 전부 자체 제작 인라인 SVG다. lucide-react를 포함한 어떤 아이콘 세트도 카드 그림에 쓰지 않는다(lucide는 버튼·메뉴 UI 아이콘에만 쓴다). `public/`에 카드 이미지 파일을 두지 않는다. AI 이미지 생성 도구를 쓰지 않는다.
- "Rider-Waite", "Rider Waite", "라이더-웨이트", "웨이트"를 화면, 메타데이터, 소스 주석, 문서 어디에도 쓰지 않는다. 이 덱과 파생 덱의 구도를 닮게 그리지 않는다. 피해야 할 구체 도안 목록은 `ui-ux-design.md` "카드 SVG 시각 명세 > 공통 원칙"을 따른다.
- 새 폰트를 추가하지 않는다. SVG 안 글자는 Pretendard를 `<text>`로만 쓴다. 다른 폰트 글리프를 경로로 바꿔 넣지 않는다.
- 문구는 카드의 일반적 의미 아이디어만 바탕으로 처음부터 새로 쓴다. 작성 중에는 외부 해석 문장을 찾아보거나 참조하지 않는다(웹 검색 포함). 상업적 이용·라이선스 표는 `design.md` 15장이다.

### R-2 표현 규칙
- 사용자에게 노출되는 문장은 모두 합니다체다. 버튼·칩·제목·메뉴 같은 짧은 라벨은 명사형으로 쓴다. 상시 면책 문구(사용자 지정)는 원문 그대로 쓴다.
- 금지 표현 목록은 `design.md` 7.1과 `plan.md` "표현 규칙"이다. 예외는 면책 영역의 "보장하지 않습니다" 같은 부정 고지 문장뿐이다.
- 단정, 과장, 공포 조장, 효과·적중 주장을 쓰지 않는다. 투자 종목, 매수 시점, 복권, 도박, 로또 번호를 묻거나 답하는 문구를 쓰지 않는다.
- 문구의 뜻은 `plan.md`의 고지 문구 초안과 `ui-ux-design.md` "문구 말투 정리"의 확정 문구를 따른다. 확정 문구가 있는 자리에 새 문장을 만들지 않는다.

### R-3 개인정보·데이터
- 질문 텍스트는 React state(메모리)에만 둔다. 서버, localStorage, sessionStorage, 쿠키, URL, 전역 store, `console.*`, aria-live 공지에 넣지 않는다. `<form>` 제출을 하지 않는다.
- 위기·전문가 표현 감지 결과는 렌더링 중 계산값이다. 상태에 저장하지 않고, 어디로도 보내거나 남기지 않는다.
- `features/tarot/`에서 `http`(axios), `fetch`, React Query, 분석·알림 모듈을 import하지 않는다. `Math.random`, `sort(() => Math.random() - 0.5)`를 쓰지 않고 `@/lib/random`의 `secureRandomInt`를 쓴다.
- localStorage에는 오늘의 카드 키 1개(`${NEXT_PUBLIC_SITE_ENG_NAME}_tarot_daily_v1`, 날짜·카드 번호·방향)만 쓴다. 쿠키 동의 상태에 의존하지 않는다.

### R-4 디자인·코드 규칙
- 색은 디자인 토큰과 `currentColor`, `var(--card)` 같은 CSS 변수만 쓴다. hex, rgb, Tailwind 기본 팔레트, `dark:`를 쓰지 않는다. CSS 애니메이션에는 `motion-reduce:`를 붙인다(design-guard hook이 검사한다).
- 폴더·파일명·컴포넌트명·타입명은 `docs/conventions/code-style.md` 네이밍 규칙을 따른다. `interface`, default export(페이지 제외), `forwardRef`, HOC를 쓰지 않는다. `features/tarot/`는 다른 기능을 import하지 않는다.
- `dangerouslySetInnerHTML`은 쓰지 않는다(기존 `JsonLdComponent` 예외). 사용자 입력을 JSON-LD에 넣지 않는다.
- 화면 명세와 다르게 해야 하면 임의로 바꾸지 않고 ui-ux-designer에게, 설계와 다르면 architect에게 되돌린다.

### R-5 작업 마무리
- 코드를 바꾼 티켓은 `pnpm typecheck`와 Biome 검사(hook이 자동 실행)를 통과해야 끝난다. frontend 티켓은 `pnpm build`도 통과해야 한다.
- 끝나면 변경 파일, 명세 대비 누락, 남은 이슈를 보고한다. 에이전트 범위 밖 파일이 필요하면 수정하지 말고 PM에게 보고한다.
- 단계가 바뀔 때 `docs/tarot/status.md`는 PM이 갱신한다. 이 문서의 상태 칸도 PM이 갱신한다.

## 2. 배포 전 게이트

- 카드 문구 78장, FAQ, 가이드 본문이 모두 채워지고 CT-4(웹 검색 샘플 확인)가 끝나기 전에는 배포하지 않는다. FE-1~FE-7 단계에서 문구 필드는 빈 값이며 FE-8(메뉴 등록, sitemap 노출) 전에는 운영에 올리면 안 된다.
- 운영 배포, `git push`는 사용자 확인 뒤에만 한다.
- 출시 직전에 109 번호·운영 시간을 다시 확인한다(4장 사용자 확인 지점).

## 3. 담당 범위 확인 (`guard-files.js` 기준)와 design.md 16장과 다른 점

| 항목 | 내용 | 처리 |
|---|---|---|
| `src/lib/random.ts`, `src/lib/date.ts` | design.md 16장은 FE-1(frontend-dev)로 적었지만 frontend-dev는 `src/lib`를 수정할 수 없다. backend-dev 범위는 `src/lib/` | SH-1을 backend-dev에 배정. 로또 import 교체와 원본 삭제는 `src/features/`라 frontend-dev(SH-2) |
| `COMPLIANCE.md`, `THIRD_PARTY_NOTICES.md`, `README.md` | 저장소 루트 파일이라 어떤 agent 범위(`docs/` 아래만)에도 없다. agent는 수정이 차단된다 | DOC-2, DOC-3은 메인 세션(PM)이 직접 한다. agent 범위를 넓히는 설정 변경은 하지 않는다 |
| `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` | `src/app/` 아래라 frontend-dev 범위 | DOC-1을 frontend-dev에 배정 |
| 카드 문구 파일 `constants/cards/*.constant.ts` | 문구는 메인 세션(Claude)이 쓰도록 plan 결정 3이 정했다. FE-1 이후에는 문구 필드만 고친다 | CT 티켓은 메인 세션 담당. agent 범위 제한을 받지 않는다 |
| 웹 검색 샘플 확인 | researcher만 WebSearch 도구가 있고 `docs/`에 쓸 수 있다 | CT-4를 researcher에 배정. 문장 수정은 메인 세션 |
| `e2e/` | qa 범위 | QA-0, QA-1, QA-2 |
| design.md 16장에 없던 컴포넌트 | `card-reading`, `question-input`, `reversed-toggle`, `crisis-notice`, `expert-notice`가 FE-n 어디에도 배정되어 있지 않았다(파일 구조는 design.md 1장에 있음) | FE-4b로 배정 |
| design.md 16장 FE 번호 | FE-1~FE-9와 다르게 세분화했다 | 대응: 구 FE-1 = SH-1·SH-2, 구 FE-2 = FE-1, 구 FE-3 = FE-2, 구 FE-4 = FE-3a·3b·3c, 구 FE-5 = FE-4a·4c, 구 FE-6 = FE-5, 구 FE-7 = FE-6, 구 FE-8 = FE-7a·7b·8, 구 FE-9 = DOC-1·2·3, 구 C-1~C-4 = CT-1·2·3a·3b·4 |

## 4. 티켓

상태는 모두 "대기"다. 선행 표기: "A+B"는 둘 다 끝나야 시작, "A(착수)"는 A가 시작 가능 상태일 때 같이 시작 가능, "A(검수)"는 사용자 검수 완료가 조건이다.

### 4.1 DB

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| DB-0 | db-dev | 없음. 테이블, 컬럼, 인덱스, RLS, 마이그레이션이 필요 없다(서버 저장 없음) | - | 없음 (`supabase/` 수정 금지) | 입력: design.md 11장. UI 명세 없음 | `supabase/` 변경 없음을 PM이 `git diff`로 확인. DB가 필요해 보이면 architect에 되돌림 | 해당 없음 |

### 4.2 백엔드

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| BE-0 | backend-dev | API 없음. 타로용 Route Handler와 repository를 만들지 않는다 | - | 없음 (`src/app/api/tarot/` 만들지 않음) | 입력: design.md 10장. UI 명세 없음 | `src/app/api/`, `*.repository.ts` 변경 없음. `src/features/tarot/`에서 `http`, `fetch`, React Query import가 grep으로 0건 (AC-24, AC-30의 근거). 규칙 R-3 | 해당 없음 |
| SH-1 | backend-dev | (1) `src/features/lotto/utils/random.util.ts`의 내용을 `src/lib/random.ts`로 복사한다. 함수 이름·동작·`Math.random` 대체 경로·`getRandomSourceLabel`을 바꾸지 않는다. 원본은 지우지 않는다(SH-2가 삭제). (2) `src/lib/date.ts`에 `getKoreaDateKey(date = new Date()): string` 추가: `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year, month, day: '2-digit' }).formatToParts()`로 `YYYY-MM-DD`. 기존 `getKoreaTime()`와 기존 export는 그대로 | - | `src/lib/random.ts` (신규), `src/lib/date.ts` (추가만) | 입력: design.md 5.1, 5.3, 9장 D1·D2, 17장. UI 명세 없음 | `random.ts`가 원본과 import 경로 외에 동일. `getKoreaDateKey`가 기기 시간대와 무관하게 KST 날짜를 `YYYY-MM-DD`로 돌려줌(자정 직전·직후 KST 값으로 확인). 기존 export 삭제·변경 없음. typecheck 통과. AC-7의 기반. 로또 파일은 이 티켓에서 건드리지 않음 | 대기 |

### 4.3 공용화 (로또 코드 변경, 로또 동작 불변이 핵심)

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| QA-0 | qa | 로또 회귀 확인. (1) 기준선: SH-2 시작 전에 현재 트리에서 `e2e/lotto.smoke.spec.ts`, `e2e/lotto.flow.spec.ts`를 데스크톱·모바일로 실행하고 결과를 기록. (2) SH-2 끝난 뒤 같은 명령을 다시 실행해 비교. 환경 문제로 기준선이 실패하면 같은 항목이 같은 이유로 실패하는지만 비교하고 PM에 보고 | (1) 없음 (2) SH-2 | `docs/tarot/qa-report.md` "로또 회귀" 절 (신규 작성은 이 티켓이 처음). 기존 `e2e/lotto.*.spec.ts`는 수정하지 않음 | 입력: design.md 9장 D1, 17장. UI 명세 없음 | 전후 결과가 같고 새 실패가 없음. 앱 코드는 고치지 않고 실패 시 SH-2 담당(frontend-dev)에 되돌림. 실행 명령과 결과 요약을 보고서에 기록 | 대기 |
| SH-2 | frontend-dev | 로또 3개 파일의 import를 `@/features/lotto/utils/random.util`에서 `@/lib/random`로 바꾼다. 원본 `random.util.ts`를 삭제한다. `LOTTO-REFACTOR.md`의 `utils/random.util.ts` 언급(43행)을 새 위치로 고친다. import 경로 외의 줄은 한 줄도 바꾸지 않는다. 삭제가 hook에 막히면 PM에 보고 | SH-1 + QA-0(기준선 기록 완료) | `src/features/lotto/generator/components/root.component.tsx`, `src/features/lotto/simulator/components/root.component.tsx`, `src/features/lotto/utils/lotto.util.ts`, `src/features/lotto/utils/random.util.ts` (삭제), `src/features/lotto/LOTTO-REFACTOR.md` | 입력: design.md 5.1, 9장 D1, 17장. UI 명세 없음 | `lotto/utils/random.util` 문자열이 `src/` 전체에서 0건. diff가 import 줄과 문서 한 줄뿐(동작 코드 변경 없음). `pnpm typecheck`, `pnpm build` 통과. 이어서 QA-0(2) 통과. 이 티켓 진행 중 다른 로또 작업을 하지 않음 | 대기 |

### 4.4 프론트엔드 (frontend-dev, design.md와 ui-ux-design.md 둘 다 기준, 공통 규칙 R-1~R-5)

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| FE-1 | frontend-dev | 타입·상수 뼈대. 타입은 design.md 2장 그대로(임의 변경 금지). 카드 78장은 메타(id, arcana, suit, rank, nameKo, nameEn)만 채우고 `keywords`·`summary`는 빈 문자열 자리로 둔다(주석 "문구 작성 단계 CT에서 채움"). 죽음(id 13)의 `note`는 plan 고지 문구 그대로. 위치 라벨(과거·현재·미래), 분야 라벨 4개, 고정 문구(상시 면책, 결과 하단, 상세 안내 8항, 위기, 전문가, 재뽑기, 저장 안내, noscript, aria-live 공지 틀, 뒷면 이름)는 plan·ui-ux 확정 문구를 그대로 옮긴다. 위치 안내 한 줄·분야 예시·FAQ는 빈 구조만 만든다(CT-3a가 채움). 위기 목록은 plan 그대로, 전문가 목록은 design.md 6.2, 금지 표현·허용 예외·상표 목록은 design.md 7.1, SEO 값은 design.md 13장 그대로 | - | `src/features/tarot/types/tarot.type.ts`, `src/features/tarot/constants/cards/major.constant.ts`, `wands.constant.ts`, `cups.constant.ts`, `swords.constant.ts`, `pentacles.constant.ts`, `src/features/tarot/constants/tarot-cards.constant.ts`, `tarot-spread.constant.ts`, `tarot-question.constant.ts`, `tarot-safety.constant.ts`, `tarot-copy-rule.constant.ts`, `tarot-notice.constant.ts`, `tarot-faq.constant.ts`, `tarot-seo.constant.ts` | 입력: design.md 1장, 2장, 3장, 6.2, 7.1, 8장, 12.3(공지 문구), 13장. `docs/research/tarot.md` 4.2(한글 이름). ui-ux-design.md "문구 말투 정리", "컴포넌트 상태"(고정 문구) | `TAROT_CARDS.length === 78`, `TAROT_CARDS[i].id === i`, 마이너 id = 22 + 수트순서×14 + (rank−1). 힘 rank 8, 정의 rank 11, 코트는 페이지·나이트·퀸·킹, 모든 카드에 영문 이름(AC-16). 카드 배열이 `as const satisfies readonly TarotCardType[]`. 위기 목록에 "죽음", "죽겠", "죽을만큼", 단독 "죽" 없음(AC-30). 금지·상표 목록은 화면 코드에서 import하지 않음. 문구 필드가 비어 있는 것은 의도이며 이 상태로 메뉴 등록(FE-8)·배포 금지 | 대기 |
| FE-2 | frontend-dev | 로직. `drawTarotCard`, `drawTarotCards`(부분 Fisher-Yates, 중복 없음, 역방향 옵션 끄면 모두 정방향), 안전 유틸(`normalizeTarotQuestion`, `hasTarotCrisisSignal`, `hasTarotExpertTopic`), 카드 유틸(`getTarotCardById`, `formatTarotCardName`, `getTarotCardAlt`), 오늘의 카드 저장 서비스(`isTarotStorageAvailable`, `readTarotDailyCard`, `writeTarotDailyCard`, 5.3 검증·지연 삭제·덮어쓰기), 질문 훅(`useState` 하나, `maxLength` 100, `slice(0, 100)`, trim 빈값=질문 없음) | FE-1 + SH-1 | `src/features/tarot/utils/tarot-draw.util.ts`, `tarot-safety.util.ts`, `tarot-card.util.ts`, `src/features/tarot/services/tarot-daily-storage.service.ts`, `src/features/tarot/hooks/use-tarot-question.hook.ts` | 입력: design.md 5.1~5.3, 6.1, 6.2, 4.3(alt 규칙), 12.2(`TarotCardReadingComponent` 표시 형식), 14장. ui-ux-design.md "컴포넌트 상태"(질문 입력, 100자 동작) | `@/lib/random`만 사용. 읽기 검증 8가지(JSON 실패, `v !== 1`, 날짜 형식, 다른 날짜, cardId 범위·미등록, isReversed 타입)가 모두 키 삭제 후 `null`이고 예외를 던지지 않음. 값은 항상 키 1개에 덮어쓰기. "죽고 싶", "자.살", "kill myself"는 위기 감지, "죽음 카드", "배고파 죽겠어요"는 비감지. 서비스는 쿠키 동의를 읽지 않음. AC-3, AC-6, AC-7, AC-10, AC-26, AC-29~31, AC-37의 로직 기반 | 대기 |
| FE-3a | frontend-dev | 카드 SVG 순수 컴포넌트 기반. 프레임(테두리, 안쪽선, 번호·이름 자리, 구획선), 뒷면(마름모 격자 + 봉인, 위아래 대칭), 수트 아이콘 4종, 코트 표식(막대 1~4개, 이니셜 없음). 훅·`'use client'`·framer-motion·브라우저 API를 쓰지 않는 서버 렌더 가능 순수 컴포넌트. 접근성 이름은 props로 받은 값만으로 만든다 | FE-1 | `src/features/tarot/shared/components/card-frame.component.tsx`, `card-back.component.tsx`, `suit-icon.component.tsx`, `court-mark.component.tsx` | 입력: design.md 4.1~4.3. ui-ux-design.md "카드 SVG 시각 명세 > 공통 원칙, 마이너 56장, 뒷면", "색상"(카드 그림 잉크·바탕), "접근성"(라벨) | viewBox `0 0 200 340`. 색은 `currentColor`와 `var(--card)`뿐(hex·`dark:` 없음). 뒷면은 `role="img"` + "타로 카드 뒷면". 장미·백합·별자리·눈·오각별 없음. 수트 아이콘이 소드·완드·컵·펜타클로 구분됨. 눈금자(숫자 카드)·막대 수(코트)가 ui-ux 수치대로. R-1 준수(외부 도형 복사 없음). AC-17의 뒷면 부분 | 대기 |
| FE-3b | frontend-dev | 메이저 22장 상징 SVG. 번호별 분기 컴포넌트와 22개 도형(ui-ux 표). 분량이 길면 `major-symbol-0-10`, `major-symbol-11-21`로 나눈다. 0번과 21번이 같은 작은 원으로 짝을 이룸. 죽음은 해골·낫·검은 면 금지, 악마는 뿔·오각별 금지 | FE-1 | `src/features/tarot/shared/components/major-symbol.component.tsx` (필요하면 `major-symbol-0-10.component.tsx`, `major-symbol-11-21.component.tsx` 추가) | 입력: design.md 4.1. ui-ux-design.md "카드 SVG 시각 명세 > 메이저 22장 상징 방향"(22행 표), "공통 원칙"(금지 도안 목록) | 22번호 모두 서로 구분되는 도형이 그려짐. 표의 "도형" 설명과 일치. 금지 도안 목록(두 기둥 인물, 큰 별 1+작은 별 7, 탑·늑대·개 있는 달, 무한대 기호, 오각별 등)에 해당 없음. 사람·동물·장면 없음. R-1 준수. 개별 SVG 미리보기 화면을 새로 만들지 않음(QA-1이 확인) | 대기 |
| FE-3c | frontend-dev | 앞면 조합과 뒤집기 컴포넌트. `TarotCardFaceComponent`(arcana로 메이저/마이너 분기, 숫자 카드·코트 카드 조합, `getTarotCardAlt`로 접근성 이름), `TarotCardComponent`(`'use client'`, framer-motion `rotateY`, 오늘 600ms, 3장 카드당 500ms와 지연 0/120/240, `MotionConfig reducedMotion="user"`에서 150ms opacity 교차, `isFlipping` false면 연출 없이 즉시, `onFlipComplete`, 포커스 받지 않음, 역방향 `rotate-180` + 카드 밖 "역방향" 글자). 이후 FE-5, FE-6에서 이 두 파일을 수정하지 않도록 props를 design.md 4.1 확정값으로 만든다 | FE-3a + FE-3b + FE-2 | `src/features/tarot/shared/components/card-face.component.tsx`, `src/features/tarot/shared/components/tarot-card.component.tsx` | 입력: design.md 4.1, 4.3, 12.2(트리의 "역방향" 글자 위치). ui-ux-design.md "인터랙션·애니메이션"(카드 뒤집기 2행), "컴포넌트 상태"(카드), "카드 SVG 시각 명세 > 역방향", "접근성" | 앞면 접근성 이름이 "{한글 이름} 카드, 정방향/역방향"(AC-17). 78장 모두 그려짐(마이너 56장 포함). 역방향은 그림 상하 반전 + 카드 밖 글자 "역방향"(AC-5). `TarotCardFaceComponent` import 경로에 `'use client'`·framer-motion이 없어 서버에서 import 가능. 동작 줄이기에서 회전 없이 `onFlipComplete`가 불림. 뒤집기 외 추가 모션 없음 | 대기 |
| FE-4a | frontend-dev | 서버 안내 컴포넌트(`'use client'` 없음): 상시 면책(h1 바로 아래용), 결과 하단 면책 + 109 상시 안내(`tel:109`, 접근성 이름 "자살예방 상담전화 109에 전화 연결"), 상세 안내 8항, FAQ(`<dl>` 또는 h3+p, 아코디언 아님), noscript 안내, 오늘의 카드 저장 안내. 문구는 FE-1 상수에서 가져온다 | FE-1 | `src/features/tarot/shared/components/disclaimer-notice.component.tsx`, `result-notice.component.tsx`, `detail-notice.component.tsx`, `faq.component.tsx`, `noscript-notice.component.tsx`, `src/features/tarot/daily/components/storage-notice.component.tsx` | 입력: design.md 7.2, 5.3(저장 안내), 3.4. ui-ux-design.md "화면별 레이아웃 > 공통 머리 영역, 결과 하단 면책 + 109, 가이드·FAQ·상세 안내", "타이포그래피", "색상" | 상시 면책이 `border`가 있는 상자로 h1 바로 아래에 접기·툴팁 없이 표시(AC-22). 결과 하단 면책 + 109가 뽑기 전에도 항상 렌더링(AC-22, AC-28). 모두 JS를 꺼도 HTML에 있음(AC-22, AC-33). 저장 안내 문구가 AC-8 의미와 일치. 상세 안내 제목 h2 "이용 안내", 8항 글머리. 페이지 안에 h1을 만들지 않음 | 대기 |
| FE-4b | frontend-dev | 공용 클라이언트 프레젠테이션 컴포넌트(상태는 부모, Controlled): 카드 읽기(글만: 이름, 방향, 키워드 3개, 요약, `note`, `titleAs` h2/p, `titleRef`), 질문 입력(shadcn `Input`, 라벨, 민감정보 안내, 글자 수, 100자 도달 안내, Enter는 부모 콜백), 역방향 스위치(shadcn `Switch`), 위기 안내 패널(`jar` 면, 109 전화 연결 + 계속 보기, `role="region"` + `aria-labelledby`, 제목 `tabIndex=-1`), 전문가 상담 안내 | FE-1 + FE-2 | `src/features/tarot/shared/components/card-reading.component.tsx`, `question-input.component.tsx`, `reversed-toggle.component.tsx`, `crisis-notice.component.tsx`, `expert-notice.component.tsx` | 입력: design.md 6.1, 6.2, 12.2(`TarotCardReadingComponent` 확정), 12.3. ui-ux-design.md "화면별 레이아웃 > 결과 읽기 블록, 위기 안내 패널, 전문가 상담 안내", "컴포넌트 상태", "타이포그래피", "접근성" | 카드 읽기에 `"{nameKo} ({nameEn})"`, 방향이 이름과 다른 줄, 키워드 3개, 요약, 이미지 없음(AC-4). 죽음 카드에서 보충 문구(AC-20). 질문 입력에 `name` 없음, `autoComplete="off"`, 안내 문구 근처 표시(AC-23). 위기 패널 버튼 순서 "109 전화 연결" → "계속 보기". `dangerouslySetInnerHTML` 없음 | 대기 |
| FE-4c | frontend-dev | 가이드 서버 컴포넌트. 오늘의 타로: 원카드 읽는 법, 정/역방향 설명, 바보 정/역방향 그림(`TarotCardFaceComponent`). 3장 타로: 스프레드 위치 설명, 뒷면 3장 배치도(`TarotCardBackComponent`), 본문에 "쓰리카드 타로" 표현. 이 티켓에서는 본문 문장을 구조 확인용 임시 문구로 두고(주석으로 표시) CT-3b가 최종 문구로 교체한다 | FE-3c | `src/features/tarot/daily/components/guide.component.tsx`, `src/features/tarot/three-card/components/guide.component.tsx` | 입력: design.md 12.2, 4.1(서버/클라이언트 경계), 7.2. ui-ux-design.md "화면별 레이아웃 > 가이드·FAQ·상세 안내", "간격·그리드"(가이드 그림 88/104px) | 서버 컴포넌트(`'use client'`·훅 없음). 그림 크기 88px/104px, 그림 아래 "정방향", "역방향" 글자. 그림이 `role="img"` 이름을 가짐. 본문 줄 길이 `max-w-[68ch]` | 대기 |
| FE-5 | frontend-dev | 오늘의 타로 화면 root와 상태 훅. 리듀서(`checking`/`idle`/`crisis`/`revealed`, 액션 `RESTORE`, `EMPTY`, `DRAW`, `CONTINUE`, `FLIP_DONE`), 마운트 후 `readTarotDailyCard(getKoreaDateKey())`, 뽑기 클릭 시 날짜 키 재계산·즉시 저장, 저장 실패 안내, 재방문 상태 줄, aria-live 공지, 버튼 disabled(`isFlipping`), 공개 후 포커스 이동, 모바일 공개 직후 스크롤, 스켈레톤. 데스크톱 2열 | FE-2 + FE-3c + FE-4a + FE-4b | `src/features/tarot/daily/components/root.component.tsx`, `src/features/tarot/daily/hooks/use-daily-reading.hook.ts` | 입력: design.md 5.3(흐름), 12.2(트리), 12.3(리듀서 타입 확정). ui-ux-design.md "화면별 레이아웃 > 오늘의 타로"(상태별 화면, 모바일·데스크톱), "컴포넌트 상태", "인터랙션·애니메이션", "접근성"(탭 순서, 포커스) | AC-1~AC-8, AC-20, AC-23~AC-31, AC-37 구현. 서버 HTML과 첫 클라이언트 렌더가 같음(hydration 오류 없음). 재방문 복원은 연출·포커스 이동 없음. 재뽑기 버튼 없음. 질문은 카드 선택에 영향 없고 새로고침 시 비어 있음. `FLIP_DONE`이 `onFlipComplete`로만 발생. `TarotCardComponent`, `TarotCardReadingComponent` 수정 없음 | 대기 |
| FE-6 | frontend-dev | 3장 타로 화면 root, 상태 훅, 분야 칩, 결과 묶음. 리듀서(`idle`/`crisis`/`revealed`, 액션 `DRAW`, `CONTINUE`, `FLIP_DONE`, `RESET`), 분야 칩(단일 선택 토글, 같은 칩 다시 누르면 다음 예시, `aria-pressed`, `role="group"`), 위치 이름(idle부터 카드 위 글자, 결과에서 h3), sr-only h2 "세 장의 결과", "다시 뽑기"(idle 복귀, 카드 즉시 뒷면, 포커스 "세 장 뽑기"), 재뽑기 안내 문구(뽑기 버튼 아래·다시 뽑기 아래), 데스크톱 3열 | FE-2 + FE-3c + FE-4a + FE-4b | `src/features/tarot/three-card/components/root.component.tsx`, `src/features/tarot/three-card/components/topic-chips.component.tsx`, `src/features/tarot/three-card/components/spread-result.component.tsx`, `src/features/tarot/three-card/hooks/use-three-card-reading.hook.ts` | 입력: design.md 5.2, 12.2(트리), 12.3. ui-ux-design.md "화면별 레이아웃 > 3장 타로"(모바일·데스크톱 배치, 칩, 재뽑기), "컴포넌트 상태"(분야 칩), "인터랙션·애니메이션"(3장 행), "접근성"(탭 순서) | AC-9~AC-14의 화면 동작, AC-2, AC-3, AC-10, AC-23~AC-26, AC-29~AC-31 구현. 문서 순서가 h2 "세 장의 결과" → h3 과거 → 현재 → 미래(모바일·데스크톱). 카드 이미지는 무대 자리에 한 번만. 3장 결과를 어떤 저장소에도 쓰지 않음(AC-25). `TarotCardComponent`, `TarotCardReadingComponent` 수정 없음 | 대기 |
| FE-7a | frontend-dev | 오늘의 타로 페이지. 기존 ComingSoon 파일을 통째로 교체: 서버 컴포넌트, `buildMetadata`(SEO 상수), noindex 제거, `JsonLdComponent`(Breadcrumb 3단계 + FAQ), `TitleWrapperComponent`(h1, description), 12.2 트리 순서로 조립 | FE-5 + FE-4a + FE-4c | `src/app/tarot/daily/page.tsx` | 입력: design.md 12.1, 12.2, 13장(title, description, keywords, og alt, Breadcrumb D5). ui-ux-design.md "화면별 레이아웃 > 공통 머리 영역", "오늘의 타로" | `ComingSoonComponent`와 `robots` noindex 제거. title·description·canonical·OG 존재(AC-32). h1 하나(AC-34). Breadcrumb 홈 > 타로(`/tarot/daily`) > 오늘의 타로. FAQ JSON-LD가 화면 FAQ와 같은 상수. JS를 꺼도 설명·면책이 HTML에 있음(AC-33). 광고 슬롯 추가 없음 | 대기 |
| FE-7b | frontend-dev | 3장 타로 페이지 신규. 같은 방식(서버 컴포넌트, 메타데이터, JSON-LD, 조립). h1은 "3장 타로 (과거·현재·미래)" | FE-6 + FE-4a + FE-4c | `src/app/tarot/three-card/page.tsx` | 입력: design.md 12.1, 12.2, 13장. ui-ux-design.md "화면별 레이아웃 > 공통 머리 영역, 3장 타로" | AC-14(페이지 이름), AC-32~AC-34 충족. 본문에 "3장 타로"와 "쓰리카드 타로" 표현 모두 있음. Breadcrumb 홈 > 타로(`/tarot/daily`) > 3장 타로(`/tarot/three-card`) | 대기 |
| FE-8 | frontend-dev | 메뉴 등록. 타로 그룹 `comingSoon` 삭제(그룹 href `/tarot/daily` 유지), 항목 "3장 타로 (과거·현재·미래)" 추가(design.md 13장 값 그대로), 오늘의 타로 `colorClass`를 `text-violet-600`에서 `text-menu-tarot`로, `MENU_ICONS`에 `Layers` 추가(오늘의 타로는 `Moon` 유지). `src/app/sitemap.ts`는 수정하지 않는다. 다른 기능의 메뉴 작업과 동시에 하지 않는다 | FE-7a + FE-7b + CT-2 + CT-3a (공통: 문구가 빈 채로 노출 금지) | `src/constants/menu.constant.ts`, `src/constants/menu-icon.constant.ts` | 입력: design.md 13장(MENU_LIST 수정), 17장. ui-ux-design.md "화면별 레이아웃 > 메뉴·허브 노출" | 메뉴에서 타로가 "준비 중"으로 표시되지 않음(AC-35). 두 항목 라벨이 "오늘의 타로", "3장 타로 (과거·현재·미래)"(AC-14). `/sitemap.xml`에 `/tarot/daily`, `/tarot/three-card` 포함(`curl`로 확인). `text-violet-600` 제거, 새 색은 `text-menu-tarot`만. 메뉴 설명·예시가 명사형 | 대기 |

### 4.5 콘텐츠 (카드 문구, 메인 세션(Claude)이 작성, 사용자가 검수)

공통 규칙 R-1, R-2 적용. 이 티켓들은 에이전트가 아니라 메인 세션이 직접 한다. 작성 중에는 웹 검색과 외부 해석 문장 참조를 하지 않는다. 문구 형식은 plan "콘텐츠 제작 원칙 > 해석 문구"다: 카드당 정방향 키워드 3개 + 요약 1~2문장, 역방향 키워드 3개 + 요약 1~2문장, 합니다체, "~일 수 있습니다" 형태.

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| CT-1 | 메인 세션(Claude) | 메이저 22장 샘플 작성. 역방향은 "정반대"가 아니라 막힘·지연·내면·과잉 중 카드에 맞는 렌즈 하나. 불안을 줄 수 있는 카드(죽음, 탑, 악마)는 "끝, 전환, 돌아볼 신호"로 완화하고 죽음의 `note`가 plan 문구와 같은지 확인. `docs/tarot/copy-log.md`를 새로 만든다: 상단에 작성 원칙(외부 해석 문장 미참조, 톤, 역방향 렌즈, 금지 표현)과 웹 검색 샘플 확인 기록 칸, 표는 design.md 3.3 형식(id, 카드 이름, 작성자, 작성일, 검수자, 검수일, 상태, 웹 검색 샘플 확인). 22장 행의 작성자는 "AI(Claude, 메인 세션)", 상태는 "초안". 작성 후 `tarot-copy-rule.constant.ts`의 금지·상표 목록으로 Grep 자체 점검. 끝나면 PM이 사용자에게 샘플을 보고하고 [정지] | FE-1 | `src/features/tarot/constants/cards/major.constant.ts`(문구 필드만), `docs/tarot/copy-log.md` (신규) | 입력: plan.md "콘텐츠 제작 원칙", "표현 규칙", 결정 3. design.md 3.1, 3.3, 7.1. 디자인 명세 없음 | 22장 모두 키워드 3개×2, 요약 1~2문장×2가 비어 있지 않음. 금지 표현 0건. 합니다체. 죽음 `note`가 있음(AC-20). copy-log에 22행 작성자·작성일 기록(AC-21). **[정지] 사용자 검수와 톤 확정 전에는 CT-2, CT-3b 최종 반영, CT-4로 넘어가지 않는다.** 사용자가 고친 톤은 copy-log 상단에 기록하고 검수 완료 행은 검수자 "사용자", 검수일, 상태 "검수 완료"로 바꾼다 | 대기 |
| CT-2 | 메인 세션(Claude) | 마이너 56장(완드, 컵, 소드, 펜타클) 작성. CT-1에서 사용자가 확정한 톤을 그대로 쓴다. 완화가 필요한 카드(소드 3, 소드 9, 소드 10)를 CT-1의 방식으로 쓴다. copy-log에 56행 추가. 문장 끝 표현이 78장 사이에서 반복되지 않게 점검 | CT-1(검수) | `src/features/tarot/constants/cards/wands.constant.ts`, `cups.constant.ts`, `swords.constant.ts`, `pentacles.constant.ts`(문구 필드만), `docs/tarot/copy-log.md` | 입력: CT-1과 같음 + CT-1 검수에서 확정된 톤(copy-log 상단) | 56장 모두 비어 있지 않음(AC-15, 78장 합계). 금지 표현 0건, 합니다체. copy-log에 56행. 이 시점에 사용자 검수 요청 여부는 사용자가 정한다(plan은 샘플 검수만 요구). 외부 문장 참조 기록 없음 | 대기 |
| CT-3a | 메인 세션(Claude) | 위치 안내 한 줄(과거·현재·미래), 분야 칩 질문 예시(분야당 2개 이상, 투자·도박·복권·로또 예시 금지), FAQ(오늘의 타로, 3장 타로 각각 plan "페이지가 답할 질문"에서 선택. 질문은 "~입니까?" 형태, 답변은 합니다체와 "~일 수 있습니다"). CT-1 사용자 검수를 기다리는 동안 초안을 쓸 수 있고, 검수에서 톤이 바뀌면 그 톤으로 다시 맞춘다 | FE-1(착수), 최종 반영은 CT-1(검수) | `src/features/tarot/constants/tarot-spread.constant.ts`, `tarot-question.constant.ts`, `tarot-faq.constant.ts`(문구 필드와 배열 내용만) | 입력: plan.md "검색 노출 > 페이지가 답할 질문", AC-11, AC-12. design.md 3.4, 13장(FAQ 말투). ui-ux-design.md "3장 타로 > 위치 안내 예시", "문구 말투 정리" | 위치 3개 모두 안내 문장 있음(AC-9). 분야 4개 모두 예시 있음(AC-11). 투자 종목·매수 시점·복권·도박·로또 번호 예시 없음(AC-12). FAQ 각 페이지 3개 이상, 답변에 단정 없음. 금지 표현 0건, 합니다체. copy-log 상단에 작성 이력 한 줄 | 대기 |
| CT-3b | 메인 세션(Claude) | 가이드 본문 작성: 오늘의 타로(원카드 읽는 법, 정/역방향 설명), 3장 타로(위치별 의미, "쓰리카드 타로" 표현 포함). 페이지당 가이드 + FAQ를 합쳐 한국어 약 600자 이상. FE-4c의 임시 문구를 교체한다. 본문 위치는 design.md가 상수 파일을 정하지 않았으므로 가이드 컴포넌트 파일 안에 둔다(4.6 참고) | FE-4c + CT-1(검수) | `src/features/tarot/daily/components/guide.component.tsx`, `src/features/tarot/three-card/components/guide.component.tsx`(본문 문장만) | 입력: plan.md "검색 노출", design.md 12.2(설명 콘텐츠 600자). ui-ux-design.md "가이드·FAQ·상세 안내" | 각 페이지 가이드 + FAQ 합 600자 이상. 두 표현("3장 타로", "쓰리카드 타로") 모두 3장 타로 페이지에 있음. 금지 표현 0건, 합니다체, Rider-Waite 계열 명칭 없음. 구조·클래스·그림 코드는 바꾸지 않고 문장만 교체 | 대기 |
| CT-4 | researcher | 웹 검색 샘플 확인. CT-2, CT-3a, CT-3b가 끝난 뒤 대표 문장 샘플을 따옴표 검색으로 찾아 같거나 거의 같은 문장이 있는지 확인한다. 샘플 규모(제안): 메이저 8장, 마이너 수트별 4장(요약 문장 위주), FAQ·가이드·위치 안내에서 각 2문장 이상. 일치가 나오면 해당 문장을 copy-log에 "일치 있음, 출처 URL"로만 기록하고 외부 문장을 그대로 옮겨 적지 않는다. 수정은 메인 세션이 외부 문장을 보지 않고 처음부터 다시 쓰고, 고친 문장은 다시 확인한다 | CT-2 + CT-3a + CT-3b | `docs/tarot/copy-log.md`(웹 검색 샘플 확인 기록과 카드별 확인 칸만 수정) | 입력: plan.md 결정 3, "위험과 수용 사항 > 문구 우연 일치". design.md 3.3. 디자인 명세 없음 | 검색한 문장, 날짜, 결과가 copy-log에 남음. 일치 없음 또는 "수정함 + 재확인 결과"로 모든 샘플이 닫힘. 카드 행의 "웹 검색 샘플 확인" 칸이 "해당 없음 / 일치 없음 / 수정함" 중 하나. 전수 검사는 아님을 기록에 명시(AC-21) | 대기 |

### 4.6 문서 갱신

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| DOC-1 | frontend-dev | 개인정보처리방침과 이용약관 갱신. 처리방침 1장 "수집 항목 및 방법"에 타로 질문은 서버로 전송·저장하지 않는다는 한 문장, 2장 "브라우저 저장소 사용" 목록에 오늘의 타로 항목(날짜·카드 번호·정/역방향, 다음 날 방문 시 자동 삭제, 브라우저 설정에서 삭제 가능), 시행일 `EFFECTIVE_DATE` 갱신. 약관 1장 "서비스 개요"에 타로 언급, 새 장 "타로 서비스"(오락·자기 성찰, 결과는 미래를 보장하지 않음, 전문가 상담 권고, 덱 제작사·출판사와 비제휴, 오늘의 카드는 기기 기준 저장), 장 번호가 밀리면 같이 수정, 시행일 갱신. 시작 전에 기존 문구를 읽고 충돌이 있으면 고치지 말고 PM에 보고한다(plan "출시 전 확인 항목") | - | `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` | 입력: design.md 15장 표(갱신 대상). plan.md "법적·정책 요구사항 > 개인정보 수집", "상세 안내". 디자인 명세는 기존 두 페이지의 스타일을 그대로 따름(새 화면 없음) | 위 문장이 합니다체로 들어감. 저장 항목이 날짜, 카드 번호, 방향으로 한정됨. 비제휴·비보증, 오락 목적 문구 있음. 기존 문구 삭제·훼손 없음. 시행일이 갱신됨. R-2 준수 | 대기 |
| DOC-2 | 메인 세션(PM) | `COMPLIANCE.md` 1장 "Cookies, Consent, Privacy"에 타로 localStorage 항목(키 1개, 다음 날 방문 시 자동 삭제), 질문 비저장, 쿠키 동의와 무관하게 동작을 추가. 11장 "Disclaimers"에 타로 고지(오락·참고용: h1 아래 상시 + 결과 하단, 비제휴, 위기 안내 109와 재확인 날짜 칸, 서버 저장 없음, 금지 표현 목록 위치 `tarot-copy-rule.constant.ts`)를 추가, "Last updated" 갱신. `README.md` "기능" 절에 타로 메뉴 2개를 추가하고 환경변수·API·테이블 표는 변경 없음을 확인 | - (문구는 FE-1 상수와 맞춘다) | `COMPLIANCE.md`, `README.md` (저장소 루트, agent 범위 밖이라 메인 세션이 직접 수정) | 입력: design.md 15장 표, plan.md "법적·정책 요구사항". 형식은 `COMPLIANCE.md` 기존 형식 | 위 항목이 모두 반영됨. 109 번호·확인 날짜가 출시 전 재확인 대상으로 표시됨. 새 환경변수·API·테이블이 없다는 점이 README와 일치 | 대기 |
| DOC-3 | 메인 세션(PM) | `THIRD_PARTY_NOTICES.md`에 새 절 "Original artwork and content": 카드 SVG 78장 + 뒷면은 자체 제작(코드로 작성, 제작 주체, 제작일, 자체 저작물), 외부 덱 이미지·아이콘 세트·AI 이미지 생성 도구 미사용. 해석 문구는 자체 작성(작성 AI, 검수 사용자), 이력은 `docs/tarot/copy-log.md`. `DEPENDENCY_LICENSES.md`는 새 의존성이 없는지 `package.json` diff로 확인만 하고 바꾸지 않는다 | FE-3c + CT-4 (실제 제작일·검수 결과를 적기 위해) | `THIRD_PARTY_NOTICES.md` (저장소 루트, 메인 세션이 직접 수정) | 입력: design.md 15장 표, 4.1. plan.md "콘텐츠 제작 원칙 > 이미지" | AC-21: 이미지 자체 제작 이력이 기록됨. 외부 덱 이미지 파일이 저장소에 없음(`public/`, `src/`에 카드 이미지 파일 0건). `package.json` 의존성 변경 없음 | 대기 |

### 4.7 QA (qa, 앱 코드 수정 금지, `e2e/`와 `docs/tarot/`에만 쓴다)

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| QA-1 | qa | `e2e/tarot.spec.ts`: plan AC-1~AC-37(AC-18, AC-19, AC-15, AC-16, AC-12는 QA-2가 맡고 여기서는 화면 확인만)과 design.md 5.3 테스트 관점 4가지. 데스크톱·모바일 둘 다 실행. 아래 "QA 입력 메모"를 따른다 | FE-8 + CT-4 + QA-0(2) 통과 | `e2e/tarot.spec.ts`, `docs/tarot/qa-report.md` | 입력: plan.md AC 전체, ui-ux-design.md "상태별 화면", "컴포넌트 상태", "접근성", "문구 말투 정리", design.md 5.3, 12.3, dev-tasks.md | AC별 통과/실패 표. 실패 원인·재현 방법·담당(frontend-dev 또는 CT 담당=메인 세션) 기록. 공통 검사(응답 400 미만, `pageerror` 없음, h1 하나, title·description). 78장 앞면·뒷면 확인(AC-17)과 78장 스크린샷을 `test-results/`에 저장해 PM이 금지 도안 목록과 대조할 수 있게 함 | 대기 |
| QA-2 | qa | `e2e/tarot-copy.spec.ts`: 표현 규칙 검사와 합니다체 통일 검사(D4). 아래 "QA 입력 메모"를 따른다 | FE-8 + CT-4 + DOC-1 (작성은 FE-1 이후 가능) | `e2e/tarot-copy.spec.ts`, `docs/tarot/qa-report.md` | 입력: design.md 7.1, 13장, plan.md "표현 규칙", AC-12, 15, 16, 18, 19, 21, ui-ux-design.md "문구 말투 정리" | 금지 표현 0건(예외는 면책 허용 문장뿐), 상표 명칭 0건, 합니다체 통일 확인, 카드 78장 필드 검사, 외부 이미지 파일 0건. 실패 문구는 CT 담당(메인 세션)에, 코드 문제는 frontend-dev에 되돌림 | 대기 |

QA 입력 메모 (QA-1, QA-2 공통)
- 화면 문구를 인용한 AC(AC-8, AC-11, AC-13, AC-20, AC-22, AC-28 등)는 문구 일치가 아니라 의미 기준으로 검사한다. 합니다체로 바뀐 확정 문구는 ui-ux-design.md "문구 말투 정리"가 기준이다. 예: "저장됩니다"와 "다른 기기에서는 다른 카드가 나올 수 있다는 뜻"이 있으면 AC-8 통과.
- 표현 규칙 검사(QA-2): 대상은 `TAROT_CARDS` 78장 전 필드, FAQ 상수, 고지 문구, 분야 예시, 위치 안내, 메뉴의 타로 항목, SEO 상수, 그리고 `/tarot/daily`, `/tarot/three-card`의 서버 HTML(본문, title, description, OG, JSON-LD). 금지 표현과 상표 명칭은 `tarot-copy-rule.constant.ts`의 목록을 쓴다. 예외 문장은 `TAROT_COPY_ALLOWED_SENTENCES`만 먼저 지우고 검사한다. 화면 코드가 이 상수를 import하지 않았는지도 확인한다.
- 합니다체 통일 검사(QA-2): 문장 끝이 해요체("~요", "~죠", "~세요", "~예요", "~에요")이거나 "~인가요?" 형태인 문장을 찾는다. 명사형 짧은 라벨(버튼, 칩, 제목, 메뉴, title, OG alt)은 대상이 아니다. 정규식 결과는 자동 실패로 삼지 않고 QA가 문맥을 보고 의미 기준으로 판정해 후보 목록으로 보고한다(예: "중요", "필요" 같은 단어 끝 오탐).
- 78장 앞면 검사(QA-1): 오늘의 카드 localStorage 키를 직접 만들어 넣는 방식이 가장 단순하다. `.env` 파일을 읽지 않는다. 한 번 뽑은 뒤 `_tarot_daily_v1`로 끝나는 키 이름을 찾아 쓰고, 값은 `{ v: 1, date: <오늘 KST>, cardId, isReversed }`로 덮어쓴다. 접근성 이름은 `getByRole('img', { name })`으로 확인한다.
- 무작위 결과는 값이 아니라 형식과 개수로 검사한다(AC-10은 3장이 서로 다른지). 고정 대기(`waitForTimeout`)를 쓰지 않는다. JS 비활성은 `javaScriptEnabled: false` 컨텍스트, 쿠키 동의 거절은 동의 안내에서 거절한 상태, KST 날짜는 `timezoneId`와 `page.clock`으로 확인한다. 네트워크 검사(AC-24, AC-30)는 `page.on('request')`로 질문 문자열이 URL·본문에 없는지, 위기 감지 시 요청이 없는지 본다.
- 5.3 테스트 관점: 어제 날짜 유효값, 손상값 4종(JSON 아님, `v` 불일치, `cardId` 78 이상, `isReversed` 문자열), 오늘 유효값 유지, 타로 관련 키 1개 유지.
- 소스 검사(AC-18, AC-21): `src/features/tarot/`, `src/app/tarot/`, `public/`에서 상표 명칭을 찾되 검사 목록 파일 `tarot-copy-rule.constant.ts`와 기존 `src/features/tarot/tarot-dev-guide.md`는 제외한다. 카드 이미지 파일(png, jpg, webp, svg 파일)이 없는지 확인한다.

## 5. 실행 순서

1. 단계 0 (착수, 서로 파일이 겹치지 않아 모두 병렬)
   - SH-1 (backend-dev), FE-1 (frontend-dev), QA-0 기준선 실행 (qa), DOC-1 (frontend-dev), DOC-2 (메인 세션)
2. 단계 1
   - SH-2 (SH-1과 QA-0 기준선 기록 뒤, 단독으로 로또 파일을 수정) → QA-0(2) 전후 비교
   - FE-2 (FE-1과 SH-1 뒤), FE-3a, FE-3b, FE-4a (FE-1 뒤)
   - CT-1 (FE-1 뒤) → 끝나면 PM이 사용자에게 샘플 보고 → [정지: 사용자 검수와 톤 확정]
   - CT-3a 초안 (FE-1 뒤, 사용자 검수를 기다리는 동안 진행)
3. 단계 2
   - FE-3c (FE-3a, FE-3b, FE-2 뒤), FE-4b (FE-1, FE-2 뒤)
4. 단계 3
   - FE-4c (FE-3c 뒤)
   - FE-5, FE-6 (FE-2, FE-3c, FE-4a, FE-4b 뒤, 서로 병렬)
   - CT-2 (사용자 검수 완료 뒤)
5. 단계 4
   - FE-7a (FE-5와 FE-4c 뒤), FE-7b (FE-6과 FE-4c 뒤)
   - CT-3b (FE-4c와 사용자 검수 완료 뒤), CT-3a 톤 최종 반영
6. 단계 5
   - CT-4 (CT-2, CT-3a, CT-3b 뒤). 일치 문장은 메인 세션이 고치고 재확인
   - FE-8 (FE-7a, FE-7b, CT-2, CT-3a 뒤)
   - DOC-3 (FE-3c, CT-4 뒤)
7. 단계 6
   - QA-1, QA-2 (FE-8, CT-4, DOC-1, QA-0(2) 통과 뒤). 실패 항목은 해당 담당에 되돌리고 고친 뒤 qa를 다시 호출
8. 단계 7: PM 검증. QA 결과와 각 티켓 완료 조건, 디자인 명세 일치, 보안(시크릿·저장소·입력 검증), 라이선스(R-1), 법적 고지 반영, 새 페이지 메타데이터·JSON-LD·sitemap, 78장 스크린샷의 금지 도안 대조. 이어서 사용자 보고

의존 관계 요약: SH-1 → SH-2 → QA-0(2) / FE-1 → (FE-2, FE-3a, FE-3b, FE-4a, CT-1, CT-3a) → FE-3c, FE-4b → FE-4c, FE-5, FE-6 → FE-7a, FE-7b → FE-8 → QA / CT-1(검수) → CT-2, CT-3b → CT-4 → DOC-3, QA.

## 6. 동시 실행 가능

- 단계 0의 5개 티켓은 파일이 겹치지 않는다(`src/lib`, `src/features/tarot/types·constants`, `e2e/` 읽기 전용 실행, `src/app/privacy·terms`, 루트 문서).
- 단계 1의 FE-2, FE-3a, FE-3b, FE-4a는 서로 다른 파일이라 병렬로 돌려도 된다. SH-2는 로또 파일만 만지므로 이들과 병렬이다.
- FE-5와 FE-6은 파일이 겹치지 않아 병렬이다(공용 컴포넌트는 FE-3c, FE-4b에서 끝난 상태여야 함).
- FE-7a와 FE-7b는 서로 다른 `page.tsx`라 병렬이다.
- 콘텐츠(CT)는 코드 티켓과 파일이 다르므로(문구 필드만) FE-1 이후 코드 티켓과 병렬로 진행한다. 단 같은 `constants/cards/*.constant.ts`에 대해 FE-1과 CT가 동시에 작업하지 않는다.
- QA-1과 QA-2는 파일이 달라 작성은 병렬이다. 실행은 같은 개발 서버 포트를 쓰므로 순서대로 한다.
- 순서가 필요한 것: SH-1 → SH-2 → QA-0(2), FE-1 → 나머지 전부, FE-3a·3b → FE-3c → FE-4c·FE-5·FE-6, CT-1 → [정지] → CT-2·CT-3b, CT-2·CT-3a·CT-3b → CT-4 → DOC-3, FE-7a·7b + CT-2 + CT-3a → FE-8 → QA.

## 7. 충돌 위험

- `src/lib/random.ts`, `src/lib/date.ts`: SH-1에서만 수정. 다른 작업이 `date.ts`를 동시에 고치지 않는다.
- 로또 파일 3개와 `random.util.ts`, `LOTTO-REFACTOR.md`: SH-2에서만 수정하고 그동안 다른 로또 작업을 하지 않는다. QA-0 기준선을 받기 전에 SH-2를 시작하면 비교가 불가능하므로 순서를 지킨다.
- `constants/cards/*.constant.ts`: FE-1이 뼈대를 만든 뒤 CT-1(메이저), CT-2(마이너)가 문구 필드만 수정한다. FE-1 이후 frontend-dev는 이 파일을 다시 고치지 않는다. 고쳐야 하면 CT 진행 중이 아닐 때 PM에 요청한다.
- `tarot-faq.constant.ts`, `tarot-spread.constant.ts`, `tarot-question.constant.ts`: FE-1(구조)과 CT-3a(문구). FE-1 먼저. `tarot-notice.constant.ts`는 FE-1이 확정 문구를 옮기고 CT는 고치지 않는다(고지 문구 변경은 사용자 승인 사항).
- `daily/components/guide.component.tsx`, `three-card/components/guide.component.tsx`: FE-4c(구조)와 CT-3b(문장). FE-4c 먼저. CT-3b는 문장만 교체.
- `shared/components/tarot-card.component.tsx`, `card-face.component.tsx`, `card-reading.component.tsx`: FE-3c, FE-4b에서 완성하고 FE-5, FE-6은 수정하지 않는다. 수정이 꼭 필요하면 한쪽 티켓에서만 고치고 다른 쪽은 그 뒤에 진행한다.
- `src/constants/menu.constant.ts`, `menu-icon.constant.ts`: 모든 기능이 쓰는 공용 파일. FE-8에서만 수정하고 다른 기능(운세, 점심 등)의 메뉴 작업과 동시에 하지 않는다.
- `src/app/tarot/daily/page.tsx`: FE-7a만 수정(기존 ComingSoon 파일을 통째로 교체).
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`: DOC-1만 수정. `COMPLIANCE.md`, `README.md`, `THIRD_PARTY_NOTICES.md`: DOC-2, DOC-3만 수정(메인 세션).
- `docs/tarot/copy-log.md`: CT-1 → CT-2 → CT-3a → CT-4 순서로만 수정. CT-4(researcher)는 CT 작성이 끝난 뒤 시작한다.
- `docs/tarot/qa-report.md`: QA-0, QA-1, QA-2가 순서대로 이어 쓴다. 동시에 쓰지 않는다.
- `src/app/layout.tsx`: 작업 트리에 커밋되지 않은 수정(주석 1줄 삭제)이 있다. 타로 작업은 이 파일을 고치지 않는다. `src/app/sitemap.ts`도 수정하지 않는다.
- `package.json`, `pnpm-lock.yaml`: 새 의존성이 없으므로 수정하지 않는다. 바뀌면 R-1 위반 가능성이 있어 PM에 보고한다.

## 8. AC 대응표

| AC | 구현 티켓 | 검증 |
|---|---|---|
| AC-1 | FE-2, FE-5 | QA-1 |
| AC-2 | FE-2(훅), FE-4b, FE-5, FE-6 | QA-1 |
| AC-3 | FE-2, FE-4b, FE-5, FE-6 | QA-1 |
| AC-4 | FE-4b, FE-5 | QA-1 |
| AC-5 | FE-3c, FE-5 | QA-1 |
| AC-6 | FE-2, FE-5 | QA-1 |
| AC-7 | SH-1, FE-2, FE-5 | QA-1 |
| AC-8 | FE-4a, FE-7a | QA-1(의미 기준) |
| AC-9 | FE-6, CT-3a | QA-1 |
| AC-10 | FE-2, FE-6 | QA-1 |
| AC-11 | FE-6, CT-3a | QA-1(의미 기준) |
| AC-12 | CT-3a | QA-2 |
| AC-13 | FE-6 | QA-1(의미 기준) |
| AC-14 | FE-7b, FE-8 | QA-1 |
| AC-15 | CT-1, CT-2, FE-1 | QA-2 |
| AC-16 | FE-1 | QA-2 |
| AC-17 | FE-3a, FE-3c | QA-1 |
| AC-18 | R-1, 전 티켓 | QA-2 |
| AC-19 | R-2, CT 전체, FE-1 | QA-2 |
| AC-20 | FE-1, CT-1, FE-4b | QA-1, QA-2 |
| AC-21 | FE-3a~c(외부 파일 없음), CT-1~CT-4, DOC-3 | QA-2 |
| AC-22 | FE-4a, FE-7a, FE-7b | QA-1 |
| AC-23 | FE-4b | QA-1 |
| AC-24 | R-3, FE-2, FE-5, FE-6, BE-0 | QA-1 |
| AC-25 | FE-2, FE-5, FE-6 | QA-1 |
| AC-26 | FE-2, FE-5, FE-6 | QA-1 |
| AC-27 | FE-2, FE-5, FE-6 | QA-1 |
| AC-28 | FE-4a | QA-1 |
| AC-29 | FE-2, FE-4b, FE-5, FE-6 | QA-1 |
| AC-30 | FE-1(목록), FE-2, FE-5, FE-6 | QA-1 |
| AC-31 | FE-2, FE-4b, FE-5, FE-6 | QA-1 |
| AC-32 | FE-1(SEO 상수), FE-7a, FE-7b | QA-1 |
| AC-33 | FE-4a, FE-4c, FE-7a, FE-7b | QA-1 |
| AC-34 | FE-7a, FE-7b | QA-1 |
| AC-35 | FE-8 | QA-1 |
| AC-36 | FE-5, FE-6 | QA-1(데스크톱·모바일) |
| AC-37 | FE-2, FE-5 | QA-1 |

## 9. 사용자 확인 필요 지점

필수 (정지 또는 출시 조건)
1. **CT-1 후 메이저 22장 샘플 검수와 톤 확정**: plan 결정 3. 사용자가 확정하기 전에 CT-2(나머지 56장), CT-3b, CT-4로 넘어가지 않는다. 단계 1에서 반드시 멈춘다.
2. **자살예방상담전화 109 번호와 24시간 운영 재확인**: 출시 직전. 문구는 `tarot-notice.constant.ts` 한 곳에만 있다. 재확인한 날짜를 `COMPLIANCE.md`(DOC-2)에 적는다. 이 번호 확인은 사용자가 직접 하거나 researcher에게 시킨다.
3. **고지 문구 최종 확정**: plan "출시 전 확인 항목". FE-1이 plan 초안을 그대로 옮기므로 바꾸려면 사용자 승인이 필요하다.
4. **개인정보처리방침·이용약관 기존 문구 확인**: DOC-1 시작 전 기존 문구를 읽어 충돌이 있으면 PM이 사용자에게 보고한다(plan "출시 전 확인 항목").
5. **CT-4 웹 검색 샘플 규모와 일치 시 처리**: 이 문서는 샘플 규모를 제안했다(메이저 8장, 수트별 4장, 가이드·FAQ 등). 규모를 바꾸거나 일치 문장 처리 방식에 이견이 있으면 알려 주어야 한다.
6. **운영 배포**: 사용자 확인 뒤에만 한다. 출시 후 AdFit 승인 상태를 확인한다(plan 위험 항목).

권장
7. **78장 카드 그림 눈으로 확인**: QA-1이 만든 78장 스크린샷을 PM이 금지 도안 목록과 대조하고 사용자가 한 번 훑어보기를 권한다. 도형이 마음에 들지 않으면 FE-3a~3c만 되돌려 고친다(plan "이미지 몰입감" 위험은 이미 수용됨).
8. **에이전트 범위 밖 파일의 담당**: 이 문서는 DOC-2, DOC-3과 카드 문구(CT)를 메인 세션이 직접 하는 것으로 정했다. 대신 agent 범위를 넓히거나 다른 담당에게 맡기려면 사용자가 정해야 한다(설정은 이 문서가 바꾸지 않는다). CLAUDE.md의 "직접 코드를 짜지 않는다"는 문구 데이터 입력까지 금지하는 뜻인지도 확인이 필요하다.
9. **위기 감지 목록·전문가 상담 목록**: plan 승인 때 함께 승인됐고 사용자가 추가·삭제할 수 있다. 문구 검수 때 필요하면 같이 본다.

## 10. 상위 문서에 되돌릴 항목 (진행을 막지는 않음)

- architect: (a) 가이드 본문의 위치가 design.md에 정해져 있지 않다. 이 문서는 가이드 컴포넌트 파일 안에 두기로 했다(CT-3b). 상수 파일로 빼려면 design.md 1장에 파일 추가가 필요하다. (b) "역방향" 글자를 `TarotCardComponent`가 함께 그리는지(design.md 4.1) root가 형제로 그리는지(12.2 트리)가 다르게 읽힌다. FE-3c가 3장 타로의 요건(위치 이름 → 카드 → 역방향 글자 → 위치 안내 순서)을 만족하는 방향으로 정해 보고하고, FE-5·FE-6은 그 결과를 그대로 쓴다. 어긋나면 architect에 확인한다.
- ui-ux-designer: 없음.
