# Changesets

A changeset is a small Markdown file that says what changed in a package and how big the change is.
`CHANGELOG.md` and the next version number are built from them. This folder is read by
[Changesets](https://github.com/changesets/changesets); `config.json` is its settings.

## One version for the three packages

`@antfabric-ui/core`, `@antfabric-ui/react` and `@antfabric-ui/react-native` are `fixed` in
`config.json`: whichever you name in a changeset, all three get the same new version, so a release is
one number, tagged per package (`@antfabric-ui/core@<version>`, …). `@antfabric-ui/docs` and `@antfabric-ui/catalogue` are private and
ignored: they are never versioned or published.

## Add a changeset

Run it from the repository root, on your branch, for any change a consumer could notice (a prop, a
token, a fix in what a component draws). Skip it for the catalogue, the docs and the scripts.

```bash
pnpm changeset
```

1. Pick the package the change is in (any one of the three is enough; they move together).
2. Pick the bump. From 1.0 on, semver: `major` for a change that breaks a consumer (a renamed or
   removed prop or token); `minor` for a new component or an additive prop; `patch` for a fix.
3. Write one or two plain sentences for the people who read `CHANGELOG.md`: what changed and what to
   do about it. Name the component or token.

Commit the generated `.changeset/<random-name>.md` with your change.

## Release

Nothing is published by hand and nobody pushes a tag. Merging to `main` runs
`.github/workflows/release.yml`, which turns the pending changesets into a "Version packages" pull
request; merging that pull request publishes to npm. [`RELEASING.md`](../RELEASING.md) has the whole
procedure and the one-time setup.
