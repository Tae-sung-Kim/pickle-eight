# 타로 리서치

작성일: 2026-11-04
작성: researcher
용도: planner가 `docs/tarot/plan.md`를 쓸 때 입력으로 쓴다.
범위: 도메인 지식, 데이터 목록, 시장 사례, 저작권, 법적 고지, 구현 관점 힌트. 기술 구현 방식은 쓰지 않는다.

표시 규칙
- "관례"는 공식 규칙이 아니라 리더들 사이의 통상 방식이다. 타로에는 공식 규칙이 없다.
- "확인 필요"는 이번 조사에서 근거를 확보하지 못한 항목이다.
- "법률 확인 필요"는 상업 서비스에 쓰기 전에 전문가 확인을 권하는 항목이다.
- 본 문서는 법률 자문이 아니다.

---

## 0. 기존 코드·문서 현황

- `src/features/tarot/tarot-dev-guide.md`에 카드 구성, 스프레드 3종, 데이터 예시가 이미 있다. 이 문서는 그 내용을 반복하지 않고 빠진 부분(저작권, 법규, 시장, 의미 데이터 구조, 해석 관례의 출처 차이)을 채운다.
- 개발 가이드의 "추천 기술 스택"은 따르지 않는다.
- 메뉴 `tarot`과 `/tarot/daily` 페이지는 이미 "준비 중"(ComingSoon, `robots: noindex`)으로 있다. 신규 기능은 이 자리를 채우게 된다.
- `COMPLIANCE.md`에는 쿠키 동의, 광고(리워드·디스플레이), 나이 확인(로또 전용), 면책 문구가 이미 있다. 타로는 나이 확인 대상이 아니지만 면책 문구 형식은 같은 틀을 쓰면 된다.

---

## 1. 한 줄 요약

타로는 78장 카드를 섞어 뽑고, 카드의 상징과 놓인 위치를 질문에 연결해 해석하는 점술 겸 자기 성찰 도구다. 과학적 근거는 없고 "오락·참고용"으로 제공해야 한다.

---

## 2. 핵심 개념과 용어

| 용어 | 뜻 (처음 보는 사람 기준) |
|---|---|
| 덱(Deck) | 카드 한 벌. 표준은 78장 |
| 메이저 아르카나 | 큰 비밀이라는 뜻. 22장. 0번 바보부터 21번 세계까지. 인생의 큰 흐름과 전환점을 나타낸다 |
| 마이너 아르카나 | 작은 비밀. 56장. 4개 수트 × 14장. 일상의 구체적 상황을 나타낸다 |
| 수트(Suit) | 마이너 카드의 무늬 묶음. 완드·컵·소드·펜타클 |
| 코트 카드 | 수트마다 있는 인물 카드 4장(페이지, 나이트, 퀸, 킹) |
| 정방향 / 역방향 | 카드가 바로 놓였는지, 거꾸로 놓였는지. 방향에 따라 의미가 달라진다 |
| 스프레드(Spread) | 카드를 몇 장 뽑아 어떻게 배치하고 각 자리에 무슨 의미를 줄지 정한 틀 |
| 포지션(Position) | 스프레드 안의 각 자리. 같은 카드도 자리에 따라 읽는 법이 달라진다 |
| 리딩(Reading) | 한 번의 뽑기와 해석 전체 |
| 질문자(Querent) | 질문하는 사람 |
| 시그니피케이터 | 질문자를 대표하는 카드. 초보용 앱에는 필요 없다 |

### 2.1 수트와 원소 (한국어 서비스 관례)

| 수트 | 원소 | 다루는 영역 | 성향 |
|---|---|---|---|
| 완드 | 불 | 행동, 열정, 욕구, 관심 표현 | 능동적 |
| 컵 | 물 | 감정, 감수성, 눈에 안 보이는 것 | 수동적 |
| 소드 | 공기 | 생각, 판단, 결정 | 이성적 |
| 펜타클 | 흙 | 돈, 현실, 결과물 | 계산적 |

