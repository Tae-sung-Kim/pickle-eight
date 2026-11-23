# 운빨 뽑기 도구 리서치 (사다리 타기, 돌림판, 제비뽑기)

작성일: 2026-11-23
근거: `docs/TODO.md` 1번(운빨 뽑기 도구, 공용 돌림판 재사용), `docs/research/menu-meals.md`(형식 참고)
범위: 유사 서비스 UX, 공정성 방식, 한국 검색 수요, 법·정책, 재사용 자산, 페이지 구조. 코드는 건드리지 않았다.

확인 원칙: 출처를 찾지 못한 내용은 "확인 필요"로 적었다. 검색량 수치는 구하지 못했고 추정하지 않았다. 출처는 웹 검색 결과의 제목과 요약으로 확인했다. 원문 전체를 열어 읽지 않은 출처는 본문에 "검색 요약 기준"으로 표시했다.

## 1. 한 줄 요약

참가자 이름이나 항목을 넣고 무작위로 짝을 짓거나 순서·당첨을 정하는 오락용 도구 묶음이다. 사다리 타기는 이름과 결과를 선으로 잇고, 돌림판은 여러 항목 중 하나를 고르고, 제비뽑기는 순서나 당첨을 나눈다. 세 도구 모두 "모임에서 누가 할지 정하기"라는 같은 쓰임을 가진다.

## 2. 핵심 개념 (처음 보는 사람 기준)

- 사다리 타기(아미다쿠지, 영문: Ghost leg): 세로선 여러 개 위에 이름을 쓰고, 아래쪽에 결과를 쓴다. 가로선을 따라 내려가면 이름과 결과가 이어진다. 가로선 하나는 옆 세로선 두 개의 자리를 맞바꾸는 것과 같다.
- 돌림판(룰렛형 원판): 칸마다 항목이 있고 바늘이 가리킨 칸이 당첨이다. 칸 크기를 다르게 하면 당첨 확률이 달라진다(가중치).
- 제비뽑기: 같은 수의 표(또는 카드)를 섞어 한 장씩 고르는 방식. 순서 정하기, 당번 정하기에 쓴다.
- 편향 없는 뽑기(uniform): 모든 결과가 같은 확률로 나오는 것.
- 모듈로 편향(modulo bias): 임의의 큰 수를 작은 범위로 줄일 때 생기는 치우침. 예를 들어 0~9를 3으로 나눈 나머지로 바꾸면 0, 1, 2의 확률이 같지 않다.
- 거절 샘플링(rejection sampling): 치우침이 생기는 끝부분 값을 버리고 다시 뽑는 방법. 치우침을 없애는 대표 방법이다.
- 피셔-예이츠 셔플(Fisher-Yates shuffle): 목록의 모든 순열이 같은 확률로 나오도록 섞는 표준 방법. 1938년 원형이 나왔고, 1964년 Durstenfeld가 컴퓨터용으로 고쳤다.

## 3. 규칙과 관례

공식 규칙이 있는 분야가 아니다. 아래는 관례다.

- 사다리: 가로선은 바로 옆 세로선 두 개만 잇고, 다른 가로선과 닿지 않는다. 같은 높이에서 가로선이 겹치거나 인접하지 않는다. 출처: https://en.wikipedia.org/wiki/Ghost_leg (관례 설명), 한국 사다리 도구 설명 다수.
- 돌림판: 칸 크기가 같으면 균등 확률, 칸 크기가 다르면 가중치다. 사용자가 확률을 보고 싶어 하면 칸 크기를 확률과 맞춘다(roberin.com 설명, 검색 요약 기준).
- 제비뽑기: 뽑힌 항목은 다시 뽑지 않는 "중복 없이 뽑기"가 기본이다. 일부 도구는 당첨 항목을 목록에서 빼는 옵션을 둔다(moamoang.co.kr 등, 검색 요약 기준).
- 팀 나누기: 팀 인원 차이는 최대 1명으로 두는 것이 흔하다(sonkkeutlab.com 설명, 검색 요약 기준).

## 4. 유사 서비스 조사 (항목 1)

조사한 서비스는 대부분 회원가입 없이 쓰는 무료 웹이다. 인원·항목 한계와 공유 방식은 각 사이트 소개 문구 기준이다. 직접 써 보지 않았으므로 실제 동작은 "확인 필요"로 표시했다.

### 4-1. 사다리 타기

