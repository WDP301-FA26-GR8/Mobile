# SaaS-Sentry Mobile architecture

Status: Expo foundation updated for BRD 3.53 mobile scope, 2026-10-24.

## Context and scope boundary

BRD 3.53 includes a native iOS/Android companion for four tasks: employees view
their software and requests and submit or withdraw simple requests for software
already in the catalog; managers approve the need step for their department;
spending approvers decide individual items against a read-only budget snapshot;
and users read an in-app inbox. The web client remains the full capability surface.
Mobile shares backend business rules, authorization, and separation of duties.

Push notifications, offline mode, biometrics, file downloads, phone usage
collection, and IT Admin/Finance/Super Admin workflows are outside mobile scope.
The current committed OpenAPI snapshot has only a System status operation, so
business screens and authentication cannot be connected until the backend
contract is supplied. The home screen currently presents the scoped tasks.

## Runtime view

```text
iOS / Android / Expo web
  -> Expo Router route
      -> feature screen/workflow
          -> generated TanStack Query hook
              -> fetch API base URL
                  -> NestJS REST API
```

The native client owns presentation, navigation, device interaction, and ephemeral
state. NestJS owns validation, authorization, workflow transitions, audit trails,
persistence, jobs, and financial/access decisions.

## Source layout

```text
app/
  _layout.tsx              root route/provider attachment
  index.tsx                thin route entry
src/
  providers/               application-wide framework providers
  features/
    <capability>/           screens, components, hooks, feature-local tests/models
  entities/
    <domain-concept>/       reusable domain presentation logic, only when needed
  shared/
    api/
      generated/
        api/<tag>/         fetch functions and TanStack Query hooks
        contracts/<tag>/   request/response/domain contracts
        mocks/<tag>/       test-only Faker factories
      query-client.ts       TanStack Query defaults
    config/                 validated public application configuration
    i18n/                   typed vi/en resources and locale persistence
    lib/                    framework-neutral utilities
    ui/                     reusable native primitives
  types/                    ambient project type declarations
__tests__/                  route/integration smoke tests outside `app/`
openapi/                    committed API contract snapshot
```

Do not create `src/app/`. Expo Router prefers `src/app` when present; a provider placed
there was observed during verification as a generated `/providers/app-providers`
route. The root `app/` directory is therefore reserved for Router files only.

Dependency direction:

```text
app routes -> features -> entities -> shared
providers ----------------------------> shared
```

Lower layers never import higher ones. Features do not reach into other feature
internals. Extract a shared domain concept only after multiple concrete features use
it. Native UI is not shared with Web until design, accessibility, and ownership make
that a real advantage.

## State and lifecycle

- Navigation state: Expo Router segments and params.
- Remote state: TanStack Query.
- Form and ephemeral UI state: local to the feature until broader ownership is real.
- Authentication and permissions: returned by and enforced by the backend.

`AppProviders` creates one `QueryClient` per application lifetime. On native
platforms it connects React Native `AppState` to TanStack Query's `focusManager`, so
background/foreground changes have browser-like focus semantics. Online-state
integration is deferred until the app needs `expo-network` and offline behavior is
specified.

Do not duplicate query data into local state or perform routine request calls from
`useEffect`.

## Contract-first API client

Both frontend repositories intentionally use the same Orval strategy, but each keeps
a versioned contract snapshot because they are independently buildable repositories.

```text
openapi/openapi.yaml
  -> pnpm api:validate
      -> one declared tag/operation, unique operationId,
         *Request request body, *Response success body
  -> pnpm api:generate
      -> src/shared/api/generated/api/<tag>
      -> src/shared/api/generated/contracts/<tag>
      -> src/shared/api/generated/mocks/<tag>/*.faker.ts
```

Orval uses `fetch`, `react-query`, and `tags-split`. Schema `splitByTags` mirrors the
business tag hierarchy for contracts; types shared by several tags remain at the
contracts root. The runtime base expression is
`env.API_BASE_URL`. The built-in fetch generator preserves typed response data/status
and throws for non-success HTTP responses so TanStack Query receives error states.
Generated source is committed and reviewed with the contract, but never hand-edited.

