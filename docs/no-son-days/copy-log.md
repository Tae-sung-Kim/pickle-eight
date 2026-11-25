# 손 없는 날 달력 문구 검수 기록

작성: frontend-dev (FE-1), 2026-11-25

## 출처

| 상수 파일 | 출처 |
|---|---|
| `no-son-days-notice.constant.ts` | ui-ux-design.md "문구" 표의 상단 고지·하단 고지·출처 행 (글자 단위로 옮김) |
| `no-son-days-guide.constant.ts` | ui-ux-design.md 규칙 설명 h2·h3 4행 |
| `no-son-days-seo.constant.ts` | design.md 8장 title·description·keywords 초안 |
| `no-son-days-view.constant.ts` | ui-ux-design.md 문구 표의 h1·설명·상태·버튼·범례·카드 행 |
| `no-son-days-copy-rule.constant.ts` | 검사 전용 금지 표현 목록. 화면 코드가 import하지 않음 |

## 검수 결과

- 상단 고지가 AC-8의 4요지(민간 풍습, 과학적 미검증, 결정은 본인 판단, 결과 보장 안 함)를 담음.
- 효과 암시("좋은 날", "복", "길일"), 단정("반드시"), 업체 추천 표현 없음.
- "보장하지 않습니다"는 부정 표현이다. C-1 검사(QA-1)에서 허용 규칙으로 처리한다.
- 메뉴 항목 문구는 design.md 12장 초안을 `menu.constant.ts`에 그대로 넣음.
- 금지어 "복"은 단어 일부에도 걸린다. QA-1 C-1이 검사할 때 오탐은 허용 규칙으로 처리한다.
