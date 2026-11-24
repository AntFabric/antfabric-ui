# Releasing

`@antfabric/ui-core`, `@antfabric/ui-react` and `@antfabric/ui-react-native` are published to npm by
GitHub Actions on **every push to `main`**, through npm's
[trusted publishing](https://docs.npmjs.com/trusted-publishers): no npm token exists anywhere. The
three share one version. Nobody publishes from a laptop (except 1.0.0, once; see One-time setup).

## How a change ships

1. **Open a pull request.** `ci.yml` runs `pnpm build` (which runs `pnpm check`), `pnpm verify:packages`
   and `pnpm release:dry`, an `npm publish --dry-run` of the three packed packages.
2. **Merge it.** `release.yml` runs on the push to `main`: `pnpm check`, then picks the version
   (`scripts/release-version.mjs`), `pnpm build:packages`, `pnpm verify:packages`, publishes the three
   packages (`scripts/publish-packages.mjs`), tags the commit `v<version>` and makes a GitHub release with notes generated
   from the merged pull requests.
3. **Note the change** in each package's `CHANGELOG.md` in the same pull request when a consumer can
   see it, under a heading for the next version.

## Which version a push gets

- The version in `packages/core/package.json` (and the other two, kept equal) is the one people
  chose: **1.0.0** to start.
- If npm does not have that version yet and it is newer than everything on npm, the push publishes it.
- Otherwise the push publishes the next patch after the newest version on npm: 1.0.0, then 1.0.1,
  1.0.2, …
- To start a minor or a major, raise the version in the three `package.json` files (1.1.0, 2.0.0) in
  your pull request; the push after the merge publishes it, and later pushes continue from it
  (1.1.1, …).

Nothing is committed back to `main`: the `v<version>` tags and the GitHub releases record what
shipped. `node scripts/release-version.mjs --dry` prints the version the next push would get.

A failed run is safe to re-run (Actions → Release → Re-run):

- **Cut short** (npm has the version for some of the three packages, or for all three but there is no
  `v<version>` tag): the re-run picks the same version, skips the packages npm already has, publishes
  the rest and tags it. A version is never left with core but no kits.
- **Already shipped** (the commit carries a `v<version>` tag, as 1.0.0 does after the one-time setup):
  the re-run publishes nothing, so it never puts out a second version with the same contents.

## One-time setup

The packages live in the **`antfabric`** npm organisation. npm sets up a trusted publisher only for a
package that already exists, so 1.0.0 is published once by hand:

1. **Publish 1.0.0 from a checkout of `main`.** `npm login` (an owner or publisher of the
   `antfabric` organisation), then `pnpm install`, `pnpm build:packages` and `pnpm release:publish`.
   Tag that commit `v1.0.0` and make its GitHub release (`gh release create v1.0.0 --generate-notes`).
2. **Trust the workflow.** For each of `@antfabric/ui-core`, `@antfabric/ui-react` and
   `@antfabric/ui-react-native`: npmjs.com → the package → Settings → Trusted Publisher → GitHub
   Actions, with organisation `AntFabric`, repository `antfabric-ui`, workflow `release.yml` and no
   environment. (Or, with npm 11.15 or later and 2FA:
   `npm trust github <package> --repo AntFabric/antfabric-ui --file release.yml --allow-publish`.)
   Then, in the same settings, set publishing access to require 2FA and disallow tokens.
3. **Tags and releases.** The workflow pushes tags and creates releases with its own `GITHUB_TOKEN`
   (`contents: write`). If `v*` tags are protected, allow GitHub Actions to create them.

From then on every push to `main` publishes the next version from Actions. npm adds provenance once
the repository is public (it refuses provenance for a private one).

## Locally

- `pnpm release:dry`: builds the packages, packs them with pnpm and runs `npm publish --dry-run` on
  each tarball, listing what it would hold. Nothing is sent.
- `pnpm verify:packages`: packs the three packages, installs them in a scratch project, renders and
  type-checks them (under `moduleResolution` bundler and nodenext), and checks the `"use client"`
  directives, the source maps and which of core's entries load under the `react-server` condition.
  `build:packages` gives the `.d.ts` files' relative imports their `.js`, so `nodenext` can follow them.
- Always publish a **pnpm-packed tarball** (`scripts/publish-packages.mjs` does): only pnpm applies
  `publishConfig` (the `dist` exports) and turns `workspace:^` into a version range. A plain
  `npm publish` in a package folder would ship the TypeScript sources' export map.

## Known follow-ups

- **Core in the server graph.** The kits' files start with `"use client"`; core's do not, so a server
  layout can import from it. Its `./dtcg` and `./antfabric` entries load under the `react-server`
  condition; its root and `./chart` do not, because `state.ts` and `strings/react.ts` call
  `createContext` (and `chart/tween.ts` imports `useState`) when they load. `verify:packages` lists
  them in `SERVER_TODO`; moving the React parts out of core's root takes them off.
- **Exact dependency versions.** `recharts`, `react-native-gifted-charts` and `gifted-charts-core` are
  pinned exactly. A caret range would let an app share one copy with its own.
- **The catalogue has no public host yet.** `pnpm build` writes it to `apps/catalogue/dist`, and CI
  uploads it as an artifact. A Pages or other deploy job can be added to `release.yml` once a host is
  chosen.
- **Apps on the old internal registry** used the `@antfabric-ui/*` names. They move to
  `@antfabric/ui-*` (rename the imports) and drop their `@antfabric-ui:registry=` line from `.npmrc`.