Faker works in the Node/Jest development environment and is useful for factories and
fixtures. It is deliberately a development dependency and must not enter a native
production bundle. MSW device interception is not enabled; request mocking belongs
in Jest unless a concrete end-to-end mock-server workflow is approved.

Fake data can still be generated through Orval on Mobile. Import a generated Faker
factory in Jest to produce a type-correct request/response object, then override only
fields relevant to the behavior under test. If a future workflow needs HTTP-level
mocking across simulator/device builds, prefer a separately deployed mock server or
explicit development-only interceptor; never ship a hidden device-side mock switch.

Backend Swagger tags and component names are architecture inputs. Every operation has
one stable business tag such as `Users` or `Licenses`; request bodies use
`CreateUserRequest`-style names, success wrappers use `UserResponse`/
`UsersPageResponse`, and reusable inner models use semantic `*Dto`/enum names. This
is what keeps generated folders understandable as the API grows.

## Reusable production architecture

These boundaries support the native companion in the current BRD. Add each
business workflow only after its API contract and authorization behavior are
available. Clear ownership is more useful than preinstalling optional libraries.

### Navigation and composition

- `app/` is a route manifest. Route groups such as `(auth)` or `(app)` may organize
  navigation without becoming domain layers; layouts attach providers, guards, and
  navigators, while screens/workflows remain under `src/features`.
- Parse and validate route params at the route-to-feature boundary. A feature should
  receive typed domain inputs rather than reading global router state everywhere.
- Deep links, universal links, authenticated redirects, and notification routes need
  a documented URL contract plus cold-start/background tests before production.

### Feature shape and public interfaces

A mature feature may contain `screens/`, `components/`, `hooks/`, `model/`, and
feature-local tests, but create those folders only when they have members. Each
feature exposes a small public entry; other features never import its private files.
Reusable domain presentation moves to `entities`, generic native primitives and
infrastructure move to `shared`, and app-wide provider composition stays in
`providers`.

Keep domain/network contracts separate from presentation props. Generated response
types may enter mapping functions, but UI components should consume models shaped for
the screen when the API representation is unstable or backend-specific. Do not add a
repository wrapper that only renames every generated Orval function.

### Mobile feature golden path: Licenses

Use this example for new native features. Generated hook/type names are illustrative;
use the exact exports produced from the reviewed OpenAPI contract.

```text
app/
  _layout.tsx
  licenses/
    index.tsx                              route handoff
    [licenseId].tsx                        route-param handoff
src/
  features/
    licenses/
      index.ts                             public feature API
      screens/
        licenses-screen.tsx                screen composition
        licenses-screen.test.tsx
        license-details-screen.tsx
      components/
        license-card.tsx                   feature-only native UI
        license-card.test.tsx
        license-filters.tsx
      hooks/
        use-license-list.ts                query/filter orchestration
      model/
        license-list.model.ts              pure API-to-view mapping
        license-list.model.test.ts
  entities/
    license/                               only after real cross-feature reuse
  shared/
    api/generated/                         Orval output; never edit
    native/                                typed device/OS adapters
    ui/                                    generic native primitives
```

The runtime dependency path is:

```text
app/licenses/index.tsx
  -> features/licenses/index.ts
      -> screens/licenses-screen.tsx
          -> hooks/use-license-list.ts
              -> generated Orval query hook
          -> model/license-list.model.ts
          -> components/license-card.tsx
```

#### 1. Keep Expo Router files tiny

`app/licenses/index.tsx` hands navigation to the feature:

```tsx
import { LicensesScreen } from '@/features/licenses'

export default LicensesScreen
```

`app/licenses/[licenseId].tsx` validates and passes route input:

```tsx
import { Redirect, useLocalSearchParams } from 'expo-router'

import { LicenseDetailsScreen } from '@/features/licenses'

export default function LicenseDetailsRoute() {
  const { licenseId } = useLocalSearchParams<{ licenseId?: string }>()

  if (!licenseId) return <Redirect href='/licenses' />
  return <LicenseDetailsScreen licenseId={licenseId} />
}
```

Route files may choose layouts, validate params, or redirect. They do not render the
actual card list, call APIs, own modal/form state, or define large StyleSheets.

