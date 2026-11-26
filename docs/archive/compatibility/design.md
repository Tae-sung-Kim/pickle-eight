# 궁합 테스트 설계서

입력: `docs/compatibility/plan.md` ("확정 답변" 절 포함), `docs/research/compatibility.md` (0장, 5.1, 5.2, 9장)
규칙 문서: `docs/conventions/tech-stack.md`, `code-style.md`, `data-storage.md`, `seo.md`
작성일: 2026-11-24
상태: 설계 초안. 0장의 결정 D-1~D-8은 PM 선택 대기다. 본문은 각 결정의 권장안을 기준으로 적었다.

확정 답변 반영 요약
- 메뉴: 운세 그룹 하위(안 A). 주소는 `/fortune/compatibility` 아래.
- 페이지: 허브 1개 + 띠 궁합 + 별자리 궁합.
- 입력: 두 사람 모두 생년월일 전체(13번 A). 만 14세 판정은 운세와 같은 함수를 쓴다. 입력값은 저장하지 않는다.
- 결과: 점수 없음. 등급 3단계 "잘 맞는 편 / 무난한 편 / 조율이 필요한 편"과 설명.
- 띠 관계: 육합, 삼합, 방합, 충, 원진만 쓴다. 파·형·해는 쓰지 않는다. 원진은 리서치 5.1의 6쌍 표를 쓴다.
- 별자리: 원소 관계(같은 원소, 보완, 대립, 그 밖)만 쓴다. 양태는 쓰지 않는다.
- 동의 문구는 궁합용으로 새로 쓰고, 동의 기록은 운세와 분리한다(14번).
- 관계 유형(연인·친구 등) 선택, 행운 요소, 로또 연결, 결과 공유는 없다.
- 검색량 확인(18번)은 배포 전 확인 항목이다. AdFit은 위험 수용이다.

---

## 0. PM 선택이 필요한 결정

### D-1. 코드 위치 (기능 폴더)

PM 요청은 새 `src/features/compatibility/`였다. 그런데 `code-style.md`는 "`features/<기능>`은 다른 기능을 import하지 않는다. 다른 기능의 코드가 필요하면 공용 폴더로 올린 뒤 쓴다"고 정한다. 궁합이 재사용할 코드(동의 게이트, 동의 저장, 만 나이 판정, 생년월일 입력 폼, 음력 변환, 절기 표, 띠·별자리 판정)는 모두 `src/features/fortune/` 안에 있다. 그래서 새 기능 폴더를 만들면 규칙과 충돌한다.

| 구분 | 안 A: 새 기능 `src/features/compatibility/` + 운세 코드 공용으로 올리기 | 안 B: 새 기능 `src/features/compatibility/`가 `features/fortune`을 직접 import | 안 C (권장): 운세 기능 안의 화면으로 둔다 `src/features/fortune/compatibility-*/` |
|---|---|---|---|
| 규칙 | 지킨다 | 어긴다. 규칙 문서를 바꾸려면 사용자 승인이 필요하다 | 지킨다. 같은 기능 안의 import다 |
| 변경 범위 | 동의 게이트·폼·저장, 입력 폼, 시각 입력, 후보 선택, 음력 확인, 날짜·음력·절기 유틸, 달력 표(수천 줄), 띠·별자리 상수와 타입까지 `src/` 공용으로 옮겨야 한다. 운세 화면 파일 대부분과 운세 단위 테스트의 import 경로가 바뀐다 | 새 파일만 추가한다 | 새 파일 추가 + 운세 동의 관련 공유 컴포넌트에 선택 prop 추가(기본값은 지금 동작 그대로) |
| 회귀 위험 | 크다. 운세 5개 페이지와 운세 단위 테스트 전체가 영향을 받는다 | 작다 | 작다 |
| 메뉴·주소와의 관계 | 주소는 `/fortune/compatibility`인데 코드는 다른 기능이라 어긋난다 | 같음 | 메뉴(운세 그룹), 주소(`/fortune/...`), 레이아웃(`src/app/fortune/layout.tsx`), 코드 위치가 모두 맞는다 |
| 문구 검사 | 운세 문구 검사(`unit/fortune/fortune-copy.test.ts`의 소스 스캔)가 궁합 파일을 보지 않는다. 따로 만들어야 한다 | 같음 | 운세 소스 스캔(`src/features/fortune/`, `src/app/fortune/`)이 궁합 문구에도 기존 금지 목록을 자동으로 적용한다(plan "기존 금지 목록을 그대로 적용") |
| 2차(사주 궁합) | 공용으로 올린 사주 계산을 쓸 수 있다 | 같음 | 운세 안이라 사주 계산을 그대로 쓸 수 있다 |
| 단점 | 작업량이 가장 크고 이번 기획 범위(궁합)를 넘는 리팩터링이다 | 아키텍처 규칙 위반 선례가 생긴다 | 운세 기능 폴더가 더 커진다. 2차에서 궁합을 별도 그룹(plan 안 B)으로 뺄 때 폴더 이동이 필요하다 |

권장: 안 C. 이하 본문은 안 C 기준이다. 안 A를 고르면 1장 폴더 구조와 10장 작업 목록을 다시 쓴다.

### D-2. 동의 기록 분리 방법

확정 답변 14번: 동의 문구는 궁합용으로 새로 쓰고 동의 저장은 분리한다. 문제는 `src/app/fortune/layout.tsx`가 `/fortune/*` 전체를 운세 동의 Provider로 감싸고 있어서, 궁합 페이지도 그 아래에 들어간다는 점이다.

| 구분 | 안 1 (권장): 운세 동의 구성 요소에 "범위(scope)"를 추가하고, 궁합 레이아웃에서 궁합 범위 Provider를 한 번 더 감싼다 | 안 2: 궁합 전용 동의 Provider·게이트·폼·거부 화면·저장 서비스를 복사해 새로 만든다 |
|---|---|---|
| 방식 | 운세 Provider, 저장 서비스, 게이트, 동의 폼, 거부 화면, 연령 안내 화면이 범위 값(운세 / 궁합)을 받는다. 범위가 없으면 지금과 똑같이 운세로 동작한다. `src/app/fortune/compatibility/layout.tsx`가 궁합 범위 Provider로 감싸면, 궁합 페이지의 게이트는 가장 가까운 Provider(궁합)를 읽는다. Provider에는 직렬화 가능한 범위 이름만 넘기고, 범위별 문구·저장 키는 운세 기능 안 상수에서 고른다 | 같은 동작의 컴포넌트를 궁합 이름으로 하나 더 둔다 |
| 장점 | 게이트·체크·포커스 이동·hydration 처리 로직이 한 벌이다. 운세 쪽 버그 수정이 궁합에도 같이 적용된다 | 운세 파일을 건드리지 않는다 |
| 단점 | 운세 공유 파일 7개를 고친다(선택 prop 추가). 운세 단위·e2e 회귀 확인이 필요하다 | 같은 로직이 두 벌이 된다. `code-style.md` "같은 역할의 컴포넌트를 새로 만들지 않는다"와 어긋난다 |

권장: 안 1. 저장 키는 운세 키와 다른 키를 쓴다(2장). 운세에 동의해도 궁합은 다시 묻고, 궁합에 동의해도 운세는 다시 묻는다. 이유: 동의 항목이 다르고(상대방 정보 항목이 추가됨), 문구 버전도 따로 관리해야 한다.

### D-3. 두 사람 입력 방식

| 구분 | 안 1 (권장): 차례 입력. 첫 번째 사람 → (필요하면 시각 질문·후보 선택) → 두 번째 사람 → (필요하면 시각 질문·후보 선택) → 결과 | 안 2: 한 화면에 두 사람 입력 묶음을 나란히 두고 버튼 하나로 제출 |
|---|---|---|
| 재사용 | 기존 생년월일 입력 폼(`birth-form`), 시각 입력, 후보 선택, 음력 확인 컴포넌트를 그대로 쓴다. 한 번에 폼 하나만 화면에 있다 | 기존 입력 폼은 폼 하나에 제출 버튼 하나라 그대로 못 쓴다. 폼을 입력 묶음 단위로 쪼개는 변경이 필요하다 |
| 경계일 처리 | 사람마다 시각 질문이 자연스럽게 이어진다 | 두 사람이 동시에 경계일이면 질문 두 개를 한 화면에서 처리해야 한다 |
| 한쪽만 입력 | 두 번째 사람을 넣기 전에는 결과 단계가 없다. 빈 칸으로 제출하면 기존 오류 문구("출생 연도, 월, 일을 모두 입력해 주시기 바랍니다.")를 쓴다 | 버튼 막기 또는 오류 문구 중 정해야 한다 |
| 단점 | 단계가 하나 늘어 결과까지 조작이 많다 | 개발 범위와 운세 공유 파일 변경이 커진다 |

권장: 안 1. plan "예외·빈 상태"의 "결과 버튼을 막을지 안내 문구를 쓸지"는 버튼을 막지 않고 기존 오류 문구를 쓰는 것으로 정한다(운세와 같은 방식). 단계 표시(예: "첫 번째 사람", "두 번째 사람") 모양은 UI 단계에서 정한다.

### D-4. 결과 문구 구조 (78조합)

확정 답변 9번은 "관계 유형별 문장 + 같은 띠 12개, 같은 별자리 12개 전용 문장"이다. PM 요청에 "78조합 문구"가 있어 두 안을 비교한다.

