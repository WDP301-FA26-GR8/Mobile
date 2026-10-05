# SaaS-Sentry Mobile agent guide

This file is the operational source of truth for humans and coding agents working
in this repository. Read `ARCHITECTURE.md` before changing structure or data flow.

## Product scope

- The current SaaS-Sentry BRD says Web-only and lists Mobile as out of scope.
- This repository is therefore a buildable research/prototype client, not an MVP
  parity commitment. A product owner must amend the BRD before production features
  are planned here.
- The BRD is at
  `../../Docs/Requiments/BRD - HỆ THỐNG QUẢN TRỊ BẢN QUYỀN PHẦN MỀM & TỐI ƯU CHI PHÍ CÔNG NGHỆ.md`.

## Stack

- Expo SDK 54, React Native 0.81, React 19.1, Expo Router 6
- Expo new architecture, typed routes, and React Compiler
- TanStack Query 5 for remote/server state
- Orval 8 for OpenAPI client, hook, and test-only Faker factory generation
- Jest Expo and React Native Testing Library
- TypeScript strict mode, ESLint flat config, Prettier, pnpm

Expo changes quickly. Read the exact SDK 54 docs linked in `ARCHITECTURE.md` before
using an Expo API or changing native configuration.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm api:validate
pnpm api:generate
pnpm start
pnpm test
pnpm check
pnpm export:web
pnpm security:audit
```

Run `pnpm api:generate` after every `openapi/openapi.yaml` change. Before handing
off a complete feature or architecture change, run `pnpm check` and an Expo export
or native platform smoke test appropriate to the changed code.

## Source boundaries

```text
app/             Expo Router route manifest only
src/providers/   root framework providers
src/features/    user-facing business capabilities and screens
src/entities/    reusable domain concepts, created only when needed
src/shared/      configuration, API, UI primitives, utilities, test support
__tests__/       route/integration smoke tests outside the route manifest
```

Never create `src/app/`. Expo Router automatically treats it as a route root and can
turn provider/support files into public routes.

Allowed dependency direction:

```text
app routes -> features -> entities -> shared
providers ----------------------------> shared
```

- Files in `app/` contain route declarations and imports, not business workflows.
- A feature must not import another feature's internals.
- `shared/` must never import from `features/`, `entities/`, `providers/`, or `app/`.
- Do not force Web components or Tailwind patterns into React Native. Share contract
  and domain language first; native UI stays native.
- Do not add abstractions for hypothetical product scope.

## Mandatory file-placement rules

Application code belongs under `src/`; root `app/` is the Expo Router manifest. Use
this table before creating a file.

| Code being added              | Required location                             | Must not contain                                  |
| ----------------------------- | --------------------------------------------- | ------------------------------------------------- |
| Route/layout/param handoff    | `app/**/*.tsx`                                | Full screen UI, API workflow, reusable components |
| Full native screen            | `src/features/<feature>/screens/*-screen.tsx` | Route-file declarations                           |
| Feature-only native UI        | `src/features/<feature>/components/*.tsx`     | Generic app-wide primitives                       |
| Feature orchestration hook    | `src/features/<feature>/hooks/use-*.ts`       | Raw `fetch`, unrelated feature internals          |
| Feature mapper/view model     | `src/features/<feature>/model/*.ts`           | React Native APIs when a pure function works      |
| Reusable domain display logic | `src/entities/<entity>/`                      | One-screen workflow logic                         |
| Generic native primitive      | `src/shared/ui/`                              | License/user/approval-specific behavior           |
| Native/device adapter         | `src/shared/native/`                          | Screen rendering or feature policy                |
| Generic utility/config        | `src/shared/lib/`, `src/shared/config/`       | Imports from app/features/entities                |
| Generated client/types/mocks  | `src/shared/api/generated/`                   | Hand edits or runtime Faker imports               |

A mature feature follows this shape:

```text
src/features/licenses/
  index.ts                          public exports only
  screens/licenses-screen.tsx       screen composition
  screens/license-details-screen.tsx
  components/license-card.tsx       feature-only native UI
  components/license-filters.tsx
  hooks/use-license-list.ts          query + feature orchestration
  model/license-list.model.ts        pure mapping/types
  components/license-card.test.tsx
  screens/licenses-screen.test.tsx
```

`app/licenses/index.tsx` imports `LicensesScreen` from `@/features/licenses` and does
nothing else unless it must validate route params. Other features import only the
public `index.ts`, never another feature's private component/hook. The root-level
template folders `components/`, `hooks/`, and `constants/` are not architecture;
new authored code must not be placed there. See `ARCHITECTURE.md` for full examples.

## Data and API rules

- Remote state belongs in TanStack Query. Do not fetch remote data from ad-hoc
  `useEffect` calls.
- `openapi/openapi.yaml` is the committed client snapshot of the backend contract.
- Everything below `src/shared/api/generated/` is generated. Never edit it by hand.
- Every operation has one declared OpenAPI tag and a unique `operationId`. Request
  body components end in `Request`; successful response components end in
  `Response`. Generated output is `api/<tag>`, `contracts/<tag>`, and `mocks/<tag>`.
- Generated Faker factories are for Jest, fixtures, and explicit development tools.
  Never import Faker from a production screen/provider/route.
- Do not enable a device-side MSW layer by default; mock at the test boundary.
- `EXPO_PUBLIC_*` values are inlined into the app and readable by users. Never put
  secrets, private keys, or privileged service credentials there.
- Android emulators normally reach the host through `10.0.2.2`; physical devices
  need a reachable LAN or tunneled API URL.
- Authorization decisions remain backend-enforced.

## Localization rules

- All user-visible copy uses typed i18next keys from `src/shared/i18n/` and provides
  both `vi` and `en`. This includes `Text`, buttons, accessibility labels/hints,
  validation, alerts, toasts, empty/loading/error states, and native permission copy.
- `project/no-hardcoded-ui-text` rejects direct JSX/accessibility literals. Do not
  bypass it by moving a literal into a constant; add a semantic translation key.
- Expo Localization supplies the device/per-app locale. An explicit user choice is
  persisted with AsyncStorage. App metadata and native permission prompts must also
  be localized in Expo config/locale files when introduced.
- Format dates, numbers, percentages, currencies, and units through `Intl` with the
  active locale; never concatenate a localized sentence from fragments.

## Quality rules

- Preserve strict TypeScript and Expo's bundler module resolution.
- Keep tests out of `app/`; use React Native Testing Library instead of the deprecated
  React Test Renderer for React 19.
- Test behavior and accessibility, not implementation details or large snapshots.
- Do not manually edit `pnpm-lock.yaml`; change dependencies through pnpm/Expo.
- `pnpm-workspace.yaml` keeps `autoInstallPeers: false` so pnpm cannot silently pull
  optional peers from a newer Expo SDK. Declare every runtime peer explicitly or rely
  on the version bundled by an SDK 54 package.
- Do not commit `.env`, build/export output, coverage, or generated Expo types.
- Read `SECURITY.md` before changing dependency overrides/patches or adding binary
  assets. `image-size@1.2.1` is patched locally and protected by a regression test;
  never remove `patchedDependencies`, its patch, or the scoped audit exceptions
  without an upstream replacement and full verification.
- Update `ARCHITECTURE.md` when changing navigation, dependency direction, API
  generation, environment handling, or native build assumptions.
- A screen composes; a component presents; a hook orchestrates state; a model maps
  data; a native adapter isolates a device API. Do not collapse these jobs into one
  large screen.
- Before adding a helper, search for an existing equivalent. Promote code to
  `shared` only after at least two real consumers exist and domain naming is removed.
- Refactor AI output in the same task: move code out of `app/`, split mixed
  responsibilities, remove duplicate request state, replace hardcoded text with
  i18n, and add behavior/accessibility tests.

## AI workflow

1. Read this file and `ARCHITECTURE.md`.
2. Confirm the request is valid for the current research scope; flag production
   parity assumptions.
3. Inspect the closest route, feature public entry, generated API surface, and test.
   Search before inventing a new pattern.
4. For a feature touching three or more authored files, write its target file tree in
   the plan and assign each file one responsibility.
5. Make one vertical slice without creating `src/app/`: route -> screen ->
   hook/model -> component -> test. Treat generated/downloaded
   binary assets as untrusted until reviewed and converted.
6. Re-read the diff for business code in `app/`, cross-feature private imports,
   `useEffect` fetching, runtime Faker, hardcoded copy, duplicated styles, and `any`.
7. Generate rather than hand-edit API files; run relevant checks.
8. Report exact verification results and device/platform limitations.
