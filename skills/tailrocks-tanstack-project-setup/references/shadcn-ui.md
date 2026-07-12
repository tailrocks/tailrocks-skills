# shadcn/ui

shadcn components are project-owned source, not an opaque dependency. Use the
pinned CLI through `bunx --bun shadcn`; never fetch raw component files manually.

## Workflow

1. Run `bunx --bun shadcn info --json`; honor actual aliases, CSS file, Tailwind
   version, base (`radix`/`base`), icon library, style, and installed components.
2. Search configured registries before custom UI.
3. Run `bunx --bun shadcn docs <component>` and read returned docs/examples.
4. Preview with `add <component> --dry-run` and per-file `--diff`.
5. Add or merge source; review every added file, dependency, import, and registry
   script before commit. Preserve deliberate local modifications.

## Composition contract

- Prefer installed components over styled replacement markup: Alert, Empty,
  Skeleton, Badge, Separator, sonner, Field, and full Card composition.
- Use semantic theme tokens and component variants. Layout classes arrange
  components; they do not override component color/typography contracts.
- Use `gap-*`, `size-*`, `truncate`, and `cn()`; keep dark mode in semantic CSS
  variables rather than manual color duplication.
- Forms use Field/FieldGroup and accessible invalid/disabled attributes.
- Dialog/Sheet/Drawer includes a title; Avatar includes fallback; grouped items
  remain inside their group; Tabs triggers remain inside TabsList.
- Buttons compose loading state with Spinner, `disabled`, and icon `data-icon`;
  component-owned icons need no manual size classes.
- Use stable accessible labels, keyboard behavior, focus management, contrast,
  reduced motion, and responsive behavior in tests/review.

Registry names are explicit. Preset application and overwrites require human
choice; component updates use dry-run/diff and a smart merge.

**Complete when:** project context drove every CLI/action decision, installed
source passed review, UI composes existing components with semantic tokens, and
accessibility behavior is tested rather than inferred from appearance.