| 구분 | 안 1 (권장, 확정 답변 9번 그대로): 관계 유형 문단 + 같은 조합 전용 문단 | 안 2: 78조합마다 한 줄씩 전용 문장 + 관계 유형 문단 |
|---|---|---|
| 띠 문구 수 | 관계 유형 6개(육합, 삼합, 방합, 충, 원진, 그 밖의 관계) + 같은 띠 12개 = 18묶음 | 18묶음 + 서로 다른 띠 66줄 |
| 별자리 문구 수 | 관계 유형 4개(같은 원소, 보완, 대립, 그 밖의 관계) + 같은 별자리 12개 = 16묶음 | 16묶음 + 서로 다른 별자리 66줄 |
| 78조합 연결 | 78개 조합 키마다 정확히 한 문구 묶음으로 연결된다(단위 테스트로 확인) | 같음 + 66줄 표 |
| 장점 | 검수량이 작다. 기획 범위 안이다 | 조합마다 설명이 달라 반복감이 적다 |
| 단점 | 같은 관계 유형 조합끼리는 설명이 같다(두 띠 이름 표시로만 구분) | 기획 범위를 넘는다(plan 재승인 필요). 검수량이 132줄 늘어난다 |

권장: 안 1. 문구에 두 띠·별자리 이름을 끼워 넣는 자리 표시는 쓰지 않는다(조사 "이/가" 처리 오류를 피한다). 이름은 결과 제목 줄에 따로 보여 준다.

### D-5. 서버 HTML에 넣을 결과 설명 범위 (AC-10)

| 구분 | 안 1 (권장): 관계 유형 설명 전체 + 관계 규칙 목록 + 등급 규칙 + FAQ를 서버 HTML에 넣는다. 같은 조합 전용 문구와 개인 결과는 동의 뒤 클라이언트에서만 그린다 | 안 2: 안 1 + 같은 띠 12개, 같은 별자리 12개 전용 문구도 서버 HTML에 넣는다 |
|---|---|---|
| 장점 | "육합은 무슨 뜻인가" 같은 검색 질문에 답하는 문장이 HTML에 있다. 동의 전 화면에 결과처럼 보이는 내용이 적다 | "쥐띠끼리 궁합" 같은 검색어에도 닿는다 |
| 단점 | 같은 띠 조합 검색어에는 약하다 | 페이지가 길어진다. 동의 전 화면에 결과 문장이 많이 노출된다(AC-12의 "확인 전에는 결과가 보이지 않는다"와 경계가 흐려진다) |

권장: 안 1.

### D-6. 상대방 정보 동의 확인 위치

확정 답변 12번: 상대방 정보 안내 초안을 승인받고, 입력 전에 확인 체크를 한 번 받는다.

| 구분 | 안 1 (권장): 궁합 이용 전 확인 화면의 네 번째 항목으로 넣는다(탭 세션마다 한 번) | 안 2: 두 번째 사람 입력 폼 위에 체크 상자를 두고 매번 체크하게 한다 |
|---|---|---|
| 장점 | "한 번"과 맞는다. 기존 게이트 구조(모두 체크해야 진행, 거부 시 이용 불가)를 그대로 쓴다 | 입력할 때마다 상기시킨다 |
| 단점 | 같은 탭에서 여러 사람을 넣을 때 다시 묻지 않는다(대신 안내 문장은 입력 화면에 항상 보인다) | 입력 폼 변경이 필요하고 반복 체크가 번거롭다 |

권장: 안 1. 어느 안이든 plan의 상대방 정보 안내 문장(승인 후)은 입력 영역 위에 항상 보인다.

### D-7. 메뉴 항목 위치와 사이트맵 등록 방식

| 구분 | 안 1 (권장): 운세 그룹에 허브 항목 하나(`/fortune/compatibility`)를 "별자리 운세" 다음, "사주" 앞에 넣는다. 띠 궁합·별자리 궁합 주소는 `sitemap.ts`에 따로 더한다 | 안 2: 운세 그룹에 허브·띠 궁합·별자리 궁합 3개 항목을 넣는다 | 안 3: 안 1과 같되 "사주" 뒤(맨 끝)에 넣는다 |
|---|---|---|---|
| 메뉴 길이 | 운세 5개 | 운세 7개. 헤더 드롭다운이 길어진다 | 운세 5개 |
| 사이트맵 | 허브는 `MENU_LIST`로, 하위 두 주소는 꿈 해몽 소재 주소처럼 `sitemap.ts`에 목록을 더한다 | `MENU_LIST`만으로 다 들어간다 | 안 1과 같음 |
| 운세 허브 목록 | 운세 허브(`/fortune`)는 운세 그룹 items를 그대로 보여 주므로 궁합 카드 하나가 생긴다 | 카드 3개가 생긴다 | 카드 하나 |
| 기존 규칙 | 운세 AC-88 "사주는 마지막"을 지킨다 | 지킨다(사주 앞에 넣을 때) | 운세 AC-88과 단위 테스트 "마지막 항목은 사주"를 바꿔야 한다 |

권장: 안 1. AC-3("메뉴에서 궁합 항목을 누르면 허브")과도 맞는다.

### D-8. 홈 문구 영향

홈 설계(`docs/home-reposition/design.md` 4.3)의 그룹 설명 규칙: 금지 표현 없음, 다른 그룹 라벨 넣지 않음, 운세 설명에 "사주" 없음. 홈 금지 표현 목록은 보장, 적중, 확률, 반드시, 틀림없, 100%, 1등, 예측이다.

| 구분 | 안 1 (권장): 운세 그룹 설명만 "생년월일로 보는 오늘의 운세, 띠별·별자리 운세와 궁합"으로 바꾼다. `HOME_TITLE`, `HOME_DESCRIPTION`, `HOME_HERO_DESCRIPTION`은 그대로 | 안 2: 홈 문구를 하나도 바꾸지 않는다 |
|---|---|---|
| 장점 | 홈에서 궁합 진입을 알 수 있다. 4.3 규칙을 모두 지킨다("궁합"은 다른 그룹 라벨이 아니다) | 홈 SEO와 홈 테스트에 변화가 없다 |
| 단점 | 홈 상수 파일이 아직 커밋 전이라 홈 재구성 작업과 같은 파일을 고친다(11장) | 홈에서 궁합이 보이지 않는다 |

권장: 안 1. 홈 title·description은 배포 1~2주 뒤 유입 확인 계획(`docs/TODO.md` 5번)이 있으므로 건드리지 않는다.

---

## 1. 폴더 구조

안 C(D-1) 기준. 새 파일은 "신규", 기존 파일 변경은 "변경"으로 적는다.

