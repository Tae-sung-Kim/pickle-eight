# 공유 기능 (share) 설계서

입력: `docs/share/plan.md` (승인 2026-11-24, 열린 질문은 모두 권장안으로 확정. Q21 공유용 카드를 따로 그림, Q22 이름 카드 미리보기)

참고: `docs/research/share.md`, `docs/share/status.md`, `src/hooks/use-capture.hook.ts`, `src/features/lotto/generator/components/number-list.component.tsx`, `docs/conventions/tech-stack.md`, `code-style.md`, `data-storage.md`, `seo.md`, 1차 대상 기능의 root 컴포넌트와 copy-rule 상수·테스트, `src/lib/seo.ts`, `src/app/api/og-image/route.ts`, `next.config.ts`(CSP), `COMPLIANCE.md`, `docs/TODO.md`

작성일: 2026-11-24. 상태: 작성 완료, 승인 대기. 코드, 규칙 문서, 약관, 방침, COMPLIANCE.md, TODO.md는 고치지 않았다.

## 0. 요약

- 새 라이브러리는 없다. 기존 `html-to-image`(MIT), `downloadjs`(MIT), 브라우저 Web Share API, Clipboard API, 기존 `sonner`, shadcn `Dialog`·`Switch`·`Button`만 쓴다. `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`는 바뀌지 않는다(AC-13).
- 공유는 브라우저 안에서만 일어난다. 새 API, 새 DB 테이블, 브라우저 저장소 쓰기가 없다. 서버로 결과 값을 보내지 않는다.
- 공통 공유 모듈은 공용 폴더(`src/lib`, `src/hooks`, `src/components/share`, `src/constants`, `src/types`)에 둔다. 기능은 순수 함수로 "카드 내용"을 만들고, 공통 카드 틀 안에 기능별 본문을 그린다.
- 카드는 화면 밖(offscreen)에 고정 크기(CSS 540×675, pixelRatio 2 → PNG 1080×1350)로 따로 그리고, 결과가 나오면 미리 PNG를 만들어 둔다(Q14). 클릭 시에는 공유창·저장·복사만 한다.
- 기존 `useCapture().onCapture`는 시그니처와 성공 흐름을 그대로 두고 `console.error`만 없애고 실패 안내를 붙인다. 로또 `number-list.component.tsx`는 한 줄도 바꾸지 않는다(AC-5).
- 사용자 선택이 필요한 항목은 8장에 모았다(D-1~D-8). 각 항목에 권장안을 적었다.

## 폴더 구조

새 파일은 (신규), 고치는 파일은 (수정), 손대지 않는 파일은 (변경 없음)으로 적는다.

```
src/
  types/share.type.ts                         (신규) 공통 타입
  constants/share.constant.ts                 (신규) 공통 문구(SHARE_TEXTS), 카드 크기, 캡처·목록 한계값
  lib/share.ts                                (신규) 순수 함수: 경로 판정, 주소 만들기, 이름 가림, 목록 줄임, 오류 분류, 빈 이미지 판정, 카드 키
  lib/share-env.ts                            (신규) 브라우저 환경 읽기(readShareEnv)와 UA 해석(parseShareUserAgent, 순수)
  lib/share-capture.ts                        (신규) 카드 요소 → PNG Blob (글꼴 대기, 워밍업, 빈 이미지 재시도)
  hooks/use-capture.hook.ts                   (수정) 기존 onCapture 유지. console 제거, 실패 안내, 결과 값 반환
  hooks/use-share.hook.ts                     (신규) 공유 흐름 오케스트레이션(useReducer)
  components/share/
    share-card-host.component.tsx            (신규) 화면 밖 카드 자리. ref를 받는다
    share-card-frame.component.tsx           (신규) 카드 공통 틀(머리: 사이트 이름·기능명, 꼬리: 주소·고지)
    share-panel.component.tsx                (신규, 'use client') 모드별 버튼, 준비 실패 안내, 안내 화면, 미리보기
    share-guide.component.tsx                (신규) 인라인 안내 화면(인앱·클립보드 거부)
    share-preview-dialog.component.tsx       (신규) 이름 카드 미리보기 Dialog
  app/globals.css                             (수정) 카드 고정 색 토큰 추가(값은 ui-ux-design.md)

  features/meal/
    constants/meal-share.constant.ts          (신규) 기능명, 공유 제목·본문, 고지 한 줄, 파일 이름
    utils/meal-share.util.ts                  (신규) buildMealShareCard
    roulette/components/share-card.component.tsx (신규) MealRouletteShareCardComponent
    roulette/components/root.component.tsx    (수정) 카드 호스트와 공유 패널 조립

  features/lucky-draw/
    constants/lucky-draw-share.constant.ts    (신규) 도구별 기능명·공유 문구·고지·파일 이름, 미리보기 기본 옵션
    utils/lucky-draw-share.util.ts            (신규) buildLadder/Roulette/LotsShareCard
    shared/components/share-options.component.tsx (신규) 미리보기 안 옵션(이름 가리기, 후보 목록 넣기)
    ladder/hooks/use-lucky-draw-ladder-share.hook.ts     (신규)
    ladder/components/share-card.component.tsx           (신규)
    ladder/components/root.component.tsx                 (수정)
    roulette/hooks/use-lucky-draw-roulette-share.hook.ts (신규)
    roulette/components/share-card.component.tsx         (신규)
    roulette/components/root.component.tsx               (수정)
    lots/hooks/use-lucky-draw-lots-share.hook.ts         (신규)
    lots/components/share-card.component.tsx             (신규)
    lots/components/root.component.tsx                   (수정)
    types/lucky-draw.type.ts                  (수정) 공유 옵션·카드 타입 추가

  features/fortune/
    constants/fortune-compatibility-share.constant.ts    (신규)
    utils/fortune-compatibility-share.util.ts            (신규) buildFortuneCompatibilityShareCard
    types/fortune-compatibility.type.ts                  (수정) 공유 카드 타입 추가
    shared/components/compatibility-share-card.component.tsx (신규)
    shared/components/compatibility-result.component.tsx (수정) shareKind prop, 호스트·패널 조립
    compatibility-tti/components/panel.component.tsx     (수정) shareKind="tti" 전달만
    compatibility-star-sign/components/panel.component.tsx (수정) shareKind="starSign" 전달만

  features/lotto/generator/components/number-list.component.tsx (변경 없음, AC-5)
  app/**/page.tsx, 각 기능 *-seo.constant.ts, constants/menu.constant.ts, app/sitemap.ts (변경 없음, AC-11)
  app/api/og-image/route.ts                   (D-6 A안일 때만 수정)
  app/privacy/page.tsx, app/terms/page.tsx    (수정) 공유 문단 추가

unit/share/                                   (신규) 공통 단위 테스트 7개 (7장)
unit/meal/meal-copy.test.ts, unit/lucky-draw/lucky-draw-copy.test.ts, unit/fortune/compatibility-copy.test.ts (수정) 공유 문구를 검사 대상에 추가
e2e/share.spec.ts                             (QA 신규)
```

규칙 메모
- 공용 폴더는 `features/`를 import하지 않는다. 공용 모듈은 기능 이름(meal, ladder 등)을 모른다. 기능이 공용 모듈을 부른다.
- lucky-draw 기존 파일은 상대 경로 import를 쓰지만, 새 파일은 `@/` 별칭을 쓴다(code-style 규칙).
- 파일 접미사: `lib/` 단일 모듈은 접미사 예외(`share.ts`, `share-env.ts`, `share-capture.ts`, 선례 `lib/crisis-signal.ts`).

## 데이터 저장 위치

| 데이터 | 위치 | 이유 |
|---|---|---|
| 공통 문구, 카드 크기, 한계값 | 코드 상수 `src/constants/share.constant.ts` | 모두에게 같고 자주 안 바뀐다 |
| 기능별 카드 문구(기능명, 공유 제목·본문, 고지 한 줄, 파일 이름) | 코드 상수 `features/<기능>/constants/*-share.constant.ts` (D-2 B안 기준) | 기능 copy-rule 검사와 같은 곳에서 관리 |
| 카드 내용(뽑힌 메뉴, 사다리 매칭 등) | React 메모리(렌더링 중 계산, 상태로 만들지 않음) | 화면 결과에서 바로 계산되는 값. 저장할 이유가 없고 이름이 들어갈 수 있다 |
| 미리 만든 PNG Blob, 미리보기 object URL | `useShare` 안 `useRef`·state (메모리) | 탭 안에서만 쓰는 임시 값. 결과가 바뀌거나 화면을 떠나면 버린다(object URL은 revoke) |
| 미리보기 옵션(이름 가리기, 후보 목록 넣기) | 기능 공유 훅의 `useState` | 화면을 떠나면 사라져도 된다. 저장하면 이름 처리 방식이 기기에 남는다 |
| 웹 글꼴 임베드 CSS 캐시 | `share-capture.ts` 모듈 변수(메모리) | 세션 안 재사용. 새로고침하면 다시 만든다 |
| 환경 판정 결과(모바일, 인앱 등) | `useShare` state | 매번 계산해도 싸다. 저장 불필요 |
| 공유 클릭 기록 | 저장하지 않음 | 1차는 기록하지 않는다(Q12) |

