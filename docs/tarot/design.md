# tarot 설계서

입력: `docs/tarot/plan.md` (승인 2026-11-04), `docs/research/tarot.md`
참고 규칙: `docs/conventions/tech-stack.md`, `code-style.md`, `data-storage.md`, `seo.md`
작성일: 2026-11-04
상태: 승인 대기 (9장 D1~D5는 2026-11-04 사용자 확정). 2026-11-04 `docs/tarot/ui-ux-design.md`(승인)와 맞추어 4.1, 5.3, 6.1, 12.1~12.3, 13장을 수정했다.

`src/features/tarot/tarot-dev-guide.md`의 "추천 기술 스택"(Vue, Vitest 등)과 질문 필수·기록 저장·시종/기사/왕비 표기는 따르지 않는다. 이 설계서와 `plan.md`가 우선한다.

## 0. 요약

- 서버 저장, API, DB가 없는 순수 프론트 기능이다. 카드 데이터와 문구는 코드 상수, 오늘의 카드만 localStorage에 둔다.
- 라우트 2개(`/tarot/daily`, `/tarot/three-card`)는 서버 컴포넌트 페이지다. 설명 콘텐츠·면책·FAQ·위기 안내는 서버 HTML로, 뽑기 영역만 클라이언트 컴포넌트로 만든다.
- 카드 이미지는 인라인 SVG 컴포넌트로 자체 제작한다. 색은 `currentColor`와 디자인 토큰 CSS 변수만 쓴다. 카드 앞면·뒷면 SVG는 서버에서도 그릴 수 있는 순수 컴포넌트이고, 뒤집기 모션은 `TarotCardComponent`(클라이언트)에만 둔다.
- 새 라이브러리는 없다.
- 9장 결정 D1~D5는 모두 권장안으로 확정됐다(2026-11-04). 남은 PM 결정 요청은 없다.
- 사용자에게 노출되는 모든 문구(화면, 메타데이터, OG alt, FAQ, JSON-LD, 메뉴)는 합니다체로 쓴다(plan 결정 16).
- 화면 배치·색·모션·접근성 세부는 `docs/tarot/ui-ux-design.md`(승인)를 따른다. 이 문서와 겹치는 부분은 ui-ux-design에 맞추어 두었다.

## 1. 폴더 구조

```
src/app/tarot/
  daily/page.tsx                       # 수정: ComingSoon → 실제 페이지 (서버)
  three-card/page.tsx                  # 신규 (서버)

src/features/tarot/
  types/
    tarot.type.ts                      # 모든 타로 타입
  constants/
    cards/
      major.constant.ts                # TAROT_MAJOR_CARDS (22장, id 0~21)
      wands.constant.ts                # TAROT_WANDS_CARDS (14장, id 22~35)
      cups.constant.ts                 # TAROT_CUPS_CARDS (14장, id 36~49)
      swords.constant.ts               # TAROT_SWORDS_CARDS (14장, id 50~63)
      pentacles.constant.ts            # TAROT_PENTACLES_CARDS (14장, id 64~77)
    tarot-cards.constant.ts            # TAROT_CARDS (78장 합본), TAROT_CARD_COUNT
    tarot-spread.constant.ts           # 쓰리카드 위치(과거·현재·미래) 이름·안내
    tarot-question.constant.ts         # 질문 최대 길이, 분야 칩과 질문 예시
    tarot-safety.constant.ts           # 위기 표현 목록, 전문가 상담 표현 목록
    tarot-copy-rule.constant.ts        # 금지 표현·상표 명칭·허용 예외 문장 (검사용)
    tarot-notice.constant.ts           # 상시 면책, 결과 하단 면책, 상세 안내 8항, 위기 안내, 전문가 안내, 재뽑기 안내 등 고정 문구
    tarot-faq.constant.ts              # 페이지별 FAQ (화면과 JSON-LD가 같은 배열을 쓴다)
    tarot-seo.constant.ts              # 페이지별 title, description, keywords, og alt, 경로
  utils/
    tarot-draw.util.ts                 # 1장/3장 뽑기, 방향 결정
    tarot-safety.util.ts               # 입력 정규화, 위기 감지, 전문가 상담 감지
    tarot-card.util.ts                 # id로 카드 찾기, 표시 이름·alt 문자열 만들기
  services/
    tarot-daily-storage.service.ts     # 오늘의 카드 localStorage 읽기·쓰기·검증·지연 삭제
  hooks/
    use-tarot-question.hook.ts         # 질문 state(메모리), 길이 제한, 감지 결과 계산
  shared/components/
    tarot-card.component.tsx           # 'use client'. 카드 한 장(앞/뒤, 뒤집기 모션, 역방향 반전, 접근성 이름)
    card-face.component.tsx            # 앞면 SVG (메이저/마이너 분기). 순수 SVG, 서버 렌더 가능
    card-back.component.tsx            # 뒷면 SVG. 순수 SVG, 서버 렌더 가능
    card-frame.component.tsx           # 공통 테두리·번호·이름 배치 SVG. 순수 SVG
    major-symbol.component.tsx         # 메이저 22장 상징 (번호별 분기). 순수 SVG
    suit-icon.component.tsx            # 완드·컵·소드·펜타클 아이콘. 순수 SVG
    court-mark.component.tsx           # 페이지·나이트·퀸·킹 막대 표식. 순수 SVG
    card-reading.component.tsx         # 글만: 이름 + 방향 + 키워드 3개 + 요약 (+죽음 카드 보충). 카드 이미지 없음
    question-input.component.tsx       # 질문 입력(Controlled) + 민감정보 주의 안내
    reversed-toggle.component.tsx      # 역방향 사용 스위치(Controlled)
    crisis-notice.component.tsx        # 입력 감지 시 결과 전에 보여 주는 위기 안내 + "계속 보기"
    expert-notice.component.tsx        # 전문가 상담 안내 (결과에 덧붙임)
    disclaimer-notice.component.tsx    # 상시 면책 문구 (서버, h1 바로 아래)
    result-notice.component.tsx        # 결과 영역 하단 짧은 면책 + 109 상시 안내 (서버)
    detail-notice.component.tsx        # 상세 안내 8항 (서버)
    faq.component.tsx                  # FAQ 목록 (서버)
    noscript-notice.component.tsx      # "카드 뽑기에는 JavaScript가 필요합니다 …" (<noscript>, 서버)
  daily/
    components/
      root.component.tsx               # 'use client'. TarotDailyComponent
      storage-notice.component.tsx     # "오늘의 카드는 이 기기에 저장됩니다 …" (서버)
      guide.component.tsx              # 원카드 읽는 법, 정/역방향 설명 + 바보 정/역방향 그림 (서버, TarotCardFaceComponent 직접 사용)
    hooks/
      use-daily-reading.hook.ts        # useReducer 상태 머신 + 저장소 연동
  three-card/
    components/
      root.component.tsx               # 'use client'. TarotThreeCardComponent
      topic-chips.component.tsx        # 분야 칩 (Controlled)
      spread-result.component.tsx      # sr-only h2 "세 장의 결과" + 위치 이름(h3) + 위치 안내 + 카드 읽기(글) 3개
      guide.component.tsx              # 쓰리카드 읽는 법, 위치별 의미 + 뒷면 3장 배치도 (서버, TarotCardBackComponent 직접 사용)
    hooks/
      use-three-card-reading.hook.ts   # useReducer 상태 머신

src/lib/
  random.ts                            # (D1 확정) lotto의 random.util.ts를 옮긴 공용 난수 모듈
  date.ts                              # (D2 확정) getKoreaDateKey() 추가

docs/tarot/
  copy-log.md                          # 카드 문구 작성·검수 이력 (AC-21)
```

- 타로 기능 안에서만 쓰는 것은 모두 `features/tarot/` 안에 둔다. 다른 기능을 import하지 않는다.
- 컴포넌트 이름 예: `features/tarot/shared/components/card-reading.component.tsx` → `TarotCardReadingComponent`, `daily/components/root.component.tsx` → `TarotDailyComponent`, `three-card/components/root.component.tsx` → `TarotThreeCardComponent`.
- 화면 하나에서만 쓰는 컴포넌트는 처음엔 해당 화면 폴더에 두라는 규칙이 있지만, 위 `shared/components/`의 항목은 두 화면이 모두 쓰므로 처음부터 shared에 둔다.

## 2. 타입 (확정)

`src/features/tarot/types/tarot.type.ts`. 개발 담당이 임의로 바꾸지 않는다.

```ts
export type TarotArcanaType = 'major' | 'minor';
export type TarotSuitType = 'wands' | 'cups' | 'swords' | 'pentacles';
export type TarotOrientationType = 'upright' | 'reversed';

/** 방향 하나의 뜻: 키워드 정확히 3개 + 요약 1~2문장 */
export type TarotMeaningType = Readonly<{
  keywords: readonly [string, string, string];
  summary: string;
}>;

export type TarotCardType = Readonly<{
  /** 0~77 고유 번호. localStorage에 저장하는 값이므로 한 번 정하면 바꾸지 않는다 */
  id: number;
  arcana: TarotArcanaType;
  /** 메이저는 null */
  suit: TarotSuitType | null;
  /** 메이저: 카드 번호 0~21. 마이너: 1(에이스)~10, 11 페이지, 12 나이트, 13 퀸, 14 킹 */
  rank: number;
  /** 예: '바보', '완드 에이스', '컵 페이지' */
  nameKo: string;
  /** 예: 'The Fool', 'Ace of Wands', 'Page of Cups' */
  nameEn: string;
  upright: TarotMeaningType;
  reversed: TarotMeaningType;
  /** 카드 보충 문구. 현재는 죽음 카드(id 13)만 사용 */
  note?: string;
}>;

export type TarotDrawnCardType = Readonly<{
  cardId: number;
  isReversed: boolean;
}>;

export type TarotSpreadPositionKeyType = 'past' | 'present' | 'future';

export type TarotSpreadPositionType = Readonly<{
  key: TarotSpreadPositionKeyType;
  label: string;   // '과거' | '현재' | '미래'
  guide: string;   // 위치 안내 한 줄
}>;

export type TarotQuestionTopicKeyType = 'love' | 'career' | 'money' | 'daily';

export type TarotQuestionTopicType = Readonly<{
  key: TarotQuestionTopicKeyType;
  label: string;               // '연애·인간관계' | '직업·학업' | '재물·생활' | '일상 조언'
  examples: readonly string[]; // 칩을 누르면 입력칸에 채울 예시 (투자·도박 예시 금지)
}>;

/** localStorage 저장 형식 (오늘의 카드) */
export type TarotDailyStoredType = Readonly<{
  v: 1;
  date: string;      // KST 기준 'YYYY-MM-DD'
  cardId: number;    // 0~77
  isReversed: boolean;
}>;

export type TarotFaqItemType = Readonly<{ question: string; answer: string }>;
```

