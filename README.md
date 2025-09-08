# 🥒 운빨연구소 - 랜덤 추첨 & 로또 & AI 퀴즈/추천 서비스

운빨연구소는 로또, 다양한 랜덤 추첨 기능(항목 추첨, 자리 배정, 사다리타기 등), OpenAI API를 활용한 상식·영어·사자성어 퀴즈, 오늘의 추천/운세/메뉴 등 엔터테인먼트 요소를 제공하는 웹 애플리케이션입니다.
간편하고 직관적인 UI, 모바일 최적화, 공유 기능, 광고 수익화를 갖추었으며, 지속적인 기능 확장을 진행 중입니다.

---

## 📚 Table of Contents

- 소개 및 하이라이트
- 신규/핵심 기능 한눈에 보기
- 전체 기능 개요 (코어/MVP/확장)
- 빠른 이동(로또)
- 기술 스택
- 프로젝트 구조
- 시작하기(설치/실행)
- 팔레트 → 의미 토큰 가이드
- 환경 변수(.env)
- 크레딧 & 보상형 광고 정책 (Applixir)
- Consent(쿠키 동의) & Age Gate & 프라이버시
- SEO 가이드
- 스크립트
- 배포
- 기여 가이드
- 로드맵
- 주의 & 책임
- 라이선스 / 크레딧 / 통계 / 개인정보 / 문의

---

## ✨ 신규/핵심 기능 한눈에 보기

- **로또(Lotto) 통합 기능**
  - 번호 생성기: 일반 생성, **고급 생성(필터·패턴·빈도 가중치)**
  - 결과 확인: 내 번호 당첨 여부/순위 계산, 상세 결과 카드
  - 통계/분석: 번호 빈도, 패턴, 최근 회차 기반 제외/가중치 적용
  - 시뮬레이터: 대량 추첨 시뮬레이션, 비용·횟수 기반 빠른 검증
  - 회차별 이력: 지난 회차별 번호/판매액/1등 당첨 정보
- **오늘의 추천 시리즈 (OpenAI 연동)**
  - 오늘의 추천 메뉴, 오늘의 운세/응원 문구, 오늘의 할 일, 대화형 프롬프트 기반 추천
  - 사용자 입력(키워드·기분·날씨 등)에 따라 맞춤 생성
- **게임/퀴즈**
  - 숫자 맞추기 게임(스코어·랭킹 확장 예정)
  - 사자성어/영단어/상식 퀴즈(빈칸 채우기/선다형)
- **결과 공유 & 캡처**
  - 이미지 캡처 다운로드, 공유 가능한 링크 생성, 소셜 미디어 연동
- **수익화 & 운영**
  - 보상형 광고(Applixir) + **크레딧 시스템**
  - 쿠키 동의/연령 확인(Age Gate) + Firebase Analytics

---

## 🧩 전체 기능 개요

- 코어(Random 픽커/유틸)
  - 로또 번호 생성(일반/고급), 번호 범위 추첨기(예: 1~100 중 N개)
  - 이름 추첨기(다중 입력 → 당첨자 수 지정, 경품 추첨)
  - 자리 배정기(이름+자리 수 → 랜덤 배치, 시각화)
  - 사다리 타기(참여자/결과 입력, 애니메이션)
  - 주사위 굴리기(동점 규칙: 동일 수 페어 우선, 높은 페어 우선)
  - 순서 정하기 뽑기(최종 개수에 따른 원형 UI, 사용자 직접 선택)
- AI/게임/콘텐츠
  - 오늘의 추천(메뉴/운세/문구 등), 점심/술자리 메뉴 추천
  - 챗GPT 기반 빈칸 채우기 게임, 사자성어·영단어·상식 퀴즈
  - 숫자 맞추기 게임(랭킹/확장 예정)
- 공유/저장/확장
  - 결과 캡처, 공유 URL, 소셜 공유
  - (예정) 사용자 저장/즐겨찾기, 로그인 유저 기능, 클라우드 동기화
