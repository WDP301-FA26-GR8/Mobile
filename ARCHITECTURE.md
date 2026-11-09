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
The committed OpenAPI snapshot contains the backend's business operations. Login,
the signed-in account, personal software, inbox and employee requests use the backend.
The live need-approval workspace supports assigned individual grants; spending-approval
and the original manager demo screens remain prototypes. Prototype decisions are stored only in the current app session
and are not submitted to a backend. Contract availability alone does not resolve
the differences between the current backend and newer proposed business decisions.
Manager and spending demos have separate direct route entry points; there is no
in-session role switcher. The authenticated landing loads `/me` before routing:
accounts with the MANAGER role enter the live Manager workspace, while others enter
personal software. If the account cannot be loaded, the user can retry or sign out;
the app does not guess the role. The personal software screen links Manager accounts
back to the workspace but does not show that entry for employees. The live
screen links to live request flows instead of opening the demo, to
avoid presenting demo data as the signed-in user's data. The live inbox at `/live-inbox`
uses the authenticated notification API; the prototype inbox remains separate. Live
request list and detail routes are `/live-requests` and `/live-requests/[requestId]`.
The list contains requests sent by the caller, while notification detail access is
authorized by the backend. Individual catalog requests use `/live-request-create`:
the caller chooses a requestable plan and must receive a current successful preview
before submitting. The list offers withdrawal only when the server indicates it is
available, and displays the returned status rather than assuming immediate withdrawal.
Writes are never automatically retried; an uncertain result requires checking the list
before trying again. The backend has no client-provided idempotency key in this contract,
so this cannot guarantee prevention of duplicate submissions across navigation/restarts.
The Manager landing is `/live-need-approvals`; it shows the authenticated account,
department, assigned-work count, and a Manager-specific queue/team/inbox tab bar.
The inbox uses the live notification feature; the team tab explains that department
management is web-only, and the header links to personal self-service. A Manager without an active
`managerScope` sees an explicit unavailable state rather than a fabricated queue.
The queue is filtered by the backend to the caller's assigned GRANT steps; it is not an
authorization check or a department-wide request list. This workspace is currently
restricted to MANAGER accounts; Spending Approver and fallback-decider workflows have
not yet been connected to role-specific navigation. The request detail queries the
assignee-only similar seats endpoint separately, with pagination and explicit
loading/error states. The contract supplies a due date but no exact deadline or
all-queue urgent count; the UI does not invent an hourly SLA countdown.
Group, renewal, service-account and department-wide views are not implemented. Decisions
are confirmed explicitly, rejection requires a reason, and approvals for terms over
12 months are blocked because the documented confirmation is absent from the payload.
Backend authorization and stale-state checks remain authoritative. Failed or uncertain
decisions are never retried automatically and require checking the refreshed queue.
Manager group request creation and spend-batch submission remain web-only; a GH-3 flag
is not shown because the current detail contract does not expose it. The mobile app
does not assume the newer proposed one-step manager-self-request routing has been
implemented by the backend.
Password recovery on the login screen directs the
user to web until the real reset-link flow is implemented.
The manager demo uses bottom tabs for assigned approvals, department-visible context,
and the shared in-app inbox. The spending demo uses assigned decisions, session-only
decision history, and the shared in-app inbox; budget snapshots remain inside the
relevant request detail and are not a separate tab.
Approver inbox tabs stay within their respective demo screens and do not display the
employee's notifications. Prototype events produce role-specific in-app notices.
Detail screens use a route fallback when opened without navigation history.
Shared demo request state is owned by `src/entities/demo-requests` and attached at the
root route layout. Navigation between the separate demo routes shares request status,
decisions, timelines, and role-scoped notification/read state; reloading or restarting
resets it. This is not authentication or backend authorization.

The demo advances an approved employee need to awaiting web submission and an approved
Slack spending decision to awaiting IT. It does not simulate web batch submission,
Finance review, or IT actions. The manager's DataDog self-request has its need step
decided by the spending approver, with the result visible in department context;
subsequent steps are not simulated. Notifications describe historical events, while
request details show current status. All transitions are prototype assumptions to be
replaced with the backend contract and enforced authorization.
The authenticated software list is paginated and displays the backend's seven-day
expiring flag. The dashboard supplies the overall expiring count; the filter explicitly
applies only to the current page. The old mock details route redirects to the list; it must not expose
invented accounts or keys as real data. Historical access, an all-pages expiring
filter, and return workflows are not provided in this first live slice.
The canonical employee request list URL is `/my-requests`; unknown request IDs
redirect there rather than to `/my-requests/index`, which matches a dynamic ID.

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
  inbox.tsx                prototype inbox handoff
  live-inbox.tsx           authenticated inbox handoff
  live-requests.tsx        authenticated request list handoff
  live-request-create.tsx  authenticated individual request handoff
  live-need-approvals.tsx  authenticated need approval handoff
  live-requests/           authenticated request detail handoff
  my-software.tsx          employee software handoff
  manager.tsx              manager need-approval demo handoff
  spending-approvals.tsx   spending-approver demo handoff
  my-requests/             employee request routes
