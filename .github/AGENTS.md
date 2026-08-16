# GitHub workflow guidance

- Keep public pull-request and merge-queue validation isolated in
  `*-public-unmerged.yml`, read-only, secretless, and GitHub-hosted.
- Pin Linux to `ubuntu-26.04` and native validation to `macos-26`; never use
  floating runner labels.
- Pin every third-party action to a full commit SHA. Use least privilege,
  bounded concurrency, measured timeouts, and credential-free checkout.
- Install all project tooling through mise. Never use Homebrew in this
  repository.
