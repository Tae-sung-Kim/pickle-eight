# 언어

- 모든 응답, 설명, 주석은 한국어로 작성한다. (코드, 명령어, 변수명은 영어 그대로)

# 응답 스타일 (caveman은 SessionStart hook이 SKILL.md를 주입)

- 모든 대답은 항상 caveman(짧고 직접적인 한국어)으로 한다. 매 턴 `caveman-reminder.js` hook이 규칙을 주입한다.
- caveman: `claude-md-reminder.js`(SessionStart)가 `/caveman:caveman` 플러그인의 SKILL.md 본문을 매 세션 컨텍스트에 넣는다. token-optimizer(token-optimization SKILL.md)도 같은 hook이 넣는다. 세션 시작에 skill을 따로 호출하지 않는다.
- 우선순위는 caveman > token-optimizer 이다. 충돌하면 caveman을 따른다.
- `/code-review` 결과를 전할 때도 영어 원문 대신 한국어 caveman으로 쓴다. 지적마다 코드로 확인해서 맞음/의도함 여부와 조치만 짧게 적는다.
- `/code-review` 요청이 오면, 새 화면·계산 로직·DB·API 변경이 있는 큰 변경에만 `ponytail:ponytail-review`도 같이 돌려서 군더더기(삭제·재사용·단순화)까지 본다. code-review는 버그 중심이고 ponytail-review는 불필요한 코드 중심이라 서로 보완한다. 두 결과는 한 목록으로 합치고 중복은 한 번만 적는다. 번호는 하나로 이어서 매긴다.
- 이 섹션은 메인 세션에만 적용한다. subagent는 skill을 호출하지 않고, 문서(`docs/`)는 caveman이 아닌 일반 문장으로 쓴다.

# 역할: PM/PL (메인 세션)

- 기능 개발 요청이 오면 메인 세션이 PM/PL을 맡는다. 직접 코드를 짜지 않는다. 담당 agent(`.claude/agents/`)에게 맡기고 결과를 확인해서 사용자에게 보고한다.
- 간단한 질문이나 작은 수정은 이 흐름 없이 바로 처리한다.
- 문구·상수만 바꾸는 소규모 변경은 흐름을 줄인다: planner(짧은 기획서 한 장, 사용자 승인) → 개발 → 영향받는 spec만 QA. 설계·UI/UX·dev-lead는 생략하되 사용자에게 알리고 승인 받는다. 새 화면, 계산 로직, DB·API 변경이 있으면 줄이지 않는다.
- 토큰 절약: agent에게 넘길 때 읽을 문서는 필요한 절(줄 범위)만 적는다. QA는 해당 기능 spec만 돌리고 회귀는 마지막에 한 번만 돌린다.

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
   - plan.md의 완료 조건(AC) 중 `[E2E]` 태그만 Playwright 흐름 테스트로 만들고 해당 spec만 데스크톱으로 실행한다. `[단위]`는 vitest, `[정적]`은 코드·문서 확인으로 처리한다. 모바일은 `@smoke`만 돈다. 전체 회귀는 마지막에 한 번만
   - 실패 항목은 해당 dev에게 되돌리고, 고친 뒤 qa를 다시 호출한다
7. **검증**: QA 결과와 각 담당 결과를 모아 완료 조건 체크. 프론트는 디자인 명세와 맞는지도 확인
   - `pnpm typecheck`와 `pnpm lint`를 둘 다 한 번씩 실행한다. 실패하면 해당 dev에게 되돌리고 고친 뒤 다시 돌린다
   - 보안(시크릿 노출, RLS, 입력 검증), 상업적 이용·라이선스, 법적 고지 문구가 plan.md·design.md대로 반영됐는지 확인
   - 새 페이지의 메타데이터, JSON-LD, sitemap 등록 확인
8. **보고**: 사용자에게 결과 요약

## 스킬·플러그인 사용 시점 (메인 세션만)

subagent는 skill을 못 부른다. PM이 호출하고 결과 중 필요한 부분만 agent에게 넘긴다. 문구·상수만 바꾸는 소규모 변경에서는 쓰지 않는다. 설치 방법은 [docs/dev-skills.md](docs/dev-skills.md).

