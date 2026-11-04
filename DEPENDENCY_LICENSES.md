# Dependency License Summary

This document summarizes the primary licenses of first-level dependencies declared in `package.json` as of 2026-11-04. For precise, up-to-date details and transitive dependencies, run a license tool (see the bottom section).

## Runtime dependencies

- @hookform/resolvers — MIT
- @radix-ui/react-dialog — MIT
- @radix-ui/react-label — MIT
- @radix-ui/react-navigation-menu — MIT
- @radix-ui/react-select — MIT
- @radix-ui/react-slider — MIT
- @radix-ui/react-slot — MIT
- @radix-ui/react-switch — MIT
- @radix-ui/react-tooltip — MIT
- @radix-ui/react-visually-hidden — MIT
- @supabase/supabase-js — MIT
- @tanstack/react-query — MIT
- axios — MIT
- class-variance-authority — Apache-2.0
- clsx — MIT
- downloadjs — MIT
- framer-motion — MIT
- html-to-image — MIT
- lucide-react — ISC
- next — MIT
- react — MIT
- react-dom — MIT
- react-hook-form — MIT
- sonner — MIT
- tailwind-merge — MIT
- zod — MIT
- zustand — MIT

## Dev dependencies

- @biomejs/biome — MIT OR Apache-2.0
- @playwright/test — Apache-2.0
- @tailwindcss/postcss — MIT
- @types/downloadjs — MIT
- @types/node — MIT
- @types/react — MIT
- @types/react-dom — MIT
- postcss — MIT
- tailwindcss — MIT
- tw-animate-css — MIT
- typescript — Apache-2.0

## Notes and obligations

- Apache-2.0 packages (class-variance-authority, @playwright/test, typescript): keep their LICENSE/NOTICE files if you redistribute them. Only class-variance-authority ships in the client bundle.
- Web font: Pretendard (SIL Open Font License 1.1) is loaded from a CDN at runtime. See `THIRD_PARTY_NOTICES.md`.
- This summary covers direct dependencies. Transitive packages may include other licenses (mostly permissive in this ecosystem). Use a tool to generate a full SBOM.

## How to regenerate this report

You can generate a machine-readable license report with one of the following approaches:

- Using `license-checker` (npm):

  ```bash
  pnpm dlx license-checker --production --summary
  pnpm dlx license-checker --json > licenses-full.json
  ```
- Using `pnpm licenses list` (pnpm):

  ```bash
  pnpm licenses list --prod --json > licenses-full.json
  ```
- Using `pnpm ls --json` + a license tool like `licensee` or `oss-review-toolkit` for deeper audits.

Record the artifact (e.g., `licenses-full.json`) during release to keep provenance for compliance.
