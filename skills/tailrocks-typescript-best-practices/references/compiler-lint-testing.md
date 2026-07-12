# Compiler, Lint, Testing, and Migration

Load this reference when establishing strictness, selecting checks, testing type
contracts, or migrating a brownfield codebase.

## Compiler baseline

For new code, enable the strongest compatible baseline:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "useUnknownInCatchVariables": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Honor runtime and framework requirements. In brownfield repositories, measure the
affected surface, migrate one project or boundary at a time, and gate each clean
slice in CI. Assertions that merely silence newly exposed uncertainty fail the
migration.

## Lint baseline

Use the installed linter's current type-aware strict presets when compatible.
Require equivalents of exhaustive switches, unsafe-flow checks, floating/misused
promise checks, caught-error narrowing, and disciplined assertions. Inspect the
installed major version and configuration style before changing syntax.

Configuration owns policy once. A local suppression identifies the rule, reason,
and compatibility boundary; broad file/project disables require a documented
migration owner.

## Tests

Add the smallest durable tests for:

- valid and invalid parser input, including unknown-key policy;
- behavior-bearing error variants and legal/rejected transitions;
- adapters that translate dependency exceptions;
- visible mutation/immutability and async cleanup/cancellation;
- public type constraints whose regression would compile unsafe callers.

Use the existing type-test tool or a compile-only fixture. Each intentional
`@ts-expect-error` includes a reason. Avoid type tests that merely restate obvious
compiler behavior.

## Migration order

1. Stop new `any`, unchecked casts, ignored errors, and floating promises.
2. Parse external input.
3. Add domain values at high-confusion boundaries.
4. Replace invalid state combinations with discriminated unions.
5. Make expected failures typed.
6. Localize mutation and async ownership.
7. Enable indexed-access and optional-property strictness incrementally.
8. Gate exhaustive and unsafe-flow linting.
9. Add type tests for public contracts.

Each slice compiles, tests, and preserves external behavior unless the requested
change explicitly alters it.

## Validation record

Infer the package manager from the lockfile and prefer repository scripts. Record
typecheck, lint, and focused tests as passed, change-caused failure, pre-existing
failure, unavailable, or intentionally unrun. Claim only commands that actually
completed successfully.
