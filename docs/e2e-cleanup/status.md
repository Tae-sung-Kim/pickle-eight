# e2e-cleanup 진행 상태

| 단계 | 상태 | 비고 |
|---|---|---|
| 0. 리서치 | 생략 | 사용자가 아는 분야 |
| 1. 기획 | 승인 | plan.md |
| 2. 기술 설계 | 승인 | design.md |
| 3. UI 디자인 | 생략 | 화면 없음, 사용자 승인 |
| 4. 개발 준비 | 완료 | dev-tasks.md |
| 5. 개발 | 완료 | 단위 테스트 22개 파일 352개, e2e spec 6개 50개 |
| 6. QA | 완료 | desktop 50개, mobile smoke 8개 통과 (qa-report.md 최종 판정) |
| 7. 검증 | 완료 | typecheck, lint 통과 |
| 8. 보고 | 완료 | |

## 확정 결정

- 단위 테스트: Vitest, 위치 `unit/<기능>/*.test.ts`, 설정 `vitest.config.mts`
- qa 쓰기 범위에 `unit/` 추가 (`.claude/hooks/guard-files.js`)
- fortune e2e만 15개까지 허용, 모바일은 `@smoke` 태그
- `/code-review`는 푸시 전 수동 실행, README.md에 한 줄 기록
- 로또 "당첨 보장 없음" 원문은 단위 고정 대신 e2e 화면 확인으로 대체 (plan AC-6과 다름)

## 남은 확인

- vitest 라이선스(MIT): 사용자 확인 완료
- lotto SEO가 최신 회차 페이지를 포함하지 않음
- 로또 고지 누락은 `docs/lotto-notice/`에서 해결
