# e2e-cleanup 개발 티켓

입력: `docs/e2e-cleanup/design.md` (T0~T8 작업 순서, 파일 겹침 절 기준), `docs/e2e-cleanup/plan.md` (최신 수정본, AC-1~AC-14 기준), `docs/e2e-cleanup/status.md` (확정 결정 1~9). `docs/e2e-cleanup/ui-ux-design.md`는 없다. 화면이 없어 UI 디자인 단계를 생략했고 사용자가 승인했다.

이 작업은 테스트 코드와 설정 정리다. 앱 코드(`src/`)와 화면·문구는 바꾸지 않는다. 설계서 11.1절의 plan 수정 요청은 plan.md 최신본에 반영된 것으로 보고, 이 문서는 plan.md 기준으로 작성했다.

## 0. 권한 확인 결과 (`.claude/hooks/guard-files.js` 기준)

결론: 설계서의 agent 담당 배정 중 일부는 실행할 수 없다. 아래 항목은 PM(메인 세션)이 직접 수정한다.

| 경로 | qa | backend-dev | frontend-dev | 판정 |
|---|---|---|---|---|
| `unit/**/*.test.ts`, `unit/helpers/*.util.ts` | 쓰기 불가 (허용: `e2e/`, `docs/`) | 쓰기 불가 | 쓰기 불가 | **못 씀. 모든 단위 테스트는 PM이 직접 쓴다** |
| `vitest.config.ts` | 불가 | 불가 (허용 목록에 없음) | 불가 | PM |
| `package.json`, `pnpm-lock.yaml` | 불가 | 불가 | 불가 | PM |
| `playwright.config.ts` | 불가 | 불가 | 불가 | PM |
| `README.md`, `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md` | 불가 | 불가 | 불가 | PM |
| `e2e/**` (helpers 포함) | 가능 | 불가 | 불가 | qa |
| `docs/e2e-cleanup/qa-report.md` | 가능 | 가능 | 가능 | qa |
| `src/**` | 불가 | `src/lib/`, `src/app/api/` 등만 가능 | `src/app/` 등만 가능 | 이 작업에서 수정하지 않는다 (T4-x 결정 참조) |
| `.githooks/pre-commit` | 불가 | 불가 | 불가 | PM, 이 작업에서 수정하지 않는다 (AC-10 확인만) |
| `docs/conventions/*` | 불가 (규칙 문서 차단) | 불가 | 불가 | PM (T0, 이미 반영됨) |

메인 세션(PM)은 `agent_type`이 없어 guard-files 범위 검사를 받지 않는다. 그래서 `unit/`과 루트 설정·문서를 PM이 쓸 수 있다.

설계서 안 A(`guard-files.js`에 `unit/`을 qa 범위로 추가)는 하네스 설정 변경이라 사용자 승인이 필요하다. 승인 전까지 이 문서는 설계서 안 B(PM 직접 수정)로 작성했다. 안 B를 쓰면 PM 담당 티켓이 많아진다(아래 표의 PM 티켓 참조). 작업량이 부담되면 안 A 승인을 받는다.

## 1. 담당 구분 요약

- agent 담당 (qa): T1, T5, T6-a~T6-f, T8-b
- PM 담당: T0, T2-a, T2-b, T3, T4-s, T4-a~T4-f, T4-x, T7, T8-a, T8-c
- 설계서 원안과 달라진 점: T2(backend-dev → PM), T3·T4(qa → PM), T7(qa → PM)

