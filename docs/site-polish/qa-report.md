# site-polish QA 보고서

- 실행일: 2026-11-26
- 입력: `docs/site-polish/plan.md`의 완료 조건
- 테스트 파일: `e2e/site-polish.spec.ts`

## 실행 명령과 결과

```
pnpm exec playwright test e2e/site-polish.spec.ts --project=desktop
```

| 프로젝트 | 통과 | 실패 | 건너뜀 |
|---|---|---|---|
| desktop (360px) | 1 | 0 | 0 |
| mobile | - | - | - (`@smoke` 없음) |

## AC별 결과

| AC | 내용 | desktop | mobile | 테스트 이름 |
|---|---|---|---|---|
| AC-1 | 헤더 이름 표시, 메뉴 버튼과 안 겹침 | 통과 | - | AC-1, 2, 3 |
| AC-2 | 푸터 두 줄 문구 | 통과 | - | AC-1, 2, 3 |
| AC-3 | CSP 위반 콘솔 오류 없음 | 통과 | - | AC-1, 2, 3 |
| AC-4 | 헤더 span 클래스 | 통과 (diff 확인) | - | 정적 |
| AC-5 | 아이콘 ∞ 원본 통일(icon.svg 원본, icon.png, favicon.ico, og-image.svg, 헤더·푸터 `/icon.svg`) | 통과 (아이콘 결정 변경 후 헤더 360px 캡처, 전체 E2E 115개, 단위 954개로 재확인) | - | 정적 |
| AC-6 | va.vercel-scripts.com 이 `!isProd` 안 script-src-elem 에만 추가 | 통과 | - | 정적 |
| AC-7 | legal-review.md 항목에 줄 번호·문제·제안 | 통과 | - | 정적 |
| AC-8 | privacy, terms, consent 파일 diff 없음 | 통과 | - | 정적 |

## 공통 검사

| 항목 | 결과 |
|---|---|
| 페이지 응답 400 미만 | 통과 |
| `pageerror` 없음 | 통과 |
| `h1` 하나, 메타 | 이번 범위 아님 (새 페이지 없음) |
| 빈 상태·에러 상태 화면 | 해당 없음 |

## 실패 항목

없음.

## 남은 이슈

- 홈에는 `main input, main button`이 없어 `waitForHydration`을 쓰지 않았다. 쿠키 배너 대기(`declineCookies`)로 대신했다.
- 아이콘 "8"은 두 개의 원 경로(stroke)라 폰트 차이는 없다. 다크 모드 대응은 없음 (열린 질문 2).
