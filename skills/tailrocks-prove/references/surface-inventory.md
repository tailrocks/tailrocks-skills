# Surface inventory

A surface is any way a person reaches the work: a binary, a subcommand, a
window, a screen state, a route, a service method, a background job's visible
effect. The inventory is the list of things this round must execute — built
before anything runs, so a surface that is never reached is visible as a gap
rather than absent from the report.

## Where the rows come from

| Source | What it yields |
|---|---|
| `plan/spec/` entry-point registry (`E#`) | The surfaces planning committed to, with the test that was supposed to run each |
| The item's `## Screens` | Screens and their states, and the blessed design reference each cites |
| The item's `## Capabilities` and `## Flows` | Journeys that cross surfaces — each flow is its own row, because a working screen inside a broken flow is not a working feature |
| `plan/README.md` manifest | What execution claims it delivered |
| `verification/NN-feedback.md` | Every surface the user named, whether or not the item lists it |

A surface the item claims and none of these can locate is the first finding of
the round: the claim exists with nothing behind it.

A surface the user reported and the item never claimed is also a row. Scope
creep and misunderstanding both show up here, and both matter.

Rows use unique stable IDs and exactly one capability: `CLI`, `APPLICATION`,
or `BROWSER`. Service, terminal UI, data, and background effects select the
driver that reaches their shipping boundary: a service client and terminal
binary are CLI programs; an owned long-lived process uses an application
adapter; a shipped web route uses a browser adapter. Assembly rejects any row
without exactly one receipt or with receipts from multiple drivers.

## What counts as executed, per medium

Executed means the shipping artifact ran and produced observable output. Not
the library it wraps, not a unit test of its internals, not the design-time
gallery that renders the same view functions.

- **CLI** — the built binary invoked with the documented arguments, stdout
  and stderr captured separately, exit status recorded. Run it once through a
  pipe as well: a surface that writes ANSI escapes into a non-terminal, or
  dumps a debug representation where a value belongs, fails there and nowhere
  else.
- **Terminal UI** — the shipped binary in a pty at a pinned size, driven
  through the keys its own footer advertises. A golden frame rendered by a
  gallery crate proves the view functions; it does not prove the binary
  reaches that frame, that the advertised key is bound, or that the state is
  ever entered.
- **Web** — the built application served the way it ships, walked in a real
  browser. A design route proves the component; the shipped page is what a
  user gets, and the two diverge exactly when someone reimplements instead of
  importing.
- **Native window** — the built app launched from its bundle, captured by
  window id, driven through the accessibility tree. Compare against the
  blessed reference per region, and read the launch log: a warning that fires
  on every launch is a defect the screenshot cannot show.
- **Service** — the process started, the method called over its real
  transport with a real client, the response asserted. An in-process handler
  test proves the handler, not the wiring.
- **Data and background effects** — the artifact the surface is supposed to
  produce, opened and read: the file written, the row inserted, the projection
  published. A publisher that returns a value nothing ever assigned is
  invisible from the call site and obvious from the artifact.

## First run, cold

Run at least one surface exactly as a new user meets it: empty configuration,
no cache, no prior state. Cold paths are where serial timeouts, missing
migrations, and "needs login" defaults live, and warm runs hide all three.
Record the wall-clock time of the cold run — a surface that takes eighty-five
seconds before its first output has a defect even when it eventually succeeds.

## States, not just screens

For every screen or view, the row enumerates the states its blessed reference
carries — default, empty, loading, error, and every scenario the reference
names. Each state needs the input that reaches it. A state nobody can reach in
the running artifact is a finding, not a row to skip: a blessed matrix of
thirty states with fifteen built is fifteen defects, and the fifteen are
invisible to any check that only compares the states that do exist.