## 티켓

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| T0 | PM | 규칙 문서 반영 확인 (tech-stack 테스트 항목, code-style 폴더·네이밍) | - | `docs/conventions/tech-stack.md`, `docs/conventions/code-style.md` | 없음 | 두 문서에 Vitest(`unit/`)와 `unit/<기능>/*.test.ts` 항목이 있다. 네이밍 접미사 행은 T8-c 전에 다시 확인 | 완료 (네이밍 행 확인 남음) |
| T1 | qa | 원본 spec 17개의 test 분류표 초안을 기능별 절로 작성 | T0 | 읽기: `e2e/*.spec.ts` 17개. 쓰기: `docs/e2e-cleanup/qa-report.md`(신규) | 없음 | 모든 test 제목이 "남김 / 단위 이관 / 삭제(사유)" 중 하나로 분류됨. 미분류 0건. 단위 이관 행에는 옮길 파일 경로를 적음 (AC-4) | 대기 |
| T2-a | PM | vitest 설치, scripts 추가, vitest.config.ts 작성 | T0 | `package.json`, `pnpm-lock.yaml`, `vitest.config.ts`(신규), `pnpm-workspace.yaml`(빌드 승인이 필요할 때만) | 없음 | `pnpm exec vitest run --passWithNoTests` 종료 코드 0. `pnpm typecheck` 통과. 설치 중 빌드 승인 요청 여부를 기록 | 대기 |
| T2-b | PM | 라이선스 문서 2개와 README 갱신 | T2-a | `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`, `README.md` | 없음 | 두 문서에 vitest(MIT) 항목이 알파벳 순으로 있다. README 스크립트 표에 `pnpm test` 행이 있다. README에 푸시 전 `/code-review` 수동 실행 한 줄이 있고 훅으로 강제하지 않는다고 적혀 있다 (AC-11, AC-12). 기존 행은 바꾸지 않는다 | 대기 |
| T3 | PM | 단위 테스트 공용 헬퍼 작성 | T2-a | `unit/helpers/copy-check.util.ts`(신규), `unit/helpers/source-scan.util.ts`(신규) | 없음 | copy-check: 문자열 펼치기, 금지 표현 탐색(허용 문장 제외), 합니다체 판정, 문장 나누기. source-scan: `src/`·`public/`만 읽고, `*-copy-rule.constant.ts`와 `src/features/tarot/tarot-dev-guide.md`를 제외한다. `docs/`를 읽지 않고 네트워크·파일 쓰기를 하지 않는다. `pnpm typecheck`, `pnpm lint` 통과 | 대기 |
| T4-s | PM | shared 단위 테스트 | T1, T3 | `unit/shared/crisis-phone.test.ts`(신규), `unit/shared/crisis-signal.test.ts`(신규). 읽기: `src/constants/crisis-phone.constant.ts`, `src/constants/crisis-term.constant.ts`, `src/lib/crisis-signal.ts`, 원본 `e2e/dream-copy.spec.ts`(위기어 test) | 없음 | `pnpm test`에서 두 파일 통과. 상담전화 5개의 name·number·href·순서와 `CRISIS_RESULT_LINE` 원문을 리터럴로 고정 (AC-6). 위기어 정규화·판정 통과 | 대기 |
| T4-a | PM | fortune 단위 테스트 6개 | T1, T3 | `unit/fortune/`: `fortune-calendar`, `fortune-date`, `fortune-saju`, `fortune-reading`, `fortune-copy`, `fortune-notice` (모두 신규). 읽기: 원본 `e2e/fortune-calc.spec.ts`(2,842줄), `e2e/fortune-copy.spec.ts`(2,829줄), `e2e/fortune-saju.spec.ts`(1,688줄), `e2e/fortune-v2.spec.ts`(723줄). 원본은 T6-a 전까지 지우지 않는다 | 없음 | 6개 파일 통과 (AC-5 a·b, AC-6). 계산 test 제목의 AC 번호 유지. 해당 원본 test와 같은 기대값인지 확인 | 대기 |
| T4-b | PM | tarot 단위 테스트 5개 | T1, T3 | `unit/tarot/`: `tarot-cards`, `tarot-copy`, `tarot-story`, `tarot-trademark`, `tarot-notice` (모두 신규). 읽기: 원본 `e2e/tarot-copy.spec.ts`(1,369줄), `e2e/tarot-v2.spec.ts`(1,140줄) | 없음 | 5개 파일 통과. 카드 78장 데이터(AC-5 f), 상표 명칭은 상수와 `src/`·`public/` 소스 스캔 (AC-5 e), 고지 원문 글자 단위 (AC-6) | 대기 |
| T4-c | PM | dream 단위 테스트 3개 | T1, T3 | `unit/dream/`: `dream-topics`, `dream-copy`, `dream-notice` (모두 신규). 읽기: 원본 `e2e/dream-copy.spec.ts`(412줄) | 없음 | 3개 파일 통과. 소재 120개, slug·별칭 중복 없음 (AC-5 f). 문장 수·길이, 금지·과장·로또 표현. 고지 원문 (AC-6) | 대기 |
| T4-d | PM | lunch 단위 테스트 3개 | T1, T3 | `unit/lunch/`: `lunch-menu`, `lunch-copy`, `lunch-notice` (모두 신규). 읽기: 원본 `e2e/lunch-copy.spec.ts`(275줄) | 없음 | 3개 파일 통과. 메뉴 개수·중복·카테고리 (AC-5 f). 문구 규칙. 고지 원문 (AC-6) | 대기 |
| T4-e | PM | lotto 단위 테스트 2개 | T1, T3 | `unit/lotto/lotto-hot-cold.test.ts`, `unit/lotto/lotto-generator.test.ts` (신규). 읽기: `src/features/lotto/utils/hot-cold.util.ts`, `src/features/lotto/utils/lotto.util.ts`, 원본 `e2e/lotto.flow.spec.ts`(151줄), `e2e/lotto.smoke.spec.ts`(103줄) | 없음 | 두 파일 통과 (AC-5 c). 생성은 1,000회 반복으로 6개·1~45·중복 없음·오름차순 확인, 최대 20게임 제외 조건 포함. 핫/콜드는 테스트 안 고정 회차 표본으로 빈도·지연·최근 빈도·합 = 6 × 회차 수 확인. 비공개 함수(예: `uniqueSortedSix`)는 공개 함수로만 검사하고, 안 되면 PM에게 올린다 (export 추가 금지) | 대기 |
| T4-f | PM | api-docs 단위 테스트 1개 | T1, T3 | `unit/api-docs/merge-openapi.test.ts`(신규). 읽기: `src/features/api-docs/utils/merge-openapi.util.ts`, `src/features/api-docs/specs/lotto.openapi.json`, 원본 `e2e/swagger-docs.extend.spec.ts`(79줄) | 없음 | 3개 케이스 통과 (AC-5 d): 정상 조각이면 경로가 합쳐짐, `responses` 누락이면 예외 메시지에 `responses` 포함, 기존 lotto 조각과 경로가 겹치면 예외. 테스트가 `src/`에 파일을 쓰지 않음 | 대기 |
| T4-x | PM | 로또 "당첨을 보장하지 않습니다" 원문 고정 (AC-6) | T1, T3 | 원문 출처 미정. 현재 `src/app/lotto/generator/page.tsx` 19행의 모듈 상수 리터럴이 생성기 화면 문구이고, 다른 로또 페이지도 같은 취지의 문구를 리터럴로 가진다. 상수 파일은 없다 | 없음 | **보류. 아래 "충돌 위험" 1번의 결정이 필요하다.** 결정 후 이 행을 확정한다 | 보류 (PM 결정) |
| T5 | qa | 공용 e2e 헬퍼 작성 | T0 | 쓰기: `e2e/helpers/common.util.ts`(신규). 읽기: `e2e/tarot.spec.ts` 60–69(declineCookies), 70–94(waitForHydration), 209–219(recordRequests), 226–237(watchErrors), 238 이후(storageSnapshot). 성인 확인 통과 함수는 `e2e/lotto.flow.spec.ts`, `e2e/lotto.smoke.spec.ts`에서 grep으로 찾는다 | 없음 | 6개 함수 export: `declineCookies`, `waitForHydration`, `watchPageErrors`, `passLottoAgeGate`, `recordRequests`, `storageSnapshot`. 이 파일을 spec으로 잘못 잡지 않는다(파일 이름 `.util.ts`). 줄 수 150 이하 목표 | 대기 |
| T6-a | qa | fortune e2e 통합 | T1, T4-a, T5 | 쓰기: `e2e/fortune.spec.ts`(덮어쓰기, 700줄 이하 목표). 삭제: `e2e/fortune-calc.spec.ts`, `e2e/fortune-copy.spec.ts`, `e2e/fortune-saju.spec.ts`, `e2e/fortune-saju.launch.spec.ts`, `e2e/fortune-v2.spec.ts`. 읽기: 원본 전체 (design 5.2절 15개 목록 기준) | 없음 (화면 명세 없음, 문구는 상수 비교) | test 15개 이하, `@smoke` 2개(허브→오늘의 운세, 사주 입력→결과). 상담전화 5개 표시와 모바일 `tel:` 분기 (AC-14). 개인정보 비저장 1개 (AC-14). SEO 1개 (AC-13, 5.4절). desktop 전체 통과 | 대기 |
| T6-b | qa | tarot e2e 통합 | T1, T4-b, T5 | 쓰기: `e2e/tarot.spec.ts`(덮어쓰기, 450줄 이하 목표). 삭제: `e2e/tarot-v2.spec.ts`, `e2e/tarot-copy.spec.ts`. 읽기: `e2e/tarot.spec.ts`(2,307줄), 원본 2개 | 없음 | test 10개 이하(목표 9), `@smoke` 2개(오늘의 타로, 3장 타로). 질문 비저장 1개 (AC-14). SEO 1개 (AC-13). desktop 전체 통과 | 대기 |
| T6-c | qa | dream e2e 통합 | T1, T4-c, T5 | 쓰기: `e2e/dream.spec.ts`(덮어쓰기, 300줄 이하 목표). 삭제: `e2e/dream-copy.spec.ts`. 읽기: `e2e/dream.spec.ts`(1,202줄) | 없음 | test 10개 이하(목표 6), `@smoke` 1개(허브 검색). 광고 차단 상태 동작 1개 (AC-14). SEO 1개 (AC-13). desktop 전체 통과 | 대기 |
| T6-d | qa | lunch e2e 통합 | T1, T4-d, T5 | 쓰기: `e2e/lunch.spec.ts`(덮어쓰기, 250줄 이하 목표). 삭제: `e2e/lunch-copy.spec.ts`. 읽기: `e2e/lunch.spec.ts`(837줄) | 없음 | test 10개 이하(목표 5), `@smoke` 1개(추천 생성→결과). SEO 1개 (AC-13). desktop 전체 통과 | 대기 |
| T6-e | qa | swagger-docs e2e 정리 | T1, T4-f, T5 | 쓰기: `e2e/swagger-docs.spec.ts`(정리, 250줄 이하 목표). 삭제: `e2e/swagger-docs.extend.spec.ts`. 읽기: `e2e/swagger-docs.spec.ts`(223줄). SEO 없음(개발 전용) | 없음 | test 10개 이하(목표 8), `@smoke` 1개(`/api-docs`). 파일을 `src/` 아래에 쓰는 test가 없다. 요청 제한(429) test는 태그 없이 desktop에서만 돈다. desktop 전체 통과 | 대기 |
| T6-f | qa | lotto e2e 통합 | T1, T4-e, T5 | 쓰기: `e2e/lotto.spec.ts`(신규, 300줄 이하 목표). 삭제: `e2e/lotto.flow.spec.ts`, `e2e/lotto.smoke.spec.ts`. 읽기: 두 원본 | 없음 | test 10개 이하(목표 7), `@smoke` 1개(번호 생성). 생성기 화면에 "당첨을 보장하지 않습니다" 문구가 있음 (AC-6, 화면 확인). SEO 1개 (5.4절, AC-13). desktop 전체 통과 | 대기 |
| T7 | PM | mobile project에 `@smoke` grep 추가 | T6-a, T6-b, T6-c, T6-d, T6-e, T6-f | `playwright.config.ts` | 없음 | mobile project에 `grep: /@smoke/`만 추가, desktop 설정은 그대로. `pnpm exec playwright test --project=mobile --list` 결과가 smoke 8개 | 대기 |
| T8-a | PM | 단위 테스트 최종 실행 | T2-b, T4-s, T4-a~T4-f, T4-x | 실행만. 파일 수정 없음 | 없음 | `pnpm test` 통과. AC-5 대상 (a)~(f)가 모두 실행되는지 테스트 제목으로 확인 | 대기 |
| T8-b | qa | e2e 최종 실행과 집계 | T7, T8-a 아님(T7 후) | 실행: `pnpm e2e`, `pnpm e2e:mobile`. 쓰기: `docs/e2e-cleanup/qa-report.md` | 없음 | `pnpm e2e` 통과 (AC-7). `pnpm e2e:mobile` 통과, smoke만 8개 (AC-8). spec 6개 (AC-1). desktop test 50개 안팎, 전체 60개 이하 (AC-2). `e2e/` 전체 줄 2,500 이하 (AC-3). 분류표 미분류 0건 (AC-4). AC별 판정표 작성 | 대기 |
| T8-c | PM | 최종 검증과 금지 사항 확인 | T8-a, T8-b | 읽기: `.githooks/pre-commit`, `e2e/` 목록, 라이선스·README 두 문서. 실행: `pnpm typecheck`, `pnpm lint` | 없음 | `pnpm typecheck`, `pnpm lint` 통과 (AC-9). `.githooks/pre-commit`에 e2e·단위 테스트 명령이 없다 (AC-10). `e2e/`에 `*-copy`, `*-calc`, `*.extend`, `lotto.flow`, `lotto.smoke` 파일이 없다. 신규 도구 문서 갱신 확인 (AC-11). 실패 시 담당에게 되돌린다 | 대기 |

