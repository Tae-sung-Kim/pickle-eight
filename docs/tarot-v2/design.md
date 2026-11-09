# tarot-v2 설계서

입력: `docs/tarot-v2/plan.md` (확정 2026-11-09, Q1~Q10), 기존 설계 `docs/tarot/design.md`, 현재 코드 `src/features/tarot/`, `src/app/tarot/`
참고 규칙: `docs/conventions/tech-stack.md`, `code-style.md`, `data-storage.md`, `seo.md`
작성일: 2026-11-09
작성: architect
상태: 승인 대기. 12장 PM 결정 D1~D6은 사용자 선택이 필요하다. 본문은 각 결정의 추천안 기준으로 적었다. 다른 안을 고르면 해당 절을 고친다.

이 문서는 `docs/tarot/design.md`(이하 "기존 설계")의 변경점만 적는다. 여기 적지 않은 내용(카드 SVG, 난수, 오늘의 카드 저장 규칙, 위기·전문가 감지, 면책 배치, Breadcrumb 등)은 기존 설계를 그대로 따른다.

## 0. 요약

- 서버, API, DB, 새 라이브러리, 새 환경변수, 새 URL이 없는 순수 프론트 변경이다.
- 분야(전체 + 4개)를 1장·3장 모두에 둔다. 분야는 해석 문장을 고르는 입력이 된다. 질문 자유 입력은 위기·전문가 감지 전용으로 남고 해석 함수의 입력이 아니다.
- 새 문장 데이터 2종을 코드 상수로 둔다.
  - 분야 해석 문장 40개: 수트 그룹 5 × 분야 4 × 방향 2 (`tarot-topic-reading.constant.ts`)
  - 3장 "흐름 이야기" 문장: 분야(전체 포함) 5세트 × (위치별 연결 문장 틀 6 + 마무리 문장 3) = 45개 (`tarot-story.constant.ts`, D3 추천안 기준)
- 분야 선택 값은 메모리(React state)에만 둔다. localStorage 키·저장 형식은 바꾸지 않는다(D2, D4 추천안).
- 3장 재뽑기는 현행 유지. 결과 아래 재뽑기 버튼 옆에 "다시 뽑으면 지금 결과는 사라집니다" 안내를 추가한다.
- 리듀서(`use-daily-reading.hook.ts`, `use-three-card-reading.hook.ts`)와 저장 서비스는 바꾸지 않는다.

### 0.1 기존 설계 대비 변경점

| 기존 설계 절 | 변경 |
|---|---|
| 1 폴더 구조 | 상수 3개, 유틸 2개, 컴포넌트 1개 추가. 분야 칩 컴포넌트를 `three-card/`에서 `shared/`로 이동 |
| 2 타입 | 분야 타입 교체(`TarotQuestionTopic*` → `TarotTopic*`, `'all'` 추가), 수트 그룹·문장 맵·이야기 타입 추가. `TarotDailyStoredType`은 변경 없음 |
| 3.4 기타 고정 문구 | 분야 칩 질문 예시(`examples`) 삭제(D5 추천안). 분야 문장·이야기 문장 추가 |
| 6.1 질문 | 역할을 "위기·전문가 감지 전용"으로 좁힌다는 안내 추가. 동작은 그대로 |
| 7.1 금지 표현 검사 | 검사 대상에 새 상수 2개와 새 고지 문구 추가, 허용 예외 문장 1개 추가, 이야기 어미 규칙 추가 |
| 8 데이터 저장 위치 | 분야 선택, 분야 문장, 이야기 문장 행 추가 |
| 12.2 컴포넌트 트리 | 1장: 분야 칩, 질문 용도 안내, 분야 문장. 3장: 분야 칩(전체 포함), 분야 문장, 흐름 이야기, 재뽑기 결과 안내 |
| 12.3 상태 위치 | "선택한 분야 칩과 예시 순번" 행을 "선택한 분야" 하나로 교체, 1장에도 추가 |
| 13 SEO | title, description, h1 아래 설명, FAQ, 가이드 본문, `MENU_LIST` 설명 문구 변경. URL·JSON-LD 종류·sitemap 항목 수는 그대로 |
| 15 문서 갱신 | `COMPLIANCE.md` 11장, 개인정보처리방침, `THIRD_PARTY_NOTICES.md`, `docs/tarot/copy-log.md` |

## 폴더 구조

```
src/app/tarot/
  daily/page.tsx                       # 변경 없음 (SEO 상수만 바뀜)
  three-card/page.tsx                  # 변경 없음

src/features/tarot/
  types/
    tarot.type.ts                      # 수정: 분야 타입 교체, 수트 그룹·문장 맵·이야기 타입 추가
  constants/
    tarot-topic.constant.ts            # 신규: TAROT_TOPICS(전체+4), TAROT_TOPIC_DEFAULT, 칩 그룹 이름, 분야 안내 문구
    tarot-topic-reading.constant.ts    # 신규: TAROT_TOPIC_READINGS (40문장)
    tarot-story.constant.ts            # 신규: TAROT_STORY_SETS (이야기 문장 틀), 이야기 제목
    tarot-question.constant.ts         # 수정: TAROT_TOPIC_*·TAROT_QUESTION_TOPICS 제거(tarot-topic으로 이동, examples 삭제)
    tarot-notice.constant.ts           # 수정: 질문 용도 안내, 이야기 안내, 재뽑기 결과 안내 추가
    tarot-copy-rule.constant.ts        # 수정: 허용 예외 문장 추가, 이야기 어미 규칙 상수 추가
    tarot-faq.constant.ts              # 수정: FAQ 본문 (콘텐츠)
    tarot-seo.constant.ts              # 수정: headerDescription, title, description (콘텐츠)
  utils/
    tarot-topic.util.ts                # 신규: 수트 그룹 계산, 분야 문장 조회
    tarot-story.util.ts                # 신규: 흐름 이야기 조립 (순수 함수)
  shared/components/
    topic-chips.component.tsx          # 이동+수정: three-card/components/에서 옮김. TarotTopicChipsComponent, 전체 포함 5칩
    card-reading.component.tsx         # 수정: topicSentence prop 추가
    question-input.component.tsx       # 수정: 질문 용도 안내 표시
  daily/
    components/root.component.tsx      # 수정: 분야 state, 칩, 분야 문장 전달
    components/guide.component.tsx     # 수정: 본문(가볍게 보는 법, 분야 설명, 1장·3장 차이) (콘텐츠)
  three-card/
    components/root.component.tsx      # 수정: 분야 state 교체(예시 순번 삭제), 이야기, 재뽑기 결과 안내
    components/story.component.tsx     # 신규: TarotThreeCardStoryComponent (흐름 이야기 문단 + 안내)
    components/spread-result.component.tsx  # 수정: entry에 topicSentence 추가
    components/guide.component.tsx     # 수정: 본문(이야기 읽는 법, 분야, 재뽑기, 1장·3장 차이) (콘텐츠)
    components/topic-chips.component.tsx    # 삭제 (shared로 이동)

src/constants/menu.constant.ts         # 수정: 타로 두 항목 description 문구만

docs/tarot/copy-log.md                 # 수정: 분야 문장 40 + 이야기 문장 45 작성·검수 기록 절 추가
```

