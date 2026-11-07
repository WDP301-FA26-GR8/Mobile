# SaaS-Sentry Mobile

React Native app built with Expo SDK 54 and Expo Router. BRD 3.53 defines a
native iOS/Android companion for four workflows: an employee's software and
simple requests, manager need approval, individual spending approval, and an
in-app inbox. Web remains the full capability surface.

The current source includes navigation/provider boundaries, typed Vietnamese
and English copy, TanStack Query setup, and an Orval-generated API client.
The committed OpenAPI snapshot currently exposes only a System status endpoint.
The home screen shows the agreed mobile scope; business actions are not wired
until the backend publishes their contracts and authorization behavior.

## Setup

Use Node.js 22.13 or newer and pnpm 11.1.3.

```bash
pnpm install --frozen-lockfile
pnpm api:validate
pnpm check
pnpm start
```

For an Android emulator, set `EXPO_PUBLIC_API_BASE_URL` to an address reachable
from the emulator, commonly `http://10.0.2.2:3000`. Do not put secrets in
`EXPO_PUBLIC_*` values. See `.env.example` and `ARCHITECTURE.md`.

## Source ownership

- `app/`: Expo Router route declarations and parameter handoff only.
- `src/providers/`: application-wide framework providers.
- `src/features/`: mobile screens, components, orchestration hooks, and models.
- `src/entities/`: shared domain display logic only when multiple features need it.
- `src/shared/`: API client, configuration, i18n, and generic native UI.
- `openapi/`: committed backend contract snapshot; regenerate after changes.
- `__tests__/`: route and integration tests outside the route manifest.

Read `AGENTS.md`, `ARCHITECTURE.md`, and `SECURITY.md` before extending the app.