## 티켓 상세 (입력, 범위, 완료 기준, 규칙 문서)

공통 규칙 문서: qa 티켓은 `docs/conventions/tech-stack.md`, `docs/conventions/code-style.md`, `.claude/agents/qa.md`(셀렉터·대기 규칙)를 읽는다. T6 SEO 부분은 `docs/conventions/seo.md`도 읽는다. PM 티켓은 `docs/conventions/tech-stack.md`, `docs/conventions/code-style.md`(단위 테스트 폴더·네이밍)를 읽는다. 디자인 명세는 모든 티켓에서 해당 없음이다.

### T0 (PM)
- 입력: `docs/conventions/tech-stack.md` 17행, `docs/conventions/code-style.md` 53행 부근.
- 범위: 반영 내용 확인만 한다. 문서를 새로 고치지 않는다.
- 완료 기준: 위 표의 완료 조건.

### T1 (qa)
- 입력: `docs/e2e-cleanup/design.md` 3장(149–188행), 3.1절 표. 원본 `e2e/*.spec.ts` 17개.
- 범위: 원본 17개의 실제 `test(` 제목 전부를 판정한다. 설계서 827건은 대략치이고 plan은 805건과 766건(사용자 집계)을 말한다. 실제 수는 qa가 다시 센다. 분류 순서는 설계서 3장 1–6번을 따른다.
- 완료 기준: 표 기준 충족. 기능별 절로 나누고 기능 6개 절과 공통 절을 둔다.
- 쓰기 충돌: `qa-report.md`는 T1이 먼저 만든다. 이후 T6과 T8이 같은 파일을 쓰므로 순서대로 한다.