- 분야 칩은 1장·3장이 같이 쓰므로 `shared/components/`로 올린다(code-style "쓰는 곳이 늘어나면 위로 올린다").
- 이야기 조립은 3장만 쓰지만, QA가 Node 쪽에서 직접 import해 검사하므로 기능 공용 `utils/`에 둔다(`<화면>/utils/`는 규칙 폴더 목록에 없다).
- 다른 기능은 import하지 않는다. 공용 폴더 변경은 `src/constants/menu.constant.ts` 문구뿐이다.

## 타입·데이터 계약 (확정)

`src/features/tarot/types/tarot.type.ts`. 개발 담당이 임의로 바꾸지 않는다.

```ts
// 삭제: TarotQuestionTopicKeyType, TarotQuestionTopicType (질문 예시 기반 분야 타입)

/** 분야 해석 문장을 고르는 수트 그룹. 메이저 22장은 'major', 마이너는 수트 */
export type TarotSuitGroupType = 'major' | TarotSuitType;

/** 분야 4개 */
export type TarotTopicKeyType = 'love' | 'career' | 'money' | 'daily';

/** 분야 칩 선택값. 'all'(전체)이 기본이며 공통 문장을 쓴다 */
export type TarotTopicSelectionType = 'all' | TarotTopicKeyType;

export type TarotTopicType = Readonly<{
  key: TarotTopicSelectionType;
  /** '전체' | '연애·인간관계' | '직업·학업' | '재물·생활' | '일상 조언' */
  label: string;
}>;

/** 방향별 문장 한 쌍 */
export type TarotOrientationTextType = Readonly<Record<TarotOrientationType, string>>;

/** 분야 해석 문장 40개: 수트 그룹 5 × 분야 4 × 방향 2 */
export type TarotTopicReadingMapType = Readonly<
  Record<TarotSuitGroupType, Readonly<Record<TarotTopicKeyType, TarotOrientationTextType>>>
>;

/** 세 장 방향 구성. 역방향 0장 'upright', 3장 'reversed', 그 외 'mixed' */
export type TarotStoryToneType = 'upright' | 'mixed' | 'reversed';

/** 분야 하나의 이야기 문장 세트 (D3 추천안 A) */
export type TarotStorySetType = Readonly<{
  /** 위치별 연결 문장 틀. 자리표시자 {card}, {keyword} (규칙은 아래) */
  positions: Readonly<Record<TarotSpreadPositionKeyType, TarotOrientationTextType>>;
  /** 마무리 문장(자리표시자 없음). 세 장 방향 구성으로 고른다 */
  closing: Readonly<Record<TarotStoryToneType, string>>;
}>;

/** 'all'(공통) + 분야 4개 = 5세트 */
export type TarotStoryMapType = Readonly<Record<TarotTopicSelectionType, TarotStorySetType>>;
```

- `TarotDailyStoredType`(`v: 1`, date, cardId, isReversed)는 바꾸지 않는다(D4).
- 상수는 `as const satisfies TarotTopicReadingMapType` / `satisfies TarotStoryMapType`으로 선언해 조합 누락을 컴파일 때 막는다(D1 추천안).

### 상수 (확정)

| 파일 | 상수 | 내용 |
|---|---|---|
| `tarot-topic.constant.ts` | `TAROT_TOPICS: readonly TarotTopicType[]` | 순서 고정: 전체(all), 연애·인간관계(love), 직업·학업(career), 재물·생활(money), 일상 조언(daily) |
| | `TAROT_TOPIC_DEFAULT: TarotTopicSelectionType` | `'all'` |
| | `TAROT_TOPIC_GROUP_LABEL` | `'분야'` (기존 값 이동. 칩 그룹 접근성 이름. QA가 `getByRole('group', { name: '분야' })`로 찾는다) |
| | `TAROT_TOPIC_NOTICE` | 문구 교체. 고지 문구 절 참고 |
| `tarot-topic-reading.constant.ts` | `TAROT_TOPIC_READINGS: TarotTopicReadingMapType` | 40문장. 1문장씩. 문장 규칙은 아래 |
| `tarot-story.constant.ts` | `TAROT_STORY_SETS: TarotStoryMapType` | 45문장(틀 30 + 마무리 15) |
| | `TAROT_STORY_TITLE` | `'흐름 이야기'` |
| `tarot-question.constant.ts` | (삭제) `TAROT_QUESTION_TOPICS`, `TAROT_TOPIC_GROUP_LABEL`, `TAROT_TOPIC_NOTICE` | 앞의 두 개는 `tarot-topic.constant.ts`로 이동, `examples`는 삭제(D5) |
| `tarot-notice.constant.ts` | `TAROT_QUESTION_USAGE_NOTICE`, `TAROT_STORY_NOTICE`, `TAROT_REDRAW_RESULT_NOTICE` | 신규. 고지 문구 절 참고. 기존 `TAROT_REDRAW_NOTICE`는 뽑기 전(idle) 안내로 그대로 둔다 |
| `tarot-copy-rule.constant.ts` | `TAROT_COPY_ALLOWED_SENTENCES`에 `TAROT_STORY_NOTICE` 추가 | "보장"이 들어간 부정 고지 문장이라 예외로 둔다 |
| | `TAROT_STORY_ENDING_PATTERN: RegExp` (신규) | `/수 있습니다\.$/` 이야기 문장(틀 30 + 마무리 15) 각각의 끝 검사용 |

### 문장 작성 규칙 (콘텐츠 작성자와 QA가 같이 쓴다)

분야 해석 문장 40개 (`TAROT_TOPIC_READINGS`)
- 한 칸에 완결된 1문장. 합니다체. 카드 이름, 위치 이름(과거·현재·미래), 자리표시자를 넣지 않는다(1장·3장 어디서 나와도 읽히게).
- 수트 그룹별 원소 관례(`docs/research/tarot.md` 2.1: 완드 의지·행동, 컵 감정·관계, 소드 생각·소통, 펜타클 생활·물질, 메이저 큰 흐름)를 바탕으로 쓴다. 관례는 공식 규칙이 아니므로 검수 때 확인한다.
- 역방향은 기존 카드 문구와 같이 "다른 각도·속도를 늦춤" 렌즈로 쓴다. 나쁜 뜻으로 단정하지 않는다.
- 40문장은 서로 모두 다르다. "재물·생활"은 생활 습관·소비 태도 범위만 쓴다. 투자 종목, 매수 시점, 재산 증식, 복권·도박·로또를 쓰지 않는다.
- 금지 표현 검사(`TAROT_FORBIDDEN_TERMS`, `TAROT_FORBIDDEN_PATTERNS`, `TAROT_TRADEMARK_TERMS`)를 통과한다. 끝맺음은 "~수 있습니다."를 권장한다(강제는 이야기 문장만).