```
src/app/fortune/compatibility/
  layout.tsx                       # 신규. 궁합 범위 동의 Provider로 감싼다 (D-2 안 1). h1·문구 없음
  page.tsx                         # 신규. 허브 (서버)
  tti/page.tsx                     # 신규. 띠 궁합 (서버 page + 클라이언트 root)
  star-sign/page.tsx               # 신규. 별자리 궁합

src/features/fortune/
  compatibility-hub/components/
    root.component.tsx             # 신규. FortuneCompatibilityHubComponent (서버). 두 페이지 링크 + 허브 가이드
  compatibility-tti/components/
    root.component.tsx             # 신규. FortuneCompatibilityTtiComponent (클라이언트 경계, 게이트 + 지연 로드)
    panel.component.tsx            # 신규. 두 사람 입력 흐름 + 결과 (동의 뒤에만 로드)
    guide.component.tsx            # 신규. 관계 규칙·관계 유형 설명·등급 규칙 (서버)
  compatibility-star-sign/components/
    root.component.tsx             # 신규
    panel.component.tsx            # 신규
    guide.component.tsx            # 신규
  shared/components/
    compatibility-person-step.component.tsx   # 신규. 한 사람 입력 단계(기존 입력 폼·시각 입력·후보 선택·음력 확인을 묶음)
    compatibility-result.component.tsx        # 신규. 두 이름, 관계 이름, 등급, 설명 문단 (띠·별자리 공용)
    compatibility-disclaimer.component.tsx    # 신규. 기존 상시 면책 + 궁합 과학적 근거 없음 문장 (서버)
    compatibility-input-notice.component.tsx  # 신규. 상대방 정보 안내 + 궁합 연령 안내 (서버)
    consent.provider.tsx           # 변경. 범위 prop 추가 (기본 운세)
    consent-gate.component.tsx     # 변경. Provider가 내려 준 범위별 문구를 폼·거부 화면에 넘긴다
    consent-form.component.tsx     # 변경. 문구 묶음 선택 prop (기본 운세 문구)
    consent-declined.component.tsx # 변경. 문구 묶음 선택 prop (기본 운세 문구)
    age-blocked.component.tsx      # 변경. 문구 묶음 선택 prop (기본 운세 문구)
  hooks/
    use-compatibility-flow.hook.ts # 신규. 두 사람 판정 흐름 (기존 createFortuneBirthFlowReducer 재사용)
    use-fortune-consent.hook.ts    # 변경 없음 (가장 가까운 Provider를 읽는다)
  services/
    fortune-consent-storage.service.ts  # 변경. 범위별 저장 키·문구 버전 선택 인자 (기본 운세)
  constants/
    fortune-compatibility-route.constant.ts      # 신규. 허브·띠·별자리 경로
    fortune-compatibility-tti.constant.ts        # 신규. 띠 관계 규칙 목록, 관계 우선순위, 관계 이름, 등급 연결
    fortune-compatibility-star-sign.constant.ts  # 신규. 별자리별 원소, 원소 관계 규칙, 관계 이름, 등급 연결
    fortune-compatibility-grade.constant.ts      # 신규. 등급 3단계 키와 이름
    fortune-compatibility-copy.constant.ts       # 신규. 관계 유형 문단(띠 6, 별자리 4)
    fortune-compatibility-same-copy.constant.ts  # 신규. 같은 띠 12, 같은 별자리 12 전용 문단 (클라이언트 결과에서만 import)
    fortune-compatibility-notice.constant.ts     # 신규. 궁합 동의·거부·연령 안내·면책 추가 문장·상대방 정보 안내·결과 고지
    fortune-compatibility-consent.constant.ts    # 신규. 궁합 동의 문구 버전, 저장 키 접미사
    fortune-compatibility-guide.constant.ts      # 신규. 허브·띠·별자리 가이드 문단, 관계 정의 문장, 허브 목록 항목
    fortune-compatibility-faq.constant.ts        # 신규. 허브·띠·별자리 FAQ
    fortune-compatibility-seo.constant.ts        # 신규. 페이지별 SEO 값, Breadcrumb 단계
    fortune-compatibility-copy-rule.constant.ts  # 신규. 궁합 추가 금지 표현 (검사 전용, 화면 코드는 import 금지)
  types/
    fortune-compatibility.type.ts  # 신규. 관계·원소·등급·문구 묶음·조합 키·흐름 상태 타입
    fortune.type.ts                # 변경. 동의 범위 타입 추가
  utils/
    fortune-compatibility.util.ts  # 신규. 조합 키 만들기, 관계 판정, 등급 판정, 문구 연결 (순수 함수)

src/constants/menu.constant.ts       # 변경. 운세 그룹에 궁합 허브 항목 추가 (D-7 안 1)
src/constants/menu-icon.constant.ts  # 변경. 궁합 아이콘 이름 등록 (lucide-react)
src/constants/home.constant.ts       # 변경 (D-8 안 1). 운세 그룹 설명에 "궁합" 추가
src/app/sitemap.ts                   # 변경. 궁합 하위 두 주소 추가
src/app/terms/page.tsx               # 변경. 7번 절에 궁합 문단 추가
src/app/privacy/page.tsx             # 변경. 1번, 2번, 10번 절에 궁합 문장 추가

unit/fortune/compatibility-rule.test.ts   # 신규 (QA). 관계·원소·등급·78조합·판정 일치
unit/fortune/compatibility-flow.test.ts   # 신규 (QA). 입력 검증, 연령, 경계일, 순서 무관
unit/fortune/compatibility-copy.test.ts   # 신규 (QA). 금지 표현, 합니다체, 고지 원문, 저장·전송 코드 없음
unit/fortune/fortune-copy.test.ts         # 변경 (QA). 운세 메뉴 항목 기대값에 궁합 추가
unit/home/home-copy.test.ts               # 변경 (QA). 운세 하위 href 기대값에 궁합 추가
e2e/compatibility.spec.ts                 # 신규 (QA)

docs/compatibility/copy-log.md       # 신규 (문구 작성 때). 8.5
COMPLIANCE.md                        # 변경. 8.4 표
```

이름 규칙
- 컴포넌트: `FortuneCompatibility<화면><역할>Component` (예: `FortuneCompatibilityTtiPanelComponent`). root는 `FortuneCompatibilityHubComponent`, `FortuneCompatibilityTtiComponent`, `FortuneCompatibilityStarSignComponent`.
- 상수: `FORTUNE_COMPATIBILITY_` 접두사. 타입: `FortuneCompatibility...Type`.
- 페이지: `FortuneCompatibilityPage`, `FortuneCompatibilityTtiPage`, `FortuneCompatibilityStarSignPage`, 레이아웃 `FortuneCompatibilityLayout`.

---

## 2. 데이터 저장 위치

| 데이터 | 위치 | 이유 |
|---|---|---|
| 띠 관계 규칙(육합 6쌍, 삼합 4조, 방합 4조, 충 6쌍, 원진 6쌍), 관계 우선순위, 관계 이름 | 코드 상수 (`fortune-compatibility-tti.constant.ts`) | 모두에게 같고 바뀌지 않는 전통 규칙이다 |
| 12별자리 원소, 원소 관계 규칙 | 코드 상수 (`fortune-compatibility-star-sign.constant.ts`) | 같음 |
| 등급 3단계 이름, 관계 → 등급 연결 | 코드 상수 | 서비스 자체 규칙. 배포 때만 바뀐다 |
| 관계 유형 문단, 같은 조합 전용 문단, 가이드, FAQ, 고지 문구, SEO 값 | 코드 상수 | 모두에게 같은 승인 문구다. 단위 테스트가 import해서 검사한다 |
| 두 사람의 생년월일, 음력 여부, 태어난 시각 | React 메모리 (입력 폼의 react-hook-form 상태와 흐름 훅의 reducer 상태) | 저장하지 않는다(plan 범위, AC-11). 브라우저 저장소, URL, 전역 store, 분석 이벤트, console에 넣지 않는다 |
| 각 사람의 판정 결과(띠 또는 별자리 키, 1~2월 출생 여부, 시각 모름일 때 다른 후보 키) | React 메모리 (흐름 훅 상태) | 결과를 그리는 데 필요한 최소값이다. 판정이 끝나면 그 사람의 생년월일은 흐름 상태에서 버린다 |
| 궁합 결과(관계, 등급, 문구 연결) | 저장하지 않음. 렌더링 중 계산 | 두 키로 계산되는 값이라 상태로 만들지 않는다(`code-style.md`) |
| 궁합 이용 동의 | sessionStorage 키 하나: `<NEXT_PUBLIC_SITE_ENG_NAME>_fortune_compatibility_consent_v1` | 운세와 같은 방식(탭을 닫으면 사라짐). 값은 운세와 같은 세 필드(형식 버전, 동의한 문구 버전, 동의 시각)뿐이다. 생년월일·나이·연령 판정 결과는 넣지 않는다. 운세 키(`_fortune_consent_v1`)와 분리한다(D-2) |
| 궁합 동의 문구 버전 | 코드 상수 (`FORTUNE_COMPATIBILITY_CONSENT_VERSION`, 값은 동의 문구 승인일) | 문구를 바꾸면 값을 바꿔 기존 동의를 무효로 만든다(운세와 같은 규칙) |

localStorage, IndexedDB, Supabase는 쓰지 않는다. 회원가입이 없고 서버에서 갱신하거나 공유하는 데이터가 없다.

---

## 3. API 계약

없음. 궁합 계산은 모두 브라우저에서 한다. 입력값을 서버로 보내는 요청을 만들지 않는다.

## 4. DB 스키마

없음. 테이블, 마이그레이션, RLS 변경이 없다.

---

## 5. 프론트 구조

### 5.1 페이지 (서버/클라이언트 구분)

| 경로 | 페이지 | 렌더링 | 내용 |
|---|---|---|---|
| `/fortune/compatibility` | `FortuneCompatibilityPage` | 서버 전체. 클라이언트 경계 없음 | h1, 상시 면책(+궁합 문장), 두 페이지 링크 목록, 허브 가이드, 기존 띠별·별자리 운세 링크(F-8), FAQ, 상세 이용 안내. 동의 게이트와 입력칸이 없다. 동의 상태를 만들거나 지우지 않는다 |
| `/fortune/compatibility/tti` | `FortuneCompatibilityTtiPage` | 서버 page + 클라이언트 root 하나 | 서버: h1, 면책, 입력 안내, noscript 안내, 결과 하단 안내, 가이드(관계 규칙·관계 유형 설명·등급 규칙), 계산 기준, FAQ, 상세 이용 안내, 동의 다시 설정. 클라이언트: 동의 게이트 → 입력 흐름 → 결과 |
| `/fortune/compatibility/star-sign` | `FortuneCompatibilityStarSignPage` | 같음 | 같음. 가이드는 원소표·원소 관계·등급 규칙 |

세 페이지 모두 `src/app/fortune/layout.tsx`(운세 Provider) 안, 그리고 `src/app/fortune/compatibility/layout.tsx`(궁합 Provider) 안에 있다. 궁합 페이지의 게이트·동의 다시 설정은 궁합 Provider를 읽는다.

### 5.2 컴포넌트 트리

허브 `/fortune/compatibility`
- `ContentWrapperComponent` (운세 그룹 색)
  - `JsonLdComponent`: BreadcrumbList(홈 > 운세 > 궁합 테스트), FAQPage(FAQ가 있을 때만)
  - `TitleWrapperComponent`: h1 "궁합 테스트" + 설명 한 줄
  - `FortuneCompatibilityDisclaimerComponent`: 기존 `FORTUNE_DISCLAIMER_TEXT` + 궁합 과학적 근거 없음 문장
  - `FortuneCompatibilityHubComponent`
    - 목록 h2 + 기존 공용 `MenuListComponent`(항목 2개: 띠 궁합, 별자리 궁합. 항목 데이터는 궁합 상수의 메뉴 항목 형태 목록. `MENU_LIST`에서 읽지 않는다)
    - 허브 가이드 h2·문단 (plan "페이지가 답해야 할 질문" 3개)
    - 내 띠·내 별자리 확인 링크 (F-8: `/fortune/tti`, `/fortune/star-sign`)
  - `FortuneFaqComponent` (궁합 허브 FAQ)
  - `FortuneDetailNoticeComponent` (기존)

