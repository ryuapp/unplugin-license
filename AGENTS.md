# Release workflow

This repository uses Tegami with `conventionalCommits: true`.

## Commit messages

Release-worthy commits and squash-merge PR titles must use the
`unplugin-license` package scope so Tegami can associate the change with the
package:

```text
feat(unplugin-license): add a new feature
fix(unplugin-license): fix a bug
```

Use `feat(unplugin-license):` for a minor release and
`fix(unplugin-license):` for a patch release. Use
`feat(unplugin-license)!:` or a `BREAKING CHANGE:` footer for a major release.
Unscoped messages such as `feat: ...` and `fix: ...` do not select a package
and therefore do not trigger a version bump.

Commits that should not trigger a release may use unscoped types such as
`chore:`, `ci:`, or `docs:`.

## Version packages

Create the version changes and publish lock:

```sh
deno task tegami version
```

The GitHub plugin creates or updates the version PR when running in CI with a
GitHub token.

## Publish packages

Validate the publish plan without publishing:

```sh
deno task tegami publish --dry-run
```

Publish after the version PR has been merged:

```sh
deno task tegami publish
```