화면 상태 타입(리듀서)은 12.3에 확정해 두었다. 화면 전용이므로 각 hook 파일 안에 둔다.

카드 id 배정 (확정)

| 구분 | id 범위 | rank |
|---|---|---|
| 메이저 | 0~21 | 0~21 (힘 8, 정의 11) |
| 완드 | 22~35 | 1~14 |
| 컵 | 36~49 | 1~14 |
| 소드 | 50~63 | 1~14 |
| 펜타클 | 64~77 | 1~14 |

- 마이너 id = 22 + (수트 순서 0~3) × 14 + (rank − 1). 수트 순서는 완드, 컵, 소드, 펜타클.
- 코트 카드 한글 이름은 "수트 + 페이지/나이트/퀸/킹", 영문은 "Page/Knight/Queen/King of Wands" 형식. 에이스는 한글 "완드 에이스", 영문 "Ace of Wands", 카드 그림의 숫자 자리는 "A".
- 메이저 한글 이름은 리서치 4.2 "한글(기본)" 열을 그대로 쓴다.

## 3. 카드 데이터

### 3.1 파일 분할

- 메이저 1개 + 수트별 4개, 총 5개 파일로 나눈다(`constants/cards/*.constant.ts`). 파일당 14~22장이라 검수 단위(메이저 22장 샘플 → 나머지)와 맞고, 리뷰 diff가 작다.
- `tarot-cards.constant.ts`가 다섯 배열을 id 순서로 합쳐 `TAROT_CARDS: readonly TarotCardType[]`(길이 78)를 내보낸다. `TAROT_CARDS[i].id === i`가 성립해야 한다.
- 각 배열은 `as const satisfies readonly TarotCardType[]`로 선언해 키워드 개수(정확히 3개)와 필드 누락을 타입 검사로 막는다.
- 카드 데이터에는 작성 이력 필드를 넣지 않는다. 화면 번들에 들어갈 필요가 없기 때문이다.

### 3.2 데이터 형식: TS 상수 파일 (D3 확정)

카드 데이터는 TS 상수 파일(`major.constant.ts` 등)로 둔다. JSON 파일 안은 채택하지 않았다. 아래 표는 결정 근거 기록이다.

| | 확정: TS 상수 파일 | 미채택: JSON 파일 |
|---|---|---|
| 형식 | `major.constant.ts` 등 | `major.json` 등 + TS에서 import 후 타입 단언 |
| 장점 | `satisfies`로 키워드 3개·필드 누락을 컴파일 때 잡는다. 기존 규칙(`.constant.ts`)과 같다. | 코드가 아닌 순수 데이터라 문구 작성자(메인 AI·사용자)가 코드 파일을 건드리지 않는다. 다른 도구로 옮기기 쉽다. |
| 단점 | 문구 작성자가 TS 문법(따옴표, 쉼표)을 지켜야 한다. | JSON import는 타입이 넓게 잡혀 키워드 3개 같은 규칙을 컴파일 때 못 잡는다. 별도 검증 코드(zod 등)가 필요하다. 주석을 못 단다. |

### 3.3 문구 작성·검수 이력

- 위치: `docs/tarot/copy-log.md` (신규). 형식은 아래 표로 확정한다.

| id | 카드 이름 | 작성자 | 작성일 | 검수자 | 검수일 | 상태 | 웹 검색 샘플 확인 |
|---|---|---|---|---|---|---|---|
| 0 | 바보 (The Fool) | AI(Claude, 메인 세션) | 2026-xx-xx | 사용자 | 2026-xx-xx | 초안 / 검수 완료 | 해당 없음 / 일치 없음 / 수정함 |

- 상단에 작성 원칙(외부 해석 문장 미참조, 톤, 역방향 렌즈, 금지 표현)과 웹 검색 샘플 확인 기록(검색한 문장, 날짜, 결과)을 적는다.
- 작성 순서는 plan "콘텐츠 제작 원칙"의 (1)~(4)를 따른다.
- 저작권 원칙 (모든 사용자 노출 문구에 적용: 카드 해석, 가이드, FAQ, 위치 안내, 분야 예시, 메타데이터)
  - 타 사이트·책·앱·다른 타로 서비스의 문장을 복사하거나, 번역하거나, 어순·단어만 바꿔 옮기지 않는다.
  - 작성하는 동안 외부 해석 문장을 찾아보거나 참조하지 않는다. 카드의 일반적 의미 아이디어만 바탕으로 처음부터 새로 쓴다.
  - 웹 검색 샘플 확인에서 같거나 거의 같은 문장이 나오면 그 문장을 새로 쓰고, copy-log의 해당 칸에 "수정함"으로 남긴다.
  - "Rider-Waite", "라이더-웨이트" 등 상표성 명칭을 쓰지 않는다(AC-18).

### 3.4 기타 고정 문구

- 위치 안내(`tarot-spread.constant.ts`), 분야 칩 예시(`tarot-question.constant.ts`), 면책·위기·전문가·재뽑기·저장 안내(`tarot-notice.constant.ts`), FAQ(`tarot-faq.constant.ts`)는 모두 상수로 두고 화면과 JSON-LD가 같은 값을 쓴다.
- 분야 칩 예시에 투자 종목·매수 시점·복권·도박·로또 번호를 묻는 예시를 넣지 않는다(AC-12).
- 말투: 모든 고정 문구는 합니다체로 쓴다(plan 결정 16). plan "고지 문구(초안)"의 뜻은 그대로 옮기되, 초안이나 AC에 해요체 예시가 남아 있으면 합니다체로 바꿔 옮긴다. 상시 면책 문구(사용자 지정 문구)는 원문 그대로 쓴다. 화면 문구의 최종 형태는 `ui-ux-design.md` "문구 말투 정리" 표를 따른다.
- 모든 고정 문구는 3.3 저작권 원칙과 7.1 금지 표현 검사를 따른다.

## 4. 카드 이미지 (자체 제작 SVG)

### 4.1 구조

- 모든 카드는 인라인 `<svg>` React 컴포넌트다. 외부 이미지 파일, 외부 덱 그림·도안·뒷면, AI 이미지 생성 도구 결과물을 쓰지 않는다. `public/`에 카드 이미지 파일을 두지 않는다.
- 저작권 금지 사항 (카드 앞면·뒷면·가이드 그림 모두에 적용)
  - Rider-Waite(Rider-Waite-Smith) 덱과 그 파생 덱의 구도·인물·소품 배치를 따라 그리거나 닮게 그리지 않는다("Rider-Waite 풍" 도안 금지). 피해야 할 구체 도안 목록은 `ui-ux-design.md` "카드 SVG 시각 명세 > 공통 원칙"을 따른다.
  - 외부 아이콘 세트(lucide-react 포함, 무료·오픈 라이선스 여부와 관계없이)의 경로를 카드 그림에 쓰거나 복사하지 않는다. lucide-react는 버튼·메뉴 등 UI 아이콘에만 쓴다.
  - 외부 SVG·클립아트·스톡 이미지·다른 타로 사이트의 그림을 가져오거나 따라 그리지 않는다.
  - 새 폰트를 추가하지 않는다. SVG 안 글자(번호, 이름)는 사이트 기존 폰트(Pretendard, SIL OFL 1.1)를 `<text>`로 쓰고, 다른 폰트의 글리프를 경로로 변환해 넣지 않는다.
- 공통 viewBox는 `0 0 200 340`(세로 카드 비율)로 정한다. 실제 크기는 CSS로 조정한다. 좌표·선 굵기 등 시각 세부는 `ui-ux-design.md` "카드 SVG 시각 명세"를 따른다.
- `TarotCardFrameComponent`: 테두리, 상단 번호(메이저: "0" 또는 로마 숫자 I~XXI, 마이너: "A", 2~10, 코트는 막대 표식), 하단 한글 이름. 모든 앞면이 공유한다.
- `TarotMajorSymbolComponent({ rank })`: 0~21 번호별로 단순화한 상징 도형을 `switch`로 그린다. 상징 도안은 frontend-dev가 기본 도형(원, 다각형, 선, 경로)으로 새로 그린다. 22개 분기가 한 파일에 길어지면 같은 폴더에서 `major-symbol-0-10.component.tsx`, `major-symbol-11-21.component.tsx`처럼 나눠도 된다(이름만 규칙에 맞추면 됨).
- `TarotSuitIconComponent({ suit })`: 4개 수트 아이콘. 숫자 카드는 프레임 + 수트 아이콘 + 숫자(눈금자 표식 포함), 코트 카드는 프레임 + 수트 아이콘 + `TarotCourtMarkComponent({ rank })`.
- `TarotCourtMarkComponent({ rank })`: 직위를 높이가 다른 세로 막대 묶음(페이지 1개, 나이트 2개, 퀸 3개, 킹 4개)으로만 나타낸다. 이니셜(P/N/Q/K)이나 다른 글자는 쓰지 않는다. 막대 크기·간격은 `ui-ux-design.md` "마이너 56장"을 따른다.
- `TarotCardBackComponent`: 자체 기하 패턴 뒷면 1종. 장미·백합 도안 금지.
- `TarotCardFaceComponent({ card })`: arcana에 따라 메이저/마이너 조합을 고른다.
- 서버/클라이언트 경계 (확정)
  - `TarotCardFaceComponent`, `TarotCardBackComponent`, `TarotCardFrameComponent`, `TarotMajorSymbolComponent`, `TarotSuitIconComponent`, `TarotCourtMarkComponent`는 props만 받아 SVG를 돌려주는 순수 컴포넌트다. React 훅, 브라우저 API, `'use client'`, framer-motion을 쓰지 않는다. 그래서 서버 컴포넌트(가이드 그림)와 클라이언트 root 양쪽에서 import할 수 있다.
  - 접근성 이름(`role="img"`, `aria-label`, `<title>`)도 props로 받은 값만으로 만든다(4.3).
  - 뒤집기 모션(framer-motion)은 `TarotCardComponent` 한 곳에만 둔다. 이 파일은 `'use client'`를 붙이고 클라이언트 root에서만 import한다. 서버 컴포넌트에서 import하지 않는다.