이야기 문장 45개 (`TAROT_STORY_SETS`)
- 모든 문장은 `TAROT_STORY_ENDING_PATTERN`(`수 있습니다.`로 끝남)을 만족한다. "~일 수 있습니다", "~해 볼 수 있습니다" 형태(plan Q8).
- 위치 틀(`positions`)은 해당 위치 단어를 반드시 포함한다. past 틀은 "과거", present 틀은 "현재", future 틀은 "미래". 그래서 조립 결과에 세 단어가 모두 들어간다(AC-11).
- 자리표시자
  - `{card}`: 카드 한글 이름(`nameKo`). 바로 뒤에 반드시 `" 카드"`가 온다(예: `{card} 카드는`). 받침에 따른 조사 문제를 막는다.
  - `{keyword}`: 해당 카드·방향의 첫 키워드(`keywords[0]`). 반드시 작은따옴표로 감싸고(`'{keyword}'`) 바로 뒤에는 `의`, `에`, `에서`, `쪽으로` 중 하나만 온다.
  - 위치 틀 하나에 `{card}` 1회는 필수, `{keyword}`는 0~1회.
  - 마무리(`closing`)에는 자리표시자를 쓰지 않는다.
- 분야 4개 세트(love, career, money, daily)의 문장은 서로 겹치지 않고, 'all' 세트와도 겹치지 않는다(AC-13).
- 예시(톤 참고용, 최종 문장 아님)
  - love.positions.past.upright: `과거 자리의 {card} 카드로 보면, 관계 안에서 '{keyword}'의 경험이 지금의 마음에 남아 있을 수 있습니다.`
  - love.closing.mixed: `세 장을 이어 보면, 관계에서 서두르기보다 지금의 마음을 천천히 살펴볼 수 있습니다.`

### 유틸 함수 (확정)

`features/tarot/utils/tarot-topic.util.ts`

```ts
/** arcana === 'major'이면 'major', 아니면 card.suit */
export function getTarotSuitGroup(card: TarotCardType): TarotSuitGroupType;

/**
 * 분야 해석 문장 조회. topic === 'all'이거나 문장이 빈 문자열이면 null.
 * 질문 텍스트를 인자로 받지 않는다(Q3: 질문은 해석에 쓰지 않는다).
 */
export function getTarotTopicReading(
  card: TarotCardType,
  isReversed: boolean,
  topic: TarotTopicSelectionType
): string | null;
```

`features/tarot/utils/tarot-story.util.ts`

```ts
export type TarotStoryEntryType = Readonly<{
  positionKey: TarotSpreadPositionKeyType;
  card: TarotCardType;
  isReversed: boolean;
}>;

/** 역방향 장수 0 → 'upright', 3 → 'reversed', 그 외 'mixed' */
export function getTarotStoryTone(entries: readonly TarotStoryEntryType[]): TarotStoryToneType;

/**
 * 흐름 이야기 문단(4문장)을 만든다. 질문 텍스트를 인자로 받지 않는다.
 * 1) past 틀 2) present 틀 3) future 틀 (각 카드 방향의 틀에 {card}, {keyword} 치환)
 * 4) closing[tone]
 * 문장 사이는 공백 한 칸. 아래 경우 null(화면은 이야기 자리를 숨긴다, plan 예외).
 * - entries가 3개가 아니거나 past·present·future가 한 번씩 있지 않음
 * - 쓸 문장(틀·마무리)이 빈 문자열
 * - 치환 뒤에 '{' 또는 '}'가 남음
 */
export function buildTarotThreeCardStory(
  entries: readonly TarotStoryEntryType[],
  topic: TarotTopicSelectionType
): string | null;
```

- 치환은 `String.prototype.replaceAll`로 상수 값만 넣는다. 사용자 입력은 들어가지 않는다.
- 두 함수 모두 순수 함수다(React, 브라우저 API 없음). QA가 Playwright 테스트에서 브라우저 없이 import해 모든 조합을 검사할 수 있다.

## 데이터 저장 위치

| 데이터 | 위치 (상수 / sessionStorage / localStorage / IndexedDB / Supabase) | 이유 |
|---|---|---|
| 분야 목록(전체 + 4개) | 코드 상수 (`tarot-topic.constant.ts`) | 모두에게 같고 자주 안 바뀐다 |
| 분야 해석 문장 40개 | 코드 상수 (`tarot-topic-reading.constant.ts`) | 같은 이유. 검수 이력이 코드 리뷰로 남는다. `data-storage.md` "타로 카드 의미" 예시와 같다 |
| 흐름 이야기 문장 45개 | 코드 상수 (`tarot-story.constant.ts`) | 같은 이유. AI 호출 없이 승인 문장만 고른다(Q9) |
| 새 고지 문구 | 코드 상수 (`tarot-notice.constant.ts`, `tarot-topic.constant.ts`) | 같은 이유 |
| 선택한 분야 (1장, 3장) | 메모리(각 root의 `useState`)만 | plan 결정 5, AC-19. 새로고침하면 "전체"로 돌아간다. D2 추천안 |
| 1장 분야 문장, 3장 이야기 문단 | 렌더링 중 계산값 (저장 안 함) | 카드·방향·분야로 계산할 수 있으므로 상태로 만들지 않는다(code-style) |
| 오늘의 카드 (날짜, 카드 번호, 방향) | localStorage, 기존 키 `${SITE}_tarot_daily_v1`, 형식 `v: 1` 그대로 | 저장 항목이 바뀌지 않는다. 키를 바꾸면 배포 당일 이용자의 오늘 카드가 사라져 AC-6과 충돌한다. D4 추천안 |
| 질문 텍스트, 위기·전문가 감지 결과, 3장 결과, 역방향 옵션 | 기존 설계 8장 그대로 (메모리 또는 계산값) | 변경 없음 |
| sessionStorage, IndexedDB, Supabase, 쿠키, URL | 쓰지 않음 | 분야 값을 저장하지 않는다(AC-19). 회원가입 없는 기능 |

## API 계약

없음.

