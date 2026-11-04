# 코드 규칙

코드를 설계하거나 작성할 때 따른다.

## 아키텍처

**Feature-based 구조.** Bulletproof React(`alan2207/bulletproof-react`) 방식을 참고하고, 기능 안에 화면 단위 하위 폴더를 추가했다. FSD(Feature-Sliced Design)가 아니다. FSD식 계층(`entities`, `widgets`, `shared`)이나 세그먼트 이름(`ui`, `model`)을 만들지 않는다.

- 고른 이유: 메뉴(로또, 타로, 점심 등)끼리 독립적이고 공유하는 게 적다. Next.js App Router의 `app/`과 충돌하지 않는다. 1인 개발에 맞는 크기다.
- 다시 검토할 때: 여러 기능이 같은 데이터(사용자, 기록 등)를 많이 공유하거나 개발자가 늘어날 때.

**import 방향은 한쪽으로만 흐른다.**

```
공용 (components/common·ui·seo, hooks, lib, stores, constants, types, styles)
  → features/<기능>
    → 앱 계층 (app, providers, components/layout)
```

- 공용 폴더는 `features/`를 import하지 않는다.
- `features/<기능>`은 공용 폴더만 import한다. 다른 기능은 import하지 않는다.
- 앱 계층(라우트, provider, 레이아웃)은 여러 기능을 조립하는 곳이라 `features/`를 import해도 된다.

## 폴더 구조

```
src/
  app/<기능>/<화면>/page.tsx     # 라우트. 얇게 두고 features의 root 컴포넌트를 렌더링
  app/api/<기능>/<리소스>/route.ts  # Route Handler (백엔드)
  components/ui/                # shadcn 생성 컴포넌트 (직접 수정 최소화)
  components/common|consent|seo/ # 여러 기능이 같이 쓰는 컴포넌트
  components/layout/            # 헤더·푸터 (앱 계층)
  features/<기능>/
    <화면>/components/          # 화면 전용 컴포넌트. 진입점은 root.component.tsx
    <화면>/hooks/               # 화면 전용 훅 (필요할 때만 만든다)
    shared/components/          # 기능 안 여러 화면이 같이 쓰는 컴포넌트
    hooks/ constants/ types/ utils/ services/ queries/  # 기능 안 여러 화면이 같이 쓰는 것
  hooks/ stores/ providers/ lib/ constants/ types/ styles/  # 전역 공용
```

- 위치는 쓰는 범위로 정한다. 한 화면에서만 → `features/<기능>/<화면>/`, 한 기능의 여러 화면 → `features/<기능>/`, 여러 기능 → `src/` 공용 폴더.
- 처음엔 가장 좁은 곳에 두고, 쓰는 곳이 늘어나면 위로 올린다.
- 예외: 특정 기능을 모르는 범용 코드(이미지 캡처, HTTP 클라이언트, 날짜 유틸 등)는 처음부터 공용에 둔다. 예: `src/hooks/use-capture.hook.ts`
- 사이트 전체에 걸친 기능(쿠키 동의 등)은 `features`가 아니라 공용이다. 예: `src/components/consent/`
- import는 `@/*` (= `src/*`) 별칭을 쓴다. 같은 폴더 안에서만 상대 경로(`./`)를 쓴다.
- 다른 기능의 코드가 필요하면 직접 import하지 않고, 공용 폴더로 올린 뒤 쓴다.
- 프론트·백엔드는 폴더(`features` vs `app`)로 나누지 않는다. 한 기능의 프론트와 백엔드 코드가 모두 `features/<기능>/` 안에 있다.
  - 화면(프론트): `features/<기능>/<화면>/components/`, `<화면>/hooks/`, `queries/`
  - 서버 로직(백엔드): `features/<기능>/services/*.repository.ts` (Supabase 조회·저장, 외부 API). `supabase-server.ts`를 쓰므로 `route.ts`나 서버 컴포넌트에서만 import한다.
  - 클라이언트 데이터 접근(프론트): `features/<기능>/services/*.service.ts` (`http`로 자기 API 호출, localStorage). 예: `lotto.service.ts`, `lotto-user.service.ts`
  - `route.ts`에서 `supabaseAdmin`을 직접 쓰지 않는다. repository 함수를 부른다.
  - `src/app/`은 Next.js의 입구다. `page.tsx`(화면 입구)와 `api/**/route.ts`(API 입구) 모두 얇게 두고 features를 호출한다.
- 기능에 속하지 않는 것: 라우트(`src/app/<기능>/`), API(`src/app/api/`), 전역 디자인 토큰(`globals.css`, `tokens.css`), DB 마이그레이션(`supabase/`), E2E 테스트(`e2e/`), 문서(`docs/`)
- 시크릿은 `.env.local`에 둔다. 새 환경변수는 `.env.example`에도 키만 추가한다.

## Next.js·React 규칙

- 서버 컴포넌트가 기본이다. `'use client'`는 상태, 이벤트, 브라우저 API가 필요한 가장 작은 컴포넌트에만 붙인다.
- 초기 데이터는 서버 컴포넌트에서 가져온다. 클라이언트에서 서버 데이터가 필요하면 `@tanstack/react-query`(`features/<기능>/queries/*.query.ts`)를 쓴다.
- 브라우저 저장소(localStorage 등)는 클라이언트 컴포넌트나 훅 안에서만 읽는다. 서버 렌더링과 결과가 달라지는 값은 hydration 오류가 나지 않게 마운트 후에 읽는다.
- 로딩·에러는 `src/app/loading.tsx`, `src/app/error.tsx` 패턴과 `src/components/common/loading.component.tsx`를 따른다.

## React 패턴

이 프로젝트가 쓰는 패턴이다. 새 코드도 같은 패턴으로 쓴다.