| 서비스 | 인원·항목 한계 | 결과 입력 | 공유 | 재추첨·공개 방식 |
|---|---|---|---|---|
| playcloud8.com/play/ladder | 2~100명 | 입력 | 공유 링크 복사, 링크를 받은 사람만 열람 | 확인 필요 |
| teck-tani.com/ko/ladder-game | 2~20명 | 입력 | 카카오톡·SNS 공유 버튼 | 확인 필요 |
| ladder.iamit.co.kr | 최대 20명 | 입력 | 시드 번호로 저장·재불러오기 | 확인 필요 |
| jjam.kr/ladder | 확인 필요 | 이름·결과 입력 | "결과 공유" 기능 | "전체 공개"로 결과 일괄 표시 |
| ladder.cora1022.com | 2~30명 | 입력 | 언급 없음 | 결과 가리기 기능 |
| mangul.kr/game/ladder | 2~10명 | 입력 | 언급 없음 | 확인 필요 |
| moamoang.co.kr/ladder-game | 2~10명 | 입력 | 화면 공유 권장(원격 회의용) | 확인 필요 |
| toolhub.co.kr/games/ladder | 최대 6명 | 입력 | 언급 없음 | 확인 필요 |
| mintelly.com/p/ladder-game.html | 확인 필요 | 벌칙 등 입력 | 언급 없음 | 한 번에 공개 |

출처: 5절 출처 목록의 사다리 도구 항목(검색 요약 기준).

### 4-2. 돌림판

| 서비스 | 항목 한계 | 특징 | 공유 |
|---|---|---|---|
| getin.kr/tools/game/roulette | 최대 20개 | 항목별 가중치, 로그인 없음 | 확인 필요 |
| random.gg/wheel | 확인 필요 | 회원가입 없음 | 링크 공유 |
| roberin.com/random-roulette-spinner | 2~100개 | 당첨 확률 미리 표시, 중복 없이 뽑기, 전체화면 | 확인 필요 |
| teck-tani.com/ko/spin-wheel | 확인 필요 | 가중치, 여러 줄 일괄 입력 | 링크에 항목·가중치를 담아 같은 돌림판 재현 |
| lucky-roulette.net/ko | 확인 필요 | 회원가입 없음 | URL 공유 |
| tools.victor-jk.com/roulette | 최대 30개 표시 | 한 줄에 항목 하나 | 확인 필요 |
| moamoang.co.kr/roulette | 최대 100개(검색 요약 기준) | 확률 설정, 당첨 항목 빼기, 색, 회전 시간 | 설정은 브라우저에만 저장, 서버 전송 없음 |

### 4-3. 제비뽑기·팀 나누기

| 서비스 | 기능 |
|---|---|
| joanna-hash.github.io/RandomTeam | 이름과 조별 인원수(예: 4, 4, 3)를 넣고 편성 |
| tools.devcomma.com/calculators/random-group-arrangement | 같은 조 묶기, 다른 조 나누기, 특정 인원 고정, 조 잠금 후 재편성, 조장 추첨, 결과 복사·이미지 저장. 기능이 가장 많음 |
| gazet.ai/tools/team-maker | 팀 개수 기준과 팀당 인원 기준 모두 지원, 결과 복사. 명단을 서버로 보내지 않는다고 소개 |
| sonkkeutlab.com/tools/random-picker | 당첨자 뽑기, 팀 나누기, 발표 순서, 랜덤 숫자를 한곳에서. 팀 인원 차이 최대 1명 |
| jwaytools.com/random-picker | 랜덤 숫자, 목록 추첨, 순서 섞기, 동전 던지기 |
| miniwebtool.com/random-group-generator | Fisher-Yates 셔플 사용을 명시 |

### 4-4. 공통 패턴과 차이

- 입력: 줄바꿈으로 여러 항목을 한 번에 붙여넣는 방식이 흔하다.
- 인원 한계: 대부분 10~30명, 일부 100명. 돌림판은 칸 글자를 보여 주는 한계가 있다(8절 참고).
- 공유: 설정을 URL에 담는 방식과 카카오톡 공유 버튼이 있다. URL에 담으면 이름 목록도 URL에 남는다(7-3 참고).
- 재추첨: "당첨 항목 빼기"나 "중복 없이 뽑기"로 순서 정하기에 맞춘다.
- 결과 연출: 일괄 공개, 한 명씩 공개, 결과 가리기가 있다.
- 차별화 후보(기획 판단, 출처 기반 아님): (1) 세 도구를 한 사이트에서 같은 화면 규칙으로 쓰기, (2) 입력을 서버에 보내지 않는다는 점을 화면에 명시하기, (3) 모바일에서 한 손으로 쓰기 쉬운 입력 줄, (4) 결과 가리기와 한 명씩 공개를 기본으로 두기. 실제 우위는 경쟁 서비스를 직접 써 본 뒤 확인 필요.

## 5. 공정성 (항목 2)

### 5-1. 난수 방식: `crypto.getRandomValues` vs `Math.random`

