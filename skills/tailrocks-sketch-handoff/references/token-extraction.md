# Token extraction

A token that lives only in the design file is a token the compiler cannot check
and a reviewer cannot diff. Extract once, commit the result, and regenerate when
the kit or the design changes.

## Two paths

**Through the MCP code tool.** Walk the document object model and emit JSON:
colour variables, layer styles, text styles, and symbol names. This is the
cheapest route and it works on the live document.

**By parsing the file.** A `.sketch` is a ZIP of JSON. Unzip and read the
document file directly. Use this for Apple's kit, for continuous integration, and
whenever the design tool should not need to be running.

One caution on the second path: the published schema packages for the file format
have been **archived since 2023**, so their type definitions are years stale and
do not model glass effects, progressive blur, or newer layout containers. Parse
the JSON directly rather than trusting those types.

There is **no official token-export plugin** worth adopting; the third-party ones
are unmaintained. Writing the walk yourself is a small amount of code and removes
a dependency.

## What to extract

| Source | Produces |
|---|---|
| Colour variables | semantic colours, light and dark paired by name |
| Text styles | typography roles with exact face, weight, and point size |
| Layer styles | state taxonomy — idle, hover, pressed, disabled, over-glass variants |
| Symbols | the vocabulary the design map maps from |
| Frame templates | canonical window sizes |

Apple's kit pairs light and dark by name, so a colour set generator is mechanical
rather than judgemental. Preserve that pairing in the output.

## What to emit

Generate committed Swift definitions. The generated file is checked in, is
reviewable in a diff, and fails the build when a name disappears:

```swift
// Generated from the design document. Do not edit by hand.
// Source: <document>, version <version>, extracted <date>.

extension Color {
    /// System Colors/{Light,Dark}/8 Blue
    static let accentPrimary = Color("AccentPrimary")
}

extension Font {
    /// 06 Body/Emphasized — SF Pro Semibold 13.0
    static let bodyEmphasized = Font.system(size: 13, weight: .semibold)
}
```

Emit the design-file provenance in a comment on every entry. Six months later,
that comment is the only thing that answers "where did this number come from".

## What NOT to emit

- **No material values.** Apple's kit contains no live blur, only static
  approximation recipes. A generated glass constant is a frozen imitation.
- **No corner radii for native components.** Their geometry belongs to the
  system, and it changed in macOS 26 and changes again in 27.
- **No hard-coded copies of system colours.** Use the semantic system colour.
  Extract *custom* colours only.
- **No spacing constant per measurement.** Extract spacing as a small set of
  named roles. A file with forty spacing constants has captured measurements, not
  a system.

That last one is the most common failure of an automated extraction: it faithfully
records every number the designer used, including the accidents, and the accidents
then become law in code.

## Regeneration policy

Regenerate when the kit version changes, when the design's foundations change,
and never as a side effect of an unrelated change. Commit the regeneration
separately so the diff is reviewable.

Record in the generated header: the source document, its version, the kit
version, and the extraction date. A generated file without provenance cannot be
reproduced or trusted.

## Verify the extraction

- Every colour has both a light and a dark value.
- Every custom colour has an increased-contrast variant, or an explicit note that
  the default meets contrast in both appearances.
- Every text style names a role, not a screen — a style called `SettingsHeader`
  will be wrong the moment it is needed elsewhere.
- No extracted name duplicates a system semantic colour.
- The count of extracted spacing roles is small enough to memorize. If it is not,
  the design has spacing accidents that should be fixed in the design.