띠 궁합 `/fortune/compatibility/tti` (별자리 궁합도 같은 구조)
- `ContentWrapperComponent`
  - `JsonLdComponent`: BreadcrumbList(홈 > 운세 > 궁합 테스트 > 띠 궁합), FAQPage
  - `TitleWrapperComponent`: h1 "띠 궁합"
  - `FortuneCompatibilityDisclaimerComponent` (서버)
  - `FortuneCompatibilityInputNoticeComponent` (서버): 상대방 정보 안내 + 궁합 연령 안내
  - `FortuneNoscriptNoticeComponent` (기존, 서버)
  - `FortuneCompatibilityTtiComponent` (클라이언트 경계)
    - `FortuneConsentGateComponent` (기존, 궁합 Provider를 읽는다. checking 스켈레톤 / 궁합 동의 화면 / 궁합 거부 화면 / 통과)
      - 통과 시에만 지연 로드(ssr 끔): `FortuneCompatibilityTtiPanelComponent`
        - 흐름 훅 `useCompatibilityFlow` (띠 판정 함수 `determineFortuneTti`, `resolveFortuneTtiWithTime` 전달)
        - 단계 "첫 번째 사람" / "두 번째 사람": `FortuneCompatibilityPersonStepComponent`
          - 기존 `FortuneBirthFormComponent` (양력·음력, 검증, 오류 문구)
          - 기존 `FortuneLunarConfirmComponent` (음력 입력 시)
          - 기존 `FortuneBirthTimeFormComponent` (입춘 당일이면 시각 질문)
          - 기존 `FortuneCandidateChoiceComponent` (시각 모름이면 두 후보)
        - 연령 안내: 기존 `FortuneAgeBlockedComponent` (궁합 문구 묶음 전달)
        - 결과: `FortuneCompatibilityResultComponent`
          - 두 띠 이름(입력 순서대로), 관계 이름, 등급 이름, 설명 문단(요약 + 잘 맞는 점 + 조율하면 좋은 점), 오락 고지 한 줄
          - 1~2월 출생자가 있으면 기존 `FORTUNE_CALC_BASIS_TTI` 안내 + 띠별 운세 링크(확정 답변 3번)
          - 시각 모름으로 후보를 고른 사람이 있으면 기존 `FORTUNE_TIME_UNKNOWN_NOTICE` + 다른 후보로 보기 버튼(확정 답변 4번 "두 별자리를 모두 안내". 띠의 입춘 당일도 같은 방식)
          - 다시 입력 버튼(처음 상태로)
  - 결과 하단 안내: 궁합 결과 고지 + 기존 상담전화 목록 (5.4 참고)
  - `FortuneCompatibilityTtiGuideComponent` (서버): 관계 정의, 관계 규칙 목록, 관계 유형 문단 6개, 등급 규칙과 기준 설명
  - `FortuneCalcBasisComponent` (기존, 띠·시각 모름 항목)
  - `FortuneFaqComponent` (띠 궁합 FAQ)
  - `FortuneDetailNoticeComponent` (기존)
  - `FortuneConsentResetComponent` (기존, 궁합 Provider의 reset을 부른다)

별자리 궁합은 판정 함수 `determineFortuneStarSign`, `resolveFortuneStarSignWithTime`을 넘기고, 결과에 두 별자리의 원소와 원소 관계를 보여 준다. 1~2월 안내는 없다. 계산 기준은 `FORTUNE_CALC_BASIS_STAR_SIGN`.

### 5.3 상태 위치

- 동의 상태: 궁합 Provider(Context, `useReducer`). 저장은 sessionStorage 서비스. 서버 렌더와 첫 클라이언트 렌더는 checking으로 같게 그린다(기존 방식).
- 흐름 상태: 패널 안 `useCompatibilityFlow`의 `useReducer` 하나. 단계는 "첫 번째 사람 입력 중", "두 번째 사람 입력 중", "결과", "연령 안내" 네 가지다.
  - 사람마다 기존 운세 판정 reducer(`createFortuneBirthFlowReducer`)에 위임한다. 그래서 만 나이 판정(`calculateFortuneManAge`가 `FORTUNE_MIN_AGE` 14 미만이면 차단), 날짜 검증(`resolveFortuneBirth`), 입춘·절기 경계 판정, 표 범위 밖 처리가 운세와 같다.
  - 어느 한 사람이라도 만 14세 미만이면 전체 상태를 "연령 안내"로 바꾸고 두 사람의 입력·판정 값을 모두 버린다. 연령 안내 화면에서는 다시 입력 장치를 두지 않는다(운세와 같음). 어느 사람이 미만인지 알리지 않는다.
  - 한 사람의 판정이 끝나면 그 사람의 생년월일은 상태에서 지우고 키와 표시용 표식(1~2월 출생, 다른 후보)만 남긴다.
  - 다시 입력: 처음 상태로 돌아간다. 연령 안내에서는 무시한다.
  - 다른 후보로 보기: 결과 단계에서 그 사람의 키를 다른 후보로 바꾼다.
- 결과: 두 키로 렌더링 중 계산한다(관계 판정 → 등급 → 문구 연결). 상태로 두지 않는다.
- 입력 초안: 기존 입력 폼 내부(react-hook-form). 단계가 바뀌면 폼이 새로 만들어져 비어 있다.
- 오늘 날짜: 기존 `useKoreaDateKey` 훅(KST).
- 전역 store, URL 쿼리, React Query는 쓰지 않는다.

### 5.4 규칙 함수와 데이터 구조 (확정)

조합 키
- 두 키를 각 목록의 순서(띠는 `FORTUNE_ZODIAC`의 쥐부터 돼지, 별자리는 `FORTUNE_STAR_SIGNS`의 순서)로 정렬해 "앞-뒤" 형태 문자열로 만든다. 같은 키면 "쥐-쥐"처럼 같은 키 두 개다. 입력 순서를 바꿔도 같은 키가 나온다.
- 띠 78개, 별자리 78개 조합 키가 생긴다.

띠 관계 판정 (`fortune-compatibility.util.ts`)
- 관계 종류: 같은 띠, 육합, 삼합, 방합, 충, 원진, 그 밖의 관계.
- 우선순위: 같은 띠 > 육합 > 삼합 > 방합 > 충 > 원진 > 그 밖의 관계. 한 쌍이 여러 관계에 들면 앞의 것을 쓴다.
- 겹치는 쌍은 쥐-소, 말-양(육합과 방합) 두 개뿐이며 둘 다 육합이 된다. 충·원진은 다른 관계와 겹치지 않는다(리서치 5.1 표 기준. 단위 테스트로 확인).
- 규칙 목록 원본은 리서치 5.1 표를 그대로 옮긴다. 78조합 관계표(12×12의 순서 없는 쌍)는 이 목록에서 계산해 만든다. 표를 따로 손으로 쓰지 않는다(원본이 한 곳이라 출처 대조가 쉽고, 손으로 쓴 표와 목록이 어긋날 일이 없다).
- 예상 개수: 같은 띠 12, 육합 6, 삼합 12, 방합 10, 충 6, 원진 6, 그 밖의 관계 26. 합 78.

별자리 관계 판정
- 원소: 불(양·사자·사수), 흙(황소·처녀·염소), 공기(쌍둥이·천칭·물병), 물(게·전갈·물고기). 리서치 5.2 표 그대로.
- 원소 관계: 같은 원소, 보완(불+공기, 흙+물), 대립(불+물, 공기+흙), 그 밖의 관계(불+흙, 공기+물).
- 같은 별자리는 원소 관계가 "같은 원소"이고, 문구만 같은 별자리 전용 문단을 쓴다.
- 예상 개수: 같은 별자리 12, 서로 다른 같은 원소 12, 보완 18, 대립 18, 그 밖의 관계 18. 합 78.

등급 판정 (확정 답변 6번)
- 등급 키 3개와 이름: 잘 맞는 편 / 무난한 편 / 조율이 필요한 편.
- 띠: 육합·삼합·방합 → 잘 맞는 편. 충·원진 → 조율이 필요한 편. 그 밖의 관계와 같은 띠 → 무난한 편. 예상 개수 28 / 38 / 12.
- 별자리: 같은 원소(같은 별자리 포함)와 보완 → 잘 맞는 편. 대립 → 조율이 필요한 편. 그 밖의 관계 → 무난한 편. 예상 개수 42 / 18 / 18.
- 같은 띠를 "무난한 편", 같은 별자리를 "잘 맞는 편"으로 두는 것은 확정 답변 6번 문장을 그대로 적용한 결과다. 두 기능이 다르게 보일 수 있어 12장 Q-1로 확인한다.

