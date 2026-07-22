# Grilling Method

How the `tailrocks-grill` skill runs the interview: the decision tree, the
frontier, the fact/decision split, question craft, batch mode, and the failure
modes that break grilling sessions.

## The decision tree

Model the idea as a tree of decisions, not a list of topics. A **decision** is
any point where two defensible options exist and choosing changes what gets
built. Decisions have dependencies: "what does the sidebar show?" is
unanswerable before "is there a sidebar?". Resolve parents before children.

Seed the root branches from the concept template's sections — intent,
capabilities, screens, flows, data and integrations, constraints, must-nots,
quality bar — then prune branches the idea genuinely does not have, and grow
branches the template never predicted. The template seeds the tree; the tree is
not limited to it.

The **frontier** is every unresolved decision whose prerequisites are already
settled. Only frontier questions are askable; a question whose answer depends
on another open question is premature and reads as noise.

## Fact or decision — the routing rule

Before any question, route it:

- **Fact** — the answer exists in the environment: the repository, its
  documentation, a reference project's source, a platform's official docs.
  Look it up. It enters the concept document as sourced context (URL,
  `file:line`, or method), and may power a recommended answer. Asking the user
  a lookupable fact wastes the interview and teaches them to skim.
- **Decision** — the answer exists only in the user's head: scope, taste,
  priorities, tradeoffs, what "done" means to them. Put it to the user and
  wait. Deciding it for them is how unpredictable code happens.

Borderline test: if two competent engineers could defensibly pick differently,
it is a decision. If they would converge after reading the same source, it is a
fact.

## Question craft

- **One at a time.** Ask, then wait. Multiple simultaneous questions are
  bewildering and produce half-answers.
- **Recommend in every question.** Offer the answer you would pick and why, in
  one or two sentences, grounded in the looked-up facts. The user reacting to a
  concrete proposal is faster and more precise than the user facing a blank
  prompt — and a rejected recommendation is itself information.
- **Concrete over abstract.** "A session crashes mid-run — what does the list
  show?" beats "how should errors be handled?". Invent scenarios that force
  precision at the boundaries.
- **Sharpen fuzzy terms on contact.** When the user says "account", "session",
  or any word with two possible referents, make them pick one meaning and
  record it in the document's vocabulary — the moment it resolves, not later.
- **Confront contradictions.** When an answer conflicts with an earlier answer
  or with a looked-up fact, say so plainly and ask which one holds.
- **Write as you go.** Each resolved decision lands in the concept document
  immediately. The document is always current; ending the session early loses
  questions, never answers.

## `--batch` mode

For users who prefer rounds over ping-pong: present the entire current frontier
as one numbered list, each question with its recommended answer, then wait.
Recompute the frontier from the answers and present the next round. A question
whose answer depends on another question still open in the same round belongs
to a later round. Everything else about the method is unchanged.

## Stopping

There are exactly two ways the interview ends:

1. **The frontier empties.** Every branch visited; nothing material left
   silently assumed. Proceed to leftover classification and the gate.
2. **The user steers out** ("wrap up", "enough"). Honor it immediately: record
   every still-open decision in the document as explicitly open, with your
   recommendation attached, and say plainly what was not settled. A steered
   wrap-up never silently assumes.

There is no question cap. Three questions can suffice; fifty can be right.
The counter is not the instrument — redundancy is what to police.

## Failure modes

- **Redundant questions** — asking what the idea's text or an earlier answer
  already settled. This, not question count, is what makes grilling feel like
  an interrogation. Re-read before asking.
- **Asking facts** — "does your repo use Axum?" when the manifest is right
  there. Look it up.
- **Answering your own questions** — resolving a decision and moving on
  without the user. The session's entire value is that decisions are theirs.
- **Batching by stealth** — three questions in one message "to save time".
  One, or a `--batch` frontier round. Nothing between.
- **Chasing branches mid-question** — an interesting answer spawns follow-ups;
  add them to the tree and finish the current branch in dependency order.
- **Polishing instead of resolving** — wordsmithing the document while
  frontier decisions sit open. Resolution first; prose second.

Credit: the interview mechanics descend from Matt Pocock's `grilling` /
`grill-me` skills (decision tree, one-question rule, recommended answers,
fact/decision split, no question cap) and their `batch-grill-me` frontier
variant, retargeted here to produce the `tailrocks-blueprint` concept document.