- MDN은 `Crypto.getRandomValues()`가 암호학적으로 강한 난수를 채운다고 설명한다. 정수형 배열에 값을 채우는 방식이고, 보안 컨텍스트(HTTPS)에서 쓸 수 있는 API다. 출처: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
- MDN은 `Math.random()`을 암호용이 아닌 난수로 본다. 출처: 같은 MDN 페이지.
- V8 블로그는 `Math.random()`이 xorshift128+를 쓰며 암호학적으로 안전하지 않다고 밝히고, 암호용 값에는 `crypto.getRandomValues`를 쓰라고 권한다. 출처: https://v8.dev/blog/math-random
- 2차 자료(블로그)는 xorshift128+의 내부 상태를 몇 개의 출력으로 복원할 수 있다고 주장하지만, 필요한 출력 개수는 자료마다 다르다(3~4개, 5개 이하, 64~128개 등). 확인 필요. 결론은 같다. 추첨의 공정성을 말하려면 `Math.random`보다 `crypto.getRandomValues`가 낫다.
- 적용 판단: 이 서비스는 돈이 걸리지 않는 오락이라 법적으로 암호 수준이 요구되지는 않는다. 그래도 "조작이 어렵다"는 설명을 붙이려면 `crypto.getRandomValues` 쪽이 맞다. 최종 선택은 설계 담당.

### 5-2. 편향 없는 정수 뽑기 (모듈로 편향)