출처: [themaintarot 마이너 아르카나](https://themaintarot.com/tarot-card-meaning/minor-arcana/). 다른 한국어 사이트도 같은 원소 배정을 쓴다([나무위키 타로 카드](https://namu.wiki/w/%ED%83%80%EB%A1%9C%20%EC%B9%B4%EB%93%9C) 검색 결과 기준).

### 2.2 숫자별 공통 주제 (마이너, 관례)

| 숫자 | 공통 주제 |
|---|---|
| 에이스 | 수트의 시작점, 가능성 |
| 2~9 | 단계별로 바뀌는 하위 주제. 예: 완드 2는 선택, 3은 리더십, 4는 안정, 5는 경쟁 |
| 10 | 수트 주제가 완성·극단에 이른 상태. 예: 컵 10은 화합, 가족 |

출처: 위 themaintarot 페이지. 각 카드의 세부 의미는 사이트마다 조금씩 다르다.

### 2.3 코트 카드 (인물 특성, 관례)

| 카드 | 특성 |
|---|---|
| 페이지 | 미숙, 호기심, 준비 안 됨, 젊음 |
| 나이트 | 미숙하지만 행동 위주, 모험적 |
| 퀸 | 성숙, 내면 지향, 이해심 |
| 킹 | 성숙, 외부 지향, 자신감, 결단 |

출처: 위 themaintarot 페이지. 코트 카드는 사람이 아니라 "태도·시기"로 읽는 유파도 있다(확인 필요).

---

## 3. 규칙과 관례

### 3.1 공식 규칙 vs 관례

- 타로에는 공식 규칙이 없다. 아래는 모두 관례이며 유파와 리더마다 다르다.
- 이 사실은 앱 안내 문구에서 "정해진 규칙"처럼 단정하지 않아야 한다는 뜻이다.

### 3.2 진행 순서 (관례)

1. 질문 정하기
2. 카드 섞기
3. 스프레드 고르기
4. 카드 뽑아 뒤집기
5. 카드 + 위치 + 질문을 연결해 해석
6. 기록

### 3.3 질문 관례

- 질문은 하나씩, 열린 질문이 선호된다. 예, 아니오 질문은 카드 1장 리딩에 쓰는 경우가 많다.
- 같은 질문을 마음에 들 때까지 다시 뽑지 않는다는 관례가 널리 퍼져 있다. (기존 개발 가이드 3.1과 같음. 별도 학술 출처는 못 찾음, 확인 필요)
- 제3자의 속마음을 묻는 질문(상대방 감정, 재회)이 한국 서비스에서 가장 흔하다. 개인정보 이슈는 8장 참고.

### 3.4 정·역방향 관례

- 역방향 사용은 선택이다. 정방향만 쓰는 리더도 많다.
- 역방향은 "정방향의 정반대"가 아니라 정방향 의미가 막힘, 지연, 약화, 내면화, 과잉된 상태라고 보는 해석이 많다. 정반대로 읽는 경우는 일부다.
- 어려운 카드가 역방향이면 완화·해소로 읽고(탑 역방향 = 파국이 피해졌거나 지나가는 중), 좋은 카드가 역방향이면 막힘·지연으로 읽는 경향이 있다.
- 한 해석에 막힘·정반대·내면 등 여러 렌즈를 동시에 적용하지 않고 질문과 포지션에 맞는 하나를 고른다.
- 역방향이 여러 장이면 상황이 정체됐거나 내면 문제라고 읽는다.
- 앱 시사점: 역방향 on/off 옵션을 두는 것이 관례와 맞는다. 상용 앱 "타로 운세"도 2020년에 역방향 옵션을 추가했다.

출처: [Tarot Community](https://tarotcommunity.com/learn/reversals/), [Dark Forest Tarot](https://darkforesttarotcards.com/blogs/news/reversed-tarot-cards-complete-guide), [Tarot by Hand](https://tarotbyhand.com/blog/reversed-tarot-meanings-list), [Goodreads 블로그(Jack Chanek)](https://www.goodreads.com/author_blog_posts/22661822-interpret-reversals-with-ease?tab=book), [App Store 타로 운세](https://apps.apple.com/us/app/id1195750966).

### 3.5 덱 번호 차이

- 라이더-웨이트-스미스(RWS) 덱은 힘(Strength)을 8번, 정의(Justice)를 11번에 둔다. 웨이트가 별자리(사자자리, 천칭자리) 대응을 맞추려고 바꿨다. 마르세유 계열 덱은 반대다(힘 11, 정의 8).
- 앱이 RWS 이미지를 쓴다면 RWS 번호(힘 8, 정의 11)를 따라야 한다. 개발 가이드 표는 이미 이 순서다.
- 한국 사이트 중에도 "덱마다 8과 11이 다르다"고 적은 곳이 있다.

출처: [Wikipedia Rider-Waite Tarot](https://en.wikipedia.org/wiki/Rider%E2%80%93Waite_Tarot), [나무위키 타로 카드](https://namu.wiki/w/%ED%83%80%EB%A1%9C%20%EC%B9%B4%EB%93%9C).

### 3.6 스프레드

| 스프레드 | 장수 | 용도 | 비고 |
|---|---|---|---|
| 원카드 | 1 | 오늘의 카드, 단일 질문, 예/아니오 | 한국 앱에서 무료 기본 기능으로 가장 흔함 |
| 쓰리카드(시간) | 3 | 과거-현재-미래 | 초보용. 리딩 5~10분 분량 |
| 쓰리카드(상황) | 3 | 상황-장애물-조언 | 의사결정용 변형 |
| 쓰리카드(관계) | 3 | 나-상대-관계 | 연애 서비스에서 흔함. 별도 출처는 못 찾음, 확인 필요 |
| 켈틱 크로스 | 10 | 심층 분석 | 리딩 30~45분 분량. 초보에게 어렵다는 조언이 많음 |

켈틱 크로스 포지션은 아래 10개가 가장 흔하다.

| 번호 | 포지션 |
|---|---|
| 1 | 현재 상황 (핵심) |
| 2 | 도전·장애물 |
| 3 | 기반·근본 원인 (무의식) |
| 4 | 가까운 과거 |
| 5 | 의식적 목표 |
| 6 | 가까운 미래 |
| 7 | 나 자신의 태도 |
| 8 | 외부 영향·환경 |
| 9 | 희망과 두려움 |
| 10 | 최종 결과 |

출처가 서로 다른 점
- 3번과 4번, 5번의 의미가 출처마다 다르다. 웨이트 원전과 일부 현대 리더는 3·4번 의미를 서로 바꿔 쓰고, 4번을 "가까운 과거"가 아니라 "의식적 목표"로 보는 곳도 있다. 한 서비스 안에서는 하나로 통일해야 한다. (기존 개발 가이드는 3번 근본 원인, 4번 과거, 5번 의식/목표 순)
- 10번 "최종 결과"는 확정된 운명이 아니라 지금 흐름이 이어질 때의 가능성으로 설명하는 것이 관례다.
- 켈틱 크로스는 10장을 따로 읽지 않고 서로의 관계로 읽는다. 앱의 자동 해석이 한계가 큰 영역이다.

출처: [Mystic Pull 스프레드 가이드](https://mysticpull.com/tarot-card-meanings/tarot-spreads-guide/), [Chi Oracle](https://chioracle.com/library/tarot-spread-guide-celtic-cross), [The Tarot Lady](https://www.thetarotlady.com/breaking-celtic-cross-lesson-1-laying/), [Esoteric Meanings](https://www.esotericmeanings.com/celtic-cross-tarot-spread-layout/), [Pagan Grimoire](https://www.pagangrimoire.com/how-to-read-the-celtic-cross-tarot-spread/).

---

## 4. 앱에 필요한 데이터 목록

### 4.1 카드 78장 구성

| 구분 | 수 | id 규칙 제안 |
|---|---|---|
| 메이저 | 22 | `major-00` ~ `major-21` |
| 완드 | 14 | `wands-01` ~ `wands-14` (11 페이지, 12 나이트, 13 퀸, 14 킹) |
| 컵 | 14 | `cups-01` ~ `cups-14` |
| 소드 | 14 | `swords-01` ~ `swords-14` |
| 펜타클 | 14 | `pentacles-01` ~ `pentacles-14` |

id 규칙은 제안이다. 최종 확정은 설계 담당 몫이다.

### 4.2 메이저 22장 이름 (한글 명칭은 여러 표기가 있음)

| 번호 | 영문 | 한글(기본) | 한글 표기 변형 |
|---|---|---|---|
| 0 | The Fool | 바보 | 광대(일부) 확인 필요 |
| 1 | The Magician | 마법사 | 마술사 확인 필요 |
| 2 | The High Priestess | 여사제 | |
| 3 | The Empress | 여황제 | 여제 |
| 4 | The Emperor | 황제 | |
| 5 | The Hierophant | 교황 | 대사제 |
| 6 | The Lovers | 연인 | |
| 7 | The Chariot | 전차 | |
| 8 | Strength | 힘 | |
| 9 | The Hermit | 은둔자 | |
| 10 | Wheel of Fortune | 운명의 수레바퀴 | |
| 11 | Justice | 정의 | |
| 12 | The Hanged Man | 매달린 사람 | |
| 13 | Death | 죽음 | |
| 14 | Temperance | 절제 | |
| 15 | The Devil | 악마 | |
| 16 | The Tower | 탑 | |
| 17 | The Star | 별 | |
| 18 | The Moon | 달 | |
| 19 | The Sun | 태양 | |
| 20 | Judgement | 심판 | |
| 21 | The World | 세계 | |

한글 명칭 변형은 한국어 검색 결과 기준이다. 교황/대사제, 여황제/여제는 확인됐고 나머지 변형은 확인 필요. 출처: [나무위키 타로 카드](https://namu.wiki/w/%ED%83%80%EB%A1%9C%20%EC%B9%B4%EB%93%9C), [themaintarot](https://themaintarot.com/tarot-card-meaning/minor-arcana/).

마이너 한글 표기는 "수트 + 랭크" 순서가 일반적이다(예: 완드 시종). 코트 카드는 시종(또는 페이지), 기사(또는 나이트), 여왕(또는 퀸), 왕(또는 킹)을 섞어 쓴다. 한 서비스 안에서 하나로 통일해야 한다. 출처: 위 두 페이지.

### 4.3 카드별 의미 데이터 구조 제안 (한국어 서비스용)

기존 개발 가이드의 `upright`/`reversed` 한 줄 구조로는 분야별 해석이 어렵다. 한국 서비스의 주요 질문 분야(연애, 직업, 금전)를 고려하면 아래 필드가 필요하다.

```json
{
  "id": "major-00",
  "nameEn": "The Fool",
  "nameKo": "바보",
  "arcana": "major",
  "suit": null,
  "number": 0,
  "element": null,
  "keywords": {
    "upright": ["시작", "자유", "모험"],
    "reversed": ["무모함", "준비 부족", "망설임"]
  },
  "summary": {
    "upright": "(자체 작성) 한두 문장",
    "reversed": "(자체 작성) 한두 문장"
  },
  "byTopic": {
    "love":   { "upright": "(자체 작성)", "reversed": "(자체 작성)" },
    "career": { "upright": "(자체 작성)", "reversed": "(자체 작성)" },
    "money":  { "upright": "(자체 작성)", "reversed": "(자체 작성)" },
    "advice": { "upright": "(자체 작성)", "reversed": "(자체 작성)" }
  },
  "image": { "src": "...", "alt": "...", "source": "...", "license": "..." }
}
```

필드별 메모
- `byTopic`는 78장 × 2방향 × 4분야 = 624개 문장이다. MVP는 `summary` + 키워드만 두고 분야별은 2단계로 미루는 선택지가 있다. 이건 기획 결정.
- `image.source`, `image.license`를 데이터에 같이 두면 라이선스 추적이 쉽다. (구조 제안이며 구현 방식은 설계 담당 몫)
- SEO: 카드별 설명 페이지(`/tarot/cards/the-fool` 등)를 만들면 78개 페이지가 생긴다. 검색 유입 가능성이 있지만 얇은 콘텐츠 위험도 있다(10장 참고).

### 4.4 스프레드 데이터

개발 가이드 6.2의 구조(`id`, `name`, `positions[{index,label}]`)에 아래를 더 두는 것을 권한다.
- 각 포지션의 "설명 한 줄"(해석 문장에 쓰는 표현)
- 추천 질문 분야
- 난이도 표시(초보 / 중급)

### 4.5 샘플 데이터 (참고용 초안, 검수 필요)

아래 키워드는 널리 공유되는 일반 의미를 짧은 단어로 옮긴 초안이다. 실제 문장은 자체 작성해야 하며, 공개 도메인 원전(웨이트 『The Pictorial Key to the Tarot』)과 대조해 검수한다.

| 카드 | 정방향 키워드 | 역방향 키워드 |
|---|---|---|
| 0 바보 | 시작, 자유, 모험 | 무모함, 준비 부족, 망설임 |
| 1 마법사 | 의지, 실행, 재능 | 낭비, 속임, 미숙한 실행 |
| 6 연인 | 선택, 조화, 끌림 | 불균형, 엇갈림, 망설임 |
| 13 죽음 | 끝맺음, 전환, 새 국면 | 변화에 대한 저항, 미련 |
| 16 탑 | 갑작스런 변화, 무너짐 | 피한 위기, 천천히 오는 변화 |
| 19 태양 | 활력, 성공, 명료함 | 일시적 침체, 과한 낙관 |

죽음 카드는 실제 죽음이 아니라 전환을 뜻한다는 설명을 앱에 같이 넣는 것이 관례다(확인 필요: 별도 출처 미확보). 사용자가 불안해할 수 있는 카드(죽음, 탑, 악마)는 문구 톤 가이드가 필요하다.

---

## 5. 비슷한 서비스 사례와 흔한 기능

### 5.1 한국 시장 사정

- 점술·운세 앱은 큰 시장이다. 점신은 2023년 매출 830억 원, 모바일인덱스 기준 2025년 2월 MAU 95만(점유율 46.5%), 누적 다운로드 1,700만 건을 넘었다고 보도됐다. 포스텔러는 같은 시점 MAU 57만(28.0%)이며 22종 콘텐츠(사주, 타로, 별자리, 손금, 풍수 등)를 제공한다. 사용자의 83%가 MZ세대, 75%가 여성이라고 회사가 밝혔다.
- 수치가 기사마다 다르다. 포스텔러 가입자는 860만(2024)과 750만(2026-02 기사)이 섞여 있고, 매출 100억 달성 연도도 2023/2024로 엇갈린다. 업계 규모 1.4조 원은 뉴스레터형 글에서 나와 근거가 약하다.
- 타로만 따로 집계한 시장 규모와 이용자 통계는 못 찾았다. 확인 필요.

출처: [ZDNet Korea 포스텔러](https://zdnet.co.kr/view/?no=20250203104315), [롱블랙 포스텔러](https://longblack.co/note/1571), [한국경제 1700만 다운로드](https://www.hankyung.com/article/2026021070861), [탑스타뉴스 MAU](https://www.topstarnews.net/news/articleView.html?idxno=15623421), [네이트 점신 기사](https://news.nate.com/view/20260216n07398), [매거진한경](https://magazine.hankyung.com/business/article/202405226315b).

### 5.2 개별 서비스 비교

| 서비스 | 형태 | 주요 기능 | 수익 모델 | 면책 |
|---|---|---|---|---|
| [TAROLYS](https://tarolys.com/tarot/) | 웹 | 하루 1장 무료, 3장 1,900원, 7장 3,900원, 10장 6,900원. 질문 분야별(속마음, 썸, 연락, 재회, 이직, A/B 선택, 예/아니오). 카드 뽑기 도구(1·3·5·7장, 자동/수동, 해석 없음). 무료 카드는 가입·결제 정보 불필요. 질문은 브라우저에서만 처리, 저장 없음 | 건별 결제 | 오락·자기 성찰용, 의료·법률·투자 조언 대체 아님 |
| [타로 운세(Gamespade)](https://apps.apple.com/us/app/id1195750966) | iOS 앱 | 78장, 켈틱 크로스, 오늘의 타로, 예/아니오, 역방향 옵션(2020), 타로 사전, 자동 셔플, 카드 물리 시뮬레이션 | 코인 인앱결제 | 스토어 목록에 오락 면책 문구 없음 |
| [썸타로 연애백서](https://play.google.com/store/apps/details?id=com.twojmsoft.sometarot&hl=en_US) | Android 앱 | 오늘의 타로(애정·금전·직업·건강), 예/아니오 타로, 1장 타로 | 확인 필요 | 확인 필요 |
| 점신, 포스텔러 | 앱 | 사주 중심, 타로는 테마별 콘텐츠 중 하나. 연애 타로 등 | 구독, 건별 결제, 유료 상담(5~10분에 5천~2만 원 선) | 확인 필요 |
| 신한라이프 무료 운세 | 웹 | 오늘의 운세, 오늘의 타로, 주간 운세, 궁합 | 금융 상품 마케팅 | 확인 필요 |

### 5.3 사용자가 기대하는 기능 (공통 패턴, 한국 서비스 기준)

1. 로그인 없이 바로 1장 뽑기 (오늘의 타로)
2. 연애 중심의 분야 선택 (속마음, 썸, 재회, 연락), 그다음 직업·금전
3. 카드를 직접 고르거나 뒤집는 연출 (자동 셔플 + 직접 선택 모두 제공하는 곳이 많음)
4. 정방향/역방향, 예/아니오 모드
5. 결과 저장·공유 (이미지 공유는 개발 가이드 3단계에 있음)
6. 카드 사전(78장 의미 백과)
7. 짧고 부드러운 결과 문장. 단정적 예언 표현을 쓰는 서비스는 오락 면책을 같이 둔다.

위 항목은 위 표의 서비스와 검색 결과를 합친 정리이며, 항목별 사용자 설문 근거는 못 찾았다. 확인 필요.

### 5.4 인기 질문 유형

- 압도적으로 연애다. 한 질문 모음집은 연애·인간관계 질문 196개 대비 커리어 질문 41개를 실었다.
- 연애: 상대가 나를 좋아하는지, 우리 관계가 어디로 가는지, 재회 가능성, 연락이 올지.
- 직업: 지금 직장이 맞는지, 이직이 좋은 선택인지, 시험·취업운.
- 금전: 재정 흐름, 투자 계획이 잘 풀릴지. 이 유형은 투자 판단 오해 소지가 있어 면책이 특히 필요하다(8장).
- 이외: A/B 선택, 오늘의 흐름, 월간·신년 운세.

출처: [themaintarot 연애·인간관계 질문 40개](https://themaintarot.com/tarot-question-list-for-love-relationship/), [themaintarot 질문 모음](https://themaintarot.com/tarot-question-collection/)(본문 목록 로딩 실패로 일부만 확인), [TAROLYS](https://tarolys.com/tarot/), [App Store 타로 운세](https://apps.apple.com/us/app/id1195750966), [App Store The 타로카드](https://apps.apple.com/us/app/id1518547389).

---

## 6. 저작권·라이선스

### 6.1 결론 요약

| 자산 | 상업 이용(광고 포함) | 근거 / 주의 |
|---|---|---|
| 1909 라이더-웨이트-스미스 원본 그림 (1909/1910 인쇄본 스캔) | 가능성 높음. 법률 확인 필요 | 미국·영국에서 공개 도메인. 한국 보호기간도 지난 것으로 추정됨(6.2) |
| US Games Systems의 1971년 이후 재채색판, 복원판, 박스·카드 뒷면 | 쓰지 않는다 | US Games가 추가된 부분에 저작권을 주장. 원본과 구분해야 함 |
| 위키미디어 커먼즈 RWS 스캔 세트 | 세트별로 파일 페이지 확인 필요 | 커먼즈 분류 페이지가 "일부 채색판은 저작권이 남아 있을 수 있다"고 경고 |
| "Rider-Waite" 명칭 | 상표 문제. 이름에 쓰지 않는다 | US Games가 상표를 보유한다고 알려짐(2차 출처, 확인 필요) |
| 웨이트 『The Pictorial Key to the Tarot』(1910/1911) 텍스트 | 가능성 높음 | 1923년 이전 출판. 아카이브들이 공개 도메인으로 표기 |
| 현대 책·블로그·사이트의 카드 의미 문장 | 복사 금지 | 표현에 저작권이 있음. 의미(아이디어)는 자유 |
| 마르세유 덱(Conver 등) | 가능, 파일별 확인 필요 | 18세기 덱이라 원본은 공개 도메인. 단 근래 재출판본이 섞여 있음 |
| 토트 덱 등 20세기 덱 | 쓰지 않는다 | 현대 저작권 보호 중. 구체 근거는 못 찾음, 확인 필요 |

### 6.2 RWS 덱 상세

사실관계
- 1909년 12월 윌리엄 라이더 앤 선(런던)이 발행했다. 1910년 3월 대량 인쇄본이 나왔다. 그림은 파멜라 콜먼 스미스(1878~1951), 기획·상징은 A. E. 웨이트(1942년 사망)다.
- 커먼즈 파일 설명에는 스미스가 "고용 작업(for hire)"으로 작업했고 저작권은 웨이트가 가졌다고 적혀 있다. 다만 위키백과 파멜라 콜먼 스미스 항목은 계약 방식을 적지 않았다. 따라서 "고용 작업"은 단일 출처 정보이므로 확인 필요.
- 커먼즈 분류 페이지는 원본 덱이 미국과 영국(원산지국) 모두 공개 도메인이라고 적는다.

미국
- 위키백과: 갱신된 저작권 기간(발행 + 28년 + 28년)을 감안해 1966년에 공개 도메인이 됐다고 서술한다.
- 커먼즈 파일 설명: 1931년 1월 1일 이전 발행이라 미국에서 공개 도메인.
- 두 출처의 근거 논리는 다르지만 결론은 같다. 미국 법무부·저작권청 같은 1차 자료는 이번 조사에서 확인하지 못했다.

영국·EU 등 사후 70년국
- 스미스가 1951년에 사망해 사후 70년이 2021년 말에 만료, 2022년 1월 1일부터 자유 이용. "2012/2013년에 풀렸다"는 통념은 웨이트(1942년 사망) 기준이라 부정확하다는 설명이 있다.
- 출처 간 불일치: 위키백과 파멜라 콜먼 스미스 항목은 사망일을 9월 16일과 18일로 혼용한다. 연도(1951)는 일치한다.

한국
- 한국 저작권법은 원칙적으로 저작자 생존 기간 + 사후 70년(2013년 7월 시행, 소급 없음). 외국 저작물은 베른협약 제7조 제8항의 상호주의에 따라 본국의 기간이 더 짧으면 그 기간만 보호받는다. RWS는 영국(본국) 기준으로도 만료됐고, 스미스 기준 한국의 70년도 2022년에 끝났을 것이다.
- 그러나 한국법에서 어느 저작자를 기준으로 할지(스미스 단독 / 웨이트와의 공동저작 / 업무상 저작물)는 이번 조사에서 판단 근거를 못 찾았다. 법률 확인 필요.

US Games Systems
- 1971년판 재채색본과 이후 신규 요소(카드 뒷면, 박스)에 저작권을 주장한다. 위키백과는 이 범위가 "다툼이 있다"고 쓴다. 원본 그림 자체는 포함하지 않는다고 본다.
- 소송 이력: US Games v. AGM Müller 사건이 기각됐고 랜덤하우스는 RWS에 저작권을 주장하지 않는다고 했다는 요약이 있다. 1차 판결문은 확인하지 못했다. 확인 필요.
- "Rider-Waite", "Rider Tarot Deck", "Waite Tarot Deck", "Pamela Colman Smith Tarot Deck"가 US Games의 등록 상표라는 서술이 블로그에 있다. 상표청 1차 자료 미확인.

안전한 사용 원칙 (복수 출처가 공통으로 말하는 것)
1. 1909/1910 인쇄본의 충실한 스캔을 쓴다. US Games 현대 인쇄본을 스캔하지 않는다.
2. 서비스명, 메타 태그, 설명에 "Rider-Waite"를 넣지 않는다. 한국어 서비스라면 "웨이트-스미스 계열 이미지" 같은 서술도 법률 확인을 거친다.
3. 카드 뒷면은 원본 도안(튜더 장미와 백합)을 그대로 쓰지 말고 자체 제작하는 편이 안전하다. 유명 덱의 뒷면 도안은 trade dress 분쟁 사례가 있다(Etsy 사례 글).
4. 파일마다 출처, 라이선스, 취득일을 기록한다. `THIRD_PARTY_NOTICES.md`에 반영한다(`CLAUDE.md` 규칙).

출처: [Wikimedia Commons: Category Rider-Waite tarot deck](https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck), [Commons: RWS Tarot 00 Fool 파일](https://commons.wikimedia.org/wiki/File:RWS_Tarot_00_Fool.jpg), [Wikipedia Rider-Waite Tarot](https://en.wikipedia.org/wiki/Rider%E2%80%93Waite_Tarot), [Wikipedia Pamela Colman Smith](https://en.wikipedia.org/wiki/Pamela_Colman_Smith), [The Wild Hunt](https://wildhunt.org/2021/01/rider-waite-smith-tarot-deck-may-enter-public-domain.html), [Global Spiritual Studies](https://globalspiritualstudies.com/is-rider-waite-smith-public-domain/), [Zenstorefront (Etsy 사례)](https://www.zenstorefront.com/blog/etsy-tarot-copyright-strike-rider-waite), [Benebell Wen 저작권 핸드북](https://benebellwen.com/wp-content/uploads/2023/12/tarot-and-copyright-law-handbook-3.pdf)(PDF 본문 추출 실패로 검색 요약만 확인), [한국저작권위원회 저작권동향](https://copyright.or.kr/information-materials/trend/the-copyright/view.do?brdclasscode=01&brdctsno=53843&brdctsstatecode=&list.do%3FpageIndex=9&nationcode=&searchTarget=ALL&searchText=&servicecode=06), [easylaw 저작권법 보호기간](https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?popMenu=ov&csmSeq=705&ccfNo=2&cciNo=3&cnpClsNo=2).

### 6.3 이미지 소스 후보

| 소스 | 내용 | 라이선스 상태 | 주의 |
|---|---|---|---|
| 커먼즈 "Rider-Waite tarot deck (Roses & Lilies)" | 1909년 "Roses & Lilies" 인쇄본 스캔, 80개 파일 | 공개 도메인으로 표시 | 파일별 확인. GitHub 프로젝트 하나가 이 세트를 공개 도메인으로 쓴 사례 |
| 커먼즈 "Rider-Waite-Smith tarot deck (Geldard)" | 78개 파일 | 파일 페이지 확인 필요 | 채색판 여부 확인 |
| 커먼즈 "Rider-Waite-Smith tarot deck (TaionWC)" | 78개 파일 | 파일 페이지 확인 필요 | 위와 같음 |
| 커먼즈 "The Pictorial Key to the Tarot" | 책 안의 카드 이미지 84개 파일 | 공개 도메인 추정 | 흑백이라 시각 완성도 차이 |
| 커먼즈 "Vectorized Tarot by Immanuelle" | 벡터화 세트 | 별도 라이선스 가능성 | 파일 설명 확인 필요(CC 표기 가능) |
| 커먼즈 Conver 1760, Dodal | 마르세유 덱 | 원본은 공개 도메인 | Conver 분류에 2020년 재출판본(CC BY-SA 4.0)이 섞여 있음. BnF/Gallica 스캔은 비상업 조건이라는 서술도 있음 |
| 자체 제작 / 의뢰 | 일러스트, 아이콘 | 계약으로 정함 | 비용과 시간. 한국어 서비스 차별화 가능 |

커먼즈 분류 페이지에는 구조화 데이터 CC0, 비정형 텍스트 CC BY-SA 4.0이 적용된다고 되어 있다. 이는 메타데이터 라이선스이며 그림의 라이선스와 다르다. 이미지 사용 전에 파일 설명 페이지의 라이선스 틀(PD-old, PD-US 등)을 하나씩 확인해야 한다.

### 6.4 카드 의미 텍스트

- 카드의 일반적 의미(예: 죽음 카드는 전환을 뜻한다)는 아이디어라 누구나 쓸 수 있다는 것이 저작권법 일반 원칙이다. 캐나다 법률 안내와 Benebell Wen 핸드북(검색 요약)이 같은 취지다. 스프레드 개념(과거-현재-미래)도 마찬가지다.
- 반면 특정 저자·사이트의 문장, 구성은 보호된다. Biddy Tarot 안내는 허락 없이 문구를 그대로 쓰지 말라고 한다.
- 결론: 78장 × 정/역방향 × 분야별 문장은 전부 자체 작성이 필요하다. AI 생성 후 검수 방식을 개발 가이드가 제안한다. AI 생성물의 저작권·권리 귀속은 별도 이슈이므로 법률 확인 필요.
- 웨이트 원전(1910)은 공개 도메인이라 인용·번안이 가능하다. 단 영어 원문이고 20세기 초 문체라 번역·현대화는 자체 작성이 된다. 번역은 새로운 2차 저작물이 되므로 한국어 번역본을 서비스에 쓰면 번역 책임은 서비스 쪽이다.
- 한국어 책의 번역·해설은 별도 저작권이 있다. 한국어 서적에서 문장을 옮기면 안 된다.
- 한국 법 기준 판단은 못 찾았다. 법률 확인 필요.

출처: [Biddy Tarot 저작권 안내](https://biddytarot.com/blog/guide-to-copyright/), [Lawyerinfo.ca](https://lawyerinfo.ca/guides/money-taxes-ip/intellectual-property/copyright-of-astrological-charts-and-tarot-readings-in-canada/), [tarotcardmeanings.net](https://www.tarotcardmeanings.net/tarot-copyright.htm), [sacred-texts.com Pictorial Key](https://sacred-texts.com/tarot/pkt/index.htm)(403으로 본문 확인 못 함, 검색 요약만), [Internet Archive Pictorial Key](https://archive.org/details/A.EWaiteThePictorialKeyToTheTarot), [Wikipedia Pictorial Key](https://en.wikipedia.org/wiki/The_Pictorial_Key_to_the_Tarot).

### 6.5 외부 API·폰트

- 이번 조사에서 상업 이용이 명확한 무료 타로 API는 확인하지 못했다. 외부 API 사용은 권하지 않는다(이용약관, 호출 제한, 의미 텍스트 저작권 문제). 확인 필요.
- 폰트는 이 조사 범위 밖. `CLAUDE.md`에 따라 추가 시 `THIRD_PARTY_NOTICES.md`를 갱신한다.

---

## 7. 한국 표기·톤

- 존댓말 "~일 수 있어요" 형태 권장(개발 가이드 3.2).
- 단정 금지 표현 예: "반드시", "100%", "헤어집니다", "합격합니다". 실제 어떤 표현이 법적으로 문제가 되는지는 8.2 참고.
- 불안 유발 카드(죽음, 탑, 악마)는 "끝/전환/집착을 돌아볼 신호" 같은 완화 문구를 같이 제공.

---

## 8. 관련 법규·정책

### 8.1 오락·참고용 면책 문구

- 사례: TAROLYS는 오락 및 자기 성찰 목적이며 의료·법률·투자 조언을 대체하지 않는다고 밝히고, 면책·약관·개인정보·결제 정책 페이지를 별도로 둔다.
- 한국에 점술 서비스의 면책 문구를 의무화한 법령은 이번 조사에서 확인하지 못했다. 확인 필요. 법적 의무가 아니더라도 아래 이유로 두는 것을 권한다. (1) 광고 정책의 오인·기만 항목 회피 (2) 소비자 분쟁 예방.
- 문구 위치: 결과 화면, 푸터, 별도 `/disclaimer` 류 페이지 등. `COMPLIANCE.md` 11장(Disclaimers)에 타로 항목 추가가 필요하다.

면책 문구에 들어갈 내용 (새 문장으로 쓸 것. 아래는 내용 목록이지 최종 문구가 아니다)
1. 오락과 자기 성찰 목적의 서비스임
2. 결과는 과학적으로 입증되지 않았고 미래를 보장하지 않음
3. 건강, 법률, 투자, 심리 위기는 전문가 상담이 필요함 (자해·위기 상황 시 상담 전화 안내를 둘지는 기획 결정)
4. 결과로 중요한 결정을 하지 말 것
5. 서비스는 특정 덱 제작사(US Games 등)와 제휴 관계가 없음 (비제휴 고지. 로또 서비스의 "non-affiliation" 선례가 `COMPLIANCE.md`에 있음)

### 8.2 과장·허위 광고 (한국)

- 「표시·광고의 공정화에 관한 법률」 제3조는 소비자를 속이거나 오인시킬 우려가 있는 거짓·과장 광고를 금지한다. (소비자원 연계 보도 요약 기준. 조문 1차 확인 필요)
- 「전자상거래법」 제17조: 서비스가 표시·광고와 다르거나 계약대로 이행되지 않으면 서비스를 받은 날부터 3개월 이내, 또는 안 날부터 30일 이내에 청약철회가 가능하다. 유료 리딩(TAROLYS 같은 건별 결제)을 도입하면 환불 정책 설계에 영향을 준다. 유료 도입 여부는 열린 질문.
- 소비자 상담은 1372소비자상담센터 연계.
- 점술 서비스만을 대상으로 한 소비자 경고나 규제는 이번 검색에서 확인하지 못했다. 확인 필요.
- 실무상 "연애운 100% 적중", "취업 합격 보장" 같은 문구는 표시광고법·AdSense 정책 양쪽에서 위험하다.

출처: [한국소비자원 상담 안내](https://www.kca.go.kr/odr/pg/ma/cnsutInfo.do), [파이낸셜뉴스(표시광고법·전자상거래법 요약 기사)](https://www.fnnews.com/news/202611011852324794).

### 8.3 개인정보

- 개인정보보호법 제23조: 건강, 성생활, 사상·신념 등 민감정보는 원칙적으로 처리 금지이고, 별도 동의 등 예외가 있을 때만 가능하다.
- 제23조 제3항(2023 신설): 서비스 과정에서 공개되는 정보에 민감정보가 있을 수 있으면 공개 가능성과 비공개 선택 방법을 미리 알려야 한다. 자유 입력란, 게시판, 후기 기능에 직접 관련된다.
- 타로 질문은 자유 입력이면 건강, 이성 관계, 직장 갈등, 정치·종교 성향 같은 민감한 내용이 들어올 수 있다. 사용자가 제3자(상대방 이름, 직장 동료)를 적을 수도 있다.
- 시행 시점: 조회한 법령정보센터 요약은 2026-03-10 일부개정, 2026-09-11 시행 버전이다.
- 선택지(기획 결정): (a) 질문을 서버에 저장하지 않음(TAROLYS 방식), (b) 저장하되 보관기간·삭제 방법·민감정보 입력 금지 안내, (c) 질문 입력 자체를 선택 사항으로 하고 분야 선택형 질문 제공. (a)나 (c)가 개인정보 부담이 가장 낮다. 기술 구현은 설계 담당이 정한다.
- 기존 앱에는 쿠키 동의(`ConsentProvider`)가 있고 분석·광고 스크립트는 동의 후에만 동작한다(`COMPLIANCE.md` 1, 5장). 개인정보처리방침에 타로 질문·결과 처리 항목 추가가 필요하다. 기존 방침 내용은 이번에 확인하지 않았다. 확인 필요.
- 14세 미만 아동 대상 여부, 청소년 이용 제한 여부: 확인 필요. 타로 자체를 법으로 제한하는 규정은 확인하지 못했다.

출처: [국가법령정보센터 개인정보 보호법 제23조 관련](https://law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1006183887), [법제처 해석례 민감정보 범위](https://www.law.go.kr/LSW/expcInfoP.do?expcSeq=328023), [bigcase 제23조](https://bigcase.ai/law/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C23%EC%A1%B0?refDate=20231026).

### 8.4 광고 플랫폼 정책

Google AdSense
- AdSense 정책에서 운세, 점성술, 타로를 이름으로 제한하는 항목은 확인되지 않았다(정책 페이지 일부만 열람됨. 전체 확인 필요).
- 적용될 가능성이 있는 항목: "허위 진술(Misrepresentation)". 게시자·콘텐츠 목적을 속이거나, 거짓·기만적 주장으로 홍보하는 것을 금지한다. 하위 항목에 "신뢰할 수 없거나 해로운 주장"(건강 주장 등)과 "기만적 관행"(일확천금 유도 등)이 있다. 면책 문구 없이 "재물운 보장"처럼 쓰면 위험이다.
- 게시자는 광고가 달린 모든 페이지의 콘텐츠에 책임이 있다.
- Google Ads의 아동 대상 콘텐츠 정책이 점성술·오컬트를 제한 카테고리로 둔다는 서술이 있었으나 이는 광고주 정책이며 일반 게시자 금지는 아니다. 아동 대상으로 오해되지 않게 해야 한다.

Kakao AdFit (사이트가 사용 중이면)
- 콘텐츠 가이드라인 5.2에 광고 불가 콘텐츠 목록이 있다. 운세·타로·점술은 직접 언급되지 않는다. "부정확한 정보를 전달하는 콘텐츠"(거짓·불확실한 주장으로 방문자를 유인하거나 개인정보를 부당 수집), "사행성"(카지노, 복권, 베팅 유도), 흥신소·심부름센터가 있다. 정책 효력일은 2026-09-02로 표기돼 있다.
- 운세·타로가 "부정확한 정보"로 해석될 수 있는지는 정책에 명시가 없다. 매체 심사 결과로만 알 수 있다. 확인 필요(고객센터 문의 권장).
- 광고 4개 초과 페이지, 여러 광고 스크립트 동시 사용, 클릭 유도, 얇은 콘텐츠는 제한된다. 78장 카드 페이지를 얇은 문장으로 대량 생성하면 위험이다.
- 로또 서비스에서 이미 "사행성" 이슈를 겪을 수 있는 사이트이므로, 타로를 같은 도메인에 두는 것이 광고 심사에 어떤 영향을 줄지는 확인 필요.

기존 사이트 광고 구조
- 리워드 광고로 크레딧을 얻는 시스템이 이미 있다(`COMPLIANCE.md` 4장). 타로 리딩을 크레딧으로 잠글지는 기획 결정이다. 이 경우 "결과 보기 전 광고 시청"이 AdSense의 기만적 관행(누르게 유도)으로 보이지 않도록 UI와 문구를 정해야 한다. 확인 필요.

출처: [AdSense 게시자 정책](https://support.google.com/adsense/answer/10502938?hl=en), [AdSense Misrepresentation 광고 정책](https://support.google.com/adspolicy/answer/6020955?hl=en), [Google Ads 아동 대상 콘텐츠](https://support.google.com/adspolicy/answer/9683742?hl=en), [Kakao AdFit 운영정책](https://adfit.kakao.com/web/html/use_kakao.html).

### 8.5 의료·법률·금융 조언 금지 표현

- 단정 표현 지양: "당신은 ~병에 걸립니다", "이 주식을 사세요", "소송에서 이깁니다", "이 사람과 반드시 헤어집니다".
- 허용 톤: "~에 대해 돌아보게 하는 카드예요", "~일 수 있어요", "중요한 결정은 전문가와 상의하세요".
- 건강·죽음·금전·법률 키워드가 질문에 포함되면 전문가 상담 안내를 노출하는 방안이 개발 가이드에 있다. 기획에서 범위를 정해야 한다(입력 감지 방식은 설계 담당).
- 자해·자살 관련 질문 대응: 위기 상담 전화 안내를 둘지 기획 결정. 한국 상담 전화 번호 등은 이번에 조사하지 않았다. 확인 필요.

---

## 9. 구현 관점 힌트 (방식은 쓰지 않는다)

### 9.1 셔플 공정성

- 핵심은 "편향 없는 균등한 무작위 선택"이다. 실무 자료들은 Fisher-Yates 방식과 암호학적 난수 사용에 동의한다. `sort(() => Math.random() - 0.5)` 같은 방식은 편향되므로 피하라고 한다.
- 기존 개발 가이드 7장 예시는 `buf[0] % max`로 난수를 만든다. 이 방식에는 modulo 편향이 있다. 78장 규모에서는 영향이 극히 작다는 의견이 있으나, 편향 없이 만드는 방법(범위를 넘는 값은 버리고 다시 뽑기)이 있고 비용이 거의 없다. 설계 담당이 반영 여부를 정한다.
- 한 리딩에서 같은 카드가 두 번 나오면 안 된다(덱에서 뽑는 방식이면 자동 충족).
- 역방향 확률 50%는 관례일 뿐 공식 값은 없다. 덱 구성에 따라 25%만 쓰는 리더도 있다고 알려져 있으나 출처는 못 찾았다. 확인 필요.
- 서버/클라이언트 어디서 뽑을지, 사용자가 카드를 "직접 고르는" 연출을 해도 결과가 무작위여야 한다는 점은 기획·설계에서 정한다. 사용자 선택 위치가 결과에 영향을 주면 공정성 문구와 충돌한다.
- 신뢰 확보 문구: "카드 선택은 무작위로 이루어지며 질문 내용과 무관합니다" 같은 새 문장을 서비스에 넣을지는 기획 결정.

출처: [DEV: crypto Fisher-Yates](https://dev.to/diegotorres_es/implementing-a-cryptographically-secure-shuffle-fisher-yates-with-csprng-in-javascript-20oj), [DEV: rejection sampling](https://dev.to/rana_abdullah_1e5a9a4eabe/how-to-build-a-spin-wheel-thats-actually-fair-cryptogetrandomvalues-rejection-sampling-28pc), [Lemire 블로그](https://lemire.me/blog/2016/06/30/fast-random-shuffling/), [Tehes/poker PR](https://github.com/Tehes/poker/pull/32).

### 9.2 하루 1회 고정(오늘의 카드)

- 관례상 "같은 질문을 반복해서 다시 뽑지 않는다"가 있어 오늘의 카드는 하루 한 번 결과가 고정되는 편이 어울린다. 다만 이를 필수로 정한 규칙이나 연구는 못 찾았다. TAROLYS는 하루 제한을 명시하지 않았다. 확인 필요.
- 한국의 일일 운세 서비스는 날짜 기준으로 같은 결과를 보여주는 것이 일반적이다. (이번 조사에서 직접 확인한 사례는 없음. 확인 필요)
- 기획에서 정할 것: 기준 시각(자정 KST인지), 비로그인 사용자 처리, 새로고침/재방문 시 같은 카드, 날짜가 바뀌면 새 카드. 기술 구현은 설계 담당.
- SEO와의 관계: 결과가 사용자별 무작위이므로 결과 페이지 자체는 검색 노출 대상이 아니다. 노출 대상은 설명 콘텐츠다(10장).

### 9.3 기록·공유

- 개발 가이드 8장 로드맵에는 리딩 기록과 이미지/링크 공유가 있다. 질문이 포함된 기록을 공유 링크로 노출하면 개인정보 이슈가 있다(8.3). 공유 기능에서 질문을 빼는 방안은 기획 결정.
- 공유 이미지에 쓰는 카드 그림도 6장 라이선스 확인 대상이다.

---

## 10. SEO 관점 메모 (`docs/conventions/seo.md` 기준)

- 규칙상 새 페이지는 `buildMetadata()`, JSON-LD, `MENU_LIST` 등록을 따른다. 기존 `/tarot/daily` 자리는 현재 noindex다.
- 검색에 노출될 핵심 내용(카드 의미, 스프레드 설명)은 서버 렌더링 HTML에 들어가야 한다. 뽑은 결과(무작위)는 노출 대상이 아니다.
- 카드 78장 개별 페이지는 정보 가치가 있으면 검색 유입을 만들 수 있지만, AdFit 정책의 "얇은 콘텐츠" 제한과 충돌하지 않도록 카드당 분량과 고유성이 필요하다. 기획에서 범위를 정한다.
- 한국어 검색 의도: "오늘의 타로", "연애 타로", "재회 타로", "타로 카드 의미", "타로 스프레드". 검색량은 이번에 조사하지 않았다. 확인 필요.
- 이미지 `alt`는 카드명 + 방향 정도로 새로 쓴다.

---

## 11. 기획자에게 넘길 열린 질문

콘텐츠·범위
1. MVP 범위: 원카드(오늘의 카드)만 할지, 쓰리카드까지 할지, 켈틱 크로스는 언제 할지. 현재 메뉴에는 "오늘의 타로" 하나만 있다.
2. 질문 분야를 연애 중심으로 갈지(시장 수요 기준), 연애·직업·금전을 동등하게 둘지. 금전 분야는 투자 오해 위험이 있다.
3. 카드 의미 깊이: 요약 + 키워드까지만 할지, 분야별(연애·직업·금전·조언) 문장까지 78×2×4 규모로 만들지.
4. 역방향 기본값을 켤지 끌지. 초보 사용자에게 어떻게 설명할지.
5. 카드 사전(78장 의미 백과) 페이지를 만들지. SEO 이점과 얇은 콘텐츠 위험 중 무엇을 택할지.
6. 해석 문장을 템플릿 조합으로 할지, 카드·포지션별 고정 문장으로 할지(기획 수준의 품질 기대치만 정하고 기술은 설계 담당).

운영 정책
7. 오늘의 카드를 하루 1장 고정으로 할지, 재뽑기를 허용할지(허용 시 경고 문구). 기준 시각은 자정 KST로 할지.
8. 질문 입력 방식: 자유 입력 / 선택형 / 선택 사항. 질문과 결과를 서버에 저장할지, 로컬에만 둘지, 저장하지 않을지(8.3의 개인정보 부담에 직결).
9. 로그인 필요 여부와 기록 기능의 범위. 공유 시 질문 포함 여부.
10. 유료 또는 크레딧(리워드 광고) 방식으로 확장할지. 확장하면 전자상거래법 환불 정책과 AdSense·AdFit 기만적 관행 이슈가 생긴다.
11. 사용자 연령 확인 여부(로또는 AgeGate 있음). 타로는 현재 확인된 법적 요구가 없다.
12. 위기 상황(자해 암시 등) 질문 안내 문구를 둘지.

이미지·법무
13. 이미지 소스 결정: (a) 1909 RWS 원본 스캔 사용, (b) 마르세유 덱 사용, (c) 자체 제작/의뢰. (a)는 비용이 없고 한국 서비스에서 가장 익숙한 도상이지만 법률 확인이 필요하다. 어느 쪽으로 갈지, 법률 확인을 누가 언제 할지.
14. 서비스명과 SEO 키워드에서 "Rider-Waite" 상표 표기를 피하는 것에 합의할지.
15. 카드 뒷면 디자인을 자체 제작할지.
16. 한국어 카드 명칭 표준 선택: 교황/대사제, 여제/여황제, 시종/페이지 등. 코트 카드는 한글 표기(시종·기사·여왕·왕) 또는 외래어(페이지·나이트·퀸·킹)로 통일할지.
17. 켈틱 크로스 포지션 3~5번 의미를 어느 출처 기준으로 확정할지.
18. 광고 승인 상태: 타로 콘텐츠가 현재 쓰는 광고 네트워크(AdSense, AdFit)에서 문제 없는지 사전 확인할지, 문의로 확인할지.

---

## 12. 출처 목록

도메인·규칙
- https://en.wikipedia.org/wiki/Rider%E2%80%93Waite_Tarot
- https://en.wikipedia.org/wiki/The_Pictorial_Key_to_the_Tarot
- https://en.wikipedia.org/wiki/Pamela_Colman_Smith
- https://namu.wiki/w/%ED%83%80%EB%A1%9C%20%EC%B9%B4%EB%93%9C
- https://themaintarot.com/tarot-card-meaning/minor-arcana/
- https://themaintarot.com/tarot-question-list-for-love-relationship/
- https://themaintarot.com/tarot-question-collection/
- https://tarotcommunity.com/learn/reversals/
- https://darkforesttarotcards.com/blogs/news/reversed-tarot-cards-complete-guide
- https://tarotbyhand.com/blog/reversed-tarot-meanings-list
- https://www.goodreads.com/author_blog_posts/22661822-interpret-reversals-with-ease?tab=book
- https://mysticpull.com/tarot-card-meanings/tarot-spreads-guide/
- https://chioracle.com/library/tarot-spread-guide-celtic-cross
- https://www.thetarotlady.com/breaking-celtic-cross-lesson-1-laying/
- https://www.esotericmeanings.com/celtic-cross-tarot-spread-layout/
- https://www.pagangrimoire.com/how-to-read-the-celtic-cross-tarot-spread/

시장·서비스
- https://tarolys.com/tarot/
- https://apps.apple.com/us/app/id1195750966
- https://apps.apple.com/us/app/id1518547389
- https://play.google.com/store/apps/details?id=com.twojmsoft.sometarot&hl=en_US
- https://zdnet.co.kr/view/?no=20250203104315
- https://longblack.co/note/1571
- https://www.hankyung.com/article/2026021070861
- https://www.topstarnews.net/news/articleView.html?idxno=15623421
- https://news.nate.com/view/20260216n07398
- https://magazine.hankyung.com/business/article/202405226315b

저작권
- https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck
- https://commons.wikimedia.org/wiki/File:RWS_Tarot_00_Fool.jpg
- https://commons.wikimedia.org/wiki/Category:Tarot_de_Marseille_-_Nicolas_Conver_1760
- https://commons.wikimedia.org/wiki/Category:Tarot_de_Marseille_-_Jean_Dodal
- https://foolmade.art/archive/conver-tarot
- https://wildhunt.org/2021/01/rider-waite-smith-tarot-deck-may-enter-public-domain.html
- https://globalspiritualstudies.com/is-rider-waite-smith-public-domain/
- https://www.zenstorefront.com/blog/etsy-tarot-copyright-strike-rider-waite
- https://benebellwen.com/wp-content/uploads/2023/12/tarot-and-copyright-law-handbook-3.pdf
- https://biddytarot.com/blog/guide-to-copyright/
- https://lawyerinfo.ca/guides/money-taxes-ip/intellectual-property/copyright-of-astrological-charts-and-tarot-readings-in-canada/
- https://www.tarotcardmeanings.net/tarot-copyright.htm
- https://sacred-texts.com/tarot/pkt/index.htm
- https://archive.org/details/A.EWaiteThePictorialKeyToTheTarot
- https://copyright.or.kr/information-materials/trend/the-copyright/view.do?brdclasscode=01&brdctsno=53843&brdctsstatecode=&list.do%3FpageIndex=9&nationcode=&searchTarget=ALL&searchText=&servicecode=06
- https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?popMenu=ov&csmSeq=705&ccfNo=2&cciNo=3&cnpClsNo=2

법규·정책
- https://law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1006183887
- https://www.law.go.kr/LSW/expcInfoP.do?expcSeq=328023
- https://www.kca.go.kr/odr/pg/ma/cnsutInfo.do
- https://www.fnnews.com/news/202611011852324794
- https://support.google.com/adsense/answer/10502938?hl=en
- https://support.google.com/adspolicy/answer/6020955?hl=en
- https://support.google.com/adspolicy/answer/9683742?hl=en
- https://adfit.kakao.com/web/html/use_kakao.html

구현 힌트
- https://dev.to/diegotorres_es/implementing-a-cryptographically-secure-shuffle-fisher-yates-with-csprng-in-javascript-20oj
- https://dev.to/rana_abdullah_1e5a9a4eabe/how-to-build-a-spin-wheel-thats-actually-fair-cryptogetrandomvalues-rejection-sampling-28pc
- https://lemire.me/blog/2016/06/30/fast-random-shuffling/
- https://github.com/Tehes/poker/pull/32

---

## 13. 이번 조사의 한계

- 법령 조문, 판결문, 상표청 기록 같은 1차 자료는 직접 열람하지 못했다. 저작권·상표 판단은 2차 자료(위키백과, 블로그, 법률 안내문) 기반이다.
- Benebell Wen 핸드북 PDF는 본문 추출에 실패해 검색 요약만 반영했다. sacred-texts.com은 403으로 열리지 않았다.
- 한국 점술 서비스 면책 의무, 점술에 대한 소비자 경고, 타로 검색량은 찾지 못했다.
- 카드별 의미 데이터는 구조와 샘플만 제시했다. 78장 전체 문장은 자체 작성·검수 단계에서 만든다.
- 모든 법적 판단은 서비스 출시 전에 법률 전문가 확인을 받아야 한다.
