# Releasing

`@antfabric-ui/core`, `@antfabric-ui/react` and `@antfabric-ui/react-native` are published to npm by
GitHub Actions on **every push to `main`**. The three share one version. Nobody publishes from a
laptop.

## How a change ships

1. **Open a pull request.** `ci.yml` runs `pnpm build` (which runs `pnpm check`), `pnpm verify:packages`
   and `pnpm release:dry`, a `pnpm publish --dry-run` of the three packages.
2. **Merge it.** `release.yml` runs on the push to `main`: `pnpm check`, then picks the version
   (`scripts/release-version.mjs`), `pnpm build:packages`, `pnpm verify:packages`, publishes the three
   packages with pnpm, tags the commit `v<version>` and makes a GitHub release with notes generated
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

A failed run is safe to re-run (Actions → Release → Re-run): the version is picked again from npm.

## One-time setup

1. **npm organisation.** Create the `antfabric-ui` organisation on npmjs.com and add the people who
   may publish.
2. **`NPM_TOKEN`.** Create a granular access token with read and write on the `@antfabric-ui` scope
   (or an automation token), and add it as the repository secret `NPM_TOKEN`
   (Settings → Secrets and variables → Actions).
3. **Tags and releases.** The workflow pushes tags and creates releases with its own `GITHUB_TOKEN`
   (`contents: write`). If `v*` tags are protected, allow GitHub Actions to create them.
4. **Later, optionally:** once the packages exist on npm, add this repository and `release.yml` as a
   [trusted publisher](https://docs.npmjs.com/trusted-publishers) for each package and remove
   `NPM_TOKEN`. npm adds provenance once the repository is public (it refuses it for a private one).

## Locally

- `pnpm release:dry`: builds the packages and runs `pnpm publish --dry-run`, listing what each tarball
  would hold. Nothing is sent.
- `pnpm verify:packages`: packs the three packages, installs them in a scratch project, renders and
  type-checks them.
- Always publish through pnpm (the workflow does): only pnpm applies `publishConfig` (the `dist`
  exports) and turns `workspace:^` into a version range. A plain `npm publish` would ship the
  TypeScript sources' export map.

## Known follow-ups

- **Types under `moduleResolution: node16` / `nodenext`.** The `.d.ts` files use extensionless
  relative imports. Bundler resolution (Vite, Metro, Next, `moduleResolution: bundler`) is fine;
  `verify:packages` only checks that. Emit `.js` extensions or bundle the declarations to serve
  `nodenext` consumers.
- **Exact dependency versions.** `recharts`, `react-native-gifted-charts` and `gifted-charts-core` are
  pinned exactly. A caret range would let an app share one copy with its own.
- **The catalogue has no public host yet.** `pnpm build` writes it to `apps/catalogue/dist`, and CI
  uploads it as an artifact. A Pages or other deploy job can be added to `release.yml` once a host is
  chosen.
- **Apps on the old internal registry** must drop their `@antfabric-ui:registry=` line from `.npmrc`,
  or they keep resolving the scope there.
