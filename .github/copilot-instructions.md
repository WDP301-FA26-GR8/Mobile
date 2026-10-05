# SaaS-Sentry Mobile instructions

Use `AGENTS.md` and `ARCHITECTURE.md` as canonical guidance. Keep Expo Router files
thin, never create `src/app/`, use TanStack Query for remote state, and generate API
code with Orval. Faker is test-only. Add React Native Testing Library coverage and
run relevant pnpm/Expo checks before proposing completion.
Use typed vi/en i18n keys for every user-visible/accessibility string. Preserve the
security patch/override and generated `api/<tag>`, `contracts/<tag>`, `mocks/<tag>`
structure.
