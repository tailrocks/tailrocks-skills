# Plan 011: Make sketch-handoff's examples obey its own rules and its extraction path safe

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `advisor-plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 64df333..HEAD -- skills/tailrocks-sketch-handoff`
> On drift, compare excerpts; meaning-level mismatch = STOP. Plan 008 edits
> this skill's SKILL.md (package naming) — those diffs are expected, adapt
> around them.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 004 (eval rerun); ordering with 008 flexible (different lines)
- **Category**: bug
- **Planned at**: commit `64df333`, 2026-08-11

## Why this matters

The one code sample agents copy from the token-extraction reference is a duplicated system color — the exact thing the same file's rule and checklist forbid twenty lines later; copying it freezes `systemBlue` into an asset that stops tracking accent, appearance, and increased-contrast variants. The design-map template's own seed rows fail the template's stated minimum, and its audit row cannot detect the shortfall, so under-specified forbidden columns propagate into real handoffs. The default extraction path runs agent-authored code with write access to the user's live, possibly-unsaved design document, protected by policy prose only. Two required package artifacts have no producer, and the MCP wiring page is undated next to a dated sibling.

## Current state

Paths relative to `skills/tailrocks-sketch-handoff/`. Verified at `64df333`.

**(a) The emit sample violates the no-system-colors rule.**

`references/token-extraction.md:48-51`:
```swift
extension Color {
    /// System Colors/{Light,Dark}/8 Blue
    static let accentPrimary = Color("AccentPrimary")
}
```
vs `:68-69`: "**No hard-coded copies of system colours.** Use the semantic system colour. Extract *custom* colours only." and `:95`: "No extracted name duplicates a system semantic colour."

**(b) Seed rows under-fill the forbidden column.**

`templates/DESIGN_MAP.md:16-18`:
```
| `Native/Search` | NATIVE | `.searchable(text:)` | placeholder, scopes | field background |
| `Native/Inspector/<name>` | NATIVE | `.inspector(isPresented:)` | width range, content | material, radius |
| `Native/Table/<name>` | NATIVE | `Table` | columns, sorting | row background, glass |
```
vs `:22-23`: "Every `NATIVE` row's forbidden column includes at minimum: background, material, blur, opacity, stroke, shadow, corner radius." Audit row `:50` asks only "No row missing its forbidden column" — all three rows pass it. `references/design-map.md:16-24` example has the same shortfall.

**(c) `run_code` is the default extraction path.** `references/sketch-mcp.md:56-60`: `run_code` "executes arbitrary Sketch API code in the document" and "can modify the document"; `:71-74` states the no-side-effect policy with no mechanism; `references/token-extraction.md:9-11` and `SKILL.md:75-76` name it the primary route ("cheapest … works on the live document"). Sketch documents are binary-ish ZIPs — damage is unreviewable unless the file was committed first.

**(d) Producer gaps.** `references/handoff-package.md:19-20` requires `SymbolMap.csv` and `Tokens/`; the extraction table (`token-extraction.md:26-35`) has no symbols row and nothing produces the CSV (shown only at `design-map.md:74-81`); the generated Swift "fails the build when a name disappears" (`token-extraction.md:41-42`) yet the tree files it under documentation-only `Design/Tokens/` — compiled by nothing, so the guarantee is void. (Plan 008 renames the state/acceptance artifacts in the same package list — different lines.)

**(e) Undated wiring claims.** `references/sketch-mcp.md:12-21,44`: "Sketch **2025.2.4** or later", port `31126`, "Eight, as documented at the time of writing" — no verification date, while the sibling `references/apple-kit.md:8` heads its claims "State as verified 2026-08-11". `:31-36` TOML example names no agent/transport; `:38-41` admits "the tool names have changed across releases".

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `mise run validate` | `Validated 21 skills.` exit 0 |
| Eval rerun | `bun scripts/run-evals.ts --skill tailrocks-sketch-handoff --case <id> --runs 2` | exit 0 |

## Scope

**In scope**: `references/{token-extraction,design-map,handoff-package,sketch-mcp}.md`, `templates/DESIGN_MAP.md`, `SKILL.md:75-76` (extraction-path sentence only), `evals/evals.json` (rerun; case additions came from 004).

**Out of scope**: `SKILL.md` package list and artifact naming (plan 008), `templates/DesignSource.md`, `references/apple-kit.md`, other skills.

## Git workflow

- Branch: `advisor/011-sketch-handoff-fixes`; `git commit -s`; `fix(sketch-handoff): …`; PR via `gh pr create`.

## Steps

### Step 1: Replace the emit sample with a product-owned color

In `token-extraction.md:44-57`: change the color example to a genuinely custom color with provenance outside `System Colors/` (e.g. `/// Product/Status/Recording Red` → `static let statusRecording = Color("StatusRecording")`), and add one contrast line: "For anything under `System Colors/`, emit nothing — use `Color.accentColor` / `NSColor.controlAccentColor` and the semantic palette." Keep the Font example.

