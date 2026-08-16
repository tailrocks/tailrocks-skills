# GitHub workflow guidance

- Keep public pull-request and merge-queue validation isolated in
  `*-public-unmerged.yml`, read-only, secretless, and GitHub-hosted.
- Pin Linux to `ubuntu-26.04` and native validation to `macos-26`; never use
  floating runner labels.
- Pin every third-party action to a full commit SHA. Use least privilege,
  bounded concurrency, measured timeouts, and credential-free checkout.
- Install tooling only with `jdx/mise-action`; a workflow never carries its own
  version input beside the `mise.toml` pin. No per-tool actions (`setup-bun`,
  `setup-node`), no hand-installed tools, never Homebrew.
