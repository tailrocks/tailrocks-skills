# Patch shape

A proposed patch is a written offer, not a diff to apply. It has to be precise
enough that the skill that owns editing can land it without re-deriving the
finding, and additive enough that landing it cannot damage behavior the
finding never examined.

## The six legal shapes

1. **A Boundaries bullet** — a scope or permission the skill was silent
   about. Use when the divergence was the skill doing something it should
   have refused or reported.
2. **A numbered step, appended, with its own Complete when** — a missing act
   in the skill's own procedure. Use when the divergence was work the skill
   should have done and no existing step covers.
3. **A Final-gate clause** — a refusal the closing gate did not carry. Use
   when the step existed but nothing checked its result.
4. **A reference file plus one router line** — depth the router cannot afford.
   The router line says *when to read it*, never what it contains.
5. **A template slot, added or removed** — a copy-ready asset that made the
   executor invent a shape, or a section no reader of the record used. Give
   the template path, the section it follows, and the exact block.
6. **An acceptance check** — a behavior the skill claims and no deterministic
   or recorded check proves. Give the input, observable output, and evidence
   record; the applying skill owns the baseline that admits it.

A patch that fits none of these is a whole-skill redesign that belongs to a
create-or-restructure invocation of the skill-authoring skill.

## The anchor

Every proposed patch is written with these fields, so it can be applied
mechanically and reviewed without hunting:

```text
Target:   skills/<name>/SKILL.md
Shape:    Boundaries bullet | appended step | final-gate clause | reference + router line | template slot | acceptance check
Anchor:   after the "<exact heading or bullet>" that currently ends with "<quoted tail>"
Text:     <the exact prose to insert, in the target's voice and line width>
Checks:   <non-protected acceptance-check or evidence IDs governing the patched behavior>
Replaces: <nothing | the exact lines this patch removes, and why>
```

`Checks` is not optional. A router edit can affect every behavior in the file,
so the applying skill reruns all affected deterministic checks; naming the
claims nearest the patch identifies load-bearing wording without touching the
durable evidence record.

## Additive discipline

- **Never rewrite a section the finding did not examine.** The evidence
  licenses exactly the change that would have caught the divergence.
- **Append steps; never renumber earlier ones.** A patch that reorders steps
  invalidates acceptance evidence keyed to a step's content.
- **Strengthen before adding.** If an existing section already gestures at
  the obligation, the patch makes that section state it. Two sections aiming
  at one obligation are weaker than one that says it plainly.
- **Respect the router budget.** New material defaults to a reference. When
  the target's router is already long, the patch must name what it replaces —
  a proposal that only appends to a full router is incomplete.
- **Signpost load-bearing text.** A requirement that must fire every time gets
  a named bullet, a heading, or its own labelled sentence. Buried as one
  clause inside a four-idea paragraph it will surface only sometimes, and the
  next retrospective will find the same divergence again.
- **State the rule and its reason, not a stack of imperatives.** A patch that
  explains why the boundary exists survives paraphrase; a capitalized must
  does not.

## When it is not one skill's patch

**Cross-cutting rule.** When the same missing check would have to sit in two
or more skills, propose one shared reference and the single router line each
affected skill links it with, and list every skill in scope — including the
ones in lanes this item never touched. Filing the same finding separately
against each skill is how the lanes acquire different wording for one rule.

**Gate or validator.** A check that is mechanically decidable from the
repository — a path that must not exist, a field that must be present, a
status drawn from a fixed set — belongs in the collection's validator or a
repository gate, not in prose an agent must remember. Propose it there and
say so; prose that duplicates a gate is dilution. Name the skill that owns
establishing gates and debt ledgers as the receiver, so the hand-off carries a
command rather than a file path.

**Instruction file.** A rule that is specific to one repository rather than
to the skill belongs in that repository's own instruction file. Name the skill
that owns instruction files as the receiver, say which directory owns the rule
— the owning directory, never the root by default — and stop.

**No patch.** A rule that existed, was signposted, and was ignored is
recorded with its evidence and no proposal. So is a divergence whose only
available fix would make the skill worse — say which and why, so the next
retrospective does not re-litigate it.

## Ranking

Order the proposals by how much future divergence each prevents: how many
future items would hit the same gap (a cross-cutting rule outranks a
single-skill bullet), how expensive the divergence was when it happened
(shipped scope outranks a rework loop), and how early in the pipeline the
missing check sits (a precondition outranks a final gate, because it stops
the work instead of catching it afterwards).

## What a patch may never carry

- The name of the audited repository, its pull request, its organization, or
  any person — the patch text ships, and shipped skill content states present
  doctrine without provenance.
- A pointer to another skill collection, project, or plugin as authority.
- A changelog note, a "previously this said" aside, or any record that the
  patch came from a retrospective.