- `TarotCardComponent({ card?, isReversed, isFaceUp, isFlipping?, flipDelayMs?, onFlipComplete? })`: 앞/뒤 전환, 뒤집기 모션, 역방향 표시를 맡는다.
  - 역방향: SVG를 감싼 요소에 `rotate-180`을 적용하고, 카드 밖(반전되지 않는 위치)에 "역방향" 글자를 함께 표시한다(AC-5).
  - 뒤집기 모션: framer-motion `rotateY`, 오늘의 타로 600ms, 3장 타로 카드당 500ms와 지연 0/120/240ms(`flipDelayMs`). `MotionConfig reducedMotion="user"`로 동작 줄이기 설정에서는 150ms opacity 교차로 바꾼다. 수치는 `ui-ux-design.md` "인터랙션·애니메이션"을 따른다.
  - `isFlipping`이 false이면 연출 없이 바로 그린다(재방문 복원, "다시 뽑기" 후 뒷면).
  - 연출이 끝나면 `onFlipComplete`를 부른다. 상위 root는 이 콜백으로 `FLIP_DONE`을 dispatch한다(12.3). 3장 타로는 마지막(미래) 카드의 완료로 판단한다.
  - 카드는 버튼이 아니며 포커스를 받지 않는다.

### 4.2 색

- SVG 안에 hex·rgb 색을 직접 쓰지 않는다. `fill="currentColor"`, `stroke="currentColor"`와 디자인 토큰 CSS 변수(`var(--menu-tarot)` 등, `globals.css`/`tokens.css`)만 쓰고, 색은 부모의 Tailwind 토큰 클래스로 정한다. `dark:` 클래스는 쓰지 않는다(design-guard 규칙).

### 4.3 대체 텍스트 (alt 규칙)

- 인라인 SVG에는 `alt` 속성이 없으므로 같은 역할을 `role="img"` + `aria-label` + 첫 자식 `<title>`로 준다. QA는 `getByRole('img', { name })`으로 확인한다(AC-17의 "alt"는 이 접근성 이름으로 검사한다).
- 앞면: `"{한글 이름} 카드, 정방향"` / `"{한글 이름} 카드, 역방향"` (예: "바보 카드, 정방향", "컵 퀸 카드, 역방향"). `tarot-card.util.ts`의 `getTarotCardAlt(card, isReversed)` 한 곳에서 만든다. 위치 이름(과거·현재·미래)은 넣지 않는다.
- 뒷면: `"타로 카드 뒷면"`.
- 장식용 내부 도형은 `aria-hidden`이다.
- 이미지 로드 실패 대응(plan 예외): 인라인 SVG라 별도 로드가 없고, 카드 이름·방향 텍스트는 항상 이미지 밖에 함께 표시한다.

## 5. 뽑기 로직

### 5.1 난수

- `crypto.getRandomValues` 기반, 거부 샘플링으로 모듈로 편향을 없앤 `secureRandomInt(maxExclusive)`를 쓴다.
- D1 확정: `src/features/lotto/utils/random.util.ts`를 `src/lib/random.ts`로 옮기고, 타로와 로또가 모두 `@/lib/random`에서 import한다. 로또 3개 파일은 import 경로만 바꾼다(동작 변화 없음). 타로 전용 난수 유틸은 만들지 않는다.
- `Math.random` 대체 경로는 기존 함수 동작을 그대로 둔다(구형 환경용).
- `sort(() => Math.random() - 0.5)` 같은 편향 있는 섞기는 쓰지 않는다.
- 뽑기는 모두 브라우저에서 한다. 질문은 뽑기 함수의 입력이 아니다(질문과 결과는 무관, F-12).

### 5.2 함수 (확정, `features/tarot/utils/tarot-draw.util.ts`)

```ts
/** 1장. isReversedEnabled가 false면 항상 정방향 */
export function drawTarotCard(isReversedEnabled: boolean): TarotDrawnCardType;

/** count장, 중복 없음. 0~77 배열에 부분 Fisher-Yates(앞에서 count번)를 적용 */
export function drawTarotCards(count: number, isReversedEnabled: boolean): readonly TarotDrawnCardType[];
```

- 방향: 역방향 옵션이 켜져 있으면 카드마다 `secureRandomInt(2) === 1`이면 역방향(50%). 꺼져 있으면 모두 정방향(AC-3).
- 쓰리카드는 `drawTarotCards(3, ...)` 결과를 순서대로 과거·현재·미래에 배치한다. 덱에서 꺼내는 방식이라 중복이 없다(AC-10).
- 덱을 펼쳐 고르는 연출과 섞기 연출은 넣지 않는다(ui-ux S3, S4 확정). "카드 뽑기"/"세 장 뽑기" 버튼 하나로 뽑는다.

### 5.3 오늘의 카드 (하루 1장 고정)

- 날짜 키: KST 기준 `'YYYY-MM-DD'`. D2 확정: `src/lib/date.ts`의 `getKoreaDateKey(date = new Date()): string`을 쓴다. 구현은 `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts()`로 `YYYY-MM-DD`를 만든다. 기존 `getKoreaTime()`으로 키를 만들지 않는다.
- 저장 키: `` `${process.env.NEXT_PUBLIC_SITE_ENG_NAME}_tarot_daily_v1` `` (기존 `consent.provider.tsx`의 키 형식을 따른다). 오늘의 카드는 이 키 하나만 쓴다.
- 저장 값: `TarotDailyStoredType`를 JSON 문자열로. 날짜, 카드 번호, 방향 외의 값은 넣지 않는다(질문, 감지 결과, 역방향 옵션 설정 저장 금지).
- 정리 규칙 (확정)
  - 키 하나에 값은 항상 최대 1개다. 새 카드를 뽑으면 같은 키에 `setItem`으로 덮어쓴다. 날짜별 키를 만들거나 값을 배열로 쌓지 않는다.
  - 지연 삭제: 페이지 마운트 후 `readTarotDailyCard`가 값을 읽을 때, 저장 날짜가 오늘(KST)이 아니거나 값이 손상·형식 불일치·알 수 없는 카드 번호이면 그 자리에서 `removeItem`으로 삭제하고 `null`을 반환한다. 화면은 `idle`(뽑기 전)로 가서 새로 뽑게 한다.
  - `removeItem`이 실패해도(저장소 접근 불가, 보안 예외 등) try/catch로 삼키고 오류 없이 `null`을 반환한다. 다음 뽑기의 `setItem`이 성공하면 어차피 덮어써진다.
  - 만들지 않는 것
    - 타이머(`setTimeout`)로 자정에 삭제: 페이지가 닫혀 있으면 실행되지 않고, 다음 방문 시 지연 삭제로 같은 결과를 얻으므로 필요 없다.
    - 서비스워커로 자정에 삭제: 이 프로젝트에 서비스워커가 없고, 값 하나를 지우려고 새 인프라를 들이는 것은 과하다.
    - 삭제 버튼 UI: 기획에 없는 기능이고, 삭제 버튼은 사실상 재뽑기 수단이 되어 하루 1장 고정(AC-6)과 충돌한다.
  - 남는 값 허용: 앱을 다시 열지 않은 사용자의 마지막 값 1개는 브라우저에 남을 수 있다. 개인정보가 아니고(날짜·카드 번호·방향) 크기가 약 50바이트라 허용한다. 사용자는 브라우저 설정에서 언제든 지울 수 있다.
- `tarot-daily-storage.service.ts` (확정)

```ts
/** 저장소 쓰기 가능 여부. 테스트 키 set/remove를 try/catch로 확인 */
export function isTarotStorageAvailable(): boolean;

/**
 * 오늘(todayKey) 저장값이 유효하면 반환한다.
 * 값이 없으면 null. 지난 날짜·손상·형식 불일치·알 수 없는 카드 번호면
 * 키를 removeItem으로 삭제한 뒤 null(삭제 실패는 무시). 예외를 던지지 않는다
 */
export function readTarotDailyCard(todayKey: string): TarotDrawnCardType | null;

/** 같은 키에 덮어쓴다(값은 항상 1개). 저장 성공 여부를 반환. 실패해도 예외를 던지지 않는다 */
export function writeTarotDailyCard(todayKey: string, drawn: TarotDrawnCardType): boolean;
```

- 읽기 검증 (하나라도 걸리면 해당 키를 `removeItem`으로 삭제하고 `null` 반환. 삭제 실패는 무시)
  - `getItem` 자체가 예외를 던짐 → 삭제 시도 없이 `null`(저장소 불가)
  - 값이 없음(`null`) → 삭제할 것 없이 `null`
  - `JSON.parse` 실패 → 삭제
  - 객체가 아님, `v !== 1` → 삭제
  - `date`가 `/^\d{4}-\d{2}-\d{2}$/`가 아님 → 삭제
  - `date`가 `todayKey`와 다름(어제 등 지난 날짜, 기기 시계 변경으로 생긴 다른 날짜 모두) → 삭제
  - `cardId`가 정수가 아니거나 0~77 밖이거나 `TAROT_CARDS`에 없음 → 삭제
  - `isReversed`가 boolean이 아님 → 삭제
  - 모두 통과 → `{ cardId, isReversed }` 반환(삭제하지 않음)
