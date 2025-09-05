# Compliance Checklist (Production)

Last updated: 2025-09-05

This document summarizes legal/commercial and operational compliance items for Pickle-eight prior to production deployment.

## 1) Cookies, Consent, Privacy

- State: Implemented.
  - Global `ConsentProvider` manages `unknown | accepted | declined` with persistence in `localStorage`.
  - Analytics/ads scripts run only when consent is `accepted`.
  - `CookieSettingsButton` in footer allows reopening consent banner.
- Actions:
  - Confirm Privacy Policy and Terms list third parties (Firebase, Applixir, analytics) and data usage.
  - Provide contact email and effective date.

## 2) Age Gate (Lottery)

- State: Implemented.
  - AgeGate shows on `/lotto/*` routes with 30-day TTL.
  - Legacy true supported.
- Actions:
  - Verify copy and jurisdictional messaging where applicable.

## 3) Data Source and Sync (Lotto)

- State: Implemented per design.
  - External API not called on user routes. Server cron syncs via `POST /api/lotto/sync` (requires `x-cron-secret`).
  - Data stored in Firestore `lotto_draws`. Read via internal API `/api/lotto/draws`.
- Scheduling (Preference B):
  - Sat 21:30 KST, Sun 03:00 KST (backup) via Vercel Cron.
- Actions:
  - Review upstream TOS and robots rules periodically.
  - Maintain rate limiting/backoff for sync and export APIs.

## 4) Advertising and Monetization

- State: Implemented.
  - Applixir reward ads integrated. Credit system issues rewards on completed views.
  - Error states surfaced: `ads-unavailable`, `mediaReviewPending`, `siteNotApproved`.
  - Ad labels displayed consistently.
- `ads.txt`:
  - Ensure only active networks (e.g., Applixir, AdFit/AdSense if used) and correct publisher IDs are listed.
- Actions:
  - On approval completion, update UI copy to reflect availability.

## 5) Analytics and Telemetry

- State: Implemented and consent-gated.
  - `AnalyticsClientComponent` runs only when consent is `accepted`.
  - Telegram notification is also consent-gated.
- Actions:
  - Confirm anonymization and retention settings match policy.

## 6) Security Headers and CSP

- State: Implemented.
  - `Content-Security-Policy` set in `next.config.ts`.
  - `Reporting-Endpoints` and `Content-Security-Policy-Report-Only` added; reports handled at `/api/csp-report`.
- Actions:
  - Monitor CSP reports for a few days and tighten domains (reduce wildcards).
  - Consider adding `report-to` JSON structure if needed by older UAs.

## 7) Robots and SEO

- State: Implemented.
  - Programmatic robots via `src/app/robots.ts` with rules:
    - Allow: `/`
    - Disallow: `/api/`, `/api/lotto/sync`
  - Sitemap and host emitted from `NEXT_PUBLIC_SITE_URL`.
- Actions:
  - Remove `public/robots.txt` to avoid confusion; `robots.ts` is source of truth.
  - Confirm JSON-LD (WebSite, BreadcrumbList, ItemList) on major pages.

## 8) Licenses and Notices

- State: Implemented.
  - Project license: MIT (`LICENSE`).
  - Third-party notices: `THIRD_PARTY_NOTICES.md`.
  - Dependency summary: `DEPENDENCY_LICENSES.md` (+ instructions to regenerate full report).
- Actions:
  - For Apache-2.0 deps (Firebase SDKs), include NOTICE obligations if redistributing.

## 9) Environment Variables

- Required:
  - `NEXT_PUBLIC_SITE_URL`
  - `DEVICE_COOKIE_SECRET` (prod required; used by middleware rate-limit/AID)
  - `CRON_SECRET` (for `/api/lotto/sync`)
  - `NEXT_PUBLIC_APPLIXIR_API_KEY`
  - Firebase config vars (client + Admin SDK)
- Actions:
  - Verify all are set in Vercel Project Settings (Production/Preview).

## 10) Operational Runbook

- Monitoring:
  - Enable CSP reporting dashboard (logs from `/api/csp-report`).
  - Track cron success and sync counts.
- Backups:
  - Keep Firestore export scripts/plan (if required).

## 11) Disclaimers

- Non-affiliation notice for lottery organizations.
- Responsible use guidance and age restrictions stated on relevant pages.

All items above should be reviewed before each release. Keep this file updated with changes in dependencies, ad networks, or data sources.
