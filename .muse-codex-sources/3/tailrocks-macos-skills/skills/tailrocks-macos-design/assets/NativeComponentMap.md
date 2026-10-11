# Native Component Map — <feature>

Every visible region carries exactly one classification.

- `NATIVE` — standard component, semantic configuration only. The design never
  specifies internal appearance.
- `NATIVE-COMPOSED` — product-specific arrangement of standard components.
- `CUSTOM` — requires a completed custom component contract.

## Map

| Region | Class | Component / API | Placement | Allowed customization | Forbidden customization |
|---|---|---|---|---|---|
| Example native region | NATIVE | | | semantic configuration only — no internal appearance values | |

## NATIVE regions — detail

For each, record only semantics.

```
Region:
Component:
Placement:
Symbol:
Label:
States:      default, hover, pressed, disabled, keyboard-focused, inactive window
Material:    system-provided; no custom appearance
Keyboard:
Menu command:
Accessibility role:
Resize behavior:
```

## NATIVE-COMPOSED regions — detail

```
Region:
Composition:
Hierarchy and proportion:
Spacing roles between components:
Containers deliberately NOT added:
```

## CUSTOM regions — detail

```
Region:
Component name:
Native alternatives evaluated, and why each was insufficient:
Contract location:
```

## Decision order evidence

For every `CUSTOM` and every custom bar, record why each earlier step failed.

| Region | 1 standard | 2 background removed | 3 composition | 4 system extension point | 5 custom |
|---|---|---|---|---|---|
| | insufficient because… | | | | chosen |
