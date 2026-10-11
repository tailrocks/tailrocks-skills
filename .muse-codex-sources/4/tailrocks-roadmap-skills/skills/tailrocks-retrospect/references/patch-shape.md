# Patch shape

A proposed patch is a written offer, not a diff to apply. It
stays precise enough for the editing skill to land it
without re-deriving the finding, and additive enough to
never damage behavior outside the finding.

## The six legal shapes

1. **A scope bullet** in "Before you start": a scope or
   permission where the skill stayed silent. Use it when
   the divergence was an act that the skill refuses or
   reports.
2. **A numbered step, appended, with its own completion
   condition**: a missing act in the own procedure of the
   skill. Use it when the divergence was work that the
   skill does and no current step covers.
3. **A completion-checks clause**: a refusal missing from
   the closing checks. Use it when the step existed but
   nothing checked its result.
4. **A reference file plus one router line**: depth that
   the router never affords. The router line states *when
   to read it*, never the content.
5. **A template slot, added or removed.** A copy-ready
   asset forced the executor to invent a shape. Or a
   section stands that no reader of the record used. Give
   the template path, the followed section, and the exact
   block.
6. **An acceptance check**: a claimed skill behavior that
   no deterministic or recorded check proves. Give the
   input, observable output, and evidence record. The
   applying skill owns the baseline that admits it.

A patch outside these shapes is a whole-skill redesign. It
belongs to a create-or-restructure invocation of the
skill-authoring skill.

## The anchor

Write every proposed patch with these fields, so it applies
mechanically and reviews without hunting:

```text
Target:   skills/<name>/SKILL.md
Shape:    <one of the six legal shapes>
Anchor:   after "<exact heading or bullet>"
Text:     <exact prose to insert>
Checks:   <governing check or evidence IDs>
Replaces: <nothing | removed lines, and why>
```

`Checks` is never optional. A router edit affects every
behavior in the file, so the applying skill reruns all
affected deterministic checks. The claims nearest the patch
identify load-bearing wording without touching the durable
evidence record.

## Additive discipline

- **Never rewrite a section outside the finding.** The
  evidence licenses exactly the change that catches the
  divergence.
- **Append steps. Never renumber earlier ones.** A patch
  that reorders steps invalidates acceptance evidence keyed
  to step content.
- **Strengthen before adding.** When a current section
  already gestures at the obligation, the patch states it
  there. Two sections that aim at one obligation are weaker
  than one plain statement.
- **Respect the router budget.** New material defaults to a
  reference. When the router of the target is already long,
  the patch names the replaced content. A proposal that only
  appends to a full router is incomplete.
- **Signpost load-bearing text.** A requirement that fires
  every time gets a named bullet, a heading, or its own
  labelled sentence. Buried as one clause inside a four-idea
  paragraph it surfaces only sometimes, and the next
  retrospective finds the same divergence again.
- **State the rule and its reason, not a stack of
  imperatives.** A patch that explains the reason of the
  boundary survives paraphrase. A capitalized must never
  does.

## When no one skill owns the patch

**Cross-cutting rule.** When the same missing check sits in
two or more skills, propose one shared reference. Propose
the single router line where each affected skill links it.
List every skill in scope, with the lanes untouched by this
item. Separate filings of one finding per skill drift the
lanes into different wording for one rule.

**Gate or validator.** A mechanically decidable check from
the repository belongs in the validator of the collection
or a repository gate. Examples: a forbidden path, a
required field, a status from a fixed set. Never put it in
prose that an agent remembers. Propose it there and state
that fact. Prose that duplicates a gate is dilution. Name
the skill that owns gates and debt ledgers as the receiver,
so the hand-off carries a command, not a file path.

**Instruction file.** A rule specific to one repository,
not to the skill, belongs in the own instruction file of
that repository. Name the skill that owns instruction files
as the receiver. State the owning directory of the rule.
The owning directory is never the root by default. Then
stop.

**No patch.** A signposted rule that existed and suffered
ignorance records with its evidence and no proposal. So
does a divergence whose only available fix worsens the
skill. State the case and the reason, so the next
retrospective never re-litigates it.

## Ranking

Order the proposals by prevented future divergence. First:
the future items that hit the same gap. A cross-cutting
rule outranks a single-skill bullet. Second: the cost of
the divergence when it happened. Shipped scope outranks a
rework loop. Third: the pipeline position of the missing
check. A precondition outranks a completion check. It stops
the work instead of catching it afterwards.

## The forbidden content of a patch

- The name of the audited repository, its pull request, its
  organization, or any person. The patch text ships, and
  shipped skill content states current doctrine without
  provenance.
- A pointer to a different skill collection, project, or
  plugin as authority.
- A changelog note, a "previously this said" aside, or any
  record of the retrospective origin of the patch.
