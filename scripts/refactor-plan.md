# Refactoring Plan

## 1. Extract Shared API Utilities & Unified Wrapper
**Problem:** Repeated `verifyUid`, common error handling, AI retry logic, and JSON parsing logic across `src/app/api/**/route.ts`.
**Action:**
- Create `src/lib/api-utils.ts` to export standard `bad()` error responder, `verifyUid()`, and `extractFirstJsonObject()`.
- Create a reusable High Order Function (or simple helper) `withAiRetry(promptFn)` to handle the 3-attempt LLM call with built-in JSON parsing.
- Apply this to `src/app/api/lotto/user/*/route.ts` and `src/app/api/gpt/*/route.ts`.
**Benefit:** Eliminates dozens of lines of redundant authentication and data parsing logic.

## 2. Unify Page Wrapper & SEO Boilerplate
**Problem:** `src/app/**/page.tsx` files contain 40+ lines of identical layout wrappers (`ContentWrapper`, `BackHub`, `TitleWrapper`) and massive `metadata` objects.
**Action:**
- Create a `PageLayout` component that automatically includes the `ContentWrapper`, `BackHub`, `TitleWrapper`, and standard container padding.
- Create a `generateBaseMetadata(options)` utility in `src/lib/seo.ts` to compress the 30-line OpenGraph/Twitter card definitions into 3-5 lines per page.
- Apply these to `src/app/lotto/*/page.tsx`, `src/app/quiz/*/page.tsx`, and `src/app/random-picker/*/page.tsx`.
**Benefit:** Reduces page component boilerplate by ~70%, making the routing layer purely declarative.

## 3. Consolidate Simple Features
**Problem:** Overly nested folders in `src/features/` for simple features like `credit`, `ad`, and `consent`.
**Action:**
- Flatten `src/features/credit/`, `src/features/ad/`, and `src/features/consent/` so that small types, constants, and utilities are merged into single files (e.g., `src/features/credit.ts` or a flatter `credit/` structure).
- Merge repetitive `useMutation` hooks into generic factory functions or simpler inline declarations if they are extremely thin wrappers.
**Benefit:** Vastly improves file navigation speed and removes structural overhead for low-complexity modules.

## 4. Unify Lotto Data Fetching
**Problem:** Repetitive `useQuery` / `useMutation` definitions in `use-lotto-user.query.ts`.
**Action:**
- Use a query factory or standardized abstraction if the boilerplate becomes too noisy, or simply co-locate them with the services to reduce file jumping.
**Benefit:** Less jumping between `services` and `queries` folders.
