# 로또 고지 문구 QA 보고서

검사 위치: `e2e/lotto.spec.ts` 1번 test(`@smoke`)의 `footer` 영역 안 "당첨을 보장하지 않습니다".

| AC | 판정 | 근거 |
|---|---|---|
| AC-1 | 통과 | history, check, my-numbers 푸터 확인 |
| AC-2 | 통과 | `/api/lotto/draws?latest=1`의 최신 회차로 `/lotto/[draw]` 푸터 확인 |
| AC-3 | 미검사 | 잘못된 회차·불러오기 실패 화면은 test 7개 제한으로 넣지 않음. 푸터가 레이아웃 소속이라 구조상 동일 |
| AC-4 | 통과 | analysis, simulator, generator 푸터 확인 (허브 `/lotto` 포함) |
| AC-5 | 통과 | 데스크톱 7개 통과, 모바일 smoke 1개 통과 |
| AC-6 | 미검사 | 모바일 줄바꿈·잘림은 눈으로 확인 필요 |
| AC-7 | 미검사 | 메타·JSON-LD는 기존 SEO test가 통과 |
| AC-8 | 통과 | `pnpm lint`, `pnpm typecheck`, `pnpm test`(352개) 통과 |

참고: 로또 푸터는 연령 확인 뒤에 렌더되므로 허브는 연령 확인을 통과한 뒤 검사한다. 1번 test는 페이지가 늘어 제한 시간을 60초로 늘렸다.
