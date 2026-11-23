# lucky-draw 설계서

입력: `docs/lucky-draw/plan.md` (승인 2026-11-23, "사용자 확인 필요" 17개 모두 권장안대로. 2026-11-23 개정안 반영: AC-23~AC-26d, AC-29~AC-32, AC-31a, AC-35, AC-43, AC-48, 확인 18~22번)

참고: `docs/lucky-draw/status.md`, `docs/research/lucky-draw.md` 5장(공정성, 사다리 알고리즘), `docs/conventions/code-style.md`, `docs/conventions/data-storage.md`, `docs/conventions/seo.md`, `docs/roulette-common/plan.md`, `src/components/common/roulette.component.tsx`, `src/constants/menu.constant.ts`, `src/features/lucky-draw/lots/`(구현됨, 카드 방식과 맞지 않음), `docs/lucky-draw/ui-ux-design.md`(2026-11-23 개정안, 제비뽑기·돌림판 가림 절), `docs/menu-meals/design.md`(형식 참고)

작성일: 2026-11-23. 개정: 2026-11-23(구현 후 사용자 결정 2건 반영, 맨 아래 "변경 기록"). 상태: 변경 반영, 승인 대기. 코드, 규칙 문서, 약관, 방침, COMPLIANCE.md, `docs/roulette-common/`은 고치지 않았다.

## 0. 요약

- 허브 `/lucky-draw` 한 개와 도구 페이지 세 개(`/lucky-draw/ladder`, `/lucky-draw/roulette`, `/lucky-draw/lots`)를 만든다. 페이지는 서버 컴포넌트이고, 도구마다 `'use client'` root 컴포넌트 하나만 클라이언트 경계로 둔다.
- 서버, API, DB, 브라우저 저장소를 쓰지 않는다. 입력과 결과는 React 상태(useReducer)에만 있다. 제비뽑기의 섞은 카드 대응은 리듀서 상태가 아니라 root의 `useRef` 안 클로저에만 있다(3.2).
- 난수는 기능 전용 순수 함수(`lucky-draw-random.util.ts`)에서 `crypto.getRandomValues`와 거절 샘플링으로만 만든다. `Math.random` 대체 경로가 없다. 테스트에서 난수 원천을 주입할 수 있다.
- 사다리는 "무작위 가로선 + 아래 결과 칸 순서를 Fisher-Yates로 섞기" 방식으로 만든다. 최종 배정이 균등한 이유는 2.3절에 적었다. 사다리 그림은 기능 전용 SVG 컴포넌트로 그린다.
- 돌림판은 공용 `RouletteComponent`를 쓴다. "결과 가리기"는 공용 선택 prop `isResultHidden`(기본 false)으로 지킨다. 2026-11-23 사용자 결정으로 S-2 B를 채택해, 가리는 동안(회전 전 포함) 칸 글자, 강조 칸, 병뚜껑 글자를 모두 그리지 않는다(3.4, 3.5).
- 제비뽑기는 "카드 한 장 뽑기"다. 항목 2~30개를 뒷면 카드 N장에 Fisher-Yates로 놓고, 사용자가 한 장씩 연다. 공개 방식 선택이 없다(3.2).
- 새 라이브러리는 없다. 새 색 토큰 `menu-lucky`는 S-1 A로 승인되었다.

## 1. 확정 결정과 사용자 선택 요청

### 1.1 plan에서 확정된 값 (2026-11-23 사용자 승인, 같은 날 개정 반영)

| 번호 | 항목 | 확정 값 |
|---|---|---|
| 1 | 페이지 구조 | 허브 + 도구별 페이지 세 개 |
| 2 | 주소 | `/lucky-draw`, `/lucky-draw/ladder`, `/lucky-draw/roulette`, `/lucky-draw/lots` |
| 3 | 재추첨 | 돌림판 "뽑힌 항목 빼기"(기본 꺼짐), 제비뽑기 "다시 섞기"(열린 기록을 지우는 전체 초기화) |
| 4 | 가중치 | 1차 제외. 돌림판 칸은 모두 같은 크기 |
| 5 | 한계 | 사다리 2~10명, 돌림판 2~28개, 제비뽑기 2~30개, 한 줄 15자 |
| 6 | 분포 검증 | 10만 회, `1/n ± 4 × √(p(1−p)/N)` |
| 7 | 예측 방지 | 시작·섞기 전에는 결과와 그림이 DOM에 없다. 제비뽑기는 카드를 열기 전까지 카드 위치와 항목의 대응이 DOM에 없다. 사다리 그림을 따라가는 것은 막지 않는다 |
| 8 | 공정성 문장 | 검증 가능한 문장만. "암호학적 난수" 표현 금지 |
| 9 | 금지어 | plan "금지어" 목록. 화면에서는 "당첨", "추첨" 대신 "결과" |
| 10 | 대상 | 학생 명단·아동 이름 입력을 권하지 않음 |
| 11 | `/meal` 구분 | 돌림판 페이지에 "룰렛 돌리기", "메뉴"를 쓰지 않음 |
| 12 | 색 | `menu-lucky` 신설 (S-1 A 승인) |
| 13 | 키워드 | plan 후보로 넣고, 사용자 검색량 조회 뒤 상수만 바꾼다. 제비뽑기 키워드 이동은 확인 19번(1.4) |
| 14 | 이름 | 그룹 "운빨 뽑기", 항목 "사다리 타기", "돌림판", "제비뽑기" |
| 15 | 로또 연결 | 링크와 단어 모두 없음 |
| 16 | 한 명씩 열기 | 사다리만. 돌림판은 "일괄 공개", "결과 가리기" 두 개. 제비뽑기는 공개 방식 선택 없음(카드 열기로 대신) |
| 17 | h1 | 허브 "운빨 뽑기", 도구 "사다리 타기", "돌림판", "제비뽑기" |

### 1.2 설계에서 정한 것 (대안 없이 확정)

- 출시 전에는 `comingSoon`인 동안 noindex를 적용하고, 출시 때 `comingSoon`을 지우면 자동 해제된다(2026-11-23 코드 리뷰 반영, 메뉴 룰렛 선례와 다름).
- 허브 JSON-LD는 BreadcrumbList와 FAQPage만 쓴다. 운세 허브가 쓰는 ItemList는 넣지 않는다(plan AC-5).
- 생성한 난수는 이벤트 핸들러에서 만들고 결과를 액션에 담아 reducer로 넘긴다. reducer 안에서 난수를 만들지 않는다(StrictMode에서 reducer가 두 번 실행되어 결과가 달라지는 것을 막는다).
- 숨긴 결과는 CSS로 감추지 않고 렌더링하지 않는다(AC-26c, AC-29, AC-31, AC-31a, AC-32).
- 사이트 공용 헤더 메뉴는 연출 중에도 막지 않는다. 페이지를 떠나면 상태가 사라질 뿐이다. 막는 대상은 도구 페이지 안의 도구 전환 링크(`LuckyDrawToolNavComponent`)다.
- "DOM에 항목 글자가 없다"는 검사(AC-23, AC-26c, AC-31a)의 범위는 입력란(textarea)과 돌림판 "남은 항목" 목록을 뺀 문서 전체다. 두 곳은 사용자가 입력한 원문을 입력 순서 그대로 보여 줄 뿐 결과와 대응하지 않는다. 돌림판 "남은 항목" 목록은 빼기를 결과 공개 순간에 적용하므로(3.4) 가리는 동안 결과를 드러내지 않는다. QA는 AC-31a를 "뽑힌 항목 빼기" 꺼짐(기본)으로 돌린다.

### 1.3 사용자 선택 요청

문서 끝 "사용자 선택지" 절에 모았다(S-1~S-6, 모두 확정). 이번 개정에서 새로 요청하는 선택은 없다. plan 확인 18~22번은 권장안으로 확정해 1.4에 적었다. 제비뽑기 "다시 섞기" 버튼 위치는 `ui-ux-design.md` U4에서 고르며, 어느 쪽이어도 이 설계의 상태 모델은 바뀌지 않는다.

### 1.4 plan 확인 18~22번 확정 (2026-11-23, plan 권장안)

| 번호 | 항목 | 확정 값 | 반영 절 |
|---|---|---|---|
| 18 | 제비뽑기 공개 방식 | 선택 없음. 카드 한 장 열기가 "한 명씩 열기", "남은 카드 모두 열기"가 "일괄 공개". "결과 가리기"와 "결과 보기" 버튼 없음 | 2.5, 3.2 |
| 19 | 키워드 이동 | 제비뽑기 키워드에서 "순서 정하기", "발표 순서 정하기", "당번 정하기"를 빼고 "카드 뽑기"를 넣는다. "당번 정하기"는 사다리 키워드로 옮긴다. "순서 정하기"는 제비뽑기 FAQ 질문 한 개로 답한다 | SEO, 3.6 |
| 20 | 카드 번호 | 카드에 놓인 자리 번호(1~N)를 보인다. 번호는 항목과 무관하다 | 3.2 |
| 21 | 칸 위치 추측 한계 | 막지 않는다. 칸 색 패턴이 입력 순서를 드러내는지 ui-ux가 확인하고, 드러내면 칸 색 규칙을 정한다(3.4 "알려진 한계") | 3.4 |
| 22 | 돌림판 "결과 보기" 전 다시 돌리기 | 막는다. "결과 보기"가 끝나야 다음 회전 | 3.4 |

## 폴더 구조

```
src/app/lucky-draw/
  page.tsx                          # LuckyDrawPage (허브, 서버)
  ladder/page.tsx                   # LuckyDrawLadderPage (서버)
  roulette/page.tsx                 # LuckyDrawRoulettePage (서버)
  lots/page.tsx                     # LuckyDrawLotsPage (서버)

src/features/lucky-draw/
  types/
    lucky-draw.type.ts              # 2.1 타입 전부
  constants/
    lucky-draw-limit.constant.ts    # 인원·항목 한계, 사다리 높이, 돌림판 회전값, 도구별 공개 방식(사다리, 돌림판)
    lucky-draw-route.constant.ts    # 도구 키 → 주소, 도구 이름
    lucky-draw-seo.constant.ts      # 페이지별 SEO 값, 빵부스러기 그룹
    lucky-draw-faq.constant.ts      # 페이지별 FAQ (화면과 JSON-LD가 같은 배열을 쓴다)
    lucky-draw-guide.constant.ts    # 서버 렌더링 설명 문단, 사용 순서
    lucky-draw-notice.constant.ts   # 상시 고지, 결과 하단 고지, 입력 안내, noscript 안내
    lucky-draw-theme.constant.ts    # 강조색 클래스
    lucky-draw-copy-rule.constant.ts # 검사 전용 금지어·예외 문장. 화면 코드는 import하지 않는다
  utils/
    lucky-draw-random.util.ts       # 2.2 정수 뽑기, Fisher-Yates
    lucky-draw-ladder.util.ts       # 2.3 사다리 생성, 경로 따라가기, 게임 만들기
    lucky-draw-input.util.ts        # 2.4 줄 단위 입력 해석, 시작 가능 판단
    lucky-draw-lots.util.ts         # 2.6 카드 묶음 만들기, 한 장 열기 (신규)
    lucky-draw-seo.util.ts          # 페이지별 JSON-LD 배열 만들기
  shared/components/
    lines-input.component.tsx       # 줄 단위 textarea + 개수 + 안내 (Controlled)
    reveal-mode.component.tsx       # 공개 방식 라디오 (fieldset). 사다리, 돌림판만 쓴다
    status.component.tsx            # role="status" 알림 한 곳
    tool-nav.component.tsx          # 세 도구 전환 링크. 잠금 props
    disclaimer-notice.component.tsx # 서버. h1 바로 아래 상시 고지
    result-notice.component.tsx     # 결과 영역 하단 보상 무관 고지
    noscript-notice.component.tsx   # 서버
    faq.component.tsx               # 서버
    guide.component.tsx             # 서버. 설명 문단 + 사용 순서 (도구 키 props)
  hub/components/
    root.component.tsx              # LuckyDrawHubComponent (서버). 세 도구 링크
  ladder/components/
    root.component.tsx              # LuckyDrawLadderComponent ('use client')
    board.component.tsx             # 사다리 SVG + 위 이름 칸 + 아래 결과 칸
    path.component.tsx              # 경로 한 줄 그리기 (framer-motion pathLength)
    name-picker.component.tsx       # 전체 이름 버튼 목록 (키보드 선택)
    result-list.component.tsx       # "이름 → 결과" 글자 목록
  ladder/hooks/
    use-lucky-draw-ladder.hook.ts   # useReducer
  roulette/components/
    root.component.tsx              # LuckyDrawRouletteComponent ('use client')
    spin-panel.component.tsx        # 공용 RouletteComponent + 돌리기 버튼
    item-list.component.tsx         # 남은 항목 목록, "처음부터"
    result.component.tsx            # 돌림판 밖 결과 글자 영역
  roulette/hooks/
    use-lucky-draw-roulette.hook.ts # useReducer
  lots/components/
    root.component.tsx              # LuckyDrawLotsComponent ('use client'). 다시 작성
    card-grid.component.tsx         # LuckyDrawLotsCardGridComponent: 카드 N장 목록 (신규)
    card.component.tsx              # LuckyDrawLotsCardComponent: 카드 한 장, 뒷면/열린 면 (신규)
  lots/hooks/
    use-lucky-draw-lots.hook.ts     # useReducer. 상태 모델 다시 작성 (3.2)

unit/lucky-draw/                    # 8장
e2e/lucky-draw.spec.ts
e2e/helpers/lucky-draw.util.ts
```

- 지울 파일: `src/features/lucky-draw/lots/components/order-list.component.tsx`(순서 목록 방식, 카드 방식과 맞지 않음).

공용 파일 변경(기능 폴더 밖):

| 파일 | 변경 |
|---|---|
| `src/constants/menu.constant.ts` | `MENU_GROUP_NAME_ENUM.LUCKY_DRAW = 'lucky-draw'`, 그룹 추가(6장). 개정: 제비뽑기 항목 설명·예시만 바꾼다 |
| `src/types/menu.type.ts` | `MenuSectionKeyType`에 `'lucky-draw'` 추가 |
| `src/constants/theme.constant.ts` | `SECTION_ICONS`, `SECTION_ICON_COLOR`, `SECTION_BADGE_COLOR`, `BACKGROUND_COLORS`에 `'lucky-draw'` 키 추가 |
| `src/constants/menu-icon.constant.ts` | 항목 아이콘 3개 추가 (lucide-react 기존 패키지, 이름은 ui-ux-design이 고른다) |
| `src/app/globals.css` | `--menu-lucky`, `--color-menu-lucky` (S-1 A) |
| `src/components/common/roulette.component.tsx` | 선택 prop `isResultHidden`(구현됨). 개정: true인 동안 칸 글자도 그리지 않는다(S-2 B, 3.5) |
| `src/app/terms/page.tsx` | 1장 한 문단, 새 10장, 뒤 장 번호 +1 (7장). 개정: 제비뽑기 문장을 카드 방식으로 |
| `src/app/sitemap.ts` | 변경 없음. `MENU_LIST`에서 자동 |

