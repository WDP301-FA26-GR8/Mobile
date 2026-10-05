# Mobile verification

Run the smallest relevant set while iterating, then the complete gate for a feature
or architecture change.

```bash
pnpm api:generate   # when the contract or Orval config changed
pnpm prettier
pnpm lint
pnpm typecheck
pnpm test
pnpm export:web
```

For native behavior, also run the affected Android/iOS app and check:

- expected route and state render;
- Metro/device logs have no errors or warnings;
- controls have accessibility roles, labels, and adequate touch targets;
- keyboard, safe area, back navigation, and deep links behave as required;
- requests use a device-reachable API URL and are not duplicated.

Inspect Expo export output and fail the task if support/provider/test files appear as
routes.

Before accepting CSS tooling or a new binary asset, read `SECURITY.md`. Treat external,
downloaded, and AI-provided files as untrusted build inputs; require review and a real
conversion to a safe source format rather than an extension rename.
