# Mobile security notes

Last reviewed: 2026-08-11. Next review: 2026-09-11, or immediately after an
Expo/Metro, `image-size`, `xcode`, or pnpm patch update.

This repository is a research client under the current BRD. Build-time findings still
affect developer machines and CI, so they are fixed and verified even when they are
not reachable from a released application.

## Current dependency disposition

The project is intentionally pinned to Expo 54.0.36 / React Native 0.81.5 to match
the team's tested Expo Go environment. It has no unmitigated advisory in the approved
audit command:

```bash
pnpm security:test
pnpm security:audit
```

`security:audit` ignores exactly two `image-size` identifiers only because the locked
package is patched locally and the exploit path has a regression test. A raw
`pnpm audit` will continue to list those two upstream version-based advisories until
an upstream fixed release is published.

### Resolved PostCSS findings

Expo SDK 54 resolves `@expo/metro-config@54.0.17` and `postcss@8.4.49`. The approved
audit reports no PostCSS advisory, and Expo's transformer also invokes PostCSS with
`map: false`. Do not force PostCSS outside Expo's supported range; update Expo as a
coherent SDK set and rerun the full verification gate.

### Resolved UUID finding

`xcode@3.0.1` declares UUID 7.0.3. `pnpm-workspace.yaml` scopes an override to that
single edge:

```yaml
overrides:
  'xcode@3.0.1>uuid': 11.1.1
```

The override resolves GHSA-w5hq-g745-h8pq without changing unrelated packages. Keep
it until `xcode` itself declares a patched UUID range. Any change requires Expo
Doctor, export, and native prebuild/device verification because `xcode` participates
in native project generation.

### Locally patched image-size findings

Metro 0.84 still declares `image-size:^1.0.2` and resolves 1.2.1. No fixed npm release
exists as of this review for:

- [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr):
  zero-length ICNS entries can prevent the parser offset from advancing.
- [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq):
  zero-length JXL/HEIF boxes can prevent parser progress.

`patches/image-size@1.2.1.patch` is applied by pnpm `patchedDependencies`. It:

- rejects ICNS entry lengths smaller than the eight-byte header or beyond the
  declared/input length;
- rejects unsupported ICNS entry types before constructing invalid dimensions;
- rejects ISO boxes smaller than the eight-byte header, guaranteeing that accepted
  box offsets advance.

`security-tests/image-size-parsers.test.cjs` runs crafted ICNS and ISO-box parser
inputs in separate child processes with one-second timeouts. The ICNS exploit times
out against the unpatched dependency; both committed guards terminate by rejecting
invalid input. Keeping each probe in a separate process prevents a parser regression
from hanging Jest or the main verification process.

The two GHSA values in `security:audit` are evidence-scoped exceptions, not a claim
that upstream 1.2.1 is safe. Never add `--ignore-unfixable`, a broad severity ignore,
or another GHSA without its own review, mitigation/patch, regression test, owner, and
review date.

## Binary asset trust boundary

Metro parses repository image assets during builds. A remote app user cannot invoke
this dependency directly, but a malicious repository asset, downloaded fixture,
email attachment, or AI-generated binary can attack developer/CI availability.

- Import only reviewed assets from trusted owners.
- Never copy a user upload, downloaded fixture, attachment, or LLM-provided binary
  directly into an imported asset path.
- Convert required external images to fresh PNG, JPEG, or WebP output with a trusted,
  updated image tool before review. Renaming an extension is not conversion.
- Stop and investigate a Metro process that hangs while reading an asset; do not
  repeatedly build the same input.

The patch reduces the known parser paths but does not make arbitrary binary input
trusted. Asset review remains mandatory.

## Patch removal and review workflow

1. Run raw `pnpm audit` and review each dependency path/advisory.
2. Check Expo, Metro, `image-size`, and `xcode` official releases.
3. If Metro accepts an upstream `image-size` version outside the vulnerable range,
   remove `patchedDependencies`, the patch file, both exact audit ignores, and the
   regression only after reinstalling through pnpm. Never hand-edit the lockfile.
4. If `xcode` accepts UUID >=11.1.1, remove the scoped override and reinstall.
5. Run `pnpm security:test`, `pnpm security:audit`, `pnpm check`, Expo Doctor,
   `pnpm export:web`, and native prebuild/device smoke tests appropriate to the change.
6. Record resolved versions, remaining exceptions, reviewer, and next review date in
   this document.