근거: 기존 설계 10장과 같다. 분야 문장·이야기는 코드 상수 조회와 문자열 조립이라 서버가 필요 없다. AI 호출(Gemini 등)은 범위 밖이다(Q9). `features/tarot/`는 계속 `http`, `fetch`, React Query를 쓰지 않는다.

| 메서드 | 경로 | 요청 | 응답 | 에러 |
|---|---|---|---|---|
| 없음 | | | | |

## DB 스키마

없음. 테이블, 컬럼, 인덱스, RLS 정책, 마이그레이션 모두 없다.

## 프론트 구조

- 페이지 (서버/클라이언트 구분):
  - `/tarot/daily` (`src/app/tarot/daily/page.tsx`), `/tarot/three-card` (`src/app/tarot/three-card/page.tsx`) 모두 서버 컴포넌트 그대로. page 파일은 수정하지 않는다. 바뀌는 h1 아래 설명·메타데이터·FAQ는 상수와 서버 가이드 컴포넌트에서 나온다.
  - 클라이언트 경계는 계속 각 `root.component.tsx`다. 새 `TarotTopicChipsComponent`, `TarotThreeCardStoryComponent`는 root가 import하므로 `'use client'`를 따로 붙이지 않는다(기존 규칙).
  - 분야 칩과 이야기는 클라이언트에서만 그린다. 분야 설명, 이야기 읽는 법, 1장·3장 차이는 서버 가이드·FAQ에 글로 둔다(AC-26).

- 컴포넌트 트리 (기존 설계 12.2 대비 바뀐 곳만 표시. `★` 신규, `△` 수정):

```
TarotDailyPage (서버, 변경 없음)
└ … TitleWrapperComponent description=△TAROT_DAILY_SEO.headerDescription ("가볍게 보는 오늘의 흐름")
  ├ TarotDailyComponent ('use client', root) △
  │  └ 오른쪽(모바일은 아래) 영역
  │     ├ 스켈레톤                                 (checking)
  │     ├ TarotReversedToggleComponent             (idle)
  │     ├ ★TarotTopicChipsComponent                (idle, revealed. checking·crisis에서는 숨김)
  │     ├ TarotQuestionInputComponent △            (idle. 질문 용도 안내 포함, D6 추천안: 항상 펼침)
  │     ├ "카드 뽑기" 버튼                         (idle)
  │     ├ TarotCrisisNoticeComponent               (crisis)
  │     ├ 재방문 상태 줄 / 질문 줄                 (기존과 같음)
  │     ├ TarotCardReadingComponent △ titleAs="h2" topicSentence={분야 문장 | null}
  │     ├ TarotExpertNoticeComponent               (기존과 같음)
  │     └ 저장 불가 안내                           (기존과 같음)
  ├ TarotDailyGuideComponent △   (본문: 가볍게 보는 법, 분야 선택 설명, 1장과 3장 차이)
  └ TarotFaqComponent items={△TAROT_DAILY_FAQ}

TarotThreeCardPage (서버, 변경 없음)
└ … TitleWrapperComponent description=△TAROT_THREE_CARD_SEO.headerDescription ("심층 고민 정리")
  ├ TarotThreeCardComponent ('use client', root) △
  │  ├ (idle)
  │  │  ├ TarotReversedToggleComponent
  │  │  ├ ★TarotTopicChipsComponent                (전체 포함 5칩. 질문 예시 채우기 없음, D5)
  │  │  ├ TarotQuestionInputComponent △
  │  │  ├ "세 장 뽑기" 버튼 + TAROT_REDRAW_NOTICE  (기존 문구 유지)
  │  ├ TarotCrisisNoticeComponent                  (crisis)
  │  ├ (revealed)
  │  │  ├ TarotThreeCardSpreadResultComponent △    (entry별 topicSentence 전달)
  │  │  │  └ 위치 × 3: h3 위치 이름, 위치 안내, TarotCardReadingComponent titleAs="p" topicSentence
  │  │  ├ ★TarotThreeCardStoryComponent            (story가 null이 아닐 때만)
  │  │  │  ├ h2 "흐름 이야기" (TAROT_STORY_TITLE)
  │  │  │  ├ <p> 이야기 문단 1개 (4문장)
  │  │  │  └ TAROT_STORY_NOTICE
  │  │  ├ TarotExpertNoticeComponent               (기존과 같음)
  │  │  └ "다시 뽑기" 버튼 + △TAROT_REDRAW_RESULT_NOTICE (AC-15)
  ├ TarotThreeCardGuideComponent △  (본문: 이야기 읽는 법, 위치별 설명, 분야, 재뽑기, 1장과 3장 차이)
  └ TarotFaqComponent items={△TAROT_THREE_CARD_FAQ}
```

  - `TarotTopicChipsComponent` (확정, `shared/components/topic-chips.component.tsx`)
    - props: `selectedKey: TarotTopicSelectionType`, `onSelect: (key: TarotTopicSelectionType) => void`.
    - `TAROT_TOPICS` 5개를 순서대로 그린다. 단일 선택. 항상 하나가 선택되어 있다(기본 'all').
    - 그룹 접근성 이름은 `TAROT_TOPIC_GROUP_LABEL`('분야'). 칩 아래 `TAROT_TOPIC_NOTICE`를 보여 준다.
    - 질문 state를 모른다. 같은 칩을 다시 눌러도 `onSelect`만 부르고 입력칸은 건드리지 않는다(plan 예외).
    - 선택 표시 방식(`aria-pressed` 버튼 묶음 또는 radiogroup)과 모양은 ui-ux-design이 정한다. props 계약은 바꾸지 않는다.
  - `TarotCardReadingComponent` (수정, 확정)
    - props 추가: `topicSentence?: string | null`. 값이 있으면 요약(`summary`) 바로 아래 별도 `<p>`로 보여 준다. null·undefined면 그리지 않는다.
    - 요약은 그대로 남긴다(카드별 문장). 분야 문장은 그 아래 덧붙는 "분야 관점" 문장이다. 그래서 분야를 바꾸면 카드 이름·방향·키워드·요약은 그대로이고 분야 문장 `<p>`만 바뀐다(AC-4). QA는 이 `<p>`의 텍스트가 해당 분야 문장 10개(그룹 5 × 방향 2) 중 하나인지 본다(AC-5).
    - 1장의 "오늘의 흐름" 한 문단(F-1)은 요약 + 분야 문장을 묶은 읽기 영역이다. 묶음 제목이나 구분 표시는 ui-ux-design이 정한다.
  - `TarotThreeCardSpreadResultEntryType` (수정, 확정): `{ position, card, isReversed, topicSentence: string | null }`.
  - `TarotThreeCardStoryComponent` (신규, 확정): props `story: string`. 제목 h2, 문단 `<p>` 하나, `TAROT_STORY_NOTICE`. React 텍스트로만 그린다. h1 개수는 바뀌지 않는다(AC-27).
  - `TarotQuestionInputComponent` (수정): props 변경 없음. 라벨 근처에 `TAROT_QUESTION_USAGE_NOTICE`를 항상 보이게 둔다(AC-8, AC-14). 기존 민감정보 안내(`TAROT_SENSITIVE_INPUT_NOTICE`)는 유지한다.
  - 알려진 한계: 분야 문장은 수트 그룹 단위라, 3장에서 같은 그룹·같은 방향 카드가 두 장 나오면 두 위치에 같은 분야 문장이 보인다. 카드별 분야 문장(624문장)은 plan상 후속 단계다.