- 운영/수익화
  - Applixir 보상형 광고, 직접 배너/제휴 네트워크(계획), ads.txt 구성
  - Firebase Analytics 또는 Plausible(선택)

---

## 빠른 이동(로또)

- 로또 일반 생성기: `/lotto/normal-generator`
- 로또 고급 생성기: `/lotto/advanced-generator`
- 로또 분석: `/lotto/analysis`
- 로또 시뮬레이터: `/lotto/simulator`
- 로또 회차 이력: `/lotto/history`
- 로또 결과 확인: `/lotto/check`

---

## 🔎 무작위성 & 컴플라이언스 요약

- 무작위 생성: 일반 생성기는 브라우저 Web Crypto의 `crypto.getRandomValues`(거절 샘플링으로 모듈로 바이어스 제거)를 사용합니다. 미지원 환경에서는 안전 폴백(`Math.random`)을 사용합니다.
- 비예측/비분석: AI 예측이나 통계·패턴 분석을 사용하지 않습니다. 결과는 순수 무작위이며 참고용입니다.
- 투명성 표기: 생성 시 UI에 "생성 기준: [시각] · RNG: [crypto/Math.random]"을 표시합니다.
- 연령/동의: 로또 경로에 Age Gate(연령 확인), 전역 Cookie Consent(동의 전 분석/광고 제한)를 적용합니다.
- 광고 표기: 모든 광고 영역에 상시 "광고" 라벨을 노출하며, 사용자 동의 후에만 광고 스크립트를 로드합니다.

---

## 📁 프로젝트 구조

```plaintext
/src
  app/                          # App Router (pages, layouts, api)
    lotto/
      normal-generator/
      advanced-generator/
      analysis/
      simulator/
      history/
      check/
    api/
      lotto/
        draws/                  # GET /api/lotto/draws
        sync/                   # POST /api/lotto/sync
        export/                 # GET /api/lotto/export
    (auth)/
    layout.tsx
    page.tsx
    loading.tsx
    error.tsx
    not-found.tsx
  components/                   # 공용 컴포넌트
    ui/                         # Shadcn UI
    shared/
    layouts/
  hooks/
  providers/
  stores/
  types/
  styles/
  services/
  constants/
  utils/
  schemas/
```

---

## 🚀 프로젝트 특징 및 차별점

## 실제 사용자 경험 중심 설계

- **모바일/데스크톱 완벽 대응, 직관적 UX, 빠른 반응속도**
- **결과 공유, 캡처, URL 생성 등 실생활 활용성 강화**

## AI 활용 확장성

- **OpenAI API 연동으로 지능형 추천/퀴즈/게임 기능 제공**
- 프롬프트 템플릿 기반 추천(날씨/기분/상황 등)

## 클린 코드 & 확장성

- **Airbnb 스타일 가이드, 타입 엄격성, 컴포넌트/비즈니스 로직 분리**
- **불변성, 커스텀 훅/스토어 활용**

## 수익화 및 통계

- **보상형 Applixir 광고 + 크레딧 시스템**, Firebase Analytics 연동

## SEO 및 접근성

- **메타 태그, 구조화 데이터(JSON-LD), 브레드크럼, 접근성 고려**

---

## 💳 크레딧 & 보상형 광고 정책

- **보상 방식**: 영상 광고 시청 시간에 따라 단계별 보상 (운영 값 기준 `rewardAmount`, `stepReward`, `maxPerAd` 적용)
- **제한 정책**:
  - 쿨다운: `cooldownMs` 동안 재시청 불가
  - 일일 상한: `dailyCap` 도달 시 추가 적립 불가
- **구현 개요**:
  - 훅: `src/hooks/use-ad-credit.hook.ts` (쿨다운, 일일한도, 재생/일시정지 트래킹, 보상 계산)
  - 유틸: `src/utils/ad-credit.util.ts` (`computeRewardByWatch`, `formatCooldown`, `getAnonymousId`)
  - UI: `CreditBalancePillComponent`, `RewardModalComponent` 등
  - 광고 네트워크: Applixir 연동, 승인 대기/부족 재고 등 상태 메시지 처리