src/
  providers/               application-wide framework providers
  features/
    auth/                   backend login and prototype password recovery
    inbox/                  authenticated and prototype in-app notifications
    licenses/               employee software screens and models
    manager/                department need-approval demo presentation
    spending-approval/      per-item spending queue and budget snapshots
    requests/               employee request screens and session mocks
    <capability>/           screens, components, hooks, feature-local tests/models
  entities/
    demo-requests/          in-memory request, decision, and inbox state
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

The session boundary uses the generated login, refresh and logout operations. The
refresh token is stored using Expo SecureStore on native, with device-only iOS
accessibility; the access token stays in memory. Web keeps both tokens in memory,
so a page reload ends the local web session. SecureStore may retain iOS Keychain
items across reinstall; logout explicitly removes the token after server revocation.
Concurrent reads share one refresh. The old refresh token is removed before rotation:
if its result is lost, the app asks the user to sign in again rather than retrying a
potentially consumed token. A failed server logout keeps the current session so the
user can retry; successful logout clears the query cache and local token. The read
boundary retries a 401 only for reads, not business mutations. Authenticated writes
refresh an already expired token before sending, but never retry a sent operation.
Inbox read updates invalidate both list and count even after an uncertain failure.

Use an HTTPS API origin without credentials or a path in release builds. HTTP is
allowed only in development for local emulators/devices; traffic and credentials
on such connections are not protected. Do not use real credentials over HTTP. A
native build containing `expo-secure-store` needs device verification, including
storage failures, restart, backup and logout. No biometric prompt is requested.

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
The generated fetch functions do not attach authentication automatically. The live
personal-software screen calls them through the session's authenticated read
boundary. Other protected operations must not bypass that boundary or assume that
it supports safe mutation retries.

The initial business snapshot was imported from the backend OpenAPI export reviewed
on 2026-11-09 (SHA-256
`8bc889bce6d092a25173c6eeb9e31da44847a4de1e7f024e08ab0a288672bda0`).
The import adds missing top-level tag declarations and request/response aliases
to satisfy the mobile naming conventions without renaming the backend DTOs. It also
adds the already-inherited string type to example-only `message` overlays, and
extracts one inline group-line schema through a reference; these preserve the
contract's constraints while allowing Orval to generate type-correct Faker mocks.
Alias collisions and missing source schemas fail the import. Import tests cover
these transformations. Generated Faker data is test-only and may still need overrides
for specific business scenarios; it is not evidence that a workflow is valid.
Generation removes the generated mocks directory before Orval runs because Orval's
output cleanup does not remove obsolete mock files when a tag disappears. Restart
`api:watch` after removing a tag so that this cleanup runs again.

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
one stable business tag; the imported snapshot declares the tags and adds
`*Request` and `*Response` aliases while retaining the backend's `*BodyDto` and
`*ResponseDto` definitions. This keeps generated folders understandable without
requiring the backend to rename its models.

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

1. Export and review the backend OpenAPI document, including its provenance and
   business changes.
2. Run `node scripts/import-openapi.mjs <reviewed-backend-export>` to normalize and
   write the mobile snapshot. Review the resulting diff and update its provenance.
3. Run `pnpm api:generate` in the mobile client; follow the web client's own
   contract-update process separately.
4. Update feature code against generated types, never generated output itself.
5. Run typecheck, tests, lint, and the relevant platform export/smoke check.

## Environment model

`EXPO_PUBLIC_API_BASE_URL` is statically referenced so Expo can inline it. It defaults
to `http://localhost:3000` for local web/iOS-simulator development. Android emulators
usually need `http://10.0.2.2:3000`; physical devices need a host address they can
reach. For the supplied deployed server set the origin to
`https://wdp.novaproj.site` (without `/api/v1`); the generated operations already
include that prefix. Release authentication rejects a non-HTTPS base URL.

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