- `features/lucky-draw`는 공용 폴더(`@/components/*`, `@/lib/*`, `@/constants/*`, `@/types/*`)만 import한다. `features/meal`의 돌림판 패널을 import하지 않는다. 같은 모양이 필요하면 기능 안에 새로 만든다.
- 사다리 컴포넌트는 사다리 화면만 쓰므로 `ladder/components/`에 둔다. 다른 기능이 쓰게 되면 그때 공용으로 올린다.

## 2. 타입과 순수 함수 (확정)

### 2.1 타입 (`src/features/lucky-draw/types/lucky-draw.type.ts`)

```ts
export type LuckyDrawToolKeyType = 'ladder' | 'roulette' | 'lots';
export type LuckyDrawPageKeyType = 'hub' | LuckyDrawToolKeyType;

/**
 * all: 일괄 공개, hidden: 결과 가리기, one-by-one: 한 명씩 열기(사다리만).
 * 제비뽑기는 공개 방식이 없다(카드 열기로 대신).
 */
export type LuckyDrawRevealModeType = 'all' | 'hidden' | 'one-by-one';

/** 공개 방식을 쓰는 도구 */
export type LuckyDrawRevealToolKeyType = Exclude<LuckyDrawToolKeyType, 'lots'>;

/** 입력 한 줄. 같은 이름이 여러 줄이어도 id가 다르다 */
export type LuckyDrawEntryType = Readonly<{ id: string; label: string }>;

export type LuckyDrawLineRuleType = Readonly<{
  minCount: number;
  maxCount: number;
  maxLength: number; // 코드 포인트 기준 글자 수
}>;

export type LuckyDrawParsedLinesType = Readonly<{
  entries: readonly LuckyDrawEntryType[];
  overflowCount: number; // maxCount를 넘어서 빠진 줄 수
  tooLongCount: number;  // maxLength를 넘어서 빠진 줄 수
}>;

/** [0, 2^32) 정수를 하나 돌려주는 난수 원천. 운영은 crypto, 테스트는 주입 */
export type LuckyDrawUint32SourceType = () => number;

export type LuckyDrawLadderType = Readonly<{
  columnCount: number;
  /** rows[r][g] === true: r번째 높이에서 g번 세로선과 g+1번 세로선을 잇는 가로선 */
  rows: readonly (readonly boolean[])[];
}>;

/** level 0 = 맨 위 이름 칸, level r+1 = r번째 가로선 높이, level rowCount+1 = 맨 아래 결과 칸 */
export type LuckyDrawLadderPointType = Readonly<{ column: number; level: number }>;

export type LuckyDrawLadderTraceType = Readonly<{
  endColumn: number;
  points: readonly LuckyDrawLadderPointType[];
}>;

export type LuckyDrawLadderGameType = Readonly<{
  participants: readonly LuckyDrawEntryType[];
  results: readonly LuckyDrawEntryType[];
  ladder: LuckyDrawLadderType;
  /** 아래 결과 칸 c에 놓인 결과의 인덱스 (results 기준) */
  slotResultIndexes: readonly number[];
  /** 참가자 i가 도착하는 결과의 인덱스 */
  assignment: readonly number[];
}>;

/** 제비뽑기: 열린 카드 한 장. position은 0부터, 화면 번호는 position + 1 */
export type LuckyDrawLotsOpenedCardType = Readonly<{
  position: number;
  label: string;
}>;

/**
 * 제비뽑기: 섞은 카드 묶음.
 * 위치 → 항목 대응은 클로저 안에만 있고, 묶음 전체를 밖으로 내보내는 속성·메서드가 없다.
 * JSON.stringify(deck)은 {"size":N}만 나온다.
 */
export type LuckyDrawLotsDeckType = Readonly<{
  size: number;
  /** position 카드 한 장의 항목만 돌려준다 */
  open: (position: number) => LuckyDrawLotsOpenedCardType;
}>;

export type LuckyDrawFaqItemType = Readonly<{ question: string; answer: string }>;

export type LuckyDrawSeoType = Readonly<{
  title: string;
  description: string;
  pathname: string;
  keywords: readonly string[];
  ogImageAlt: string;
  heading: string;            // h1
  headerDescription: string;  // h1 아래 설명 문단 (서버 렌더링)
  breadcrumbName: string;     // 빵부스러기 마지막 이름 (허브는 사용하지 않음)
}>;
```

### 2.2 난수 (`utils/lucky-draw-random.util.ts`, 확정)

```ts
/** crypto.getRandomValues가 있는지. 없으면 도구 버튼을 막고 안내한다 */
export function isLuckyDrawRandomAvailable(): boolean;

/** getRandomValues로 Uint32Array(256)을 채워 하나씩 꺼내는 원천. 없으면 Error */
export function createLuckyDrawCryptoSource(): LuckyDrawUint32SourceType;

/** 모듈 안 한 개를 지연 생성해 돌려준다. source를 생략한 함수들이 쓴다 */
export function getLuckyDrawDefaultSource(): LuckyDrawUint32SourceType;

/** 받아들이는 상한(이 값 이상은 버린다) = 2^32 − (2^32 mod n) */
export function getLuckyDrawRejectionLimit(maxExclusive: number): number;

/** [0, maxExclusive) 균등 정수. 거절 샘플링 */
export function randomIntBelow(
  maxExclusive: number,
  source?: LuckyDrawUint32SourceType
): number;

/** Durstenfeld 방식 Fisher-Yates. 원본을 바꾸지 않고 새 배열을 돌려준다 */
export function shuffleFisherYates<T>(
  items: readonly T[],
  source?: LuckyDrawUint32SourceType
): T[];
```

규칙:
- `maxExclusive`는 1 이상 2^32 이하의 정수다. 아니면 `RangeError`.
- `maxExclusive === 1`이면 원천을 부르지 않고 0을 돌려준다.
- 받아들이는 상한 `limit = 2^32 − (2^32 mod n)`. 원천 값 `r`이 `r < limit`이면 `r mod n`을 돌려주고, 아니면 다시 뽑는다. `2^32 mod n`이 0이면(n이 2의 거듭제곱) 버리는 값이 없다.
- 원천이 [0, 2^32) 정수가 아닌 값을 주면 `RangeError`. 같은 호출에서 1,000번 연속 버리면 `Error`(테스트에서 계속 버릴 값만 주입해도 무한 반복하지 않게 하는 안전장치. 실제 crypto에서 일어날 확률은 0에 가깝다).
- Fisher-Yates: `i = n−1`부터 `1`까지 `j = randomIntBelow(i + 1)`로 고르고 `i`와 `j`를 바꾼다. `randomIntBelow(i)`로 쓰면 Sattolo 셔플이 되므로 금지한다.
- `Math.random`을 어디에서도 부르지 않는다. `src/lib/random.ts`의 `secureRandomInt`는 crypto가 없을 때 `Math.random`으로 대체하고 원천 주입이 없어서 AC-27, AC-28을 맞출 수 없다. 그래서 기능 전용으로 둔다(S-5).
- crypto가 없는 환경에서는 "이 브라우저에서는 도구를 쓸 수 없어요" 안내를 보이고 시작·돌리기·섞기를 막는다. 대체 난수를 쓰지 않는다.

AC-28 경계값 예시(테스트에 그대로 쓴다):

| n | 2^32 mod n | limit | 버리는 값 | 받는 값의 최댓값 |
|---|---|---|---|---|
| 2 | 0 | 4294967296 | 없음 | 4294967295 |
| 3 | 1 | 4294967295 | 4294967295 | 4294967294 |
| 6 | 4 | 4294967292 | 4294967292~4294967295 | 4294967291 |
| 10 | 6 | 4294967290 | 4294967290~4294967295 | 4294967289 |

### 2.3 사다리 (`utils/lucky-draw-ladder.util.ts`, 확정)

```ts
export function generateLuckyDrawLadder(
  columnCount: number,
  source?: LuckyDrawUint32SourceType
): LuckyDrawLadderType;

export function traceLuckyDrawLadder(
  ladder: LuckyDrawLadderType,
  startColumn: number
): LuckyDrawLadderTraceType;

/** AC-11 검사. 테스트와 개발 중 단언에 같이 쓴다 */
export function isLuckyDrawLadderValid(ladder: LuckyDrawLadderType): boolean;

/** 사다리 생성 → 아래 결과 칸 섞기 → 배정 계산. 참가자와 결과 수가 다르거나 범위 밖이면 RangeError */
export function createLuckyDrawLadderGame(
  participants: readonly LuckyDrawEntryType[],
  results: readonly LuckyDrawEntryType[],
  source?: LuckyDrawUint32SourceType
): LuckyDrawLadderGameType;
```

생성 규칙 (`generateLuckyDrawLadder`):
1. 높이 수 `LUCKY_DRAW_LADDER_ROW_COUNT = 12`, 간격 수 `g = columnCount − 1`.
2. 각 높이 r에서 간격을 왼쪽부터 본다. 바로 왼쪽 간격에 같은 높이 가로선이 있으면 이 간격은 비운다. 아니면 `randomIntBelow(2) === 1`일 때 가로선을 놓는다.
3. 모든 간격에 가로선이 한 개 이상 있어야 한다(그림이 끊겨 보이지 않게). 없으면 처음부터 다시 만든다. 최대 `LUCKY_DRAW_LADDER_MAX_ATTEMPTS = 64`번. 넘으면 `Error`를 던지고, root는 "다시 시도해 주세요" 안내를 보인다(실제 확률은 무시할 수준: 한 번 실패 확률이 10명 기준 약 7%라 64번 연속 실패는 10^-70 아래).
4. 결과: 가로선은 항상 이웃한 두 세로선만 잇고(표현 자체가 그렇다), 같은 높이에서 이웃한 간격 두 곳에 동시에 놓이지 않는다(2번 규칙). AC-11.

경로 규칙 (`traceLuckyDrawLadder`): 시작 열 c에서 높이 0부터 아래로 내려간다. 높이 r에서 `rows[r][c]`면 c+1로, `rows[r][c−1]`이면 c−1로 옮긴다. `points`는 (c, 0)에서 시작해, 옮길 때마다 (옮기기 전 열, r+1), (옮긴 뒤 열, r+1)을 넣고, 마지막에 (끝 열, rowCount+1)을 넣는다.

게임 규칙 (`createLuckyDrawLadderGame`):
1. `ladder = generateLuckyDrawLadder(n, source)`
2. `slotResultIndexes = shuffleFisherYates([0..n−1], source)`. 아래 결과 칸 순서는 입력 순서가 아니라 무작위다(S-6).
3. `assignment[i] = slotResultIndexes[traceLuckyDrawLadder(ladder, i).endColumn]`

공정성 근거: 사다리가 만드는 자리 이동(시작 열 → 끝 열)은 어떤 모양이든 일대일이다(AC-12). 아래 칸의 결과 순서는 사다리와 독립인 균등 순열이므로, 사다리 모양의 치우침(리서치 5-4의 "무작위 가로선 편향")과 상관없이 참가자 i가 결과 k에 도착할 확률은 정확히 1/n이다. 리서치 권장안("결과를 먼저 섞고 그에 맞게 가로선을 채운다")과 분포는 같고, 그림이 항상 자연스러운 무작위 사다리라 구현과 검증이 더 단순하다.

### 2.4 입력 (`utils/lucky-draw-input.util.ts`, 확정)

```ts
export function countLuckyDrawChars(label: string): number; // Array.from(label).length

export function parseLuckyDrawLines(
  text: string,
  rule: LuckyDrawLineRuleType,
  idPrefix: string           // 'p' 참가자, 'r' 사다리 결과, 'i' 돌림판·제비뽑기 항목
): LuckyDrawParsedLinesType;

export type LuckyDrawLadderBlockType =
  | 'too-few' | 'too-many' | 'count-mismatch' | null;

export function getLuckyDrawLadderBlock(
  participants: LuckyDrawParsedLinesType,
  results: LuckyDrawParsedLinesType
): LuckyDrawLadderBlockType;
```

- 줄은 `/\r?\n/`로 나눈다. 앞뒤 공백을 지우고 빈 줄은 건너뛴다.
- 글자 수가 `maxLength`(15)를 넘는 줄은 넣지 않고 `tooLongCount`를 센다.
- 이미 `maxCount`개를 넣었으면 그 뒤 줄은 넣지 않고 `overflowCount`를 센다.
- id는 `${idPrefix}-${entries 안 순서}`. 같은 글자라도 줄마다 다른 id다.
- 화면 입력란은 사용자가 친 글을 그대로 두고(값을 다시 쓰지 않는다), 화면은 해석 결과로 개수와 안내를 보인다(S-3). textarea `maxLength`는 `LUCKY_DRAW_INPUT_MAX_CHARS = 1000`.
- 버튼 조건
  - 돌림판·제비뽑기: `entries.length >= 2`. 상한을 넘은 줄은 빠지고 버튼은 켜진 채 "최대 N개까지 입력할 수 있어요"가 보인다(AC-16, AC-22).
  - 사다리: 참가자 `entries.length < 2` → `too-few`, 참가자 `overflowCount > 0` → `too-many`, 결과 해석 개수가 참가자 개수와 다르거나 결과 `overflowCount > 0` → `count-mismatch`. 하나라도 있으면 "시작"을 막고 안내한다(AC-9: 11명 이상은 버튼이 꺼진다).

### 2.5 상수 (`constants/lucky-draw-limit.constant.ts`, 확정)

```ts
export const LUCKY_DRAW_ITEM_MAX_LENGTH = 15;
export const LUCKY_DRAW_INPUT_MAX_CHARS = 1000;
export const LUCKY_DRAW_LADDER_RULE = { minCount: 2, maxCount: 10, maxLength: 15 } as const;
export const LUCKY_DRAW_ROULETTE_RULE = { minCount: 2, maxCount: 28, maxLength: 15 } as const;
export const LUCKY_DRAW_LOTS_RULE = { minCount: 2, maxCount: 30, maxLength: 15 } as const;
export const LUCKY_DRAW_LADDER_ROW_COUNT = 12;
export const LUCKY_DRAW_LADDER_MAX_ATTEMPTS = 64;
export const LUCKY_DRAW_ROULETTE_SPIN = { durationSec: 1.0, turns: 2 } as const;
/** 개정: lots 키를 뺀다. 제비뽑기는 공개 방식이 없다(확인 18번) */
export const LUCKY_DRAW_REVEAL_MODES: Readonly<
  Record<LuckyDrawRevealToolKeyType, readonly LuckyDrawRevealModeType[]>
> = {
  ladder: ['all', 'hidden', 'one-by-one'],
  roulette: ['all', 'hidden'],
};
export const LUCKY_DRAW_DEFAULT_REVEAL_MODE: LuckyDrawRevealModeType = 'all';
```

`lucky-draw-route.constant.ts`:

```ts
export const LUCKY_DRAW_HUB_PATH = '/lucky-draw';
export const LUCKY_DRAW_TOOL_PATHS: Readonly<Record<LuckyDrawToolKeyType, string>> = {
  ladder: '/lucky-draw/ladder',
  roulette: '/lucky-draw/roulette',
  lots: '/lucky-draw/lots',
};
export const LUCKY_DRAW_TOOL_LABELS: Readonly<Record<LuckyDrawToolKeyType, string>> = {
  ladder: '사다리 타기', roulette: '돌림판', lots: '제비뽑기',
};
```

