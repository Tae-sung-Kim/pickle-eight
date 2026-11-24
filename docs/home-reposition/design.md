# 홈 재구성 설계서

입력: `docs/home-reposition/plan.md` (전체, 특히 "확정 답변 (2026-11-24)" 절)

규칙 문서: `docs/conventions/tech-stack.md`, `code-style.md`, `seo.md`, `data-storage.md`

## 0. 코드 확인 결과 요약

설계 전에 현재 코드(origin/main `adebade`)를 확인한 결과다. 아래 결정은 이 결과를 근거로 한다.

| 번호 | 확인 항목 | 결과 | 설계 반영 |
|---|---|---|---|
| 1 | `MENU_LIST` 순서가 쓰이는 곳 | 홈 목록·홈 ItemList JSON-LD(`src/app/page.tsx`), PC 헤더(`pc-menu.component.tsx`), 모바일 메뉴(`mobile-menu.component.tsx`), 사이트맵(`sitemap.ts`)이 배열 순서를 그대로 쓴다. 허브(`/lotto` `src/app/lotto/page.tsx`, `/fortune` `features/fortune/hub`, `/lucky-draw` `features/lucky-draw/hub`), `getOgTag`(`src/lib/seo.ts`), `lucky-draw-seo.util.ts`, 단위 테스트(fortune·meal·tarot·lucky-draw)는 모두 `find`로 그룹을 찾으므로 그룹 순서와 무관하다 | 그룹 순서만 바꾸면 네 곳(홈, PC 헤더, 모바일, 사이트맵)이 같이 바뀐다. 허브·OG 태그·기존 단위 테스트는 영향 없음 |
| 1 | e2e가 순서에 의존하는지 | `e2e/` 전체에서 홈 목록 순서, `nth()`로 메뉴 그룹을 고르는 코드는 없다. 홈 진입 검사는 이름으로만 찾는다: `meal.spec.ts` 274행(`link` 이름 `뭐 먹지` exact, `.first()`), `dream.spec.ts` 123행(`꿈 해몽` exact), `lucky-draw.spec.ts` 173행(`/운빨 뽑기/` 정규식, `.first()`), `lotto.spec.ts` 117행(`준비 중` 0개) | 순서 변경으로 깨지는 e2e는 없다. 단, 홈 그룹 설명 문구에 다른 그룹 라벨이 들어가면 `/운빨 뽑기/` 같은 정규식이 엉뚱한 링크를 먼저 잡을 수 있으므로 설명 문구 규칙(4.3)을 둔다 |
| 1 | PC 헤더 오른쪽 정렬 | `alignRight = index >= MENU_LIST.length - 2`. 새 순서에서 마지막 두 개는 꿈 해몽(항목 1개, 드롭다운 없음)과 로또(드롭다운)다. 지금 오른쪽 정렬로 열리는 운빨 뽑기 드롭다운이 4번째(index 3)가 되어 왼쪽 기준으로 열린다 | 화면 밖으로 넘칠 수 있다. 결정 필요 D-2 |
| 2 | 홈 구조 | `src/app/page.tsx`는 서버 컴포넌트. 문구 상수 `TITLE`, `HERO_DESCRIPTION`, `DESCRIPTION`이 파일 안에 있고, h1은 `SITE_NAME`(환경변수), 그 아래 히어로 문단, `LatestResultBannerComponent`, "서비스" h2와 그룹 목록(설명은 하위 항목 라벨을 `, `로 이어 붙임) 순서다. Next.js `page.tsx`는 정해진 이름 외에 다른 값을 export할 수 없어, 단위 테스트가 이 파일의 문구 상수를 import할 수 없다 | 문구 상수를 별도 상수 파일로 옮긴다(4.2) |
| 3 | 배너 위치 | `LatestResultBannerComponent`는 이미 `src/app/lotto/layout.tsx` 28행에서 `AgeGateProvider` 안, 경고 문구 아래, `children` 위에 렌더링된다. 즉 `/lotto` 허브를 포함한 모든 `/lotto/*` 페이지 상단에 이미 있다. 홈(`page.tsx` 66행)에도 한 번 더 있다 | 안 A는 "옮기기"가 아니라 "홈에서 삭제"만 하면 된다. `/lotto` 쪽 파일은 고치지 않는다 |
| 3 | AgeGate·나의 번호 요약 | 배너 안의 "내 번호" 요약은 `/lotto/my-numbers`, `/lotto/check`에서만 숨고 나머지 `/lotto/*`(허브 포함)에서 보인다. 홈에서는 AgeGate 없이 당첨 번호와 내 번호 요약이 보이고 있었다 | 삭제 후 로또 당첨 번호·내 번호 요약은 AgeGate 뒤에서만 보인다(`COMPLIANCE.md` 2번에 더 맞음). 요약은 `/lotto` 허브에서 찾을 수 있다 |
| 4 | 루트 `category` | `src/app/layout.tsx` 83행 `category: '엔터테인먼트, 도구, 로또'`. `dream`, `lucky-draw` 페이지는 자체 `category`를 쓰고, 그 밖의 페이지(로또, 운세, 타로, 뭐 먹지, 홈)는 루트 값을 상속한다 | 루트 값을 바꾸면 `/lotto/*`의 `<meta name="category">` 출력도 바뀐다. `/lotto/*` 파일의 metadata 객체 diff는 없다. 결정 필요 D-3 |
| 5 | 사이트맵 주소 중복 | `sitemap.ts` 57~64행이 `new Set`으로 이미 중복을 제거한다. `/meal`, `/dream`은 한 번만 나온다 | 코드 변경 없음. 단위 테스트로 중복 없음을 고정한다(5.3) |
| 6 | 로또 비제휴 고지 위치 | `LottoFooterNoticeComponent`(로또 layout, 모든 `/lotto/*` 하단)와 이용약관 4장에 있다. 홈과 사이트 푸터(`footer.component.tsx`)에는 없다 | 배너 삭제 뒤 홈에는 로또 데이터가 없고 라벨·설명·링크만 남는다. 결정 필요 D-4 (권장: 홈에 추가하지 않음) |
| 7 | "로또 시뮬레이터" 라벨 | `e2e/`, `unit/`에서 이 문구를 찾는 곳은 없다. 단, `/lotto` 허브의 ItemList JSON-LD(`name: it.label`)와 허브 목록(`MenuListComponent`)이 이 라벨을 그대로 쓴다. `/lotto/simulator` 페이지는 OG 태그에 라벨 문자열을 직접 쓰므로 영향 없다 | 라벨을 바꾸면 `/lotto` 허브 JSON-LD가 바뀌어 F-7(로또 SEO 무변경)에 어긋난다. **유지로 확정** |
| 8 | 홈 문구 상수·금지어 테스트 위치 | 현재 문구는 `page.tsx` 안에만 있고, 홈 전용 단위 테스트 폴더는 없다. 금지어 검사 방식은 `unit/helpers/copy-check.util.ts`(`findForbidden`)와 기능별 `*-copy.test.ts`가 있다 | 상수는 `src/constants/home.constant.ts`, 테스트는 `unit/home/home-copy.test.ts` (4.2, 5.3) |

