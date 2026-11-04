# <기능> QA 보고서

- 실행일: YYYY-MM-DD
- 입력: `docs/<기능>/plan.md`의 완료 조건
- 테스트 파일: `e2e/<기능>.spec.ts`

## 실행 명령과 결과

```
pnpm exec playwright test e2e/<기능>
```

| 프로젝트 | 통과 | 실패 | 건너뜀 |
|---|---|---|---|
| desktop | | | |
| mobile | | | |

## AC별 결과

| AC | 내용 | desktop | mobile | 테스트 이름 |
|---|---|---|---|---|
| AC-1 | | 통과 / 실패 | 통과 / 실패 | |

## 공통 검사

| 항목 | 결과 |
|---|---|
| 페이지 응답 400 미만 | |
| `pageerror` 없음 | |
| `h1` 하나 | |
| title·description 메타 | |
| 빈 상태·에러 상태 화면 | |

## 실패 항목

| AC | 원인 (테스트 / 앱) | 재현 방법 | 담당 (frontend-dev / backend-dev / db-dev) |
|---|---|---|---|

없으면 "없음".

## 남은 이슈

-