sessionStorage, localStorage, IndexedDB, Supabase는 쓰지 않는다. 방침 2장(브라우저 저장소) 목록은 늘어나지 않는다.

## API 계약

새 엔드포인트는 없다. 공유 이미지와 링크는 브라우저에서 만든다. `/api/og-image`는 공유 카드에 쓰지 않는다(Q8).

| 메서드 | 경로 | 요청 | 응답 | 에러 |
|---|---|---|---|---|
| GET | `/api/og-image` (기존, D-6 A안일 때만 변경) | 기존과 같음: `title`(≤80자), `subtitle`(≤120자), `tag`(≤24자) 쿼리 | 기존과 같음: 1200×630 PNG, `Cache-Control: public, max-age=86400`. 변경점은 이미지 하단 고정 줄 하나: `"{SITE_NAME} · 로또 번호 생성 · 분석 · 채점"` → `"{SITE_NAME}"` | 기존과 같음 |

- D-6 A안을 고르면 backend가 위 한 줄만 바꾼다. 쿼리, 길이 상한, 런타임, 캐시 헤더, 기본 부제 문구는 바꾸지 않는다. 메타 태그의 OG 제목·설명은 바뀌지 않는다(AC-11).
- D-6 B안이면 API 변경은 없다.

## DB 스키마

없음. 테이블, 컬럼, 인덱스, RLS, 마이그레이션 모두 없다. 결과 전용 링크와 결과 서버 저장은 범위 밖이다(plan 제외 범위, Q2).

## 프론트 구조

### 1. 페이지 (서버/클라이언트 구분)

- 새 페이지·라우트는 없다. 대상 페이지(`/meal`, `/lucky-draw/ladder`, `/lucky-draw/roulette`, `/lucky-draw/lots`, `/fortune/compatibility/tti`, `/fortune/compatibility/star-sign`)의 `page.tsx`는 서버 컴포넌트로 그대로 두고 고치지 않는다.
- 공유 UI는 각 기능의 기존 클라이언트 경계(root 또는 궁합 result 컴포넌트) 안에 들어간다. 새 `'use client'` 경계는 `share-panel.component.tsx` 하나다(호스트·틀·카드 컴포넌트는 상태가 없어 지시어 없이 클라이언트 트리 안에서 렌더링된다).
- 카드와 패널은 결과가 생긴 뒤 클라이언트에서만 그린다. 서버 HTML에는 들어가지 않는다.

### 2. 공통 모듈 상세

#### 2.1 타입 `src/types/share.type.ts` (확정)

```ts
/** 환경 판정 입력. readShareEnv가 채운다. 판정 실패 시 모든 값 false */
export type ShareEnvType = Readonly<{
  isCoarsePointer: boolean;   // matchMedia('(pointer: coarse)') && matchMedia('(hover: none)')
  hasWebShare: boolean;       // typeof navigator.share === 'function'
  canShareFiles: boolean;     // navigator.canShare({ files: [probe png] }) === true
  canWriteText: boolean;      // typeof navigator.clipboard?.writeText === 'function'
  canCopyImage: boolean;      // 2.4 "이미지 복사 지원 판정"
  isKakaoAndroid: boolean;    // parseShareUserAgent
  isInApp: boolean;           // parseShareUserAgent (카카오톡, 네이버 앱, 인스타그램, 페이스북, 라인)
}>;

export type ShareModeType =
  | Readonly<{ kind: 'unknown' }>                              // 마운트 전
  | Readonly<{ kind: 'mobile'; canShareFiles: boolean }>
  | Readonly<{ kind: 'guide' }>                                // 카카오톡 Android 인앱
  | Readonly<{ kind: 'desktop'; canCopyImage: boolean }>;

/** 기능이 넘기는 공유 대상. 값은 모두 상수에서 온다(사용자 입력 없음) */
export type ShareTargetType = Readonly<{
  pathname: string;   // '/'로 시작, 쿼리·해시 없음
  title: string;      // navigator.share title
  text: string;       // navigator.share text (주소 미포함)
  fileName: string;   // 'share-meal.png' 등. 영문 소문자·하이픈·.png
}>;

/** 카드 공통 틀에 들어가는 값 */
export type ShareCardFrameType = Readonly<{
  featureName: string;
  pathname: string;
  notice: string;
  accent: ShareCardAccentType;
}>;
export type ShareCardAccentType = 'meal' | 'lucky' | 'fortune';

export type SharePrepareStatusType = 'idle' | 'preparing' | 'ready' | 'error';
export type ShareCaptureErrorCodeType =
  | 'no-element' | 'blank' | 'blob-null' | 'timeout' | 'capture-failed';
export type ShareErrorKindType = 'abort' | 'not-allowed' | 'unsupported' | 'unknown';
export type ShareGuideReasonType = 'in-app' | 'clipboard';
export type ShareImageActionType = 'share' | 'download' | 'copy-image';
```

`ShareControllerType`(useShare 반환값)은 2.5에 적는다.

#### 2.2 상수 `src/constants/share.constant.ts` (값 확정, 문구는 초안)

| 이름 | 값 | 비고 |
|---|---|---|
| `SHARE_CARD_SIZE` | `{ width: 540, height: 675, pixelRatio: 2 }` | PNG 1080×1350(4:5). AC-14 기준 크기. 카드 크기와 레이아웃 기준값은 이 상수 한 곳에만 둔다(AC-15) |
| `SHARE_CARD_LIST_LIMITS` | `{ ladderRows: 10, lotsRows: 12, rouletteCandidates: 20 }` | 넘치면 마지막 줄에 "외 n개"(SHARE_TEXTS.moreTemplate). 사다리는 최대 10명이라 줄이지 않는다 |
| `SHARE_CAPTURE` | `{ maxAttempts: 3, prepareDebounceMs: 400, prepareTimeoutMs: 10000, fontEmbedTimeoutMs: 4000, blankSampleSize: { width: 54, height: 68 }, blankMinInkPixels: 20, blankColorDistance: 24 }` | 2.4 |
| `SHARE_MASK_CHAR` | `'*'` | 이름 가림 문자 |
| `SHARE_TEXTS` | 아래 표 | 공통 문구. 해요체(D-8) |

`SHARE_TEXTS` 초안(최종 문구는 ui-ux-design.md에서 확정, 금지어 검사 대상):

| 키 | 초안 |
|---|---|
| `shareButton` | 공유하기 |
| `copyLinkButton` | 링크 복사 |
| `downloadButton` | 이미지 저장 |
| `copyImageButton` | 이미지 복사 |
| `preparingLabel` | 이미지 만드는 중 |
| `linkCopied` | 링크를 복사했어요 |
| `imageCopied` | 이미지를 복사했어요 |
| `captureFailed` | 이미지를 만들지 못했어요. 링크로 공유해 주세요 |
| `retryButton` | 이미지 다시 만들기 |
| `imageCopyFailed` | 이미지를 복사하지 못했어요. 이미지 저장을 이용해 주세요 |
| `shareFailed` | 공유하지 못했어요. 아래 버튼으로 링크를 복사하거나 이미지를 저장해 주세요 |
| `legacyCaptureFailed` | 이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요 (로또 기존 버튼용) |
| `guideInAppTitle` | 이 브라우저에서는 공유할 수 없어요 |
| `guideInAppBody` | 아래 주소를 길게 눌러 복사한 뒤 다른 앱에서 붙여 넣어 주세요. |
| `guideClipboardTitle` | 링크를 복사하지 못했어요 |
| `guideClipboardBody` | 아래 주소를 길게 누르거나 선택해서 복사해 주세요. |
| `guideCloseButton` | 결과로 돌아가기 |
| `previewTitle` | 공유할 이미지 미리보기 |
| `previewDescription` | 이미지에 들어갈 이름을 확인해 주세요. 필요하면 가리거나 뺄 수 있어요. |
| `previewConfirm` | `{ share: '이 내용으로 공유', download: '이 내용으로 저장', 'copy-image': '이 내용으로 복사' }` |
| `previewCancel` | 취소 |
| `maskSwitchLabel` | 이름 가리기 |
| `maskSwitchDescription` | 첫 글자만 남기고 가려요. |
| `candidatesSwitchLabel` | 후보 목록 넣기 |
| `moreTemplate` | 외 {n}개 |