## 폴더 구조

새 기능 폴더(`src/features/home/`)는 만들지 않는다. 홈은 여러 기능을 조립하는 앱 계층 라우트이고, 새로 생기는 것은 문구 상수뿐이다.

```
src/app/page.tsx                    # 수정: 배너 삭제, 문구 상수 import, 그룹 설명 교체
src/app/layout.tsx                  # 수정: category 값만
src/constants/menu.constant.ts      # 수정: MENU_LIST 그룹 순서만 (항목·라벨·설명 변경 없음)
src/constants/home.constant.ts      # 신규: 홈 title·description·히어로·그룹별 설명 상수
src/components/layout/pc-menu.component.tsx  # D-2 안 2를 고를 때만 수정 (한 줄)
unit/home/home-copy.test.ts         # 신규: AC-4, AC-5, 조건부 AC(그룹 설명)
e2e/home.spec.ts                    # 신규 (QA): AC-1, AC-2, AC-3
```

바꾸지 않는 파일(보호 대상): `src/app/lotto/**`, `src/features/lotto/**`, `src/app/sitemap.ts`, `src/lib/seo.ts`, `src/types/menu.type.ts`, 기존 `e2e/*.spec.ts`.

## 데이터 저장 위치

새 데이터는 홈 문구 상수뿐이다.