- 상태 위치:

| 상태 | 위치 | 방식 |
|---|---|---|
| 선택한 분야 (1장) | `TarotDailyComponent` | `useState<TarotTopicSelectionType>(TAROT_TOPIC_DEFAULT)`. 저장하지 않는다. 재방문 복원(`restored`) 때도 'all'로 시작한다 |
| 선택한 분야 (3장) | `TarotThreeCardComponent` | 같은 방식. 기존 `selectedTopicKey`, `exampleIndex` state를 이것 하나로 바꾼다. "다시 뽑기"(RESET) 뒤에도 질문과 같이 값이 남는다. 페이지를 떠나면 사라진다 |
| 1장 분야 문장 | `TarotDailyComponent` 렌더링 중 계산 | `getTarotTopicReading(card, isReversed, topic)` |
| 3장 분야 문장, 흐름 이야기 | `TarotThreeCardComponent` 렌더링 중 계산 | `spreadEntries`에서 `getTarotTopicReading`, `buildTarotThreeCardStory(entries, topic)` |
| 뽑기 진행 상태·결과 | `useDailyReading`, `useThreeCardReading` | 변경 없음. 분야는 리듀서에 넣지 않는다(카드 선택과 무관하므로) |
| 질문, 역방향 옵션, 감지 결과 | 기존 설계 12.3 그대로 | 변경 없음 |

  - 3장 분야 칩은 idle에서만 보인다. 뽑은 뒤 분야를 바꾸려면 "다시 뽑기"를 쓴다(plan AC-12, AC-13은 뽑기 전 선택만 요구).
  - 1장은 revealed에서도 칩이 보이고, 바꾸면 분야 문장만 다시 계산된다. 저장값(카드·방향)은 건드리지 않는다(AC-4, AC-6).
  - 분야 변경을 aria-live로 알릴지는 ui-ux-design이 정한다. 알린다면 분야 이름만 넣고 질문은 넣지 않는다.
  - 이야기 문단을 뒤집기 연출 중에 보일지, `FLIP_DONE` 뒤에 보일지는 ui-ux-design이 정한다. 어느 쪽이든 새 상태를 만들지 않고 기존 `isFlipping`으로 계산한다.
  - 전역 store, Context, React Query, `<Activity>`를 쓰지 않는다.

## 고지 문구 (확정 후보, 합니다체)

plan "고지 문구(초안)"을 옮겼다. 이 설계 승인 때 같이 확정한다. 모든 문구는 금지 표현 검사 대상이다.

| 상수 | 위치 | 문구 |
|---|---|---|
| `TAROT_TOPIC_NOTICE` (교체) | 1장·3장 분야 칩 아래 | 분야를 고르면 같은 카드도 그 분야의 관점에서 읽는 문장이 달라집니다. 카드는 무작위로 뽑히며 분야와 관계없이 정해집니다. |
| `TAROT_QUESTION_USAGE_NOTICE` (신규) | 1장·3장 질문 입력칸 라벨 근처 | 입력한 내용은 카드 선택과 해석에 쓰이지 않으며, 위기 안내가 필요한지 확인하는 데만 쓰입니다. |
| `TAROT_STORY_NOTICE` (신규, 허용 예외 문장에 추가) | 3장 흐름 이야기 아래 | 이야기는 세 장의 카드 의미를 이어 쓴 참고용 문장입니다. 미래를 예측하거나 보장하지 않습니다. |
| `TAROT_REDRAW_RESULT_NOTICE` (신규) | 3장 "다시 뽑기" 버튼 옆(revealed) | 다시 뽑으면 지금 결과는 사라집니다. 같은 고민을 여러 번 뽑기보다 한 번의 결과를 차분히 돌아보시기 바랍니다. |
| `TAROT_REDRAW_NOTICE` (유지) | 3장 "세 장 뽑기" 버튼 아래(idle) | 기존 문구 그대로 |

- 질문 용도 안내는 plan 초안의 "저장되지 않으며" 부분을 뺐다. 바로 옆의 기존 민감정보 안내("입력한 질문은 서버나 이 기기에 저장되지 않습니다 …")와 같은 말이 두 번 나오지 않게 하기 위해서다. plan 초안 그대로 두기를 원하면 PM이 알려 준다.
- 상시 면책, 결과 하단 면책, 상세 안내 8항, 위기 안내, 전문가 안내, 상담전화 다섯 곳은 바꾸지 않는다.
- 3장 h1·description·h1 아래 설명에 "상담"을 쓰지 않는다(AC-16). 기존 위기·전문가 안내 문구의 "상담"은 그대로 둔다(plan).

## SEO