`lucky-draw-theme.constant.ts` (S-1 A 확정):

| 상수 | 값 |
|---|---|
| `LUCKY_DRAW_ROULETTE_ACCENT_CLASS` | `'fill-menu-lucky/20 stroke-menu-lucky'` |
| 버튼·강조 글자 | `bg-menu-lucky`, `text-menu-lucky` |

돌림판 칸 색(`colorClassName`)은 넘기지 않는다. 공용 돌림판 기본(`fill-card`/`fill-background` 번갈아, 홀수 마지막 `fill-muted`)을 쓰므로 AC-19의 허용 토큰 안에 있다. ui-ux-design이 칸 색을 따로 쓰려면 `docs/roulette-common/plan.md` 허용 목록(`fill-menu-<key>/10` 다섯 개) 안에서만 고른다. `fill-menu-lucky/10`은 그 목록에 없으므로 쓰려면 허용 목록 갱신이 먼저다. 확인 21번 결과로 칸 색 규칙이 바뀌면 이 절을 같이 고친다(3.4 "알려진 한계").

### 2.6 제비뽑기 카드 (`utils/lucky-draw-lots.util.ts`, 신규, 확정)

```ts
/**
 * 항목을 카드 위치에 Fisher-Yates로 놓은 묶음을 만든다.
 * entries 수가 LUCKY_DRAW_LOTS_RULE 범위(2~30) 밖이면 RangeError.
 */
export function createLuckyDrawLotsDeck(
  entries: readonly LuckyDrawEntryType[],
  source?: LuckyDrawUint32SourceType
): LuckyDrawLotsDeckType;

/** 0..size−1 중 아직 열지 않은 위치를 작은 번호부터 돌려준다 */
export function getLuckyDrawLotsUnopenedPositions(
  size: number,
  opened: readonly LuckyDrawLotsOpenedCardType[]
): number[];
```

규칙:
- 묶음 안쪽: `cards = shuffleFisherYates(entries.map((e) => e.label), source)`. 카드 `p`(0부터)의 항목은 `cards[p]`다. 항목 id는 묶음에 넣지 않는다(화면과 상태에 id가 필요 없다).
- `open(position)`: `position`이 0 이상 `size` 미만의 정수가 아니면 `RangeError`. 맞으면 `{ position, label: cards[position] }` 한 장만 돌려준다. 이미 연 위치인지는 묶음이 따지지 않는다(리듀서가 따진다).
- 반환 객체는 `Object.freeze({ size, open })`다. `cards` 배열을 속성, getter, 반복자, `toJSON`으로 내보내지 않는다(AC-26d).
- 같은 이름이 여러 줄이면 같은 글자의 카드가 여러 장이다(AC-24).
- 공정성: 위치 → 항목 대응은 Fisher-Yates 균등 순열이다. 항목 3개면 6가지 대응이 각각 1/6이다(AC-25).

## 3. 도구별 구조

### 3.1 공통 화면 규칙

- 공개 방식(사다리, 돌림판)은 `<fieldset><legend>결과 공개 방식</legend>` 안의 기본 `<input type="radio">`와 `<label>`로 만든다(메뉴 룰렛 끼니 선택과 같은 방식). 새 shadcn 컴포넌트를 추가하지 않는다. 제비뽑기는 공개 방식 fieldset을 렌더링하지 않는다(AC-30).
- 연출 중 잠금: 입력란은 `readOnly` + `aria-disabled="true"`, 공개 방식 라디오와 옵션 스위치는 `aria-disabled="true"`이고 `onChange`에서 무시, 버튼은 `aria-disabled`(포커스 유지), 도구 전환 링크는 `aria-disabled="true"`이고 클릭을 막는다. 제비뽑기는 잠그는 연출이 없다(3.2).
- 입력이 바뀌면(`SET_*_TEXT`) 결과, 열린 항목, 공개 상태를 모두 지운다. 공개 방식과 돌림판 옵션은 남긴다. 제비뽑기는 카드 수와 열린 카드를 지우고, root가 카드 묶음 ref도 비운다.
- 공개 방식을 바꾸면(사다리, 돌림판) 결과는 남기고 `isRevealed`는 `mode === 'all'`로, 열린 목록은 비운다.
- 알림은 도구마다 `LuckyDrawStatusComponent` 하나(`<p role="status" aria-atomic="true">`, 화면에서 숨김)를 쓴다. 문장은 root가 렌더링 중에 계산한다. 결과가 숨겨진 상태에서는 결과 글자를 넣지 않는다(예: "결과가 정해졌어요. 결과 보기를 누르면 볼 수 있어요"). 최종 문장은 ui-ux-design 문구 표.
- `data-*` 속성에 항목 이름, 항목 id, 결과 인덱스를 넣지 않는다. 위치 번호(1번째 칸, 3번째 카드 등)와 사다리 좌표는 결과 정보가 아니므로 넣어도 된다.
- 결과 영역 아래에 `LuckyDrawResultNoticeComponent`(보상 무관 고지)를 항상 렌더링한다(결과가 없어도 서버 HTML에 있다).
- 광고 슬롯을 이 페이지들에 추가하지 않는다. 레이아웃의 기존 고정 슬롯만 있다(AC-47 확인은 QA).

### 3.2 제비뽑기 (`/lucky-draw/lots`, 2026-11-23 카드 방식으로 다시 작성)

흐름:
1. 항목을 줄마다 2~30개 입력한다. "섞기" 전에는 카드 자리에 안내 문장만 있고 카드와 항목 글자가 없다(AC-23).
2. "섞기": 핸들러가 `createLuckyDrawLotsDeck(entries)`로 묶음을 만들어 ref에 넣고 `SHUFFLE`을 보낸다. 뒷면 카드 N장이 나온다. 카드에는 자리 번호(1~N)만 있다(확인 20번).
3. 카드 누르기: 핸들러가 `deck.open(position)`으로 한 장의 항목만 받아 `OPEN`을 보낸다. 그 카드 자리에 항목 글자가 나온다. 연 카드는 다시 누를 수 없다(AC-26a).
4. "남은 카드 모두 열기": 핸들러가 열지 않은 위치마다 `deck.open`을 불러 `OPEN_REST`를 보낸다. 남은 카드가 없으면 버튼이 비활성이고 "모든 카드를 열었어요." 안내가 보인다(AC-26b).
5. "다시 섞기": "섞기"와 같은 핸들러다. 입력 목록은 그대로, 새 묶음을 만들고 열린 기록을 모두 지운다(AC-26).

상태 (`lots/hooks/use-lucky-draw-lots.hook.ts`, useReducer, 확정):

```ts
export type LuckyDrawLotsStateType = Readonly<{
  text: string;
  /** 섞은 카드 수. 섞기 전 null */
  cardCount: number | null;
  /** 연 카드. 연 순서대로. 열지 않은 카드의 항목은 여기 없다(AC-26d) */
  openedCards: readonly LuckyDrawLotsOpenedCardType[];
  /** 마지막 열기 동작. 알림 문장 계산용 */
  lastEvent: 'shuffle' | 'open' | 'open-rest' | null;
  /** 섞을 때마다 1 증가. 이전 묶음에서 온 열기 액션을 버린다 */
  runId: number;
}>;

export type LuckyDrawLotsActionType =
  | { type: 'SET_TEXT'; text: string }
  | { type: 'SHUFFLE'; runId: number; cardCount: number }
  | { type: 'OPEN'; runId: number; card: LuckyDrawLotsOpenedCardType }
  | {
      type: 'OPEN_REST';
      runId: number;
      cards: readonly LuckyDrawLotsOpenedCardType[];
    };

/** 단위 테스트가 직접 부른다 */
export const LUCKY_DRAW_LOTS_INITIAL_STATE: LuckyDrawLotsStateType;
export function luckyDrawLotsReducer(
  state: LuckyDrawLotsStateType,
  action: LuckyDrawLotsActionType
): LuckyDrawLotsStateType;
export function useLuckyDrawLots(): [
  LuckyDrawLotsStateType,
  Dispatch<LuckyDrawLotsActionType>,
];
```

리듀서 규칙:
- `SET_TEXT`: `text` 갱신, `cardCount = null`, `openedCards = []`, `lastEvent = null`. `runId`는 그대로.
- `SHUFFLE`: `runId`, `cardCount`를 넣고 `openedCards = []`, `lastEvent = 'shuffle'`.
- `OPEN`: `action.runId !== state.runId`, `cardCount === null`, 위치가 범위 밖, 이미 연 위치면 상태를 그대로 돌려준다. 아니면 `openedCards` 끝에 붙이고 `lastEvent = 'open'`.
- `OPEN_REST`: `OPEN`과 같은 무시 조건을 카드마다 적용하고, 아직 열지 않은 위치만 붙인다. 붙인 카드가 없으면 상태 그대로. 있으면 `lastEvent = 'open-rest'`.
- 열린 카드 수는 0 이상 `cardCount` 이하이며 줄지 않는다(`SET_TEXT`, `SHUFFLE`로만 비워진다. AC-26b).
- 이전 상태의 `revealMode`, `phase`, `order`, `isRevealed`, `openedPositions`, 액션 `SET_REVEAL_MODE`, `SHUFFLE_START`, `SHUFFLE_END`, `REVEAL_ALL`은 모두 없앤다.

root (`LuckyDrawLotsComponent`)가 갖는 것:
- `deckRef = useRef<{ runId: number; deck: LuckyDrawLotsDeckType } | null>(null)`. ref는 이벤트 핸들러에서만 읽고 쓴다(렌더링 중에 읽지 않는다).
- 입력 `onChange`: `deckRef.current = null` 다음 `SET_TEXT`.
- `handleShuffle`: 막힌 상태면 끝. `runId = state.runId + 1`, `deck = createLuckyDrawLotsDeck(entries)`, `deckRef.current = { runId, deck }`, `SHUFFLE` 전송. crypto 오류면 `isRandomAvailable = false`.
- `handleOpen(position)`: `deckRef.current?.runId !== state.runId`이거나 이미 연 위치면 끝. 아니면 `OPEN`에 `deck.open(position)`을 담아 보낸다.
- `handleOpenRest`: `getLuckyDrawLotsUnopenedPositions`로 위치를 구해 `deck.open`을 부르고 `OPEN_REST` 전송.
- 렌더링 중 계산: 위치별 열린 항목 맵(`openedCards`에서), 남은 카드 수, "열린 카드 {k} / {N}장", 버튼 활성 여부, 알림 문장.

화면 규칙:
- "섞기" 버튼 하나가 `cardCount === null`이면 "섞기", 아니면 "다시 섞기"로 보인다(ui-ux U4 A). 막는 조건: 해석된 항목 2개 미만, crypto 없음. 연출 잠금은 없다. U4가 B로 정해져도 같은 `handleShuffle`을 두 버튼이 부를 뿐 상태 모델은 그대로다.
- "남은 카드 모두 열기"는 `cardCount !== null`일 때만 렌더링한다. 남은 카드 0장이면 `aria-disabled="true"`, 클릭 무시, "모든 카드를 열었어요." 안내.
- 카드 열기 연출은 ui-ux 개정안대로 누른 카드 한 장만 0.2초(`opacity`와 가로 펴짐)이고, "남은 카드 모두 열기"는 연출 없이 즉시다. 설계 조건: (1) 항목 글자는 `OPEN` 순간 DOM에 들어가고 연출 완료 이벤트로 상태를 바꾸지 않는다, (2) 연출이 끝나기를 기다리는 잠금이 없다, (3) 동작 줄이기면 연출 없이 바로 보인다(`motion-reduce:` 또는 `useReducedMotion`), (4) 뒷면에 항목 글자를 미리 넣어 두고 CSS로 뒤집어 보이는 방식은 금지한다(AC-26c). 그래서 도구 전환 링크와 입력란은 제비뽑기에서 잠그지 않는다(`isLocked = false`).
- 입력은 언제든 바꿀 수 있고, 바꾸면 카드가 모두 사라진다(AC-26).

컴포넌트와 DOM (확정. 문구는 ui-ux-design 제비뽑기 절과 접근성 절이 최종):
- `LuckyDrawLotsCardGridComponent` props: `cardCount: number`, `openedLabels: ReadonlyMap<number, string>`, `onOpen: (position: number) => void`. 렌더링: `<ol aria-label="카드 {N}장">` 안 `<li>`마다 카드 하나. key는 위치 번호다(항목 id나 항목 글자를 key로 쓰지 않는다).
- `LuckyDrawLotsCardComponent` props: `position: number`, `label: string | null`(열지 않은 카드는 null), `onOpen`. 열지 않은 카드에는 항목 글자를 props로도 넘기지 않는다.
- 카드는 열기 전후 모두 같은 `<button type="button">` 요소다. 같은 요소를 유지해야 연 뒤에도 키보드 포커스가 그 카드에 남는다.
  - 뒷면: 보이는 글자는 번호와 "열기"뿐. 접근 이름은 "n번째 카드 열기". Enter·Space·클릭으로 연다.
  - 열린 면: 보이는 글자는 항목 글자(줄바꿈, 말줄임 없음), 번호 배지와 `Check` 아이콘(둘 다 `aria-hidden`). 접근 이름 "n번째 카드: 항목". `aria-disabled="true"`, 클릭 무시(AC-26a). `disabled` 속성은 쓰지 않는다(포커스가 사라지기 때문).
  - `aria-label`, `title`, `data-*` 어디에도 열지 않은 카드의 항목 글자가 없다(AC-26c).
- 알림(`LuckyDrawStatusComponent`, 최종 문장은 ui-ux 알림 표):
  - `shuffle`: 처음 섞기와 다시 섞기의 문장을 다르게 쓴다(같은 문장이 이어지면 스크린리더가 다시 읽지 않는다). root는 `runId > 1`로 구분한다. 항목 글자를 넣지 않는다.
  - `open`: "{n}번째 카드: {항목}" 한 번.
  - `open-rest`: "남은 카드를 모두 열었어요. 열린 카드에서 항목을 읽을 수 있어요."(항목을 나열하지 않는다)
- 320px: 30장이 가로 스크롤 없이 줄바꿈되어야 한다(AC-46). 격자 열 수(320px 3열 등), 카드 최소 높이, 열린 글자 크기는 ui-ux. 열린 카드의 항목 글자는 카드 안에서 줄바꿈해 전체가 보인다.

예측 방지 정리 (AC-23, AC-26c, AC-26d, AC-29):
- 대응 목록은 `deckRef` 클로저 안에만 있다. 리듀서 상태, props, DOM, 접근 이름, `data-*`, 알림, URL, 저장소, 네트워크 어디에도 열지 않은 카드의 항목이 없다.
- 섞기 전에는 카드 목록 `<ol>` 자체를 렌더링하지 않는다.
- 한계: 브라우저 개발자 도구로 React 내부 ref를 들여다보는 것은 막지 않는다(사다리 그림 따라가기와 같은 "방식 밖 한계"). plan AC는 화면, DOM, 상태 기준이다.

