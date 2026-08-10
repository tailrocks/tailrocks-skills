# The Sketch MCP server

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

For an agent configured through a TOML file:

```toml
[mcp_servers.sketch]
url = "http://localhost:31126/mcp"
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

## Official Sketch agent skills

Sketch publishes a skills catalogue containing a design-to-code skill and a
design-from-reference skill. Use them for the mechanics of reading a document and
producing implementation context.

Two cautions before adopting them wholesale:

- At the time of writing the catalogue ships **no license file**. Install and use
  it; do not vendor its content into your own repository.
- They own *mechanics*. Design quality, Apple-platform correctness, and material
  policy stay with the project's own skills. Do not let a generic design-to-code
  skill become the authority on which native component to use — that is what
  produces rectangles-into-Swift output.

## What this does not give you

There is no formal binding from a Sketch symbol to a Swift type. That binding is
what a design map replaces, by hand, in one committed file.

Accept that trade deliberately: in exchange you get a local-only workflow, no
plan gating, no rate limits, a native Mac editor, a document you can parse
offline, and a design tool with a first-class glass primitive tuned to Apple's
own operating systems.
