# Rule Writing

What earns a line, where everything else goes, and how the line is phrased.
Sources inspected 2026-08-16.

## The only test that matters

**Would a competent agent, given this repository and no instruction file, get
this wrong?**

Yes → it may earn a line. No → it is noise that costs tokens on every request
and dilutes the rules around it. Reported effects of over-filled instruction
files: agents skipping instructions buried mid-file, and unnecessary
requirements raising reasoning tokens measurably
(<https://www.philschmid.de/writing-good-agents>,
<https://blakecrosley.com/blog/agents-md-patterns>).

Things that reliably fail the test:

| Do not write | Why |
|---|---|
| Architecture overviews, directory listings | The agent reads the tree faster than it reads your description of it |
| Code style a formatter enforces | Deterministic, cheaper, and already runs |
| "Write clean code", "be careful", "follow best practices" | Unfalsifiable; changes nothing |
| Restating the framework's documented behavior | Already known |
| Auto-generated inventories of commands or files | Stale within a week |
| A rule with no observable violation | If you cannot say what breaking it looks like, it is not a rule |

Things that usually pass:

- A command that is not discoverable from `package.json`, `Makefile`, or the
  README, or one whose obvious form is wrong here.
- A convention that contradicts the ecosystem default for this stack.
- A trap: the thing that looks correct, is accepted, and breaks something
  elsewhere.
- A boundary the agent cannot see: what is generated, what is vendored, what is
  load-bearing for a consumer outside the repository.
- A required order of operations that nothing enforces.

## Route it before you write it

An instruction file is the weakest enforcement available — it asks. Prefer any
mechanism that tells.

| The rule is about | Put it in |
|---|---|
| Formatting, naming, import order | Formatter or linter config |
| A value or state that must never occur | A type, a schema, or a validator |
| A sequence that must always run | A script, a task, or a CI gate |
| A path the agent should not read or run | Permission settings |
| A multi-step procedure | A skill, which loads on demand |
| Why the system is shaped this way | A design document |
| What a rule applies to across scattered paths | A path-scoped rule with a glob |

What is left — the non-obvious constraints nothing can enforce — is what the
instruction file is for. When a rule moves to a gate, delete the sentence; a
rule stated twice is a rule that will disagree with itself.

## Phrasing

House style is compressed imperative — the same compression the `caveman` skill
applies to prose, applied to rules. The rules below stand alone, so this works
whether or not that plugin is installed.

- Imperative fragment. One rule per line. No preamble.
- Drop articles, hedging, and filler: "just", "simply", "basically", "make sure
  to", "it is recommended that", "please".
- Never drop `not`, `never`, `no`, `only`, `except` — inverting a rule is worse
  than any token saved.
- Keep verbatim: identifiers, commands, file paths, version numbers, error
  strings, units.
- No invented abbreviations. `cfg`, `impl`, `req` cost the same as the full word
  and read worse.
- Add the mechanism only when the rule reads as arbitrary. A rule that looks
  pointless gets overridden; a rule that is self-evidently a constraint does
  not need a paragraph defending it.
- Say the negative case where it is the actual trap: "never X" beats "prefer Y"
  when X is what an agent would otherwise do.

Before and after:

```text
It is generally recommended that you should make sure to always run the
tests from within the individual package directory rather than from the
repository root, because running them from the root can sometimes cause
the wrong tsconfig to be picked up.

Run tests from the package directory. Root run picks the wrong tsconfig.
```

```text
Please try to be careful when editing files in the generated folder.

Never edit src/generated/. Edit schema.graphql, then run `mise run codegen`.
```

```text
We use Bun as our package manager for this project and you should use it.

Bun only. Never npm, pnpm, yarn.
```

## Deleting

An instruction file that only grows is failing. Every `add` looks for a
removal; every `audit` proposes them. Delete on this evidence:

- **Now enforced.** A gate, type, or lint rule covers it. Cite the gate.
- **Dead subject.** The file, command, or directory it names no longer exists.
- **Model-limitation workaround.** Written to steer around behavior a current
  model no longer exhibits; official guidance is to revisit these after major
  model releases (<https://code.claude.com/docs/en/large-codebases>).
- **Duplicated upward.** An ancestor already says it.
- **Never observed.** No one can name a time an agent violated it, and the
  violation would be visible if it happened.

Deletion needs the same evidence as writing. "Looks unnecessary" is not
evidence; naming the gate that rejects the violation, with its file and line,
is.

## Capturing a rule from a session

The moment worth writing down is when an agent did something wrong that a
sentence would have prevented. Capture it then, while the failure is concrete,
and write the rule against the observed failure rather than the general lesson.

State what to do, not what happened: the rule is "run migrations before seeding",
not "the agent forgot to run migrations". Then ask step 4 whether the ordering
should be a script instead — a rule born from a real failure is often a missing
gate.
