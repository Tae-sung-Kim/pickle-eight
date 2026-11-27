# result-next-links QA 보고서

- 실행일: 2026-11-27
- 입력: `docs/result-next-links/plan.md`의 완료 조건
- 테스트 파일: `e2e/result-next-links.spec.ts`, `unit/shared/result-next-links.test.ts`

## 실행 명령과 결과

```
pnpm exec playwright test e2e/result-next-links.spec.ts --project=desktop
pnpm exec vitest run unit/shared/result-next-links.test.ts
```

| 프로젝트 | 통과 | 실패 | 건너뜀 |
|---|---|---|---|
| desktop | 4 | 0 | 0 |
| mobile | - | - | - (@smoke 없음, 실행 안 함) |
| vitest | 11 | 0 | 0 |

## AC별 결과

| AC | 내용 | 결과 | 테스트 |
|---|---|---|---|
| AC-1 | 사주 결과 뒤 링크 2개·이동 (오늘의 운세 대체) | 통과 | e2e AC-1 |
| AC-2 | 타로 결과 뒤 면책·전화 목록이 보이고 링크가 가리지 않음 | 통과 | e2e AC-2 |
| AC-3 | 뭐 먹지 링크 2개, Tab 포커스 표시, Enter 이동 | 통과 | e2e AC-3 |
| AC-4 | 로또 링크 2개 `/lotto/` 아래, 고지 안 가림 | 통과 | e2e AC-4 |
| AC-5~7 | 대상 규칙, 로또 분리, 금지어·재촉 표현 | 통과 | vitest 11개. 보강 불필요 |
| AC-8 | 광고 import 없음, `use client` 없음 | 통과 | 코드 확인 |
| AC-9 | 링크 옆 광고 없음 | 통과 (아래 이슈 참고) | 코드 확인 |
| AC-10 | 결과·공유 뒤 배치 | 통과 (아래 이슈 참고) | 코드 확인 |
| AC-11 | 고정 `/` 경로만, 입력값 없음 | 통과 | 코드 확인 |
| AC-12 | 토큰 색만, 패키지 변경 없음 | 통과 | git diff |
| AC-13 | 법적 고지 상수 변경 없음 | 통과 | git status |
| AC-14 | 승인 화면에만 적용, 기존 링크 화면 무변경 | 통과 | git diff |

AC-2 차이: 구현상 링크 블록은 상담전화 목록 위에 붙는다(plan은 아래). 가림 여부만 판정했고 겹치지 않는다.

## 공통 검사

기능 전용 공통 검사는 만들지 않았다(새 페이지 없음, 기존 spec이 담당). 흐름마다 `pageerror`는 사주 테스트에서만 확인했다. 결과 전에는 블록이 없음을 네 흐름 모두 확인했다.

## 실패 항목

없음.

## 테스트를 바꾼 사유

- 첫 실행 실패 2건은 테스트 문제였다. `FORTUNE_ROUTES` import 경로 오류, 프로그램 `focus()`는 `:focus-visible`을 켜지 않아 Tab 키 입력으로 교체.

## 남은 이슈

- AC-9: 일부 화면(사주 panel, 뭐 먹지, 타로 3장, 로또 history)은 블록이 결과 영역 맨 끝이거나 공유 패널 뒤이고, 그 아래 본문 블록(가이드·FAQ) 존재는 화면별 전수 확인하지 않았다. 꿈 상세는 블록 아래에 하단 고지가 있다.
- 오늘의 운세 화면은 제외 결정에 따라 E2E 대상이 아니다.
