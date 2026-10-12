# Pull request

## Summary

Describe the change and why it is needed.

## What ships

List the marketplace catalog, documentation, and automation changes included in this PR.

## Behavior changes

Describe any changes to how catalogs resolve or update plugin sources.

## What this addresses

Explain the user or maintenance problem this change solves.

## Verify locally

### Checkout

```sh
git status --short --branch
```

### Static checks

```sh
python3 scripts/generate-catalogs.py
python3 scripts/validate-marketplace.py
actionlint -color
git diff --check
```

## Related pull requests

List related PRs in plugin source repositories, or write `None`.