- **승인/재고 안내**:
  - 매체 심사 보류(`mediaReviewPending`), 사이트 미승인(`siteNotApproved`), 광고 없음/재고 부족(`ads-unavailable`) 시, 모달과 UI에서 명확히 안내합니다. 승인이 완료되면 정상 시청/적립이 가능합니다.
- **동의 및 라벨링**:
  - 사용자 동의(`accepted`) 후에만 광고 스크립트를 로드하며, 모든 광고 컴포넌트에 상시 "광고" 라벨을 표기합니다.

---

## ☁️ 배포

- **Vercel**에 배포하며, 환경 변수는 Vercel Project Settings에 등록합니다.
- 빌드 후 기본적으로 Edge/SSR 혼합 구조를 사용합니다(App Router).

---

## 🤝 기여 가이드

- **코드 스타일**: Airbnb + Prettier, 함수는 단일 책임/짧은 길이 유지, 매직 넘버 상수화.
- **명명 규칙**: 파일/디렉터리 `kebab-case`, 변수/함수 `camelCase`, 클래스 `PascalCase`.
- **타입**: 모든 공개 API/컴포넌트/훅에 타입 명시, `any` 지양.
- **UI**: Tailwind + Shadcn UI 사용, 토큰 기반 색상(팔레트 직접 사용 지양).
- **데이터**: React Query/TanStack Query로 서버 상태, Zustand로 클라이언트 상태 관리.

---

## 🗺️ 로드맵(요약)

- [x] 로또/랜덤 추첨/자리 배정/사다리/주사위
- [x] 결과 공유(이미지 캡처/링크)
- [x] 보상형 광고(Applixir) + 크레딧 시스템
- [x] 동의/연령 확인 모달, Analytics 연동
- [x] SEO 표준화(JSON-LD/브레드크럼)
- [ ] 저장/즐겨찾기(계정 연동)
- [ ] PWA/모바일 앱 확장
- [ ] 프리미엄 테마(광고 제거) 및 수익화 고도화

---

## ⚠️ 주의 & 책임

- 본 서비스는 오락/정보 제공용입니다. 복권/도박과 관련된 법령을 준수하고 책임감 있게 이용해주세요.
- 본 서비스는 어떠한 기관과도 제휴/보증 관계가 없습니다. (비공식)
- 로또 번호 생성은 CSPRNG(Web Crypto) 기반의 순수 무작위이며, AI 예측이나 통계·패턴 분석을 사용하지 않습니다.

---

## 📄 라이선스

- 본 프로젝트는 MIT License를 따릅니다. 자세한 내용은 루트의 `LICENSE` 파일을 참고하세요.
- 서드파티 라이선스 고지는 `THIRD_PARTY_NOTICES.md`를 참고하세요.
- 크롤링/수집 정책은 `public/robots.txt`와 각 페이지 하단/정책 문서를 참고하세요.

## 🙏 크레딧

- 운빨연구소은 다양한 오픈소스 프로젝트와 라이브러리의 도움을 받았습니다. 이 프로젝트에 기여해주신 모든 분께 감사드립니다.

## 📈 보상형 광고

- 운빨연구소은 Applixir의 보상형 광고를 사용하고 있습니다. 광고 시청에 대한 보상을 받으실 수 있습니다.

## 📊 통계

- 운빨연구소은 Firebase Analytics를 사용하여 사용자 통계를 수집하고 있습니다. 통계는 서비스 개선에 사용됩니다.

## 📝 개인정보처리방침

- 운빨연구소은 사용자의 개인정보를 보호하기 위해 최선을 다하고 있습니다. 개인정보처리방침은 서비스 이용약관에 따라 적용됩니다.

