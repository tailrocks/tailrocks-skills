# Final content movement receipts — design, visual QA, and pull requests

Source revision: `2626d51827747c3b3e0e76cd20a7d38363c82648`.

Final-state ledger, not migration plan: no alias, redirect, or compatibility route,
per-skill README, or skill eval surface remains.

| Source | Operation | Final target | Checker | Result |
|---|---|---|---|---|
| macOS design and prototype authority | KEEP | `skills/tailrocks-macos-design/SKILL.md` | `scripts/macos-design-ownership.test.ts` | PASS: design/prototype exclusive |
| macOS scored design review | MOVE | `skills/tailrocks-macos-design-review/SKILL.md` | `scripts/macos-design-ownership.test.ts` | PASS: review exclusive |
| macOS design system extraction | MOVE | `skills/tailrocks-macos-design-systematize/SKILL.md` | `scripts/macos-design-ownership.test.ts` | PASS: output exclusive |
| Web design and blessing | KEEP | `skills/tailrocks-web-design/SKILL.md` | `scripts/web-design-ownership.test.ts` | PASS: authoring exclusive |
| Web design audit | MOVE | `skills/tailrocks-web-design-audit/SKILL.md` | `scripts/web-design-ownership.test.ts` | PASS: audit cannot author or bless |
| Terminal design, blessing, golden freeze | KEEP | `skills/tailrocks-tui-design/SKILL.md` | `scripts/tui-design-ownership.test.ts`; `scripts/tui-gallery-template.test.ts` | PASS: blessing-bound CAS publication |
| Terminal design audit | MOVE | `skills/tailrocks-tui-design-audit/SKILL.md` | `scripts/tui-design-ownership.test.ts` | PASS: audit read-only |
| macOS interaction/accessibility QA | KEEP | `skills/tailrocks-macos-visual-qa/SKILL.md` | `scripts/macos-visual-ownership.test.ts` | PASS: audit output exclusive |
| macOS visual freeze | MOVE | `skills/tailrocks-macos-visual-baseline/SKILL.md` | `scripts/macos-visual-ownership.test.ts` | PASS: blessing-bound owner exclusive |
| macOS visual regression | MOVE | `skills/tailrocks-macos-visual-regression/SKILL.md` | `scripts/macos-visual-ownership.test.ts` | PASS: cannot approve or rebaseline |
| macOS executable visual harness | MOVE | `scripts/macos-visual-qa/` | `scripts/macos-visual-qa/{install,security,integration}.test.ts` | PASS: exact ownership, cleanup, recovery |
| Web visual freeze | MOVE | `skills/tailrocks-web-visual-baseline/SKILL.md` | `scripts/web-visual-ownership.test.ts`; `scripts/web-visual-qa/capture.test.ts` | PASS: guarded server and CAS publication |
| Web visual regression | MOVE | `skills/tailrocks-web-visual-regression/SKILL.md` | `scripts/web-visual-ownership.test.ts`; `scripts/web-visual-qa/capture.test.ts` | PASS: route exclusive |
| Shared design choreography | MOVE | `shared/references/design-pipeline.md` and generated consumers | `scripts/generate-references.test.ts` | PASS: consumers byte-identical |
| Pull-request creation | KEEP | `skills/tailrocks-create-pr/SKILL.md` | `scripts/create-pr-ownership.test.ts` | PASS: transaction exclusive |
| Pull-request metadata refresh | KEEP | `skills/tailrocks-refresh-pr/SKILL.md` | `scripts/delivery-skill-contracts.test.ts` | PASS: exact mutation and recovery contract |
| Pull-request review | KEEP | `skills/tailrocks-review-pr/SKILL.md` | `scripts/delivery-skill-contracts.test.ts` | PASS: posting separately authorized |
| Pull-request template generation | KEEP | `skills/tailrocks-pr-template/SKILL.md` | `scripts/pr-template-target.test.ts` | PASS: one exact transactional target |
| Pull-request merge | KEEP | `skills/tailrocks-merge-pr/SKILL.md` | `scripts/merge-pr-ownership.test.ts` | PASS: merge authority exclusive |
| Retired combined visual routes and owners | DELETE | Absent from published surfaces | ownership tests; `scripts/validate-skills.test.ts` | PASS: resurrection rejected |
| Per-skill README and eval surfaces | DELETE | Absent from every skill package | `scripts/validate-skills.test.ts` | PASS: forbidden paths rejected |

Final proof: generated references checked 88 sources and 258 destinations;
public documentation checked 172 generated files on 2026-08-23.