### T2-a (PM)
- 입력: `docs/e2e-cleanup/design.md` 2장(99–147행), 2.2절 scripts 표.
- 범위: `pnpm add -D vitest`(pnpm만 쓴다. npm·yarn·npx는 훅이 막는다). `vitest.config.ts`는 design 2.1절 코드를 따른다. `package.json` scripts에 `test`(`vitest run`)와 `test:watch`(`vitest`)만 추가한다. 기존 scripts는 바꾸지 않는다.
- 완료 기준: 위 표. 테스트 파일이 없는 동안은 `--passWithNoTests`로만 확인한다.

### T2-b (PM)
- 입력: `docs/e2e-cleanup/design.md` 1장, 7장, 보안·상업적 이용 절. `DEPENDENCY_LICENSES.md`의 "Dev dependencies" 목록, `THIRD_PARTY_NOTICES.md`의 "Dev dependencies (selection)".
- 범위: 설계서 문구를 따른다. vitest는 MIT, 직접 의존성만 적는다.
- 완료 기준: 위 표.

### T3 (PM)
- 입력: `docs/e2e-cleanup/design.md` 4.2절(227–232행). 기존 `e2e/dream-copy.spec.ts`와 `e2e/tarot-copy.spec.ts`의 금지 표현 검사 코드(같은 로직을 옮긴다).
- 범위: 헬퍼는 `.util.ts`에만 둔다. test 파일에 export를 두지 않는다(Biome `noExportsInTest`).
- 완료 기준: 위 표.