- 흐름 (`use-daily-reading.hook.ts`, useReducer. 상태 형태는 12.3 확정)
  - 상태: `checking`(마운트 전·저장소 확인 중) → `idle`(뽑기 전) / `revealed`(오늘 카드 있음, `source: 'restored'`). 뽑기 후 위기 표현이 있으면 `crisis` → "계속 보기" → `revealed`(`source: 'drawn'`). 위기 표현이 없으면 바로 `revealed`(`source: 'drawn'`).
  - 마운트 후 `useEffect`에서 `readTarotDailyCard(getKoreaDateKey())`를 부른다. 서버 HTML과 첫 클라이언트 렌더는 `checking` 상태(카드 뒷면 + 컨트롤 자리 스켈레톤)로 같게 그려 hydration 불일치를 막는다. 지난 값·손상값의 삭제는 이 호출 안에서 일어난다.
  - 저장값이 있으면 `revealed`(`source: 'restored'`, `isFlipping: false`)로 연출 없이 앞면을 바로 보여 주고, 결과 위에 "오늘 뽑은 카드입니다 …" 상태 줄을 둔다. 재뽑기 버튼은 없다(AC-6). 이때 역방향 옵션은 결과를 바꾸지 않는다.
  - 뽑기 클릭 시점에 날짜 키를 다시 계산한다(페이지를 연 채 자정이 지난 경우 대응). 뽑은 즉시 `writeTarotDailyCard`로 같은 키에 덮어써 저장하고, 위기 표현이 있어도 저장은 같은 시점에 한다(카드 선택은 질문과 무관).
  - 저장 실패 또는 `isTarotStorageAvailable() === false`: 오류 화면 없이 결과를 보여 주고 "이 브라우저에서는 오늘의 카드를 저장할 수 없습니다. 새로고침하면 다른 카드가 나올 수 있습니다." 안내를 띄운다.
  - 쿠키 동의 상태(`ConsentProvider`)를 읽지 않는다. 오늘의 카드 저장은 기능용 저장이라 동의와 무관하다(AC-27).
- 3장 타로는 어떤 저장소에도 쓰지 않는다(AC-25).
- 테스트 관점 (qa가 `e2e/tarot.spec.ts`에 포함)
  - 저장 키에 어제(KST) 날짜의 유효한 값을 넣고 `/tarot/daily`를 열면, 해당 키가 삭제되고(`getItem`이 `null`) 뽑기 버튼이 보이며 새로 뽑을 수 있다. 뽑은 뒤 키에는 오늘 날짜 값 1개만 있다.
  - 저장 키에 손상값(JSON이 아닌 문자열, `v`가 1이 아님, `cardId`가 78 이상, `isReversed`가 문자열 등)을 넣고 열면, 오류 화면 없이 키가 삭제되고 뽑기 버튼이 보인다.
  - 오늘 날짜 유효값이 있으면 삭제되지 않고 같은 카드가 바로 보인다(AC-6 회귀 확인).
  - 뽑기를 여러 번 반복해도(다른 날짜로 바꿔 가며) 타로 관련 localStorage 키는 1개만 존재한다.

## 6. 질문 입력과 안전 안내

### 6.1 질문

- `use-tarot-question.hook.ts`: `useState<string>('')` 하나만 쓴다. 저장소, URL, 전역 store(zustand), Context에 올리지 않는다.
- 길이: `TAROT_QUESTION_MAX_LENGTH = 100`. 입력 요소에 `maxLength={100}`을 주고, `onChange`에서도 `slice(0, 100)`으로 한 번 더 자른다(붙여넣기 대비). 글자 수 표시는 ui-ux를 따른다("0/100", 100자 도달 안내).
- `trim()` 결과가 빈 문자열이면 질문 없음으로 처리한다.
- 입력 요소 규칙
  - `<form>`으로 감싸 제출하지 않는다. 감싸야 하면 `onSubmit`에서 `preventDefault()` 한다. 질문이 쿼리스트링·URL·`name` 기반 폼 전송으로 나가지 않게 `name` 속성을 주지 않는다. 입력칸의 Enter는 뽑기 버튼과 같은 동작을 하되 폼 제출은 하지 않는다.
  - `autoComplete="off"`.
  - 기존 shadcn `Input`(`src/components/ui/input.tsx`, 한 줄)을 쓴다. textarea는 추가하지 않는다(ui-ux 확정).
- 질문 근처에 민감정보 주의 안내(plan 상세 안내 7항 문구)를 둔다(AC-23).
- 질문은 결과 화면에 그대로 보여 줄 수 있다(React 텍스트 렌더링, `dangerouslySetInnerHTML` 금지).

### 6.2 위기 표현·전문가 상담 감지 (확정, `tarot-safety.util.ts`)

```ts
/** NFC 정규화 → 소문자 → 문자·숫자(\p{L}\p{N}) 외 전부 제거 */
export function normalizeTarotQuestion(text: string): string;

/** TAROT_CRISIS_TERMS 중 하나라도 부분 일치하면 true */
export function hasTarotCrisisSignal(text: string): boolean;

/** TAROT_EXPERT_TERMS 중 하나라도 부분 일치하면 true */
export function hasTarotExpertTopic(text: string): boolean;
```

- 정규화: `text.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')`. 띄어쓰기·특수문자 변형("죽고 싶", "자.살")을 같은 문자열로 만든다.
- 목록 파일: `tarot-safety.constant.ts`
  - `TAROT_CRISIS_TERMS`: plan "위기 표현 감지 목록"을 그대로 옮긴다(공백 없는 형태, 영문은 소문자). "죽음", "죽겠", "죽을만큼", 단독 "죽"은 넣지 않는다.
  - `TAROT_EXPERT_TERMS` (설계 확정 목록, 사용자가 추가·삭제 가능):
    - 건강: 진단, 수술, 치료, 병원, 질병, 투병, 항암, 암진단, 암수술, 암검사, 우울증, 공황장애, 처방
    - 법률: 소송, 고소, 고발, 재판, 변호사, 법원, 합의금, 형사처벌
    - 투자·금융: 주식, 코인, 비트코인, 가상화폐, 투자, 대출, 부동산, 청약, 매수, 매도
    - 단독 "암", "약", "법", "선물"은 오탐이 많아 넣지 않는다.
- 동작
  - 뽑기 클릭 시 `hasTarotCrisisSignal(question)`이 true면 결과 대신 `TarotCrisisNoticeComponent`를 먼저 보여 주고, "계속 보기"를 누르면 결과를 보여 준다(AC-29). 결과를 막지 않는다.
  - `hasTarotExpertTopic(question)`이 true면 결과 아래에 `TarotExpertNoticeComponent`를 덧붙인다(AC-31). 두 감지는 동시에 참일 수 있다.
  - 감지 결과는 렌더링 중(또는 클릭 핸들러 안에서 다음 상태를 고를 때)에 계산하는 값이다. 리듀서 상태에 감지 결과를 저장하지 않는다. 콘솔 출력, 네트워크 요청, 분석·알림 이벤트, 저장소 기록을 하지 않는다(AC-30).
- 상시 위기 안내(109)는 입력 감지와 별개로 서버 컴포넌트(`TarotResultNoticeComponent`)에 항상 표시한다(AC-28).
- 상담전화 다섯 곳(109, 1577-0199, 1588-9191, 1388, 1366)의 번호와 운영 시간은 출시 전 재확인 항목이다(plan). 상시 안내(결과 하단)는 다섯 곳 전부, 입력 감지 위기 패널은 앞의 세 곳만 보인다(2026-11-05 결정). 번호 목록과 문구는 `tarot-notice.constant.ts` 한 곳에만 두고 컴포넌트는 상수 배열을 그린다.

## 7. 표현 규칙 검사와 면책 문구 위치

### 7.1 금지 표현 검사

- 목록: `tarot-copy-rule.constant.ts`
  - `TAROT_FORBIDDEN_TERMS`: plan "표현 규칙"의 금지 표현(100%, 적중, 정확히 맞, 백발백중, 족집게, 무조건, 반드시, 확실히, 보장, 틀림없, 운명이 바뀐, 인생이 바뀐, 운명을 바꿔, 대박, 합격합니다, 헤어집니다, 성공합니다) + 미래 확정 어미 정규식(`게 됩니다`, `게 될 거예요`, `게 될 것입니다`).
  - `TAROT_TRADEMARK_TERMS`: `Rider-Waite`, `Rider Waite`, `라이더-웨이트`, `라이더 웨이트`, `웨이트`(대소문자 무시).
  - `TAROT_COPY_ALLOWED_SENTENCES`: 예외로 허용하는 부정 고지 문장 원문(결과 하단 면책 문구 등). 검사 전 대상 문자열에서 이 문장을 먼저 지운 뒤 금지 표현을 찾는다. 예외 문장은 `tarot-notice.constant.ts`의 면책 문구에서만 가져온다.
  - 이 상수는 화면에서 쓰지 않는다. 검사 전용이다(번들에 들어가지 않도록 화면 코드에서 import하지 않는다).
- 검사 방법: D4 확정, Playwright 테스트 `e2e/tarot-copy.spec.ts`. Node 스크립트 안은 채택하지 않았다. 아래 표는 결정 근거 기록이다.

