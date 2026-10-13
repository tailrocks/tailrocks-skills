# Instruction policy

One repository keeps one instruction policy. These rules govern all
three instruction skills. Each skill links this file. Update all
copies together.

## One rule in one place

Each rule lives in exactly one instruction file. The owner is the
deepest directory whose entire subtree obeys the rule. Prove root
ownership. Never assume it. Never move a rule upward only because
an ancestor already has an instruction file. Never repeat an
ancestor rule in a descendant file. A descendant states an override
only when its scope genuinely differs. The override names the
ancestor contract.

## One file per directory

Each owning directory keeps one regular `AGENTS.md` file. A client
entry beside it is a relative symlink to the bare `AGENTS.md`
filename in the same directory, or a regular file with identical
bytes. Never assume that every agent loader follows symlinks.
Verify each declared client loader before you create or repair a
link. When a loader cannot resolve a symlink, use a regular file.
Record the exception. Report divergent bytes between a client
file and its `AGENTS.md` file as a defect.

## Load chain

The effective instructions for one path are the ancestor chain
from the root to the deepest owning directory. Measure file bytes
and chain bytes. Never estimate them. Root overbreadth and large
files are review triggers, not automatic defects.

## Skill boundary

`tailrocks-agents-md` adds one rule.
`tailrocks-agents-md-audit` examines instructions and proposes
repairs. `tailrocks-agents-md-sync` applies one approved repair.
Audit findings authorize no mutation. Sync invents no rule and no
approval.