문구 묶음 (D-4 안 1)
- 문구 묶음 하나 = 요약 1~2문장 + 잘 맞는 점 2개 + 조율하면 좋은 점 2개(행동 조언 형태). 합니다체.
- 띠: 관계 유형 6개 묶음(같은 띠 제외) + 같은 띠 12개 묶음.
- 별자리: 관계 유형 4개 묶음(같은 원소, 보완, 대립, 그 밖의 관계) + 같은 별자리 12개 묶음.
- 문구 연결 함수는 조합 키를 받아, 같은 키면 전용 묶음을, 아니면 관계 유형 묶음을 돌려준다. 78개 모두 묶음 하나로 연결돼야 한다.
- 두 사람을 부르는 말은 "두 분", "서로"처럼 중립으로 쓴다. 연인·가족·친구를 전제하지 않는다(확정 답변 10번).

결과 표시 항목 (AC-1, AC-2)
- 띠: 두 띠 이름, 관계 이름, 등급 이름, 설명 문단, 오락 고지.
- 별자리: 두 별자리 이름과 각 원소, 원소 관계 이름, 등급 이름, 설명 문단, 오락 고지.
- 점수, 퍼센트, 순위, 하트 개수 같은 수치 표현은 쓰지 않는다.

입력 검증과 오류 (AC-4)
- 날짜 검증과 오류 문구는 운세 것을 그대로 쓴다: 빈 칸, 달력에 없는 날짜, 1920-01-01 이전, 2028-12-31 이후, KST 오늘 이후, 윤달 없음, 음력에 없는 날, 표 범위 밖. 입력 가능 범위는 확정 답변 20번(하한은 운세와 같음, 상한은 올해)과 일치한다. 실제 상한은 절기 표 지원 마지막 연도(2028)와 KST 오늘 중 이른 쪽이다.
- 오류가 있으면 그 사람 단계에 머물고 결과를 만들지 않는다.

고지와 상담전화
- 결과 하단: 궁합 결과 고지(신규, 승인 필요) + 기존 상담전화 목록. 운세 결과 하단 컴포넌트(`FortuneResultNoticeComponent`)는 운세 문장이 고정이라, 문장 선택 prop을 더하거나 궁합 전용 하단 컴포넌트를 새로 둔다. frontend가 고르되 상담전화 상수(`src/constants/crisis-phone.constant.ts`)와 표시 컴포넌트는 그대로 재사용한다. 상담전화를 궁합에도 둘지는 12장 Q-2로 확인한다(권장: 둔다. `COMPLIANCE.md` 운세 항목 "결과 영역 아래에 항상"과 맞춘다).

### 5.5 운세 공유 구성 요소 재사용 정리

| 구성 요소 | 재사용 방식 | 변경 |
|---|---|---|
| `consent-gate.component.tsx` | 그대로. 가장 가까운 Provider(궁합)를 읽는다 | 범위별 문구 묶음을 폼·거부 화면에 넘기는 부분만 추가 |
| `consent-form.component.tsx` | 체크 항목 수는 문구 배열 길이를 따른다(지금도 배열로 그린다) | 문구 묶음 선택 prop. 없으면 `FORTUNE_CONSENT_TEXTS` |
| `consent-declined.component.tsx` | 그대로 | 문구 묶음 선택 prop. 없으면 `FORTUNE_DECLINED_TEXTS` |
| `age-blocked.component.tsx` | 그대로 | 문구 묶음 선택 prop. 없으면 `FORTUNE_AGE_BLOCKED_TEXTS` |
| `consent.provider.tsx`, `fortune-consent-storage.service.ts` | 범위별 저장 키·문구 버전 | 범위 prop·인자. 없으면 운세 |
| `consent-reset.component.tsx` | 그대로(문구가 범위와 무관) | 없음 |
| `use-birth-flow.hook.ts`의 `createFortuneBirthFlowReducer` | 사람마다 위임 | 없음 |
| 만 나이 판정 `calculateFortuneManAge`, `FORTUNE_MIN_AGE` | reducer 안에서 그대로 | 없음 |
| 띠 판정 `determineFortuneTti`, `resolveFortuneTtiWithTime`, 별자리 판정 `determineFortuneStarSign`, `resolveFortuneStarSignWithTime` | 그대로 전달 | 없음 |
| `FORTUNE_ZODIAC`, `FORTUNE_STAR_SIGNS`, 띠·별자리 키 타입 | 키·이름·순서 | 없음 |
| `birth-form`, `birth-time-form`, `candidate-choice`, `lunar-confirm` | 한 사람 단계 안에서 그대로 | 단계별 제목·라벨 구분이 꼭 필요하면 입력 폼에 선택 prop 하나를 더할 수 있다(기본값은 지금 그대로). UI 단계에서 정한다 |
| `disclaimer-notice`, `noscript-notice`, `detail-notice`, `calc-basis`, `faq` | 그대로 | 없음 |
| `fortune-copy-rule.constant.ts` | 궁합 문구 검사에 그대로 적용 | 없음. 궁합 추가 목록은 새 파일(8.2) |

운세 쪽 기본 동작(운세 문구, 운세 저장 키, 운세 버전)은 바뀌지 않아야 한다. 운세 단위·e2e 테스트가 그대로 통과하는 것이 확인 조건이다.

### 5.6 메뉴, 헤더, 홈, 운세 허브 영향

- `MENU_LIST` 운세 그룹 items: "별자리 운세" 다음, "사주" 앞에 궁합 허브 항목 하나를 넣는다(D-7 안 1). 항목 값 초안: 주소 `/fortune/compatibility`, 라벨 "궁합 테스트", 아이콘 lucide `Users`(하트 모양은 연애를 떠올리게 해서 피한다. 최종은 UI 단계), 색 `text-menu-fortune`, 설명 "두 사람의 생년월일로 띠 궁합과 별자리 궁합 보기.", 예시 "예: 친구와 서로의 띠가 어떤 관계인지 확인". 라벨·설명·예시는 승인 대상이다.
- `menu-icon.constant.ts`: 아이콘 이름 등록.
- 헤더(PC 드롭다운)와 모바일 메뉴: `MENU_LIST`를 읽으므로 코드 변경 없이 운세 하위가 5개가 된다.
- 운세 허브 `/fortune`: 운세 그룹 items를 그대로 목록으로 쓰므로 궁합 카드가 하나 생긴다. 운세 허브 SEO(title·description·keywords)와 가이드 문단은 바꾸지 않는다(이미 색인된 문구 보호).
- 홈 `/`: 홈은 그룹 라벨과 그룹 설명만 보여 준다. 하위 항목은 보이지 않는다. 그룹 설명은 D-8.
- 사이트맵: 허브는 `MENU_LIST`로 들어간다. 띠 궁합·별자리 궁합 주소는 `sitemap.ts`에서 궁합 경로 상수를 읽어 더한다(꿈 해몽 소재 주소와 같은 방식. 앱 계층이라 features import 허용). 기존 그룹 주소 순서 테스트(`unit/home/home-copy.test.ts`)는 그룹 주소의 상대 순서만 보므로 영향이 없다.
- OG 태그: 허브는 메뉴 라벨("궁합 테스트")이 자동으로 쓰인다. 하위 두 페이지는 `MENU_LIST`에 없으므로 `ogImage.tag`를 "띠 궁합", "별자리 궁합"으로 직접 넘긴다.

---

## 6. SEO