| | 확정: Playwright 테스트 `e2e/tarot-copy.spec.ts` | 미채택: `scripts/check-tarot-copy.mjs` |
|---|---|---|
| 방법 | (1) 브라우저 없이 `TAROT_CARDS`, FAQ, 고지 문구, 분야 예시, `MENU_LIST`의 타로 항목, `tarot-seo.constant.ts`를 import해 검사. (2) `request.get('/tarot/daily')` 등으로 받은 서버 HTML(메타데이터·JSON-LD 포함)을 검사. | 데이터 파일을 문자열로 읽어 정규식 검색 |
| 장점 | 새 도구가 없다(이미 쓰는 Playwright, tsconfig 경로 별칭 지원). 실제 출력 HTML까지 본다. QA 단계에서 자동으로 돈다. | 개발 서버 없이 빠르다. |
| 단점 | HTML 검사는 개발 서버가 필요하다. 데스크톱·모바일 프로젝트에서 두 번 돈다. | TS를 직접 import하기 어려워 문자열 검색만 가능, 메타데이터·렌더링 결과는 못 본다. `package.json` 스크립트 추가가 필요하다. |

- 사용자 검수 때도 같은 목록으로 본다. 검사 실패는 해당 문구 작성자에게 되돌린다.

### 7.2 면책·안내 컴포넌트 배치

모두 서버 컴포넌트(`'use client'` 없음)라 JS를 꺼도 HTML에 있다(AC-22, AC-33).

| 컴포넌트 | 위치 | 내용 |
|---|---|---|
| `TarotDisclaimerNoticeComponent` | h1(`TitleWrapperComponent`) 바로 아래, 뽑기 영역 위 | 상시 면책 문구(사용자 지정 문구) |
| `TarotResultNoticeComponent` | 뽑기·결과 영역(클라이언트 root) 바로 아래, 항상 렌더링 | 결과 화면 짧은 면책 문구 + 위기 안내(109) |
| `TarotDetailNoticeComponent` | 페이지 하단 | 상세 안내 8항 |
| `TarotDailyStorageNoticeComponent` | `/tarot/daily` 뽑기 영역 근처 | "오늘의 카드는 이 기기에 저장됩니다(한국 시간 자정 기준). 다른 기기에서는 다른 카드가 나올 수 있습니다." (AC-8) |
| `TarotNoscriptNoticeComponent` | 뽑기 영역 자리 | `<noscript>` 안 "카드 뽑기에는 JavaScript가 필요합니다. 브라우저 설정에서 JavaScript를 켜 주시기 바랍니다." |

- 결과 하단 문구를 클라이언트 결과 안에 넣지 않고 서버 컴포넌트로 형제 위치에 둔다. 그래야 서버 HTML에 있고 결과가 나온 뒤에도 결과 바로 아래에 보인다.
- 접기·툴팁·스크롤 후 노출로 숨기지 않는다.

## 8. 데이터 저장 위치

| 데이터 | 위치 | 이유 |
|---|---|---|
| 카드 78장 이름·키워드·요약 | 코드 상수 (`features/tarot/constants/cards/`) | 모두에게 같고 자주 안 바뀐다. `data-storage.md` 예시 그대로 |
| 쓰리카드 위치, 분야 칩 예시, 고지 문구, FAQ, 감지 목록, 금지 표현 목록 | 코드 상수 | 같은 이유. 사용자가 목록을 고칠 때 코드 리뷰로 이력이 남는다 |
| 오늘의 카드 (날짜, 카드 번호, 방향) | localStorage (키 1개, 값 최대 1개, 지난 값은 다음 방문 시 삭제) | 작고 기기에 남아야 한다(같은 날 재방문 시 같은 카드). 개인 식별 정보 아님. 정리 규칙은 5.3 |
| 질문 텍스트 | 메모리(React state)만 | plan 결정 5. 서버, localStorage, sessionStorage, 쿠키, URL, 전역 store 모두 금지 |
| 위기·전문가 감지 결과 | 렌더링 중 계산값 (저장 안 함) | plan 결정 6. 어디로도 보내거나 남기지 않는다 |
| 역방향 옵션 설정 | 메모리(state)만 | plan 부수 사항. 매번 기본값(켜짐) |
| 쓰리카드 결과 | 메모리(state)만 | plan 부수 사항. 저장하지 않는다 |
| 화면 진행 상태(`source`, `isFlipping` 등) | 메모리(리듀서 state)만 | 화면 표시용. 저장하지 않는다 |
| IndexedDB, sessionStorage, Supabase | 쓰지 않음 | 해당 데이터 없음. 회원가입 없는 기능 |

## 9. PM 결정 (확정)

2026-11-04 사용자가 D1~D5를 모두 권장안으로 확정했다. 대안 열은 미채택 기록으로 남긴다. 본문(1, 3.2, 5.1, 5.3, 7.1, 13, 16, 17장)은 확정안 기준으로 작성되어 있다.

| 번호 | 주제 | 확정 (권장안) | 미채택 대안 |
|---|---|---|---|
| D1 | 난수 함수 재사용 | 확정. `src/features/lotto/utils/random.util.ts`를 `src/lib/random.ts`로 옮기고 lotto 3개 파일(`generator/components/root.component.tsx`, `simulator/components/root.component.tsx`, `utils/lotto.util.ts`)의 import를 바꾼다. 장점: `code-style.md` "다른 기능의 코드가 필요하면 공용 폴더로 올린 뒤 쓴다" 규칙을 지키고 코드 중복이 없다. 단점: 로또 파일 3개를 건드린다(동작 변화 없음, import 경로만). `src/features/lotto/LOTTO-REFACTOR.md`의 언급도 갱신 필요. | `features/tarot/utils/tarot-random.util.ts`에 같은 함수를 새로 쓴다. 장점: 로또 코드를 건드리지 않는다. 단점: 같은 코드가 두 곳에 생기고 규칙 취지와 어긋난다. |
| D2 | KST 날짜 키 계산 | 확정. `src/lib/date.ts`에 `getKoreaDateKey(date = new Date()): string` 추가. `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts()`로 `YYYY-MM-DD`를 만든다. 장점: 사용자 기기 시간대·서머타임과 무관하게 정확하다. 단점: 공용 파일에 함수 하나를 추가한다. | 기존 `getKoreaTime()`(UTC+9 오프셋 보정 Date)를 재사용하고 `getFullYear/getMonth/getDate`로 키를 만든다. 장점: 새 함수가 거의 없다. 단점: 사용자 기기 시간대에 서머타임이 있으면 전환 시각 근처 1시간 동안 날짜가 틀릴 수 있다. |
| D3 | 카드 데이터 형식 | 확정. TS 상수 파일 (3.2 참고) | JSON 파일 (3.2 참고) |
| D4 | 금지 표현 검사 방법 | 확정. Playwright 테스트 `e2e/tarot-copy.spec.ts` (7.1 참고) | Node 스크립트 (7.1 참고) |
| D5 | BreadcrumbList 단계 | 확정. plan대로 3단계: 홈(`/`) > 타로(`/tarot/daily`, 타로 그룹 href) > 페이지. 단점: `/tarot` 허브 페이지가 없어 `/tarot/daily`에서는 2·3단계 URL이 같다(수용). | 2단계: 홈 > 페이지 (기존 로또 페이지 방식). 장점: 중복 URL이 없다. 단점: plan 문구(홈 > 타로 > 페이지)와 달라 plan 수정이 필요하다. `/tarot` 허브 페이지 신설은 기획에 없어 넣지 않았다. |

## 10. API 계약

없음.

근거: plan상 서버에 보내거나 저장하는 데이터가 없다. 카드 데이터는 코드 상수, 뽑기는 브라우저 난수, 오늘의 카드는 localStorage다. 질문은 서버로 보내면 안 된다(AC-24). 타로 기능 코드(`features/tarot/`)는 `http`(axios), `fetch`, React Query를 쓰지 않는다. 따라서 rate limit 대상 API도 없다.

| 메서드 | 경로 | 요청 | 응답 | 에러 |
|---|---|---|---|---|
| 없음 | | | | |

## 11. DB 스키마

없음. 테이블, 컬럼, 인덱스, RLS 정책, 마이그레이션 모두 없다. 근거는 10장과 같다(회원가입 없음, 서버 저장 없음, `data-storage.md` "회원가입이 없는 기능은 Supabase를 기본값으로 쓰지 않는다").

## 12. 프론트 구조

### 12.1 페이지 (서버/클라이언트 구분)

| 경로 | 파일 | 렌더링 |
|---|---|---|
| `/tarot/daily` | `src/app/tarot/daily/page.tsx` (수정) | 서버 컴포넌트. `export const metadata = buildMetadata(...)`. `robots` noindex 제거(`buildMetadata`가 index: true를 넣는다). `ComingSoonComponent` 제거 |
| `/tarot/three-card` | `src/app/tarot/three-card/page.tsx` (신규) | 서버 컴포넌트. 같은 방식 |

- 페이지 이름: `TarotDailyPage`, `TarotThreeCardPage` (default export).
- 클라이언트 경계는 각 화면의 `root.component.tsx`다. 그 아래 프레젠테이션 컴포넌트는 `'use client'`를 따로 붙이지 않는다(root가 import하므로 클라이언트로 번들된다). 예외는 `TarotCardComponent` 하나로, framer-motion을 쓰므로 `'use client'`를 붙여 서버에서 잘못 import되는 일을 막는다(4.1).
- 서버 컴포넌트(안내·가이드·FAQ)는 root 안에서 import하지 않고 page에서 형제로 렌더링한다.
- 카드 앞면·뒷면 SVG(`TarotCardFaceComponent`, `TarotCardBackComponent`와 그 하위 SVG 컴포넌트)는 훅·`'use client'`·framer-motion이 없는 순수 컴포넌트라 서버 가이드 컴포넌트에서 직접 쓴다. 뒤집기 모션은 서버 쪽에 두지 않는다.

### 12.2 컴포넌트 트리

