# 뭐 먹지 동네 이름 입력 지도 검색 진행 상태

- 기능 이름: 뭐 먹지 동네 이름 입력 지도 검색 (`meal-location`)
- 시작일: 2026-11-24
- 현재 단계: 1 기획 (기획 완료, 승인 대기)

## 단계별 상태

| 단계 | 문서 | 상태 | 승인일 | 메모 |
|---|---|---|---|---|
| 0 리서치 | `docs/research/meal-location.md` | 승인 | 2026-11-24 | 좌표 방식 불가 확인. 사용자가 B안(동네 이름 텍스트) 선택 |
| 1 기획 | `plan.md` | 승인 | 2026-11-24 | Q1~Q10 전부 권장안 |
| 2 설계 | `docs/archive/meal-location/design.md` | 승인 | 2026-11-24 | DQ1~DQ4 전부 권장안 |
| 3 UI/UX | `docs/archive/meal-location/ui-ux-design.md` | 승인 (2026-11-24, U-L1~L5·DQ4 전부 추천안) | | 입력란과 고지 배치 |
| 4 개발 준비 | `dev-tasks.md` | 완료 | | |
| 5 개발 | FE-1~4, DOC-1·2 | 완료 | 2026-11-24 | |
| 6 QA | `qa-report.md` | 통과 | 2026-11-24 | vitest 806, meal e2e 14 |
| 7 검증 | | 완료 | 2026-11-24 | typecheck, lint 통과. 배포 대기 |

## 남은 일

- 배포 전: 방침·약관 `EFFECTIVE_DATE`를 배포일로 같이 변경한다(OPEN-2).
- 브라우저에서 직접 확인: 한글 조합 중 미리보기·링크가 안 바뀌는지, 오류 시 입력란 테두리 색(`border-muted-foreground`가 `aria-invalid`에 덮이는지), 320px.
- 사용자: 새 문구 최종으로 한 번 읽기(`copy-log.md`). 법률 검토는 위험 수용(COMPLIANCE.md 기록).
- 새 주소가 없어 sitemap 재수집은 필요 없다.

## 결정 기록

- 2026-11-24: 좌표 기준 주변 검색은 지도 3사 웹 URL에서 공식 지원되지 않아 보류한다. 위치 권한을 쓰지 않는다.
- 2026-11-24: 사용자가 B안을 선택했다. 동네 이름을 직접 입력받아 "동네 + 메뉴" 검색어로 쓰고, 입력은 저장하지 않는다.
- 2026-11-24: 기획 승인. Q1~Q10 모두 권장안으로 확정. 설계 단계 진행.
- 2026-11-24: 기획 단계에서 "입력 없음"을 "메뉴 이름만"과 같은 동작으로 정했다. 기존 동작을 유지한다.
- 2026-11-24: 개발·QA·검증 완료(vitest 806, meal e2e 14, typecheck, lint). COMPLIANCE.md, 방침, 약관, `docs/menu-meals/plan.md`·`docs/archive/meal-location/design.md` 갱신 완료.
- 2026-11-24: 사용자 결정으로 입력란 위치를 돌림판·다시 뽑기 버튼 아래, 지도 링크 위로 변경(항상 표시). `root.component.tsx`, `e2e/meal-location.spec.ts` 수정, `docs/archive/meal-location/ui-ux-design.md` 맨 위에 변경 기록.
- 배포 전 남은 일은 `docs/TODO.md` "출시 후 확인할 일" 8번.
- 2026-11-24: /code-review 반영. 입력 규칙에 숫자 제한 추가(연속 숫자 5자 이상 또는 전체 숫자 7개 이상이면 `too_many_digits`로 거부, 전화번호·상세 번지 방지). plan AC-4, design 5.2의 허용 문자 규칙에 이 제한이 더해진 것으로 읽는다. 오류 문구는 `MEAL_AREA_ERROR_TEXT.tooManyDigits`.
