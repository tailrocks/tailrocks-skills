# Surface inventory

A surface is any path where a person reaches the work.
Examples: a binary, a subcommand, a window, a screen state, a
route, a service method, a visible effect of a background
job. The inventory is the list of paths that this round
executes. Build it before anything runs, so a surface never
reached stands visible as a gap, not absent from the report.

## Where the rows come from

| Source | Yielded rows |
| --- | --- |
| `plan/spec/` registry (`E#`) | Committed surfaces with tests |
| `## Screens` of the item | Screens, states, references |
| Capabilities and Flows | One row per journey |
| `plan/README.md` | Claimed deliveries |
| `NN-feedback.md` | User-named surfaces |

Each flow is its own row, because a working screen inside a
broken flow is not a working feature.

A surface that the item claims and none of these sources
locates is the first finding of the round. The claim exists
with nothing behind it.

A surface that the user reported and the item never claimed is
also a row. Scope creep and misunderstanding both show here,
and both matter.

Rows use unique stable IDs and exactly one medium: `CLI`,
`APPLICATION`, or `BROWSER`. Service, terminal UI, data, and
background effects select the tool that reaches their shipping
boundary. A service client and a terminal binary are CLI
programs. An owned long-lived process uses an application
harness. A shipped web route uses a browser harness.

## The executed standard, per medium

Executed means the shipping artifact ran and produced
observable output. Not the library that it wraps, not a unit
test of its internals, not the design-time gallery that
renders the same view functions.

- **CLI**: invoke the built binary with the documented
  arguments, capture stdout and stderr separately, record
  the exit status. Run it once through a pipe as well. A
  surface that writes ANSI escapes into a non-terminal, or
  dumps a debug representation where a value belongs, fails
  there and nowhere else.
- **Terminal UI**: drive the shipped binary in a pty at a
  pinned size through the keys that its own footer
  advertises. A golden frame rendered by a gallery crate
  proves the view functions. It never proves that the binary
  reaches that frame, that the advertised key is bound, or
  that the state is ever entered.
- **Web**: serve the built application the way that it ships
  and walk it in a real browser. A design route proves the
  component. The shipped page is the user result, and the two
  diverge exactly when someone reimplements instead of
  importing.
- **Native window**: launch the built app from its bundle,
  capture by window id, drive through the accessibility tree.
  Compare against the blessed reference per region, and read
  the launch log. A warning that fires on every launch is a
  defect that the screenshot never shows.
- **Service**: start the process, call the method over its
  real transport with a real client, assert the response. An
  in-process handler test proves the handler, not the
  wiring.
- **Data and background effects**: open and read the artifact
  that the surface produces: the written file, the inserted
  row, the published projection. A publisher that returns a
  value that nothing ever assigned is invisible from the call
  site and obvious from the artifact.

## First run, cold

Run at least one surface exactly as a new user meets it:
empty configuration, no cache, no prior state. Cold paths
hold serial timeouts, missing migrations, and "needs login"
defaults, and warm runs hide all three. Record the
wall-clock time of the cold run. A surface that takes
eighty-five seconds before its first output holds a defect
even when it eventually succeeds.

## States, not only screens

For every screen or view, the row enumerates the states that
its blessed reference carries. States are default, empty,
loading, error, and every scenario that the reference names.
Each state needs the input that reaches it. A state that
nobody reaches in the running artifact is a finding, not a
skipped row. A blessed matrix of thirty states with fifteen
built is fifteen defects. The fifteen stay invisible to any
check that only compares the states that exist.
