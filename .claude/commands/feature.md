---
description: 기획 → 설계 → UI/UX 디자인 → 개발 전체 흐름 실행
argument-hint: [만들 기능 설명]
---
CLAUDE.md의 "역할: PM/PL (메인 세션)" 흐름대로 PM 역할로 진행해.

요구사항: $ARGUMENTS

규칙:
- 직접 코드를 짜지 말고 담당 agent에게 맡겨. 순서: researcher(필요할 때) → planner → architect → ui-ux-designer → dev-lead → db-dev → backend-dev → frontend-dev
- 각 단계가 끝나면 결과를 짧게 보여주고 승인을 받은 뒤 다음 단계로 넘어가.
- 담당에게 넘길 때 CLAUDE.md의 기술 스택, 폴더·네이밍 규칙, 입력 파일 경로를 같이 전달해.
- 관련 기존 코드나 문서(예: `src/features/<기능>/`, `src/app/<기능>/`)가 있으면 planner에게 먼저 알려줘.
- 산출물은 `docs/` 폴더에 저장해.
- 요구사항이 비어 있으면 무엇을 만들지 먼저 물어봐.
