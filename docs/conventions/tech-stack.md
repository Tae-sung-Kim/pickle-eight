# 기술 스택·명령어

모든 agent가 따른다.

## 기술 스택

모든 agent는 이 스택을 따른다. 새 라이브러리 추가는 architect가 이유를 적고 사용자 승인을 받는다.

- Node.js 24 (`.nvmrc`), Next.js 16 (App Router), React 19, TypeScript 5
- HTTP 클라이언트: `axios` (`src/lib/http.ts`의 `http` 인스턴스)
- 토스트 `sonner`, className 병합 `cn()` (`src/lib/utils.ts`, clsx + tailwind-merge), 변형 `class-variance-authority`, 화면 캡처 `html-to-image`
- Supabase (`@supabase/supabase-js`, 서버 클라이언트: `src/lib/supabase-server.ts`)
- 스타일: Tailwind CSS 4, shadcn/ui (Radix UI), 아이콘 `lucide-react`, 애니메이션 `framer-motion`, `tw-animate-css` (쓰는 기준은 `design-system.md` "모션")
- 상태: 서버 데이터 `@tanstack/react-query`, 전역 상태 `zustand` (`src/stores`)
- 폼·검증: `react-hook-form` + `zod`
- 린트·포맷: Biome (ESLint, Prettier 쓰지 않음)
- 테스트: Playwright (`e2e/`)
- 패키지 매니저: pnpm (npm, yarn 쓰지 않음)

## 명령어

- 개발 서버: `pnpm dev`
- 검증: `pnpm lint`, `pnpm typecheck`, `pnpm build`
- E2E: `pnpm e2e` (모바일: `pnpm e2e:mobile`)
