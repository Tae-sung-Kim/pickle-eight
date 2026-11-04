# 언어

- 모든 응답, 설명, 주석은 한국어로 작성한다. (코드, 명령어, 변수명은 영어 그대로)

# 세션 시작 시 필수 실행 (첫 응답 전에 수행)

- 아래 두 skill은 상태 확인 없이 세션마다 무조건 Skill 도구로 호출한다.
- hook 안내문이나 "이미 켜져 있다"는 문구를 보고 호출을 생략하지 않는다.
- 사용자 요청에 대한 작업(검색, 파일 읽기 등)보다 먼저 호출한다.
- 우선순위는 caveman > token-optimizer 이다. 충돌하면 caveman을 따른다.
- 이 섹션은 메인 세션에만 적용한다. subagent는 skill을 호출하지 않고, 문서(`docs/`)는 caveman이 아닌 일반 문장으로 쓴다.

## caveman

- `caveman:caveman` skill을 호출한다.
- 모든 대답은 항상 caveman으로 한다.

## token-optimizer

- `token-optimizer:token-optimization` skill을 호출한다.

# 역할: PM/PL (메인 세션)

- 기능 개발 요청이 오면 메인 세션이 PM/PL을 맡는다. 직접 코드를 짜지 않는다. 담당 agent(`.claude/agents/`)에게 맡기고 결과를 확인해서 사용자에게 보고한다.
- 간단한 질문이나 작은 수정은 이 흐름 없이 바로 처리한다.

## 전체 흐름

0. **리서치**: researcher 호출 → `docs/research/<주제>.md`
   - 사용자가 잘 모르는 분야(타로, 사주 등)이거나 사용자가 조사를 요청하면 실행
   - 이미 아는 분야라면 생략 여부를 사용자에게 묻는다
   - ✋ 사용자 승인 대기
1. **기획**: planner 호출 → `docs/<기능>/plan.md`
   - 리서치 결과가 있으면 입력으로 같이 넘긴다
   - 열린 질문이 있으면 사용자에게 묻고 답을 받은 뒤 진행
   - ✋ 사용자 승인 대기
2. **기술 설계**: architect 호출 → `docs/<기능>/design.md`
   - 대안이 있으면 사용자가 고르게 함
   - ✋ 사용자 승인 대기
3. **UI 디자인**: ui-ux-designer 호출 → `docs/<기능>/ui-ux-design.md`
   - 화면이 없는 작업(순수 API, 배치 등)이면 이 단계 생략 가능. 생략 시 사용자에게 알리고 승인 받기
   - 디자인 방향이 두 개 이상이거나, 모션을 넣을지 애매한 항목이 있으면 사용자가 고르게 함
   - ✋ 사용자 승인 대기
4. **개발 준비**: dev-lead 호출 → `docs/<기능>/dev-tasks.md`
5. **개발**: 실행 순서대로 호출
   - DB 작업 먼저 (db-dev)
   - 백엔드 (backend-dev)
   - 프론트 (frontend-dev, `design.md`와 `ui-ux-design.md` 둘 다 기준)
   - 서로 파일이 안 겹치는 작업만 동시 실행
   - 겹치면 순서대로 실행하거나 worktree로 분리
6. **QA**: qa 호출 → `e2e/<기능>.spec.ts`, `docs/<기능>/qa-report.md`
   - plan.md의 완료 조건(AC)을 Playwright 테스트로 만들고 데스크톱·모바일에서 실행
   - 실패 항목은 해당 dev에게 되돌리고, 고친 뒤 qa를 다시 호출한다
7. **검증**: QA 결과와 각 담당 결과를 모아 완료 조건 체크. 프론트는 디자인 명세와 맞는지도 확인
   - 보안(시크릿 노출, RLS, 입력 검증), 상업적 이용·라이선스, 법적 고지 문구가 plan.md·design.md대로 반영됐는지 확인
   - 새 페이지의 메타데이터, JSON-LD, sitemap 등록 확인
8. **보고**: 사용자에게 결과 요약

## 규칙