| URL | title | description | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/tarot/daily` | (초안) 오늘의 타로 - 가볍게 보는 오늘의 흐름, 무료 타로 카드 한 장 | (초안) 로그인 없이 타로 카드 한 장을 뽑아 가볍게 오늘의 흐름을 살펴볼 수 있습니다. 연애·직업·재물·일상 중 분야를 고르면 같은 카드를 그 분야의 관점으로 읽을 수 있습니다. 오락·참고용 콘텐츠입니다. | BreadcrumbList(변경 없음), FAQPage(내용 갱신) | 기존 등록 유지. `MENU_LIST` description만 변경 |
| `/tarot/three-card` | (초안) 3장 타로 (과거·현재·미래) - 무료 쓰리카드 타로로 고민 정리 | (초안) 카드 세 장의 과거·현재·미래 흐름을 한 편의 이야기로 엮어 고민을 차분히 정리해 볼 수 있습니다. 분야를 고르면 이야기의 관점이 달라집니다. 오락·참고용 콘텐츠입니다. | BreadcrumbList(변경 없음), FAQPage(내용 갱신) | 기존 등록 유지. `MENU_LIST` description만 변경 |

- 렌더링: 두 페이지 모두 서버 컴포넌트. 분야 설명, 이야기 읽는 법, 1장·3장 차이, FAQ, 면책은 서버 HTML(AC-26). 분야 칩, 분야 문장, 이야기 문단은 클라이언트에서만 그리고 검색 노출 대상이 아니다.
- 값 위치: `tarot-seo.constant.ts`의 `headerDescription`, `title`, `description`만 바꾼다. `heading`(h1), `pathname`, `keywords`, `ogImageAlt`, `TAROT_BREADCRUMB_GROUP`은 바꾸지 않는다.
  - h1 아래 설명 초안
    - 1장: 카드 한 장으로 가볍게 보는 오늘의 흐름입니다. 짧게 읽고 하루를 시작해 보시기 바랍니다.
    - 3장: 카드 세 장의 과거·현재·미래 흐름을 한 편의 이야기로 이어 읽으며 고민을 깊이 정리해 봅니다.
  - title, description, h1 아래 설명의 최종 문장은 콘텐츠 단계(C-3)에서 확정하고 금지 표현 검사를 통과해야 한다. "오늘의 운세", "운세", 3장의 "상담"은 쓰지 않는다.
  - 분야 키워드(연애 타로 등)는 `keywords`에 넣지 않는다. 본문에 "분야에 따라 읽는 방향이 달라지는 방법" 형태로만 쓴다(plan, 검색량 미조사).
- `buildMetadata()` 사용, canonical·OG·index는 기존 그대로(AC-25).
- FAQ (`tarot-faq.constant.ts`, 화면과 JSON-LD 공통)
  - 1장: "1장과 3장은 무엇이 다릅니까?", "분야를 고르면 해석이 달라집니까?", "질문을 적으면 해석에 반영됩니까?"를 추가 또는 기존 항목 수정. "오늘의 카드는 왜 다시 뽑을 수 없습니까?", "타로는 정확합니까?"는 유지.
  - 3장: 기존 "분야를 고르면 해석이 달라집니까?"의 답(현재 "같다" 취지)을 v2 동작으로 바꾼다. "3장은 왜 다시 뽑을 수 있습니까?"(기존 "같은 질문을 여러 번 뽑아도 됩니까?"와 합침), "1장과 3장은 무엇이 다릅니까?", "질문을 적으면 해석에 반영됩니까?" 추가.
  - 두 페이지의 같은 질문이라도 답 문장은 복사하지 않고 따로 쓴다(plan, 얇은 콘텐츠 방지). 질문은 "~입니까?" 형태(기존 규칙).
- 가이드 본문: 각 `guide.component.tsx`의 `GUIDE_PARAGRAPHS`를 고친다. 1장 기존 3번째 문단("질문은 선택입니다 …")은 "질문은 해석에 쓰이지 않는다"로 고친다. 3장은 "이야기 읽는 법"(마지막 문단이 세 장을 잇는 이야기라는 설명)을 넣는다. 페이지당 약 600자 이상 유지.
- `MENU_LIST` (`src/constants/menu.constant.ts`): label, href, icon, colorClass, example은 그대로. description만 바꾼다.
  - 오늘의 타로 (초안): `카드 한 장으로 가볍게 보는 오늘의 흐름.`
  - 3장 타로 (초안): `세 장의 흐름을 이야기로 엮어 고민을 정리.`
- sitemap: `src/app/sitemap.ts` 수정 없음. 항목 수 변화 없음. URL 변경이 없어 redirect 없음. `layout.tsx` 수정 없음.

## 보안

- RLS: 해당 없음(DB 없음).
- 시크릿·환경변수: 새 환경변수 없음. 기존 공개값 `NEXT_PUBLIC_SITE_ENG_NAME`만 저장 키 접두사로 계속 쓴다.
- 입력 검증: 질문 규칙(100자, trim) 변경 없음. 분야 선택값은 `TarotTopicSelectionType` 유니언으로만 들어오며 외부 입력(URL 등)에서 읽지 않는다. localStorage 검증 규칙은 기존 설계 5.3 그대로.
- 질문 격리: `getTarotTopicReading`, `buildTarotThreeCardStory`는 질문을 인자로 받지 않는다. 해석·이야기 경로에 질문이 들어갈 수 없게 함수 시그니처로 막는다(Q3, AC-14).
- XSS: 분야 문장·이야기는 상수와 카드 이름·키워드(상수)만으로 만든 문자열이며 React 텍스트로만 그린다. `dangerouslySetInnerHTML`을 쓰지 않는다. JSON-LD에는 정적 FAQ만 넣는다.
- 데이터 유출: 분야·질문을 URL, `console.*`, 네트워크 요청, 분석·알림 이벤트에 넣지 않는다(AC-18). 기존 설계 14장 규칙 그대로.
- API 남용 방지: API가 없으므로 rate limit 없음.
- 브라우저 저장소: 기존 키 1개, 날짜·카드 번호·방향만. 분야·질문·이야기 저장 금지(AC-19).
- 광고: 슬롯 추가 없음. 분야·이야기를 광고 뒤에 여는 구조를 쓰지 않는다(plan).

## 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 분야 해석 문장 40개 | 자체 작성(메인 AI 작성, 사용자 검수, 외부 해석 문장 미참조) | 자체 저작물(기존 위험 수용, plan 결정 11) | 가능. 대표 문장 웹 검색 샘플 확인 후 `docs/tarot/copy-log.md` 기록 |
| 흐름 이야기 문장 45개 | 같음 | 같음 | 같음 |
| 새 고지 문구, FAQ·가이드·메타데이터 수정 문구 | 같음 | 같음 | 같음 |
| 수트별 원소 관례(완드·컵·소드·펜타클 성격) | 일반적인 타로 관례(`docs/research/tarot.md` 2.1) | 아이디어 수준의 관례는 저작물이 아니다. 문장은 새로 쓴다 | 가능. 관례 자체는 공식 규칙이 아니므로 검수 때 확인 |
| 새 npm 라이브러리, 폰트, 이미지 | 없음 | | |

- 개인정보 처리: 서버 수집 없음. 새 브라우저 저장 항목 없음. 법률 확인은 받지 않는다(plan 결정 11, 위험 수용). 새로 "법률 확인 필요"로 올릴 항목은 없다.
- 갱신 대상 문서·코드

| 대상 | 위치 | 추가·수정 내용 |
|---|---|---|
| `COMPLIANCE.md` | 11장 Tarot 항목(현재 112~119행) | "분야 선택은 해석 문장만 고르고 저장하지 않음", "질문은 해석에 쓰지 않고 위기·전문가 안내 확인에만 씀", "3장 흐름 이야기는 승인된 고정 문장을 이은 참고용이며 예측·보장이 아님" 3항목. "Last updated" 갱신 |
| 개인정보처리방침 | `src/app/privacy/page.tsx` 85행 근처 타로 문장 | "분야 선택과 3장 타로 결과도 저장하지 않습니다." 취지 한 문장 추가(합니다체). `EFFECTIVE_DATE` 갱신 |
| 이용약관 | `src/app/terms/page.tsx` | 변경 없음(6장 타로 서비스 문구가 v2 동작과 충돌하지 않음) |
| `THIRD_PARTY_NOTICES.md` | 41행 | "topic examples"를 "topic readings, three-card story sentences"로 바꾼다 |
| `docs/tarot/copy-log.md` | 새 절 2개 | 분야 문장 40(그룹·분야·방향별 행), 이야기 문장 45(분야·위치·방향 또는 마무리별 행). 표 형식은 기존 3.3과 같다 |
| `DEPENDENCY_LICENSES.md`, `README.md` | 변경 없음 | 새 의존성·환경변수·API·테이블 없음 |

## PM 결정 요청 (D1~D6)

각 항목은 추천안으로 본문을 썼다. 다른 안을 고르면 해당 절을 고친다.

| 번호 | 주제 | 추천안 | 대안 |
|---|---|---|---|
| D1 | 분야 문장 데이터 구조 | **(a) 중첩 Record** `TAROT_TOPIC_READINGS[group][topic][orientation]` + `satisfies TarotTopicReadingMapType`. 장점: 40칸 중 하나라도 빠지면 컴파일 오류. 조회가 한 줄. 기존 카드 상수와 같은 TS 상수 방식. 단점: 문구 작성자가 중첩 객체 문법을 지켜야 한다. | (b) 평평한 배열 `{ group, topic, orientation, text }[]` 40행. 장점: 한 줄에 한 문장이라 검수·copy-log와 1:1로 읽기 쉽다. 단점: 누락·중복 조합을 컴파일 때 못 잡아 QA 검사가 따로 필요하고, 조회가 `find`가 된다. |
| D2 | 1장 분야 칩 상태·저장 위치 | **(a) root `useState`(메모리)**, 기본 'all'. 장점: plan 결정 5·AC-19 그대로, 구현이 가장 작다. 단점: 새로고침하면 분야가 '전체'로 돌아간다(카드는 유지). | (b) URL 쿼리(`/tarot/daily?topic=love`). 장점: 새로고침·공유 뒤에도 분야가 남는다. 단점: plan "분야 값은 저장하지 않는다"와 결이 다르고, 라우터 갱신 때 분야가 요청 URL에 실린다. 같은 페이지의 URL 변형이 생긴다(canonical로 수습은 됨). (sessionStorage·localStorage는 AC-19 위반이라 대안에서 제외) |
| D3 | 3장 흐름 이야기 생성 방식 | **(A) 분야별 위치 틀 + 마무리**: 분야 5세트 × (위치 3 × 방향 2 틀 + 방향 구성 3 마무리) = 45문장. 이야기 4문장 = 과거·현재·미래 틀(카드 이름·첫 키워드 치환) + 마무리. 장점: plan Q8 "위치별 연결 문장을 분야별 세트에서 고른다"를 문자 그대로 만족. 카드마다 문장이 달라지고 분야 차이가 문단 전체에 보인다. 단점: 새 문장 45개 작성·검수, 자리표시자 규칙을 지켜야 한다. | (B) 공통 위치 틀 + 분야 마무리: 위치 틀은 분야 무관 6개, 분야별 마무리 5세트 × 3 = 15, 총 21문장. 장점: 작성량이 절반 이하. 단점: 분야가 마지막 한 문장만 바꿔 분야 차이가 약하다. Q8 "위치별 연결 문장을 분야별 세트에서"와 어긋나 plan 해석 확인이 필요하다. (참고: 40문장을 위치 문장으로 재사용하는 방식은 시제·위치 단어를 넣을 수 없어 불가. 위치별 분야 문장 120개로 늘리는 방식은 Q5 규모 변경이라 plan 수정이 필요해 제외) |
| D4 | 기존 localStorage 키 호환 | **(a) 키 `${SITE}_tarot_daily_v1`, 형식 `v: 1` 그대로**. 장점: 저장 항목이 같아 바꿀 이유가 없고, 배포 당일 이용자의 오늘 카드가 유지된다(AC-6). 코드 변경 0. 단점: 없음. | (b) `_tarot_daily_v2` 새 키 + v1 읽어 옮기기. 장점: 형식 변경 이력이 키에 드러난다. 단점: 저장 내용이 같은데 이전 코드와 테스트만 늘어난다. 옮기기를 빼면 배포 당일 카드가 바뀌어 AC-6을 어긴다. |
| D5 | 분야 칩의 질문 예시 채우기 | **(a) 없앤다**. 칩은 분야만 고르고 입력칸을 건드리지 않는다. `examples` 데이터와 예시 순번 state를 지운다. 장점: "질문은 해석에 쓰지 않는다"(Q3)와 화면 동작이 일치하고, plan 예외("같은 칩 재선택 시 입력칸은 건드리지 않는다")와 맞다. 1장·3장 칩 동작이 같다. 단점: 질문을 쓰기 어려운 사람을 돕던 예시가 사라진다(placeholder 예시 1개는 남음). 기존 e2e 2건(AC-11, AC-12 예시 검사)을 바꿔야 한다. | (b) 다른 칩을 처음 누를 때만 예시를 채우고, 같은 칩 재선택은 무시. 장점: 입력 도움이 남는다. 단점: 칩이 질문을 바꾸면 "질문이 해석에 쓰인다"는 오해를 키운다. 'all' 칩의 예시가 따로 필요하고, 1장에도 같은 동작을 넣어야 한다. |
| D6 | 1장 질문 입력칸 배치 (Q10) | **(a) 항상 펼침**: 역방향 스위치 → 분야 칩 → 질문 입력(+용도 안내) → 뽑기 순. 장점: 현재 구조 그대로, AC-8 안내가 늘 보인다. 위기 감지 경로가 그대로다. 단점: "가볍게" 화면치고 입력 요소가 많아 보일 수 있다. | (b) 접힘: "질문 적기 (선택)" 버튼을 누르면 입력칸이 열린다. 장점: 첫 화면이 가볍다. 단점: AC-8 안내가 열기 전에는 안 보여 QA가 열기 단계를 거쳐야 하고, 접힌 동안 입력한 질문 처리 규칙(접으면 지우는가)을 새로 정해야 한다. 모양 세부는 어느 쪽이든 ui-ux-design이 정한다. |

## 담당별 작업 순서

- db: 없음.
- backend: 없음.
- frontend (frontend-dev, 이 문서 + `docs/tarot-v2/ui-ux-design.md` 기준)
  1. FE-1 타입·상수 뼈대: `tarot.type.ts` 분야 타입 교체·신규 타입, `tarot-topic.constant.ts`(신규), `tarot-topic-reading.constant.ts`·`tarot-story.constant.ts`(모든 칸을 빈 문자열로 둔 뼈대, `satisfies` 적용), `tarot-question.constant.ts` 정리, `tarot-notice.constant.ts` 새 문구 3개, `tarot-copy-rule.constant.ts` 예외 문장·어미 패턴. (먼저)
  2. FE-2 유틸: `tarot-topic.util.ts`, `tarot-story.util.ts`. 빈 문자열이면 null 규칙 포함. (FE-1 이후)
  3. FE-3 공용 컴포넌트: `topic-chips.component.tsx`를 `shared/`로 이동·수정, `card-reading.component.tsx`에 `topicSentence`, `question-input.component.tsx`에 용도 안내. (FE-1 이후, FE-2와 병렬 가능)
  4. FE-4 1장 root: 분야 state, 칩 배치(D6), 분야 문장 전달. (FE-2, FE-3 이후)
  5. FE-5 3장 root + `story.component.tsx` + `spread-result.component.tsx`: 분야 state 교체(D5), 분야 문장, 이야기, 재뽑기 결과 안내. 기존 `three-card/components/topic-chips.component.tsx` 삭제. (FE-2, FE-3 이후. FE-4와 파일이 겹치지 않아 병렬 가능)
  6. FE-6 문서·법적 고지: `COMPLIANCE.md` 11장, `src/app/privacy/page.tsx`, `THIRD_PARTY_NOTICES.md`. (독립, 언제든 가능. 단 C-1·C-2 완료 뒤 문구 최종 확인)
  7. FE-7 메뉴 설명: `src/constants/menu.constant.ts` 타로 두 항목 description. (C-3 문구 확정 뒤)
- content (메인 AI 작성 + 사용자 검수, plan 결정 3 방식)
  1. C-1 분야 해석 문장 40개 작성 → 검수. `tarot-topic-reading.constant.ts`의 문장 칸만 채운다. (FE-1 이후)
  2. C-2 흐름 이야기 문장 45개 작성 → 검수. `tarot-story.constant.ts`의 문장 칸만 채운다. (FE-1 이후, C-1과 병렬 가능. 톤 통일을 위해 C-1 샘플 검수 뒤 시작 권장)
  3. C-3 SEO 상수(title·description·headerDescription), FAQ, 두 가이드 본문, 메뉴 설명 문구. (FE-1 이후)
  4. C-4 대표 문장 웹 검색 샘플 확인, `docs/tarot/copy-log.md` 새 절 작성. (C-1~C-3 이후)
- qa (FE-4, FE-5, FE-7, C-4 이후)
  - `e2e/tarot-v2.spec.ts`: plan AC-1~27, 데스크톱·모바일.
  - `e2e/tarot-copy.spec.ts` 확장: 새 상수 2개·새 문구 금지 표현 검사, 40문장 전부 서로 다름, 분야 4세트·'all' 세트 이야기 문장 겹침 없음(AC-13), 이야기 문장 어미(`TAROT_STORY_ENDING_PATTERN`), 위치 틀의 위치 단어·자리표시자 규칙, `buildTarotThreeCardStory`를 78×77×76 전부가 아니라 그룹·방향 조합 전수(5³ × 2³ × 5분야)로 돌려 null이 아니고 3~5문장이며 "과거·현재·미래"를 포함하는지(AC-11).
  - 기존 `e2e/tarot.spec.ts`의 깨지는 테스트 정리(파일 충돌 위험 참고).

## 파일 충돌 위험

- `src/features/tarot/types/tarot.type.ts`, `tarot-question.constant.ts`: 분야 타입 교체로 `three-card/components/root.component.tsx`, 기존 `topic-chips.component.tsx`, `e2e/tarot-copy.spec.ts`가 한꺼번에 컴파일 오류가 난다. FE-1, FE-3, FE-5를 한 브랜치에서 이어서 끝낸 뒤 typecheck를 돌린다. FE-1만 먼저 머지하지 않는다.
- `tarot-topic-reading.constant.ts`, `tarot-story.constant.ts`: FE-1(뼈대)과 C-1·C-2(문장)가 같은 파일을 고친다. FE-1을 먼저 끝내고, 이후에는 콘텐츠 쪽이 문장 칸만 고친다(기존 카드 상수와 같은 규칙).
- `tarot-faq.constant.ts`, `tarot-seo.constant.ts`, 두 `guide.component.tsx`의 `GUIDE_PARAGRAPHS`: C-3만 고친다. frontend는 구조를 바꾸지 않는다.
- `shared/components/card-reading.component.tsx`, `question-input.component.tsx`, `topic-chips.component.tsx`: FE-4와 FE-5가 같이 쓴다. FE-3에서 props를 이 문서 확정값으로 만들어 두고 FE-4·FE-5에서는 고치지 않는다.
- `src/features/tarot/three-card/components/topic-chips.component.tsx` 삭제와 `shared/` 생성: git에서 이동으로 처리한다. 같은 시기에 이 파일을 고치는 다른 작업이 없어야 한다.
- `e2e/tarot.spec.ts`: v2 동작과 반대인 기존 테스트가 있다. AC-11(662행, "해석 문구는 분야와 관계없이 같습니다" 확인), AC-12(688행, 질문 예시 검사), AC-13(714행, 재뽑기 안내 문구), AC-36(1638행, 분야 흐름). `e2e/tarot-copy.spec.ts` 457~468행(`TAROT_QUESTION_TOPICS`, `examples` 검사)도 깨진다. qa가 v2 테스트를 쓰면서 같은 변경 안에서 고치거나 지운다. 기능 개발 중에는 이 두 파일이 실패하는 것이 정상이다.
- `src/constants/menu.constant.ts`: 모든 기능이 같이 쓰는 파일. 운세·점심 등 다른 기능 작업과 동시에 고치지 않는다. 타로에서는 FE-7만 description 두 줄을 고친다.
- `COMPLIANCE.md`, `src/app/privacy/page.tsx`, `THIRD_PARTY_NOTICES.md`: 다른 기능도 고치는 공용 문서. FE-6 한 작업으로 묶는다. 개인정보처리방침 `EFFECTIVE_DATE`는 다른 기능 변경과 같은 날이면 한 번만 갱신한다.
- `docs/tarot/copy-log.md`: 기존 tarot 기능 문서다. C-4만 새 절을 추가하고 기존 행은 고치지 않는다.
- 수정하지 않는 파일: `src/app/tarot/*/page.tsx`, `src/app/sitemap.ts`, `src/app/layout.tsx`, `use-daily-reading.hook.ts`, `use-three-card-reading.hook.ts`, `tarot-daily-storage.service.ts`, 카드 상수 5개.
