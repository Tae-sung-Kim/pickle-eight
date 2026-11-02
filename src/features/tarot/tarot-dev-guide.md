# 타로 점 앱 개발 가이드

타로 규칙과 보는 법을 정리하고, 이를 코드로 구현하기 위한 방법을 담은 문서.

---

## 1. 타로 기본 개념

- 카드 78장으로 보는 점술 도구.
- 과학적으로 증명된 것은 아니며, **참고용 / 생각 정리용**으로 사용한다.
- 기원: 15세기 이탈리아 카드 게임. 점술 용도는 18세기 이후.

### 1.1 카드 구성

| 구분 | 장수 | 설명 |
|---|---|---|
| 메이저 아르카나 | 22장 | 0 바보(The Fool) ~ 21 세계(The World). 큰 흐름, 인생 사건 |
| 마이너 아르카나 | 56장 | 4개 수트 × 14장. 일상 상황 |

### 1.2 마이너 아르카나 수트

| 수트 | 영문 | 의미 |
|---|---|---|
| 완드 | Wands | 열정, 행동, 에너지, 창의 |
| 컵 | Cups | 감정, 관계, 직관 |
| 소드 | Swords | 생각, 갈등, 결정 |
| 펜타클 | Pentacles | 돈, 일, 현실, 몸 |

- 각 수트 14장: 에이스(1) ~ 10, 시종(Page), 기사(Knight), 왕비(Queen), 왕(King)

### 1.3 메이저 아르카나 목록

| 번호 | 영문 | 한글 |
|---|---|---|
| 0 | The Fool | 바보 |
| 1 | The Magician | 마법사 |
| 2 | The High Priestess | 여사제 |
| 3 | The Empress | 여황제 |
| 4 | The Emperor | 황제 |
| 5 | The Hierophant | 교황 |
| 6 | The Lovers | 연인 |
| 7 | The Chariot | 전차 |
| 8 | Strength | 힘 |
| 9 | The Hermit | 은둔자 |
| 10 | Wheel of Fortune | 운명의 수레바퀴 |
| 11 | Justice | 정의 |
| 12 | The Hanged Man | 매달린 사람 |
| 13 | Death | 죽음 |
| 14 | Temperance | 절제 |
| 15 | The Devil | 악마 |
| 16 | The Tower | 탑 |
| 17 | The Star | 별 |
| 18 | The Moon | 달 |
| 19 | The Sun | 태양 |
| 20 | Judgement | 심판 |
| 21 | The World | 세계 |

---

## 2. 타로 보는 법 (진행 순서)

1. **질문 정하기**: 구체적으로 하나만. 예) "이직 준비를 지금 시작해도 될까?"
2. **카드 섞기**: 질문에 집중하며 섞는다.
3. **스프레드 선택**: 카드를 펼치는 배치법을 고른다.
4. **카드 뽑기 / 뒤집기**: 한 장씩 위치에 맞게 뒤집는다.
5. **해석**: 카드 의미 + 위치 의미 + 질문 상황을 연결한다.
6. **기록**: 날짜, 질문, 결과를 남긴다.

---

## 3. 규칙

### 3.1 전통 관례 (공식 규칙 없음)

- 한 번에 질문 **하나**만 한다.
- 같은 질문을 **반복해서 다시 뽑지 않는다**. 마음에 안 든다고 재뽑기하면 의미가 없다.
- 결과는 **결정이 아니라 참고**로 쓴다.
- 건강, 돈, 법률 판단은 타로가 아닌 전문가에게 맡긴다.
- 결과로 사람을 평가하거나 단정하지 않는다.
- 역방향 사용은 선택 사항. 안 쓰는 리더도 많다.

### 3.2 앱 구현 규칙

| 규칙 | 내용 |
|---|---|
| 셔플 | 78장 전체를 공정하게 섞는다 (Fisher-Yates) |
| 중복 방지 | 한 번의 리딩에서 같은 카드가 두 번 나오지 않는다 |
| 방향 | 정방향 50% / 역방향 50% (옵션으로 역방향 끄기 가능) |
| 질문 | 질문 입력 필수. 같은 질문 짧은 시간 내 재뽑기 경고 |
| 스프레드 | 뽑는 장수와 위치 의미는 스프레드마다 고정 |
| 저장 | 날짜, 질문, 스프레드, 카드, 방향 기록 |
| 면책 | "참고용이며 의료·금융·법률 판단이 아님" 문구 표시 |
| 톤 | 단정 대신 "~일 수 있어요" 식으로 표현 |

---

## 4. 스프레드 (카드 배치)

### 4.1 원카드 (1장)

| 위치 | 의미 |
|---|---|
| 1 | 오늘의 기운 / 핵심 메시지 |

### 4.2 쓰리카드 (3장)

**버전 A: 시간 흐름**

| 위치 | 의미 |
|---|---|
| 1 | 과거 |
| 2 | 현재 |
| 3 | 미래 |

**버전 B: 상황 분석**

| 위치 | 의미 |
|---|---|
| 1 | 상황 |
| 2 | 장애물 |
| 3 | 조언 |

### 4.3 켈틱 크로스 (10장)