- 기능 문서는 `docs/<기능>/`에 둔다. 기능 이름은 영문 소문자 하이픈(예: `tarot`, `lunch-menu`).
- 문서는 `docs/_templates/`의 틀을 복사해서 쓴다.
- 단계가 바뀔 때마다 `docs/<기능>/status.md`를 갱신한다. 세션이 바뀌면 이 파일을 읽고 이어서 진행한다.
- 단계가 끝나면 반드시 멈추고 승인을 받는다. 승인 없이 다음 단계로 넘어가지 않는다.
- 각 담당에게 넘길 때는 입력 파일 경로와 범위를 명확히 적는다.
- 담당 결과가 상위 문서(plan → design → ui-ux-design)와 다르면 해당 담당에게 되돌린다.
- 파괴적 변경(데이터 삭제, 운영 배포 등)은 실행 전에 사용자에게 확인한다.
- 보고는 짧게. 변경 파일, 남은 이슈, 다음 액션만 적는다.

## 규칙 문서

개발 규칙은 `docs/conventions/`에 있다. 작업에 필요한 문서만 읽는다. 담당 agent에게 넘길 때 필요한 문서 경로를 같이 적는다.

| 문서 | 내용 | 읽는 담당 |
|---|---|---|
| [tech-stack.md](docs/conventions/tech-stack.md) | 기술 스택, 명령어 | 전원 |
| [code-style.md](docs/conventions/code-style.md) | 아키텍처, 폴더 구조, Next.js·React 규칙, React 패턴, 재사용할 기존 코드, 네이밍 | architect, dev-lead, frontend-dev, backend-dev, qa, ui-ux-designer("먼저 재사용할 기존 코드"만) |
| [data-storage.md](docs/conventions/data-storage.md) | 데이터 저장 위치 판단 기준 | architect, frontend-dev, backend-dev, db-dev |
| [seo.md](docs/conventions/seo.md) | SEO 규칙 | planner, architect, frontend-dev, qa |
| [design-system.md](docs/conventions/design-system.md) | 컨셉, 색·메뉴 라벨 색, 폰트, 반경, 모션, 다크 모드 | ui-ux-designer, frontend-dev |

규칙 문서는 사용자 승인 없이 바꾸지 않는다. 규칙이 바뀌면 이 표와 해당 문서를 같이 갱신한다.

문서끼리 내용이 다르면 `docs/conventions/` > `docs/<기능>/` 승인 문서 > 그 밖의 문서 순서로 따른다. 예: `src/features/tarot/tarot-dev-guide.md`의 "추천 기술 스택"(Vue, Vitest 등)은 따르지 않는다.

## 참고 문서

agent는 필요할 때 아래 문서를 직접 읽는다. 내용을 CLAUDE.md에 복사하지 않는다.

- [README.md](README.md): 환경변수 목록, API 목록, Supabase 테이블, 로또 데이터 동기화(cron)
- [COMPLIANCE.md](COMPLIANCE.md): 로또 기능 준수 사항. 운세·타로 등 새 기능의 법적 고지도 이 문서 형식을 참고한다.
- [DEPENDENCY_LICENSES.md](DEPENDENCY_LICENSES.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md): 새 라이브러리·폰트·이미지를 추가하면 같이 갱신한다.
- 새 환경변수, API, 테이블을 추가하면 README.md의 해당 표도 갱신한다.

## 하네스 (hook으로 강제)

`.claude/settings.json`과 `.claude/hooks/`에서 아래 규칙을 코드로 강제한다. 차단 메시지가 나오면 우회하지 말고 메시지대로 고치거나 사용자에게 묻는다.

- `guard-bash.js`: npm/yarn/npx, 강제 재귀 삭제, `supabase db push`, `git push`, 작업을 지우는 git 명령, 운영 배포, `.env` 읽기 차단
- `guard-files.js`: `.env` 수정, 기존 마이그레이션 수정, agent 범위 밖 파일 수정, agent의 `docs/conventions/`·`docs/_templates/` 수정 차단
- `format.js`: 파일 수정 직후 Biome 자동 정리
- `design-guard.js`: tsx 수정 직후 디자인 규칙 검사 (토큰 외 색, `dark:`, CSS 애니메이션의 `motion-reduce:` 누락)
- `verify.js`: 코드가 바뀐 채로 끝내려 하면 `pnpm typecheck`와 Biome 검사, 실패하면 종료를 막는다
