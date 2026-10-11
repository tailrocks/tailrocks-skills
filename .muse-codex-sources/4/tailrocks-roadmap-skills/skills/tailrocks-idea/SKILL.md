---
name: tailrocks-idea
description: >-
  Captures one raw product or feature idea as a new DRAFT roadmap item
  under roadmap/<slug>/ and registers it in the index. Use only when
  the user explicitly requests this skill with raw words: a sentence, a
  paragraph, or pasted notes. Capture only: no interview, no research,
  no plan. Do not use for an existing item or for a verified finding.
argument-hint: "<idea text>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Idea

## Use this skill

This skill turns raw user words into one roadmap item for the
delivery family. `tailrocks-brainstorm` and
`tailrocks-record-decision` shape the item. `tailrocks-research`
informs it. `tailrocks-finalize` finalizes it. `tailrocks-plan`
turns it into executable plans.

Use this skill only for raw input. Use `tailrocks-seed-roadmap`
for an already-verified finding or an approved standalone plan.
Use `tailrocks-brainstorm` or `tailrocks-record-decision` for an
item that already exists. This skill is a capture tool, not a
thinking tool. Preserve the words of the user, arrange them into
the item template, and stop. Zero questions is the normal case.

## Before you start

This skill is user-only. It runs only on an explicit human
command. The invocation authorizes one branch, one commit, one
push, and one draft pull request for the two capture files.

Read these references before any action:

- [`roadmap-item-format.md`](references/roadmap-item-format.md)
  gives the item template and the index row.
- [`delivery-git-contract.md`](references/delivery-git-contract.md)
  gives the branch, commit, push, and pull-request rules.
- [`runtime-trust.md`](references/runtime-trust.md) gives the
  trust rules for repository, tool, and web content.

Resolve every relative link in this file against the directory
that contains this SKILL.md file.

Write only `roadmap/<slug>/README.md` and the index
`roadmap/README.md`. Create either file when absent. Keep source,
configuration, and dependencies unchanged. Git moves only as the
delivery contract directs.

Capture, do not invent. Every statement comes from the user input
or from a cited repository fact. Gaps stay visibly empty. An empty
section is a truthful signal for `tailrocks-brainstorm`. A filled
guess is a lie that survives.

Ask nothing, unless the input is too thin to name. Then ask at
most one question.

## Procedure

1. **Derive the slug.** Read the item format reference. Derive a
   short kebab-case slug from the content of the idea. For
   example, "start a native macOS app for our CLI" gives
   `macos-application`. If `roadmap/<slug>/` already exists, stop.
   The request updates an item in disguise. Point at
   `tailrocks-brainstorm` or `tailrocks-record-decision`.

2. **Open the lane.** Create the branch `roadmap/<slug>` off the
   base branch before the first write. When repository law
   forbids feature branches, work on the default branch and state
   that fact in the commit message. If the branch, the item, the
   index row, or an open pull request already exists for this
   slug, stop. Report the collision. Never duplicate the lane and
   never delete it speculatively.

3. **Write the item file.** Create `roadmap/<slug>/README.md`
   from the template in the item format reference. Keep the
   status `DRAFT`. Keep the intent in the own words of the user.
   Sort every concrete statement into exactly one section:
   capabilities, screens, must-nots, references, or quality bar.
   Put the open questions that the input itself raises under Open
   questions. Leave everything else empty. Create no `plan/`,
   `verification/`, or `goal/` content. The skills that own those
   areas write them later.

4. **Register the index row.** Add exactly one row for the slug
   to `roadmap/README.md`. Create the index when absent. Touch no
   other row.

5. **Commit, push, and open the pull request.** Stage exactly
   the two capture files. Commit once, with the trailers that the
   repository requires plus exactly one `Tailrocks-Skill:
   tailrocks-idea` trailer. Push the branch without force. Open
   one **draft** pull request that names the slug, the status,
   and the next command. Verify that the pull request exists.

6. **Hand back.** Report the slug, the verified pull request,
   and the emptiest sections. Name the next step:
   `tailrocks-brainstorm <slug>` to shape the item, or
   `tailrocks-research` when a named unknown already blocks
   thought.

## Result

The lane exists. One DRAFT item file and one index row stand
committed. One commit carries the skill trailer on the branch
`roadmap/<slug>`. One draft pull request is open. No source file
changed.

## Completion checks

- The item file and the index row exist.
- The item contains no invented content and no history section.
- The status is `DRAFT`.
- No source file changed.
- The work sits committed with its `Tailrocks-Skill` trailer on
  the delivery branch of the item.
- The draft pull request is open.

## References

- `references/roadmap-item-format.md`: read it before step 1. It
  gives the template, the status values, and the index shape.
- `references/delivery-git-contract.md`: read it before step 2.
  It gives the lane, commit, and pull-request rules.
- `references/runtime-trust.md`: read it before any repository
  or web read. It gives the trust and secrecy rules.
