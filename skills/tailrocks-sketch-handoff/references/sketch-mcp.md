# The Sketch MCP server

State as verified 2026-08-11 (unrecheckable in this run) — re-verify the Sketch
version, port, and tool table before wiring.

Sketch ships a **first-party** MCP server inside the Mac application. This is the
single strongest argument for Sketch in an agent-driven workflow, and it is easy
to miss because the server is absent from the public MCP registries and the
community "Sketch MCP" repositories are decoys — at least one is archived and
points users at the official one.

## Requirements

- Sketch **2025.2.4 or later**.
- The build downloaded from Sketch's own site. **Not the Mac App Store build.**
- The server is **disabled by default** and must be started.
- macOS Local Network permission.
- The document must be open in Sketch.

Start it from the command palette or from Sketch's general settings. The endpoint
is local only and not remotely reachable:

```
http://localhost:31126/mcp
```

## Connect

```sh
claude mcp add --transport http sketch http://localhost:31126/mcp
claude mcp get sketch
```

Sketch's own documentation lists support for the major coding agents. Verify the
current tool set against that documentation rather than this file — the tool
names have changed across releases.

## Tools

Eight, as documented at the time of writing:

| Tool | What it gives an agent |
|---|---|
| `get_document_info` | document-level metadata |
| `get_layer_tree_summary` | layer type, identifier, position, dimensions, stack layout settings, inline text contents, override counts — structure, not a picture |
| `get_design_assets` | symbols, text styles, layer styles, colour swatches, frame templates, graphic templates — the token surface |
| `get_symbol_overrides` | per-instance overrides |
| `get_libraries` | linked libraries, including Apple's kit |
| `get_screenshot` | a rendered image of a frame |
| `get_guide` | the server's own usage guidance |
| `run_code` | executes arbitrary Sketch API code in the document |

`run_code` is the reason this integration is more capable than a read-only design
API: anything a plugin can do, an agent can do. It is also the reason to be
deliberate about what an agent is allowed to run — it can modify the document.
Use it only after the document is committed or duplicated, the emitted code is
reviewed before execution, and the walk is read-only. Any write is a separate,
deliberate act.

## Working practice

- **Scope every read.** Pull design context per region, not one enormous frame.
  A whole-file read produces context an agent cannot use and hides the structure
  it needs.
- **Pair every screenshot light and dark.** Apple's June 2026 kit update added
  dark mode for macOS specifically; a light-only review misses half the states.
- **Screenshot at 2x**, scoped per frame.
- **Read structure before pixels.** The layer tree summary tells the agent what a
  region *is*; the screenshot only tells it what a region looks like. An agent
  given only the picture reconstructs rectangles.
- **Do not let the agent modify the design as a side effect of implementation.**
  Design edits are a separate, deliberate act with the same review as any other
  change.

## Keep design authority project-local

Vendor-published design-to-code guidance exists for this tool, but this
collection does not adopt or reference external skills — the document-reading
mechanics an agent needs are fully covered by the MCP tools above, and the
extraction workflow in this skill family is the distilled, Apple-verified
version of that knowledge.

The division of authority that matters: tooling mechanics come from the MCP
server; design quality, Apple-platform correctness, and material policy come
from the project's own skills. A generic design-to-code workflow left in
charge of component choice produces rectangles-into-Swift output — the design
map, not the tool, decides which native component a region becomes.

## What this does not give you

There is no formal binding from a Sketch symbol to a Swift type. That binding is
what a design map replaces, by hand, in one committed file.

Accept that trade deliberately: in exchange you get a local-only workflow, no
plan gating, no rate limits, a native Mac editor, a document you can parse
offline, and a design tool with a first-class glass primitive tuned to Apple's
own operating systems.
