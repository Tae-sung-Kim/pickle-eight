# 타로 회귀 기준선 (QA-T1)

상담전화 공용 상수 이전(FE-1) 전에, 현재 코드 그대로 기존 타로 e2e를 실행해 통과와 실패를 기록한 문서다. 이전 뒤 QA-T2가 같은 명령을 다시 실행해 이 수치와 비교한다.

## 실행 조건

- 날짜: 2026-11-05
- 브랜치: develop (커밋 23cee8b 기준, 작업 트리에 앱 코드 변경 없음. `e2e/`와 `src/`는 git status에 변경 없음)
- 명령: `pnpm exec playwright test e2e/tarot`
- 대상 파일: `e2e/tarot.spec.ts`, `e2e/tarot-copy.spec.ts`
- 프로젝트: `desktop`(Desktop Chrome), `mobile`(Pixel 7), workers 3
- 서버: `playwright.config.ts`의 webServer(`pnpm dev`, `reuseExistingServer: true`)가 처리했다. 즉 개발 서버(`next dev`) 기준이며 운영 빌드 기준이 아니다.
- 앱 코드와 기존 spec은 수정하지 않았다.

## 결과 요약

| 항목 | 수 |
|---|---|
| 전체 테스트 | 252 (파일 2개) |
| 통과 | 248 |
| 실패 | 4 |
| 소요 시간 | Playwright 보고 3.5분, 명령 전체 약 210초 |

파일별 구성은 다음과 같다. 프로젝트마다 같은 테스트를 한 번씩 실행하므로 숫자가 두 배다.

| 파일 | 전체 | 통과 | 실패 |
|---|---|---|---|
| `e2e/tarot.spec.ts` | 200 (프로젝트당 100) | 196 | 4 |
| `e2e/tarot-copy.spec.ts` | 52 (프로젝트당 26) | 52 | 0 |

`e2e/tarot-copy.spec.ts`는 전부 통과했다. 상수 이전의 영향을 받는 파일이므로 QA-T2에서 이 52개가 어떻게 바뀌는지가 핵심 비교 대상이다.

## 실패 항목 (기준선에서 이미 실패)

실패는 모두 `e2e/tarot.spec.ts` 1530행의 같은 테스트에서 나왔다. 경로와 프로젝트 조합으로 4건이다.

- `[desktop]` AC-33(표시): /tarot/daily JS를 꺼도 설명·면책·FAQ가 화면에 보인다
- `[desktop]` AC-33(표시): /tarot/three-card JS를 꺼도 설명·면책·FAQ가 화면에 보인다
- `[mobile]` AC-33(표시): /tarot/daily JS를 꺼도 설명·면책·FAQ가 화면에 보인다
- `[mobile]` AC-33(표시): /tarot/three-card JS를 꺼도 설명·면책·FAQ가 화면에 보인다

이유는 다음과 같다. 이 테스트는 `javaScriptEnabled: false`로 페이지를 열고 `getByRole('heading', { level: 1 })`가 1개 보이는지 확인한다(1536행). 실제로는 0개였고 10초 대기 뒤 실패했다. 실패 시점의 페이지 스냅샷을 보면 헤더와 푸터는 있으나 `main`이 비어 있다. 같은 JS 비활성 조건에서 DOM에 요소가 "붙어 있는지"만 보는 테스트(AC-33 attached 계열, 1500행 부근)와 서버 HTML 검사는 통과했다.

추정 원인은 개발 서버의 스트리밍이다. 본문이 스트리밍 경계 안에 있고, 개발 서버에서는 JS가 없으면 그 내용이 화면에 교체되어 나타나지 않는 것으로 보인다. 다만 운영 빌드(`pnpm build` 후 `pnpm start`)로는 확인하지 않았으므로 확정이 아니다. 앱 문제인지 개발 서버 환경 문제인지는 운영 빌드 실행으로 가려야 한다.

이 4건은 상수 이전과 무관하게 이전부터 있던 실패다. QA-T2는 이 4건을 회귀로 세지 말고, "기준선과 같은 4건 외에 새 실패가 없는가"로 비교한다.

## QA-T2에 넘기는 사항

- 같은 명령을 다시 실행해 전체 252, 통과 248, 실패 4(위 4건)와 비교한다.
- 새 실패가 생기면 상담전화 상수 이전 영향 후보는 `e2e/tarot-copy.spec.ts`의 AC-28 계열이다(`import * as noticeConstants`로 `tarot-notice.constant`를 통째로 검사하고, 변수명에 `TAROT_CRISIS`가 들어 있는지로 거른다). dev-tasks.md 4장과 5장 U-6 설명과 같다.
- 개발 서버가 이미 떠 있으면 재사용된다. 비교할 때도 같은 방식(개발 서버)으로 실행해야 수치가 맞는다.
- 실행 중 `test-results/` 폴더가 생겼다(실패 트레이스). 커밋 대상이 아니다.