**Verify**: `grep -n "System Colors" skills/tailrocks-sketch-handoff/references/token-extraction.md` → only in the *don't* sentence, not in a code block.

### Step 2: Make the seed rows and the audit satisfy the seven-item minimum

In `templates/DESIGN_MAP.md:14-18` and `references/design-map.md:16-24`: expand every NATIVE row's forbidden cell to the full seven items plus row-specific extras (e.g. Search adds "field background"; Table adds "row background, glass"). Change audit row `:50` to "Every NATIVE row's forbidden column contains all seven minimum items" so it is mechanically checkable.

**Verify**: for each NATIVE row in both files, the forbidden cell contains all of: background, material, blur, opacity, stroke, shadow, corner radius (`grep`-check per row or eyeball the two small tables); audit row wording updated.

### Step 3: Demote `run_code` behind an explicit gate

1. `references/token-extraction.md:9-11` and `SKILL.md:75-76`: make `get_design_assets` + offline parsing of an exported/committed copy the default extraction path; `run_code` becomes the explicit fallback.
2. `references/sketch-mcp.md:56-74`: add the preconditions inline where `run_code` is described: document committed or duplicated first; emitted code reviewed before it runs; read-only walks only — any write is a separate, deliberate act per `:71-74`.

**Verify**: `grep -n "cheapest" skills/tailrocks-sketch-handoff/references/token-extraction.md` → the sentence no longer positions run_code as the default; `grep -n "committed or duplicated" skills/tailrocks-sketch-handoff/references/sketch-mcp.md` → 1 match.

### Step 4: Give the two orphan artifacts producers

1. `token-extraction.md`: add a "Symbol map" subsection — SF Symbol names are a hand-authored design decision, not extractable; the map is written during design-map assembly and reviewed against the HIG symbol catalog; output shape per `design-map.md:74-81`.
2. `references/handoff-package.md:19-20`: re-home `Tokens/` — generated Swift lives in the app target (e.g. `Sources/DesignTokens/`), and `Design/Tokens/` in the package holds a *pointer* to that path plus the generation provenance; state in one sentence that this is what makes the fails-the-build guarantee real.

**Verify**: `grep -n "Symbol map" skills/tailrocks-sketch-handoff/references/token-extraction.md` → heading exists; `grep -n "Sources/" skills/tailrocks-sketch-handoff/references/handoff-package.md` → ≥1.

### Step 5: Date the MCP claims

Add "State as verified <today's date> — re-verify before wiring" as a heading line to `sketch-mcp.md` (matching `apple-kit.md:8`'s convention); mark the version, port, and tool table verify-before-use; either complete the TOML example for a named agent (Codex's `mcp_servers` shape, with the transport key it actually requires — check the live Codex docs at execution time) or delete it in favor of the `claude mcp add` form already shown. If you can reach a live Sketch install or current Sketch MCP docs, update the version/port/tool-count facts and stamp today; if not, stamp the heading "as of 2026-08-11 (unrecheckable in this run)".

**Verify**: `grep -n "State as verified" skills/tailrocks-sketch-handoff/references/sketch-mcp.md` → 1 match.

### Step 6: Rerun evals

Full sketch-handoff suite ×2 (incl. 004's `audit`-mode case, whose fixture seeds exactly the step-2 defect class).

## Test plan

- Eval rerun; the 004 audit-mode case is the detection test for step 2's material.
- `mise run validate` guards link integrity for the edited references.

## Done criteria

- [ ] `mise run validate` exits 0
- [ ] Emit sample is product-owned; system-color guidance states the semantic alternative
- [ ] All NATIVE seed rows in both files carry the seven-item minimum; audit row checks for it
- [ ] `run_code` is fallback-only with inline preconditions
- [ ] Symbol map has a producer; `Tokens/` lives in a compile target with a package pointer
- [ ] sketch-mcp.md carries a verification date
- [ ] Eval suite green ×2; only in-scope files modified; index row updated

## STOP conditions

- Excerpt mismatch vs live files (beyond plan 008's known edits).
- Live Sketch MCP docs contradict the *structure* of the wiring section (tools renamed/removed) — a date stamp is not enough; report for a rewrite decision.
- The `Tokens/` re-home conflicts with how `tailrocks-swift-project-setup`'s synced-folder layout treats generated files (plan 009 step 3.5) — coordinate; if unresolvable in prose, STOP.

## Maintenance notes

- The dated stamp added in step 5 joins the family's staleness surface — plan 013's gate should age-check this file with the others.
- Reviewer scrutiny: step 2's expansion must not silently *loosen* any row (the added items are additions; the row-specific extras must survive).