- 원리: 난수 원본이 0~255처럼 정해진 범위일 때, 원하는 범위(예: 0~9)로 나머지 연산을 하면 앞쪽 숫자가 더 자주 나온다. 원본이 아무리 고르더라도 나눠 떨어지지 않으면 생기는 문제다. 출처: https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/ , https://romailler.ch/2020/07/28/crypto-modulo_bias_guide/
- 해결: 나눠 떨어지는 최대 구간을 넘는 값은 버리고 다시 뽑는다(거절 샘플링). 예시: 16개 값을 6개 칸으로 나누면 12 이상은 버린다(출처: Kudelski 가이드 설명). 더 빠른 방법으로 곱셈과 시프트를 쓰는 방식도 있다(Lemire, https://arxiv.org/pdf/1805.10941). 구현 선택은 설계 담당.
- 주의: 경계 값을 한 칸 잘못 잡으면 치우침이 다시 생긴다. Cryptocat 사례가 이 실수를 보여 준다(출처: Kudelski 가이드 설명, 검색 요약 기준).
- 순서 정하기에 주는 의미: Fisher-Yates 셔플은 각 자리에서 고르는 정수가 편향되면 결과 순열도 편향된다. 따라서 셔플에도 같은 정수 뽑기 규칙을 써야 한다.

### 5-3. Fisher-Yates 셔플 (순서 정하기, 제비뽑기)

- 모든 순열이 같은 확률로 나오는 방식이다. 출처: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle , https://raw.org/book/algorithms/fisher-yates-shuffle/
- 뒤에서부터 한 칸씩 정해 가며 남은 목록에서 하나를 골라 자리를 바꾸는 방식이 표준이다(Durstenfeld 방식, O(n)).
- 주의: 고르는 범위 경계를 한 칸 잘못 잡으면 Sattolo 셔플이 되어 순환 순열만 나온다. 출처: raw.org 설명(검색 요약 기준).

### 5-4. 사다리 생성 알고리즘

- 원리: 가로선 하나는 이웃한 두 세로선의 자리를 맞바꾼다. 가로선을 위에서 아래로 차례로 적용하면 자리 이동이 된다. 어떤 짝짓기든 이웃 자리 맞바꿈의 순서로 만들 수 있으므로, 참가자와 결과가 일대일로 대응하는 사다리를 항상 만들 수 있다. 출처: https://en.wikipedia.org/wiki/Ghost_leg , https://amida-san.com/en/blog/what-is-amidakuji
- 가로선을 무작위로 놓는 방식의 편향: 한국 사다리 도구 설명 글(seq.kr)은 4명일 때 왼쪽 끝이 약 29%, 오른쪽 끝이 약 20%로 나온다고 계산했다. 같은 글은 가로선을 늘려도 편향이 완전히 사라지지 않는다고 설명한다. 이 수치는 2차 블로그 계산이므로 확인 필요. 원리(무작위 가로선은 시작 위치에 따라 결과 확률이 달라질 수 있다)는 다른 도구 설명(youtil.kr, ladder.iamit.co.kr)과 맞는다.
- 권장 방식(출처 두 곳이 같은 방향): 결과를 먼저 균등하게 섞고(5-3), 그 대응에 맞게 가로선을 채운다. 남는 가로선은 무작위로 넣되 같은 높이의 인접 가로선은 금지한다. 출처: https://seq.kr/blog/ladder-game-fairness-bias , https://youtil.kr/tools/life/ladder (검색 요약 기준)
- 이 방식의 장점: 가로선을 어떻게 그리든 결과 분포는 균등하다. 다만 그림이 뽑힌 결과에 맞춰 그려지므로, 화면에 보이는 그림만으로 결과를 미리 알 수 있는지는 기획에서 따로 정한다.
- 검증 가능한 기준(기획 AC 후보): (a) 가로선이 항상 이웃한 세로선 두 개만 잇는다, (b) 같은 높이에서 가로선이 겹치거나 인접하지 않는다, (c) 모든 참가자가 서로 다른 결과에 도달한다, (d) 많은 횟수(예: 수만 번) 시뮬레이션에서 결과 분포가 균등에 가깝다. (d)는 단위 테스트로 자동 검증할 수 있다. 허용 오차는 기획·설계에서 정한다.

### 5-5. 돌림판 공정성

- 칸 크기가 같으면 균등 확률이다. 칸 크기를 다르게 하면 가중치다. 가중치를 쓰면 확률을 화면에 밝히는 도구(roberin.com)가 있고, 설정만 두고 숨기는 도구도 있다. 확률을 밝히는 쪽이 오해를 줄인다는 것이 관례로 보인다(확인 필요: 공식 지침은 찾지 못함).

## 6. 한국 검색 수요와 키워드 (항목 3)

### 6-1. 조사 결과

- 검색량 수치는 구하지 못했다. 네이버 검색광고 키워드 도구에서 직접 조회해야 한다(확인 필요). 이전 메뉴 룰렛 리서치와 같은 방법이다.
- 키워드 후보(검색 의도별 분류는 기획 판단):

| 의도 | 키워드 후보 |
|---|---|
| 사다리 | 사다리타기, 사다리 게임, 사다리타기 게임, 사다리타기 온라인, 사다리 타기 당번 |
| 돌림판 | 돌림판, 돌림판 룰렛, 룰렛 돌리기, 랜덤 룰렛, 룰렛 돌리기 온라인 |
| 제비뽑기 | 제비뽑기, 랜덤 뽑기, 랜덤 추첨, 당첨자 뽑기 |
| 팀·조 | 팀 나누기, 조 편성, 랜덤 팀짜기, 조 편성기 |
| 순서 | 순서 정하기, 발표 순서 정하기, 당번 정하기 |

- 주의 키워드: "사다리 내기", "내기 룰렛" 같은 검색어는 금전 내기 의도가 있다. 검색 노출을 노린다면 이 검색어는 피해야 한다(7-1 참고). 확인 필요: 검색량과 실제 검색 결과 구성.
- 기존 사이트와 겹침: `/meal`(메뉴 룰렛)이 이미 돌림판 형식을 쓴다. "룰렛 돌리기"처럼 의도가 겹치는 검색어는 `/meal`과 경쟁한다. 설계 시 정식 주소(canonical)와 페이지 역할을 나눠야 한다(9-3 참고).

### 6-2. 경쟁 구도

- 4절의 사이트 대부분이 단일 도구 사이트다. 세 도구를 묶은 사이트는 이번 조사에서 확인하지 못했다(확인 필요).
- 대형 포털의 검색 결과에서 바로 실행되는 사다리·룰렛 위젯 존재 여부는 확인하지 못했다(확인 필요).

## 7. 법·정책 주의 (항목 4)

### 7-1. 사행성 오인 (내기·도박)

- 사행행위 등 규제 및 처벌 특례법 제2조: "사행행위"는 여러 사람에게서 재물이나 재산상 이익을 모아, 우연적 방법으로 득실을 정해 재산상 이익이나 손실을 주는 행위다. 요건은 세 가지로 읽힌다: (가) 재물 모으기, (나) 우연으로 승패 결정, (다) 재산상 이익·손실. 세 요건 중 하나라도 없으면 해당하지 않는다. 출처: https://www.law.go.kr/LSW//lsSideInfoP.do?lsiSeq=257335&joNo=0002&joBrNo=00&docCls=jo&urlMode=lsScJoRltInfoR , 해설 https://www.lawtalk.co.kr/posts/138301 (검색 요약 기준)
- 같은 조는 영리 목적으로 "회전판돌리기", "추첨", "경품" 등 사행심을 일으킬 방법을 쓰는 영업을 사행행위업의 한 종류로 든다. 돌림판이 바로 해당한다는 뜻은 아니지만, 돈을 받거나 돈을 걸고 돌리면 문제가 된다. 확인 필요: 재물 없이 무료로 돌리는 웹 도구가 이 조문의 사행행위업에 해당하지 않는다는 해석은 법률 확인이 필요하다. 이 리서치는 법률 자문이 아니다.
- 판례: 대법원 2013. 9. 13. 선고 2011도17909 판결은 현상업도 우연적 방법으로 득실을 정하는 사행행위여야 한다고 보았다(검색 요약 기준, 원문 확인 필요).
- 적용 판단: 이 서비스는 재물을 받지 않고, 결과에 상품·포인트·경품을 붙이지 않으면 세 요건 중 (가)가 빠진다. 다만 "벌칙 뽑기", "밥 내기" 같은 문구는 내기로 읽힐 수 있다. 다른 사이트 중에도 "내기 사다리"를 쓰는 곳이 많아 사용자 인식 위험이 있다.
- 광고와 연결: 7-2의 AdFit 기준은 사행성 콘텐츠를 명시적으로 금지한다. 제비뽑기·사다리가 도박 콘텐츠로 분류될 가능성은 낮지만, 심사에서 "사행성"으로 읽히는 문구는 피한다.

### 7-2. 광고 정책 (카카오 AdFit 매체 운영정책)

- AdFit 매체 운영정책은 콘텐츠 가이드라인 위반 페이지에 광고를 게재할 수 없다고 정하고, 금지 항목에 "사행성 / 사금융 관련 콘텐츠"를 둔다. 예시로 도박, 복권판매, 경마, 경륜, 카지노가 든다. 출처: https://adfit.kakao.com/web/html/use.html (현재 운영정책, 검색 요약 기준), 구 경로 https://adfit.kakao.com/web/html/old/use.html
- 이전 버전 정책에도 같은 항목이 있다(https://adfit.kakao.com/web/html/old/20221012/use_kakao.html, 검색 요약 기준).
- 콘텐츠 위반 시 광고 중단이나 이용 제한이 될 수 있고, 매체 심사 단계에서 반려될 수 있다.
- 무효클릭 관련: 광고처럼 보이는 링크 배치, 클릭을 유도하는 화살표나 문구는 금지 취지가 있다(`docs/research/menu-meals.md` 4-1절 정리 참고). 운빨 도구의 결과 버튼 주변에 광고 영역을 붙이지 않는다.
- 확인 필요: 카카오 디벨로퍼스 운영정책은 사행성 서비스(도박, 복권 등)를 금지된 내용으로 규정한다(https://developers.kakao.com/terms/ko/site-policies, 검색 요약 기준). 이 서비스는 해당 서비스가 아니지만, 심사자가 "사행" 단어에 반응할 수 있으므로 화면 문구를 정리한다.

### 7-3. 개인정보 (이름 입력)

- 개인정보보호위원회 기준: 개인정보는 살아 있는 개인을 알아볼 수 있는 정보다. 처리하는 자(운영자) 입장에서 알아볼 수 있는지로 판단한다. 이름은 개인정보로 분류되는 것이 일반적이다. 출처: https://www.privacy.go.kr/front/contents/cntntsView.do?contsNo=27 , PIPC 지식센터(https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS292&mCode=C050010000&nttId=10667, 검색 요약 기준)
- 일부 칼럼은 흔한 이름 하나만으로는 식별이 어렵다고 본다(공식 자료 아님, 확인 필요). 학교, 학년 같은 속성이 붙으면 식별 가능성이 높아진다.
- 이 서비스에 주는 의미:
  - 이름을 서버로 보내거나 저장하지 않으면 운영자가 개인정보를 처리하는 부담이 작다. 기존 메뉴 룰렛과 운세의 원칙(입력은 브라우저 메모리에만, localStorage·쿠키·URL 저장 금지, 분석 이벤트 제외)을 따르면 같은 원칙을 쓸 수 있다. `COMPLIANCE.md` 1절의 기존 문구 형식을 참고한다.
  - 공유를 위해 URL에 이름을 넣으면 개인정보가 URL에 남는다. 이는 기존 원칙과 충돌하므로 피하거나 기획에서 따로 정한다(열린 질문).
  - 학급 명단처럼 아동의 이름을 넣는 사용을 가정하면 개인정보 위험이 커진다. 사용 대상에 학생을 넣을지 기획에서 정한다. 확인 필요: 아동 관련 추가 규정.
  - 개인정보처리방침에 "이름은 저장하지 않는다"는 문장을 넣을지 기존 방침과 맞춰 확인해야 한다.

### 7-4. 저작권

- 사다리 타기, 돌림판, 제비뽑기는 일반 규칙이고 아이디어다. 아이디어 자체는 저작권으로 보호되지 않는다는 것이 국내 판례의 기본 입장이다(아이디어·표현 이분법). 출처: 법제처 판례 https://www.law.go.kr/LSW/precInfoP.do?precSeq=70658 (검색 요약 기준)
- 주의: 2019년 대법원 판결(2017다21205, 게임 사건)은 구성요소를 선택·배열한 방식이 창작적 개성이면 보호될 수 있다고 봤다. 출처: 법률 칼럼 https://www.legaltimes.co.kr/news/articleView.html?idxno=48090 (2차, 검색 요약 기준). 따라서 다른 사이트의 규칙 설명 문장, 화면 구성, 칸 디자인, 문구를 그대로 가져오지 않는다.
- 결론: 규칙은 자유롭게 쓸 수 있다. 문구, 화면, 아이콘, 샘플 데이터(예: 이름 목록)는 직접 쓴 것만 쓴다. 외부 아이콘이나 이미지를 쓰면 라이선스를 확인하고 `THIRD_PARTY_NOTICES.md`에 적는다.
- 법률 확인 필요: 위 판례의 적용 범위(화면 구성 전체 복제 여부 판단)는 법률 검토 대상이다.

### 7-5. 오락 목적 고지와 보상

- 기존 `/meal`과 같은 형식으로 둔다: 결과는 무작위이며 추천이나 평가가 아니다, 금전·상품·포인트·경품 등 보상과 무관한 오락이다. 출처: `COMPLIANCE.md` 11절 메뉴 룰렛 항목(프로젝트 내부 기준).
- 공식 규정은 찾지 못했다(확인 필요). 이는 프로젝트 내부 관례다.

## 8. 재사용 자산 (항목 5)

### 8-1. 공용 돌림판 `src/components/common/roulette.component.tsx`

현재 워킹 트리에 변경이 있어 커밋된 기준과 다르다(git 상태: 해당 파일과 `src/types/roulette.type.ts`가 수정됨, `unit/shared/roulette.test.ts`와 `docs/roulette-common/`이 새 파일). 기획 시작 전에 API가 확정되었는지 확인한다.

현재 API 요약(코드 주석 기준):

| 속성 | 역할 | 기본값과 제한 |
|---|---|---|
| `items` | 칸 목록(`key`, `label`, 선택 `colorClassName`) | 칸 색이 없으면 번갈아 칠함 |
| `targetIndex` | 멈출 칸 (null이면 멈춘 채) | 범위 밖이면 회전하지 않음 |
| `spinId` | 바뀔 때마다 새로 회전 | 칸 구성이 바뀌면 각도 0으로 리셋 |
| `onSpinEnd` | 연출 끝(동작 줄이기에서도 한 번 호출) | 선택 |
| `accentClassName` | 당첨 칸 면·테두리·바늘 색 | 비우면 점심(메뉴) 색 |
| `spinDurationSec` | 회전 시간 | 0.5~1.0초만 허용, 그 외 1.0초 |
| `spinTurns` | 바퀴 수 | 1~5 정수만 허용, 그 외 2 |

재사용 판단 메모:
- 칸 글자는 항목 수가 28개 이하일 때만 보인다(코드 상수 `SMALL_LABEL_MAX`). 12개 이하일 때 글자가 크다. 29개 이상이면 칸에 글자가 나오지 않으므로, 돌림판 도구의 항목 한계는 28개가 자연스럽다(확인 필요: 화면 확인).
- 래퍼가 `aria-hidden="true"`다. 결과를 글자로 따로 알려 주는 영역(예: 결과 텍스트, 라이브 영역)이 필요하다. 접근성 기준에서 중요하다.
- 동작 줄이기 설정을 지원한다. 연출이 끝나면 `onSpinEnd`를 반드시 한 번 호출한다.
- `accentClassName`으로 도구별 테마 색을 바꿀 수 있다. 단, `docs/conventions/design-system.md`의 메뉴 색 규칙(확인 필요: 운빨 도구용 색을 정했는지)을 따른다.
- 칸 색은 `colorClassName`으로 칸마다 지정 가능하다. 디자인 토큰 색만 쓰도록 `design-guard.js` 규칙을 따른다(`CLAUDE.md` 하네스 절).
- 칸 크기를 따로 받는 API가 없으므로, 가중치 기능이 필요하면 API 확장이 필요하다(설계 담당이 정함).

### 8-2. 사다리 타기: 별도 컴포넌트 필요

- 돌림판과 모양이 달라 공용 돌림판으로는 만들 수 없다. 세로선, 가로선, 결과 경로를 그리는 별도 컴포넌트가 필요하다.
- 재사용할 수 있는 것: 디자인 토큰 색 규칙, 동작 줄이기 처리 방식, 결과 텍스트 영역 패턴.
- 결과 연출(한 줄씩 따라 내려가기, 결과 가리기)은 새로 만든다.

### 8-3. 제비뽑기: 돌림판 재사용 여부

- 제비뽑기는 돌림판보다 카드 뒤집기나 목록 공개가 자연스럽다. 돌림판을 쓰면 "뽑기 같지 않다"는 인상이 생길 수 있다. 기획에서 결정한다.
- 순서 정하기는 돌림판을 칸 순서 표시용으로 쓸 수 있다.

## 9. 페이지 구조와 SEO (항목 6)

### 9-1. 기존 규칙

- 새 페이지는 `buildMetadata()`로 메타를 만들고, 구조화 데이터는 `src/components/seo/json-ld.component.tsx`를 쓴다. 사이트맵은 `MENU_LIST`에 등록한다. 검색에 노출될 설명·FAQ는 서버 렌더링으로 HTML에 들어가야 한다. 한 페이지에 `h1`은 하나다. (출처: `docs/conventions/seo.md`)
- URL은 소문자와 하이픈을 쓴다. 기존 주소 예시: `/tarot/daily`, `/fortune/saju`, `/dream/<slug>`. 기존 주소가 바뀌면 301을 둔다.
- Google 문서는 URL에 독자가 검색하는 언어의 단어를 쓰고, 필요하면 음역하라고 권한다. 단어는 하이픈으로 구분한다. 출처: https://developers.google.com/search/docs/crawling-indexing/url-structure (검색 요약 기준)
- 같은 문서는 주소 단어가 순위에 주는 영향이 작다고 보는 것이 안전하다. 키워드를 주소에 억지로 넣을 필요는 없다(확인 필요: 이 점을 밝힌 정확한 문구의 위치).

### 9-2. 구조 후보

| 구조 | 장점 | 단점 |
|---|---|---|
| A. 한 페이지(`/lucky-draw`)에 세 도구 탭 | 주소 하나로 관리, 사이트 메뉴 한 항목 | 키워드마다 다른 제목·설명을 줄 수 없음, 검색 결과가 세 도구를 뭉뚱그림 |
| B. 허브 + 도구별 페이지 (`/lucky-draw` 허브, 예: `/lucky-draw/ladder`, `/lucky-draw/roulette`, `/lucky-draw/lots`) | 도구마다 제목·설명·FAQ·구조화 데이터를 따로 가짐, 키워드별 검색 노출이 명확 | 페이지가 4개, 공통 원칙을 여러 곳에 적용 |
| C. 도구별 짧은 주소(`/ladder`, `/wheel`, `/lots`) | 주소가 짧음 | 기존 규칙(주제별 묶음 경로)과 다름, 다른 메뉴와 충돌 가능성 확인 필요 |

권장(기획 판단): B. 기존 사이트의 `/tarot/*`, `/fortune/*`처럼 허브와 세부 페이지 구조를 따른다. 도구별 페이지의 `h1`은 검색 키워드(사다리타기, 돌림판, 제비뽑기)를 반영하고, 세 도구가 같은 원칙(입력 저장 없음, 오락 고지)을 쓴다는 문장을 허브에 둔다.

### 9-3. 주의할 SEO 이슈

- `/meal` 룰렛과 `/lucky-draw/roulette`가 같은 검색 의도("룰렛 돌리기")를 다룰 수 있다. 두 페이지의 제목·설명·FAQ를 다르게 쓰고, 메뉴 추천 관련 내용은 `/meal`에만 둔다. 같은 돌림판 화면을 두 페이지에 그대로 놓지 않는다.
- 도구 페이지의 설명과 FAQ는 서버 HTML에 있어야 검색에 잡힌다. 돌림판과 사다리 화면 자체는 클라이언트에서 그려도 된다.
- 구조화 데이터: `SoftwareApplication` 또는 `WebApplication` 형식은 Google이 지원한다. 다만 `aggregateRating`이나 `review` 중 하나가 필요하다는 조건이 있고, 가짜 평점은 Google 품질 지침 위반이다. 평점은 넣지 않는다. 출처: https://developers.google.com/search/docs/appearance/structured-data/software-app , https://developers.google.com/search/docs/appearance/structured-data/sd-policies (검색 요약 기준)
- 보이지 않는 내용을 구조화 데이터로 표시하면 안 된다. FAQ 구조화 데이터는 실제로 보이는 FAQ만 넣는다(`seo.md` 기존 규칙과 같다).
- 사이트맵과 검색 등록: 신규 페이지는 `comingSoon`으로 먼저 두고 공개 시점에 등록하는 방식이 기존 관례다(`seo.md`).

## 10. 출처 목록

공정성·난수
- https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
- https://v8.dev/blog/math-random
- https://cipher.ink/learn/random-numbers (2차)
- https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
- https://romailler.ch/2020/07/28/crypto-modulo_bias_guide/
- https://arxiv.org/pdf/1805.10941 (Lemire, 빠른 정수 구간 뽑기)
- https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
- https://raw.org/book/algorithms/fisher-yates-shuffle/

사다리 알고리즘
- https://en.wikipedia.org/wiki/Ghost_leg
- https://amida-san.com/en/blog/what-is-amidakuji
- https://dev.to/smallwebtoolsnotes/why-the-ladder-game-amidakuji-never-gives-two-people-the-same-prize-flo
- https://seq.kr/blog/ladder-game-fairness-bias (2차 블로그, 수치 확인 필요)
- https://youtil.kr/tools/life/ladder

경쟁 서비스 (소개 문구 기준, 직접 사용 확인 전)
- https://playcloud8.com/play/ladder
- https://teck-tani.com/ko/ladder-game
- https://ladder.iamit.co.kr/
- https://jjam.kr/ladder/
- https://ladder.cora1022.com/
- https://mangul.kr/game/ladder
- https://moamoang.co.kr/ladder-game/
- https://www.toolhub.co.kr/games/ladder
- https://www.mintelly.com/p/ladder-game.html
- https://getin.kr/tools/game/roulette/
- https://www.random.gg/wheel
- https://roberin.com/random-roulette-spinner/
- https://teck-tani.com/ko/spin-wheel
- https://lucky-roulette.net/ko
- https://tools.victor-jk.com/roulette/
- https://moamoang.co.kr/roulette/
- https://joanna-hash.github.io/RandomTeam/
- https://tools.devcomma.com/calculators/random-group-arrangement
- https://gazet.ai/tools/team-maker
- https://sonkkeutlab.com/tools/random-picker/
- https://jwaytools.com/random-picker/
- https://miniwebtool.com/random-group-generator/

법·정책
- https://www.law.go.kr/LSW//lsSideInfoP.do?lsiSeq=257335&joNo=0002&joBrNo=00&docCls=jo&urlMode=lsScJoRltInfoR (사행행위 등 규제 및 처벌 특례법 제2조)
- https://www.lawtalk.co.kr/posts/138301 (사행행위 해설, 2차)
- https://adfit.kakao.com/web/html/use.html (AdFit 운영정책)
- https://adfit.kakao.com/web/html/old/use.html (AdFit 구 경로)
- https://developers.kakao.com/terms/ko/site-policies (카카오디벨로퍼스 운영정책)
- https://www.privacy.go.kr/front/contents/cntntsView.do?contsNo=27 (개인정보 포털)
- https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS292&mCode=C050010000&nttId=10667 (PIPC 지식센터)
- https://datalaw.kr/posts/not-personal-info-defense/ (2차 정리)
- https://www.law.go.kr/LSW/precInfoP.do?precSeq=70658 (저작권 판례)
- https://www.legaltimes.co.kr/news/articleView.html?idxno=48090 (게임 규칙 저작권 칼럼, 2차)

SEO
- https://developers.google.com/search/docs/crawling-indexing/url-structure
- https://developers.google.com/search/docs/appearance/structured-data/software-app
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies

프로젝트 내부
- `docs/TODO.md`, `docs/research/menu-meals.md`, `docs/conventions/seo.md`, `docs/conventions/tech-stack.md`, `COMPLIANCE.md`, `src/components/common/roulette.component.tsx`, `src/types/roulette.type.ts`

## 11. 열린 질문과 사용자 선택지

기획 전에 사용자가 정할 항목이다.

1. 페이지 구조: A(한 페이지 탭), B(허브 + 도구별 페이지, 권장), C(짧은 주소) 중 무엇인가.
2. 도구 주소 이름: 영문 짧은 말(`ladder`, `roulette`, `lots`)을 쓸지, 다른 이름을 쓸지. 한글 주소는 공유 시 길어지므로 피하는 쪽이 낫다는 것이 기존 리서치 판단이다.
3. 이름 입력 저장: (가) 브라우저 메모리에만 두고 새로고침하면 사라짐(기존 원칙), (나) localStorage에 저장해 재방문 때 복원. (나)를 고르면 개인정보처리방침과 `COMPLIANCE.md` 수정이 필요하다.
4. 공유 방식: (가) 설정을 URL에 담기(이름이 URL에 남으므로 개인정보 원칙과 충돌, 권장하지 않음), (나) 결과를 이미지로 저장, (다) 카카오톡 공유(공유 SDK 추가, 새 라이브러리 승인 필요), (라) 공유 기능 없음.
5. 결과 연출: 일괄 공개, 한 명씩 공개, 결과 가리기 중 기본값과 선택 옵션.
6. 재추첨: 당첨 항목을 빼고 다시 뽑는 옵션을 둘지(순서 정하기에 필요).
7. 가중치(칸별 확률): 1차에서 뺄지 넣을지. 넣으면 `roulette.component.tsx` API 확장이 필요하고, 확률을 화면에 밝혀야 한다. 사행성 오인 위험을 줄이려면 1차 제외를 권한다(기획 판단).
8. 인원·항목 한계: 사다리 최대 인원(경쟁 서비스는 10~100명 범위), 돌림판 최대 항목(글자 표시 한계 28개 기준), 제비뽑기 최대 개수.
9. 벌칙 문구: "벌칙 뽑기"(예: 설거지 담당)를 허용할지. 돈이나 음식 내기 표현은 금지하는 것을 권한다. 허용 범위는 법률 확인 필요 항목이다.
10. 사용 대상: 학급·학생 명단 입력을 기대하는지. 아동 이름이 들어오면 개인정보 위험이 커진다.
11. 결과 예측 방지: 사다리 결과가 그림만 보고 알 수 있는지 여부를 기획 AC에 넣을지.
12. 공정성 설명: "결과는 암호학적 난수로 정한다"처럼 설명을 화면에 넣을지. 넣는다면 검증 가능한 문장만 쓴다.
13. 기존 `/meal` 룰렛과의 역할 구분: 돌림판 도구는 "항목 자유 입력" 전용으로 두고 메뉴 룰렛은 `/meal`에 남길지.
14. 운빨 도구의 색 테마(`accentClassName`)와 `design-system.md`의 메뉴 색 규칙: 새 색을 정할지.
15. 검색량 조회: 네이버 검색광고 키워드 도구로 위 키워드 목록을 직접 조회할지. 결과를 받아야 키워드를 확정할 수 있다.
16. 법률 검토 여부: 사행성 해석(재물 없는 무료 돌림판), 화면 구성 저작권, 아동 개인정보는 이전 기능처럼 위험 수용으로 넘길지, 전문가 검토를 받을지.
17. 사다리 공정성 검증: 단위 테스트에서 많은 횟수 시뮬레이션으로 분포를 확인하는 기준(허용 오차)을 정할지.