```
TarotDailyPage (서버)
└ ContentWrapperComponent type="tarot"
  ├ JsonLdComponent [jsonLdBreadcrumb, jsonLdFaq(TAROT_DAILY_FAQ)]
  ├ TitleWrapperComponent type="tarot" title="오늘의 타로"         ← 유일한 h1
  ├ TarotDisclaimerNoticeComponent                                  (서버)
  ├ TarotDailyStorageNoticeComponent                                (서버)
  ├ TarotNoscriptNoticeComponent                                    (서버)
  ├ TarotDailyComponent ('use client', root)  ← 무대 패널. md 이상 2열(왼쪽 카드 무대, 오른쪽 글)
  │  ├ aria-live="polite" 공지 영역 (sr 전용, 12.3 공지 문구)
  │  ├ 카드 무대 (aria-busy={isFlipping})
  │  │  ├ TarotCardComponent              (checking·idle·crisis: 뒷면 / revealed: 앞면. 카드 이미지는 여기에만 그린다)
  │  │  └ "역방향" 글자                    (revealed && 역방향일 때, 카드 밖)
  │  └ 오른쪽(모바일은 아래) 영역
  │     ├ 스켈레톤                         (checking일 때)
  │     ├ TarotReversedToggleComponent     (idle일 때)
  │     ├ TarotQuestionInputComponent      (idle일 때)
  │     ├ "카드 뽑기" 버튼                 (idle일 때)
  │     ├ TarotCrisisNoticeComponent       (crisis일 때)
  │     ├ 재방문 상태 줄                   (revealed && source==='restored')
  │     ├ 질문 줄                          (revealed && source==='drawn' && 질문 있음)
  │     ├ TarotCardReadingComponent titleAs="h2"  (revealed일 때. 글만)
  │     ├ TarotExpertNoticeComponent       (revealed && 전문가 표현)
  │     └ 저장 불가 안내                   (저장 실패 시)
  ├ TarotResultNoticeComponent                                      (서버, 항상)
  ├ TarotDailyGuideComponent                                        (서버, 원카드 읽는 법·정/역방향, TarotCardFaceComponent로 바보 정/역 그림)
  ├ TarotFaqComponent items={TAROT_DAILY_FAQ}                       (서버)
  └ TarotDetailNoticeComponent                                      (서버)

TarotThreeCardPage (서버)
└ ContentWrapperComponent type="tarot"
  ├ JsonLdComponent [jsonLdBreadcrumb, jsonLdFaq(TAROT_THREE_CARD_FAQ)]
  ├ TitleWrapperComponent title="3장 타로 (과거·현재·미래)"          ← 유일한 h1
  ├ TarotDisclaimerNoticeComponent
  ├ TarotNoscriptNoticeComponent
  ├ TarotThreeCardComponent ('use client', root)  ← 무대 패널
  │  ├ aria-live="polite" 공지 영역 (sr 전용, 12.3 공지 문구)
  │  ├ 카드 무대 (aria-busy={isFlipping})  ← 모바일 한 줄 3장, md 이상 3열 그리드
  │  │  └ 위치 × 3 (과거·현재·미래 순서)
  │  │     ├ 위치 이름 글자 (과거/현재/미래)  ← idle부터 항상 카드 위에 보인다 (AC-9). 제목 요소 아님
  │  │     ├ TarotCardComponent           (idle·crisis: 뒷면 / revealed: 앞면, flipDelayMs 0/120/240. 카드 이미지는 여기에만 그린다)
  │  │     └ "역방향" 글자                 (revealed && 역방향일 때)
  │  ├ (idle일 때, 카드 무대 아래 한 열)
  │  │  ├ TarotReversedToggleComponent
  │  │  ├ TarotThreeCardTopicChipsComponent  + "분야는 질문 예시를 채우는 용도이며, 해석 문구는 분야와 관계없이 같습니다." 안내 (AC-11)
  │  │  ├ TarotQuestionInputComponent
  │  │  ├ "세 장 뽑기" 버튼
  │  │  └ 재뽑기 안내 문구 (AC-13)
  │  ├ TarotCrisisNoticeComponent        (crisis일 때)
  │  ├ TarotThreeCardSpreadResultComponent (revealed일 때)
  │  │  ├ h2 "세 장의 결과" (sr-only, tabIndex=-1, 공개 후 포커스 대상)
  │  │  └ 위치 × 3
  │  │     ├ h3 위치 이름 (과거/현재/미래)
  │  │     ├ 위치 안내 한 줄
  │  │     └ TarotCardReadingComponent titleAs="p"  (글만)
  │  ├ TarotExpertNoticeComponent        (revealed && 전문가 표현, 세 읽기 아래 한 번)
  │  └ "다시 뽑기" 버튼 + 재뽑기 안내 문구 (revealed일 때, AC-13)
  ├ TarotResultNoticeComponent
  ├ TarotThreeCardGuideComponent        (스프레드 설명, "쓰리카드 타로" 표현 포함, TarotCardBackComponent 3장 배치도)
  ├ TarotFaqComponent items={TAROT_THREE_CARD_FAQ}
  └ TarotDetailNoticeComponent
```

- 위 트리는 논리 구조다. 데스크톱 3열에서 각 열이 [위치 이름 → 카드 → 역방향 글자 → 위치 안내 → 카드 이름 → 방향 → 키워드 → 요약]을 세로로 갖도록 배치하는 방법(그리드 배치 또는 열 단위 묶음)은 frontend-dev가 정한다. 단 아래 조건을 지킨다.
  - 카드 이미지는 무대 자리에만 한 번 그린다. 결과 읽기 블록에 카드 그림을 다시 넣지 않는다.
  - 위치 이름은 idle부터 카드 뒷면 위에 보이는 글자이고, 결과에서는 h3로 한 번 더 나온다. 모바일·데스크톱 모두 문서 순서상 h2 "세 장의 결과" → h3 과거 → h3 현재 → h3 미래가 유지되어야 한다.
  - sr-only h2 "세 장의 결과"는 3장 타로 결과 묶음의 제목이다. h1 개수는 바뀌지 않는다(AC-34).
- `TarotCardReadingComponent` (확정)
  - props: `card: TarotCardType`, `isReversed: boolean`, `titleAs: 'h2' | 'p'`, `titleRef?: Ref<HTMLHeadingElement>`.
  - 표시: `"{nameKo} ({nameEn})"`(AC-4, `tarot-card.util.ts`의 `formatTarotCardName`, 괄호 부분만 `span`으로 감싼다), "정방향"/"역방향"(이름과 다른 줄), 키워드 3개, 요약, `card.note`가 있으면 보충 문구(AC-20). 카드 이미지는 넣지 않는다.
  - `titleAs="h2"`(오늘의 타로): 카드 이름이 h2이고 `tabIndex={-1}`, `titleRef`로 root가 공개 직후 포커스를 옮긴다. `titleAs="p"`(3장 타로): 카드 이름은 h3 위치 이름 아래 일반 글자다.
  - 질문 줄과 전문가 안내는 이 컴포넌트에 넣지 않고 root가 배치한다(오늘의 타로는 질문 줄을 위, 전문가 안내를 아래. 3장 타로는 전문가 안내를 세 읽기 아래 한 번).
- 페이지 안에 h2 이하만 쓴다. `PageHeaderComponent`는 h1을 만들 수 있으므로 같이 쓰지 않는다(AC-34).
- 설명 콘텐츠(가이드 + FAQ)는 페이지당 한국어 약 600자 이상. 문구는 콘텐츠 작성 단계(메인 AI)에서 합니다체로 쓰고, 3.3 저작권 원칙과 금지 표현 검사를 거친다.

### 12.3 상태 위치

| 상태 | 위치 | 방식 |
|---|---|---|
| 질문 | 각 root (`useTarotQuestion`) | `useState`. Controlled로 `TarotQuestionInputComponent`에 전달 |
| 역방향 옵션 | 각 root | `useState(true)` |
| 뽑기 진행 상태·결과 (오늘) | `useDailyReading` | `useReducer`. 아래 확정 타입 |
| 뽑기 진행 상태·결과 (3장) | `useThreeCardReading` | `useReducer`. 아래 확정 타입 |
| 선택한 분야 칩과 예시 순번 | `TarotThreeCardComponent` | `useState`. 선택 칩 키(`TarotQuestionTopicKeyType | null`)와 예시 순번. 같은 칩을 다시 누르면 다음 예시(마지막 다음은 처음)를 질문 state에 채운다 |
| 위기·전문가 감지 | 렌더링 중 계산 | 상태 아님 |
| 공지 문구(aria-live), 재방문 상태 줄 표시 여부, 버튼 disabled, aria-busy | 리듀서 상태에서 렌더링 중 계산 | 별도 상태 아님 |

리듀서 상태 (확정, 각 hook 파일 안에 정의)

```ts
// use-daily-reading.hook.ts
type TarotDailyReadingStateType =
  | Readonly<{ status: 'checking' }>
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'crisis'; drawn: TarotDrawnCardType; isSaveFailed: boolean }>
  | Readonly<{
      status: 'revealed';
      drawn: TarotDrawnCardType;
      /** 'drawn': 방금 뽑음(뒤집기 연출, 질문 줄). 'restored': 재방문 복원(연출 없음, 상태 줄) */
      source: 'drawn' | 'restored';
      /** 뒤집기 연출 진행 중. restored는 항상 false */
      isFlipping: boolean;
      isSaveFailed: boolean;
    }>;

type TarotDailyReadingActionType =
  | Readonly<{ type: 'RESTORE'; drawn: TarotDrawnCardType }>          // 저장값 있음 → revealed(restored, isFlipping false)
  | Readonly<{ type: 'EMPTY' }>                                      // 저장값 없음 → idle
  | Readonly<{ type: 'DRAW'; drawn: TarotDrawnCardType; isSaveFailed: boolean; hasCrisis: boolean }>
                                                                     // hasCrisis ? crisis : revealed(drawn, isFlipping true)
  | Readonly<{ type: 'CONTINUE' }>                                   // crisis → revealed(drawn, isFlipping true)
  | Readonly<{ type: 'FLIP_DONE' }>;                                 // isFlipping → false

// use-three-card-reading.hook.ts
type TarotThreeCardReadingStateType =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'crisis'; drawn: readonly TarotDrawnCardType[] }>
  | Readonly<{ status: 'revealed'; drawn: readonly TarotDrawnCardType[]; isFlipping: boolean }>;

type TarotThreeCardReadingActionType =
  | Readonly<{ type: 'DRAW'; drawn: readonly TarotDrawnCardType[]; hasCrisis: boolean }>
  | Readonly<{ type: 'CONTINUE' }>
  | Readonly<{ type: 'FLIP_DONE' }>
  | Readonly<{ type: 'RESET' }>;                                     // "다시 뽑기" → idle (카드는 연출 없이 뒷면)
```