- "카카오톡" 등 메신저 이름은 공통 문구에 쓰지 않는다(Q5). 단위 테스트로 막는다.

#### 2.3 순수 함수 `src/lib/share.ts` (시그니처 확정)

```ts
export function resolveShareMode(env: ShareEnvType): Exclude<ShareModeType, { kind: 'unknown' }>;
export function buildShareUrl(pathname: string): string;          // canonicalUrl(pathname). '/'로 시작하지 않거나 '?'·'#'이 있으면 throw
export function toShareDisplayUrl(pathname: string): string;      // 'pickle-eight.vercel.app/meal' (프로토콜 제외, 카드 꼬리 표시용)
export function maskShareName(label: string): string;             // 2.6
export function truncateShareList<T>(items: readonly T[], limit: number): Readonly<{ items: readonly T[]; hiddenCount: number }>;
export function classifyShareError(error: unknown): ShareErrorKindType; // name: AbortError→abort, NotAllowedError→not-allowed, TypeError·NotSupportedError→unsupported, 그 밖→unknown
export function isShareCanvasBlank(data: Uint8ClampedArray, background: readonly [number, number, number], options: Readonly<{ minInkPixels: number; colorDistance: number }>): boolean;
export function parseCssColor(value: string): readonly [number, number, number] | null; // 'rgb(…)'/'rgba(…)'
export function toShareCardKey(value: unknown): string;           // JSON.stringify. 카드 내용과 옵션이 바뀌면 키가 바뀐다
```

경로 판정 `resolveShareMode` (AC-8, 위에서부터 첫 일치):

| 순서 | 조건 | 결과 |
|---|---|---|
| 1 | `isKakaoAndroid` | `guide` (공유 버튼 1개, 누르면 안내 화면. 공유창 안 엶) |
| 2 | `isCoarsePointer && hasWebShare` | `mobile`, `canShareFiles` 그대로 |
| 3 | 그 밖 | `desktop`, `canCopyImage` 그대로 |

- `readShareEnv()`가 예외를 내면 모든 값 false인 기본 env를 쓴다 → `desktop`, `canCopyImage: false`(AC-8 "판정 실패는 PC 경로").
- 모바일이지만 `navigator.share`가 없으면(일부 브라우저) 3번 `desktop`으로 간다(plan "링크 공유도 안 되면 PC 경로").
- PC Chrome처럼 `navigator.share`가 있어도 마우스 기기면 버튼 3개다(plan F-1).

#### 2.4 환경 읽기와 캡처

`src/lib/share-env.ts`
- `parseShareUserAgent(ua: string): { isKakaoAndroid: boolean; isInApp: boolean }` (순수, 단위 테스트)
  - `isKakaoAndroid`: `/KAKAOTALK/i` 그리고 `/Android/i`
  - `isInApp`: `/KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|Line\//i`
- `readShareEnv(): ShareEnvType` — 마운트 뒤 effect에서만 부른다(SSR 안전). 각 항목을 개별 try/catch.
- 파일 공유 판정 probe: `new File([new Uint8Array([0])], 'probe.png', { type: 'image/png' })`로 `navigator.canShare({ files: [probe] })`. 실제 공유 직전에 진짜 파일로 한 번 더 `canShare`를 확인한다.
- 이미지 복사 지원 판정 `canCopyImage`:
  1. `typeof ClipboardItem === 'undefined'` 또는 `typeof navigator.clipboard?.write !== 'function'` → false
  2. `typeof ClipboardItem.supports === 'function'`이면 `ClipboardItem.supports('image/png')` 결과
  3. `supports`가 없으면 true(구형 Safari). 실패는 클릭 때 `imageCopyFailed` 안내로 처리하고 실기기에서 확인한다(Q11).