### 3.3 사다리 타기 (`/lucky-draw/ladder`)

상태 (`ladder/hooks/use-lucky-draw-ladder.hook.ts`, useReducer, 확정):

```ts
export type LuckyDrawLadderStateType = Readonly<{
  participantText: string;
  resultText: string;
  revealMode: LuckyDrawRevealModeType;         // 기본 'all'
  game: LuckyDrawLadderGameType | null;        // "시작" 전 null
  isRevealed: boolean;
  tracedColumns: readonly number[];            // 경로를 다 그린 참가자 열
  tracing: Readonly<{ column: number; runId: number }> | null;
  runSeq: number;
}>;

type LuckyDrawLadderActionType =
  | { type: 'SET_PARTICIPANT_TEXT'; text: string }
  | { type: 'SET_RESULT_TEXT'; text: string }
  | { type: 'SET_REVEAL_MODE'; mode: LuckyDrawRevealModeType }
  | { type: 'START'; game: LuckyDrawLadderGameType }   // 다시 누르면 새 사다리
  | { type: 'TRACE_START'; column: number }
  | { type: 'TRACE_END'; runId: number }
  | { type: 'REVEAL_ALL' };
```

공개 방식별 DOM 규칙:

| 방식 | 아래 결과 칸 글자 | "이름 → 결과" 목록 | 이름 고르기(경로) |
|---|---|---|---|
| `all` | 시작 직후 전부 | 시작 직후 전부 | 언제든 |
| `hidden` | "결과 보기" 전 없음, 뒤에 전부 | 같음 | "결과 보기" 전에는 막는다 |
| `one-by-one` | 경로를 다 그린 참가자의 도착 칸만 | 경로를 다 그린 참가자만 | 언제든. 연 결과는 남는다 |

- `hidden`에서 이름 고르기를 막는 이유: 경로 끝 칸의 글자를 보여 줄 수 없어 경로만 그리면 의미가 없다. ui-ux-design이 다른 흐름을 원하면 이 표를 바꾸는 대신 PM에게 올린다.
- 아래 결과 칸 순서는 `slotResultIndexes`(무작위)다. 그래서 `hidden`, `one-by-one`에서 그림을 따라가도 입력 순서로 결과를 짐작할 수 없다(S-6).
- 한 번에 경로 하나만 그린다. 그리는 중에는 모든 조작을 막는다.

렌더 방식 (`board.component.tsx`, 확정):
- 구성: 위 이름 칸 행(HTML) / 사다리 SVG / 아래 결과 칸 행(HTML). 세 층이 같은 n칸 격자(`grid-template-columns: repeat(n, minmax(0, 1fr))`)를 써서 열 가운데가 맞는다.
- SVG `viewBox="0 0 {n×100} {(rowCount+1)×40}"`, `preserveAspectRatio="none"`, 너비 100%, 높이는 CSS로 고정(값은 ui-ux). 선은 `vector-effect="non-scaling-stroke"`로 두께를 유지한다. 열 c의 x = `c×100 + 50`, level L의 y = `L×40` (level 0은 위 끝, rowCount+1은 아래 끝). 좌표는 소수 셋째 자리로 고정한다(공용 돌림판과 같은 원칙). QA는 이 좌표로 가로선을 읽어 경로를 다시 계산할 수 있다.
- 세로선 n개, 가로선은 `<line>`. 경로는 `path.component.tsx`의 `motion.polyline`이 `pathLength` 0 → 1로 그린다. 끝나면 `onAnimationComplete` → `TRACE_END`. 동작 줄이기(`useReducedMotion`)면 바로 1로 두고 `queueMicrotask`로 `TRACE_END`를 한 번만 보낸다(공용 돌림판과 같은 방식, AC-45). 시간과 색은 ui-ux-design.
- 사다리 SVG는 `aria-hidden="true"`. 결과 전달은 "이름 → 결과" 목록과 상태 알림이 맡는다.
- 사다리는 `game`이 있을 때만 렌더링한다. 서버 HTML과 첫 클라이언트 렌더에는 그림이 없으므로 hydration 차이가 없다(AC-10).

320px 대응 (확정):
- 본문 폭 288px(좌우 여백 16px씩) ÷ 10열 = 열당 약 28.8px. 위·아래 칸 글자는 한 줄 말줄임(`truncate`)이고 장식용(`aria-hidden`)이다.
- 이름 고르기는 칸 머리를 누르는 방식이 아니라 사다리 위(또는 아래)의 `name-picker.component.tsx` 버튼 목록으로 한다. 버튼에는 전체 이름이 보이고 줄바꿈된다. 키보드 탭 순서와 터치 크기(높이 44px 이상)를 여기서 맞춘다(AC-43, AC-46).
- 전체 결과 글자는 `result-list.component.tsx`의 "이름 → 결과" 목록에서 줄바꿈으로 다 보인다. 말줄임된 칸 글자의 전체 내용은 이 목록에서 읽는다(AC-46).
- 가로 스크롤을 만들지 않는다. SVG는 폭에 맞춰 늘고 줄어든다.

### 3.4 돌림판 (`/lucky-draw/roulette`)

상태 (`roulette/hooks/use-lucky-draw-roulette.hook.ts`, useReducer, 확정):

```ts
export type LuckyDrawRouletteStateType = Readonly<{
  text: string;
  revealMode: Extract<LuckyDrawRevealModeType, 'all' | 'hidden'>; // 기본 'all'
  shouldRemovePicked: boolean;                 // 기본 false
  removedIds: readonly string[];               // 빠진 항목
  wheelIds: readonly string[] | null;          // 회전 시작 때 칸 목록을 고정. null이면 남은 목록
  spin: Readonly<{
    status: 'idle' | 'spinning' | 'done';
    spinId: number;
    targetIndex: number | null;                // wheelIds 기준
    pickedId: string | null;
  }>;
  isRevealed: boolean;
}>;

type LuckyDrawRouletteActionType =
  | { type: 'SET_TEXT'; text: string }
  | { type: 'SET_REVEAL_MODE'; mode: 'all' | 'hidden' }
  | { type: 'SET_REMOVE_PICKED'; value: boolean }
  | { type: 'SPIN_START'; wheelIds: readonly string[]; targetIndex: number; pickedId: string }
  | { type: 'SPIN_END'; spinId: number }
  | { type: 'REVEAL' }
  | { type: 'RESTORE' };                       // "처음부터"
```

- 남은 목록 = 해석된 항목 − `removedIds` (렌더링 중 계산).
- "돌리기" 핸들러: 남은 목록에서 `targetIndex = randomIntBelow(남은 개수)`를 만들고 `SPIN_START`. 돌림판에는 `wheelIds`의 칸을 넘긴다.
- 돌림판에 넘기는 값: `items`(key는 항목 id, label은 글자), `targetIndex`, `spinId`, `onSpinEnd`, `accentClassName = LUCKY_DRAW_ROULETTE_ACCENT_CLASS`, `spinDurationSec = 1.0`, `spinTurns = 2`(상수로 넘긴다, AC-17), `isResultHidden = revealMode === 'hidden' && !isRevealed`.
- `isResultHidden`이 true인 구간: `hidden`에서 회전 전(첫 회전 전 포함), 회전 중, 회전 후 "결과 보기" 전. 이 동안 공용 돌림판은 칸 글자, 강조 칸, 병뚜껑 글자를 그리지 않는다(3.5). 결과 글자 영역도 비어 있다. "결과 보기"(`REVEAL`)를 누르면 세 가지와 결과 글자가 같은 렌더에 함께 나온다(AC-31).
- `all`에서 `hidden`으로 바꾸면 이미 나온 결과도 "결과 보기" 전까지 다시 가린다(plan 공통 규칙). `hidden`에서 `all`로 바꾸면 바로 보인다.
- 빼기 적용 시점: 결과가 공개되는 순간이다. `all`은 `SPIN_END`, `hidden`은 `REVEAL`. 그 전에 목록에서 빼면 목록 변화로 결과가 드러나기 때문이다.
- 빼기를 적용해도 `wheelIds`는 다음 "돌리기"까지 그대로 둔다. 공용 돌림판은 칸 key 목록이 바뀌면 각도를 0으로 되돌리고 강조를 지우므로, 멈춘 직후 돌림판이 튀지 않게 하려는 것이다. 다음 회전은 남은 목록으로 시작한다(AC-20).
- "돌리기" 막는 조건: 회전 중, 남은 항목 2개 미만, `hidden`에서 이번 결과를 아직 "결과 보기"로 열지 않음(확인 22번 확정. 안내 "결과 보기를 누르면 다시 돌릴 수 있어요").
- "처음부터"(`RESTORE`): `removedIds`를 비우고 `wheelIds = null`. 빠진 항목이 하나라도 있으면 보인다.
- 옵션을 끄면(`SET_REMOVE_PICKED false`) `RESTORE`와 같이 목록을 되돌린다. 결과 글자는 남긴다.
- 결과 글자 영역(`result.component.tsx`)은 돌림판 밖에 있다. 공용 돌림판 래퍼가 `aria-hidden`이라 결과는 이 영역과 상태 알림으로 전한다(AC-44: 알림은 `SPIN_END`/`REVEAL` 때 한 번).
- 돌림판 페이지 문구에 "메뉴", "룰렛 돌리기"를 쓰지 않는다. 입력 예시는 "A, B, C" 같은 일반 단어.

결과 가리기와 공용 돌림판 (S-2 B 확정, 2026-11-23):
- 공용 돌림판은 멈춘 뒤 가운데 병뚜껑에 결과 이름을 쓰고 당첨 칸을 강조한다. 또 칸마다 항목 글자를 그린다. 바늘이 결과 칸에 서므로 칸 글자가 보이면 멈춘 자리만 보고 결과를 안다(사용자 피드백 1).
- 그래서 `isResultHidden`이 true인 동안 칸 글자, 강조 칸, 병뚜껑 글자를 모두 그리지 않는다. 칸 면(색), 테두리, 바늘, 회전은 그대로다. 회전 전 돌림판은 글자 없는 칸만 보인다(B의 단점으로 적었던 "비어 보임"은 사용자가 받아들였다). "일부러 가렸다"는 표시(바퀴 바깥 점선 고리, 결과 영역 안내 문장)는 ui-ux 개정안대로 기능 안에서 그리고 공용 컴포넌트에는 넣지 않는다.
- AC-31a 검증 조건은 두 가지다: (1) 1.2의 검사 범위 안에 입력 항목 글자 0개, (2) 강조 칸(`accentClassName`의 `fill-menu-lucky/20` 클래스를 가진 요소) 0개.

알려진 한계 (확인 21번, 막지 않음):
- 바늘이 멈춘 칸을 세어 입력 순서와 맞추는 추측은 막지 않는다. 칸 순서는 입력 순서(남은 목록 순서)와 같다.
- 공용 기본 칸 색은 `fill-card`/`fill-background` 번갈이이고 칸 수가 홀수면 마지막 칸만 `fill-muted`다. 이 경우 `fill-muted` 칸이 "마지막 항목" 표시가 되어, 글자가 없어도 바늘 위치에서 항목 번호를 셀 수 있다. 짝수면 번갈이만 있어 홀짝만 알 수 있다.
- ui-ux는 이 점을 확인하고, 막기로 하면 칸 색 규칙(예: `hidden`에서 모든 칸에 같은 허용 토큰을 `colorClassName`으로 넘긴다)을 제안한다. 이 대안은 기능 안 변경이라 공용 컴포넌트를 더 바꾸지 않는다. 채택하면 2.5와 AC-19 검사 대상을 같이 고친다. ui-ux가 제안하지 않으면 지금 설계(기본 칸 색) 그대로 간다.

### 3.5 공용 돌림판 변경과 `docs/roulette-common/` 영향 (S-2 B, 개정 신설)

`src/components/common/roulette.component.tsx` 변경(확정):
- prop 이름과 기본값은 그대로다: `isResultHidden?: boolean`, 기본 false.
- 지금 구현은 true일 때 강조 칸(`showHighlight`)과 병뚜껑 글자(`revealedLabel`)만 숨긴다. 칸 글자 조건에 `!isResultHidden`을 더한다: `showLabels = count >= 1 && count <= 28 && !isResultHidden`.
- 숨김은 회전 상태와 무관하다. 첫 렌더(서버 HTML 포함)에서도 true면 칸 글자 `<text>`가 없다.
- 바뀌지 않는 것: 칸 경로와 색, 테두리, 바늘, 회전 각도 계산, 글자 뒤집기 계산, 내부 `revealedIndex`, `onSpinEnd` 호출 시점과 횟수, 동작 줄이기 처리.
- JSDoc을 "true인 동안 칸 글자, 강조 칸, 가운데 글자를 그리지 않는다. 기본 false"로 고친다.
- false로 바뀌면 다음 렌더에서 칸 글자, 강조 칸(멈춘 뒤라면), 병뚜껑 글자가 함께 나온다.

메뉴 룰렛(`/meal`) 영향: 없다. `/meal`은 `isResultHidden`을 넘기지 않으므로 기본 false이고 마크업이 지금과 같다. 회귀는 `unit/shared/roulette.test.ts`의 기본값 경우와 `e2e/meal.spec.ts`로 확인한다.

`docs/roulette-common/` 영향(PM 처리, 사용자 확인 뒤. 이 설계에서는 고치지 않는다):
- `plan.md`: 범위의 "선택 prop 추가" 목록과 기능 목록에 `isResultHidden`(기본 false)을 한 줄 넣고, "결과 가리기" 규칙 절을 새로 둔다. 내용은 위 변경의 "숨기는 것 세 가지 / 바뀌지 않는 것 / 기본값이면 기존과 같은 마크업". AC 한 개를 더한다: "`isResultHidden`이 true면 칸 글자, 강조 칸, 가운데 글자가 마크업에 없고, false 또는 생략이면 지금과 같다".
- `status.md`: 남은 일 또는 결정 기록에 "2026-11-23 lucky-draw 요청으로 `isResultHidden` 추가, 칸 글자 숨김 포함" 한 줄.
- `qa-report.md`: 이번 회귀 결과(`unit/shared/roulette.test.ts`, `e2e/meal.spec.ts`)를 한 줄 덧붙인다.

### 3.6 문구·SEO 상수 영향 (개정 신설)

최종 문장은 ui-ux 문구 표와 사용자 승인으로 정한다. 아래는 바꿀 위치와 초안이다. 모든 새 문장은 금지어 검사(AC-40) 대상이다. "뽑기", "카드 뽑기", "뽑힌"은 금지어가 아니다. "당첨", "추첨" 같은 표현은 쓰지 않는다.