| 패턴 | 언제 | 이 프로젝트의 예 |
|---|---|---|
| Container / Presentational | 화면마다 | `root.component.tsx`가 상태·데이터·이벤트를 갖고, 하위 컴포넌트는 props만 받아 그린다 |
| Custom Hook | 상태와 effect를 묶거나 재사용할 때 | `use-lotto.query.ts`(데이터 조회), `use-weighting-options.hook.ts`(옵션 상태 + 초기화 effect) |
| useReducer | 같이 바뀌는 상태가 여러 개일 때 | `use-generation-result.hook.ts`(번호, 생성 중, 시각, 오류를 액션 하나로 바꾼다) |
| Controlled Component | 입력 컴포넌트 | 값과 `onChange` 계열 콜백을 props로 받는다. 입력 상태는 부모가 갖는다 |
| Provider | 사이트 전체가 같이 쓰는 상태나 설정 | Context로 상태 공유: `consent.provider.tsx`. 감싸서 설정만 적용: `motion.provider.tsx`, `age-gate.provider.tsx` |
| Compound Component | 여러 조각이 한 덩어리인 UI | shadcn `Dialog` + `DialogContent`, `Card` + `CardHeader` |
| 전역 store (zustand) | Context로 하기엔 자주 바뀌고 여러 곳이 쓰는 클라이언트 상태 | `loading.store.ts` |

규칙:
- root 컴포넌트가 길어지면 나눈다. 관련 있는 `useState`가 여러 개(대략 4~5개 이상)면 커스텀 훅으로 묶고, 그중 늘 같이 바뀌는 것은 `useReducer`로 바꾼다. 훅은 `features/<기능>/<화면>/hooks/`에 둔다.
- 서버 데이터는 `useState` + `useEffect`로 가져오지 않는다. React Query 훅을 쓴다.
- 값으로 계산할 수 있는 것은 상태로 만들지 않는다. 렌더링 중에 계산한다.
- 쓰지 않는 패턴: HOC, render props(커스텀 훅으로 대신한다). `forwardRef`도 쓰지 않는다(`components/ui`의 shadcn 원본은 예외). React 19에서는 `ref`를 일반 prop으로 받는다.
- `<Activity>`(React 19.2): 숨긴 화면의 상태를 남겨야 할 때만 쓴다. 예: 탭을 오가도 뽑아 둔 카드·입력값이 남아야 할 때. 상태를 부모가 이미 갖고 있으면 필요 없다. 쓰려면 ui-ux-design.md에 이유를 적는다.
- 애매하면 새 패턴을 만들지 말고 PM에게 묻는다.

## 먼저 재사용할 기존 코드

새로 만들기 전에 아래를 확인하고 쓴다.

- 레이아웃: `PageHeaderComponent`, `ContentWrapperComponent`, `TitleWrapperComponent`, `ComingSoonComponent` (`src/components/common/`)
- UI 기본 요소: `src/components/ui/` (shadcn). 같은 역할의 컴포넌트를 새로 만들지 않는다.
- 색·간격·반경: `src/app/globals.css`, `src/styles/tokens.css`의 CSS 변수. 색 값을 하드코딩하지 않는다.
- 유틸: `cn()`, `http`, `getKoreaTime()` (`src/lib/`)
- 전역 provider: 연령 확인 `age-gate.provider.tsx`, 쿠키 동의 `consent.provider.tsx`, React Query `query-client.provider.tsx`
- 광고 슬롯: `src/features/ad/`
- API rate limit: `src/app/api/lotto/export/route.ts`의 IP 기준 제한 방식을 따른다.

## 네이밍 규칙

**폴더·파일 (Biome `useFilenamingConvention`으로 강제)**
- 폴더와 파일은 kebab-case. 예: `my-numbers/`, `result-card.component.tsx`
- 파일에는 역할 접미사를 붙인다: `.component.tsx`, `.constant.ts`, `.type.ts`, `.util.ts`, `.hook.ts`, `.store.ts`, `.service.ts`, `.repository.ts`, `.query.ts`, `.provider.tsx`
- 예외: Next.js 예약 파일(`page.tsx`, `layout.tsx`, `route.ts` 등), `components/ui/`의 shadcn 파일, `lib/`의 단일 모듈

**코드 (React·TypeScript 관례)**
- 컴포넌트: PascalCase + `Component` 접미사.
  - `features/` 안: 기능(+화면) 접두사를 붙인다. `features/lotto/check/components/result-card.component.tsx` → `LottoCheckResultCardComponent`
  - `root.component.tsx`: `<기능><화면>Component`. 예: `LottoCheckComponent`, `TarotDailyComponent`
  - `src/components/` 공용: 접두사 없이. 예: `NavLinkComponent`, `PageHeaderComponent`
  - Next.js 페이지·레이아웃은 `default export`, 이름은 `<경로>Page` / `<경로>Layout`. 예: `TarotDailyPage`
- props 타입: 컴포넌트 이름에서 `Component`를 빼고 `PropsType`을 붙인다. 예: `LottoCheckResultCardPropsType`
- 타입: `type` 키워드만 쓴다(`interface` 안 씀). PascalCase + `Type` 접미사. 예: `TarotCardType`
- 훅: `use` + PascalCase. 예: `useCardFlip`. zustand store는 `use<이름>Store`
- 함수·변수: camelCase. boolean은 `is`/`has`/`can`/`should`로 시작. 이벤트 핸들러는 `handle<이벤트>`, props로 받는 콜백은 `on<이벤트>`
- 상수: UPPER_SNAKE_CASE, 기능 접두사를 붙인다. 예: `TAROT_MAX_CARDS`
- export: 페이지·레이아웃 외에는 named export만 쓴다.