| 데이터 | 위치 (상수 / sessionStorage / localStorage / IndexedDB / Supabase) | 이유 |
|---|---|---|
| 홈 title·description·히어로 문구 | 코드 상수 (`src/constants/home.constant.ts`) | 모두에게 같고 배포 때만 바뀐다. 단위 테스트가 import해서 금지어를 검사해야 한다 |
| 홈 그룹별 짧은 설명 | 코드 상수 (`src/constants/home.constant.ts`) | 위와 같다. 서버 HTML에 들어가야 검색에 잡힌다(F-5) |
| 메뉴 그룹 순서 | 코드 상수 (`MENU_LIST`, 기존) | 확정 답변 3번: 한 곳에서 바꿔 홈·헤더·모바일·사이트맵이 같이 따른다 |
| 나의 번호(배너 요약에 쓰임) | localStorage (기존, 변경 없음) | 배너 위치만 바뀌고 저장 방식은 그대로다. 홈은 더 이상 이 값을 읽지 않는다 |
| AgeGate 확인 여부 | sessionStorage (기존, 변경 없음) | 변경 없음 |

## API 계약

없음. 배너가 쓰는 기존 내부 API(`/api/lotto/draws`)는 그대로이며, 홈에서 더 이상 호출하지 않을 뿐이다.

## DB 스키마

없음.

## 프론트 구조

### 4.1 페이지 (서버/클라이언트 구분)

- `/` (`src/app/page.tsx`): 서버 컴포넌트 유지. 배너(클라이언트 컴포넌트)를 빼면 홈 본문은 전부 서버 HTML이 된다. `'use client'`를 새로 붙이지 않는다.
- `/lotto/*`: 변경 없음. 배너는 기존 `src/app/lotto/layout.tsx`가 계속 렌더링한다.

### 4.2 문구 상수 (`src/constants/home.constant.ts`, 신규)

`page.tsx`는 Next.js 규칙상 문구 상수를 export할 수 없으므로 별도 파일에 둔다. 위치는 `src/constants/`(전역 공용)로 한다. 홈은 기능이 아니라 앱 계층 라우트라 `features/home/`을 만들 근거가 약하고, 기존 `menu.constant.ts`, `seo-keywords.constant.ts`와 같은 층이다.

상수 이름과 값은 아래로 확정한다. 문구 중 description과 그룹 설명은 설계 초안이며 PM 확인을 받는다(열린 질문 Q-1). 바꿀 때도 상수 이름과 형태는 유지한다.

| 상수 | 타입 | 값 |
|---|---|---|
| `HOME_TITLE` | `string` | `` `${SITE_NAME} - 오늘의 운세·메뉴·뽑기 도구 모음` `` (확정 답변 5번). `SITE_NAME`은 `@/lib/seo`에서 import한다(환경변수가 없어도 기본값 "운빨연구소"가 있어 단위 테스트에서 값이 정해진다. 운영 환경에서는 지금 `page.tsx`가 쓰는 환경변수 값과 같다) |
| `HOME_DESCRIPTION` | `string` | 초안: `오늘의 운세, 오늘 뭐 먹지, 타로, 운빨 뽑기, 꿈 해몽을 무료로 가볍게 즐겨 보세요. 로또 번호 만들기와 당첨 결과 확인도 할 수 있습니다.` (확정 답변 7번: 로또 키워드를 중립 표현으로 한 문장) |
| `HOME_HERO_DESCRIPTION` | `string` | `오늘의 운세와 메뉴 고르기, 타로, 뽑기까지. 가볍게 즐기는 도구 모음입니다.` (확정 답변 5번 후보 A) |
| `HOME_GROUP_DESCRIPTIONS` | `Readonly<Record<MENU_GROUP_NAME_ENUM, string>>` | 아래 표. 키 타입을 enum으로 묶어, 새 그룹 enum이 생기면 설명이 빠졌을 때 typecheck가 실패하게 한다 |

`HOME_GROUP_DESCRIPTIONS` 초안 (확정 답변 13번 안 (c)):

| 키 | 설명 문구 초안 |
|---|---|
| `FORTUNE` | 생년월일로 보는 오늘의 운세, 띠별·별자리 운세 |
| `MEAL` | 아침·점심·저녁 메뉴를 룰렛으로 골라 보기 |
| `TAROT` | 카드 한 장 또는 세 장으로 보는 오늘의 흐름 |
| `LUCKY_DRAW` | 사다리 타기, 돌림판, 제비뽑기로 순서와 당번 정하기 |
| `DREAM` | 꿈에 나온 소재로 찾아보는 민간 풀이 사전 |
| `LOTTO` | 로또 번호 만들기, 회차별 당첨 결과, 번호 채점 |

### 4.3 그룹 설명 문구 규칙 (단위 테스트로 강제)