| 파일 | 상수 | 변경 |
|---|---|---|
| `lucky-draw-seo.constant.ts` | `LUCKY_DRAW_LOTS_SEO` | title, description, keywords, headerDescription을 카드 방식으로(SEO 절 표) |
| 같은 파일 | `LUCKY_DRAW_LADDER_SEO.keywords` | "당번 정하기"를 더한다(확인 19번) |
| `lucky-draw-copy-rule.constant.ts` | 부정형 예외 문장 목록 | 제비뽑기 meta description 문장을 새 문장으로 바꾼다(S-4 A. 목록 밖 "보장" 금지 유지) |
| `lucky-draw-faq.constant.ts` | `hub` 첫 답 | 공개 방식 설명을 "사다리 타기와 돌림판은 결과를 한꺼번에 보이거나 가렸다가 볼 수 있고, 사다리 타기는 한 명씩 열어 볼 수도 있습니다. 제비뽑기는 뒷면 카드를 한 장씩 엽니다."로 |
| 같은 파일 | `lots` | 4개로 다시 쓴다: "카드는 어떻게 섞이나요?"(섞기를 누르면 항목을 카드 자리에 무작위로 놓는다, 같은 이름은 줄마다 따로), "한 번 연 카드를 다시 열 수 있나요?"(없다, 남은 카드 모두 열기), "다시 섞으면 이전에 연 카드는 어떻게 되나요?"(열린 기록이 지워지고 입력은 유지), "순서 정하기에 쓸 수 있나요?"(카드를 연 차례대로 쓸 수 있다, 확인 19번) |
| 같은 파일 | `ladder` | 기존 답 하나에 "청소 당번처럼 이름마다 담당을 하나씩 짝지을 때 쓸 수 있습니다." 한 문장을 더한다(확인 19번) |
| 같은 파일 | `roulette` | 공개 방식 문장이 있으면 "결과 가리기를 켜면 칸 글자와 강조 칸도 결과 보기 전까지 가립니다"로. plan "페이지가 답할 질문"의 "결과 가리기를 켜면 바늘만 보고 결과를 알 수 있나?" 질문을 넣는다(답: 칸 글자가 없어 이름은 보이지 않는다. 칸 수를 세는 추측까지 막지는 않는다는 사실만 적는다) |
| `lucky-draw-guide.constant.ts` | `hub.paragraph` | 공개 방식 문장을 FAQ hub와 같은 내용으로 |
| 같은 파일 | `lots.steps`, `lots.paragraph` | 단계: 항목 입력(2~30개) / 섞기 / 카드를 눌러 한 장씩 열기 / 남은 카드 모두 열기 또는 다시 섞기. 문단: "카드 순서는 섞기를 누른 뒤 무작위로 정합니다. 카드를 열기 전에는 어떤 항목인지 화면에 없습니다. 같은 이름이 여러 줄이면 줄마다 카드가 따로 생깁니다." |
| 같은 파일 | `roulette` 문단 | 결과 가리기 문장이 있으면 칸 글자 숨김으로 |
| `src/constants/menu.constant.ts` | 제비뽑기 항목 | description "뒷면 카드를 섞어 두고 한 장씩 열어 항목 뽑기.", example "예: A, B, C 카드를 섞어 한 장씩 열기"(초안) |
| `lucky-draw-notice.constant.ts` | 없음 | 고지 문구는 바뀌지 않는다 |
| `hub/components/tool-links.component.tsx` | 없음 | 항목 수 표기(2~30개) 그대로. 허브 도구 역할 비교 한 줄은 ui-ux 개정안 문구 |

## 데이터 저장 위치

| 데이터 | 위치 | 이유 |
|---|---|---|
| 한계값, 사다리 높이, 회전값, 공개 방식 목록, 주소, 도구 이름 | 코드 상수 (`src/features/lucky-draw/constants`) | 모두에게 같고 거의 바뀌지 않는다 |
| 고지 문구, FAQ, 설명·사용 순서, SEO 값, 강조색 클래스 | 코드 상수 | 같은 이유. 서버 렌더링에 그대로 쓴다 |
| 검사 전용 금지어·예외 문장 | 코드 상수 (`lucky-draw-copy-rule.constant.ts`) | 테스트만 읽는다 |
| 메뉴 그룹과 항목 | `src/constants/menu.constant.ts` | 기존 메뉴·사이트맵 구조 |
| 입력 글(참가자, 결과, 항목), 공개 방식, 돌림판 옵션, 결과(사다리, 배정, 정지 칸), 제비뽑기 카드 수와 열린 카드, 연출 상태 | React 상태 (도구별 useReducer, 메모리) | plan F-7, AC-33, AC-34. 저장하면 안 되는 값이다. sessionStorage, localStorage, IndexedDB, 쿠키, URL(쿼리·해시) 모두 쓰지 않는다. 새로고침하면 사라진다 |
| 제비뽑기 섞은 카드 묶음(위치 → 항목 대응) | 제비뽑기 root의 `useRef` 안 클로저 (메모리) | 열기 전 대응이 리듀서 상태와 DOM에 남지 않게 한다(AC-26c, AC-26d). 입력 변경, 다시 섞기, 페이지 이탈로 사라진다. 저장하지 않는다 |
| 난수 풀(Uint32Array 256개) | 모듈 메모리 (`lucky-draw-random.util.ts`) | 개인 데이터가 아니다. 저장하지 않는다 |

- Supabase는 쓰지 않는다(회원가입 없음, 공유 데이터 없음).
- 세 도구는 서로 상태를 나누지 않는다. 페이지를 옮기면 이전 도구 상태는 사라진다. `<Activity>`를 쓰지 않는다.
- 분석 이벤트(뽑기, 카드 열기, 입력, 공개 방식)를 보내지 않는다(AC-35). `console`에 입력이나 결과를 찍지 않는다.

## API 계약

없음. 서버로 보내는 요청이 없다. 페이지는 정적이고 `searchParams`를 읽지 않는다.

| 메서드 | 경로 | 요청 | 응답 | 에러 |
|---|---|---|---|---|
| - | - | - | - | - |

## DB 스키마

없음. 테이블, 컬럼, 인덱스, RLS, 마이그레이션 모두 없음.

## 프론트 구조

- 페이지 (서버/클라이언트 구분):

| 경로 | 파일 | 렌더링 |
|---|---|---|
| `/lucky-draw` | `src/app/lucky-draw/page.tsx` (`LuckyDrawPage`) | 서버, 정적. 클라이언트 컴포넌트 없음 |
| `/lucky-draw/ladder` | `src/app/lucky-draw/ladder/page.tsx` (`LuckyDrawLadderPage`) | 서버, 정적. 클라이언트 경계 `LuckyDrawLadderComponent` 하나 |
| `/lucky-draw/roulette` | `src/app/lucky-draw/roulette/page.tsx` (`LuckyDrawRoulettePage`) | 서버, 정적. 클라이언트 경계 `LuckyDrawRouletteComponent` 하나(공용 `RouletteComponent`는 원래 `'use client'`) |
| `/lucky-draw/lots` | `src/app/lucky-draw/lots/page.tsx` (`LuckyDrawLotsPage`) | 서버, 정적. 클라이언트 경계 `LuckyDrawLotsComponent` 하나. 페이지 파일은 바꾸지 않는다(상수만 바뀐다) |

모든 페이지: `export const metadata = buildMetadata({...})`. 초기 상태가 고정값(빈 입력, 일괄 공개, 카드 없음)이라 서버 HTML과 첫 클라이언트 렌더가 같다.

- 컴포넌트 트리:

```
LuckyDrawPage (서버)
  ContentWrapperComponent type="lucky-draw"
    JsonLdComponent                         # BreadcrumbList, FAQPage
    TitleWrapperComponent                   # h1 "운빨 뽑기" (유일한 h1)
    LuckyDrawDisclaimerNoticeComponent      # 상시 고지
    LuckyDrawHubComponent                   # 세 도구 링크 + 설명 (MENU_LIST 그룹 항목)
    LuckyDrawGuideComponent page="hub"      # 설명 문단, 입력 미저장 안내
    LuckyDrawFaqComponent                   # 허브 FAQ

LuckyDrawLadderPage (서버)   # roulette, lots 페이지도 같은 틀
  ContentWrapperComponent type="lucky-draw"
    JsonLdComponent                         # BreadcrumbList, FAQPage
    TitleWrapperComponent                   # h1 "사다리 타기"
    LuckyDrawDisclaimerNoticeComponent      # h1 바로 아래 (AC-38)
    LuckyDrawNoscriptNoticeComponent
    LuckyDrawLadderComponent ('use client', root)
      LuckyDrawToolNavComponent             # isLocked
      LuckyDrawLinesInputComponent ×2       # 참가자, 결과 (입력 안내 포함)
      LuckyDrawRevealModeComponent          # 옵션 3개
      (시작 버튼, 결과 보기 버튼)
      LuckyDrawLadderNamePickerComponent
      LuckyDrawLadderBoardComponent
        LuckyDrawLadderPathComponent
      LuckyDrawLadderResultListComponent
      LuckyDrawStatusComponent
      LuckyDrawResultNoticeComponent        # 결과 영역 하단 (AC-39)
    LuckyDrawGuideComponent page="ladder"   # 서버. 설명 문단 + 사용 순서
    LuckyDrawFaqComponent                   # 서버

LuckyDrawRouletteComponent ('use client', root)
  LuckyDrawToolNavComponent
  LuckyDrawLinesInputComponent
  LuckyDrawRevealModeComponent              # 옵션 2개
  (뽑힌 항목 빼기 스위치: 기존 shadcn Switch)
  LuckyDrawRouletteSpinPanelComponent
    RouletteComponent (공용, isResultHidden)
  LuckyDrawRouletteResultComponent          # 결과 글자, 결과 보기 버튼
  LuckyDrawRouletteItemListComponent        # 남은 항목, 처음부터
  LuckyDrawStatusComponent
  LuckyDrawResultNoticeComponent

LuckyDrawLotsComponent ('use client', root, deckRef 보유)
  LuckyDrawToolNavComponent                 # isLocked 항상 false
  LuckyDrawLinesInputComponent
  (섞기/다시 섞기 버튼, 막힘 안내)
  (도구 막대: 열린 카드 k / N장, 남은 카드 모두 열기, 완료 안내)
  LuckyDrawLotsCardGridComponent            # cardCount가 있을 때만. <ol>
    LuckyDrawLotsCardComponent ×N           # 뒷면: 번호와 "열기", 열린 면: 항목
  LuckyDrawStatusComponent
  LuckyDrawResultNoticeComponent
```

- 재사용: `ContentWrapperComponent`, `TitleWrapperComponent`, `JsonLdComponent`, `Button`, `Switch`(shadcn, 있으면), `Textarea`(shadcn, 있으면), `cn()`, 공용 `RouletteComponent`. 없는 shadcn 컴포넌트는 새로 생성하지 않고 기본 요소를 쓴다.
- 상태 위치: 도구별 root가 커스텀 훅(useReducer)으로 상태를 갖고, 하위 컴포넌트는 props만 받는다(Container/Presentational, Controlled). 전역 store, Context, 브라우저 저장소를 쓰지 않는다. 버튼 활성 여부, 남은 목록, 보일 결과, 알림 문장은 상태에서 렌더링 중에 계산한다. 제비뽑기 카드 묶음만 예외로 root의 ref에 둔다(3.2).
- 예외·빈 상태: plan "예외·빈 상태"를 그대로 따른다. 설계에서 더한 것은 crypto 없음 안내(2.2)와 사다리 생성 실패 안내(2.3)뿐이다.

## SEO

title과 description은 초안이다(최종 문구는 ui-ux-design 문구 표와 사용자 승인). 레이아웃 템플릿이 " | 운빨연구소"를 붙인다. 상수는 `lucky-draw-seo.constant.ts`의 `LUCKY_DRAW_HUB_SEO`, `LUCKY_DRAW_LADDER_SEO`, `LUCKY_DRAW_ROULETTE_SEO`, `LUCKY_DRAW_LOTS_SEO`.

| URL | title | description | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/lucky-draw` | 운빨 뽑기 - 사다리 타기, 돌림판, 제비뽑기 | 사다리 타기, 돌림판, 제비뽑기로 당번과 순서, 고를 항목을 무작위로 정해 보는 오락 목적의 도구입니다. 입력한 이름은 저장하지 않으며 결과는 보장하지 않습니다. | BreadcrumbList, FAQPage | `MENU_LIST`에서 자동. 준비 중에는 빠지고 출시 때 들어간다 |
| `/lucky-draw/ladder` | 사다리 타기 - 온라인 사다리 게임으로 당번 정하기 | 참가자와 결과를 줄마다 입력하면 사다리를 그려 이름별 결과를 따라가 보는 오락 목적의 사다리 게임입니다. 2명부터 10명까지 할 수 있으며 결과는 보장하지 않습니다. | BreadcrumbList, FAQPage | 같음 |
| `/lucky-draw/roulette` | 돌림판 - 항목을 넣고 돌리는 랜덤 돌림판 | 항목을 28개까지 넣고 같은 크기의 칸으로 나뉜 돌림판을 돌려 하나를 고르는 오락 목적의 도구입니다. 뽑힌 항목을 빼고 다시 돌릴 수 있으며 결과는 보장하지 않습니다. | BreadcrumbList, FAQPage | 같음 |
| `/lucky-draw/lots` | 제비뽑기 - 뒷면 카드를 한 장씩 여는 카드 뽑기 (개정) | 항목을 30개까지 넣으면 뒷면 카드로 섞어 두고 한 장씩 열어 보는 오락 목적의 제비뽑기입니다. 결과는 보장하지 않습니다. (개정) | BreadcrumbList, FAQPage | 같음 |

- description의 "보장하지 않습니다"는 금지어 "보장"의 부정형이다. 예외 범위는 S-4. 제비뽑기 description을 바꾸면 `lucky-draw-copy-rule.constant.ts`의 예외 문장도 같은 커밋에서 바꾼다.
- 메타데이터: `buildMetadata({ title, description, pathname, keywords: [...], ogImage: { alt } })`. 직접 객체를 만들지 않는다(AC-3). `robots`는 기본(index, follow) 그대로(AC-8).
- canonical, og:url, BreadcrumbList 주소는 각 페이지 경로와 같다. `pathname`은 `/`로 시작한다. 제비뽑기 주소(`/lucky-draw/lots`)는 바꾸지 않는다.
- OG 이미지 태그: `getOgTag({ href })`가 허브는 그룹 이름 "운빨 뽑기", 도구는 항목 이름을 돌려준다. alt 초안: "운빨 뽑기 안내 이미지", "사다리 타기 안내 이미지", "돌림판 안내 이미지", "제비뽑기 안내 이미지". 외부 그림과 사진은 쓰지 않는다.
- 키워드(plan 후보, 검색량 조회 뒤 상수만 바꾼다)
  - 허브: 운빨 뽑기, 랜덤 뽑기 도구
  - 사다리: 사다리타기, 사다리 게임, 사다리타기 온라인, 사다리 타기 당번, 당번 정하기(개정, 확인 19번)
  - 돌림판: 돌림판, 돌림판 돌리기, 랜덤 돌림판
  - 제비뽑기: 제비뽑기, 카드 뽑기, 랜덤 뽑기(개정, 확인 19번. "순서 정하기", "발표 순서 정하기", "당번 정하기"는 뺀다)
  - 넣지 않는 것: 사다리 내기, 내기 룰렛, 벌칙 내기, 로또 번호, 메뉴 추천, 오늘 뭐 먹지, 룰렛 돌리기
- BreadcrumbList: 허브 "홈(사이트 이름) > 운빨 뽑기", 도구 "홈 > 운빨 뽑기 > (도구 이름)"(AC-6). `LUCKY_DRAW_BREADCRUMB_GROUP = { name: '운빨 뽑기', pathname: '/lucky-draw' }`.
- JSON-LD 배열은 `getLuckyDrawJsonLd(pageKey: LuckyDrawPageKeyType)`(`lucky-draw-seo.util.ts`)가 `jsonLdBreadcrumb`, `jsonLdFaq`로 만든다. 페이지와 단위 테스트가 같은 함수를 쓴다(AC-5, AC-6). 평점, 리뷰, ItemList, 가게 정보는 없다.
- FAQPage: `LUCKY_DRAW_FAQ[pageKey]`. 화면의 `LuckyDrawFaqComponent`도 같은 배열을 그린다. 페이지마다 3~4개. 질문 초안은 plan "페이지가 답할 질문"과 3.6 표, 답은 ui-ux-design 문구 표.
- 서버 HTML: h1, h1 아래 설명(`headerDescription`), 상시 고지, 설명 문단, 사용 순서, FAQ, noscript 안내가 들어간다(AC-4). 도구 영역은 빈 입력 상태로 서버에서 그려진다(제비뽑기 카드 없음).
- h1은 페이지마다 하나. `layout.tsx` 인증 메타 태그는 건드리지 않는다. 새 주소라 301이 필요 없다.

## 6. 메뉴 등록 (`src/constants/menu.constant.ts`, 확정)

```ts
export enum MENU_GROUP_NAME_ENUM {
  LOTTO = 'lotto',
  MEAL = 'meal',
  TAROT = 'tarot',
  FORTUNE = 'fortune',
  DREAM = 'dream',
  LUCKY_DRAW = 'lucky-draw',
}