- `hasCrisis`는 클릭 핸들러에서 `hasTarotCrisisSignal(question)`으로 계산해 다음 상태를 고르는 데만 쓴다. 상태에 저장하지 않는다(6.2).
- 3장 타로에는 `source`가 없다(저장·복원이 없으므로 revealed는 항상 방금 뽑은 결과).
- 상태에서 계산하는 화면 값
  - 재방문 상태 줄 "오늘 뽑은 카드입니다. 한국 시간 자정이 지나면 새 카드를 뽑을 수 있습니다.": `status === 'revealed' && source === 'restored'`.
  - aria-live 공지 문구(`status === 'revealed'`일 때만 채운다. 그 외에는 빈 문자열)
    - 오늘의 타로, `source === 'drawn'`: "{이름} ({영문}), {정방향|역방향} 카드가 나왔습니다."
    - 오늘의 타로, `source === 'restored'`: "오늘 뽑은 카드는 {이름} ({영문}), {정방향|역방향}입니다."
    - 3장 타로: "과거 {이름} ({영문}) {방향}, 현재 …, 미래 … 카드가 나왔습니다."
    - 문구 틀은 `tarot-notice.constant.ts`에 둔다. 질문 텍스트는 공지 문구에 넣지 않는다.
  - 카드 무대 `aria-busy`: `status === 'revealed' && isFlipping`.
  - 버튼 disabled(+ `aria-busy`, `opacity-60`): 같은 조건(`isFlipping`)일 때 화면에 있는 뽑기·"다시 뽑기" 버튼을 `disabled`로 둔다. 연출은 최대 약 0.8초이며 `FLIP_DONE`으로 풀린다.
  - `TarotCardComponent`의 `isFlipping` prop: 상태의 `isFlipping`을 그대로 넘긴다. `FLIP_DONE`은 `onFlipComplete`에서 dispatch한다. 동작 줄이기 설정에서도 opacity 교차가 끝나면 콜백이 불리므로 같은 경로로 풀린다.
- 포커스 이동(공개 직후 결과 제목, 위기 시 위기 패널 제목, "다시 뽑기" 후 "세 장 뽑기" 버튼)과 모바일 공개 직후 스크롤은 root가 상태 전이 후 `useEffect`/ref로 처리한다. 세부는 `ui-ux-design.md` "접근성", "인터랙션·애니메이션"을 따른다. 재방문 복원(`restored`) 때는 포커스를 옮기지 않는다(사용자 행동이 없었으므로).
- 전역 store, Context, React Query를 쓰지 않는다. `<Activity>`는 필요 없다(상태를 root가 가짐).

## 13. SEO

