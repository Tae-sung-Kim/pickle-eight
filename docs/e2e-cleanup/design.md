# e2e-cleanup 설계서

입력: `docs/e2e-cleanup/plan.md`

참고: `docs/conventions/tech-stack.md`, `docs/conventions/code-style.md`(폴더 구조·네이밍 규칙), `docs/conventions/seo.md`, 현재 `e2e/` 17개 spec, `playwright.config.ts`, `package.json`, `.githooks/pre-commit`, `.claude/hooks/guard-files.js`

## 0. 확정 결정 (사용자 답변 반영)

| 번호 | 결정 | 설계 반영 위치 |
|---|---|---|
| 1 | 단위 테스트 도구는 Vitest | 2장 |
| 2 | 고지 원문 글자 단위 고정 검사 유지, 단위 테스트로 옮김 | 4.3절 (방식 A 채택) |
| 3 | 소스 스캔은 제품 규칙(금지 표현, 상표 명칭)만 단위로, 문서 기록 검사(copy-log, status.md, HEAD diff)는 삭제 | 4.1절, 4.2절 |
| 4 | SEO 서버 HTML 검사는 e2e에 기능당 1개 | 5.2절, SEO 절 |
| 5 | 모바일 smoke는 기능당 1~2개, 태그로 구분, mobile project에 grep | 5.3절 |
| 6 | fortune만 e2e 15개까지, 나머지는 5~10개 | 5.2절, 11장 |
| 7 | `/code-review` 수동 실행 운영은 README.md에 한 줄, 훅 추가 없음 | 7장 |

이 작업은 제품 코드(`src/`)를 고치지 않는다. 기능 동작·화면·문구는 바뀌지 않는다.

## 폴더 구조

### 최종 파일 구조

```
e2e/
  helpers/
    common.util.ts            # 쿠키 배너 거절, hydration 대기, pageerror 수집, 로또 성인 확인 통과 등 공용 함수
  fortune.spec.ts             # 15개 이하 (fortune, fortune-saju, fortune-saju.launch, fortune-v2 흡수)
  tarot.spec.ts               # 10개 이하 (tarot-v2 흡수)
  dream.spec.ts               # 10개 이하
  lunch.spec.ts               # 10개 이하
  swagger-docs.spec.ts        # 10개 이하 (swagger-docs.extend 흡수)
  lotto.spec.ts               # 10개 이하 (lotto.flow, lotto.smoke 합침)

unit/
  helpers/
    copy-check.util.ts        # 문자열 펼치기, 금지 표현 탐색(허용 문장 제외), 합니다체 판정, 문장 나누기
    source-scan.util.ts       # src/·public/ 파일 순회, 소스 문자열 추출 (읽기 전용)
  shared/
    crisis-phone.test.ts      # 상담전화 5개 원문 고정, CRISIS_RESULT_LINE 원문 고정
    crisis-signal.test.ts     # normalizeCrisisText, hasCrisisSignal (dream-copy에서 이관)
  fortune/
    fortune-calendar.test.ts  # 음력 표, 24절기 표, KASI 알려진 값 대조, 음력 변환, 윤달
    fortune-date.test.ts      # fortune-date, 만 나이(calculateFortuneManAge), resolveFortuneBirth, 2029년 이후 동작
    fortune-saju.test.ts      # 기둥(연·월·일·시주), 일진, 십신, 점수, 입춘·절기 경계, 표준시 안내 연도
    fortune-reading.test.ts   # 시드, 점수 구간(band), 문구 고르기, 띠·별자리 판정, 행운 요소
    fortune-copy.test.ts      # 문구 풀 구조, 금지 표현, "사주" 위치, 건강·재물 제한, 합니다체, 입력 오류 문구, 소스 문자열 금지 표현
    fortune-notice.test.ts    # 고지 원문 고정
  tarot/
    tarot-cards.test.ts       # 78장 데이터(id·이름·키워드·요약), 이름 순서, 죽음 카드 보충 문구
    tarot-copy.test.ts        # 금지 표현, 합니다체, 분야 칩·예시 상수, 분야 문장 40, 이야기 45, SEO·FAQ·가이드 규칙
    tarot-story.test.ts       # buildTarotThreeCardStory 전수 조합, getTarotTopicReading
    tarot-trademark.test.ts   # 상표 명칭(Rider-Waite 등): 문구 상수 + src/·public/ 소스 스캔
    tarot-notice.test.ts      # 고지 원문 고정
  dream/
    dream-topics.test.ts      # 소재 120개, slug, 별칭, 소재 간 중복
    dream-copy.test.ts        # 문장 수·길이, 금지 표현, 로또·과장 표현
    dream-notice.test.ts      # 고지 원문 고정
  lunch/
    lunch-menu.test.ts        # 메뉴 데이터 개수·중복, 카테고리
    lunch-copy.test.ts        # 문구 규칙(금지 표현, 합니다체)
    lunch-notice.test.ts      # 고지 원문 고정
  lotto/
    lotto-hot-cold.test.ts    # computeHotCold 집계
    lotto-generator.test.ts   # generateLottoNumbers, LottoGenerator.generate 조건
  api-docs/
    merge-openapi.test.ts     # mergeOpenApiPieces 합치기 규칙

vitest.config.ts              # 새 파일 (루트)
```

파일 수 변화: 삭제 12개, 신규 spec 1개(`e2e/lotto.spec.ts`), 수정 5개(fortune, tarot, dream, lunch, swagger-docs). 결과 spec 6개.

- 삭제: `e2e/fortune-calc.spec.ts`, `e2e/fortune-copy.spec.ts`, `e2e/fortune-saju.spec.ts`, `e2e/fortune-saju.launch.spec.ts`, `e2e/fortune-v2.spec.ts`, `e2e/tarot-v2.spec.ts`, `e2e/tarot-copy.spec.ts`, `e2e/dream-copy.spec.ts`, `e2e/lunch-copy.spec.ts`, `e2e/swagger-docs.extend.spec.ts`, `e2e/lotto.flow.spec.ts`, `e2e/lotto.smoke.spec.ts`

### 단위 테스트 위치 (PM 선택 필요, 추천 A)