#### 2. Publish only route-facing feature interfaces

`src/features/licenses/index.ts`:

```ts
export { LicenseDetailsScreen } from './screens/license-details-screen'
export { LicensesScreen } from './screens/licenses-screen'
```

Another feature must not import
`@/features/licenses/components/license-card`. Promote a proven reusable domain view
to `entities/license` or keep separate components for different workflows.

#### 3. Put request policy in a meaningful hook

`hooks/use-license-list.ts`:

```ts
import { useGetLicenses } from '@/shared/api/generated/api/licenses/licenses'

import { toLicenseListItems } from '../model/license-list.model'

export function useLicenseList(search: string) {
  const query = useGetLicenses({ search: search || undefined })

  return {
    ...query,
    items: toLicenseListItems(query.data?.data.items ?? [])
  }
}
```

Use the generated hook directly when no feature policy is added. Never rebuild Query
with `useEffect`, local loading/error state, and raw `fetch`. A hook may coordinate
filters, mutations, invalidation, selection, AppState-aware behavior, or derived data;
it must not render UI.

#### 4. Keep transport mapping platform-neutral

`model/license-list.model.ts` is the same kind of pure boundary as on Web:

```ts
import type { LicenseDto } from '@/shared/api/generated/contracts/licenses'

export interface LicenseListItem {
  id: string
  name: string
  assignedSeats: number
  totalSeats: number
}

export const toLicenseListItems = (items: LicenseDto[]): LicenseListItem[] =>
  items.map(({ id, name, assignedSeats, totalSeats }) => ({
    id,
    name,
    assignedSeats,
    totalSeats
  }))
```

It has no React Native, Expo Router, i18n, storage, or network imports. Skip the mapper
when the generated type is already an appropriate stable screen model.

#### 5. Build a controlled native component

`components/license-card.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import type { LicenseListItem } from '../model/license-list.model'

interface LicenseCardProps {
  item: LicenseListItem
  onPress: (licenseId: string) => void
}

export function LicenseCard({ item, onPress }: LicenseCardProps) {
  const { t } = useTranslation()

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={t('licenses.actions.openNamed', { name: item.name })}
      onPress={() => onPress(item.id)}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>
          {t('licenses.seatsUsed', {
            assignedSeats: item.assignedSeats,
            totalSeats: item.totalSeats
          })}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  content: { gap: 4, padding: 16 },
  name: { fontSize: 16, fontWeight: '600' }
})
```

It receives data and emits intent. It does not navigate directly, touch AsyncStorage,
invalidate queries, request permissions, or own screen-level loading behavior.

#### 6. Compose navigation and UI states in the screen

`screens/licenses-screen.tsx`:

```tsx
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { FlatList, Text, View } from 'react-native'

import { LicenseCard } from '../components/license-card'
import { useLicenseList } from '../hooks/use-license-list'

export function LicensesScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const licenses = useLicenseList('')

  if (licenses.isPending) return <Text>{t('licenses.states.loading')}</Text>
  if (licenses.isError) return <Text accessibilityRole='alert'>{t('licenses.states.error')}</Text>

  return (
    <View>
      <Text accessibilityRole='header'>{t('licenses.title')}</Text>
      <FlatList
        data={licenses.items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>{t('licenses.states.empty')}</Text>}
        renderItem={({ item }) => <LicenseCard item={item} onPress={(id) => router.push(`/licenses/${id}`)} />}
      />
    </View>
  )
}
```

The screen owns composition and navigation callbacks. For real screens, add safe-area,
keyboard, refresh, pagination, and list-performance behavior only when requirements
demand them; do not prebuild generic frameworks.

#### 7. Test where behavior is owned

- Model test: pure mapping, missing/edge values defined by the contract.
- Component test: visible translated text, accessibility role/label, press callback.
- Screen test: loading, error, empty, success, navigation intent, and en/vi behavior.
- Route test: only param validation/redirect when the route has logic.
- Device smoke: safe area, keyboard, back behavior, deep link, and native module usage
  when those concerns exist.

Use generated Faker factories in Jest, not in `screens/`, `components/`, hooks, route
files, or providers.

