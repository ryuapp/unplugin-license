# Release workflow

This repository uses Tegami with `conventionalCommits: true`.

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
