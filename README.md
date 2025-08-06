# 🥒 Pickle-eight - 랜덤 추첨 & AI 퀴즈 서비스

Pickle-eight은 다양한 랜덤 추첨 기능(로또, 항목 추첨, 자리 배정, 사다리타기 등)과 OpenAI API를 활용한 상식·영어·사자성어 퀴즈, 오늘의 추천/운세 등 엔터테인먼트 요소를 제공하는 웹 애플리케이션입니다.
간편하고 직관적인 UI, 모바일 최적화, 공유 기능, 광고 수익화 등 실사용에 필요한 기능을 모두 갖추기 위해 개발 중에 있습니다.

---

## ✨ 주요 기능

### AI 기반 퀴즈/추천

- **OpenAI API를 활용한 상식, 영어, 사자성어, 오늘의 응원/운세/할일/메뉴 추천 등**

### 랜덤 추첨

- **로또 번호 자동 생성, 사용자 지정 범위 내 숫자 추첨, 이름/항목 무작위 추첨, 경품 뽑기**

### 자리 배정기

- **입력한 이름을 랜덤하게 자리 배치, 시각적 자리 배치도 제공**

### 사다리 타기

- **커스텀 사다리 생성, 결과 입력 및 애니메이션 지원**

### 주사위 굴리기

- **주사위를 굴려서 결과 결정, 동점 처리 우선순위 로직 구현**

### 로또 번호 추천

- **로또 번호를 랜덤으로 생성성 (한번에 최대 10개)**

### 결과 공유

- **캡처 이미지 다운로드, 공유 가능한 링크 생성, 소셜 미디어 연동**

---

## 🛠️ 기술 스택

- **Next.js 15 (App Router)**
- **TypeScript**
- **Tailwind CSS + Shadcn UI**
- **TanStack Query (react-query)**
- **Zustand**
- **Firebase (Authentication, Firestore)**
- **Vercel 배포**
- **OpenAI API (퀴즈/추천)**

---

## 📁 프로젝트 구조

```plaintext
/app
  /(auth)                  # 인증 라우트
    /login
      page.tsx
    /signup
      page.tsx
  /dashboard
    /[id]                  # 다이나믹 라우트
      page.tsx
    layout.tsx
  /api
    /lotto-number
      route.ts
  layout.tsx
  page.tsx
  loading.tsx
  error.tsx
  not-found.tsx

/src
  /components              # 공용 컴포넌트
    /ui                    # Shadcn/ui
    /features              # 기능별 분리
  /hooks                   # 커스텀 훅
  /providers               # Context/Provider
  /stores                  # Zustand 스토어
  /types                   # 타입 정의
  /styles                  # 전역 스타일
  /services                # API 서비스
  /constants               # 상수
  /utils                   # 유틸 함수
  /schemas                 # Zod 스키마
```

# 🚀 프로젝트 특징 및 차별점

## 실제 사용자 경험 중심 설계

- **모바일/데스크톱 완벽 대응, 직관적 UX, 빠른 반응속도**
- **결과 공유, 캡처, URL 생성 등 실생활 활용성 강화**

## AI 활용 확장성

- **OpenAI API 연동으로 단순 추첨을 넘어 지능형 추천/퀴즈/게임 기능 제공**

## 클린 코드 & 확장성

- **Airbnb 스타일 가이드, 타입 엄격성, 컴포넌트/비즈니스 로직 분리**
- **불변성, 커스텀 훅/스토어 활용**

## 수익화 및 통계

- **광고 삽입(예정), 프리미엄 기능 계획, Firebase Analytics 연동**

## SEO 및 접근성

- **메타 태그 고려**

# 🏆 담당 역할 및 기여도

- **전체 아키텍처 설계 및 기술 스택 선정**
- **주요 서비스(랜덤 추첨, AI 퀴즈, 자리 배정, 사다리 등) 개발 및 UI/UX 설계**
- **Firebase 인증/DB/Analytics 연동, 배포 자동화(Vercel)**
- **광고 삽입, SEO 최적화**

# ⚡️ 시작하기

## 의존성 설치

```bash
pnpm install
```

## 개발 서버 실행

```bash
pnpm run dev
```
