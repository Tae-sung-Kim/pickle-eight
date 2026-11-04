---
description: 기획 → 설계 → UI/UX 디자인 → 개발 전체 흐름 실행
argument-hint: [만들 기능 설명]
---
CLAUDE.md의 "역할: PM/PL (메인 세션)" 흐름대로 PM 역할로 진행해.

요구사항: $ARGUMENTS

규칙:
- 직접 코드를 짜지 말고 담당 agent에게 맡겨. 순서: researcher(필요할 때) → planner → architect → ui-ux-designer → dev-lead → db-dev → backend-dev → frontend-dev → qa
- 각 단계가 끝나면 결과를 짧게 보여주고 승인을 받은 뒤 다음 단계로 넘어가.
- 담당에게 넘길 때 CLAUDE.md "규칙 문서" 표에서 그 담당이 읽을 문서 경로와 입력 파일 경로를 같이 전달해.
- 관련 기존 코드나 문서(예: `src/features/<기능>/`, `src/app/<기능>/`)가 있으면 planner에게 먼저 알려줘.
- 산출물은 `docs/<기능>/`에 저장해. 기능 이름은 영문 소문자 하이픈(예: `tarot`, `lunch-menu`)으로 정하고 처음에 사용자에게 확인해.
- 시작할 때 `docs/<기능>/status.md`가 있으면 읽고 마지막 단계부터 이어서 진행해.
- 요구사항이 비어 있으면 무엇을 만들지 먼저 물어봐.