| 안 | 위치 | 장점 | 단점 |
|---|---|---|---|
| **A (추천)** | 루트 `unit/<기능>/*.test.ts` | `e2e/`와 같은 성격의 최상위 폴더라 구조가 단순하다. 공용 헬퍼(`unit/helpers/`)와 공용 상수 테스트(`unit/shared/`) 위치가 자연스럽다. 제품 코드(`src/`)와 기능 폴더 구조에 영향이 없다. | 대상 코드와 경로가 멀다. 현재 `guard-files.js`에 `unit/`을 쓸 수 있는 agent가 없어 범위 추가가 필요하다. |
| B | `src/features/<기능>/tests/*.test.ts`, 공용은 `src/constants/tests/`, 헬퍼는 `src/lib/testing/` | 대상 코드와 가깝다. frontend-dev 범위(`src/features/`, `src/constants/`)로 대부분 쓸 수 있다. | 헬퍼가 `src/lib/`(backend-dev 범위)에 가서 담당이 갈린다. 테스트 파일이 제품 폴더에 섞인다. `code-style.md` 폴더 구조 절 수정 폭이 크다. |

이하 설계는 A 기준이다. B를 고르면 경로만 바꾸고 나머지 규칙은 같다.

### 네이밍

- 단위 테스트 파일: `<대상>.test.ts` (kebab-case). e2e는 기존대로 `<기능>.spec.ts`. 두 접미사로 실행 도구가 갈린다(Vitest는 `unit/**/*.test.ts`만, Playwright는 `e2e/`만 본다).
- 헬퍼 파일: `.util.ts` 접미사. `*.test.ts`가 아닌 파일에만 export를 둔다(Biome `noExportsInTest` 대응).
- 테스트 제목: 기존 제목의 AC 번호를 유지한다(예: `AC-42: 오늘 2026-11-05, 출생 2012-11-06은 만 13세(차단)`). 분류표에서 추적하기 위해서다.
- Biome `useFilenamingConvention`(kebab-case)은 `vitest.config.ts`, `*.test.ts`, `common.util.ts` 모두 통과한다(`playwright.config.ts`가 이미 같은 형태로 통과 중).

## 1. 기술 스택

- 추가: `vitest` (devDependency, 설치 시점의 최신 안정 메이저, `pnpm add -D vitest`). 사용자 승인 완료(결정 1).
- 추가하지 않는 것: `vite-tsconfig-paths`(경로 별칭은 설정의 `resolve.alias`로 처리), `jsdom`/`happy-dom`(DOM이 필요한 단위 테스트가 없다. `environment: 'node'`), `@vitest/coverage-*`(기획에 없음).
- 그 밖의 스택(Playwright, Biome, TypeScript, pnpm)은 그대로다.

## 2. Vitest 설정

### 2.1 `vitest.config.ts` 개요

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const SRC_DIR = fileURLToPath(new URL('./src/', import.meta.url));

