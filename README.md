# SaaS-Sentry Mobile

React Native app built with Expo SDK 54 and Expo Router. BRD 3.53 defines a
native iOS/Android companion for four workflows: an employee's software and
simple requests, manager need approval, individual spending approval, and an
in-app inbox. Web remains the full capability surface.

The current source includes navigation/provider boundaries, typed Vietnamese
and English copy, TanStack Query setup, and an Orval-generated API client.
Login, the signed-in account and the current personal software-rights list use
the backend. Requests, approvals and inbox remain demo workflows and are not
connected to the signed-in account.

## Setup

Use Node.js 22.13 or newer and pnpm 11.1.3.

```bash
pnpm install --frozen-lockfile
pnpm api:validate
pnpm check
pnpm start
```

For the deployed API, set `EXPO_PUBLIC_API_BASE_URL` to the origin
`https://wdp.novaproj.site` before starting Expo. Do not append `/api/v1`:
generated operations already include it. For a local backend on an Android
emulator, the host is commonly `http://10.0.2.2:3000`; a physical device needs
a reachable address. Do not use real credentials over HTTP, and never put
secrets in `EXPO_PUBLIC_*` values. See `.env.example` and `ARCHITECTURE.md`.

### Browser CORS

Expo web runs in a browser and the API must allow the exact web origin,
including scheme and port. The deployed backend currently allows the deployed
web application but not `http://localhost:8082`, so browser login from that
origin is blocked before the request reaches the API. Changing
`EXPO_PUBLIC_API_BASE_URL` alone does not grant CORS access.

Use the native iOS/Android app to test against the deployed HTTPS API, or run a
local development backend and configure its `CORS_ORIGINS` to include the exact
Expo web origin (for example `http://localhost:8082`). If using a remote backend
for browser development, ask its operator to allow an approved, exact HTTPS
development origin. The backend's production configuration rejects HTTP origins
and wildcards; do not weaken that policy or disable browser CORS. Restart the
backend after changing its configuration, and check both login and authenticated
GET preflight responses. A permitted response includes `Access-Control-Allow-Origin`
matching the browser origin.

## Source ownership

- `app/`: Expo Router route declarations and parameter handoff only.
- `src/providers/`: application-wide framework providers.
- `src/features/`: mobile screens, components, orchestration hooks, and models.
- `src/entities/`: shared domain display logic only when multiple features need it.
- `src/shared/`: API client, configuration, i18n, and generic native UI.
- `openapi/`: committed backend contract snapshot; regenerate after changes.
- `__tests__/`: route and integration tests outside the route manifest.

Read `AGENTS.md`, `ARCHITECTURE.md`, and `SECURITY.md` before extending the app.