| URL | title | description | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/tarot/daily` | 오늘의 타로 - 무료 타로 카드 한 장 뽑기 | 로그인 없이 타로 카드 한 장을 뽑아 오늘의 흐름과 생각해 볼 점을 살펴볼 수 있습니다. 정방향·역방향 뜻과 키워드를 쉬운 말로 알려 드립니다. 오락·참고용 콘텐츠입니다. | BreadcrumbList, FAQPage | 예 (`MENU_LIST` 타로 그룹 `comingSoon` 해제) |
| `/tarot/three-card` | 3장 타로 (과거·현재·미래) - 무료 쓰리카드 타로 | 카드 세 장으로 과거·현재·미래의 흐름을 정리해 볼 수 있습니다. 쓰리카드 타로 배치 읽는 법과 카드별 키워드를 함께 볼 수 있습니다. 오락·참고용 콘텐츠입니다. | BreadcrumbList, FAQPage | 예 (`MENU_LIST`에 항목 추가) |

- 말투: title, description, OG 제목·설명(`buildMetadata`가 title·description을 그대로 쓴다), `ogImage.alt`, FAQ 질문·답변(화면과 JSON-LD 공통), 메뉴 `description`·`example`은 모두 사용자 노출 문구다. 문장형은 합니다체로 쓰고, 명사형 짧은 문구(title, OG alt, 메뉴 설명)는 명사형 그대로 둔다. 모두 7.1 금지 표현 검사와 3.3 저작권 원칙 대상이다. 위 description은 이미 합니다체다(ui-ux "PM 전달 사항"의 메타 description 말투 질문에 대한 답).
- 렌더링: 두 페이지 모두 서버 컴포넌트. 설명 콘텐츠, FAQ, 면책, 위기 안내, 가이드 그림(순수 SVG)은 서버 HTML. 뽑기 결과는 클라이언트에서만 그리고 별도 URL을 만들지 않는다.
- 메타데이터: `buildMetadata({ title, description, pathname, keywords, ogImage: { alt } })`. 값은 `tarot-seo.constant.ts`에 둔다(금지 표현 검사 대상이 되도록).
  - `pathname`: `/tarot/daily`, `/tarot/three-card` (`/`로 시작).
  - `ogImage.alt`: "오늘의 타로 카드 뽑기", "3장 타로 과거 현재 미래 카드 뽑기". `tag`는 생략해 메뉴 라벨(`getOgTag`)을 쓴다.
  - `keywords`: daily = 오늘의 타로, 오늘의 타로 카드, 무료 타로, 타로 카드 한 장, 타로 원카드, 타로 카드 뽑기, 타로 역방향 뜻. three-card = 3장 타로, 쓰리카드 타로, 과거 현재 미래 타로, 무료 타로, 타로 카드 뽑기, 타로 역방향 뜻.
  - "Rider-Waite", "라이더-웨이트"는 어디에도 쓰지 않는다.
- JSON-LD: `JsonLdComponent` + `jsonLdBreadcrumb`, `jsonLdFaq`. FAQ JSON-LD는 화면 FAQ와 같은 상수(`TAROT_DAILY_FAQ`, `TAROT_THREE_CARD_FAQ`)를 쓴다. 리뷰·평점 구조화 데이터는 넣지 않는다.
  - Breadcrumb (D5 확정, 3단계): `/tarot/daily` = 홈(`/`) > 타로(`/tarot/daily`) > 오늘의 타로(`/tarot/daily`). `/tarot/three-card` = 홈(`/`) > 타로(`/tarot/daily`) > 3장 타로(`/tarot/three-card`). 2·3단계 URL 중복은 수용한다.
  - FAQ 질문은 plan "페이지가 답할 질문"에서 페이지에 맞는 것을 고른다. 질문은 "~인가요?" 같은 해요체 의문형 대신 "~입니까?", "~할 수 있습니까?" 형태로, 답변은 합니다체로 쓴다. 답변에서 결과를 단정하지 않고 "~일 수 있습니다" 형태를 쓴다.
- `MENU_LIST` 수정 (`src/constants/menu.constant.ts`, 확정)
  - 타로 그룹의 `comingSoon: true` 삭제. 그룹 `href`는 `/tarot/daily` 유지.
  - 항목 추가: `{ href: '/tarot/three-card', label: '3장 타로 (과거·현재·미래)', icon: 'Layers', colorClass: 'text-menu-tarot', description: '카드 세 장으로 과거·현재·미래의 흐름을 정리.', example: '예: 고민되는 일의 흐름을 차분히 정리해 보고 싶을 때' }`
  - `colorClass`: 기존 오늘의 타로 항목의 `text-violet-600`(토큰 밖 색)을 `text-menu-tarot`로 바꾸고, 새 항목도 `text-menu-tarot`를 쓴다(ui-ux 확정).
  - `src/constants/menu-icon.constant.ts`의 `MENU_ICONS`에 `Layers`(lucide-react, 기존 의존성)를 추가한다. 오늘의 타로 아이콘은 `Moon` 유지(ui-ux 확정).
- sitemap: `src/app/sitemap.ts`는 수정하지 않는다. `comingSoon` 해제로 그룹 href + 두 항목이 자동 포함되고 중복은 제거된다(우선순위 0.6).
- h1 하나(`TitleWrapperComponent`), URL 소문자·하이픈, 기존 노출 URL 변경 없음 → redirect 없음.
- 루트 `layout.tsx`는 수정하지 않는다(사이트 인증 메타 태그 보존).

## 14. 보안

- RLS: 해당 없음(DB 없음).
- 시크릿·환경변수: 새 환경변수 없음. 기존 `NEXT_PUBLIC_SITE_ENG_NAME`(공개값)만 저장 키 접두사로 쓴다. 비밀값을 쓰지 않는다.
- 입력 검증: 질문은 길이 100자 제한, trim 처리만 한다. 서버로 가지 않으므로 서버 검증은 없다. localStorage 값은 신뢰하지 않고 5.3의 검증을 통과한 값만 쓴다. 통과하지 못한 값은 삭제한다.
- XSS: 질문·카드 문구는 React 텍스트로만 렌더링한다. `dangerouslySetInnerHTML`은 기존 `JsonLdComponent`(정적 상수 FAQ)에서만 쓰고, 사용자 입력을 JSON-LD에 넣지 않는다.
- 데이터 유출 방지
  - `features/tarot/`에서 `http`, `fetch`, React Query, 분석·알림 모듈을 import하지 않는다. 현재 `src/`에 분석·텔레그램 이벤트 송신 코드는 없다(grep 확인). 나중에 생겨도 질문 텍스트와 감지 결과를 넘기지 않는다.
  - 질문을 URL(쿼리, 해시), `console.*`, 오류 메시지, aria-live 공지 문구에 넣지 않는다. 폼 제출로 나가지 않게 6.1 규칙을 지킨다.
- API 남용 방지: API가 없으므로 rate limit 없음.
- 브라우저 저장소: 날짜, 카드 번호, 방향만. 키 1개, 값 최대 1개. 질문, 감지 결과, 개인정보 금지(AC-25).
- 광고: 타로 페이지에 광고 슬롯을 추가하지 않는다. 루트 레이아웃의 상단 슬롯 1개만 노출된다(AdFit 페이지당 4개 이하 충족). 타로 코드는 동의 상태와 광고 로드 결과에 의존하지 않는다.

## 15. 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 카드 SVG 78장 + 뒷면 1종 | 자체 제작 (frontend-dev가 코드로 작성, AI 이미지 생성 도구 미사용, 외부 이미지·아이콘 세트·Rider-Waite 풍 도안 미사용. 4.1 참고) | 자체 저작물 (권리 귀속 불명확성은 plan "위험과 수용 사항"에서 수용) | 가능 |
| 카드 해석 문구 78장, FAQ, 가이드 | 자체 작성 (메인 AI 작성, 사용자 검수. 외부 해석 문장 미참조. 3.3 참고) | 자체 저작물 (같은 위험 수용) | 가능. 출시 전 대표 문장 웹 검색 샘플 확인 |
| 카드 명칭(한글·영문) | 일반 명칭 | 해당 없음. "Rider-Waite" 등 상표성 명칭 미사용 | 가능 |
| lucide-react (메뉴 아이콘 `Layers`, UI 버튼 아이콘) | 기존 의존성 | ISC | 가능. 카드 그림에는 쓰지 않는다 |
| framer-motion (카드 뒤집기) | 기존 의존성 | MIT | 가능 (기존) |
| Pretendard 폰트 | 기존 CDN | SIL OFL 1.1 | 가능 (기존). 카드 SVG 글자도 이 폰트만 쓴다 |
| 자살예방상담전화 109 안내 | 공공 정보 (보건복지부) | 사실 정보 | 가능. 출시 전 번호 재확인 |
| 새 npm 라이브러리 | 없음 | | |

- 개인정보 처리: 서버 수집 없음. 브라우저 저장 항목(날짜·카드 번호·방향)만 공개한다. 법률 확인은 받지 않기로 사용자가 결정했다(plan 결정 11, 위험 수용).
- 갱신 대상 문서·코드 위치

| 대상 | 위치 | 추가 내용 |
|---|---|---|
| 개인정보처리방침 | `src/app/privacy/page.tsx` 1장 "수집 항목 및 방법" | 타로 질문은 서버로 전송·저장하지 않는다는 한 문장 |
| | 같은 파일 2장 "브라우저 저장소 사용"의 `<ul>` | "오늘의 타로: 날짜, 카드 번호, 정/역방향만 이 기기(localStorage)에 저장합니다. 저장된 값은 다음 날 방문 시 자동으로 삭제되며, 브라우저 설정에서도 삭제할 수 있습니다." 항목 (합니다체) |
| | 시행일 `EFFECTIVE_DATE` | 변경일로 갱신 |
| 이용약관 | `src/app/terms/page.tsx` 1장 "서비스 개요" | 타로 기능 추가 언급 |
| | 같은 파일 새 장(4장 "비제휴·비보증 고지" 뒤 또는 끝) "타로 서비스" | 오락·자기 성찰 목적, 결과는 미래를 보장하지 않음, 전문가 상담 권고, 덱 제작사·출판사와 비제휴, 오늘의 카드는 기기 기준 저장. 기존 장 번호가 밀리면 같이 고친다 |
| | 시행일 `EFFECTIVE_DATE` | 변경일로 갱신 |
| COMPLIANCE.md | 1장 "Cookies, Consent, Privacy" | 타로 localStorage 항목(키 1개, 다음 날 방문 시 자동 삭제), 질문 비저장, 동의와 무관하게 동작 |
| | 11장 "Disclaimers" | 타로: 오락·참고용 고지(h1 아래 상시 + 결과 하단), 비제휴, 위기 안내 109(출시 전 재확인), 서버 저장 없음, 금지 표현 목록 위치 |
| | "Last updated" | 갱신 |
| THIRD_PARTY_NOTICES.md | 새 절 "Original artwork and content" | 타로 카드 SVG 78장 + 뒷면: 자체 제작, 제작 주체, 제작일, 라이선스(자체 저작물), 외부 덱 이미지 미사용. 해석 문구: 자체 작성, 이력은 `docs/tarot/copy-log.md` |
| DEPENDENCY_LICENSES.md | 변경 없음 | 새 의존성 없음 |
| README.md | "기능" 절 | 타로 2개 메뉴 추가. 환경변수·API·테이블 표는 변경 없음 |

## 16. 담당별 작업 순서

- db: 없음.
- backend: 없음.
- frontend (frontend-dev, `design.md` + `ui-ux-design.md` 기준)
  1. FE-1 공용 유틸: `src/features/lotto/utils/random.util.ts`를 `src/lib/random.ts`로 이동하고 로또 import 3곳 수정, `LOTTO-REFACTOR.md` 언급 갱신(D1). `src/lib/date.ts`에 `getKoreaDateKey` 추가(D2).
  2. FE-2 타입·상수 뼈대: `tarot.type.ts`, 카드 5개 TS 상수 파일(D3)의 78장 메타(id, arcana, suit, rank, nameKo, nameEn)와 문구 자리, 위치·분야·고지(aria-live 공지 문구 틀 포함)·감지·금지 표현·SEO 상수. (FE-1과 병렬 가능)
  3. FE-3 로직: `tarot-draw.util.ts`, `tarot-safety.util.ts`, `tarot-card.util.ts`, `tarot-daily-storage.service.ts`(5.3 정리 규칙 포함), `use-tarot-question.hook.ts`. (FE-1, FE-2 이후)
  4. FE-4 카드 SVG 컴포넌트 일체. 순수 SVG 컴포넌트(앞면·뒷면·프레임·상징·수트·코트 표식)를 먼저 만들고, 그 위에 `TarotCardComponent`(뒤집기 모션)를 만든다. (FE-2 이후, FE-3과 병렬 가능)
  5. FE-5 서버 안내 컴포넌트(면책, 결과 하단, 상세 안내, FAQ, noscript, 저장 안내, 가이드). 가이드 그림은 FE-4의 순수 SVG 컴포넌트를 쓴다. (FE-2 이후. 가이드는 FE-4 이후)
  6. FE-6 오늘의 타로 화면(root, hook). (FE-3, FE-4, FE-5 이후)
  7. FE-7 3장 타로 화면(root, hook, 칩, 결과). (FE-3, FE-4, FE-5 이후, FE-6과 파일이 겹치지 않아 병렬 가능)
  8. FE-8 페이지·메타데이터·JSON-LD(Breadcrumb 3단계, D5), `MENU_LIST`·`MENU_ICONS` 수정. (FE-6, FE-7 이후. 메뉴 수정은 콘텐츠 C-2 완료 전에는 하지 않는다: 문구가 빈 상태로 sitemap에 노출되지 않게)
  9. FE-9 처방·약관 페이지 수정, `COMPLIANCE.md`, `THIRD_PARTY_NOTICES.md`, `README.md` 갱신. (독립, 언제든 가능)
- content (메인 AI 작성 + 사용자 검수, plan 결정 3)
  1. C-1 메이저 22장 문구 작성 → 사용자 검수·톤 확정. (FE-2 이후. `major.constant.ts`의 문구 필드만 수정)
  2. C-2 마이너 56장 문구 작성 → 검수. (C-1 이후)
  3. C-3 가이드·FAQ 본문 작성. (FE-2 이후, C-1과 병렬 가능)
  4. C-4 대표 문장 웹 검색 샘플 확인, `docs/tarot/copy-log.md` 완성. (C-2, C-3 이후)
- qa (FE-8, C-4 이후): `e2e/tarot.spec.ts`(AC-1~36 + 5.3 테스트 관점), `e2e/tarot-copy.spec.ts`(D4), 데스크톱·모바일.

## 17. 파일 충돌 위험

- `src/constants/menu.constant.ts`, `src/constants/menu-icon.constant.ts`: 모든 기능이 같이 쓰는 파일. 다른 기능(운세·점심 등) 작업과 동시에 고치지 않는다. 타로에서는 FE-8 한 작업만 수정한다.
- `src/lib/date.ts`, `src/lib/random.ts`(D1 확정): 공용 파일. FE-1에서만 수정한다. D1은 로또 파일 3개(`generator/components/root.component.tsx`, `simulator/components/root.component.tsx`, `utils/lotto.util.ts`)와 `src/features/lotto/utils/random.util.ts`(이동)를 건드리므로 로또 작업과 동시에 하지 않는다.
- `src/features/tarot/constants/cards/*.constant.ts`: FE-2(뼈대)와 C-1·C-2(문구)가 같은 파일을 고친다. FE-2를 먼저 끝내고, 이후에는 문구 작성 쪽만 문구 필드를 고친다.
- `src/features/tarot/constants/tarot-faq.constant.ts`, `tarot-notice.constant.ts`: FE-2(뼈대)와 C-3(본문)이 겹친다. 같은 순서 규칙을 적용한다.
- `src/features/tarot/shared/components/tarot-card.component.tsx`, `card-reading.component.tsx`: FE-6과 FE-7이 같이 쓴다. FE-4(카드)·FE-6 이전 단계에서 props를 12.2, 4.1 확정값으로 만들어 두고, FE-6·FE-7에서는 수정하지 않는다. 수정이 필요하면 한쪽 작업에서만 고치고 다른 쪽은 그 뒤에 진행한다.
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `COMPLIANCE.md`, `README.md`: 다른 기능도 고칠 수 있는 공용 문서. FE-9 한 작업으로 묶는다.
- `src/app/layout.tsx`: 현재 작업 트리에 커밋되지 않은 수정(주석 1줄 삭제)이 있다. 타로 작업은 이 파일을 고치지 않는다.
- `src/app/sitemap.ts`: 수정하지 않는다.
- `src/app/tarot/daily/page.tsx`: 기존 ComingSoon 파일을 통째로 바꾼다. FE-8만 수정한다.