1. 금지 표현(5.3의 목록)을 쓰지 않는다.
2. 다른 그룹의 라벨(`운세`, `뭐 먹지`, `타로`, `운빨 뽑기`, `꿈 해몽`, `로또`)을 넣지 않는다. 자기 그룹 라벨은 허용한다. 이유: AC-1의 "그룹 이름이 한 번씩만"과 기존 e2e의 이름 검색(`/운빨 뽑기/` 정규식 등)이 다른 그룹 링크를 잡지 않게 한다.
3. `LOTTO` 설명에는 `번호 만들기`, `당첨 결과`, `채점`이 모두 들어간다(확정 답변 13번, F-5).
4. 운세 설명에 "사주"를 쓰지 않는다. 운세 문구 규칙(`fortune-copy-rule.constant.ts`)에서 "사주"는 허용 문장에만 쓰는 단어다. 홈 상수는 그 테스트의 검사 대상이 아니지만 같은 기준을 지킨다.
5. 꿈 해몽 설명에는 로또 관련 단어를 쓰지 않는다(`COMPLIANCE.md` 11번 꿈 해몽 로또 분리 방침).
6. 뭐 먹지 설명에는 "추천", 음주 관련 단어를 쓰지 않는다(`COMPLIANCE.md` 11번 뭐 먹지 항목).

### 4.4 컴포넌트 트리 (`/`)

```
RootPage (서버)
├─ JsonLdComponent: WebSite (변경 없음)
├─ JsonLdComponent: ItemList (구조 변경 없음, 순서만 새 MENU_LIST 순서)
├─ 히어로
│  ├─ h1: SITE_NAME (변경 없음, "로또" 없음)
│  └─ p: HOME_HERO_DESCRIPTION
└─ 서비스 목록
   ├─ h2: "서비스" (변경 없음)
   └─ ul > li > Link (그룹마다)
      ├─ 그룹 라벨 (+ comingSoon 배지, 기존 그대로)
      └─ 설명: HOME_GROUP_DESCRIPTIONS[group] ?? 하위 항목 라벨 ", " 연결 (대체값)
```

- `LatestResultBannerComponent` import와 렌더링(감싼 `div` 포함)을 지운다. 홈은 더 이상 `features/lotto`를 import하지 않는다.
- 설명 조회: `MenuGroupType.group`의 타입이 `string`이라 enum 키로 바로 쓸 수 없다. 조회 실패 시 기존 방식(하위 항목 라벨 연결)으로 대체해 화면이 비지 않게 한다. 타입 단언 방식은 frontend가 정하되 `any`는 쓰지 않는다.
- `comingSoon` 그룹 처리, 링크 대상(`g.href ?? g.items[0].href`), 마크업 구조(라벨 줄 + 설명 줄)는 바꾸지 않는다. 기존 e2e가 링크 이름으로 찾기 때문이다. 시각 변경은 ui-ux-design 단계에서 정한다.
- metadata: `buildMetadata({ title: HOME_TITLE, description: HOME_DESCRIPTION, pathname: '/' })`와 기존 OG·twitter 이미지 덮어쓰기 구조를 그대로 둔다. 값만 상수로 바꾼다.

### 4.5 메뉴 순서 (`MENU_LIST`)

그룹 객체를 아래 순서로 재배치한다. 각 그룹 객체의 내용(`group`, `label`, `href`, `items`의 순서·라벨·설명·아이콘·색)은 한 글자도 바꾸지 않는다.

| 순서 | 그룹 (`group`) | 라벨 | 하위 항목 href 순서 (현행 유지) |
|---|---|---|---|
| 1 | `fortune` | 운세 | `/fortune/today`, `/fortune/tti`, `/fortune/star-sign`, `/fortune/saju` |
| 2 | `meal` | 뭐 먹지 | `/meal` |
| 3 | `tarot` | 타로 | `/tarot/daily`, `/tarot/three-card` |
| 4 | `lucky-draw` | 운빨 뽑기 | `/lucky-draw/ladder`, `/lucky-draw/roulette`, `/lucky-draw/lots` |
| 5 | `dream` | 꿈 해몽 | `/dream` |
| 6 | `lotto` | 로또 | `/lotto/generator`, `/lotto/history`, `/lotto/check`, `/lotto/my-numbers`, `/lotto/analysis`, `/lotto/simulator` |

`MENU_GROUP_NAME_ENUM`의 선언 순서와 `MenuSectionKeyType`은 바꾸지 않는다(순서에 쓰이지 않음, diff 최소화). 주석 처리된 `board` 블록도 그대로 둔다.

