# 뭐 먹지 동네 이름 입력 QA 보고서 (QA-1~4)

작성: qa, 2026-11-24. 범위: QA-1, QA-2, QA-3, QA-4. 정적 확인과 회귀(QA-5)는 포함하지 않는다.

## 실행

| 명령 | 결과 |
|---|---|
| `pnpm exec vitest run unit/meal` | 6개 파일, 86개 통과 |
| `pnpm exec playwright test e2e/meal-location.spec.ts --project=desktop` | 3개 통과 |

실패 항목 없음. 모바일 프로젝트의 `@smoke` 실행은 이 범위에서 하지 않았다.

## 만든 것

- `unit/meal/meal-area.test.ts`: AC-4 입력 규칙
- `unit/meal/meal-map-link.test.ts`: AC-1, 2, 5 검색어 조합과 URL 형태
- `e2e/meal-location.spec.ts`: 흐름 3개
  - AC-1, 2, 3, 7, 8: 비움, 입력, 재돌림, 새 탭, 새로고침, 요청과 저장소 검사, 위치 API 호출 0회
  - AC-5: 오류 입력 5종, 오류 안내와 링크 검색어, 지우기 버튼
  - AC-6 `@smoke`: 320px 뷰포트를 테스트 안에서 지정(OPEN-1), Tab 순서, 가로 스크롤 없음

## 기존 테스트를 바꾼 사유

- `unit/meal/meal-notice.test.ts`: 외부 링크 안내 고정값을 FE-2의 새 문장으로 교체
- `unit/meal/meal-copy.test.ts`: 지도 FAQ 기대를 새 답 기준으로 교체. 금지어 5개 포함 검사와 동네 입력 문구 금지어 검사 추가(AC-12)

## 참고

- 한글 조합 중 동작은 자동 확인이 불가능해 QA-5의 수동 항목으로 남긴다(OPEN-3).
- AC-8의 입력 문자열 확인은 이 사이트 origin 요청의 URL과 본문, 저장소, 쿠키까지다. 새 탭은 지도 응답을 가로챈 상태에서 팝업 주소로 확인했다.

- 2026-11-24: 입력란 위치 변경(돌리기 버튼 아래, 지도 링크 위, 항상 표시)에 맞춰 AC-6 @smoke 키보드 순서를 돌리기 → 입력란 → 지도 링크로 수정하고 돌리기 전 입력란 표시 확인 추가.