export default defineConfig({
  resolve: {
    // tsconfig의 "@/*": ["./src/*"]와 같은 규칙. '@supabase/...' 같은 패키지는 건드리지 않도록 '@/'로 시작할 때만 바꾼다.
    alias: [{ find: /^@\//, replacement: SRC_DIR }],
  },
  test: {
    include: ['unit/**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**', 'e2e/**'],
    environment: 'node',
    globals: false, // describe·it·expect는 'vitest'에서 import한다. tsconfig types를 바꾸지 않기 위해서다.
    restoreMocks: true,
  },
});
```

- 설치된 Vitest·Vite 버전이 tsconfig 경로를 기본 지원하더라도 위 alias 방식을 쓴다(동작이 명시적이고 버전에 덜 묶인다).
- `.env*` 파일을 읽지 않는다. 단위 테스트 대상 상수·유틸에는 `process.env` 참조가 없다(확인함).
- 날짜를 고정해야 하는 테스트(2029년 이후 동작, 한국 시간 날짜 키)는 `vi.useFakeTimers()` + `vi.setSystemTime()`을 쓰고, 끝나면 `vi.useRealTimers()`로 되돌린다.

### 2.2 `package.json` 스크립트

| 스크립트 | 명령 | 용도 |
|---|---|---|
| `test` | `vitest run` | 단위 테스트 1회 실행 (검증 단계·CI용) |
| `test:watch` | `vitest` | 개발 중 감시 실행 |

기존 `e2e`, `e2e:mobile`, `e2e:all`, `e2e:headed`는 그대로 둔다. `pnpm e2e`는 desktop 전체, `pnpm e2e:mobile`은 smoke만 돈다(5.3절).

`.githooks/pre-commit`은 바꾸지 않는다. e2e와 단위 테스트를 훅에 넣지 않는다(기획 범위 제외, AC-10).

### 2.3 기존 명령과의 충돌 여부

| 명령 | 영향 | 판단 |
|---|---|---|
| `pnpm typecheck` (`tsc --noEmit`) | tsconfig `include`의 `**/*.ts`가 `unit/**`와 `vitest.config.ts`를 포함한다. `vitest`를 import하므로 타입이 잡힌다. `@/` 경로는 tsconfig `paths`로 풀린다. | 충돌 없음. tsconfig 수정 불필요 |
| `pnpm lint` (`biome check .`) | `unit/`, `vitest.config.ts`가 검사 대상에 들어간다. Biome recommended의 `noFocusedTests`(`.only` 금지), `noExportsInTest`가 적용된다. | 충돌 없음. biome.json 수정 불필요. `.only`를 남기지 않고 헬퍼는 별도 파일로 둔다 |
| `pnpm build` (`next build`) | 테스트 파일은 어떤 라우트에서도 import되지 않아 번들에 들어가지 않는다. 빌드 타입 검사는 tsconfig를 따르므로 `vitest` 타입이 설치돼 있으면 통과한다. | 충돌 없음 |
| `pnpm e2e` | Playwright `testDir: './e2e'`라 `unit/`을 보지 않는다. Vitest `include`가 `unit/**/*.test.ts`라 `e2e/`를 보지 않는다. | 충돌 없음 |
| `pnpm install` | `allowBuilds`(`pnpm-workspace.yaml`)에 새 빌드 스크립트 승인 요청이 뜰 수 있다(Vite 계열 의존성). 플랫폼별 바이너리 패키지로 동작하므로 승인 없이도 실행되는지 설치 후 `pnpm test`로 확인하고, 필요할 때만 `allowBuilds`에 항목을 추가한다. | 설치 담당이 확인 |

## 3. 분류 기준 (남김 / 단위 이관 / 삭제)

현재 `test(` 호출 827건 전부를 아래 순서로 판정한다. 위 규칙에 먼저 걸리는 쪽으로 보낸다.

1. **삭제 (문서·저장소 기록 검사)**: `docs/` 파일 내용을 읽는 검사(copy-log, status.md, calendar-verification.md 문장 존재, plan·ui-ux-design 원문 포함 여부), `git` 명령(HEAD diff, 새 이미지 0건), `THIRD_PARTY_NOTICES.md` 내용 검사. 사유: 결정 3.
2. **삭제 (보고용)**: 제목에 "(참고)" 또는 "자동 실패 아님"이 있는 후보 보고 test. 사유: 단언이 없어 회귀를 막지 못한다.
3. **삭제 (제품 규칙 아닌 소스 스캔)**: 화면 코드가 copy-rule을 import하지 않는다, AI 호출 코드가 없다, 이미지 파일 위치·이름, 지원 연도를 손으로 쓴 곳 보고. 사유: 결정 3(금지 표현·상표 명칭만 유지).
4. **단위 이관**: `page`·`request`를 쓰지 않는 test, 또는 화면에서 읽은 값을 상수·유틸 결과와 바로 비교할 수 있는 test 중 아래에 해당하는 것.
   - 계산: 음력·절기·만 나이·날짜 검증, 기둥·일진·십신·점수, 시드·구간, 띠·별자리 판정, 로또 집계·생성 조건, 명세 합치기
   - 데이터 구조: 카드 78장, 소재 120개, 메뉴 개수·중복, 문구 풀 개수·구조, 분야 문장 40, 이야기 45
   - 문구 규칙: 금지 표현, 합니다체(자동 실패 단언만), 상표 명칭, "사주" 위치 규칙, 건강·재물 제한
   - 고지 원문 고정 (4.3절)
5. **남김 (e2e)**: 5.2절 목록에 해당하는 브라우저 흐름. 같은 흐름을 입력만 바꿔 반복한 test는 대표 1개를 남기고 나머지는 단위 이관(계산 부분) 또는 삭제(사유: 남긴 e2e와 중복).
6. **삭제 (그 밖)**: 레이아웃 세부(PC 2단, 360px 높이 비슷함, 키보드 포커스 순서 등), 모바일 전용 표시 차이 중 smoke에 넣지 않은 것, DB 연결이 있어야만 통과하는 정합 검사(`핫/콜드 API 값이 서로 맞는다`, 계산 규칙은 단위로 이관). 사유를 한 줄로 적는다.

분류 결과는 QA가 `docs/e2e-cleanup/qa-report.md`에 "원래 파일 / test 제목 / 분류 / 옮긴 곳 또는 삭제 사유" 표로 남긴다(AC-4). 이관한 test는 "옮긴 곳"에 단위 테스트 파일 경로를 적는다.

### 3.1 원본 spec별 이관 방향

| 원본 spec (test 수) | 남김 (e2e) | 단위 이관 | 삭제 |
|---|---|---|---|
| fortune-calc (166) | 없음 | 거의 전부 → `unit/fortune/fortune-calendar`, `fortune-date`, `fortune-saju`, `fortune-reading` (1대1 이관, 제목 유지) | `docs/` 문서를 읽는 단언만 (값을 리터럴로 바꿔 이관할 수 있으면 이관) |
| fortune-copy (104) | 서버 HTML 절은 fortune SEO 1개로 흡수 | 풀 구조, 금지 표현, "사주" 위치, 건강·재물, 합니다체, 입력 오류 문구, 소스 문자열 금지 표현 → `fortune-copy`; 고지 원문 → `fortune-notice` | copy-log 절, THIRD_PARTY 검사, AI 호출·이미지·import 소스 스캔, (참고) 보고 |
| fortune (100) | 허브→오늘의 운세, 띠·별자리, 개인정보·저장, 연령 확인, 이용 동의, 상담전화, JS 끔의 대표 흐름 | 화면 문구를 상수와 대조하는 test, 윤달 변환·기기 시계 2029(AC-84) 계산 부분 | 메뉴 세부, 같은 흐름 반복 |
| fortune-saju (65) | 입력→결과, 시각 모름·경계, 면책·상담전화·로또 고지 대표 | 기둥 표 값, 일진·점수, 23시대, 표준시 안내 연도 → `fortune-saju` | 화면 상태·접근성 세부 |
| fortune-saju.launch (4) | noindex 없음·sitemap은 fortune SEO 1개로 흡수 | 없음 | 360px 메뉴 높이(레이아웃 세부) |
| fortune-v2 (27) | 띠·별자리 찾기 결과 대표 | 안내 문장 상수 금지 표현(AC-10) → `fortune-copy` | sitemap 단독, HEAD diff, status.md 2건 |
| tarot (88) | 오늘의 타로, 3장, 역방향, 날짜 경계, 질문 비저장, 위기 안내, JS 끔 대표 | 카드 78장 데이터 → `tarot-cards` | 이미지 파일 검사, 상담전화 기기별 환경 반복, 저장소 정리 세부 |
| tarot-v2 (37) | 분야 칩 선택 흐름 대표 | 분야 문장·이야기 상수 대조 → `tarot-copy`, `tarot-story` | 같은 흐름 반복 |
| tarot-copy (56) | 서버 HTML 절은 tarot SEO 1개로 흡수 | 금지 표현, 합니다체, 카드 데이터, 분야·이야기, 상표 명칭(상수·소스) → `tarot-copy`, `tarot-cards`, `tarot-story`, `tarot-trademark`; 글자 단위 고지 → `tarot-notice` | copy-log, THIRD_PARTY, 이미지 파일, import 검사, (참고) 보고 |
| dream (60) | 허브 검색·목록, 상세 열람·관련 소재, 위기어 안내, 메뉴 진입, 광고 차단, SEO | 화면 문구 상수 대조 | 키보드 포커스, 서버 HTML 세부(SEO 1개로 흡수) |
| dream-copy (29) | 없음 | 소재·slug·별칭·중복 → `dream-topics`; 문장 수·길이·금지 표현 → `dream-copy`; 위기어 정규화 → `shared/crisis-signal` | 소스 스캔 중 금지 표현 외 항목, (참고) 보고 |
| lunch (36) | 추천 생성→결과, 필터·빈 상태, 지도 링크, 메뉴 노출, SEO | 고지 문구 상수 대조 | 룰렛 세부, 위치·동의 세부 반복 |
| lunch-copy (17) | 없음 | 메뉴 개수·중복 → `lunch-menu`; 문구 규칙 → `lunch-copy`; 고지 → `lunch-notice` | (참고) 보고 |
| swagger-docs (16) | 화면·명세·CSV·429·기존 API 헤더·404 | 없음 | 개별 AC를 대표 test로 묶고 남는 것 |
| swagger-docs.extend (3) | 없음 | AC-14·AC-15 3건 → `api-docs/merge-openapi` | 없음 (src 아래에 파일을 쓰는 방식은 없앤다) |
| lotto.smoke (13) | 페이지 열림(SEO에 흡수), 번호 생성, 옛 URL, PC 헤더 배지 | 생성 조건(최대 20게임 제외) → `lotto-generator` | PC 2단 레이아웃, 페이지별 반복 test(SEO 1개 안의 step으로 흡수) |
| lotto.flow (3) | 채점→저장 | 핫/콜드 범위 집계, API 정합 → `lotto-hot-cold` | 없음 |

test 수는 `test(` 호출을 grep으로 센 값(합 827)이다. 반복문 안의 `test(`는 1건으로 세었으므로 실제 실행 건수와 다를 수 있다. 분류표는 실행되는 test 제목 기준으로 작성한다.

## 4. 단위 테스트 설계

### 4.1 이관 대상 유틸·상수 목록

| 대상 파일 | 주요 export | 단위 테스트 |
|---|---|---|
| `src/features/fortune/utils/fortune-lunar.util.ts` | 음력↔양력 변환, 설날 계산 | `fortune-calendar` |
| `src/features/fortune/utils/fortune-solar-term.util.ts` | 절기 조회 | `fortune-calendar`, `fortune-saju` |
| `src/features/fortune/constants/calendar/lunar-table.constant.ts`, `solar-term-table.constant.ts` | `FORTUNE_LUNAR_TABLE`, `FORTUNE_SOLAR_TERM_TABLE` | `fortune-calendar` |
| `src/features/fortune/utils/fortune-date.util.ts` | 날짜 검증, JDN, 비교, 파싱, 만 나이 | `fortune-date` |
| `src/features/fortune/utils/fortune-birth.util.ts` | `resolveFortuneBirth` | `fortune-date` |
| `src/lib/date.ts` | `getKoreaDateKey` | `fortune-date` |
| `src/features/fortune/utils/fortune-saju.util.ts` | 기둥·일진·십신·점수, `getFortuneSajuBoundary` | `fortune-saju` |
| `src/features/fortune/utils/fortune-seed.util.ts` | 시드, `getFortuneBand` | `fortune-reading` |
| `src/features/fortune/utils/fortune-reading.util.ts` | `buildFortuneReading` | `fortune-reading` |
| `src/features/fortune/utils/fortune-tti.util.ts`, `fortune-star-sign.util.ts` | 띠·별자리 판정 | `fortune-reading` |
| `src/features/fortune/constants/pools/*.constant.ts`, `fortune-copy-rule.constant.ts`, `fortune-faq/guide/seo/input/lucky/zodiac/star-sign.constant.ts`, `src/constants/menu.constant.ts` | 문구 풀·규칙·문구 상수 | `fortune-copy` |
| `src/features/fortune/constants/fortune-notice.constant.ts`, `fortune-saju-notice.constant.ts` | 고지 상수 | `fortune-notice` |
| `src/features/tarot/constants/tarot-cards.constant.ts` | `TAROT_CARDS` | `tarot-cards` |
| `src/features/tarot/constants/tarot-copy-rule.constant.ts` | `TAROT_FORBIDDEN_*`, `TAROT_TRADEMARK_TERMS`, `TAROT_STORY_ENDING_PATTERN` | `tarot-copy`, `tarot-trademark` |
| `src/features/tarot/constants/tarot-topic*.constant.ts`, `tarot-story.constant.ts`, `tarot-faq/seo/question/spread.constant.ts` | 분야·이야기·문구 상수 | `tarot-copy` |
| `src/features/tarot/utils/tarot-story.util.ts`, `tarot-topic.util.ts` | `buildTarotThreeCardStory`, `getTarotTopicReading` | `tarot-story` |
| `src/features/tarot/constants/tarot-notice.constant.ts` | 고지 상수 | `tarot-notice` |
| `src/features/dream/constants/dream-topics.constant.ts`, `dream-category.constant.ts` | 소재·분류 | `dream-topics` |
| `src/features/dream/constants/dream-copy-rule.constant.ts` | 금지·과장·로또 표현 | `dream-copy` |
| `src/features/dream/constants/dream-notice.constant.ts` | 고지 상수 | `dream-notice` |
| `src/lib/crisis-signal.ts`, `src/constants/crisis-term.constant.ts` | `normalizeCrisisText`, `hasCrisisSignal`, `CRISIS_TERMS` | `shared/crisis-signal` |
| `src/constants/crisis-phone.constant.ts` | `CRISIS_PHONES`, `CRISIS_RESULT_LINE` | `shared/crisis-phone` |
| `src/features/lunch/constants/lunch-menu.constant.ts`, `lunch-category.constant.ts` | 메뉴·카테고리 | `lunch-menu` |
| `src/features/lunch/constants/lunch-copy-rule.constant.ts`, `lunch-faq/luck/seo.constant.ts` | 문구 규칙·문구 | `lunch-copy` |
| `src/features/lunch/constants/lunch-notice.constant.ts` | 고지 상수 | `lunch-notice` |
| `src/features/lotto/utils/hot-cold.util.ts` | `computeHotCold`, `LOTTO_HOT_COLD_RECENT_WINDOW` | `lotto-hot-cold` |
| `src/features/lotto/utils/lotto.util.ts` | `generateLottoNumbers`, `LottoGenerator.generate`, `LottoUtils.computeStats` | `lotto-generator` |
| `src/features/api-docs/utils/merge-openapi.util.ts` | `mergeOpenApiPieces` | `api-docs/merge-openapi` |

### 4.2 단위 테스트 규칙

- `src/` 코드를 고치지 않는다. 내보내지 않은 함수(예: `lotto.util.ts`의 `uniqueSortedSix`)는 공개 함수로 검사한다. 공개 함수로 검사할 수 없으면 PM에게 올린다(임의로 export 추가 금지).
- 네트워크, Supabase, 파일 쓰기를 하지 않는다. 파일 읽기는 `unit/helpers/source-scan.util.ts`를 통한 `src/`·`public/` 소스 스캔(금지 표현, 상표 명칭)만 허용한다. `docs/`는 읽지 않는다.
- 소스 스캔 제외 목록은 기존 spec과 같게 한다: 각 기능의 `*-copy-rule.constant.ts`(검사 목록 자체), `src/features/tarot/tarot-dev-guide.md`.
- 계산 test는 1대1로 옮기고 제목을 유지한다. 문구 test는 자동 실패 단언만 옮긴다.
- 로또 생성은 무작위이므로 충분한 반복(예: 1,000회)으로 "6개, 1~45, 중복 없음, 오름차순, 조건 만족"을 확인한다. 핫/콜드는 고정 회차 표본(테스트 안 리터럴)으로 빈도·지연·최근 빈도·`합 = 6 × 회차 수`·마지막 회차 번호 6개의 지연 0을 확인한다.
- `merge-openapi`는 기존 extend spec의 더미 조각을 객체로 넘겨 (1) 정상 조각이면 경로가 합쳐짐, (2) `responses` 누락이면 예외 메시지에 `responses` 포함, (3) 기존 lotto 조각과 경로가 겹치면 예외를 확인한다. 기존 lotto 조각은 `src/features/api-docs/specs/lotto.openapi.json`을 import해서 쓴다.

### 4.3 고지 원문 고정 방식 (결정)

| 안 | 방식 | 장점 | 단점 |
|---|---|---|---|
| **A (채택)** | 단위 테스트 파일에 승인 원문을 문자열 리터럴로 적고 상수와 `toBe`로 비교한다 | 문서 파일 형식·위치와 무관하다. 실패 시 어느 글자가 다른지 diff가 바로 보인다. 원문을 고치려면 상수와 테스트 두 곳을 함께 고쳐야 해서 승인 없는 변경을 막는다. | 원문이 상수와 테스트 두 곳에 있다(의도된 중복). |
| B | 지금처럼 `docs/<기능>/plan.md`·`ui-ux-design.md`를 읽어 포함 여부 확인 | 승인 문서가 단일 출처다. | 결정 3의 "문서 기록 검사 삭제"와 성격이 같다. 문서를 정리하거나 문단이 바뀌면 깨진다. 포함 여부라 부분 문자열 변경을 놓칠 수 있다. |
| C | Vitest 스냅샷 | 작성이 쉽다. | `-u` 한 번으로 갱신돼 보호 장치가 약하다. |

A를 채택한다. 원문 고정 범위는 AC-6과 기획서 "법적·정책 요구사항"의 고지로 한정한다. FAQ·가이드·SEO 문구의 글자 단위 고정은 하지 않는다(US-1, 문구 개정 때 여러 테스트가 깨지지 않게). 이 축소는 분류표에 "삭제(사유: 법적 고지 아님, 금지 표현 검사로 대체)"로 적는다.

| 파일 | 고정 대상 상수 |
|---|---|
| `unit/shared/crisis-phone.test.ts` | `CRISIS_PHONES` 5개 각각의 `name`·`number`·`href`와 순서, `CRISIS_RESULT_LINE` |
| `unit/fortune/fortune-notice.test.ts` | `FORTUNE_DISCLAIMER_TEXT`, `FORTUNE_RESULT_DISCLAIMER_TEXT`, `FORTUNE_PRIVACY_INPUT_NOTICE`, `FORTUNE_AGE_INPUT_NOTICE`, `FORTUNE_CONSENT_TEXTS`(`items` 3개, `storageNotice`), `FORTUNE_LOTTO_NOTICE`, `FORTUNE_DETAIL_NOTICE_ITEMS` |
| `unit/tarot/tarot-notice.test.ts` | `TAROT_DISCLAIMER_TEXT`, `TAROT_RESULT_DISCLAIMER_TEXT`, `TAROT_SENSITIVE_INPUT_NOTICE`, `TAROT_QUESTION_USAGE_NOTICE`, `TAROT_EXPERT_NOTICE_TEXT`, `TAROT_DETAIL_NOTICE_ITEMS` |
| `unit/dream/dream-notice.test.ts` | `DREAM_DISCLAIMER_TEXT`, `DREAM_SEARCH_NOTICE`, `DREAM_CRISIS_PANEL_STORAGE_NOTICE`, `DREAM_DETAIL_NOTICE_ITEMS` |
| `unit/lunch/lunch-notice.test.ts` | `LUNCH_DISCLAIMER_TEXT`, `LUNCH_NO_REWARD_NOTICE_TEXT`, `LUNCH_EXTERNAL_LINK_NOTICE_TEXT` |
| e2e `lotto.spec.ts` (번호 생성 test 안) | 로또 생성기 화면의 "당첨을 보장하지 않습니다" 문구. 로또 고지는 `src/app/lotto/**/page.tsx`의 리터럴이라 상수 import가 안 되므로 e2e에서 확인한다(코드 수정 없이). |

리터럴 원문의 출처는 현재 상수 값이다(현재 상수가 승인 원문과 같다는 것은 기존 fortune-copy·tarot-copy test가 통과 중인 상태로 보증된다). 이관 직후 한 번 기존 spec과 같이 돌려 둘 다 통과하는지 확인한 뒤 기존 spec을 지운다.

## 5. e2e 설계

### 5.1 공통 규칙

- test 개수는 `test(` 호출 수로 센다. 반복문으로 test를 만들지 않는다. 여러 페이지를 도는 검사는 test 하나 안에서 `test.step`으로 돈다.
- 화면 문구는 리터럴 대신 `@/` 상수를 import해 비교한다(문구 개정 시 e2e가 깨지지 않게). 원문 고정은 단위 테스트가 맡는다.
- 공용 함수는 `e2e/helpers/common.util.ts`에 둔다: `declineCookies`, `waitForHydration`, `watchPageErrors`, `passLottoAgeGate`, `recordRequests`, `storageSnapshot`. 기능 전용 함수는 각 spec 안에 둔다.
- 파일을 쓰는 e2e(`src/` 아래 더미 조각 생성)는 없앤다.
- AC-3의 줄 수는 `e2e/` 아래 `.ts` 전체(헬퍼 포함)로 센다. 목표 배분: fortune 700, tarot 450, dream 300, lunch 250, swagger-docs 250, lotto 300, helpers 150 (합 2,400).

### 5.2 기능별 남길 e2e (확정 목록)

`@smoke` 표시는 모바일에서도 도는 test다.

**fortune (15)**
1. `@smoke` 허브 → 오늘의 운세: 동의 → 생년월일 입력 → 결과, 면책·상담전화 5개 표시 (AC-66). 모바일에서는 상담전화가 `tel:` 링크인지 project 이름으로 분기해 확인(AC-86)
2. 이용 동의 안 함 → 이용 불가 화면, 다시 설정 버튼
3. 연령 차단: 만 14세 미만 생년월일 → 연령 안내
4. 입력 오류: 빈 값·미래 날짜·지원 범위 밖 → 오류 문구(상수 비교)
5. 윤달 입력: 음력 윤달 선택 → 변환 결과 (AC-85)
6. 개인정보 비저장: 결과 후 localStorage·sessionStorage·쿠키·요청 본문/URL에 생년월일이 없다
7. 띠별 운세: 생년월일로 찾기 → 띠 카드 결과와 안내 문장 (fortune-v2 AC-1, AC-3)
8. 띠 경계일: 입춘·설날 차이 안내, 경계일 시각 질문 → 후보 선택 (fortune-v2 AC-4, AC-6)
9. 별자리 운세: 찾기 → 결과와 안내 문장 (fortune-v2 AC-5)
10. `@smoke` 사주: 동의 → 입력 → 기둥 표·일진 결과
11. 사주: 시각 모름 → 계산 기준 안내, 23시대·경계 후보 선택
12. 사주: 면책·상담전화·로또 고지 표시 (AC-59)
13. 기기 시계 2029-01-02(KST)에서도 결과가 나온다 (AC-84, `page.clock`)
14. JS 끔: 허브·오늘의 운세·사주 서버 HTML에 본문과 noscript 안내, 상담전화 번호
15. SEO: 5.4절

**tarot (9)**
1. `@smoke` 오늘의 타로: 뽑기 → 결과, 면책·상담전화 5개 (모바일 `tel:` 분기)
2. 오늘의 카드 복원과 날짜 경계: 같은 날 재방문은 같은 카드, 한국 시간 자정 뒤에는 새로 뽑기 (`page.clock`)
3. `@smoke` 3장 타로: 뽑기 → 3장 결과와 흐름 이야기
4. 역방향 옵션: 켜면 역방향 결과 표시가 가능하다(저장 값으로 확인)
5. 분야 칩 선택 → 분야 문장 표시·해제 (tarot-v2)
6. 질문 비저장: 질문 입력 후 저장소·요청에 질문이 없다
7. 위기어 입력 → 위기 안내 패널, 상담전화 5개, 전문가 안내
8. JS 끔: 서버 HTML 본문, noscript 안내, 상담전화
9. SEO: 5.4절

**dream (6)**
1. `@smoke` 허브: 검색 → 결과 목록, 빈 결과 상태
2. 상세 열람 → 관련 소재 이동 (AC-41)
3. 위기어 검색 → 위기 안내 패널과 상담전화
4. 메뉴와 홈에서 꿈 해몽 진입
5. 쿠키 거절·광고 차단(광고 스크립트 요청 차단) 상태에서도 검색·상세가 동작
6. SEO: 5.4절

**lunch (5)**
1. `@smoke` 추천 생성 → 결과, 면책 표시
2. 필터 선택 → 빈 상태 안내
3. 지도 링크: 새 탭·외부 링크 안내
4. 메뉴에서 점심 추천 노출·진입
5. SEO: 5.4절

**swagger-docs (8)**
1. `@smoke` `/api-docs`: h1 "API 문서", Swagger UI, 고지 문구, 375px에서 가로 스크롤 없음 (AC-1, AC-11, AC-12)
2. `/openapi.json`: 200 JSON, paths 정확히 일치, 제외 경로 없음, 조각 구조 (AC-2, AC-3, AC-13)
3. draws 파라미터·응답 코드, Try it out `latest=1` 실행 → 200 (AC-4, AC-8)
4. export 명세 `text/csv` + attachment, 실제 응답 CSV (AC-5)
5. hot-cold 200 응답에 ok·data·meta (AC-6)
6. 요청 제한: export 21번째, draws 61번째가 429 (AC-7). desktop에서만 돈다(태그 없음)
7. 기존 API status·Content-Type·Cache-Control (AC-10)
8. `/api-docs/none` 404

swagger-docs는 개발 전용(운영 404)이라 SEO test를 두지 않는다.

**lotto (7)**
1. `@smoke` 번호 생성: 기본 5게임, 게임 수 최대 20, "당첨을 보장하지 않습니다" 고지 표시
2. 고급 옵션을 켜면 조건이 보이고 생성된다
3. 채점 → 전체 저장 → 나의 번호에 나타난다
4. 옛 생성기 URL 2개 → `/lotto/generator`로 이동
5. PC 헤더에 준비 중 배지가 없다
6. 핫/콜드 분석 화면: 범위 조회 결과가 표시된다(값 대조는 단위 테스트로 이관, 화면은 목록 5개 표시만 확인)
7. SEO: 5.4절 (기존 "페이지 열림" 7개를 이 test의 step으로 흡수)

합계: 15 + 9 + 6 + 5 + 8 + 7 = **50개** (AC-2의 전체 60개 이하 충족). 모바일 smoke: fortune 2, tarot 2, dream 1, lunch 1, swagger-docs 1, lotto 1 = **8개**.

### 5.3 모바일 smoke (태그 + grep)

- 태그는 Playwright `tag` 옵션으로 단다: `test('제목', { tag: '@smoke' }, async ({ page }) => { ... })`. 제목 문자열에 태그를 쓰지 않는다.
- 태그는 `@smoke` 하나만 쓴다. 모바일에서만 의미 있는 단언(상담전화 `tel:` 링크 등)은 smoke test 안에서 `testInfo.project.name === 'mobile'`로 분기한다.
- `playwright.config.ts` 변경 (mobile project에만 grep 추가, 나머지 그대로):

```ts
projects: [
  { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
  {
    name: 'mobile',
    use: { ...devices['Pixel 7'], channel: 'chrome' },
    grep: /@smoke/,
  },
],
```

- desktop은 smoke 포함 전체를 돈다. `pnpm e2e:mobile`은 smoke 8개만, `pnpm e2e:all`은 desktop 50 + mobile 8을 돈다.
- 기존의 `test.skip(project !== 'desktop')` 패턴은 grep으로 대체되므로 남기지 않는다(요청 제한 test처럼 desktop 전용은 태그를 달지 않으면 된다).

### 5.4 SEO test (기능당 1개)

`request.get()`으로 서버 HTML을 받아(JS 없이) 페이지마다 `test.step`으로 확인한다.

- 응답 400 미만, noindex 없음
- `<title>` 존재, 사이트 이름이 두 번 붙지 않음
- `meta[name=description]`, `link[rel=canonical]`(경로가 `/`로 시작하는 절대 URL), `og:title`
- `h1` 정확히 1개
- JSON-LD `script[type="application/ld+json"]`가 있고 JSON으로 파싱된다
- 마지막 step: `/sitemap.xml`에 해당 기능 URL이 모두 있다

| 기능 | 대상 URL |
|---|---|
| fortune | `/fortune`, `/fortune/today`, `/fortune/tti`, `/fortune/star-sign`, `/fortune/saju` |
| tarot | `/tarot/daily`, `/tarot/three-card` |
| dream | `/dream`, `/dream/<DREAM_TOPICS[0].slug>` |
| lunch | `/lunch/today` |
| lotto | `/lotto`, `/lotto/generator`, `/lotto/history`, `/lotto/check`, `/lotto/my-numbers`, `/lotto/analysis`, `/lotto/simulator`, `/lotto/<최신 회차>` (JSON-LD·sitemap 대상은 현재 페이지에 있는 것만 확인. 기존에 없던 요소를 새로 요구하지 않는다) |

## 데이터 저장 위치

| 데이터 | 위치 (상수 / sessionStorage / localStorage / IndexedDB / Supabase) | 이유 |
|---|---|---|
| 없음 | - | 테스트 정리 작업이라 새로 저장하는 데이터가 없다. 고지 원문 기대값은 단위 테스트 파일 안의 리터럴이다. |

## API 계약

없음. (기존 API를 바꾸지 않는다. swagger-docs e2e가 기존 계약을 그대로 검사한다.)

## DB 스키마

없음.

## 프론트 구조

- 페이지 (서버/클라이언트 구분): 변경 없음
- 컴포넌트 트리: 변경 없음
- 상태 위치: 변경 없음

## SEO

| URL | title | description | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| 새 페이지 없음 | - | - | - | `MENU_LIST` 변경 없음 |

정리 후에도 기능마다 SEO 서버 HTML test 1개를 남긴다(5.4절, `docs/conventions/seo.md`). swagger-docs는 개발 전용이라 제외한다.

## 보안

- 시크릿: Vitest는 `.env*`를 읽지 않는 대상만 검사한다. 새 환경변수 없음. `NEXT_PUBLIC_` 변경 없음.
- 단위 테스트는 네트워크·Supabase·파일 쓰기를 하지 않는다(4.2절).
- 기존 `swagger-docs.extend`처럼 `src/` 아래에 파일을 쓰는 테스트를 없애 개발 서버 실행 중 명세가 오염되는 위험을 줄인다.
- 개인정보 비저장 검사(운세 생년월일, 타로 질문)는 e2e에 남긴다(fortune 6번, tarot 6번).
- 요청 제한(429) 검사는 desktop에서만 1회 돈다(모바일 grep 제외로 IP 제한 중복 소모 방지).
- 입력 검증·XSS·RLS: 변경 없음.

## 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| vitest | npm `vitest` (vitest-dev/vitest) | MIT | 가능. 개발 전용 의존성이라 배포 번들에 들어가지 않는다 |

- `DEPENDENCY_LICENSES.md` "Dev dependencies" 목록에 `- vitest — MIT` 추가 (알파벳 순, `typescript` 다음).
- `THIRD_PARTY_NOTICES.md` "Dev dependencies (selection)"에 `- Vitest (vitest) — MIT License` 추가.
- 전이 의존성(vite 등)은 두 문서의 기존 방침(직접 의존성만 기재)을 따른다.
- 개인정보 처리 없음. 폰트·이미지·외부 데이터 추가 없음.

## 7. 문서 갱신

- `README.md` "스크립트" 표에 `| \`pnpm test\` | Vitest 단위 테스트 (\`unit/\`) |` 행 추가.
- `README.md` "스크립트" 표 바로 아래에 운영 한 줄 추가: "푸시 전에는 Claude Code에서 `/code-review`를 직접 한 번 실행합니다(훅으로 강제하지 않습니다)."
- `.githooks/pre-commit`은 바꾸지 않는다(이미 e2e 없음, AC-10).

## 담당별 작업 순서

- db: 없음
- backend: 없음 (API·서버 로직 변경 없음)
- frontend: 없음 (화면 변경 없음)

이 작업의 실제 담당은 설정·단위 테스트·e2e다. 현재 `guard-files.js` 범위로는 `unit/`, `vitest.config.ts`, `package.json`, `playwright.config.ts`, `README.md`, `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`를 쓸 수 있는 agent가 없다(qa는 `e2e/`·`docs/`만). 아래 중 하나를 PM이 정한다.

| 안 | 내용 | 장단점 |
|---|---|---|
| **A (추천)** | 사용자 승인 후 `guard-files.js` 범위 확장: qa에 `unit/`, `playwright.config.ts` 추가 / backend-dev에 `vitest.config.ts`, `package.json`, `README.md`, `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md` 추가 | 담당 흐름을 유지한다. 하네스 설정 변경이 필요하다 |
| B | 루트 설정·문서 파일 6개(`vitest.config.ts`, `package.json`, `playwright.config.ts`, `README.md`, `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`)는 PM(메인 세션)이 직접 수정, `unit/`만 범위 확장으로 qa에 추가 | 범위 변경이 작다. PM이 코드성 파일을 직접 고치게 된다 |

작업 순서 (A 기준, 화살표는 의존):

1. **T0 (PM)**: 규칙 문서 갱신 승인과 범위 확장(11.2절). 끝나야 T1 이후 진행.
2. **T1 (qa, docs만)**: 827건 분류표 초안을 `docs/e2e-cleanup/qa-report.md`에 기능별 절로 작성(3장 기준). T2와 동시 가능.
3. **T2 (backend-dev)**: `pnpm add -D vitest`, `vitest.config.ts`, `package.json` 스크립트, `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`, `README.md`. 끝나면 `pnpm test`가 설정 오류 없이 실행되는지 확인(테스트 0건이면 Vitest가 실패 코드를 내므로 `--passWithNoTests`로 1회만 확인).
4. **T3 (qa)**: `unit/helpers/copy-check.util.ts`, `unit/helpers/source-scan.util.ts` 작성. T2 → T3.
5. **T4 (qa, 기능별 병렬 가능)**: 단위 테스트 작성. T1·T3 → T4.
   - T4-a fortune, T4-b tarot, T4-c dream, T4-d lunch, T4-e lotto, T4-f api-docs, T4-g shared
   - 각 기능은 단위 테스트가 통과하고 기존 spec도 통과하는 것을 확인한 뒤에만 해당 `-copy`·`-calc`·`extend` spec을 지운다.
6. **T5 (qa)**: `e2e/helpers/common.util.ts`. T5는 T4와 동시 가능.
7. **T6 (qa, 기능별 병렬 가능)**: e2e 통합. T5 → T6, 그리고 같은 기능의 T4 → T6(삭제 순서 보장).
   - T6-a fortune(6개 파일 → 1개), T6-b tarot, T6-c dream, T6-d lunch, T6-e swagger-docs, T6-f lotto(2개 → `lotto.spec.ts`)
8. **T7 (qa)**: `playwright.config.ts` mobile `grep`. T6 전부 → T7.
9. **T8 (qa → PM)**: `pnpm test`, `pnpm e2e`, `pnpm e2e:mobile`, 줄 수·test 수 집계, 분류표 확정. 이후 PM이 `pnpm typecheck`, `pnpm lint` 1회.

## 파일 충돌 위험

- `package.json`, `pnpm-lock.yaml`: T2만 수정. 다른 작업이 패키지를 추가하지 않는다.
- `unit/helpers/copy-check.util.ts`, `source-scan.util.ts`: T4 병렬 작업이 모두 import한다. T3에서 확정하고, T4 중 바꿀 일이 생기면 한 담당이 순서대로 고친다.
- `e2e/helpers/common.util.ts`: T6 병렬 작업이 모두 import한다. T5에서 확정, 이후 변경은 순서대로.
- `e2e/fortune.spec.ts`: 원본 6개를 한 파일로 합치므로 T6-a는 나눠서 병렬로 하지 않는다. `unit/fortune/*`(T4-a)는 파일별로 나눌 수는 있으나 `fortune-copy.test.ts`와 `fortune-notice.test.ts`는 같은 원본(fortune-copy.spec)에서 나오므로 한 담당이 맡는다.
- `e2e/tarot.spec.ts`: tarot-v2를 흡수하므로 T6-b 한 담당.
- `docs/e2e-cleanup/qa-report.md`: 여러 작업이 분류 결과를 쓴다. 기능별 절을 나누고 동시에 편집하지 않는다(한 담당이 모아 쓰거나 순서대로).
- `playwright.config.ts`: T7만 수정. T6 중 test가 태그를 달아도 config는 건드리지 않는다.
- `README.md`, `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`: T2만 수정.
- `src/`: 이 작업에서 수정하지 않는다. 수정이 필요해 보이면 PM에게 올린다.

## 11. PM 확인·승인 필요 항목

### 11.1 plan.md 수정이 필요한 항목 (설계자는 plan.md를 고치지 않음)

1. **AC-2 기능별 범위와 fortune 상한 불일치**: AC-2는 "기능당 5~10개"인데 결정 6으로 fortune은 15개까지 허용했다. 또 fortune 15 + 나머지 5개 기능 최대 10개씩이면 65개로 "전체 60개 이하"를 넘을 수 있다. 이 설계는 총 50개라 60개 안에 들지만, AC 문구를 "fortune 15개 이하, 나머지 기능 5~10개, 전체 60개 이하"로 고치고 상한이 서로 맞도록 정해야 한다. 정리안 표 아래 문장("흐름이 많은 fortune은 상한을 넘을 수 있어 열린 질문으로 둔다")도 확정 문장으로 바꿔야 한다.
2. **AC-2 test 개수 세는 기준**: `test(` 호출 수 기준(반복문 생성 금지, `test.step`은 세지 않음), desktop 기준인지 명시가 필요하다.
3. **AC-3 줄 수 범위**: 헬퍼 파일(`e2e/helpers/`) 포함 여부가 없다. 설계는 포함해서 센다.
4. **AC-1 파일 수**: `e2e/helpers/common.util.ts`는 spec이 아니므로 "spec 파일 6개"에 들지 않는다는 문장 추가 권장.
5. **"예외·빈 상태"의 열린 질문 4번 참조**: 결정 2(원문 고정 유지)로 닫혔다. "법적 고지 원문은 문구 개정 때 단위 테스트가 실패하는 것이 의도된 동작이며, 상수와 테스트를 함께 고친다"로 바꿔야 한다. 원문 고정 범위를 법적 고지로 한정하고 FAQ·가이드·SEO 원문 고정을 뺀 것(4.3절)도 기획에 반영이 필요하다.
6. **lunch 남길 흐름**: 정리안 표에는 "추천 생성→결과, 메뉴 노출" 2개뿐이라 AC-2의 최소 5개를 못 채운다. 설계는 기존 test 중 필터·빈 상태, 지도 링크, SEO를 남겨 5개로 했다. 표에 반영이 필요하다.
7. **SEO test 추가 표기**: 정리안 표의 dream·lunch·lotto·tarot 행에 SEO test가 없다. "검색 노출" 절의 "기능마다 1개" 규칙에 따라 설계에 넣었다. 로또는 기존 "페이지 열림"을 SEO test로 흡수한다. 표에 반영 권장.
8. **열린 질문 6(`e2e:all` 포함 여부), 8(2,500줄 확인)**: 답이 없다. 설계는 AC-7 = desktop(`pnpm e2e`), AC-8 = mobile smoke(`pnpm e2e:mobile`)로 보고, 줄 수 2,500 이하(예상 2,400)로 잡았다. 확정 필요.
9. **AC-5 대상 명시**: "사주"에 기둥·일진·점수, "로또 집계"에 생성 조건이 포함된다는 것과 명세 합치기 규칙(swagger-docs)도 단위 대상이라는 것을 AC에 적으면 QA 판정이 명확해진다.
10. **열린 질문 목록 정리**: 1, 2, 3, 4, 5, 7, 9번은 사용자 답으로 닫혔다. plan.md에서 확정 문장으로 바꿔야 한다.

### 11.2 규칙 문서·하네스 변경 (사용자 승인 필요)

- `docs/conventions/tech-stack.md`: 테스트 항목에 "단위 테스트: Vitest (`unit/`)", 명령어에 `pnpm test` 추가.
- `docs/conventions/code-style.md`: 폴더 구조의 "기능에 속하지 않는 것"에 `단위 테스트(unit/)` 추가, 네이밍 접미사에 `.test.ts`(단위)·`.spec.ts`(e2e) 추가.
- `CLAUDE.md` "규칙 문서" 표의 내용 설명은 바뀌지 않으므로 수정 불필요. 다만 흐름 6단계(QA)에 "단위 테스트 `pnpm test`"를 넣을지 PM이 정한다(기획 범위 밖이라 설계에는 넣지 않음).
- `.claude/hooks/guard-files.js` 범위 확장(담당별 작업 순서의 안 A 또는 B).

### 11.3 대안 선택 요청 요약

| 항목 | 추천 | 대안 |
|---|---|---|
| 단위 테스트 위치 | A: 루트 `unit/` | B: `src/features/<기능>/tests/` |
| 고지 원문 고정 방식 | A: 테스트 안 리터럴 `toBe` (채택, 결정 2에 따라 설계자가 결정) | B: docs 포함 검사, C: 스냅샷 |
| 파일 쓰기 권한 | A: guard-files 범위 확장 | B: 루트 설정·문서 파일은 PM 직접 수정 |
