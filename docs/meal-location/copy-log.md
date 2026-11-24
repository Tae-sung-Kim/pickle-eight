# 뭐 먹지 동네 이름 입력 문구 작성·검수 이력

형식은 `docs/menu-meals/copy-log.md`를 따른다. 근거 문서는 `docs/meal-location/design.md` 7.6, 7.7과 `ui-ux-design.md` 상시 고지 문구 절이다. 외부 문장은 참조하지 않았다.

## 문구

| 대상 | 파일 | 작성자 | 작성일 | 검수자 | 상태 |
|---|---|---|---|---|---|
| `MEAL_AREA_INPUT_LABEL`, `MEAL_AREA_INPUT_PLACEHOLDER`, `MEAL_AREA_CLEAR_BUTTON_LABEL` | `src/features/meal/constants/meal-notice.constant.ts` | frontend-dev | 2026-11-24 | PM | 검수 대기 |
| `MEAL_AREA_ERROR_TEXT` (invalidChar, tooLong. 20은 `MEAL_AREA_MAX_LENGTH`) | 같음 | frontend-dev | 2026-11-24 | PM | 검수 대기 |
| `MEAL_AREA_NOTICE_LINES` 5줄 | 같음 | frontend-dev | 2026-11-24 | PM | 검수 대기 |
| `MEAL_AREA_PREVIEW_LABEL`, `MEAL_AREA_RESULT_NOTICE_TEXT` | 같음 | frontend-dev | 2026-11-24 | PM | 검수 대기 |
| `MEAL_EXTERNAL_LINK_NOTICE_TEXT` 수정 (허용 문장 5개 구조 그대로) | 같음 | frontend-dev | 2026-11-24 | PM | 검수 대기 |
| FAQ "지도 링크를 누르면 어디로 이동하나요?" 답 수정 (DQ1, 질문 7개 유지) | `meal-faq.constant.ts` | frontend-dev | 2026-11-24 | PM | 검수 대기 |

## 금지어 추가

- `meal-copy-rule.constant.ts`의 `MEAL_FORBIDDEN_TERMS`에 "주변", "근처", "현재 위치", "내 위치", "GPS"를 한 묶음으로 추가했다. 기존 금지어는 그대로다.
- 새 문장은 `MEAL_COPY_ALLOWED_SENTENCES`에 넣지 않았다. 위 금지어와 기존 금지어를 새 문장에 쓰지 않았다.

## 한계

- 웹 검색 유사도 점검은 하지 않았다.
- `unit/meal` 기대값 수정은 QA-3 담당이다.