### T4-s, T4-a ~ T4-f (PM)
- 입력: 각 행의 원본 spec과 대상 상수·유틸. 대상 파일 목록은 `docs/e2e-cleanup/design.md` 4.1절(192–223행).
- 범위: 계산 test는 1대1로 옮기고 제목(AC 번호)을 유지한다. 문구 test는 자동 실패 단언만 옮긴다. 고지 원문은 4.3절 방식 A(리터럴 `toBe`)를 쓴다. 네트워크·Supabase·파일 쓰기 금지.
- 완료 기준: 각 파일 통과. 같은 기능의 원본 spec을 돌려 기대값이 같은지 확인한 뒤에만 T6이 원본을 지운다.
- 참고: 로또 생성 test는 무작위이므로 형식과 개수로 검사한다.

### T4-x (PM, 보류)
- 입력: `src/app/lotto/generator/page.tsx` 19행, 83행, 그리고 `src/app/lotto/analysis/page.tsx`, `src/app/lotto/simulator/page.tsx`, `src/app/lotto/my-numbers/page.tsx`의 같은 문구.
- 문제: plan.md AC-6은 "로또 당첨 보장 없음 문구"를 단위 테스트로 글자 단위 고정하라고 한다. 하지만 design 4.3절은 이 문구를 e2e에서만 확인한다고 적었다. 두 문서가 맞지 않는다. 원문이 상수로 export되어 있지 않아 단위 테스트가 가져올 대상이 없다.
- 선택지:
  - (a) 사용자 승인 후 frontend-dev가 `src/features/lotto/constants/`에 상수를 추가하고 생성기 화면이 그 상수를 쓰게 한다. 화면 문구는 그대로다. 설계서의 "src 수정 금지"를 풀어야 한다.
  - (b) 단위 테스트에 리터럴을 두고 `src/app/lotto/generator/page.tsx` 소스를 읽어 포함 여부를 확인한다. source scan을 넓히는 것이라 plan 결정 3과 충돌한다. 사용자 승인이 필요하다.
  - (c) 단위 고정 대상에서 빼고 e2e만 둔다. plan AC-6을 고쳐야 하므로 사용자 확인이 필요하다.