영향:
- 홈 목록, 홈 ItemList `position`: 새 순서.
- PC 헤더: 새 순서. 오른쪽 정렬 대상은 D-2에서 정한다.
- 모바일 메뉴: 새 순서. 로또 6개 항목이 맨 아래에 펼쳐진다. 접힘은 넣지 않는다(확정 답변 14번).
- 사이트맵: XML 안 항목 순서만 바뀐다. 포함 주소, priority(`/lotto*` 0.8, 나머지 0.6), changeFrequency는 같다.
- 허브(`/lotto`, `/fortune`, `/lucky-draw`): 영향 없음(그룹을 `find`로 찾고 하위 순서는 그대로).

### 4.6 상태 위치

- 홈: 상태 없음(서버 컴포넌트, 상수만 읽음).
- 배너 상태(React Query 최신 회차·회차 상세, 나의 번호 조회, 다이얼로그 열림)는 기존대로 배너 컴포넌트 안에 있고, `/lotto/*`에서만 마운트된다.

## SEO

| URL | title | description | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/` | `운빨연구소 - 오늘의 운세·메뉴·뽑기 도구 모음` (`HOME_TITLE`) | `HOME_DESCRIPTION` (4.2 초안) | WebSite, ItemList (구조 유지, 순서만 변경) | 기존 등록 유지 (`staticRoutes`의 `/`) |
| `/lotto` 외 `/lotto/*` | 변경 없음 | 변경 없음 | 변경 없음 | 기존 등록 유지 (`MENU_LIST` 그룹·항목, 최근 회차) |

- 렌더링: 홈 h1, 히어로, 서비스 목록(그룹 설명 포함)은 서버 HTML에 들어간다. 배너가 빠져 클라이언트 전용 영역은 없다.
- 홈 title 템플릿: 루트 `title.template`은 같은 세그먼트의 `page.tsx`에는 적용되지 않으므로 현재처럼 문자열 그대로 나간다. 사이트 이름은 title에 한 번만 나온다.
- 홈 OG·twitter 이미지: 기존 `generateOgImageUrl(TITLE, DESCRIPTION, SITE_NAME)` 구조 유지. 이미지 문구가 새 title·description으로 바뀐다.
- 홈 keywords: 루트 layout `keywords` 상속 유지(확정 답변 8번).
- 루트 layout: `category`만 `'엔터테인먼트, 도구'`로 바꾼다. title·description·OG·twitter·keywords·인증 메타 태그는 건드리지 않는다(AC-6, `seo.md`).
- `/lotto/*` 보호(AC-7): `src/app/lotto/**`, `src/features/lotto/**`, `src/lib/seo.ts`, `src/app/sitemap.ts` diff가 없어야 한다. `MENU_LIST` 로또 그룹 객체도 내용 변경 없이 위치만 옮기므로 `/lotto` 허브 ItemList JSON-LD, `getOgTag` 결과가 같다. 루트 `category` 상속 출력만 바뀐다(D-3).
- URL 변경 없음, redirect 없음.
- 배포 후 구글·네이버에서 `/`, `/lotto` 재수집 요청(확정 답변 10번, 사용자 작업).

## 보안

- 시크릿·환경변수: 새 환경변수 없음. `NEXT_PUBLIC_SITE_NAME`(기존, 공개 값)만 계속 쓴다. `.env` 수정 없음.
- 입력 검증, XSS: 홈은 입력을 받지 않는다. 문구는 정적 상수이고 React가 이스케이프한다. `dangerouslySetInnerHTML`은 기존 `JsonLdComponent` 외에 쓰지 않는다.
- RLS, rate limit: 해당 없음(API·DB 변경 없음). 홈에서 `/api/lotto/draws` 호출이 사라져 요청 수가 줄어든다.
- 브라우저 저장소: 새 키 없음. 홈은 나의 번호(localStorage)를 더 이상 읽지 않는다.
- 나이 확인: 로또 당첨 번호·내 번호 요약이 AgeGate 뒤에서만 보이게 된다(`COMPLIANCE.md` 2번).

## 상업적 이용·라이선스

새 라이브러리, 폰트, 이미지, 외부 데이터 없음. 문구는 직접 작성한 문장이다.

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 홈 문구 (title, description, 히어로, 그룹 설명) | 자체 작성 | 프로젝트 소유 | 가능 |
| 기존 의존성 (Next.js, lucide-react 등) | 변경 없음 | 기존 `DEPENDENCY_LICENSES.md` | 기존과 같음 |

법적·정책 확인:
- 개인정보: 새로 수집·저장하는 정보 없음. 개인정보처리방침·이용약관 수정 불필요.
- 광고: 홈 AdFit 슬롯은 `layout.tsx` 고정 슬롯 하나로 변경 없음. 배너가 빠져 홈에서 로또 당첨 번호가 광고 근처에 나오는 일이 없어진다.
- 금지 표현: 4.2 문구 모두 보장·적중·확률 표현이 없다. "당첨 결과"는 조회 기능 이름이라 허용한다(5.3 목록에 "당첨"만 단독으로 넣지 않는 이유).
- 로또 비제휴 고지: D-4.
- `COMPLIANCE.md` 갱신: 필요 없음(로또 고지 위치와 AgeGate 범위가 바뀌지 않음). D-4에서 안 2를 고르면 11번에 홈 고지 위치를 한 줄 추가한다.

## 담당별 작업 순서

- db: 없음.
- backend: 없음.
- frontend (순서대로, 한 사람이 처리 권장):
  1. `src/constants/home.constant.ts` 신규 작성 (4.2 상수, PM 확인된 문구).
  2. `src/constants/menu.constant.ts` 그룹 순서 재배치 (4.5). 그룹 객체 내용은 그대로 잘라 붙인다.
  3. `src/app/page.tsx` 수정: 배너 import·렌더링 삭제, 파일 안 문구 상수를 `home.constant.ts` import로 교체, 그룹 설명을 `HOME_GROUP_DESCRIPTIONS`로 교체 (1에 의존).
  4. `src/app/layout.tsx`의 `category` 값만 수정 (독립, 아무 때나).
  5. D-2 안 2를 고르면 `pc-menu.component.tsx`의 `alignRight` 기준 한 줄 수정 (2 뒤). 안 1이면 1024px·1280px 데스크톱에서 운빨 뽑기 드롭다운이 화면 안에 있는지 확인만 한다.
- qa (frontend 뒤):
  1. `unit/home/home-copy.test.ts` (5.3).
  2. `e2e/home.spec.ts` (AC-1, AC-2, AC-3). 데스크톱 실행, 모바일은 `@smoke`만.
  3. 회귀(AC-8): `lotto`, `meal`, `dream`, `lucky-draw` spec을 마지막에 한 번.
- PM 검증: AC-7은 `git diff origin/main -- src/app/lotto src/features/lotto src/lib/seo.ts src/app/sitemap.ts`가 비어 있는지로 확인한다.

### 5.3 테스트 기준 (확정)

`unit/home/home-copy.test.ts` (vitest, `unit/helpers/copy-check.util.ts` 재사용 가능):

- AC-4 그룹 순서: `MENU_LIST.map(g => g.group)`이 `['fortune', 'meal', 'tarot', 'lucky-draw', 'dream', 'lotto']`와 같다.
- AC-4 하위 순서: 그룹마다 `items.map(i => i.href)`가 4.5 표와 같다.
- AC-4 같은 상수 사용: `src/app/page.tsx`, `src/components/layout/pc-menu.component.tsx`, `src/components/layout/mobile-menu.component.tsx`, `src/app/sitemap.ts` 소스에 `MENU_LIST`가 있고 `sort(`, `toSorted(`, `reverse(`가 없다(`source-scan.util.ts`의 `readSourceFiles`로 읽기).
- AC-4 사이트맵: `SITEMAP_SKIP_FETCH=1`로 `sitemap()`을 불러, 메뉴 주소의 등장 순서가 새 그룹 순서를 따르고 URL 중복이 없다(`/meal`, `/dream`이 한 번씩). 동적 import 경로 문제로 실행이 어려우면 이 항목은 소스 검사로 대신하고 qa-report에 적는다.
- AC-5 금지 표현: `HOME_TITLE`, `HOME_DESCRIPTION`, `HOME_HERO_DESCRIPTION`, `HOME_GROUP_DESCRIPTIONS`의 모든 값에 아래 표현이 없다. 목록은 테스트 파일 안 상수로 둔다(화면 코드가 import하지 않는 검사 전용).
  - `보장`, `적중`, `확률`, `반드시`, `틀림없`, `100%`, `1등`, `예측`
- AC-1 보조(정적): `HOME_TITLE`, `HOME_HERO_DESCRIPTION`에 `로또`가 없다.
- 조건부 AC(확정 답변 13번): `MENU_GROUP_NAME_ENUM`의 모든 값에 비어 있지 않은 설명이 있고, `LOTTO` 설명에 `번호 만들기`, `당첨 결과`, `채점`이 모두 있다.
- 4.3 규칙 2·4·5·6: 다른 그룹 라벨 없음, 운세 설명에 "사주" 없음, 꿈 해몽 설명에 "로또"·"당첨"·"번호" 없음, 뭐 먹지 설명에 "추천" 없음.

`e2e/home.spec.ts` 작성 시 주의:
- AC-1 "그룹 이름이 한 번씩"은 목록 링크 안의 라벨 요소(첫 줄) 텍스트로 센다. 링크 전체 텍스트로 세면 자기 라벨이 설명에 들어간 그룹(운세, 로또)이 두 번으로 잡힌다.
- AC-3 배너 판별: 홈에 `/\d+회 당첨 번호/` 제목(h2)이 없고, `/lotto`에서 AgeGate 통과(`passLottoAgeGate`) 후 같은 제목이 보인다. 데이터가 없으면 배너가 렌더링되지 않으므로 `request.get('/api/lotto/draws?latest=1')` 성공을 전제 조건으로 확인한다(`lotto.spec.ts` 37행 방식).

## 파일 충돌 위험

- `src/constants/menu.constant.ts`: 다른 기능 작업(메뉴 추가, 라벨·설명 수정)과 같은 파일이다. 이번 변경은 블록 이동이라 diff가 크게 보인다. 다른 작업과 동시에 하지 않는다. fortune·meal·tarot·lucky-draw 단위 테스트가 이 파일을 읽지만 `find` 기반이라 순서 변경으로 깨지지 않는다.
- `src/app/layout.tsx`: 사이트 전체 공용 파일. `category` 한 줄만 바꾼다. 인증 메타 태그·광고 슬롯 줄을 건드리지 않는다.
- `src/app/page.tsx`: 홈 전용이지만 ui-ux-design 결과로 마크업이 바뀔 수 있다. frontend 한 사람이 2~3번 작업을 이어서 한다.
- `src/components/layout/pc-menu.component.tsx`: D-2 안 2일 때만. 헤더를 고치는 다른 작업과 겹치지 않게 한다.
- `src/constants/home.constant.ts`, `unit/home/`, `e2e/home.spec.ts`: 신규라 충돌 없음.

## 결정 필요 (PM 선택)

### D-1. 홈 문구 상수 위치

- 안 1 (권장): `src/constants/home.constant.ts`에 홈 전용 상수(`HOME_GROUP_DESCRIPTIONS` 포함)를 둔다. 장점: `MENU_LIST` diff가 순서 이동뿐이라 AC-4·AC-7 검토가 쉽다. 헤더·모바일 등 다른 화면에 홈 문구가 섞이지 않는다. 단점: 그룹 정보가 두 파일로 나뉜다(enum 키 Record로 누락은 typecheck가 잡는다).
- 안 2: `MenuGroupType`에 선택 필드(예: `summary`)를 추가하고 `MENU_LIST` 각 그룹에 설명을 넣는다. 장점: 그룹 정보가 한 곳. 단점: 공용 타입과 `MENU_LIST` 내용이 바뀌어 다른 기능 단위 테스트·헤더와 충돌 여지가 생기고, 로또 그룹 객체 diff가 생겨 AC-7 확인이 번거롭다.

### D-2. PC 헤더 드롭다운 오른쪽 정렬

새 순서에서 운빨 뽑기 드롭다운(폭 최대 22rem)이 왼쪽 기준으로 열린다. 헤더 메뉴는 화면 오른쪽에 붙어 있고, 운빨 뽑기 오른쪽에는 꿈 해몽·로또 두 칸만 남아 `lg`(1024px) 근처에서 화면 밖으로 넘칠 수 있다(추정, 실제 화면 확인 필요).

- 안 1: 코드 그대로 두고 1024px·1280px에서 확인만 한다. 넘치면 안 2로 간다. 장점: 헤더 파일 무변경. 단점: 확인 결과에 따라 작업이 되돌아온다.
- 안 2 (권장): 오른쪽 정렬 기준을 "마지막 세 그룹"(`index >= MENU_LIST.length - 3`)으로 바꾼다. 꿈 해몽은 드롭다운이 없으므로 실제로는 운빨 뽑기·로또가 오른쪽 기준으로 열린다. 장점: 지금과 같은 운빨 뽑기 동작을 유지하고 넘침 위험이 없다. 단점: 기획 범위 밖인 헤더 파일을 한 줄 고친다(디자인 변경은 아님).

### D-3. 루트 `category` 변경이 `/lotto/*`에 상속되는 문제

- 안 1 (권장): 루트만 `'엔터테인먼트, 도구'`로 바꾸고 `/lotto/*`는 손대지 않는다. 장점: `/lotto/*` 파일 diff 없음(AC-7 그대로 충족). `category` 메타는 주요 검색엔진 순위 신호로 쓰이지 않는 것으로 알려져 있어 유입 영향은 작다고 본다. 단점: `/lotto/*` HTML의 `<meta name="category">`에서 "로또"가 빠진다.
- 안 2: `src/app/lotto/layout.tsx`에 `metadata = { category: '엔터테인먼트, 도구, 로또' }`를 추가해 `/lotto/*` 출력을 지금과 같게 유지한다. 장점: `/lotto/*` 출력 HTML 완전 동일. 단점: `/lotto` 파일에 diff가 생겨 AC-7 문구("변경 diff가 없다")를 고쳐야 한다.

### D-4. 홈의 로또 비제휴 고지

현재 비제휴 고지는 모든 `/lotto/*` 하단(`LottoFooterNoticeComponent`)과 이용약관 4장에 있고, 홈에는 없다.

- 안 1 (권장): 홈에 추가하지 않는다. 장점: 배너 삭제 뒤 홈에는 로또 데이터(당첨 번호)가 없고 메뉴 라벨·설명·링크만 있다. 고지는 로또 데이터가 나오는 모든 화면에 이미 있다. 홈 톤 변경 취지에 맞는다. 단점: 홈 목록에 "로또", "당첨 결과" 단어는 남는다.
- 안 2: 서비스 목록 아래에 짧은 한 줄을 둔다(예: "로또 기능은 복권 운영사와 제휴 관계가 없는 비공식 서비스이며 만 19세 이상에게 제공됩니다."). 장점: 홈만 보고도 비제휴가 드러난다. 단점: 홈에 로또 비중이 다시 생기고, 새 고지 문구라 `COMPLIANCE.md` 11번 갱신과 단위 테스트 대상이 늘어난다. 법률 확인 필요 여부는 기존 로또 고지와 같은 수준이라 새로 생기지 않는다.

## 열린 질문

- Q-1. 홈 description(`HOME_DESCRIPTION`)과 그룹별 설명(`HOME_GROUP_DESCRIPTIONS`) 문구는 설계 초안이다(4.2). 이대로 확정할지, ui-ux-design 단계에서 다듬을지 정해 주세요. 상수 이름과 4.3 규칙은 바뀌지 않는다.
- Q-2. 사이트 푸터(`src/components/layout/footer.component.tsx` 28~32행)에 "운을 데이터로, 재미로. / 로또 번호 생성과 분석을 한곳에서 즐겨보세요."가 있어 홈 하단에도 로또 중심 문구가 보인다. 기획 범위(홈 h1·히어로·메타·목록)에는 없어 이번 설계에 넣지 않았다. 이번에 같이 바꿀지, 별도 작업으로 둘지 정해 주세요.
- Q-3. 사이트 헤더·푸터의 로고 아이콘이 로또 공 모양(`lotto-ball` 클래스, 숫자 8)이다. 헤더 디자인은 기획에서 제외했으므로 그대로 둔다. 톤 변경 뒤 재검토가 필요하면 별도 작업으로 올려 주세요.
- Q-4. 사이트 이름 실제 값: 코드 기본값은 "운빨연구소"(`src/lib/seo.ts`)이고, 운영 환경변수 값은 저장소에서 확인할 수 없다(확정 답변 1번). `HOME_TITLE`은 이 값을 앞에 붙이므로, 운영 값이 다르면 알려 주세요.
- Q-5. D-1 ~ D-4 선택.

## 확정 답변 (2026-11-24, 사용자 "권장대로")

- D-1: 홈 문구는 `src/constants/home.constant.ts`로 분리한다.
- D-2: `pc-menu`의 오른쪽 정렬 기준을 마지막 세 그룹으로 고친다.
- D-3: `category` 상속은 그대로 둔다(`/lotto/*` 파일 diff 없음).
- D-4: 홈에 로또 비제휴 고지는 넣지 않는다.
- Q-1: description과 그룹 설명은 초안 그대로 확정한다.
- Q-2: 푸터 문구(`footer.component.tsx` 28~32행)도 이번에 도구 모음 톤으로 바꾼다. 로또 키워드는 넣지 않고 금지 표현 규칙을 지킨다.
- Q-3: 로고 아이콘은 그대로 두고 별도 작업으로 남긴다.
- UI/UX 디자인 단계는 새 화면이 없어 생략한다(사용자 승인).
