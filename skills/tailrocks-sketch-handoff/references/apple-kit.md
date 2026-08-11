# Apple's macOS UI kit

Start from Apple's kit. Redrawing native controls by hand guarantees drift from
the real ones and teaches the implementing agent to reconstruct rectangles.

Source: `developer.apple.com/design/resources`.

## State as verified 2026-08-11

- Apple offers the macOS UI kit in **both** Sketch and Figma formats. Sketch is
  the only format Apple offers on **every** platform.
- The current macOS kit is **macOS 27**. The macOS 26 / "Tahoe" kit is **no
  longer listed** — Apple replaced it rather than adding alongside. Design
  against the current kit while shipping against your actual deployment target,
  and treat any 27-only component as forward-validation material.
- The June 2026 kit update added: Liquid Glass updates, expanded component and
  state support, **naming changes to better align with code**, improved resizing,
  and **dark mode for macOS**.

The naming-to-match-code change is directly useful: symbol names that echo API
names make the design map shorter and less error-prone.

Re-verify the page before relying on any of this. Apple has replaced rather than
appended before.

## What is actually inside the file

A `.sketch` file is a ZIP of JSON — a document file, a metadata file, and one
file per page. It parses offline with no API and no license.

Apple's macOS 27 kit, measured directly:

| | |
|---|---|
| Pages | 37 |
| Frames | 4,688 |
| Symbols | 4,679 |
| Colour variables | 110 |
| Layer styles | 285 |
| Text styles | 67 |
| Colour space | sRGB |

Real values come out cleanly and are directly usable:

```
System Colors/Light/8 Blue    #0088FF     01 LargeTitle/Emphasized  SFPro-Bold 26.0pt
System Colors/Dark/8 Blue     #0091FF     06 Body/Emphasized        SFPro-Semibold 13.0pt
System Colors/Light/11 Pink   #FF2D55     10 Caption1/Default       SFPro-Regular 10.0pt
```

Light and dark are **paired by name** (`System Colors/Light/*` versus
`System Colors/Dark/*`), which makes generating a colour set mechanical rather
than judgemental.

Of the 285 layer styles, 98 are named under the `Over-Glass/` hierarchy with a
full state taxonomy — idle, clicked, disabled, and so on. That taxonomy is worth
mirroring in the design map, because it is the vocabulary Apple's own components
use.

## The finding that changes how you use the kit

There is a **Materials** page with artboards for Liquid Glass over light and over
dark backgrounds, and the recipes are fully machine-readable:

```
Large UI   → fill #FFFFFF@0.70 blend=4 ; fill #BFBFBF@0.10 blend=1 ;
             shadow blur=48 y=18 #000000@0.25 ; shadow blur=8 y=-4 #272727
Tint Color → fill #FFFFFF@0.96 blend=0 ; fill #0088FF@1.00 blend=16
```

**Zero layer styles and zero layers on that page have a blur effect enabled.**

Apple's kit represents Liquid Glass as *static fill, blend-mode, and shadow
recipes* — not as live glass. This is a property of the kit itself, not of the
tool it is opened in.

Two consequences, and they are the most important lines in this skill:

1. **Never have an agent reimplement Liquid Glass from the kit.** Those recipes
   are a drawing approximation for a static canvas. Reproducing them in code
   produces a frozen imitation that stops adapting to content, appearance, and
   accessibility settings.
2. **Use the kit as authoritative for tokens, metrics, states, and layout only.**
   For material, the instruction to the implementing agent is to call the system
   API and let the operating system render it.

## Public token export

Apple set **public token export to disabled** on its kit share, while leaving
public inspection enabled. So the built-in token-export endpoint is unavailable
for Apple's kit specifically; extract tokens yourself from the file or through
the MCP code tool.

## Grounding an agent in the kit

- Link the kit as a library in the working document so components carry their
  Apple names.
- Compose screens from kit symbols. Detaching a symbol to restyle it is the
  moment the design stops being native — treat a detached system symbol as a
  finding in an audit.
- When something genuinely cannot be expressed by a kit symbol, that is a
  `CUSTOM` classification and it needs a contract, not a detached copy.

## Icons

The application icon does not go through this pipeline at all. Author it in Icon
Composer — layered artwork exported as a single icon file covering the macOS
appearance set — and add that file to the project directly. It is not an asset
catalogue entry.

Let the system handle blurring and other visual effects: no baked specular
highlights, drop shadows, bevels, blurs, or glows.