`src/lib/share-capture.ts`
- `captureShareCard(element: HTMLElement | null): Promise<Blob>` — 실패하면 `ShareCaptureError`(`code: ShareCaptureErrorCodeType`)를 throw.
- 순서
  1. 요소가 없으면 `no-element`.
  2. `await document.fonts.ready` (plan 예외 "글꼴 로딩 뒤 생성").
  3. 글꼴 임베드 CSS: 세션 첫 호출에서 `getFontEmbedCSS(element)`를 `fontEmbedTimeoutMs` 안에 받아 모듈 변수에 캐시. 시간 초과·실패면 `skipFonts: true`로 진행(D-5 A안).
  4. 워밍업: 세션 첫 캡처는 결과를 버리고 한 번 더 만든다(iOS 첫 호출 빈 이미지, 리서치 #488·#292).
  5. `toCanvas(element, { width: 540, height: 675, pixelRatio: 2, backgroundColor: <카드 배경 계산값>, fontEmbedCSS 또는 skipFonts, cacheBust: false, filter: ignore 규칙 })`.
  6. 빈 이미지 판정: 결과 캔버스를 `blankSampleSize`로 축소해 그린 뒤 `getImageData` → `isShareCanvasBlank`(배경색과 `colorDistance` 넘게 다른 픽셀이 `blankMinInkPixels` 미만이면 빈 이미지, 전부 투명이어도 빈 이미지). 빈 이미지면 `maxAttempts`까지 다시 5번부터.
  7. `canvas.toBlob(resolve, 'image/png')`가 null이면 `blob-null`(재시도 대상).
  8. 모든 시도 실패 → 마지막 코드로 throw. 전체가 `prepareTimeoutMs`를 넘기면 `timeout`.
- 캔버스 크기는 항상 1080×1350이다. 기기 `devicePixelRatio`를 쓰지 않는다(AC-14).
- 캡처 대상은 카드 요소 하나다. 페이지, 결과 루트, 버튼 영역을 넘기지 않는다(AC-15). `toCanvas`·`toBlob` 호출은 `share-capture.ts`와 기존 `use-capture.hook.ts` 두 파일에만 있다(단위 테스트로 검사).
- 오류 기록: `console.*`를 쓰지 않는다. 마지막 오류 코드는 패널의 `data-share-error` 속성에만 남긴다(원격 기록 없음, Q12).

#### 2.5 훅 `src/hooks/use-share.hook.ts`

```ts
export type UseShareInputType = Readonly<{
  target: ShareTargetType;
  cardKey: string | null;      // null이면 결과 없음 → 패널을 그리지 않는다
  requiresPreview: boolean;    // 이름이 실리는 카드(사다리, 돌림판)만 true
}>;

export type ShareControllerType = Readonly<{
  mode: ShareModeType;
  status: SharePrepareStatusType;
  errorCode: ShareCaptureErrorCodeType | null;
  isBusy: boolean;
  url: string;                       // buildShareUrl(target.pathname)
  guide: ShareGuideReasonType | null;
  preview: Readonly<{ action: ShareImageActionType; imageUrl: string | null }> | null;
  handleShare: () => void;           // mobile·guide 모드의 버튼
  handleCopyLink: () => void;        // desktop
  handleDownload: () => void;        // desktop
  handleCopyImage: () => void;       // desktop, canCopyImage일 때만 버튼이 보인다
  handleRetry: () => void;           // 준비 실패 시 다시 만들기
  handleConfirmPreview: () => void;
  handleClosePreview: () => void;
  handleCloseGuide: () => void;
}>;

export function useShare(input: UseShareInputType): Readonly<{
  cardRef: React.RefObject<HTMLDivElement | null>;
  controller: ShareControllerType;
}>;
```

내부 상태: `useReducer`(mode, status, errorCode, guide, preview, modeOverride, generation). Blob과 진행 중 표시(`busyRef`)는 `useRef`.

흐름

| 시점 | 동작 |
|---|---|
| 마운트 | `readShareEnv()` → `resolveShareMode()` → `mode` 설정. 그 전에는 `unknown`(패널은 같은 높이 자리만 그린다, 흔들림 방지) |
| `cardKey`가 null이 아닌 값으로 바뀜 | 이전 Blob 버림, `status: preparing`, `generation += 1`, `prepareDebounceMs` 뒤 `captureShareCard(cardRef.current)`. 끝났을 때 generation이 바뀌었으면 결과를 버린다(오래된 이미지 방지) |
| 준비 성공 | Blob 보관, `status: ready`. 미리보기가 열려 있으면 object URL 갱신(이전 URL revoke) |
| 준비 실패 | `status: error`, `errorCode` 기록. 패널에 `captureFailed` 인라인 안내와 `retryButton`. 링크 공유·링크 복사는 그대로 동작(AC-3) |
| `cardKey`가 null | Blob·object URL 정리, `status: idle`. 패널 없음 |
| 언마운트 | object URL revoke, 진행 중 결과 무시 |

버튼 동작(모든 핸들러는 `busyRef`로 중복 실행을 막는다. AC-2 "두 번 눌러도 공유창 한 번")

| 모드 | 버튼 | 동작 |
|---|---|---|
| guide | 공유하기 | `guide: 'in-app'`. 공유창·클립보드 호출 없음(AC-4) |
| mobile | 공유하기 | `status: preparing`이면 로딩 표시, 누름 무시. 파일 가능(`canShareFiles && status ready && canShare({files})`)이면: `requiresPreview`면 미리보기 열기, 아니면 바로 `navigator.share({ files: [file], title, text: text + '\n' + url })`. 파일 불가(준비 실패 포함)면 `navigator.share({ title, text, url })` — 파일을 넘기지 않으므로 미리보기 없음 |
| mobile | 공유 예외 | `abort` → 아무 안내 없음. 그 밖 → `isInApp`이면 `guide: 'in-app'`, 아니면 `shareFailed` 토스트 + `modeOverride: desktop`(버튼 3개로 낮춤) |
| desktop | 링크 복사 | `navigator.clipboard.writeText(url)` → `linkCopied` 토스트. 실패·미지원 → `guide: 'clipboard'` |
| desktop | 이미지 저장 | `requiresPreview`면 미리보기, 아니면 저장. 저장: Blob이 없으면(실패 상태) 그 자리에서 `captureShareCard`를 한 번 더 시도 → 성공하면 `download(blob, fileName, 'image/png')`, 실패면 `captureFailed` 토스트. 빈 파일은 절대 내려받지 않는다 |
| desktop | 이미지 복사 | `requiresPreview`면 미리보기, 아니면 `navigator.clipboard.write([new ClipboardItem({ 'image/png': Promise<Blob> })])` → `imageCopied`. 실패 → `imageCopyFailed` |
| 미리보기 | 확인 | 열 때 정한 action을 그 클릭 안에서 실행하고 닫는다(사용자 활성화 유지). `status ready`가 아니면 확인 버튼 비활성 |

- 공유 본문 규칙(Q19): 주소는 한 번만 넣는다. 파일이 있을 때는 `url` 속성 없이 `text` 끝에 주소를 붙이고, 파일이 없을 때는 `url` 속성만 쓴다. iOS 중복 여부는 실기기에서 확인(AC-6).
- 토스트는 기존 `sonner`의 `toast()`를 쓴다(레이아웃에 `Toaster` 있음).

#### 2.6 이름 가림 `maskShareName` (확정)

- 코드 포인트 기준(`Array.from`). 1글자 → `*`. 2글자 이상 → 첫 글자 + `*` × (글자 수 − 1). 예: `김철수` → `김**`, `A` → `*`, 이모지·결합 문자도 코드 포인트 단위로 센다.
- 가림 대상: 사다리 참가자 이름(왼쪽 열), 돌림판 결과 항목과 후보 항목. 사다리 결과 칸(청소 등), 제비뽑기 항목은 가리지 않는다(plan 미리보기 대상 아님).

#### 2.7 기존 훅 `src/hooks/use-capture.hook.ts` (AC-5)

- `useCapture(): { onCapture }`와 `onCapture(elementRef, { fileName, shareTitle, shareText })` 시그니처, 캡처 방식(`toBlob`, body 배경색, ignore 필터), 성공 흐름(파일 공유 → 안 되면 downloadjs 저장)은 그대로 둔다.
- 바꾸는 것
  1. `console.error`와 주석 처리된 `alert` 삭제.
  2. 실패 시 `classifyShareError`로 나눠 `abort`는 조용히, 그 밖은 `toast(SHARE_TEXTS.legacyCaptureFailed)`.
  3. 반환 타입을 `Promise<'shared' | 'downloaded' | 'cancelled' | 'failed'>`로. 로또 쪽은 반환값을 쓰지 않으므로 코드 변경이 없다.
- `number-list.component.tsx`는 바꾸지 않는다. 2차(Q16)에서 새 카드 형식으로 옮길 때 이 파일을 고친다.
- 회귀 확인: 기존 로또 e2e에는 공유 검사가 없다. QA는 AC-5용으로 생성기에서 "공유하기"가 보이고, 공유 모의 시 파일이 넘어가고, 미지원 시 PNG가 내려받아지는지 확인한다.

#### 2.8 공통 컴포넌트

| 컴포넌트 | props | 역할 |
|---|---|---|
| `ShareCardHostComponent` | `{ ref: Ref<HTMLDivElement>; children: ReactNode }` | `fixed top-0 -left-[10000px]`, `aria-hidden="true"`, `inert`, `pointer-events-none`, `data-share-card-host`. ref는 안쪽 카드 루트(=ShareCardFrame 루트)에 연결한다. 왼쪽 밖에 두므로 320px에서도 가로 스크롤이 생기지 않는다(AC-14) |
| `ShareCardFrameComponent` | `{ frame: ShareCardFrameType; children: ReactNode }` | 고정 540×675, 고정 밝은 배경·어두운 글자(Q15, 카드 전용 토큰), 위: 사이트 이름(`SITE_NAME` 글자, 로고 이미지 없음) + 기능명, 가운데: children(기능 본문), 아래: `toShareDisplayUrl(pathname)` + 고지 한 줄. 넘치는 부분은 `overflow-hidden` |
| `SharePanelComponent` ('use client') | `{ controller: ShareControllerType; children?: ReactNode }` | 모드별 버튼, 준비 실패 안내, `ShareGuideComponent`, `SharePreviewDialogComponent`. `children`은 미리보기 안 옵션 UI(사다리·돌림판). `data-share-panel`, `data-share-mode`, `data-share-status`, `data-share-error` 속성(E2E용) |
| `ShareGuideComponent` | `{ reason: ShareGuideReasonType; url: string; onClose: () => void }` | 패널 자리에 펼치는 인라인 안내(D-4 A안). 주소는 선택 가능한 일반 텍스트(`select-all`, `break-all`). 외부 브라우저 강제 실행 없음 |
| `SharePreviewDialogComponent` | `{ action; imageUrl; isReady; onConfirm; onClose; children }` | shadcn `Dialog`. 미리 만든 PNG를 `<img src={object URL} alt=…>`로 보여 주고, 옵션 UI(children), 확인·취소 버튼. 옵션이 바뀌면 기능의 `cardKey`가 바뀌어 자동으로 다시 만든다 |

카드 규칙(AC-15, AC-16, SEO)
- 카드 DOM에는 버튼, 입력란, 링크, 광고, 동의 배너를 넣지 않는다. 넣어야 할 이유가 생기면 그 요소에 `data-capture="ignore"`를 붙인다. `share-capture.ts`의 filter는 기존 훅과 같이 `data-capture="ignore"`와 `pe-no-capture`를 뺀다.
- 카드 안에 `h1`~`h6`을 쓰지 않는다(페이지 `h1` 하나 규칙, 호스트가 `aria-hidden`이어도 지킨다). 이미지(`img`)를 쓰지 않는다(외부 이미지 CORS·권리 문제 회피).
- 카드 색은 `globals.css`에 새로 넣는 카드 전용 토큰만 쓴다. `.dark`에서 덮어쓰지 않는 값이라 다크 모드에서도 같은 이미지가 나온다. 토큰 이름은 `--share-card-bg`, `--share-card-fg`, `--share-card-muted`, `--share-card-border`, `--share-card-accent-meal`, `--share-card-accent-lucky`, `--share-card-accent-fortune`(값은 ui-ux-design.md). `dark:` 변형 금지(design-guard).
- 카드에는 모션이 없다.

### 3. 기능별 카드 구조

각 기능은 (1) 순수 builder, (2) 카드 컴포넌트, (3) root 조립으로 나눈다. builder의 입력 타입에는 넣으면 안 되는 값(동네 이름, 생년월일, 질문, 상대방 정보, 열지 않은 카드)이 아예 없다. 카드 컴포넌트는 builder 결과만 그린다(AC-7).

공통 반환 모양: `Readonly<{ frame: ShareCardFrameType; body: <기능별 본문 타입> }>`. 결과가 없거나 공개 전이면 builder가 `null`을 돌려주고, 그때 `cardKey`도 null이다.

| 기능 | builder 입력 | body | 카드 표시 | 미리보기 | 주소 |
|---|---|---|---|---|---|
| 뭐 먹지 | `{ mealLabel: string; menuName: string }` (`spin.status === 'done'`일 때만) | `{ mealLabel, menuName }` | 끼니(점심·저녁·아침·브런치), 뽑힌 메뉴 1개. 카테고리, 운세 문장, 동네 이름, 후보 목록 없음 | 없음 | `/meal` |
| 사다리 | `{ rows: { name, result }[]; isMasked: boolean }` (공개된 `rows`만, 1개 이상) | `{ rows: { left, right }[]; hiddenCount }` | 참가자 → 결과 줄. 가림 켜면 참가자만 가림 | 있음(이름 가리기) | `/lucky-draw/ladder` |
| 돌림판 | `{ pickedLabel: string; candidates: string[]; isMasked; shouldIncludeCandidates }` (`spin.status === 'done' && isRevealed`일 때만. 후보는 그 회전의 `wheelIds` 항목) | `{ picked, candidates, hiddenCount }` | 결과 항목 1개 강조 + 후보 목록(최대 20개). 라벨은 "결과"(“당첨”·“추첨” 금지) | 있음(이름 가리기, 후보 목록 넣기) | `/lucky-draw/roulette` |
| 제비뽑기 | `{ openedCards: { position, label }[] }` (열린 카드만, 1개 이상) | `{ rows: { left: '{n}번 카드', right: label }[]; hiddenCount }` | 연 순서대로 최대 12줄. 열지 않은 카드는 개수도 넣지 않는다 | 없음 | `/lucky-draw/lots` |
| 궁합(띠·별자리) | `{ kind: 'tti' \| 'starSign'; firstName; secondName; gradeKey; summary: string }` (`summary`는 `copy.summary[0]`) | `{ firstName, secondName, gradeName, summary }` | 두 띠·별자리 이름, 등급 이름, 한 줄 요약. 관계 이름, 원소, 잘 맞는 점·조율할 점, 생년월일, 시각 후보 안내 없음 | 없음 | `/fortune/compatibility/tti` 또는 `/star-sign` (D-7) |

- 제비뽑기의 `{n}번 카드`는 `lucky-draw-share.constant.ts`의 템플릿 상수(키 이름에 `Template`)로 둔다.
- 예측 방지 원칙 유지: 카드 데이터는 화면에 이미 공개된 값으로만 만든다. 돌림판 "결과 가리기"에서 공개 전, 사다리 "결과 가리기"에서 공개 전, 제비뽑기 미개봉 카드는 카드 DOM에도 없다.
- 미리보기 옵션 기본값은 `LUCKY_DRAW_SHARE_DEFAULT_OPTIONS`(D-3 A안: 사다리 `isMasked: true`, 돌림판 `isMasked: true, shouldIncludeCandidates: true`).
- 사용자가 입력한 항목(운빨 뽑기 이름·항목)은 화면과 같이 그대로 쓴다. 런타임 금지어 검사는 하지 않는다. 카드의 고정 문구(기능명, 라벨, 고지)는 전부 상수라 단위 테스트에서 금지어를 검사한다. 그래서 plan 예외의 "금지어에 걸리면 기본 문구로 바꾼다"는 런타임 대체 대신 정적 검사로 보장한다(copy-rule 상수는 화면 코드가 import하지 않는다는 기존 규칙 유지). PM 확인 항목 D-8에 함께 적었다.

기능별 상수(초안, 각 기능 copy-rule 검사 대상)

| 상수 | 뭐 먹지 | 사다리 | 돌림판 | 제비뽑기 | 띠 궁합 / 별자리 궁합 |
|---|---|---|---|---|---|
| featureName / title | 오늘 뭐 먹지 | 사다리 타기 | 돌림판 | 제비뽑기 | 띠 궁합 / 별자리 궁합 |
| text | 오늘 뭐 먹지 돌림판으로 메뉴를 뽑아 봤어요. | 사다리 타기 결과를 나눠요. | 돌림판 결과를 나눠요. | 제비뽑기 결과를 나눠요. | 띠 궁합을 재미로 봤습니다. / 별자리 궁합을 재미로 봤습니다. |
| notice (카드 고지 한 줄) | 재미로 고른 메뉴예요. 개인 정보는 담기지 않아요. | 재미와 참고를 위한 무작위 결과예요. 금전이나 승부와 관계없어요. | (사다리와 같음) | (사다리와 같음) | 재미로 보는 참고용 결과입니다. 실제 관계를 판단하지 않습니다. |
| fileName | share-meal.png | share-ladder.png | share-roulette.png | share-lots.png | share-compatibility-tti.png / share-compatibility-star-sign.png |

- 궁합 문구만 합니다체로 바꿨다. 기존 `unit/fortune/compatibility-copy.test.ts`가 궁합 문구 전체에 합니다체 검사를 하기 때문이다(plan 초안 "결과예요"는 이 검사에 걸린다). 고지 문구 확정은 PM 승인과 법률 확인 필요(plan).
- 카드 고지 문구는 각 기능의 기존 허용 예외 문장 목록을 늘리지 않고 통과해야 한다(“보장”, “보상”, “추천”, “당첨” 없음).

### 4. 컴포넌트 트리

```
뭐 먹지  MealRouletteComponent (root, 'use client')
  ├ … 기존 필터·돌림판·동네 입력
  ├ MealRouletteResultComponent (기존)
  ├ SharePanelComponent              ← 결과 카드 바로 아래, cardKey 있을 때만
  └ ShareCardHostComponent → ShareCardFrameComponent → MealRouletteShareCardComponent

사다리  LuckyDrawLadderRootComponent
  └ 결과 section
      ├ … 기존 이름 고르기, 사다리 그림, 전체 결과
      ├ SharePanelComponent
      │   └ (children) LuckyDrawShareOptionsComponent (이름 가리기)
      └ ShareCardHostComponent → Frame → LuckyDrawLadderShareCardComponent
  useLuckyDrawLadderShare(rows) → { card, options, setOptions, share }

돌림판  LuckyDrawRouletteComponent
  ├ 오른쪽 열: SpinPanel, Result (기존), SharePanelComponent (children: 이름 가리기, 후보 목록 넣기)
  └ ShareCardHostComponent → Frame → LuckyDrawRouletteShareCardComponent
  useLuckyDrawRouletteShare({ spin, isRevealed, pickedLabel, wheelEntries })

제비뽑기  LuckyDrawLotsComponent
  └ 결과 section: … 카드 그리드, SharePanelComponent, ShareCardHostComponent → Frame → LuckyDrawLotsShareCardComponent
  useLuckyDrawLotsShare(openedCards)

궁합  FortuneCompatibilityTti/StarSignPanelComponent → FortuneCompatibilityResultComponent (shareKind prop 추가)
  ├ … 기존 대조 줄, 등급, 잘 맞는 점, 다시 입력
  ├ SharePanelComponent
  └ ShareCardHostComponent → Frame → FortuneCompatibilityShareCardComponent
```

- 패널의 정확한 위치, 버튼 배치(320px 줄바꿈), 로딩 표시는 ui-ux-design.md에서 정한다. 위 트리는 어느 컴포넌트가 조립하는지만 정한다.
- 사다리 root(384줄)와 돌림판·제비뽑기 root가 더 길어지지 않게, 카드 계산·옵션 state·`useShare` 호출은 도구별 `use-lucky-draw-<도구>-share.hook.ts`로 뺀다(code-style "root가 길어지면 훅으로").

### 5. 상태 위치

| 상태 | 위치 |
|---|---|
| 결과(메뉴, 사다리 rows, 돌림판 spin, 열린 카드, 궁합 결과) | 기존 기능 훅·리듀서 그대로 |
| 카드 내용 | 렌더링 중 builder로 계산(상태 아님) |
| 미리보기 옵션 | 운빨 뽑기 도구별 share 훅의 `useState` |
| 모드, 준비 상태, 안내, 미리보기, Blob | `useShare`(공용 훅) |

### 6. 이름 카드 미리보기 흐름 (Q22)

1. 사다리·돌림판에서 결과가 공개되면 기본 옵션(가림 켬)으로 카드를 미리 만든다.
2. 사용자가 이미지가 넘어가는 동작(모바일 "공유하기" 중 파일 공유 가능 경우, PC "이미지 저장"·"이미지 복사")을 누르면 공유·저장·복사 대신 미리보기 Dialog가 열린다. 링크만 보내는 동작(PC "링크 복사", 파일 공유가 안 되는 모바일 공유)은 이름이 실리지 않으므로 미리보기 없이 바로 실행한다.
3. Dialog에는 실제로 나갈 PNG가 그대로 보인다. "이름 가리기"(사다리·돌림판), "후보 목록 넣기"(돌림판)를 바꾸면 카드가 다시 만들어지고 그동안 확인 버튼이 로딩 상태다.
4. "이 내용으로 공유/저장/복사"를 누르면 그 클릭 안에서 해당 동작을 실행한다. 취소하면 아무것도 내려받지 않고 공유창도 열지 않는다.
5. 미리보기는 이미지가 나가는 동작마다 매번 뜬다(옵션은 화면을 떠나기 전까지 유지).

QA용 추가 AC 제안(plan Q22 "채택 시 AC 추가"): AC-17 [E2E] 사다리 결과에서 "이미지 저장"을 누르면 미리보기가 뜨고, 확인 전에는 다운로드가 일어나지 않으며, 기본 상태 PNG의 참가자 이름은 가려져 있다. dev-lead와 QA가 plan에 반영할지 PM이 정한다.

### 7. 단위 테스트 범위 (vitest, `environment: 'node'`)

| 파일 | 대상 | AC |
|---|---|---|
| `unit/share/share-mode.test.ts` | `resolveShareMode` 모든 분기(카카오 Android 우선, 모바일 파일 가능·불가, 모바일인데 share 없음 → desktop, PC 이미지 복사 가능·불가, 모두 false 기본값 → desktop 2버튼), `parseShareUserAgent`(카카오톡 Android·iOS, 네이버 앱, 인스타그램, 일반 Chrome·Safari) | AC-8 |
| `unit/share/share-url.test.ts` | 1차 대상 주소 6개가 `canonicalUrl(pathname)`과 같고 각 기능 seo 상수의 pathname과 같다. 쿼리·해시·`/` 없는 값은 throw. `toShareDisplayUrl` 형식 | AC-9 |
| `unit/share/share-mask.test.ts` | `maskShareName` 1글자, 여러 글자, 이모지·서로게이트, 영문. `truncateShareList` 경계값 | AC-7 |
| `unit/share/share-capture-util.test.ts` | `isShareCanvasBlank`(배경만, 투명, 글자 픽셀 있음), `parseCssColor`, `classifyShareError`(AbortError, NotAllowedError, TypeError, 문자열, null) | plan 빈 이미지·취소 |
| `unit/share/share-card-content.test.ts` | builder 5종 출력의 모든 문자열(`flattenStrings`)이 허용 집합(기능명, 결과 값, 표시 주소, 고지, 템플릿 결과)에만 속한다. 궁합 출력에 숫자(날짜) 없음, 뭐 먹지 입력 타입에 동네 이름 없음(타입 테스트 `expectTypeOf`), 돌림판 공개 전 null, 제비뽑기 미개봉 미포함, 가림 옵션 반영, 한계값 줄임과 "외 n개" | AC-7 |
| `unit/share/share-copy.test.ts` | `SHARE_TEXTS` 전체가 뭐 먹지·운빨 뽑기(단독 "돈", 보장·보상 제한 포함)·운세+궁합 금지 목록과 패턴을 모두 통과. 메신저 이름("카카오") 없음. `{}`는 템플릿 키에만 | AC-12 |
| `unit/share/share-scope.test.ts` (소스 스캔, `readSourceFiles`) | `@/components/share/`·`use-share.hook` import는 1차 대상 파일에만 있다. `html-to-image` import는 `share-capture.ts`와 `use-capture.hook.ts`에만. `features/**/share-card.component.tsx`·`compatibility-share-card.component.tsx`에 `<button`, `<input`, `<textarea`, `<a `, `<Button`, `@/features/ad`가 없거나 `data-capture="ignore"`가 같이 있다. 카드 파일에 `<h1`~`<h6`, `<img` 없음. `1080`·`1350`·`540`·`675` 숫자가 `share.constant.ts` 밖에 없음. 공용 share 파일에 `console.` 없음. 사주·꿈 해몽·로또(생성기 제외) 폴더에 공유 import 없음 | AC-10, AC-15, AC-16 |
| `unit/meal/meal-copy.test.ts` (수정) | `meal-share.constant.ts` 문자열을 금지어 검사 대상에 추가 | AC-12 |
| `unit/lucky-draw/lucky-draw-copy.test.ts` (수정) | `lucky-draw-share.constant.ts` 문자열을 `entries`에 추가 | AC-12 |
| `unit/fortune/compatibility-copy.test.ts` (수정) | `fortune-compatibility-share.constant.ts`를 `ALL_TEXTS`에 추가(금지어, 합니다체, "사주" 없음, 숫자·자리표시 검사) | AC-12 |

E2E(`e2e/share.spec.ts`)는 QA가 만든다. 설계가 주는 고정 훅: 패널 `data-share-panel`·`data-share-mode`(`mobile`/`desktop`/`guide`/`unknown`)·`data-share-status`·`data-share-error`, 호스트 `data-share-card-host`, 버튼 이름은 `SHARE_TEXTS`. 모의 방법 참고: 모바일은 `matchMedia`의 `(pointer: coarse)`·`(hover: none)`과 `navigator.share`·`canShare`를 `addInitScript`로 바꾼다. AC-3은 `HTMLCanvasElement.prototype.toBlob`이 null을 넘기게 한다. AC-4는 카카오톡 Android UA와 `navigator.share` 제거, `clipboard.writeText` 거부. AC-14는 내려받은 PNG의 IHDR에서 1080×1350을 읽는다.

### 8. 사용자 선택 요청 (대안과 권장안)

| 번호 | 질문 | A안 | B안 | 권장 |
|---|---|---|---|---|
| D-1 | 공통 모듈을 어떻게 나눌까 | 새 `use-share.hook.ts` + `lib/share-*.ts`를 만들고, 기존 `use-capture.hook.ts`는 로또용으로 최소 수정(console 제거, 실패 안내). 장점: 로또 회귀 위험이 가장 작다(AC-5), 순수 함수를 단위 테스트하기 쉽다. 단점: 2차 전까지 캡처 경로가 두 벌 | `use-capture.hook.ts` 하나를 확장해 새 기능(미리 생성, 모드, 미리보기)을 모두 넣고 로또도 같은 내부 경로를 쓰게 바꿈. 장점: 경로 한 벌. 단점: 로또 이미지(배경색, 크기)와 동작이 바뀔 수 있어 AC-5 위험, 훅이 커짐 | A |
| D-2 | 공유 문구 상수를 어디에 둘까(AC-12 "한 곳") | 공용 `share.constant.ts` 한 파일에 공통 문구와 기능별 카드 문구를 모두 둔다. 장점: 글자 그대로 한 곳. 단점: 공용 파일이 기능 지식을 갖게 돼 import 방향 규칙과 어긋남 | 공통 문구는 `src/constants/share.constant.ts`, 기능별 카드 문구는 각 기능 `*-share.constant.ts`. 장점: 규칙 준수, 기능 copy-rule 테스트가 자기 파일만 본다. 단점: "한 곳"을 "공통 한 곳 + 기능별 한 곳"으로 해석 | B |
| D-3 | 이름 가림 기본값 | 사다리 참가자, 돌림판 항목 모두 기본 "가림 켬". 장점: 아동 이름 위험(TODO 위험 수용)을 기본값으로 줄임. 단점: 돌림판 항목이 메뉴 같은 일반 단어여도 가려져 사용자가 꺼야 함 | 사다리만 기본 켬, 돌림판은 기본 끔(미리보기에서 켬). 장점: 돌림판 결과 뜻이 바로 보임. 단점: 이름을 넣은 돌림판은 사용자가 확인 안 하면 그대로 나감 | A |
| D-4 | 인앱·클립보드 거부 안내 화면 형태 | 공유 패널 자리에 펼치는 인라인 안내. 장점: 라우트·history 조작이 없어 뒤로 가기를 해도 결과 화면 상태가 그대로, 길게 눌러 복사가 쉬움. 단점: 화면 아래쪽이면 눈에 덜 띔(포커스 이동으로 보완) | shadcn Dialog. 장점: 눈에 잘 띔. 단점: Android 뒤로 가기가 Dialog를 닫지 않고 페이지를 떠남(막으려면 history 조작 필요) | A |
| D-5 | 카드 한글 글꼴 | 웹 글꼴(Pretendard)을 세션당 한 번 임베드해 캐시. 시간 초과·실패면 기기 기본 한글 글꼴로 자동 전환. 장점: 화면과 같은 모양. 단점: 첫 준비가 느릴 수 있음(dynamic subset 파일 수, 실측 필요) | 처음부터 글꼴 임베드 끔(`skipFonts`). 장점: 빠르고 단순. 단점: 기기마다 글꼴 모양이 다름 | A |
| D-6 | `/api/og-image` 하단 로또 문구(F-7 필수) | 1차에서 하단 고정 줄을 사이트 이름만 남기게 고친다(backend 한 줄). 장점: 뭐 먹지·운빨 뽑기·궁합 링크 미리보기에 로또 문구가 나오지 않음. 단점: 로또 페이지 OG 이미지 하단도 바뀜, 메신저 캐시는 한동안 옛 이미지를 보일 수 있음 | 고치지 않고 점검 결과만 기록, 2차(Q8 기능별 고정 OG)에서 처리. 장점: 1차 범위 최소. 단점: F-7 "로또 문구가 새지 않는다"를 1차에서 못 지킴 | A |
| D-7 | 궁합 공유 주소 | 결과가 나온 페이지의 canonical(`/fortune/compatibility/tti`, `/star-sign`). 장점: 받은 사람이 같은 궁합을 바로 해 봄 | 허브 `/fortune/compatibility`. 장점: plan 표 표기와 글자가 같음. 단점: 한 번 더 눌러야 함 | A |
| D-8 | 문구 말투와 금지어 대체 | 공통 문구는 plan 초안 그대로 해요체(AC-1 E2E 문구 "링크를 복사했어요"와 일치), 궁합 카드 문구만 합니다체(기존 궁합 테스트). 금지어 "기본 문구 대체"는 런타임 대신 정적 검사로 보장 | 공통 문구도 합니다체로 통일. 단점: plan AC 문구를 바꿔야 함 | A |

카드 로고(Q21): 이미지 로고를 쓰지 않고 `SITE_NAME` 글자만 쓴다. 로고 저작권·상표 확인이 필요 없다. 로고를 넣고 싶으면 별도 승인 항목이다.

## SEO

새 URL과 sitemap 변경은 없다. 공유 UI는 결과가 생긴 뒤 클라이언트에서만 그리므로 서버 HTML, title, description, canonical, OG, JSON-LD가 바뀌지 않는다(AC-11). 공유 주소는 각 페이지의 canonical과 같다(AC-9).

| URL | title | description | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/meal` | 변경 없음 (`MEAL_HUB_SEO`) | 변경 없음 | 변경 없음 | 기존 등록 유지, 변경 없음 |
| `/lucky-draw/ladder` | 변경 없음 (`LUCKY_DRAW_SEO.ladder`) | 변경 없음 | 변경 없음 | 변경 없음 |
| `/lucky-draw/roulette` | 변경 없음 | 변경 없음 | 변경 없음 | 변경 없음 |
| `/lucky-draw/lots` | 변경 없음 | 변경 없음 | 변경 없음 | 변경 없음 |
| `/fortune/compatibility/tti` | 변경 없음 | 변경 없음 | 변경 없음 | 변경 없음 |
| `/fortune/compatibility/star-sign` | 변경 없음 | 변경 없음 | 변경 없음 | 변경 없음 |

- 렌더링: 페이지는 서버 렌더링 그대로. 카드·패널은 클라이언트 전용이며 검색 노출 대상이 아니다.
- 카드 호스트는 `aria-hidden`, `inert`이고 제목 태그를 쓰지 않아 페이지 `h1` 하나 규칙과 문서 구조를 건드리지 않는다.
- OG 이미지: D-6 A안이면 `/api/og-image` 하단 줄만 바뀐다. OG 제목·설명·이미지 URL은 그대로다. `/api/og-image`의 한글 글꼴 누락 가능성(리서치 4.5)은 2차 Q8에서 다룬다.

## 보안

- RLS: 해당 없음(DB 없음).
- 시크릿·환경변수: 새 환경변수 없음. 기존 공개값 `NEXT_PUBLIC_SITE_URL`(공유 주소), `NEXT_PUBLIC_SITE_NAME`(카드 사이트 이름)만 읽는다. 둘 다 원래 공개용이다. README 환경변수 표 변경 없음.
- 서버 전송 없음: 이미지 생성(html-to-image), 공유(Web Share), 복사(Clipboard), 저장(downloadjs) 모두 브라우저 안에서 끝난다. 결과 값을 URL 쿼리, OG, 로그에 넣지 않는다. 외부 요청은 기존 웹 글꼴(jsdelivr) 재요청뿐이다.
- 입력 검증과 XSS: 카드는 React 텍스트 노드로만 그린다. `dangerouslySetInnerHTML` 금지. html-to-image는 이미 렌더링된 DOM을 직렬화하므로 사용자 입력(운빨 뽑기 이름)이 HTML로 해석되지 않는다. 파일 이름·공유 제목·본문·주소는 전부 상수이며 사용자 입력을 넣지 않는다. `buildShareUrl`은 쿼리·해시가 있으면 거부한다.
- 개인정보 최소화: builder 입력 타입에서 생년월일, 시각, 질문, 상대방 정보, 동네 이름을 받지 않는다(AC-7). 이름이 실리는 카드는 미리보기와 기본 가림을 거친다(Q22, D-3).
- CSP: `img-src`에 `blob:`·`data:`, `font-src`·`style-src`에 `cdn.jsdelivr.net`, `connect-src https:`가 이미 있어 미리보기 `<img src="blob:…">`와 글꼴 임베드가 동작한다. `next.config.ts` 변경 없음.
- API 남용·rate limit: 새 API가 없어 해당 없음. D-6 A안도 기존 API의 문구 한 줄만 바꾼다.
- 브라우저 저장소: 공유 기능은 어떤 값도 저장하지 않는다(민감정보 저장 없음).
- 외부 브라우저 강제 실행(intent 등)은 하지 않는다.
- 오류 기록: `console` 출력 없음, 원격 오류 수집 없음.

## 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| html-to-image ^1.11.13 | 기존 의존성, `DEPENDENCY_LICENSES.md` | MIT | 가능. 이미 기재됨, 변경 없음 |
| downloadjs 1.4.7 | 기존 의존성 | MIT | 가능. 이미 기재됨 |
| Web Share API, Clipboard API | 브라우저 표준 | 해당 없음 | 가능 |
| sonner, shadcn Dialog·Switch·Button, lucide-react 아이콘 | 기존 의존성 | MIT / ISC(lucide, 기존 기재) | 가능. 새 아이콘 세트 없음 |
| Pretendard (카드 글자) | 기존 CDN 웹 글꼴, `THIRD_PARTY_NOTICES.md` | SIL OFL 1.1 | 가능. 글꼴로 만든 이미지는 글꼴 배포가 아니다(OFL 일반 해석). 임베드 CSS는 브라우저 메모리에서만 쓰고 내보내는 것은 PNG뿐. 서브셋 파일을 새로 만들지 않는다. 확인 권장 |
| 카드 문구, 고지 한 줄 | 자체 작성 | 자체 저작물 | 가능. 고지 문구 확정은 법률 확인 필요(plan) |
| 궁합 한 줄 요약 | 기존 궁합 문구(AI 작성, PM 검토, `docs/compatibility/copy-log.md`) | 기존 위험 수용 범위 | 기존 위험 수용(궁합 AI 문구 권리) 그대로. 이미지로 퍼지는 범위가 넓어지는 점은 법률 확인 필요(Q1) |
| 사이트 이름 글자 | `SITE_NAME` | 자체 | 가능. 이미지 로고 미사용 |
| 메신저 이름·로고 | 사용 안 함 | — | 버튼·안내에 "카카오톡" 등 쓰지 않음(Q5) |
| 이모지(Twemoji) | 사용 안 함 | — | Q10 |
| 광고 요소 | 카드에 넣지 않음 | — | 광고 플랫폼 공유 이미지 정책은 확인 필요(Q13) |

법률 확인 필요(PM에게 올림): 궁합 카드의 띠·별자리·등급이 생년월일 파생값인 점(Q1), 돌림판·제비뽑기 결과 이미지와 사행성 해석(Q18), 사다리·돌림판 이름(아동 이름 포함) 카드(Q22), 카드 고지 문구 3종 확정(Q4), 광고 플랫폼 정책(Q13).

새 라이브러리·글꼴·이미지가 없으므로 `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`는 바꾸지 않는다(AC-13).

### 갱신할 문서와 문구 (작업 항목)

| 문서 | 내용 |
|---|---|
| `COMPLIANCE.md` 11) Disclaimers | "Share (1st phase: `/meal`, `/lucky-draw/*`, `/fortune/compatibility/tti`, `/star-sign`)" 항목 추가: 이미지·링크는 브라우저에서만 생성, 서버 전송·저장·기록 없음, 카드 내용 규칙(개인 입력 제외), 이름 카드 미리보기와 기본 가림, 카카오톡 Android 인앱 안내(외부 브라우저 강제 실행 없음), 카카오 SDK·메신저 상표 미사용, 카드 고지 문구 위치(상수 파일), copy-rule 검사 파일, 법률 검토 없음(위험 수용 항목 나열). 1) Privacy에 "공유 기능은 새 수집 항목 없음" 한 줄 |
| `src/app/privacy/page.tsx` 1장 | 공유 문단 추가(초안): "결과 공유 기능은 공유 이미지와 링크를 이용자의 브라우저에서 만들며, 결과나 입력값을 서버로 보내거나 저장하지 않습니다. 공유 이미지에는 생년월일, 질문, 상대방 정보, 동네 이름이 들어가지 않습니다. 사다리 타기와 돌림판 이미지에는 이용자가 입력한 이름이 들어갈 수 있으며, 공유 전에 미리 보고 가릴 수 있습니다. 이용자가 고른 앱으로 보낸 뒤에는 그 앱의 정책이 적용됩니다." 2장 저장소 목록은 바뀌지 않는다 |
| `src/app/terms/page.tsx` 14장 | 공유 문단 추가(초안): "공유 기능으로 보내는 이미지와 링크는 이용자가 직접 고른 앱으로 이용자가 보내는 것입니다. 다른 사람의 이름 등 정보가 들어간 이미지를 공유할 때는 그 사람의 동의를 먼저 받아 주시기 바랍니다." 장 번호를 새로 만들지 않아 기존 장 번호가 바뀌지 않는다 |
| 약관·방침 `EFFECTIVE_DATE` | 배포일에 맞춰 다른 대기 기능(궁합, 운빨 뽑기, 뭐 먹지 지역)과 한 번에 고친다(TODO 출시 후 확인 4·7·8번과 같은 값) |
| `docs/TODO.md` | 운빨 뽑기 위험 수용(2026-11-23)에 "결과 이미지 공유와 사행성 해석(Q18)", "이름 카드 공유와 아동 이름(Q22)" 추가. 궁합 위험 수용(2026-11-24)에 "띠·별자리·등급 카드 공유(생년월일 파생값, Q1)" 추가. 출시 후 확인할 일에 "공유 실기기 확인(AC-6, 대상은 Q7)", "글꼴 임베드 시간 실측(D-5)", "광고 플랫폼 공유 이미지 정책(Q13)", "로또 생성기 공유 2차 이전(Q16)" 추가. "다음 기능" 2번 문구를 "공유 기능(카카오 SDK 없이 Web Share)"으로 갱신 |
| `README.md` | 변경 없음(새 환경변수·API·테이블 없음) |
| `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md` | 변경 없음(AC-13) |

## 담당별 작업 순서

- db: 없음.
- backend:
  - B-1 (D-6 A안일 때만) `src/app/api/og-image/route.ts` 하단 고정 줄을 `SITE_NAME`만 남기게 변경. 다른 작업과 의존 없음, 언제든 병렬 가능.
- frontend (번호 순서가 의존 순서. 같은 번호 안의 a/b/c는 파일이 겹치지 않아 병렬 가능):
  - F-1 공통 기반: `types/share.type.ts`, `constants/share.constant.ts`, `lib/share.ts`, `lib/share-env.ts` + `unit/share/share-mode|share-url|share-mask|share-capture-util|share-copy.test.ts`.
  - F-2 캡처·훅: `lib/share-capture.ts`, `hooks/use-share.hook.ts`, `hooks/use-capture.hook.ts` 수정(F-1 뒤).
  - F-3 디자인 토큰: `app/globals.css`에 카드 전용 토큰(ui-ux-design.md 값). F-4 전에 끝나야 한다.
  - F-4 공통 컴포넌트: `components/share/*` 5개(F-2, F-3 뒤).
  - F-5 기능 적용(F-4 뒤)
    - a 뭐 먹지: `meal-share.constant.ts`, `meal-share.util.ts`, `share-card.component.tsx`, root 수정, `unit/meal/meal-copy.test.ts` 수정
    - b 운빨 뽑기: `lucky-draw-share.constant.ts`, `lucky-draw-share.util.ts`, 타입, `share-options.component.tsx`, 도구별 share 훅·카드 3쌍, root 3개 수정, `unit/lucky-draw/lucky-draw-copy.test.ts` 수정 (한 담당이 순서대로. 공용 상수·테스트 파일을 같이 고치기 때문)
    - c 궁합: `fortune-compatibility-share.constant.ts`, util, 타입, `compatibility-share-card.component.tsx`, `compatibility-result.component.tsx`·패널 2개 수정, `unit/fortune/compatibility-copy.test.ts` 수정
  - F-6 `unit/share/share-card-content.test.ts`, `unit/share/share-scope.test.ts`(F-5 a·b·c 모두 끝난 뒤).
  - F-7 약관·방침 문단(`privacy/page.tsx`, `terms/page.tsx`). 문구는 PM 승인 뒤. F-5와 병렬 가능.
- 문서(PM 또는 dev-lead 지정 담당): `COMPLIANCE.md`, `docs/TODO.md` 갱신. F-5 끝난 뒤 실제 파일 경로로 적는다.
- QA: `e2e/share.spec.ts`(AC-1~5, AC-14, AC-17 채택 시) 데스크톱 실행, 로또 생성기 회귀(AC-5). 실기기 AC-6은 수동 기록.

## 파일 충돌 위험

- `src/hooks/use-capture.hook.ts`: 로또 생성기가 쓰는 유일한 공용 캡처 훅. F-2 한 사람만 고치고, 고친 뒤 로또 생성기 화면을 바로 확인한다(AC-5). `number-list.component.tsx`는 이번에 건드리지 않는다.
- `src/app/globals.css`: 전역 토큰 파일. 다른 기능 작업(색 토큰 추가)과 동시에 고치면 충돌. F-3 한 번에 끝낸다.
- `src/features/lucky-draw/{ladder,roulette,lots}/components/root.component.tsx` + `lucky-draw-share.constant.ts` + `types/lucky-draw.type.ts` + `unit/lucky-draw/lucky-draw-copy.test.ts`: 세 도구가 같은 상수·타입·테스트를 고친다. F-5b는 한 담당이 순서대로 한다.
- `src/features/fortune/shared/components/compatibility-result.component.tsx`와 두 패널: 궁합 후속 작업(TODO 7번 키워드 조정 등)과 겹치지 않게 F-5c 동안 다른 궁합 수정을 멈춘다. 궁합 테스트의 "사주" 소스 스캔에 새 파일(이름에 `compatibility`)이 포함되므로 새 파일에 "사주"를 쓰지 않는다.
- `unit/meal/meal-copy.test.ts`, `unit/fortune/compatibility-copy.test.ts`: 기능 담당 F-5a·c만 고친다.
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`: 궁합·운빨 뽑기·뭐 먹지 지역 문단과 `EFFECTIVE_DATE`가 대기 중이다. F-7은 다른 약관 수정과 동시에 하지 않는다.
- `COMPLIANCE.md`, `docs/TODO.md`: 여러 기능이 같이 고치는 문서. 한 번에 한 담당.
- `src/app/api/og-image/route.ts`(D-6 A안): 모든 페이지 OG 이미지에 영향. B-1 단독.
- 대상 페이지 `page.tsx`, 기능 `*-seo.constant.ts`, `menu.constant.ts`, `sitemap.ts`: 이번 작업에서 고치지 않는다. 고쳐야 할 일이 생기면 설계로 되돌린다(AC-11).

## PM 확정 (2026-11-24, UI/UX 단계에서 확정)

- 미리보기 이미지 `alt`와 sr-only 글자 목록은 카드 builder 값을 재사용한다.
- 준비 실패 상태에서 PC "이미지 복사"를 누르면 이미지 저장과 같이 한 번 다시 만들어 본다.
- 모바일 공유 실패로 3버튼 모드로 바뀔 때 포커스를 "링크 복사"로 옮기는 책임은 공유 버튼 컴포넌트(`src/components/share`)에 둔다.
- 새 `SHARE_TEXTS` 키는 7개다(`ui-ux-design.md` 기준).
