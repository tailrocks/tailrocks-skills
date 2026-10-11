---
name: tailrocks-pr-template
description: >-
  Creates or reconciles the single file `.github/PULL_REQUEST_TEMPLATE.md`.
  Use this skill when the user says PR template, default PR body, PR
  boilerplate, or standard PR text. This skill does not open, refresh,
  review, or merge a PR.
argument-hint: "[repo path]"
disable-model-invocation: false
license: Apache-2.0
user-invocable: true
when_to_use: >-
  User asks for a PR template file, a default PR body, or PR text
  boilerplate.
---

# PR template

## Use this skill

This skill writes one pull request template for a repository. The skill writes
the file `.github/PULL_REQUEST_TEMPLATE.md` and no other file.

Use this skill when the user asks for a PR template, a default PR body, or
standard PR text. Do not use this skill to open, refresh, review, or merge a PR.

## Before you start

Obey the active user request first. If the request conflicts with a safety rule
in this skill, stop. Report the conflict.

Before any action, read `references/runtime-trust.md`. Resolve each relative
link against the directory that contains this SKILL.md file.

This skill never commits, pushes, or opens a PR. Give the written file to
`tailrocks-create-pr` to ship the file as a PR.

If the resolved target or a parent directory is a symlink, stop with zero
writes. Never write through a symlink.

Take each command in the template from the repository CI, task runner, or
contributor documents. Never invent a gate. Never leave a `<placeholder>`
command in an executable fence.

## Procedure

1. **Resolve the target.** Run `git rev-parse --show-toplevel` and `git
   rev-parse HEAD` in the target repository. Record the canonical root and HEAD.
   The target is always `.github/PULL_REQUEST_TEMPLATE.md` at that exact path
   and case. If the file is present, record `UPDATE`. If the file is absent,
   record `CREATE`. Before step 2, record `CREATE` or `UPDATE`.

2. **Read the base.** Read `references/PULL_REQUEST_TEMPLATE.md`. Learn the
   section menu, the authoring rules in the header, and the shape of each
   Verify-locally block. Before step 3, hold a clear picture of the result.

3. **Research the structure.** Record what the repository is and what gates it
   has. Record the languages and the build system. Record the real format, lint,
   and test commands from CI workflows, the task runner, and contributor or
   agent instruction files. Record whether the repository has a docs site, a
   migration surface, or a runnable smoke path. Ignore unsupported template
   paths. Never consult them. Before step 4, give each candidate Verify-locally
   block the real command of the repository or strike the block.

4. **Select a small section set.** Keep only sections that the step 3 evidence
   earns. Drop each section that has no structural reason. Before step 5, give
   each kept section a structural reason.

5. **Publish the template.** Change the base in memory to fit this repository.
   Keep the one-paragraph rule and the no-changelog rule in the HTML comment
   header. Rewrite the drop rules to name only the sections that this template
   carries. Add the real commands of the repository to each Verify-locally
   block. State each block include condition and drop condition in terms of the
   paths of this repository. Keep guidance prose in `<angle brackets>` for
   future authors. Keep commands out of `<angle brackets>`. Never publish the
   base template verbatim. Before the write, do step 1 again. If the root, HEAD,
   or target presence changed, stop with zero writes. For `UPDATE`, if the file
   already holds exactly the changed content, skip the write. Report the file as
   unchanged. For `CREATE`, create the parent directory first. Use the permitted
   file-editing tool to write the target. Read the target again. Require the
   bytes to match the intent. Before step 6, confirm the match or the unchanged
   state.

6. **Report.** Report the target and the publication outcome. Report the section
   set with the reason for each section. Report the evidence behind each command
   in the Verify-locally blocks. Name `tailrocks-create-pr` as the next step to
   ship the file as a PR.

## Result

The repository has one template for its own structure at
`.github/PULL_REQUEST_TEMPLATE.md`. The report names the target, the outcome,
the section reasons, and the command evidence.

For `UPDATE`, the skill keeps the content that the authors of the repository
wrote and use. The skill repairs commands that drifted from the real gates. The
skill adds or drops sections as the evidence requires. The report names each
change.

## Completion checks

Before the report is complete, make sure that each item below is true:

- The written target is `.github/PULL_REQUEST_TEMPLATE.md`.
- Each command is traceable to the CI, task runner, or contributor documents of
  the repository.
- Each section has a stated reason.
- No executable `<placeholder>` command remains.
- The skill committed nothing.

## References

Read these references at the stated times:

- Read `references/PULL_REQUEST_TEMPLATE.md` in step 2 for the base shape.
- Read `references/runtime-trust.md` before any action for the trust rules.
