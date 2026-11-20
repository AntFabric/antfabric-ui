# Releasing

`@antfabric-ui/core`, `@antfabric-ui/react` and `@antfabric-ui/react-native` are published to npm by
GitHub Actions, from `main`, with [Changesets](https://github.com/changesets/changesets). The three
share one version (`fixed` in `.changeset/config.json`). Nobody publishes from a laptop.

## How a change ships

1. **On your branch**, with the change, run `pnpm changeset`: pick any of the three packages, the bump
   (`major` breaks a consumer, `minor` adds, `patch` fixes) and one or two sentences for the changelog.
   Commit the `.changeset/*.md` it writes. Skip it for changes no consumer can see (the catalogue,
   the docs, the scripts). [`.changeset/README.md`](.changeset/README.md) has the details.
2. **Open a pull request.** `ci.yml` runs on every pull request: `pnpm build` (which runs `pnpm check`), `pnpm verify:packages`
   and `pnpm release:dry`, a `pnpm publish --dry-run` of the three packages.
3. **Merge it.** `release.yml` runs on `main`: `pnpm check`, `pnpm build:packages`,
   `pnpm verify:packages`, then `changesets/action`, which opens or updates a pull request titled
   **chore: version packages**. It bumps the three versions and writes each `CHANGELOG.md`.
4. **Merge "chore: version packages"** when you want to release. The next run of `release.yml` finds
   no pending changesets and runs `pnpm release` (`pnpm build:packages && changeset publish`): every
   package whose version is not on npm yet is published (with provenance once the repository is
   public; npm refuses it for a private one), tagged
   (`@antfabric-ui/core@<version>`, …) and given a GitHub release.

A failed publish is safe to re-run (Actions → Release → Re-run): `changeset publish` skips a version
npm already has.

## One-time setup

1. **npm organisation.** Create the `antfabric-ui` organisation on npmjs.com (the `@antfabric-ui`
   scope was free when this was written) and add the people who may publish.
2. **`NPM_TOKEN`.** Create a granular access token with read and write on the `@antfabric-ui` scope
   (or an automation token), and add it as the repository secret `NPM_TOKEN`
   (Settings → Secrets and variables → Actions).
3. **Let Actions open pull requests.** Settings → Actions → General → Workflow permissions: "Read and
   write permissions" and "Allow GitHub Actions to create and approve pull requests".
4. **Branch protection on `main`:** if you require the CI check, note that the "chore: version
   packages" pull request gets no CI run (Actions does not start workflows for pushes made with its
   own `GITHUB_TOKEN`), so either let admins merge it or give `changesets/action` a GitHub App or
   personal token instead.
5. **The first release.** `main` already holds the changesets made since 1.1.0, so the first
   "chore: version packages" pull request proposes **1.2.0**. Merging it is the first npm publish.
   Versions 1.0.0 and 1.1.0 were only on the old internal registry.
6. **Later, optionally:** once the packages exist on npm, add this repository and `release.yml` as a
   [trusted publisher](https://docs.npmjs.com/trusted-publishers) for each package and remove
   `NPM_TOKEN`.

## Locally

- `pnpm release:dry`: builds the packages and runs `pnpm publish --dry-run`, listing what each tarball
  would hold. Nothing is sent.
- `pnpm verify:packages`: packs the three packages, installs them in a scratch project, renders and
  type-checks them.
- `pnpm version-packages` writes changelog entries with links to GitHub pull requests, so it needs
  `GITHUB_TOKEN` in the environment; CI has it. You rarely need to run it yourself.
- Always publish through pnpm (`changeset publish` does): only pnpm applies `publishConfig` (the
  `dist` exports) and turns `workspace:^` into a version range. A plain `npm publish` would ship the
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
