# 🥒 Pickle-eight - 랜덤 추첨 서비스

Pickle-eight은 다양한 랜덤 추첨 기능(로또, 항목 추첨, 자리 배정, 사다리타기 등)을 제공하는 웹 애플리케이션입니다.

---

## ✨ 주요 기능

- **랜덤 번호 추첨**: 로또, 사용자 지정 범위 내에서 숫자 뽑기
- **항목 추첨기**: 여러 명 중 무작위 추첨, 경품 뽑기
- **자리 배정기**: 입력한 이름을 랜덤하게 자리 배치
- **사다리 타기**: 커스텀 사다리 + 결과 입력
- **주사위 굴리기**: 주사위를 굴려서 값에 따라 결정
- **로또 번호 추첨 생성**: 로또 랜덤 번호 생성
- **로또 분석**: 회차별 당첨 번호, 자주 나온 번호 등 통계
- **결과 공유**: 캡처/링크 공유, 소셜 연동
- **사용자 저장**: 자주 쓰는 목록 저장 (로그인 연동)

---

## 🛠️ 기술 스택

- **Next.js 15 (App Router)**
- **TypeScript**
- **Tailwind CSS + Shadcn UI**
- **React Hook Form + Zod**
- **TanStack Query (react-query)**
- **Zustand**
- **Firebase (Authentication, Firestore)**
- **Vercel 배포**

---

## 📁 프로젝트 구조

```plaintext
/app
  /(auth)                  # 인증 관련 라우트
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
    /ui                    # Shadcn/ui 컴포넌트
    /features              # 기능별 컴포넌트
  /hooks                   # 커스텀 훅
  /providers               # Context/Provider 컴포넌트
  /stores                  # Zustand 스토어
  /types                   # 타입 정의
  /styles                  # 전역 스타일
  /services                # API 호출 서비스
  /constants               # 상수
  /utils                   # 유틸리티 함수
  /schemas                 # Zod 스키마
```

⚡️ 시작하기

## 의존성 설치

```bash
pnpm install
```

## 개발 서버 실행

```bash
pnpm run dev
```