// MENU_LIST 맨 끝(꿈 해몽 다음)
{
  group: MENU_GROUP_NAME_ENUM.LUCKY_DRAW,
  label: '운빨 뽑기',
  href: `/${MENU_GROUP_NAME_ENUM.LUCKY_DRAW}`,
  comingSoon: true, // 출시 때 지운다
  items: [
    {
      href: `/${MENU_GROUP_NAME_ENUM.LUCKY_DRAW}/ladder`,
      label: '사다리 타기',
      icon: '<ui-ux가 고른 lucide 이름>',
      colorClass: 'text-menu-lucky',
      description: '참가자와 결과를 넣고 사다리를 그려 이름별 결과를 따라가 보기.',
      example: '예: 4명이 청소 당번 정하기',
    },
    {
      href: `/${MENU_GROUP_NAME_ENUM.LUCKY_DRAW}/roulette`,
      label: '돌림판',
      icon: '<ui-ux>',
      colorClass: 'text-menu-lucky',
      description: '항목을 넣고 같은 크기 칸으로 나뉜 돌림판을 돌려 하나 고르기.',
      example: '예: A, B, C 중 하나 고르고 뽑힌 항목은 빼고 다시 돌리기',
    },
    {
      href: `/${MENU_GROUP_NAME_ENUM.LUCKY_DRAW}/lots`,
      label: '제비뽑기',
      icon: '<ui-ux>',
      colorClass: 'text-menu-lucky',
      description: '뒷면 카드를 섞어 두고 한 장씩 열어 항목 뽑기.', // 개정
      example: '예: A, B, C 카드를 섞어 한 장씩 열기', // 개정
    },
  ],
},
```

- 설명·예시는 초안이다. 금지어(plan 목록)가 없고, 사행·금전·메뉴 단어가 없다.
- 아이콘: lucide-react(기존 의존성, ISC)에서 ui-ux-design이 고른다. 주사위, 동전, 티켓, 선물처럼 사행·금전을 떠올리는 모양은 쓰지 않는다. `SECTION_ICONS['lucky-draw']`도 같은 기준. 제비뽑기 아이콘이 이미 정해져 있으면 카드 방식에 맞는지만 ui-ux가 확인한다(카드 모양이어도 트럼프·화투 무늬는 피한다).
- 위치는 맨 끝이다. PC 메뉴는 끝에서 두 번째까지 오른쪽 기준으로 열리므로(`alignRight`) 꿈 해몽과 운빨 뽑기가 오른쪽 기준이 된다. 그룹 항목이 세 개라 드롭다운이 생긴다.
- `theme.constant.ts` 추가 값:
  - `SECTION_ICON_COLOR['lucky-draw'] = 'text-menu-lucky'`
  - `SECTION_BADGE_COLOR['lucky-draw'] = 'bg-menu-lucky/10 text-menu-lucky border-menu-lucky/20'`
  - `BACKGROUND_COLORS['lucky-draw'] = 'bg-background'`
- `globals.css`: `--menu-lucky: <ui-ux가 정한 값>;`, `@theme`의 `--color-menu-lucky: var(--menu-lucky);`. 값은 종이 배경 대비 4.5:1 이상. `docs/conventions/design-system.md` 표 한 줄은 PM이 고친다. 참고: 규칙 문서는 `--menu-<key>`라고 적지만 그룹 키(`lucky-draw`)와 토큰 이름(`lucky`)이 다르다.
- 토큰(globals.css)은 이 색을 쓰는 tsx보다 먼저 들어가야 한다. 토큰 없이 클래스만 쓰면 색이 나오지 않는다.

## 7. 법적 문서 반영

문장은 초안이다. 최종 문구는 사용자 승인. 출시 전 같은 배포에 넣는다.

### 7.1 이용약관 (`src/app/terms/page.tsx`, frontend)

| 위치 | 변경 |
|---|---|
| 1장 마지막 문단 뒤 | 새 문단(개정): "또한 본 서비스는 사다리 타기, 돌림판, 제비뽑기(카드 한 장씩 열기)로 결과를 무작위로 정해 볼 수 있는 운빨 뽑기 기능을 오락 목적으로 제공합니다." |
| 9장 뒤 새 장 | "10. 운빨 뽑기 서비스" (아래 문단) |
| 기존 10~19장 | 번호만 11~20으로 바꾼다. 내용은 그대로 |
| 시행일 `EFFECTIVE_DATE` | 배포일 |

새 10장 문단 초안(첫 문단 개정, 나머지 그대로):
- "운빨 뽑기 서비스는 오락을 목적으로 제공됩니다. 사다리 타기와 돌림판의 결과는 이용자가 시작 또는 돌리기를 누른 뒤 무작위로 정해지고, 제비뽑기의 카드 배치는 이용자가 섞기를 누른 뒤 무작위로 정해지며 카드를 열어야 항목이 표시됩니다. 결과는 추천이나 평가가 아니고 어떤 결과도 보장하지 않습니다."
- "결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 관련이 없으며, 본 서비스는 결과에 보상을 붙이는 기능을 제공하지 않습니다."
- "이용자가 입력한 이름과 항목은 서버로 전송하거나 저장하지 않고 이용자의 브라우저 메모리에서만 사용하며, 페이지를 새로고침하거나 닫으면 사라집니다. 연락처, 주소처럼 개인을 알아볼 수 있는 정보는 입력하지 마십시오."
- "운빨 뽑기 서비스는 다른 메뉴나 외부 사이트로 연결하는 링크를 제공하지 않습니다."

- 제비뽑기 "결과 가리기"와 공개 방식 문장은 넣지 않는다(plan 문구 영향 목록).
- AC-48의 "로또 연결 없음"은 "로또"가 금지어라 "다른 메뉴나 외부 사이트로 연결하는 링크를 제공하지 않습니다"로 표현한다.
- "보장", "보상"은 부정형이다. 예외 범위는 S-4. 첫 문단 문장이 바뀌므로 `lucky-draw-copy-rule.constant.ts`에 약관 문장을 예외로 적어 두었다면 같은 문장으로 맞춘다.
- 장 번호가 1~20으로 연속인지 확인한다(AC-48). 지금 `e2e/`, `unit/`에 약관 장 번호를 직접 쓴 테스트는 없다(확인함).
- 현재 구현(`terms/page.tsx` 1장 "순서와 결과를", 10장 "시작, 돌리기, 섞기를 누른 뒤")은 위 초안으로 바꾼다.

### 7.2 개인정보처리방침 (`src/app/privacy/page.tsx`)

바꾸지 않는다(plan 확정 3번, AC-49). QA는 방침의 기존 문구(서버에 식별 정보를 저장하지 않는다, 브라우저 메모리 사용)와 이 기능의 동작이 어긋나지 않는지만 확인한다. 시행일도 바꾸지 않는다.

### 7.3 COMPLIANCE.md (PM 처리)

- 11장 끝(메뉴 룰렛 다음)에 `Lucky draw (/lucky-draw, /lucky-draw/ladder, /lucky-draw/roulette, /lucky-draw/lots)` 항목을 추가한다. 내용
  - 상시 고지(h1 바로 아래)와 결과 하단 고지. 문구 위치 `src/features/lucky-draw/constants/lucky-draw-notice.constant.ts`.
  - 무작위 방식: `crypto.getRandomValues`와 거절 샘플링만 쓴다. `Math.random` 대체 없음. 섞기는 Fisher-Yates. 사다리는 아래 결과 칸 순서를 섞어 배정이 균등하다. 칸별 가중치 없음. 검사 `unit/lucky-draw/`.
  - 개정 한 줄 추가: 제비뽑기는 카드 위치에 Fisher-Yates로 항목을 놓고, 카드를 열기 전에는 항목이 화면과 DOM에 없다. 한 번 연 카드는 다시 열 수 없다. 돌림판 "결과 가리기"는 결과 보기 전까지 칸 글자와 강조 칸도 그리지 않는다.
  - 보상 없음: 참가비, 상품, 포인트, 경품 없음. 금지어 `lucky-draw-copy-rule.constant.ts`, 검사 `unit/lucky-draw/lucky-draw-copy.test.ts`.
  - 로또 분리: 로또 링크와 단어 없음.
  - 입력: React 상태(제비뽑기 카드 묶음은 컴포넌트 ref)에만 둔다. 서버 전송, 브라우저 저장소, 쿠키, URL, 분석 이벤트(카드 열기 포함), 콘솔 출력 없음. 새 저장소 키 없음. 위치 요청 없음.
  - 광고: AdFit만. 결과 버튼과 결과 영역 안에 광고 없음.
  - **No legal review; the operator accepts the risk (decided 2026-11-23).** 위험 수용 항목: 사행성 해석, 화면 구성 저작권, 아동 이름 입력, 약관 10장 문구, 연령 게이트 없음. 출시 전 비법률 점검: 고지 문구, 금지어 검사, AdFit 심사("뽑기", "카드 뽑기" 단어), 사이트맵 등록, 준비 중 해제.
- 약관 장 번호가 밀리므로 11장의 기존 참조를 고친다: 운세 항목의 "Terms (chapter 13)" → "chapter 14". 메뉴 룰렛 항목의 "Terms (chapter 9)"는 그대로다.
- 1장 개인정보 항목에 한 줄을 넣을지는 plan대로 출시 전에 PM이 정한다.

### 7.4 README.md, 라이선스 문서

- README: 변경 없음(새 환경변수, API, 테이블 없음).
- `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`: 변경 없음. 새 라이브러리, 폰트, 이미지가 없다. 아이콘은 이미 쓰는 lucide-react다. 카드 그림은 CSS와 자체 마크업으로 만든다(외부 카드 이미지 없음).

## 8. 테스트 구조 (QA)

vitest는 `unit/**/*.test.ts`만 읽고 환경은 node다. `.tsx` 테스트 파일은 만들지 않는다. 서버 HTML 검사는 기존 기능처럼 Playwright `request.get`(JavaScript 실행 없음)으로 한다.

### 8.1 단위 (`unit/lucky-draw/`)

| 파일 | 대상 AC | 방법 |
|---|---|---|
| `lucky-draw-random.test.ts` | AC-25(섞기 함수), AC-27, AC-28 | 2.2 경계값 표를 주입 원천으로 검사(버릴 값 → 다시 뽑음, 경계 바로 아래 값 → 받음). 잘못된 n과 원천 값에 `RangeError`. 계속 버리는 원천에 `Error`. `vi.spyOn(Math, 'random')` 호출 0회, `crypto.getRandomValues` 호출 1회 이상. Fisher-Yates: 원천 [2, 1] 주입으로 3개가 그대로인 순서가 나올 수 있음(Sattolo 방지), n=3 10만 회에서 6가지 순서 비율이 1/6 ± 0.47%p |
| `lucky-draw-lots.test.ts` (신규) | AC-25, AC-26d, AC-27(제비뽑기) | 묶음: 항목 "가","나","다" 10만 회 `createLuckyDrawLotsDeck` 후 `open(0..2)` 글자 조합 6가지 비율이 1/6 ± 0.47%p. `open` 범위 밖·소수·음수에 `RangeError`. 2개 미만, 31개 이상에 `RangeError`. `Object.keys(deck)`가 `size`, `open`뿐이고 `JSON.stringify(deck)`이 `{"size":3}`. 같은 이름 여러 줄이면 같은 글자 카드가 줄 수만큼. `Math.random` 0회. 리듀서(`luckyDrawLotsReducer`): 서로 다른 항목 5개를 섞고 한 장 `OPEN` 뒤 `JSON.stringify(state)`에 연 항목 글자 하나만 있고 나머지 네 글자가 없음. 같은 위치 두 번 `OPEN` 무시, 다른 `runId` 무시, `OPEN_REST`는 안 연 위치만 붙임, 열린 수는 줄지 않음, `SET_TEXT`·`SHUFFLE`이 열린 기록을 비움 |
| `lucky-draw-ladder.test.ts` | AC-11, AC-12, AC-13 | n=2~10 각 1,000개 사다리에 `isLuckyDrawLadderValid`와 간격마다 가로선 1개 이상. 배정이 0~n−1 순열. `assignment[i]`가 `slotResultIndexes[trace(i).endColumn]`과 같음. 분포: n=2, 4, 6, 10 각 10만 회, 모든 (참가자, 결과) 칸 비율이 1/n ± 4σ(n=2 ±0.63%p, 4 ±0.55%p, 6 ±0.47%p, 10 ±0.38%p). 시도 초과 시 `Error`(항상 0을 주는 원천 주입) |
| `lucky-draw-input.test.ts` | AC-9, AC-16, AC-22 (해석 부분) | 공백·빈 줄·CRLF, 15자 경계(코드 포인트, 이모지 포함), 29·31번째 줄 `overflowCount`, 같은 이름 다른 id, `getLuckyDrawLadderBlock` 네 가지 |
| `lucky-draw-seo.test.ts` | AC-3, AC-5, AC-6, AC-7 | 각 페이지 `metadata`가 같은 상수로 만든 `buildMetadata()` 결과와 같음(페이지 import가 node에서 어려우면 소스 검사로 `buildMetadata(` 호출과 상수 이름 확인). `getLuckyDrawJsonLd`의 `@type`이 BreadcrumbList, FAQPage 두 개뿐, `aggregateRating`·`review` 없음, 빵부스러기 이름. `MENU_LIST` 그룹 1개·항목 3개·주소, `comingSoon`과 사이트맵 경로 계산 일치. 개정: 제비뽑기 keywords에 "순서 정하기", "발표 순서 정하기", "당번 정하기"가 없음 |
| `lucky-draw-copy.test.ts` | AC-19, AC-40, AC-41, AC-42 | `unit/helpers/copy-check.util.ts`로 고지, FAQ, 설명, SEO, 메뉴 항목, 입력 안내에 금지어 검사. 예외 문장은 `lucky-draw-copy-rule.constant.ts`의 목록만(S-4). "돈"은 단어 단위. 가격·칼로리·별점·후기 단어 없음. 연락처·주소 입력 권유, 아동·학생 단어 없음. `LUCKY_DRAW_ROULETTE_ACCENT_CLASS`와 칸 색이 허용 토큰 안. `LUCKY_DRAW_ROULETTE_SPIN`이 1.0초, 2바퀴(AC-17 보조). 구조 변경 없음, 새 문구는 같은 검사를 그대로 통과해야 한다 |
| `lucky-draw-compliance.test.ts` | AC-50 | `COMPLIANCE.md`에 lucky draw 항목과 "accepts the risk" 문장 |

- 분포 검사 실패 확률: 칸마다 약 0.006%지만 칸 수가 많아(n=10은 100칸, 네 n 합계 156칸) 전체 한 번 실행에서 우연히 실패할 확률은 약 1%다. 실패하면 한 번 다시 돌려 같은 칸이 또 벗어나는지 본다. 기준값은 plan 확정 6번이라 바꾸지 않는다.
- 실행 시간: 사다리 10만 회 × 4종은 crypto 풀 덕분에 수 초 안이다. 너무 느리면 QA가 PM에게 알린다(횟수는 plan 확정값이라 임의로 줄이지 않는다).
- `unit/shared/roulette.test.ts`(개정): "첫 렌더(회전 전)에는 숨김 여부와 무관하게 같은 마크업" 경우는 S-2 B와 맞지 않으므로 바꾼다. 새 경우: (1) `isResultHidden` 생략과 false의 마크업이 같다(메뉴 룰렛 회귀), (2) true면 첫 렌더 마크업에 항목 글자와 칸 글자 `<text>`가 없다, (3) false면 칸 글자가 있다, (4) true여도 칸 경로(`<path>`) 수와 바늘은 false와 같다. 회귀는 `unit/meal`, `e2e/meal.spec.ts`.

### 8.2 E2E (`e2e/lucky-draw.spec.ts`, 데스크톱·모바일)

- 허브·검색: AC-1, AC-2, AC-4(`request.get`으로 서버 HTML에 h1, 설명, 사용 순서, FAQ 질문), AC-7(사이트맵: `comingSoon`이면 `/lucky-draw` 없음, 아니면 네 주소), AC-8.
- 사다리: AC-9, AC-10, AC-14(가로선 `<line>` 좌표를 3.3 규칙으로 읽어 경로를 계산하고 표시 결과와 비교), AC-15.
- 돌림판: AC-16, AC-17(누른 뒤 결과 글자가 0.8~2.0초 사이에 한 번 나옴), AC-18, AC-20, AC-21.
- 돌림판 가리기(개정): AC-31은 "결과 가리기" 선택 직후(회전 전), 회전 뒤 "결과 보기" 전 두 시점에 1.2 검사 범위 안 항목 글자 0개와 강조 칸 0개, "결과 보기" 뒤 칸 글자·강조 칸·결과 글자가 함께 있음을 본다. AC-31a는 회전 뒤 "결과 보기" 전 두 조건만 본다(빼기 꺼짐). 확인 22번: 이 시점에 "돌리기"가 `aria-disabled`임을 같이 본다.
- 제비뽑기(개정, 기존 테스트를 다시 쓴다): AC-22, AC-23(섞기 전 카드 목록 없음, 섞기 뒤 카드 수 = 줄 수, 모든 카드 접근 이름이 "n번째 카드 열기" 꼴이고 항목 글자 없음), AC-24(남은 카드 모두 열기 뒤 글자 다중집합 = 입력 줄), AC-26(다시 섞기: 입력 유지, 열린 카드 0장, 카드 N장. 입력 변경: 카드 목록 사라짐), AC-26a(한 장 열기 → 그 카드에 글자, `aria-disabled="true"`, 다시 눌러도 글자 같음), AC-26b(남은 카드 모두 열기 → 모두 열림, 버튼 비활성, "모든 카드를 열었어요."), AC-26c(섞기 직후와 한 장 연 뒤, 1.2 검사 범위 안의 모든 텍스트와 모든 속성 값에 열지 않은 카드의 항목 글자가 없음. 입력은 숫자가 아닌 서로 다른 글자로 둔다), AC-46(320px에서 30장 섞고 모두 열어도 가로 스크롤 없음).
- 예측 방지·공개: AC-29(사다리·돌림판 시작 전 결과 글자, `aria-label`, `data-*`에 입력 항목 이름 없음 확인), AC-30(사다리 옵션 3개, 돌림판 2개, 제비뽑기에는 공개 방식 라디오 그룹과 "결과 보기" 버튼이 없음), AC-32(사다리만).
- 저장·개인정보: AC-33(세 도구 조작에 제비뽑기 섞기, 카드 열기, 남은 카드 모두 열기를 넣는다. localStorage·sessionStorage 키 0개, 쿠키에 입력 없음, URL 쿼리·해시 없음), AC-34, AC-35(카드 열기 중에도 모든 요청 URL·본문에 입력 이름 없음), AC-36, AC-37.
- 고지·접근성: AC-38, AC-39, AC-43(개정: 제비뽑기는 Tab으로 입력 → 섞기 → 카드로 이동해 Enter·Space로 열기 → 남은 카드 모두 열기 → 다시 섞기. 연 뒤 포커스가 같은 카드에 남음. 공개 방식 선택은 사다리·돌림판에서), AC-44, AC-45(`emulateMedia({ reducedMotion: 'reduce' })`. 제비뽑기는 카드 열기 연출 없이 바로 열림), AC-46(320px에서 `scrollWidth <= clientWidth`, 10명), AC-47.
- 약관: AC-48(`/terms`에서 "운빨 뽑기" 장의 글자와 장 번호 연속, 제비뽑기 문장이 카드 방식이고 "결과 가리기" 문장이 없음), AC-49(방침 페이지 변경 없음 확인).
- 도우미 `e2e/helpers/lucky-draw.util.ts`: 입력 채우기, 사다리 좌표 읽기, 저장소 검사. 개정: 카드 목록 읽기(위치 번호, 열림 여부, 열린 글자), "입력란·남은 항목 목록을 뺀 텍스트와 속성 값 모으기"(AC-23, AC-26c, AC-31a 공용).
- 셀렉터는 역할과 이름(`getByRole`, `getByLabel`)을 쓴다. 결과 정보를 담은 `data-testid`를 만들지 않는다. 카드는 `getByRole('list', { name: /카드/ })` 안의 `button`으로 찾는다.

## 보안

- 시크릿·환경변수: 새로 없음. `NEXT_PUBLIC_` 노출 없음.
- RLS: 해당 없음(DB 없음).
- 입력 검증: 자유 입력은 textarea 글뿐이다. `parseLuckyDrawLines`가 줄 수(최대 10/28/30), 줄 길이(15자), 전체 길이(textarea `maxLength` 1000)를 제한한다. 공개 방식과 옵션은 상수 집합 안에서만 오가고 reducer가 모르는 값은 무시한다. 제비뽑기 카드 위치는 `deck.open`과 리듀서가 범위(0..N−1 정수)를 다시 확인한다.
- XSS: 입력 글은 React가 이스케이프하는 텍스트 노드로만 그린다. `dangerouslySetInnerHTML`, `innerHTML`, SVG `<foreignObject>`에 입력을 넣지 않는다. 카드의 접근 이름(`aria-label`)에 들어가는 열린 항목도 React 속성 값으로만 넣는다. JSON-LD는 기존 `JsonLdComponent`에 상수만 넣는다. 입력은 JSON-LD, 메타, URL에 들어가지 않는다.
- API 남용·rate limit: API가 없어 해당 없음. 클라이언트 연산량은 입력 상한(최대 30개, 사다리 10×12)으로 묶인다.
- 브라우저 저장소: 쓰지 않는다. 민감정보가 없다. 입력 안내에서 연락처·주소 입력을 하지 말라고 알린다.
- 네트워크: 입력과 결과를 어떤 요청에도 싣지 않는다. 분석 이벤트(뽑기, 카드 열기, 공개 방식 변경)를 보내지 않는다. Vercel Web Analytics는 경로만 남기고 도구 경로에는 입력이 없다.
- 위치: 요청하지 않는다. `Permissions-Policy: geolocation=()`와 CSP는 바꾸지 않는다.
- 난수: 결과 조작을 어렵게 하려고 `crypto.getRandomValues`만 쓴다. 다만 화면 문구에서 "암호학적 난수" 같은 표현은 쓰지 않는다(plan 확정 8번).
- 외부 링크: 없다(로또, 다른 메뉴, 외부 사이트 링크 없음). 사이트 공통 헤더·푸터 링크는 기존 그대로다.

## 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 사다리 타기, 돌림판, 제비뽑기(카드 뽑기) 규칙 | 일반 놀이 규칙 | 저작권 대상 아님(규칙 자체) | 가능. 화면 구성·설명 문장은 직접 만든다. 화면 구성 저작권 해석은 법률 확인 필요, 위험 수용(2026-11-23) |
| Fisher-Yates, 거절 샘플링 | 공개 알고리즘(리서치 5장 출처) | 알고리즘이라 라이선스 없음. 코드 복사 없이 직접 작성 | 가능 |
| 고지, FAQ, 설명, 메뉴 문구 | 자체 작성 | 자체 저작 | 가능. 다른 사이트 설명 문장을 옮기지 않는다 |
| 사다리 그림, 카드 모양 | 자체 SVG·CSS | 자체 | 가능. 트럼프·화투 무늬나 외부 카드 이미지를 쓰지 않는다 |
| 공용 돌림판 | 기존 자체 컴포넌트 | 자체 | 가능 |
| 애니메이션 | framer-motion (기존) | MIT | 가능 |
| 아이콘 | lucide-react (기존) | ISC | 가능 |
| OG 이미지 | 기존 생성 방식, 외부 그림 없음 | 자체 | 가능 |
| 상표 | 사용 안 함(예시에 상표·프랜차이즈 이름 없음) | 해당 없음 | 해당 없음 |
| 광고 | 카카오 AdFit (기존) | AdFit 운영정책 | 사행성 콘텐츠 금지 정책이 있다. "뽑기", "카드 뽑기" 단어 심사 여부는 출시 전 사용자 확인 필요 |

- 개인정보: 이름과 항목을 입력받지만 메모리에서만 쓰고 저장·전송하지 않는다. 방침 변경 없음. 아동 이름 입력, 14세 미만 연령 게이트 없음은 법률 확인 필요, 위험 수용.
- 사행성: 보상·참가비·경품 없음, 가중치 없음, 로또 연결 없음. 사행성 해석은 법률 확인 필요, 위험 수용. 카드 뽑기 형식이 사행 연상을 키우는지는 같은 위험 수용 범위로 본다(새 법률 검토 요청 없음).
- 제휴·대가: 없음.

## 담당별 작업 순서

- db: 없음.
- backend: 없음. API와 서버 로직이 없다.
- frontend / qa / PM / ui-ux: 아래 순서. "의존"의 작업이 끝나야 시작한다.

최초 작업(진행 기록용, 2026-11-23 기준 구현됨):

| 순서 | ID | 담당 | 작업 | 의존 |
|---|---|---|---|---|
| 0 | P-0 | PM | 이 설계 승인, S-1~S-6 선택. S-1 A면 design-system.md 메뉴 색 표 한 줄 수정 | - |
| 1 | U | ui-ux-designer | 화면 배치, 문구 표(고지·FAQ 답·알림·안내·SEO 최종), 아이콘 이름, `menu-lucky` 값과 대비, 사다리 높이·경로 시간, 제비뽑기 섞는 연출 여부 | P-0 |
| 1 | F-1 | frontend | 타입(2.1), 한계·주소 상수(2.5), `lucky-draw-random.util.ts`, `lucky-draw-ladder.util.ts`, `lucky-draw-input.util.ts` | P-0. U와 동시에 가능(문구 없음) |
| 2 | Q-1 | qa | `lucky-draw-random`, `-ladder`, `-input` 단위 테스트 | F-1 |
| 3 | F-2 | frontend | 문구·SEO·FAQ·고지·금지어·테마 상수, `lucky-draw-seo.util.ts`, `shared/components/*`, 공용 변경(`menu.type.ts`, `theme.constant.ts`, `menu-icon.constant.ts`, `menu.constant.ts`(comingSoon true), `globals.css`) | F-1, U |
| 3 | F-R | frontend | `roulette.component.tsx`에 `isResultHidden` | P-0. F-2와 파일이 안 겹쳐 동시에 가능 |
| 4 | F-3 | frontend | 제비뽑기 화면 + 페이지 | F-2 |
| 4 | F-4 | frontend | 돌림판 화면 + 페이지 | F-2, F-R |
| 4 | F-5 | frontend | 사다리 화면 + 페이지 | F-2 |
| 4 | F-6 | frontend | 허브 페이지 | F-2 |
| 4 | F-7 | frontend | 약관 1장 문단, 10장, 번호 이동, 시행일(7.1) | P-0, 문구 승인 |
| 4 | PM-1 | PM | COMPLIANCE.md(7.3) | P-0 |
| 5 | Q-2 | qa | `lucky-draw-seo`, `-copy`, `-compliance` 단위, `unit/shared/roulette.test.ts`(S-2), `e2e/lucky-draw.spec.ts` 데스크톱·모바일. 마지막에 전체 회귀 한 번 | F-3~F-7, PM-1 |
| 6 | PM-2 | PM | `pnpm typecheck`, `pnpm lint`. 보안·고지·메타·JSON-LD·사이트맵 확인 | Q-2 |
| 출시 | PM-3 | PM, frontend | `comingSoon` 제거(frontend), AdFit 심사 확인, 사이트맵 재제출(사용자) | 사용자 출시 승인 |

2026-11-23 개정 재작업(이번 설계 승인 뒤):

| 순서 | ID | 담당 | 작업 | 의존 |
|---|---|---|---|---|
| 0 | P-0b | PM | 개정 설계 승인, `ui-ux-design.md` U4 선택. `docs/roulette-common/plan.md`·`status.md`·`qa-report.md` 갱신(3.5, 사용자 확인) | - |
| 1 | F-Rb | frontend | `roulette.component.tsx` `showLabels`에 `!isResultHidden`, JSDoc(3.5) | P-0b |
| 1 | F-1b | frontend | 타입 추가(2.1), `LUCKY_DRAW_REVEAL_MODES`에서 lots 제거(2.5), `lucky-draw-lots.util.ts`(2.6), `use-lucky-draw-lots.hook.ts` 다시 작성(3.2 상태·리듀서). 이 커밋에서 제비뽑기 root의 `.lots` 참조와 `order-list` import를 임시로 지워 타입 검사가 깨지지 않게 한다 | P-0b. F-Rb와 동시에 가능 |
| 2 | Q-1b | qa | `unit/lucky-draw/lucky-draw-lots.test.ts` 신규, `unit/shared/roulette.test.ts` 경우 교체(8.1) | F-1b, F-Rb |
| 2 | F-2b | frontend | 3.6 표의 상수 변경(`lucky-draw-seo`, `-faq`, `-guide`, `-copy-rule`, `menu.constant.ts` 제비뽑기 항목). 돌림판 가림 시각 처리(점선 고리, 결과 영역 안내 문장, 공개 방식 설명 한 줄)는 F-4b | P-0b, ui-ux 문구 승인 |
| 3 | F-3b | frontend | 제비뽑기 root 다시 작성, `card-grid.component.tsx`·`card.component.tsx` 신규, `order-list.component.tsx` 삭제 | F-1b, F-2b |
| 3 | F-4b | frontend | 돌림판 가림 시각 처리(ui-ux 개정안). root 상태 로직 변경 없음(`isResultHidden`, 확인 22번 이미 구현). ui-ux가 확인 21번 칸 색 규칙을 정하면 `colorClassName` 전달 추가 | F-Rb, F-2b |
| 3 | F-7b | frontend | 약관 1장 문단과 10장 첫 문단 교체(7.1) | 문구 승인 |
| 3 | PM-1b | PM | COMPLIANCE.md 개정 한 줄(7.3) | P-0b |
| 4 | Q-2b | qa | `e2e/lucky-draw.spec.ts` 제비뽑기 절, 돌림판 AC-31·31a, AC-30·33·35·43·48 갱신, 도우미 추가(8.2). `lucky-draw-seo`·`-copy` 단위 재실행. `e2e/meal.spec.ts` 회귀. 마지막에 전체 회귀 한 번 | F-3b, F-4b, F-7b, PM-1b, Q-1b |
| 5 | PM-2b | PM | `pnpm typecheck`, `pnpm lint`, 보안·고지·메타 확인 | Q-2b |

- F-3~F-6은 서로 다른 화면 폴더라 동시에 돌릴 수 있다. 단, 네 작업 모두 `shared/components/`와 `constants/`를 고치지 않는다는 조건이다. 고칠 일이 생기면 F-2 담당에게 되돌린다.
- 개정 작업에서 `constants/`는 F-1b(`lucky-draw-limit.constant.ts`만)와 F-2b(나머지)가 나눠 고친다. 같은 파일을 두 티켓이 고치지 않는다. `types/lucky-draw.type.ts`는 F-1b만 고친다.
- `shared/components/reveal-mode.component.tsx`는 고치지 않는다. 제비뽑기 root가 더 이상 import하지 않을 뿐이다.
- frontend-dev는 `COMPLIANCE.md`, `e2e/`, `unit/`, `docs/conventions/`를 고칠 수 없다(`guard-files.js`). 그래서 PM-1, Q-1, Q-2로 나눴다.

## 파일 충돌 위험

- `src/constants/menu.constant.ts`: 자주 바뀌는 파일이다. F-2 한 작업에서만 고치고(출시 때 `comingSoon` 한 줄은 PM-3), 다른 메뉴 작업과 시점을 맞춘다. 개정에서는 F-2b가 제비뽑기 항목 두 줄만 고친다. 지금 작업 트리에 커밋 전 변경이 있으므로 그 위에서 고친다.
- `src/types/menu.type.ts`, `src/constants/theme.constant.ts`: `MenuSectionKeyType`에 키를 더하면 `Record<MenuSectionKeyType, ...>` 맵 네 개가 같이 바뀌어야 타입 검사가 통과한다. F-2 한 커밋에서 같이 바꾼다. 같은 시기에 다른 기능이 섹션 키를 더하면 충돌한다.
- `src/constants/menu-icon.constant.ts`: import 목록과 맵을 같이 고친다. F-2에서만.
- `src/app/globals.css`: F-2에서 한 번.
- `src/components/common/roulette.component.tsx`: 메뉴 룰렛이 쓰는 공용 파일이다. F-R, F-Rb 한 작업씩만 고치고, 기존 prop의 기본 동작을 바꾸지 않는다. `unit/shared/roulette.test.ts`는 Q-2, Q-1b만 고친다. 같은 시기에 `/meal` 작업이 이 파일을 고치면 충돌한다.
- `src/features/lucky-draw/lots/**`: 개정에서 F-1b(훅, root 임시 정리)와 F-3b(컴포넌트, root 다시 작성)가 같은 root 파일을 차례로 고친다. F-3b는 반드시 F-1b 뒤에 돈다.
- `src/features/lucky-draw/constants/lucky-draw-limit.constant.ts`: F-1b에서 `LUCKY_DRAW_REVEAL_MODES` 타입과 값을 바꾸면 `ladder/`·`roulette/` root의 `.ladder`·`.roulette` 사용은 그대로 컴파일된다. 지금 제비뽑기 root의 `.lots` 사용은 F-1b가 같은 커밋에서 정리한다.
- `src/app/terms/page.tsx`: 장 번호가 10~19 전체가 바뀐다. 다른 기능이 같은 시기에 약관을 고치면 충돌이 크다. F-7, F-7b 한 작업씩만 고치고, `EFFECTIVE_DATE`는 마지막에 배포일로 정한다. 지금 작업 트리에 커밋 전 변경이 있다.
- `COMPLIANCE.md`: PM만. 11장 운세 항목의 약관 장 참조(13 → 14)도 같은 작업에서 고친다. 지금 작업 트리에 커밋 전 변경이 있다.
- `src/features/lucky-draw/constants/**`, `shared/components/**`: F-2만 만든다. F-3~F-6이 동시에 돌 때 이 폴더를 건드리면 충돌한다.
- `e2e/lucky-draw.spec.ts`, `e2e/helpers/lucky-draw.util.ts`: Q-2b 한 작업에서만 고친다.
- `docs/roulette-common/*`: PM만, 사용자 확인 뒤.
- `src/app/sitemap.ts`: 고치지 않는다.

## 사용자 선택지

| 번호 | 항목 | 대안 | 장단점 | 권장 |
|---|---|---|---|---|
| S-1 | 운빨 뽑기 색 토큰 (A 확정) | A: 새 토큰 `menu-lucky` 신설(`globals.css`, `design-system.md` 표 변경) | 장: 메뉴마다 색 하나 규칙을 지킨다. 로또·음식으로 읽히지 않는다. 단: 규칙 문서와 전역 CSS가 바뀐다. 값과 대비 확인이 ui-ux 단계에 생긴다 | A |
| | | B: 기존 `menu-dream`(염수, `#2a6672`)을 같이 쓴다 | 장: 규칙 문서와 CSS 변경 없음. 대비 확인이 이미 됐다. 단: 꿈 해몽과 색이 같아 메뉴 구분이 약하다. design-system의 "새 메뉴는 새 색" 규칙에서 벗어난다. `menu-lotto`는 로또로, `menu-meal`은 음식으로, `menu-fortune`(강황)은 금전·운세로 읽혀 대안에서 뺐다 | |
| S-2 | 돌림판 "결과 가리기" (**B 확정, 2026-11-23 사용자 결정**. 처음에는 A로 승인했다) | A: 공용 돌림판에 `isResultHidden` prop 추가. 가리는 동안 강조 칸과 병뚜껑 글자만 그리지 않는다 | 장: 변경이 작고 메뉴 룰렛은 그대로. 단: 공용 파일이 바뀐다. 바늘이 결과 칸에 서고 칸 글자가 보여 멈춘 자리만 보고 결과를 안다(구현 후 확인된 문제) | |
| | | B: A에 더해 가리는 동안(회전 전 포함) 칸 글자도 숨긴다 | 장: 멈춘 자리만 봐서는 결과 이름을 알 수 없다(AC-31a). 메뉴 룰렛은 기본값 false라 그대로. 단: 회전 전에도 칸에 글자가 없어 돌림판이 비어 보인다. 칸 수를 세어 입력 순서와 맞추는 추측은 남는다(3.4 알려진 한계) | B |
| | | C: 돌림판에서 "결과 가리기"를 빼고 "일괄 공개"만 둔다 | 장: 공용 파일 변경 없음. 단: plan AC-30, 확인 16번과 다르므로 planner 수정과 재승인이 필요하다 | |
| S-3 | 입력 상한 초과 처리 | A: textarea 글은 그대로 두고, 해석 결과로 앞의 N개만 쓰고 안내를 보인다(사다리는 초과 시 시작 막기, AC-9) | 장: 붙여넣기가 잘리지 않고 커서가 튀지 않는다. 단: 입력란에는 29번째 줄이 보이는데 쓰이지 않는다 | A |
| | | B: 한 줄씩 입력하고 "추가" 버튼으로 목록에 넣는다 | 장: "추가되지 않음"이 분명하다. 단: 이름을 한 번에 붙여넣기 어렵다(US-1과 어긋남). 컴포넌트가 늘어난다 | |
| S-4 | 부정형 "보장"·"보상" 허용 범위 | A: 상시 고지, 결과 하단 고지, 네 페이지 meta description, 약관 10장 문장을 정확한 문장 단위 예외로 둔다 | 장: plan 207행(description에 "보장 없음")과 AC-48(약관에 보장 없음)을 그대로 지킨다. 단: 예외 목록이 고지 두 문장보다 늘어난다(AC-40 문장 수정 필요, planner 반영) | A |
| | | B: 예외는 고지 두 문장만. description과 약관은 "약속하지 않습니다" 같은 다른 말로 쓴다 | 장: AC-40을 그대로 지킨다. 단: 검색 결과와 약관에서 "보장"이라는 분명한 말이 빠진다 | |
| S-5 | 난수 함수 위치 | A: 기능 전용 `features/lucky-draw/utils/lucky-draw-random.util.ts` | 장: 로또가 쓰는 `src/lib/random.ts`를 건드리지 않는다. `Math.random` 대체 없음과 원천 주입을 이 기능 규칙대로 둔다. 단: 비슷한 정수 뽑기가 두 곳에 생긴다 | A |
| | | B: `src/lib/random.ts`에 원천 주입형 함수를 새로 더한다(기존 함수는 그대로) | 장: 범용 코드는 공용에 둔다는 규칙에 가깝다. 다른 기능도 쓸 수 있다. 단: 같은 파일에 대체가 있는 함수와 없는 함수가 섞여 잘못 고를 수 있다. 로또 파일과 충돌 지점이 생긴다 | |
| S-6 | 사다리 아래 결과 칸 순서 | A: 결과 칸 순서를 Fisher-Yates로 섞는다. 사다리 모양은 자유 무작위 | 장: 사다리 모양과 상관없이 배정이 정확히 균등하다. 가리기·한 명씩 열기에서 입력 순서로 결과를 짐작할 수 없다. 단: 아래 칸이 입력한 순서와 다르게 놓인다 | A |
| | | B: 아래 칸은 입력 순서 그대로. 배정을 먼저 섞고 그에 맞게 가로선을 채운다(리서치 5-4 권장안) | 장: 아래 칸이 입력 순서라 익숙하다. 단: 가리기·한 명씩 열기에서 사용자가 입력 순서를 알고 있어 그림을 따라가면 결과를 미리 안다. 배정에 맞는 가로선을 자연스럽게 채우는 구현이 더 복잡하다 | |

## 확정한 가정 (2026-11-23 개정)

plan 확인 18~22번은 plan 권장안으로 확정했다(1.4). 그 밖에 이번 개정에서 설계가 정한 가정:

1. 확인 18: 제비뽑기는 공개 방식 선택, "결과 가리기", "결과 보기"가 없다. `LUCKY_DRAW_REVEAL_MODES`에서 lots 키를 뺀다.
2. 확인 19: 제비뽑기 키워드는 "제비뽑기, 카드 뽑기, 랜덤 뽑기". "당번 정하기"는 사다리 키워드로, "순서 정하기"는 제비뽑기 FAQ 질문 하나로.
3. 확인 20: 카드에 자리 번호(1~N)를 보인다.
4. 확인 21: 칸 수 세기 추측은 막지 않는다. 홀수 칸 수에서 마지막 `fill-muted` 칸이 기준점이 된다는 사실을 ui-ux에 넘기고, 칸 색 규칙은 ui-ux 제안이 있을 때만 바꾼다.
5. 확인 22: 돌림판 "결과 가리기"에서 "결과 보기" 전에는 "돌리기"를 막는다(이미 구현됨).
6. 카드 대응은 리듀서 상태가 아니라 root `useRef` 안 클로저에 둔다. AC-26d의 "화면 상태"를 리듀서 상태와 DOM으로 읽었다. 개발자 도구로 ref를 보는 것은 범위 밖 한계다.
7. 카드 열기는 연출 완료를 기다리지 않는 즉시 동작이라 제비뽑기에는 잠금 구간이 없다(입력, 도구 전환 링크를 항상 쓸 수 있다). plan의 "연출 중 잠금" 원칙은 사다리 경로와 돌림판 회전에만 해당한다고 보았다. ui-ux 개정안("0.2초라 잠그지 않는다")과 같다.
8. 연 카드는 `disabled`가 아니라 `aria-disabled="true"`인 같은 `<button>`으로 남겨 포커스를 지킨다. 카드 목록은 `<ol aria-label="카드 {N}장">`, 접근 이름은 "n번째 카드 열기" / "n번째 카드: 항목"(ui-ux 접근성 절).
9. "섞기"와 "다시 섞기"는 한 버튼이 이름을 바꾸는 방식이다(ui-ux U4 A). 다시 섞기 전 확인 창은 두지 않는다(plan에 없음).
10. "DOM에 항목 글자 없음" 검사 범위는 입력란과 돌림판 "남은 항목" 목록을 뺀 문서 전체다(1.2). AC-31a는 빼기 꺼짐으로 검사한다.
11. 돌림판에서 이미 공개된 결과가 있을 때 `all` → `hidden`으로 바꾸면 칸 글자와 결과를 다시 가린다(plan 공통 규칙 "결과 보기를 누르기 전까지 숨긴다").

## 변경 기록

- 2026-11-23 개정(plan 변경 기록 결정 1·2 반영). 바뀐 절: 머리말, 0, 1.1, 1.2, 1.3, 1.4(신설), 폴더 구조, 공용 파일 표, 2.1, 2.5, 2.6(신설), 3.1, 3.2(다시 작성), 3.4, 3.5(신설), 3.6(신설), 데이터 저장 위치, 프론트 구조, SEO, 6, 7.1, 7.3, 7.4, 8.1, 8.2, 보안, 상업적 이용, 담당별 작업 순서(개정 표 추가), 파일 충돌 위험, 사용자 선택지 S-1·S-2, 확정한 가정(신설). 2.2~2.4, 3.3, API, DB, 7.2는 바꾸지 않았다. `ui-ux-design.md` 개정안(카드 격자 `ol`, 접근 이름, 0.2초 열기 잠금 없음, U4 A, 돌림판 점선 고리)과 맞췄다.
