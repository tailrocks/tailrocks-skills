# Design Map

Symbol path → implementation. This file replaces a formal design-to-code binding.
Every symbol used in an approved frame has a row before the frame is approved.

Design source:
Kit version:
Last reconciled:

## Map

| Symbol path | Class | Implementation | Allowed customization | Forbidden |
|---|---|---|---|---|
| `Native/Sidebar/<name>` | NATIVE | `NavigationSplitView` sidebar | row content, symbols | background, material, blur, opacity, stroke, shadow, corner radius |
| `Native/Toolbar/<name>` | NATIVE | `ToolbarItem(placement:)` | symbol, label, shortcut | background, material, blur, opacity, stroke, shadow, corner radius, bezel |
| `Native/Search` | NATIVE | `.searchable(text:)` | placeholder, scopes | background, material, blur, opacity, stroke, shadow, corner radius, field background |
| `Native/Inspector/<name>` | NATIVE | `.inspector(isPresented:)` | width range, content | background, material, blur, opacity, stroke, shadow, corner radius |
| `Native/Table/<name>` | NATIVE | `Table` | columns, sorting | background, material, blur, opacity, stroke, shadow, corner radius, row background, glass |
| `Composed/<name>` | NATIVE-COMPOSED | <composition> | proportion, spacing roles | added cards or containers |
| `Product/<name>` | CUSTOM | `<TypeName>` | per contract | outside contract |

Every `NATIVE` row's forbidden column includes at minimum: background, material,
blur, opacity, stroke, shadow, corner radius. Those belong to the system.

## Variants

```
Symbol:   Product/<name>
Variants: <Property> = <Case> | <Case> | <Case>

Swift:    <TypeName>(<property>: .<case>)
```

Variant names and enumeration case names must match exactly. Every divergence is
a translation an agent has to guess.

## Custom components

| Symbol path | Contract |
|---|---|
| `Product/<name>` | `Design/CustomComponents/<name>.md` |

## Audit

| Check | Status |
|---|---|
| Every symbol in an approved frame has a row | |
| Every CUSTOM row points at an existing contract | |
| No detached instances of kit symbols | |
| Every NATIVE row's forbidden column contains all seven minimum items | |
| Variant names match enumeration case names | |
| Reconciled against the current kit version | |

Detached instances of kit symbols are findings. Either re-attach, or reclassify
as CUSTOM with a contract.