### Mobile naming and growth rules

- Expo route filenames follow URL conventions; feature screens end in `-screen.tsx`.
- Feature UI uses descriptive nouns such as `license-card.tsx`; never `component.tsx`,
  `helper.ts`, `common.tsx`, or numbered names.
- Hooks start with `use-` and own stateful orchestration. Pure functions belong in
  `model/` or `shared/lib/` depending on ownership.
- Tests sit beside authored feature code; cross-route integration smoke tests may live
  in root `__tests__/`. No tests belong under `app/`.
- `src/shared/native/` contains small typed wrappers around device APIs, not a generic
  service locator. Feature policy stays in the feature.
- Start flat for a tiny feature. Expand into `screens/`, `components/`, `hooks/`,
  and `model/` once those categories have real members. The current `home` feature
  has a screen, presentation component, and pure capability model. Do not create
  empty folders.
- Root template folders `components/`, `hooks/`, and `constants/` are deprecated
  locations. Move any useful template code into the correct `src` owner before use;
  do not add new imports to those roots.

### State, forms, persistence, and offline behavior

- TanStack Query owns remote cache, mutation state, invalidation, and retry policy.
- Local component state owns transient interaction; a small scoped context owns a
  real subtree concern. Add a client-state store only after cross-feature state has a
  concrete lifecycle that URL, Query, and context cannot model cleanly.
- Form libraries and schema validation are selected when real forms define nested
  data, performance, and error-localization needs. Validation emits codes/keys and UI
  maps them to i18n; schemas do not hardcode English/Vietnamese sentences.
- AsyncStorage is for non-secret preferences such as language. Authentication tokens
  and sensitive material require platform secure storage, expiry/revocation design,
  and threat review; never place them in AsyncStorage or `EXPO_PUBLIC_*` values.
- Offline mutation queues, optimistic writes, conflict resolution, and persisted
  Query caches are product behavior, not generic toggles. Specify ownership,
  idempotency, ordering, expiry, and user-visible recovery before enabling them.

### Platform and native boundaries

Use Expo modules first when they satisfy the requirement and support the active SDK.
Isolate permissions, storage, notifications, camera/files, biometrics, and other
native capabilities behind small typed adapters in `shared` so feature tests can
replace the boundary. Platform-specific `.ios`/`.android` files are appropriate only
when behavior genuinely differs; keep the common interface stable.

Any native module/config-plugin change requires a new development build and native
smoke coverage. Expo Go is useful for limited exploration but is not the production
runtime contract. EAS build profiles, bundle identifiers, signing, update channels,
runtime versions, rollout, and rollback remain explicit release decisions.

### Localization

`src/shared/i18n/resources.ts` is the typed copy source for `vi` and `en`.
Expo Localization reads the OS/per-app locale declared by the config plugin, and an
explicit in-app selection is persisted in AsyncStorage. Translation keys describe
meaning, both languages change together, and sentences are not assembled from
fragments. Native metadata and permission prompts need Expo locale resources when
introduced; JavaScript translation files cannot localize operating-system dialogs.

`project/no-hardcoded-ui-text` enforces JSX and common accessibility props. Reviews
also inspect alerts, validation schemas, navigation titles, third-party component
props, and native configuration. `Intl` formats dates, numbers, currencies,
percentages, lists, and units with the active locale.

### Observability and error flow

Normalize transport failures once an API error contract exists, then map error codes
to localized feature messages. Preserve correlation/request IDs for support without
showing stacks or secrets to users. Production logging/crash reporting must redact
tokens, PII, financial details, and request bodies by default and attach release,
platform, OS, app state, and route context needed to reproduce failures.

Contract update workflow:

1. Export and review the backend OpenAPI document.
2. Replace `openapi/openapi.yaml` in both clients that consume the changed API.
3. Run `pnpm api:generate` in each affected client.
4. Update feature code against generated types, never generated output itself.
5. Run typecheck, tests, lint, and the relevant platform export/smoke check.

## Environment model

`EXPO_PUBLIC_API_BASE_URL` is statically referenced so Expo can inline it. It defaults
to `http://localhost:3000` for local web/iOS-simulator development. Android emulators
usually need `http://10.0.2.2:3000`; physical devices need a host address they can
reach.

