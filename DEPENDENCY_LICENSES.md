# Dependency License Summary

This document summarizes the primary licenses of first-level dependencies declared in `package.json` as of 2025-09-05. For precise, up-to-date details and transitive dependencies, run a license tool (see the bottom section).

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
- @tanstack/react-query — MIT
- axios — MIT
- class-variance-authority — MIT
- clsx — MIT
- firebase — Apache-2.0
- firebase-admin — Apache-2.0
- framer-motion — MIT
- html-to-image — MIT
- lucide-react — ISC
- next — MIT
- next-themes — MIT
- react — MIT
- react-dom — MIT
- react-hook-form — MIT
- sonner — MIT
- tailwind-merge — MIT
- uuid — MIT
- zod — MIT
- zustand — MIT

## Dev dependencies (selection)

- @eslint/eslintrc — MIT
- @next/eslint-plugin-next — MIT
- @tailwindcss/postcss — MIT
- @types/\* — MIT
- autoprefixer — MIT
- downloadjs — MIT
- eslint — MIT
- eslint-config-next — MIT
- eslint-plugin-react-hooks — MIT
- postcss — MIT
- tailwindcss — MIT
- tailwindcss-animate — MIT
- typescript — Apache-2.0

## Notes and obligations

- Firebase and Firebase Admin are under Apache License 2.0. If redistributing binaries/source that include these, ensure NOTICE requirements are met. See `THIRD_PARTY_NOTICES.md`.
- This summary covers direct dependencies. Transitive packages may include other licenses (mostly permissive in this ecosystem). Use a tool to generate a full SBOM.

## How to regenerate this report

You can generate a machine-readable license report with one of the following approaches:

- Using `license-checker` (npm):
  ```bash
  npx license-checker --production --summary
  npx license-checker --json > licenses-full.json
  ```
- Using `pnpm licenses list` (pnpm):
  ```bash
  pnpm licenses list --prod --json > licenses-full.json
  ```
- Using `npm ls --json` + a license tool like `licensee` or `oss-review-toolkit` for deeper audits.

Record the artifact (e.g., `licenses-full.json`) during release to keep provenance for compliance.
