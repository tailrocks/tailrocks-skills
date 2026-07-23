# Submission Gate

Every check passes from evidence produced this session:

1. **Anchored.** Accepted/linked issue or genuinely trivial change; closing
   keyword placed where project convention requires.
2. **Minimal.** One logical change; no drive-by refactor/reformat. Split above
   the project's observed typical size (400 changed lines only as fallback).
3. **Base.** Correct target branch and current rebase.
4. **History.** Regime-correct messages and trailers. DCO signoff only after
   explicit human attestation this session.
5. **Tested.** Run full suite and linters locally. Bug fixes add a regression
   test that fails without the fix. Claims quote actual output.
6. **Styled.** Obey formatter/linter config; absent config, match 3–5 neighbors.
7. **Documented.** Update docs and detected changelog/fragment/changeset.
8. **Template-complete.** Answer every section/checkbox honestly. Map YAML
   form fields. Evidence counts only when present in the body. Without a
   template include What, Why, and How tested.
9. **Disclosure.** Use required placement/wording or voluntary prose.
10. **Artifact hygiene.** Diff excludes `contrib/`, `.claude/`, `.cursor/`,
    `.aider/`, similar metadata, invented packages, and verbose generated
    comments. Align or strip tool-default footers.
11. **Human ownership.** User confirms they can explain every line and will
    personally engage in review. “No” means not ready.

## Submit protocol

1. Present all gate results, full `pr_description.md`, and `git diff --stat`.
2. Request an explicit approval phrase for this exact contribution.
3. If DCO applies, separately request attestation before `git commit -s` or
   amending signoffs.
4. Only after approval: push and run
   `gh pr create --body-file contrib/<owner>-<repo>/pr_description.md`.
5. Record approval, PR URL, and date in `log.md`.
6. Without approval, leave artifacts local and finish cleanly.
