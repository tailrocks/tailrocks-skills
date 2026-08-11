# The design map

A formal binding from a design component to a source component does not exist for
this toolchain. The design map replaces it by hand. It is one committed file, and
it is what converts "here is a picture, build it" into a deterministic
instruction.

Without it, an agent handed a frame reconstructs rectangles: it sees a rounded
translucent shape and writes a rounded translucent shape, instead of seeing a
toolbar item and writing a toolbar item.

## Shape

One row per symbol path used in an approved frame.

| Symbol path | Class | Implementation | Allowed customization | Forbidden |
|---|---|---|---|---|
| `Native/Sidebar/Workspace` | NATIVE | `NavigationSplitView` sidebar | row content, symbols | background, material, blur, opacity, stroke, shadow, corner radius |
| `Native/Toolbar/PrimaryAction` | NATIVE | `ToolbarItem(placement: .primaryAction)` | symbol, label, shortcut | background, material, blur, opacity, stroke, shadow, corner radius, bezel |
| `Native/Search` | NATIVE | `.searchable(text:)` | placeholder, scopes | background, material, blur, opacity, stroke, shadow, corner radius, field background |
| `Native/Inspector` | NATIVE | `.inspector(isPresented:)` | width range, content | background, material, blur, opacity, stroke, shadow, corner radius |
| `Composed/RecordsWorkspace` | NATIVE-COMPOSED | split view + table + toolbar + inspector | proportion, spacing roles | added cards or containers |
| `Product/QueryStatusBadge` | CUSTOM | `QueryStatusBadge` | per contract | outside contract |
| `Product/ExecutionGraph` | CUSTOM | `ExecutionGraphView` | per contract | outside contract |

## Variants map to types

Where a symbol has variants, map them to a Swift type so the agent produces a
typed call rather than a guess:

```
Symbol:   Product/QueryStatusBadge
Variants: Status = Running | Succeeded | Failed | Cancelled
          Size   = Compact | Regular

Swift:    QueryStatusBadge(status: .running, size: .compact)
```

Name the variants and the enumeration cases identically. Every divergence between
the two vocabularies is a translation an agent has to guess at, and it will guess
differently on different days.

## The forbidden column carries most of the value

The allowed column says what a designer may change. The **forbidden** column is
what stops an implementing agent from reproducing a static approximation of a
live material.

For every `NATIVE` row, the forbidden column contains at minimum: background,
material, blur, opacity, stroke, shadow, corner radius. Those belong to the
system.

## Detached symbols are findings

A detached system symbol is the moment the design stopped being native. In an
audit, enumerate detached instances of kit symbols and report each one. Either it
should be re-attached, or it is a `CUSTOM` component and needs a contract.
Treat any implementation identifier that is absent from the approved kit/source
inventory as detached until provenance proves otherwise; names such as
`DetachedKitSymbol42` are direct findings, not evidence of approval.

## Maintenance

- Every new symbol used in an approved frame gets a row before the frame is
  approved. A missing row is a design review finding, not an implementation
  question.
- A `CUSTOM` row points at its contract by path.
- Regenerate the symbol inventory from the document and diff it against the map
  to find rows that no longer exist and symbols that have no row.
- When the kit version changes, re-check the `NATIVE` rows: Apple's June 2026
  update renamed components to align with code, and renames break a map silently.

## Symbol map for icons

Keep a separate flat file so an agent never invents a symbol name:

```
DesignName,SFSymbol,Usage,LabelRequired
Create,plus,Primary toolbar action,true
Delete,trash,Destructive action,true
Inspector,sidebar.right,Toggle inspector,false
Refresh,arrow.clockwise,Reload content,false
Search,magnifyingglass,Search,true
```

`LabelRequired` is not stylistic — an accessibility label is required on every
icon regardless of what is shown, and this column records where a *visible* text
label is also needed because the symbol alone is ambiguous.