- 권장: (a). 확정 전까지 T6-f의 e2e 화면 확인(생성기 화면 문구)은 진행할 수 있다.

### T5 (qa)
- 입력: 위 표의 줄 범위. 설계서 5.1절의 공용 함수 목록(261행).
- 범위: 공용 함수만 옮긴다. 기능 전용 함수는 각 spec에 남긴다. 옮긴 뒤에도 원본 spec은 그대로 두고, T6이 원본을 지울 때 함께 정리한다.
- 완료 기준: 위 표.

### T6-a ~ T6-f (qa)
- 입력: 각 원본 spec(위 표). 남길 test 목록은 설계서 5.2절(269–331행). 공통 SEO는 5.4절. 개인정보 비저장은 설계서 보안 절(407행).
- 범위: 같은 흐름을 입력만 바꿔 반복한 test는 대표 1개만 둔다. 화면 문구는 `@/` 상수를 import해서 비교하고 리터럴을 쓰지 않는다. 무작위 결과는 형식과 개수만 본다. 고정 대기(`waitForTimeout`)를 쓰지 않는다.
- 태그: 모바일에서 돌릴 test에만 `{ tag: '@smoke' }`를 단다. 제목 문자열에 태그를 쓰지 않는다.
- 실행: 한 번에 한 기능씩 실행한다. `playwright.config.ts`의 `workers: 3`, `fullyParallel: true`, `reuseExistingServer: true` 때문에 여러 기능을 동시에 돌리면 서버 부하가 생기고, swagger 요청 제한(429) 검사가 다른 실행과 섞일 수 있다.
- 완료 기준: 위 표. 실행 명령은 `pnpm exec playwright test e2e/<기능>.spec.ts --project=desktop`.