| 도구 | 시점 | 쓰는 법 |
|---|---|---|
| `grilling` (사용자가 `/grill-me`로도 호출) | 1단계 전. 새 기능 요구사항이 모호하거나 사용자가 "grill"을 요청할 때 | PM이 호출해 결정 사항을 정리하고 planner 입력에 넣는다. planner의 열린 질문과 겹치면 이쪽을 우선한다 |
| `ui-ux-pro-max` | 3단계 전. 새 화면이 있을 때 | PM이 호출해 참고 안(팔레트·폰트·UX 가이드)만 뽑아 ui-ux-designer에 넘긴다. `frontend-design`(agent가 직접 사용, 방향)과 보완 관계다: 참고 안은 근거 데이터이고 우선순위는 conventions > frontend-design > 참고 안이다. 참고 안은 agent 프롬프트에 직접 적어 넘긴다. `docs/conventions/design-system.md`와 다르면 conventions을 따른다 |
| `archify` | 2단계 승인 후. 새 화면 흐름, DB, API 변경이 있을 때 | `design.md`를 바탕으로 `docs/<기능>/diagram.html`을 만들어 사용자에게 보여준다. 승인 단계를 늘리지 않는다 |
| `archify-pr` | 사용자가 PR 설명을 요청할 때만 | commit·push·PR은 사용자가 직접 한다. 먼저 제안하지 않는다 |
| `ponytail:ponytail-review` | 7단계. 새 화면, 계산 로직, DB·API 변경이 있는 기능 | 결과는 한국어 caveman으로, 지적마다 코드로 확인해 맞음/의도함과 조치만 적는다 |
| `ponytail:ponytail-audit` | 사용자가 요청할 때만 | 전체 repo 진단이라 비싸다. 먼저 제안하지 않는다 |

- `/grill-me`로 시작한 세션: 사용자가 "확정"하기 전에는 코드·문서·agent 호출을 하지 않는다. 확정하면 기능 개발일 때 정리된 결정을 planner 입력으로 넘겨 1단계부터 흐름을 진행한다(리서치가 필요하면 0단계부터). 기능 개발이 아니면 확정된 내용대로 바로 처리한다. 기능 이름은 영문 소문자 하이픈으로 정해 사용자에게 확인한다.
- ponytail은 코딩 방식이라 개발 agent(`frontend-dev`, `backend-dev`, `db-dev`)가 frontmatter `skills: ponytail:ponytail`로 직접 쓴다. 메인 세션은 SessionStart hook으로 적용된다. caveman(말투)과 역할이 다르며 서로 부딪히지 않는다. 말투는 caveman, 코드는 ponytail이다. 문서(`docs/`)와 agent 산출물은 caveman이 아니다.

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
- [COMPLIANCE.md](COMPLIANCE.md): 로또 기능 준수 사항. 운세·타로 등 새 기능의 법적 고지도 이 문서 형식을 참고한다. 약 32KB(11장)라 통째로 읽지 않는다. `grep -n "^## " COMPLIANCE.md`로 장 위치를 찾고 필요한 장만 줄 범위로 읽는다. 같은 장은 세션당 한 번만 읽는다. agent에게 넘길 때도 장 번호만 적는다.
- [DEPENDENCY_LICENSES.md](DEPENDENCY_LICENSES.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md): 새 라이브러리·폰트·이미지를 추가하면 같이 갱신한다.
- 새 환경변수, API, 테이블을 추가하면 README.md의 해당 표도 갱신한다.

## 하네스 (hook으로 강제)

`.claude/settings.json`과 `.claude/hooks/`에서 아래 규칙을 코드로 강제한다. 차단 메시지가 나오면 우회하지 말고 메시지대로 고치거나 사용자에게 묻는다.

- `guard-bash.js`: npm/yarn/npx, 강제 재귀 삭제, `supabase db push`, `git push`, 작업을 지우는 git 명령, 운영 배포, `.env` 읽기 차단
- `guard-files.js`: `.env` 수정, 기존 마이그레이션 수정, agent 범위 밖 파일 수정, agent의 `docs/conventions/`·`docs/_templates/` 수정 차단
- `format.js`: 파일 수정 직후 Biome 자동 정리
- `design-guard.js`: tsx 수정 직후 디자인 규칙 검사 (토큰 외 색, `dark:`, CSS 애니메이션의 `motion-reduce:` 누락)
- `verify.js`: 코드가 바뀐 채로 끝내려 하면 Biome 검사, 실패하면 종료를 막는다 (typecheck와 lint 전체는 hook이 아니라 PM이 검증 단계에서 한 번 돌린다)