| 위치 | 의미 |
|---|---|
| 1 | 현재 상황 |
| 2 | 장애 / 도전 |
| 3 | 근본 원인 (무의식) |
| 4 | 과거 |
| 5 | 의식 / 목표 |
| 6 | 가까운 미래 |
| 7 | 나 자신의 태도 |
| 8 | 주변 환경 |
| 9 | 희망과 두려움 |
| 10 | 최종 결과 |

---

## 5. 해석 로직

1. 카드의 **방향**에 맞는 의미를 가져온다.
2. 카드가 놓인 **위치 의미**를 붙인다.
3. 카드들의 **전체 분위기**를 본다.
   - 메이저가 많으면: 큰 흐름, 운명적 사건
   - 같은 수트가 많으면: 해당 수트 영역이 강조됨
   - 역방향이 많으면: 막힘, 내면 점검 필요
4. 템플릿으로 문장을 조합한다.
   - 예: `[위치]에서 [카드명]([방향])이 나왔어요. [키워드]와 관련이 있을 수 있어요.`
5. 마지막에 **종합 요약 / 조언 한 줄**을 붙인다.

---

## 6. 데이터 설계

### 6.1 카드 데이터 (cards.json)

```json
{
  "id": "major-00",
  "name": "The Fool",
  "nameKo": "바보",
  "arcana": "major",
  "suit": null,
  "number": 0,
  "keywords": ["시작", "자유", "모험"],
  "upright": "새로운 시작, 순수한 용기, 가능성",
  "reversed": "무모함, 준비 부족, 망설임",
  "image": "/cards/major-00.png"
}
```

### 6.2 스프레드 데이터 (spreads.json)

```json
{
  "id": "three-card-time",
  "name": "쓰리카드 (과거-현재-미래)",
  "positions": [
    { "index": 0, "label": "과거" },
    { "index": 1, "label": "현재" },
    { "index": 2, "label": "미래" }
  ]
}
```

### 6.3 리딩 기록 (reading)

```json
{
  "id": "uuid",
  "createdAt": "2026-11-02T13:00:00+09:00",
  "question": "이직 준비를 지금 시작해도 될까?",
  "spreadId": "three-card-time",
  "cards": [
    { "cardId": "major-00", "position": 0, "reversed": false }
  ]
}
```

---

## 7. 핵심 로직 예시 (TypeScript)

```ts
// 공정한 셔플 (Fisher-Yates + crypto 랜덤)
function randomInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 리딩 생성
function draw(cards: Card[], spread: Spread, useReversed = true) {
  const deck = shuffle(cards);
  return spread.positions.map((pos, i) => ({
    position: pos,
    card: deck[i],
    reversed: useReversed ? randomInt(2) === 1 : false,
  }));
}

// 해석 문장 생성
function interpret(item: { position: Position; card: Card; reversed: boolean }) {
  const meaning = item.reversed ? item.card.reversed : item.card.upright;
  const dir = item.reversed ? "역방향" : "정방향";
  return `${item.position.label}: ${item.card.nameKo}(${dir}) - ${meaning}`;
}
```

---

## 8. 개발 단계 (로드맵)

### 1단계: MVP
- [ ] 카드 데이터 78장 JSON 작성
- [ ] 셔플 / 뽑기 로직
- [ ] 원카드, 쓰리카드 스프레드
- [ ] 결과 화면 (카드 + 해석 텍스트)

### 2단계: 경험 개선
- [ ] 카드 뒤집기 애니메이션 (CSS transform)
- [ ] 질문 입력 UI
- [ ] 역방향 on/off 옵션
- [ ] 카드 이미지 적용

### 3단계: 기능 확장
- [ ] 켈틱 크로스 등 스프레드 추가
- [ ] 리딩 기록 저장 (로컬스토리지 → DB)
- [ ] 기록 목록 / 다시 보기
- [ ] 공유 기능 (이미지 / 링크)

### 4단계: 운영
- [ ] 면책 문구 / 이용 약관
- [ ] SEO, 성능 점검
- [ ] 수익화 (광고, 제휴 등)

---

## 9. 주의사항

- **카드 이미지 저작권**: 라이더-웨이트 덱 원본은 저작권 상태를 확인할 것. 직접 제작하거나 퍼블릭 도메인 / 라이선스가 명확한 이미지를 사용한다.
- **해석 텍스트**: 타 사이트, 책 내용을 그대로 복사하지 않는다. 직접 작성하거나 AI로 생성 후 검수한다.
- **면책 표시**: 오락 / 참고용임을 명확히 한다.
- **민감 주제**: 건강, 죽음, 법률, 투자 질문에는 전문가 상담 안내 문구를 넣는다.
- **개인정보**: 질문 내용이 민감할 수 있으므로 저장 시 최소화하고 보관 정책을 명시한다.

---

## 10. 추천 기술 스택

| 영역 | 후보 |
|---|---|
| 프레임워크 | React + Next.js 또는 Vue + Nuxt |
| 언어 | TypeScript |
| 스타일 | CSS Modules, Tailwind |
| 애니메이션 | CSS transform, Framer Motion |
| 저장 | localStorage → Supabase / Firebase |
| 배포 | Vercel |
| 테스트 | Vitest (셔플, 해석 로직 단위 테스트) |