### T7 (PM)
- 입력: 설계서 5.3절(335–353행)의 config 예시.
- 범위: mobile project에 `grep: /@smoke/` 한 줄만 추가한다. desktop은 바꾸지 않는다. 기존 `test.skip(project !== 'desktop')` 패턴은 설계서대로 남기지 않는다. 단, 이 패턴이 남아 있는지는 T6 결과에서 확인한다.
- 완료 기준: 위 표.

### T8-a (PM)
- 범위: 실행과 확인만 한다. `pnpm test`를 돌리고 AC-5 대상 (a)~(f)가 테스트 제목으로 확인되는지 본다.

### T8-b (qa)
- 입력: `docs/e2e-cleanup/qa-report.md`(T1·T6 결과), plan AC-1~AC-8.
- 범위: `pnpm e2e`, `pnpm e2e:mobile`을 실행한다. 줄 수는 `e2e/` 아래 `.ts` 전체(헬퍼 포함)로 센다. test 수는 `test(` 호출 수로 센다. `test.step`은 세지 않는다.
- 완료 기준: 위 표. 실패는 원인을 나눠 해당 담당에게 되돌린다(테스트 문제면 qa, 앱 문제면 보고만).

### T8-c (PM)
- 범위: `pnpm typecheck`, `pnpm lint`를 한 번씩 실행한다. 실패하면 해당 담당에게 되돌린다. 금지 사항(AC-10)과 문서 갱신(AC-11, AC-12)을 확인한다. 이 작업에서 `src/`, `supabase/`는 바뀌지 않아야 한다. `git status`로 확인한다.

## 실행 순서

1. T0 (PM, 완료). 규칙 문서 반영 확인.
2. 동시 실행 묶음 A: T1 (qa), T5 (qa), T2-a (PM). 파일이 겹치지 않는다.
3. T2-a 다음 묶음 B (PM, 순서대로): T2-b, T3. T3가 끝나면 T4-s를 시작한다. T4-s, T4-a ~ T4-f는 T1과 T3가 끝나야 한다.
4. T4 기능별 완료 순서: T4-s → T4-a → T4-b → T4-c → T4-d → T4-e → T4-f. T4-x는 PM 결정이 나면 진행한다.
5. 기능별 T6 작성: 같은 기능의 T4와 T5가 끝나면 시작한다. T6-a ~ T6-f는 파일상 동시 작성이 가능하지만 실행은 한 기능씩 한다. qa-report 쓰기는 순서대로 한다.
6. T7 (PM). T6 전부 끝난 뒤 mobile grep을 넣는다.
7. 동시 실행 묶음 C: T8-a (PM, pnpm test), T8-b (qa, pnpm e2e와 pnpm e2e:mobile). 파일이 겹치지 않는다.
8. T8-c (PM). typecheck, lint, 금지 사항과 문서 확인.

## 동시 실행 가능

- 묶음 A: T1(`docs/e2e-cleanup/qa-report.md`), T5(`e2e/helpers/common.util.ts`), T2-a(`package.json`, `pnpm-lock.yaml`, `vitest.config.ts`). 파일이 겹치지 않으므로 동시에 돌려도 된다.
- 묶음 B: T2-b와 T3는 파일이 겹치지 않는다. 담당이 PM 한 명이라 순서대로 한다.
- 묶음 C: T4-s, T4-a ~ T4-f는 파일이 겹치지 않는다. 담당이 PM 한 명이라 현재는 순서대로 한다. PM이 작업자를 나누면 동시에 할 수 있다.
- 묶음 D: T6-a ~ T6-f는 파일 쓰기가 겹치지 않는다. 단 qa-report 쓰기와 Playwright 실행은 순서대로 한다.
- 묶음 E: T8-a(PM, Vitest), T8-b(qa, Playwright)는 파일이 겹치지 않는다.
- 동시 실행 금지: T2-a 전에 T3·T4 실행, T6 전에 원본 spec 삭제, T7과 T6 병행(config 변경이 실행 결과를 바꾼다), T8-c 전에 T8-a·T8-b 완료 확인.