All `EXPO_PUBLIC_*` values are visible in the compiled application. Tokens and secrets
must use an approved authentication/secure-storage design, not public environment
variables. Environment selection should follow Expo/EAS environments rather than
overloading `NODE_ENV`.

## Testing and platform verification

1. Pure unit tests for mapping and formatting logic.
2. Screen/component tests with Jest Expo and React Native Testing Library.
3. API behavior tests using generated Faker data and test-boundary fetch mocks.
4. `expo export` to catch Router/Metro/static-rendering errors.
5. Device or emulator smoke tests for any native interaction, deep link, permission,
   storage, keyboard, or platform-specific layout.

Tests stay outside `app/` so Router never interprets them as screens. Snapshot tests
are reserved for small stable primitives; behavior and accessibility queries are the
default.

## Build-input and dependency security

`pnpm-workspace.yaml` disables automatic peer installation. This prevents broad
optional peer ranges such as `expo: "*"` from silently introducing newer SDK packages
into the SDK 54 graph. Native runtime peers must be direct dependencies or come from
an SDK 54 package's declared dependency set. The same workspace file owns the scoped
UUID override, locally patched `image-size`, audit exceptions, and native build
allowlist.

Metro parses repository image assets during bundling, so source assets cross a
developer/CI trust boundary even though they are not remote runtime input. Only
reviewed assets from trusted owners may be imported. External or AI-provided binary
files must be converted to fresh PNG, JPEG, or WebP output with a trusted tool before
review; changing a file extension is insufficient because the parser inspects bytes.

The project is pinned to Expo SDK 54 for the team's Expo Go environment. Its supported
PostCSS resolves to 8.4.49 with source maps disabled by Expo's transformer, and a scoped
pnpm override updates `xcode@3.0.1` from vulnerable UUID 7 to UUID 11.1.1. Metro still
resolves `image-size@1.2.1`, so `patchedDependencies` applies a committed patch that
rejects ICNS entries and ISO boxes that cannot advance; a child-process regression
test proves crafted inputs for both parser families terminate instead of blocking
Node's event loop.

The registry audit still classifies the upstream version string as affected because
no fixed npm release exists. `pnpm security:audit` ignores only the two exact
image-size GHSA identifiers after the local patch/test runs; it must not become a
general vulnerability allowlist. `SECURITY.md` is the authoritative evidence and
upgrade/removal procedure.

## Deferred decisions

- The BRD defines a native iOS/Android companion; EAS profiles, store identities,
  and release channels still await technical and delivery decisions.
- OIDC redirect, token storage, biometrics, push notifications, deep links, and
  offline conflict handling await security and product requirements.
- Remove unused create-expo-app sample dependencies when production scope starts;
  each retained native module increases build, upgrade, and review surface.

## Official references

- [Expo SDK 54 reference](https://docs.expo.dev/versions/v54.0.0/)
- [Expo SDK 54 release notes](https://expo.dev/changelog/sdk-54)
- [Expo Router testing](https://docs.expo.dev/router/reference/testing/)
- [Expo environment variables](https://docs.expo.dev/guides/environment-variables/)
- [Expo unit testing with Jest](https://docs.expo.dev/develop/unit-testing/)
- [TanStack Query React Native guidance](https://tanstack.com/query/latest/docs/framework/react/react-native)
- [Orval React Query client](https://orval.dev/docs/guides/react-query/)
- [Orval Faker generation](https://orval.dev/docs/guides/faker/)
- [Orval output configuration](https://orval.dev/docs/reference/configuration/output/)
- [Faker usage and bundle-size guidance](https://fakerjs.dev/guide/usage)
- [Expo localization](https://docs.expo.dev/guides/localization/)
- [React i18next `useTranslation`](https://react.i18next.com/latest/usetranslation-hook)
- [pnpm dependency overrides](https://pnpm.io/settings/dependency-resolution)
- [PostCSS source-map traversal advisory](https://github.com/advisories/GHSA-r28c-9q8g-f849)
- [image-size ICNS parser advisory](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr)
- [image-size JXL/HEIF parser advisory](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq)