## 📞 문의

- 운빨연구소에 대한 문의는 사이트 하단의 링크를 통해서 가능합니다.

---

## 🔄 Lotto 데이터 동기화/백업 가이드

본 서비스는 사용자 경로에서 외부 로또 API를 직접 호출하지 않습니다. 서버 측 크론 작업으로 데이터를 동기화하여 Firestore(`lotto_draws`)에 저장하고, API는 저장된 데이터만 제공합니다. 이는 상업적 이용 시 외부 서비스 약관 위반 소지를 줄이기 위한 설계입니다.

- 동기화 엔드포인트: `POST /api/lotto/sync`

  - 보안 헤더: `x-cron-secret: $CRON_SECRET`
  - 모드
    - 단일: `POST /api/lotto/sync?drwNo=1234`
    - 범위: `POST /api/lotto/sync?from=1&to=1100`
    - 전진 동기화(기본): `POST /api/lotto/sync?forward` 또는 쿼리 없이 호출 → 저장된 최신 회차 이후부터 연속 조회하여 더 이상 발행된 회차가 없을 때까지 저장
  - 주의: 외부 데이터 소스는 약관/저작권/접근정책이 적용되며, 상업적 이용/수집/크롤링에 제약이 있을 수 있습니다. 이용 약관과 robots.txt를 확인하고, 필요한 경우 사전 서면 허가를 받으세요.

- 조회 엔드포인트: `GET /api/lotto/draws`

  - 최신 회차 번호: `GET /api/lotto/draws?latest`
  - 단일 회차: `GET /api/lotto/draws?drwNo=1234`
  - 범위: `GET /api/lotto/draws?from=1000&to=1100`
  - 모든 응답은 Firestore에 사전 저장된 데이터만 반환합니다. 저장되지 않은 회차는 404 또는 부분 응답으로 표시됩니다.

- CSV 내보내기: `GET /api/lotto/export`
  - 전체(기본): `GET /api/lotto/export` → `1..latest` 범위
  - 범위 지정: `GET /api/lotto/export?from=1000&to=1100`
  - 응답 헤더: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="lotto_draws_..."`

### 환경 변수

- `.env`에 다음을 추가하세요:
  - `CRON_SECRET`: 크론 잡에서 `x-cron-secret` 헤더로 전달할 비밀값

### Vercel Cron 설정 예시

Vercel 프로젝트의 Settings → Cron Jobs에서 다음과 같이 구성합니다.

- Path: `/api/lotto/sync?forward`
- Schedule: `30 12 * * SAT` (UTC) → KST 토요일 21:30
- Schedule: `0 18 * * SAT` (UTC) → KST 일요일 03:00 (백업 실행)
- Headers:
  - Key: `x-cron-secret`, Value: `${CRON_SECRET}`

필요 시 초기 적재를 위해 일회성으로 `?from=1&to=<초기범위>`를 등록하고 완료 후 제거하세요.

### Firestore 권한/인덱스

- 컬렉션: `lotto_draws`
- 문서 ID: 문자열 `"<drawNumber>"`
- 읽기 인덱스: `orderBy(drawNumber)`와 `where(drawNumber, >= / <=)` 조합 조회가 있으므로 인덱스가 필요할 수 있습니다. Firebase 콘솔의 인덱스 에러 안내에 따라 생성하세요.

### 법적 유의사항(비제휴 고지)

- 본 서비스는 로또 운영기관/판매사와 제휴되어 있지 않습니다.
- 외부 데이터 소스는 약관/저작권/접근정책이 적용되며, 상업적 이용 전 반드시 정책을 확인하세요.
- 본 저장/동기화 구조는 사용자 요청 경로에서의 직접 호출을 피하고, 최소 빈도/지연을 둔 서버 측 동기화(레이트 리밋 포함)로 트래픽·정책 리스크를 낮추도록 설계되었습니다. 다만, 최종 법적 판단은 별도 검토가 필요합니다.