## 충돌 위험

1. **로또 원문 고정 (T4-x, 결정 필요)**: plan AC-6과 design 4.3절이 맞지 않는다. 결정 (a), (b), (c) 중 하나를 사용자에게 받는다. 결정 전까지 T4-x는 보류 상태다. 결정 (a)면 `src/` 수정이 생기므로 frontend-dev 범위가 되고 design의 "src 수정 없음"이 바뀐다.
2. **PM 작업량 (권한)**: `unit/`과 루트 설정·문서가 모두 PM 담당이다. 단위 테스트 약 20개 파일이 PM 한 명에게 몰린다. 부담이 크면 `guard-files.js` 범위 확장(안 A)을 사용자에게 승인받는다.
3. **`unit/helpers/*.util.ts`**: T3에서 만들고 T4 전체가 import한다. T3 이후 바꾸면 모든 T4 파일을 다시 확인한다.
4. **`e2e/helpers/common.util.ts`**: T5에서 만들고 T6 전체가 import한다. T6 중 바꾸지 않는다. 바꿔야 하면 T5로 되돌려 한 담당이 고친다.
5. **`e2e/fortune.spec.ts`**: 원본 6개(fortune 등)를 한 파일로 합치므로 T6-a를 나눠 병렬로 쓰지 않는다. 원본을 덮어쓰기 전에 T1이 원본을 읽었는지 확인한다.
6. **`e2e/tarot.spec.ts`**: tarot-v2를 흡수하므로 T6-b는 한 담당이 맡는다. 같은 이유로 `e2e/fortune-v2.spec.ts`의 흐름은 T6-a에 흡수한다.
7. **`docs/e2e-cleanup/qa-report.md`**: T1, T6-a~f, T8-b가 쓴다. 기능별 절을 나누고 동시에 편집하지 않는다.
8. **`playwright.config.ts`**: T7(PM)만 수정한다. T6이 태그를 달아도 config는 건드리지 않는다.
9. **`package.json`, `pnpm-lock.yaml`**: T2-a만 수정한다. 다른 작업이 패키지를 추가하지 않는다. `pnpm install` 중 빌드 승인 요청이 뜨면 `pnpm-workspace.yaml`의 `allowBuilds` 변경이 생길 수 있다. T2-a가 기록한다.
10. **`README.md`, `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`**: T2-b만 수정한다.
11. **원본 spec 삭제 순서**: 원본은 T4가 기대값을 확인하는 근거다. 같은 기능의 T4 통과와 원본 spec 통과를 확인한 뒤에만 T6이 삭제한다.
12. **Playwright 병렬 실행과 요청 제한**: `fullyParallel: true`, `workers: 3`이다. swagger-docs의 429 검사(export 21번째, draws 61번째)는 같은 IP의 다른 실행과 섞이면 실패한다. 실행은 한 기능씩 한다.
13. **Biome 검사 대상 확대**: `unit/`과 `vitest.config.ts`가 `pnpm lint`에 들어간다. `.only`를 남기지 않고, 헬퍼는 `.util.ts`에 둔다. 실패하면 T8-c에서 되돌린다.
14. **tsconfig 포함**: `pnpm typecheck`가 `unit/`과 `vitest.config.ts`를 포함한다. T2-a 직후 typecheck를 한 번 돌린다.
15. **문서 정합**: design 11.1절의 plan 수정 요청은 plan.md 최신본에 반영된 것으로 보고 작업했다. design 11.2절의 규칙 문서 갱신은 T0에서 확인했다. 단, code-style의 `.test.ts` 네이밍 행은 아직 확인하지 않았다 (T8-c에서 확인).
16. **design과 설계의 test 수 차이**: design은 원본 test를 827건이라 하고, plan은 805건(사용자 집계 766건)이라 한다. T1에서 실제 제목 수를 다시 센다. 분류표 기준은 실제 제목이다.