| URL | title (초안) | description (초안) | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/fortune/compatibility` | 궁합 테스트 - 띠 궁합과 별자리 궁합 무료로 보기 | 두 사람의 생년월일로 띠 궁합과 별자리 궁합을 무료로 볼 수 있습니다. 점수 대신 관계 유형과 설명으로 보여 드리며, 입력한 생년월일은 저장되지 않습니다. 오락·참고용 콘텐츠입니다. | BreadcrumbList(홈 > 운세 > 궁합 테스트), FAQPage(승인된 FAQ가 페이지에 있을 때만) | 예. `MENU_LIST` 운세 그룹 항목 |
| `/fortune/compatibility/tti` | 띠 궁합 - 두 사람의 띠로 보는 띠별 궁합 | 두 사람의 생년월일로 각자의 띠를 찾고 육합·삼합·방합·충·원진 관계로 띠 궁합을 보여 드립니다. 띠는 입춘 시각을 기준으로 나누며 입력한 생년월일은 저장되지 않습니다. 오락·참고용 콘텐츠입니다. | BreadcrumbList(홈 > 운세 > 궁합 테스트 > 띠 궁합), FAQPage | 예. `sitemap.ts`에 추가 |
| `/fortune/compatibility/star-sign` | 별자리 궁합 - 두 사람의 별자리 원소로 보는 궁합 | 두 사람의 생년월일로 각자의 별자리를 찾고 불·흙·공기·물 네 원소의 관계로 별자리 궁합을 보여 드립니다. 입력한 생년월일은 저장되지 않습니다. 오락·참고용 콘텐츠입니다. | BreadcrumbList(홈 > 운세 > 궁합 테스트 > 별자리 궁합), FAQPage | 예. `sitemap.ts`에 추가 |

- h1: "궁합 테스트", "띠 궁합", "별자리 궁합". 페이지마다 하나.
- keywords (plan 그대로): 허브 "궁합 테스트", "무료 궁합" / 띠 "띠 궁합", "띠별 궁합" / 별자리 "별자리 궁합".
- OG alt 초안: "두 사람의 띠 궁합과 별자리 궁합", "두 사람의 띠로 보는 띠 궁합", "두 사람의 별자리 원소로 보는 별자리 궁합".
- 메타데이터는 모두 `buildMetadata()`로 만든다. `pathname`은 `/`로 시작한다. canonical은 자기 주소. noindex 없음.
- 제목·설명·키워드·OG alt에 쓰지 않는 말: "연애 궁합"(확정 답변 17번), "이름 궁합", "혈액형 궁합", "MBTI 궁합", "사주 궁합", "사주", 그리고 8.2의 금지 표현 전체.
- 서버 HTML(D-5 안 1): h1, 면책, 입력 안내, 가이드(관계 정의, 규칙 목록, 관계 유형 문단 전체, 등급 규칙), 계산 기준, FAQ, 상세 이용 안내. 입력칸, 동의 화면, 개인 결과, 같은 조합 전용 문구는 서버 HTML에 없다.
- JSON-LD에는 정적 상수만 넣는다. 사용자 입력과 동의 상태를 넣지 않는다. 평점(AggregateRating)·리뷰는 넣지 않는다.
- 새 URL이라 redirect는 없다.

---

## 7. 보안

- RLS: 해당 없음(DB 없음).
- 시크릿·환경변수: 새 환경변수 없음. 저장 키 앞부분에 기존 `NEXT_PUBLIC_SITE_ENG_NAME`(공개해도 되는 사이트 영문 이름)을 쓴다. `README.md` 환경변수·API·테이블 표 변경 없음.
- 입력 검증: 기존 입력 폼의 zod 검증 + `resolveFortuneBirth`의 날짜 검증을 그대로 쓴다. 숫자만 받고 범위 밖은 결과를 만들지 않는다.
- XSS: 화면 문구는 모두 상수이고 React가 이스케이프한다. 입력값을 화면 문구나 HTML에 끼워 넣지 않는다(연령 안내에도 생년월일을 다시 보이지 않는다). `dangerouslySetInnerHTML`은 기존 JSON-LD 컴포넌트(정적 상수)만 쓴다.
- API 남용: 호출하는 API가 없어 rate limit 대상이 아니다.
- 브라우저 저장소: 동의 기록 세 필드만 sessionStorage에 둔다. 두 사람의 생년월일·시각·나이·판정 결과·궁합 결과는 어떤 저장소, 쿠키, URL, 분석·알림 이벤트, console에도 넣지 않는다.
- 상대방 정보: 입력자와 정보주체가 다르다. 서버로 보내지 않고 메모리에서만 쓰며, 결과 화면에 생년월일을 다시 보이지 않는다(띠·별자리 이름만 보인다).
- 단위 테스트로 확인(AC-11): 궁합 소스(궁합 페이지, 궁합 화면 폴더, 궁합 상수·훅·유틸)에 `localStorage`, `sessionStorage`(동의 저장 서비스 제외), `fetch`, `http` 인스턴스, axios import, `console` 호출이 없다.

---

## 8. 문구, 고지, 약관·방침, 금지 표현

### 8.1 고지 문구 위치와 재사용

| 문구 | 처리 | 상수 위치 |
|---|---|---|
| 상시 면책 | 기존 `FORTUNE_DISCLAIMER_TEXT` 재사용 + 궁합 문장 추가(확정 답변 15번). 초안: "띠와 별자리 궁합은 전통 이론과 대중 관례이며 과학적으로 검증되지 않았습니다." | 추가 문장은 `fortune-compatibility-notice.constant.ts` |
| 입력 미저장·상대방 정보 안내 | 신규. plan 초안 그대로: "입력하는 정보는 상대방의 것입니다. 입력하기 전에 상대방에게 궁합 확인에 쓴다는 것을 알리고 동의를 받았는지 확인해 주세요. 입력한 정보는 서버로 전송되거나 저장되지 않습니다." 승인 때 합니다체 통일 여부도 같이 정한다(12장 Q-3) | 같은 파일 |
| 연령 안내(입력 영역 위) | 신규. 운세 문장(`FORTUNE_AGE_INPUT_NOTICE`)의 "운세"를 "궁합"으로 바꾼 형태를 초안으로 한다 | 같은 파일 |
| 이용 전 확인 화면 | 신규 문구 묶음. 항목 4개(D-6 안 1): 만 14세 이상, 오락·참고와 본인 판단, 두 사람의 생년월일 미전송·미저장, 상대방에게 알리고 동의를 받음. 운세 문구의 "세 가지"(안내, legend, 막힘 안내)는 궁합에서 "네 가지"로 쓴다 | 같은 파일. 버전·저장 키는 `fortune-compatibility-consent.constant.ts` |
| 이용 불가 화면 | 신규 문구 묶음("궁합을 이용하실 수 없습니다" 형태) | `fortune-compatibility-notice.constant.ts` |
| 연령 안내 화면 | 신규 문구 묶음. 두 사람 중 누가 해당하는지 밝히지 않는 문장 | 같은 파일 |
| 결과 오락 고지(결과 안 한 줄, 결과 하단) | 신규. 초안: "궁합 결과는 오락과 참고를 위한 것이며, 두 사람의 관계나 앞으로의 일을 판단하는 근거가 아닙니다." | 같은 파일 |
| 계산 기준, 시각 모름, noscript, 상세 이용 안내 | 기존 승인 문구 재사용(`FORTUNE_CALC_BASIS_TTI`, `FORTUNE_CALC_BASIS_STAR_SIGN`, `FORTUNE_TIME_UNKNOWN_NOTICE`, `FORTUNE_NOSCRIPT_NOTICE`, `FORTUNE_DETAIL_NOTICE_ITEMS`) | 기존 `fortune-notice.constant.ts` (변경 없음) |
| 등급 규칙·출처 설명 | 신규 가이드 문단. 등급은 서비스 자체 규칙이고, 띠 관계표는 여러 명리 자료가 공통으로 쓰는 표를 바탕으로 했으며, 원진은 자료마다 조금 다르다는 점을 밝힌다(확정 답변 6, 8번) | `fortune-compatibility-guide.constant.ts` |

모든 신규 문장은 승인 전에 화면에 올리지 않는다(AC-9). 운세 승인 문구는 바꾸지 않는다.

### 8.2 금지 표현 추가 위치

- 새 파일 `src/features/fortune/constants/fortune-compatibility-copy-rule.constant.ts`(검사 전용). 파일 이름이 `-copy-rule.constant.ts`로 끝나 기존 소스 스캔 제외 규칙(`unit/helpers/source-scan.util.ts`)에 자동으로 들어간다. 화면 코드는 import하지 않는다.
- 궁합 추가 목록(확정 답변 16번): 결혼, 임신, 이별, 이혼, 바람, 운명의 상대, 천생연분, 100%. 메타 전용 추가: 연애 궁합, 이름 궁합, 혈액형 궁합, MBTI 궁합.
- 기존 `FORTUNE_FORBIDDEN_TERMS`, `FORTUNE_FORBIDDEN_PATTERNS`도 궁합 문구 전체에 그대로 적용한다. 궁합 파일이 `src/features/fortune/`, `src/app/fortune/` 아래에 있으므로 운세 소스 스캔 테스트(`unit/fortune/fortune-copy.test.ts`의 화면 코드·상수 한글 문자열 검사)가 자동으로 같은 목록을 검사한다.
- 문구 작성 때 주의(부분 일치 검사라 생기는 일):
  - "예측", "보장"은 부정문("예측하지 않습니다")으로도 쓸 수 없다(운세 테스트 규칙).
  - "바람"은 "바람직" 안에도 걸린다. "바람직하다"를 쓰지 않는다.
  - "반드시", "확실히", "무조건", "적중", "정확히 맞"도 금지다.
  - "사주"는 1차 궁합 문구에 쓰지 않는다.
- 기존 `fortune-copy-rule.constant.ts`는 고치지 않는다(운세 테스트의 금지 목록 대조에 영향이 없게).

### 8.3 약관·방침 추가 위치 (문구는 승인 대상)

- 약관 `src/app/terms/page.tsx`: 7번 "운세 서비스" 절 안에 궁합 문단 하나를 더한다. 새 절 번호를 만들지 않는다(뒤 절 번호가 밀리면 `COMPLIANCE.md`의 "Terms chapter 14", "chapter 9" 같은 참조가 틀어진다). 내용: 궁합은 운세 서비스의 일부이며 오락·참고 목적, 두 사람의 생년월일을 입력하며 상대방에게 알리고 동의를 받은 뒤 입력할 것, 입력값 미전송·미저장, 만 14세 미만이 포함되면 이용 불가, 궁합 이용 동의는 탭(sessionStorage)에만 저장, 결과는 관계를 판단하는 근거가 아님.
- 방침 `src/app/privacy/page.tsx`:
  - 1번 절: 운세 문단(95~98줄) 다음에 궁합 문단. 상대방 생년월일을 입력받지만 서버로 보내거나 저장하지 않고 브라우저 메모리에서만 쓰며 결과 화면에 다시 보이지 않음.
  - 2번 절 브라우저 저장소 목록: 운세 이용 동의 항목(128~131줄) 다음에 "궁합 이용 동의" 항목.
  - 10번 절 어린이: 운세 문단(254~258줄) 다음에 궁합 문장. 두 사람 모두 만 14세 이상인지 브라우저 안에서 확인하고 확인 결과를 저장하지 않음.
- 두 페이지의 시행일(`EFFECTIVE_DATE`, 지금 2026-11-23)을 바꿀지는 12장 Q-4.

### 8.4 COMPLIANCE.md 항목

| 장 | 추가 내용 |
|---|---|
| 1) Cookies, Consent, Privacy | Fortune 항목 아래 Compatibility(`/fortune/compatibility/*`) 한 줄: 두 사람의 생년월일·시각은 React 메모리에만, 저장 키는 `<site>_fortune_compatibility_consent_v1`(세 필드) 하나, 운세 동의와 분리 |
| 2) Age Gate | 궁합도 로또 AgeGate가 아닌 자체 이용 동의 게이트(만 14세)를 쓰며 두 사람 모두에 적용 |
| 7) Robots and SEO | 허브와 두 페이지는 색인 대상, sitemap 포함. 개인 결과와 같은 조합 전용 문구는 서버 HTML에 없음 |
| 11) Disclaimers | 새 하위 항목 Compatibility: 상시 면책 + 과학적 근거 없음 문장, 결과 고지, 점수 없음(등급 3단계, 서비스 자체 규칙), 관계 규칙 출처(리서치 5.1·5.2), 상대방 정보 안내와 동의 항목, 금지 표현 파일 위치와 검사 테스트, 로또 비연결, 관계 유형 선택 없음, 상담전화(Q-2 결정대로), 문구 작성 기록 `docs/compatibility/copy-log.md` |
| 11) Disclaimers 위험 수용 | 법률 검토 없음, 운영자 위험 수용. 항목: 상대방 정보 입력의 개인정보 처리 해당 여부, 개인정보보호법 제22조의2 적용 여부와 상대방 나이 확인 한계, 표시광고법 제3조(과장 표현), AI 작성 문구의 권리 귀속, AdFit 매체 정책(사행성 항목 해당 여부, 결과 아래 광고 배치, 미성년 대상 제한. 2026-11-24 사용자 위험 수용), 약관·방침 궁합 문구. 광고는 결과를 가리거나 잠그지 않음. Google AdSense는 이번 범위 밖 |

### 8.5 copy-log 작성 계획 (`docs/compatibility/copy-log.md`)

형식은 `docs/menu-meals/copy-log.md`를 따른다. 작성 이력은 문구 상수에 넣지 않고 이 문서에만 둔다.

- 작성 원칙 절: 외부 문장 미참조(경쟁 사이트의 궁합 문장·점수 설명·궁합표를 보지 않는다. 근거는 `plan.md`, 이 설계서, 리서치 5.1·5.2의 규칙만), 합니다체, 두 사람 중립 호칭, 가능성·행동 조언 표현("~한 편입니다", "~하면 좋습니다"), 금지 표현 목록(8.2), 자리 표시 없이 이름 없는 문장으로 쓰기, 점수·퍼센트·순위 표현 금지.
- 대상 표 열: 대상, 파일, 개수, 작성자, 작성일, 검수자, 검수일, 상태.
- 대상 목록:
  - 띠 관계 유형 문단 6묶음 (`fortune-compatibility-copy.constant.ts`)
  - 같은 띠 전용 12묶음 (`fortune-compatibility-same-copy.constant.ts`)
  - 별자리 관계 유형 문단 4묶음
  - 같은 별자리 전용 12묶음
  - 가이드 문단(허브, 띠, 별자리, 관계 정의, 등급 규칙·출처 설명)
  - FAQ(허브, 띠, 별자리. 운세처럼 페이지마다 5개 이상, 질문은 물음표, 답은 30자 이상을 권장)
  - 신규 고지 문구(8.1 표의 신규 항목)
  - 메뉴 항목 라벨·설명·예시, 허브 목록 항목 설명, SEO 값
  - 약관·방침 문단
- 순서: 샘플(띠 관계 유형 2묶음 + 같은 띠 2묶음 + 별자리 관계 유형 1묶음 + 같은 별자리 2묶음) → PM 검수 1차 → 나머지 작성 → PM 최종 검수 → 단위 테스트(금지 표현, 합니다체, 78조합 연결) 통과 확인 → 웹 검색 유사도 샘플 점검(못 하면 "한계" 절에 적는다).
- 작성자 표기: AI 어시스턴트. 검수자: PM. AI 작성 문구의 권리 귀속은 법률 확인 필요로 적는다.
- 출처 기록 절: 원진 6쌍은 리서치 5.1 표를 채택했고, 명리 카페 글(용-닭, 뱀-원숭이)과 차이가 있음을 적는다(확정 답변 8번). 별자리 보완·대립 관계의 출처가 대중 블로그뿐이라는 점도 적는다.
- 문구 작성 담당: frontend 문구 티켓(10장 FE-4). 상수 파일을 채우면서 copy-log를 같이 쓴다.

---

## 9. 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 띠 지지 관계 규칙(육합, 삼합, 방합, 충, 원진) | 전통 명리 이론. 리서치 5.1과 11장 출처 목록 | 사실·아이디어라 저작권 보호 대상이 아님. 표 형식과 문장은 옮기지 않고 다시 정리함 | 가능 |
| 원진 6쌍 선택 | 리서치 5.1 표(여러 사이트 공통), 차이 기록 | 위와 같음 | 가능 |
| 별자리 원소 분류 | 서양 점성술 관례, 한국어 위키백과 "삼궁(점성술)" 확인 | 사실 정보. 위키 문장은 옮기지 않음 | 가능 |
| 원소 보완·대립 관계 | 대중 블로그 관례(리서치 5.2, 확인 필요) | 사실 규칙만 사용, 문장 복사 없음 | 가능. 서비스 자체 규칙으로 화면에 밝힘 |
| 등급 3단계와 관계→등급 연결 | 서비스 자체 규칙(확정 답변 6번) | 프로젝트 소유 | 가능 |
| 궁합 문구 전체(관계 유형 문단, 같은 조합 문단, 가이드, FAQ, 고지) | 자체 작성(AI 어시스턴트 작성, PM 검수) | 권리 귀속은 법률 확인 필요. copy-log로 작성 기록을 남김 | 가능(위험 수용 항목에 기록) |
| 절기·음력 자료(띠·별자리 판정) | 한국천문연구원 공공데이터(기존 운세 자료 재사용) | 기존 `THIRD_PARTY_NOTICES.md` 기재 그대로 | 가능(기존 판단 그대로) |
| 메뉴 아이콘 | `lucide-react`(기존 의존성) | ISC | 가능. 새 라이브러리가 아니라 `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md` 갱신 없음 |
| 띠·별자리 그림 | 1차 설계에는 새 그림 없음. UI 단계에서 넣으면 인라인 SVG 자체 제작(`COMPLIANCE.md` 11장 타로 선례) | 프로젝트 소유 | 가능. 외부 아이콘 세트·이미지를 쓰면 라이선스 확인 필요 |
| 폰트 | 새 폰트 없음 | 해당 없음 | 해당 없음 |

새 라이브러리: 없음.

개인정보 처리: 상대방 생년월일을 화면에서 입력받는다(저장·전송 없음). 화면 입력 자체가 개인정보 처리인지, 제22조의2 적용 여부는 "법률 확인 필요"이며 운세와 같은 방식으로 운영자가 위험을 수용하는 것으로 기록한다(8.4).

광고: 새 광고 슬롯을 설계하지 않는다. 사이트 공통 광고 배치를 그대로 따르고, 결과를 광고로 가리거나 잠그지 않는다. AdFit 확인 항목은 위험 수용(plan 법적 항목).

로또: 궁합 화면·문구·메타에 로또 링크와 로또 단어를 넣지 않는다.

---

## 10. 담당별 작업 순서

- db: 없음.
- backend: 없음.
- frontend (의존 순서. 의존이 없는 티켓끼리는 파일이 겹치지 않아 동시에 할 수 있다):
  - FE-0 (선행 조건): 홈 재구성 변경분(`menu.constant.ts`, `home.constant.ts`, `page.tsx` 등 미커밋)이 커밋·병합된 뒤 시작한다.
  - FE-1: 운세 동의 구성 요소에 범위 추가(D-2 안 1). 대상: `consent.provider.tsx`, `consent-gate.component.tsx`, `consent-form.component.tsx`, `consent-declined.component.tsx`, `age-blocked.component.tsx`, `fortune-consent-storage.service.ts`, `fortune.type.ts`. 완료 조건: 범위를 넘기지 않은 운세 화면 동작이 그대로이고 운세 단위·e2e가 통과한다.
  - FE-2 (FE-1과 동시 가능): 궁합 타입, 경로·띠 규칙·별자리 원소·등급·동의 버전·저장 키 상수, 규칙 유틸(조합 키, 관계, 등급, 문구 연결). 문구 연결 함수는 FE-4 문구가 들어오면 완성된다.
  - FE-3 (FE-2 뒤): 두 사람 흐름 훅 `useCompatibilityFlow`.
  - FE-4 (FE-2 뒤, FE-3과 동시 가능): 문구 작성(관계 유형 문단, 같은 조합 문단, 가이드, FAQ, 신규 고지, SEO 값, 메뉴 항목 문구)과 `docs/compatibility/copy-log.md`. 샘플 → PM 검수 → 나머지(8.5). PM 승인 전 문구는 화면에 연결하지 않는다.
  - FE-5 (FE-1, FE-3, FE-4 뒤): 궁합 레이아웃, 페이지 3개, 화면 컴포넌트(허브, 띠·별자리 root·panel·guide, 공용 한 사람 단계·결과·면책·입력 안내, 결과 하단 안내).
  - FE-6 (FE-0, FE-2 뒤): 메뉴 항목, 아이콘 등록, 홈 운세 그룹 설명(D-8 결정대로), `sitemap.ts` 하위 주소 추가.
  - FE-7 (약관·방침 문구 PM 승인 뒤): `terms/page.tsx` 7번 절, `privacy/page.tsx` 1·2·10번 절, 시행일(Q-4 결정대로).
  - FE-8 (전체 뒤): `COMPLIANCE.md` 1·2·7·11장, `docs/TODO.md` 궁합 항목 상태. 담당 범위 밖이면 PM이 지정한다.
- QA (개발 뒤):
  - 기존 단위 테스트 기대값 갱신(FE-6과 같은 순서): `unit/fortune/fortune-copy.test.ts`의 운세 메뉴 href·label 목록 3곳(692~705줄, 1293~1300줄, 1312~1322줄)에 궁합 항목 추가. "마지막 항목은 사주"(1324~1331줄)는 D-7 안 1이면 그대로 통과한다. `unit/home/home-copy.test.ts`의 운세 하위 href 목록(33~38줄).
  - 새 단위 테스트(`[단위]` AC):
    - AC-5: 규칙 목록이 리서치 5.1 표와 같다. 78조합이 각각 관계 하나. 관계별 개수(같은 띠 12, 육합 6, 삼합 12, 방합 10, 충 6, 원진 6, 그 밖 26). 겹치는 두 쌍은 육합. 입력 순서를 바꿔도 같다. 등급 개수(28 / 38 / 12).
    - AC-6: 원소표가 리서치 5.2와 같다. 78조합 원소 관계 개수(같은 별자리 12, 같은 원소 12, 보완 18, 대립 18, 그 밖 18). 등급 개수(42 / 18 / 18).
    - 문구 연결: 띠 78, 별자리 78 조합 모두 문구 묶음 하나로 연결되고 묶음마다 요약·잘 맞는 점 2개·조율 2개가 비어 있지 않다. 같은 조합 24개는 전용 묶음이다.
    - AC-7: 흐름 reducer가 내는 키가 `determineFortuneTti`·`determineFortuneStarSign`·시각 판정 함수 결과와 같다. 입춘 전날·당일·다음 날, 별자리 12개 경계 날짜, 음력 입력을 포함한다.
    - AC-4: 2월 30일, 1919년, 2029년, KST 오늘 이후, 한 사람만 입력(두 번째 사람 빈 칸 제출)에서 결과 단계로 가지 않고 해당 오류 키가 나온다.
    - 연령: 어느 한 사람이라도 만 14세 미만이면 연령 안내 단계가 되고 두 사람의 값이 상태에 남지 않으며 다시 입력이 무시된다. 만 14세 생일 당일·전날 경계.
    - AC-8: 궁합 문구 전체(문구 묶음, 가이드, FAQ, 고지, SEO, 메뉴 항목)에 기존 금지 목록·패턴과 궁합 추가 목록이 없다. 합니다체(`unit/helpers/copy-check.util.ts`). "사주" 없음. 메타에 메타 전용 금지어 없음.
    - AC-9: 신규 고지 상수가 승인 원문과 글자 단위로 같다.
    - AC-11: 7장 소스 스캔.
    - 동의 분리: 궁합 저장 키가 운세 키와 다르고 저장 값은 세 필드뿐이다.
  - e2e `e2e/compatibility.spec.ts`(`[E2E]` AC, 데스크톱): AC-1, AC-2, AC-3(메뉴 → 허브 → 두 페이지), AC-12(동의 전 입력·결과 없음, 거부 시 이용 불가, 미성년 생년월일 시 연령 안내만). AC-10은 정적 항목이지만 운세 AC-15처럼 메타·canonical·JSON-LD·sitemap을 e2e로 확인해도 된다(QA 판단). 모바일 `@smoke`는 AC-3 하나.
  - 회귀: `e2e/fortune.spec.ts`(운세 동의 게이트 영향), `e2e/home.spec.ts`, 운세·홈 단위 테스트.

---

## 11. 파일 충돌 위험

- `src/constants/menu.constant.ts`, `src/constants/home.constant.ts`, `src/app/page.tsx`: 홈 재구성 작업이 미커밋 상태로 수정 중이다(`home.constant.ts`는 아직 추적 안 된 새 파일). 홈 재구성이 커밋·병합된 뒤 FE-6을 시작한다.
- `src/features/fortune/shared/components/consent-*.tsx`, `age-blocked.component.tsx`, `services/fortune-consent-storage.service.ts`, `types/fortune.type.ts`: 운세 전체가 쓰는 파일. FE-1 한 티켓에서만 고친다. 운세 쪽 다른 작업과 동시에 하지 않는다.
- `src/features/fortune/shared/components/birth-form.component.tsx`: 단계별 라벨이 필요해 선택 prop을 더하게 되면 운세 입력 화면 전체에 영향이 있다. FE-5에서만 고치고, 기본값은 지금 그대로 둔다.
- `src/features/fortune/shared/components/result-notice.component.tsx`: 문장 선택 prop을 더하는 쪽을 고르면 운세 결과 하단 전체에 영향이 있다(5.4). 기본값은 지금 그대로.
- `src/app/sitemap.ts`: 꿈 해몽 등 다른 기능도 주소를 더하는 파일. 한 줄 추가로 끝낸다.
- `src/constants/menu-icon.constant.ts`: 다른 메뉴 추가와 겹칠 수 있다.
- `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`: 모든 기능이 같이 쓰는 법적 문서. 시행일 변경이 다른 작업과 겹치지 않게 한다.
- `unit/fortune/fortune-copy.test.ts`, `unit/home/home-copy.test.ts`: 메뉴 항목 기대값이 고정돼 있어 메뉴를 바꾸면 반드시 같이 고쳐야 한다.
- `COMPLIANCE.md`, `docs/TODO.md`: 여러 기능 문서가 같이 고치는 파일.
- 기존 e2e의 운세 그룹 하위 항목 수 의존(grep 결과): e2e에는 운세 하위 항목 "개수"를 세는 검사가 없다. `e2e/fortune.spec.ts` AC-1은 운세 허브의 네 링크를 이름으로 찾고(궁합 카드가 생겨도 통과), AC-15는 운세 5개 주소 목록을 직접 갖고 있으며(영향 없음), `e2e/home.spec.ts`는 그룹 라벨만 본다(영향 없음). 개수·순서에 의존하는 것은 위 단위 테스트 두 파일이다.

---

## 12. 열린 질문 (PM 확인)

- Q-1. 같은 띠는 "무난한 편", 같은 별자리는 "잘 맞는 편"이 된다(확정 답변 6번을 그대로 적용한 결과). 그대로 둘지, 같은 띠도 "잘 맞는 편"으로 하거나 같은 별자리도 "무난한 편"으로 맞출지.
- Q-2. 궁합 결과 아래에도 운세처럼 상담전화 5곳을 둘지(권장: 둔다).
- Q-3. 상대방 정보 안내 초안의 "확인해 주세요"를 운세 문구처럼 "확인해 주시기 바랍니다"로 바꿀지(운세 문구는 합니다체로 통일돼 있다).
- Q-4. 약관·방침 시행일을 궁합 문구 반영일로 바꿀지, 지금 날짜를 유지할지.
- Q-5. 메뉴 라벨을 "궁합 테스트"(검색 키워드와 같음)로 할지 "궁합"으로 할지. h1·OG 태그·Breadcrumb 이름도 같이 정해진다.
- Q-6. US-4(띠별·별자리 운세를 보던 사용자가 궁합으로 넘어가기)를 위해 기존 띠별·별자리 운세 페이지에 궁합 링크를 둘지. 기능 목록 F-8은 궁합 → 운세 방향만 있어 이번 설계에는 넣지 않았다. 넣으면 운세 페이지 파일과 운세 문구 테스트가 바뀐다.
- Q-7. 결과의 "다른 후보로 보기"(시각 모름일 때 다른 띠·별자리로 바꿔 보기)는 확정 답변 4번 "두 별자리를 모두 안내"를 구현하는 방식으로 넣었다. 버튼 대신 두 결과를 나란히 보여 줄지는 UI 단계에서 정해도 되는지.
- Q-8. 검색량 확인(확정 답변 18번)은 배포 전 PM이 하고, 결과에 따라 title·keywords만 조정한다. 페이지 구조는 바꾸지 않는다는 전제로 진행해도 되는지.

## 확정 답변 (2026-11-24, 사용자 "C안, 나머지 권장대로")

- D-1: C안. `src/features/fortune/` 안에 궁합 화면 폴더(`compatibility-hub`, `tti`, `star-sign`)를 둔다. 주소는 `/fortune/compatibility`.
- D-2~D-8: 권장안 그대로.
- 열린 질문 1~8: 각 권장안으로 확정(같은 띠·별자리 등급 차이 유지, 상담전화 없음, 합니다체 안내, 시행일은 배포일에 한 번에, 라벨 "궁합 테스트", 운세 페이지에서 궁합 링크, "다른 후보로 보기" 버튼, 검색량 확인 뒤 title·keywords만 조정).
