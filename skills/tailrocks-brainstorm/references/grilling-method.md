# Grilling Method — Shaping Stage

How `tailrocks-brainstorm` runs its interview. The stage matters: this is the
expansion pass, where the item is young and the goal is a clear shape, not a
closed spec. `tailrocks-grill-roadmap` owns the closing pass.

## The decision tree

Model the item as a tree of decisions, not a list of topics. A **decision** is
any point where two defensible options exist and choosing changes what gets
built. Decisions depend on each other: "what does the settings screen show?"
is unanswerable before "is configuration in-app at all?". Resolve parents
before children.

Seed the roots from the item itself: empty sections, one-line sections that
carry a paragraph of implications, vague statements ("fast", "simple",
"native"), contradictions between sections, and the existing Open questions
list. At shaping stage, prefer breadth: visit every root before drilling any
branch deep — a wrong early narrowing costs more than a shallow pass.

The **frontier** is every unresolved decision whose prerequisites are
settled. Only frontier questions are askable; a question that depends on an
open question is noise.

## Fact or decision — the routing rule

- **Fact** — the answer exists in the environment: the repository, its docs,
  a referenced project's source, official platform docs. Look it up, cite it
  (URL, `file:line`, or method), let it power a recommendation. Asking the
  user a lookupable fact wastes the interview.
- **Decision** — the answer exists only in the user's head: scope, taste,
  priorities, what "done" means. Put it to them and wait.

Borderline test: if two competent engineers could defensibly pick
differently, it is a decision; if they would converge after reading the same
source, it is a fact. When a fact lookup is slow, do not block the interview
on it — ask the frontier questions that do not depend on it and fold the
result in when it lands.

## Question craft

- **One at a time.** Ask, wait, then continue. Multiple simultaneous
  questions are bewildering and produce half-answers.
- **Recommend in every question.** One or two sentences: the answer you
  would pick and why, grounded in looked-up facts. A rejected recommendation
  is itself information about the user's intent.
- **Concrete over abstract.** "The CLI is mid-run and the desktop app
  closes — what happens to the session?" beats "how should lifecycle be
  handled?".
- **Sharpen fuzzy terms on contact.** Two possible referents means the user
  picks one; the winner goes to Vocabulary immediately with its `_Avoid_`
  synonyms.
- **Confront contradictions plainly** — between answers, or between an
  answer and a looked-up fact — and ask which holds.
- **Write as you go.** Every resolved answer lands in its item section the
  moment it resolves: choices to Decisions (dated, with the reason), scope
  to Capabilities/Must not, screen answers into Screens. The item is always
  current; an interrupted session loses questions, never answers.

## `--batch` mode

Present the entire current frontier as one numbered list, each question with
its recommended answer; wait; recompute the frontier from the answers; next
round. A question depending on another question still open in the same round
belongs to a later round. Everything else is unchanged.

## Stopping

1. **Frontier empties** — every branch visited at shaping depth. Say what
   got settled and steer toward the next skill. Do not push into
   finalization territory (pixel-level screen detail, exhaustive edge
   cases) — that is `tailrocks-grill-roadmap`'s job, and duplicating it
   here exhausts the user before the pass that needs them.
2. **User steers out** ("wrap up", "enough"). Honor immediately: every
   still-open decision goes to Open questions with your recommendation
   attached, stated plainly in the close-out. Never silently assume.

No question cap. Redundancy, not count, is the failure to police: re-read
the item and the session before asking — asking what is already settled is
what makes grilling feel like interrogation.

## Failure modes

- **Asking facts** the manifest, README, or referenced repo answers.
- **Answering your own questions** — the session's value is that decisions
  are the user's.
- **Batching by stealth** — three questions in one message. One, or a
  `--batch` round; nothing between.
- **Chasing branches mid-question** — new branches join the tree; the
  current branch finishes first.
- **Premature depth** — drilling one screen's states while three sections
  sit empty. Breadth first at this stage.
- **Chat-only answers** — an answer that never reached the item file does
  not exist.

Credit: the interview mechanics descend from Matt Pocock's `grilling` /
`grill-me` skills and the `batch-grill-me` frontier variant (decision tree,
one-question rule, recommended answers, fact/decision split, non-blocking
fact lookups, no question cap), retargeted to shape Tailrocks roadmap items.
