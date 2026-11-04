---
description: 개발 전에 모르는 분야를 먼저 조사 (researcher만 실행)
argument-hint: [조사할 주제와 궁금한 점]
---
researcher agent에게 아래 주제를 조사시켜.

주제: $ARGUMENTS

규칙:
- 관련 기존 문서(예: `src/features/<주제>/*.md`)가 있으면 경로를 같이 넘겨.
- 결과는 `docs/research/<주제>.md`에 저장해.
- 끝나면 핵심 요약, 저작권 주의점, 열린 질문만 짧게 보고해.
- 주제가 비어 있으면 무엇을 조사할지 먼저 물어봐.
