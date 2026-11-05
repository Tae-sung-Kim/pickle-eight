# Third-Party Notices

This project depends on the following third-party software. Their licenses permit commercial use under the terms below. This document is informational; please refer to each package’s LICENSE for the full text.

- Next.js — MIT License — https://github.com/vercel/next.js
- React / React DOM — MIT License — https://github.com/facebook/react
- TypeScript — Apache-2.0 — https://github.com/microsoft/TypeScript
- Tailwind CSS — MIT License — https://github.com/tailwindlabs/tailwindcss
- shadcn/ui (Radix UI components wrapping) — MIT License — https://ui.shadcn.com/
- Radix UI (Dialog/Select/Slider/Switch/Tooltip/etc.) — MIT License — https://www.radix-ui.com/
- @tanstack/react-query — MIT License — https://github.com/TanStack/query
- React Hook Form — MIT License — https://github.com/react-hook-form/react-hook-form
- Zod — MIT License — https://github.com/colinhacks/zod
- Zustand — MIT License — https://github.com/pmndrs/zustand
- Supabase JS (@supabase/supabase-js) — MIT License — https://github.com/supabase/supabase-js
- tw-animate-css — MIT License — https://github.com/Wombosvideo/tw-animate-css
- downloadjs — MIT License — https://github.com/rndme/download
- Axios — MIT License — https://github.com/axios/axios
- Framer Motion — MIT License — https://github.com/framer/motion
- Lucide React — ISC License — https://github.com/lucide-icons/lucide
- clsx — MIT License — https://github.com/lukeed/clsx
- class-variance-authority — Apache-2.0 — https://github.com/joe-bell/cva
- tailwind-merge — MIT License — https://github.com/dcastil/tailwind-merge
- html-to-image — MIT License — https://github.com/bubkoo/html-to-image
- sonner — MIT License — https://github.com/emilkowalski/sonner

Dev dependencies (selection):

- Biome (@biomejs/biome) — MIT License
- PostCSS — MIT License
- @types/\* — MIT License
- Playwright (@playwright/test) — Apache-2.0

Fonts (loaded from CDN at runtime):

- Pretendard — SIL Open Font License 1.1 — https://github.com/orioncactus/pretendard

Original artwork and content (Tarot):

- Tarot card artwork (78 card faces and the card back) is original work drawn as inline SVG code in `src/features/tarot/shared/components/` (created 2026-11, authored in this repository). No third-party tarot deck images, scans, icon sets, stock images or AI image-generation tools were used. The artwork does not reproduce any existing deck's composition.
- Card interpretation text, position guides, topic examples, FAQ and guide copy are original text written for this project (authored by an AI assistant under the project owner's direction, without reference to third-party interpretation texts; reviewed by the project owner). Authorship, dates and review status are logged in `docs/tarot/copy-log.md`, which also records a sampled web-search check for matching sentences (not an exhaustive check).
- No new dependencies, fonts or icon sets were added for the Tarot feature. Lucide React icons are used only for general UI (buttons, menu), never for card artwork.
- This service is not affiliated with, endorsed by or sponsored by any tarot deck publisher, author or trademark holder.

Notes:

- Apache-2.0 packages: class-variance-authority (client bundle), TypeScript and Playwright (development only).
- Pretendard is used unmodified under SIL OFL 1.1, which permits commercial use. The font may not be sold by itself.
- This project does not embed or redistribute ad network SDKs; they are loaded from vendor CDNs at runtime subject to vendor terms.
