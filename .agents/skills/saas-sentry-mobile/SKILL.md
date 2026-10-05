---
name: saas-sentry-mobile
description: Use when implementing, debugging, reviewing, testing, or generating API code in the SaaS-Sentry Expo client, especially for Expo Router files, native feature boundaries, TanStack Query lifecycle, Orval, Faker test factories, or Expo quality gates.
---

# SaaS-Sentry Mobile

Build research-client changes that preserve Expo Router boundaries and leave evidence
from the relevant quality gates.

## Workflow

1. Read `../../../AGENTS.md` and `../../../ARCHITECTURE.md` completely.
2. Confirm whether the request is research/prototype work or assumes production
   Mobile scope; surface the BRD mismatch when it affects the result.
3. Inspect the closest route, feature, generated API surface, and tests.
4. Keep `app/` route-only. Never create `src/app/`; use `src/providers`,
   `src/features`, `src/entities`, and `src/shared`.
5. For API changes, edit `openapi/openapi.yaml` or `orval.config.ts`, then run
   `pnpm api:validate` and `pnpm api:generate`. Never hand-edit
   `src/shared/api/generated`.
6. Keep Faker imports in Jest/fixtures and do not add device-side MSW by default.
7. Put every UI/accessibility/native prompt string in both typed `vi` and `en`
   resources; never bypass the hardcoded-UI-text rule.
8. Read `SECURITY.md` before dependency/asset work and preserve its patch, scoped
   override, regression test, and exact audit exceptions.
9. Add or update a behavior-focused test and complete the applicable checks in
   `references/verification.md`.
10. Report commands, exact failures, assumptions, and platform/device limitations.

Use exact Expo SDK 54 documentation for native APIs and configuration. Do not copy a
Web pattern into React Native without verifying platform semantics.
