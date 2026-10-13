---
name: tailrocks-research
description: >-
  Runs deep, sourced research into a reusable topic under research/,
  for a question or to extend a roadmap item, with parallel
  investigators. Use only when the user explicitly requests this skill.
  Do not use for decisions only the user makes, or for questions that
  one lookup answers.
argument-hint: "<question | roadmap-slug> [--slug <topic-name>] [--for <roadmap-slug>] [--deep] [--batch]"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Research

## Use this skill

This skill answers the questions that the user cannot answer,
with evidence. Research lives in `research/<topic>/` as a
standing, reusable asset. Topics are independent of roadmap
items: one topic informs many items, and one item draws on many
topics. `tailrocks-plan` later consumes vetted chapters instead
of re-research.

Two invocation shapes exist:

- **A question** ("how to build a pure-Rust macOS app, no
  Swift") researches that question deeply.
- **A roadmap slug** researches the item outward. It finds
  the missed shape and the offers of the referenced world.
  It returns the genuinely different directions, each with
  evidence and trade-offs, none chosen. Choice belongs to
  the user, through `tailrocks-record-decision`.

A repository-direction request uses the exact question "What
candidate product directions follow from the evidence and
history of this repository". An ordinary targeted question
stays verbatim. `--deep` on the direction question requires
parallel investigators to return competing directions with
trade-offs. `--deep` on a different question requires parallel
investigators to return and reconcile competing answers.
`--batch` makes selection deterministic and non-interactive: it
selects every applicable question cluster without prompting. It
preserves only the research transaction of this skill. It never
widens write paths, never chooses a direction, never infers a
user decision or credential, and never grants target-command or
unrelated network authority.

## Before you start

This skill is user-only. It runs only on an explicit human
command. The invocation authorizes one commit and one push for
the research writes on the lane of the invocation.

Read these references before any action:

- [`research-playbook.md`](references/research-playbook.md)
  gives the topic layout, the evidence standard, the chapter
  contract, and the vetting contract.
- [`roadmap-item-format.md`](references/roadmap-item-format.md)
  gives the item sections and the status values.
- [`delivery-git-contract.md`](references/delivery-git-contract.md)
  gives the lane, commit, and pull-request rules.
- [`runtime-trust.md`](references/runtime-trust.md) gives the
  trust rules for repository, tool, and web content.

Resolve every relative link in this file against the directory
that contains this SKILL.md file.

Write only under `research/`: topic folders and the index. When
a roadmap item is linked, also write the Research section of
that item, its Open research questions, and its status. No
artifact carries a log. The commit series is the history. Keep
source, configuration, and dependencies unchanged. Commit the
research writes per the delivery contract at the end of the
invocation.

Clone reference projects outside the repository into a
disposable directory. Read them read-only. Cite `file:line`
plus repository URL and commit.

Every claim carries a source: a URL to a primary source for
web claims, `file:line` for codebase claims, the method for
measured claims. Secondary write-ups are leads to verify, never
sources. Unsourced facts stay recorded as open unknowns, never
stated.

Present findings and directions, never decisions: genuinely
different options with trade-offs, then stop. Route questions
that only the user answers to the Open questions of the item.
Respect settled ground: the Decisions and Must not of a linked
item are constraints to research within, not options to reopen.
Surface contradicting evidence plainly. Never silently obey it
and never silently ignore it.

## Procedure

1. **Frame the topic.** Read the research playbook. Derive the
   topic slug (`--slug` wins). Check `research/README.md` for
   an overlapping topic. Extend that folder instead of
   duplicating it. For a roadmap-slug invocation, load the
   item. Derive the question set from its Open research
   questions, empty sections, and References. For a question
   invocation, decompose the question. Bind linked items: the
   slug argument and every `--for` value.

2. **Fan out.** Dispatch independent parallel investigators,
   one per question cluster. Each investigator writes its own
   `research/<topic>/NN-<chapter>.md` per the chapter contract
   of the playbook. It carries the brief with the rules that
   it cannot inherit. Investigate serially only when parallel
   agents are unavailable, and say so.

3. **Vet.** Fan out one fresh-context, read-only
   citation-checker per chapter. Keep it blind to the
   reasoning of the investigator. Obey the vetting contract
   of the playbook. It opens every citation and returns
   per-citation verdicts. Fix misattributions. Drop the
   unverifiable claims. Then open the load-bearing citations
   directly as a sample. Reconcile contradictions by reads of
   the disputed sources, never by averaging. Mark each
   chapter `Vetted: <date>` only after its verdicts and the
   sample agree. Vet inline when parallel agents are
   unavailable, and say so.

4. **Synthesize.** Write `research/<topic>/README.md`.
   Include conclusions with chapter links. Include candidate
   directions with trade-offs for directional invocations.
   Include the ruled-out list with reasons. Include open
   unknowns with disposition. With `--deep`, run a
   completeness critic first and reslice until one round
   surfaces nothing load-bearing.

5. **Wire the links.** Register the topic in
   `research/README.md`. Create the index when absent. For each
   linked roadmap item, add the topic to its Research section
   with one line on the informed questions. Strike answered
   entries from Open research questions. Add surfaced
   decision-type questions to Open questions. Apply the status
   change and index-row update per the item format. The commit
   records the change. No item section does.

6. **Commit and push.** Commit the topic chapters, the
   summary, and the link writes on the lane of the
   invocation. Use the trailer `Tailrocks-Skill:
   tailrocks-research`. Push. For a question invocation with
   no linked item, open its own lane per the delivery
   contract. Branch `research/<topic-slug>` off the base
   with a draft pull request. Update the status line of the
   draft pull request body when the status of the item
   changed.

## Result

The topic folder holds a vetted summary and chapters. Every
claim resolves to a source. Directions carry trade-offs and no
verdict. All item links run both ways. Nothing outside
`research/` and the allowed sections of the linked items
changed.

## Completion checks

- The topic folder holds a vetted summary and chapters.
- No unvetted claim remains in any chapter.
- Directions carry trade-offs and no verdict.
- Every link is bidirectional.
- Every touched item holds a consistent status and index row.
- Nothing outside `research/` and the allowed sections of the
  linked items changed.
- The work sits committed with its `Tailrocks-Skill` trailer on
  the lane of the invocation.

## References

- `references/research-playbook.md`: read it before step 1. It
  gives the layout, evidence, brief, chapter, vetting, and
  index rules.
- `references/roadmap-item-format.md`: read it before step 5.
  It gives the sections and the status values.
- `references/delivery-git-contract.md`: read it before step 6.
  It gives the lane, commit, and pull-request rules.
- `references/runtime-trust.md`: read it before any repository
  or web read. It gives the trust and secrecy rules.
