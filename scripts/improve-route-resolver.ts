import {
  IMPROVE_CATEGORIES,
  IMPROVE_ROUTES,
  type DeepOperation,
  type RouteTarget,
} from "./improve-route-schema";

export interface ImproveRouteResolved {
  readonly outcome: "resolved";
  readonly routeId: string;
  readonly target: RouteTarget;
  readonly targetArguments: readonly string[];
  readonly deepOperation: DeepOperation | null;
  readonly batchEffect: "non-interactive-selection" | null;
  readonly authority: "target-only";
  readonly mutations: readonly [];
}

export type ImproveRouteRefusalCode =
  | "context-mismatch"
  | "duplicate-modifier"
  | "invalid-roadmap-slug"
  | "malformed-invocation"
  | "missing-branch-range"
  | "missing-design-medium"
  | "missing-design-subject"
  | "missing-payload"
  | "missing-roadmap-slug"
  | "missing-sweep-context"
  | "multiple-primary-selectors"
  | "mutually-exclusive-depth"
  | "unknown-category"
  | "unknown-design-medium"
  | "unknown-modifier"
  | "unsupported-modifier";

export interface ImproveRouteRefused {
  readonly outcome: "refused";
  readonly code: ImproveRouteRefusalCode;
  readonly detail: string;
  readonly alternatives?: readonly string[];
  readonly target: null;
  readonly targetArguments: readonly [];
  readonly mutations: readonly [];
}

export type ImproveRouteResolution = ImproveRouteResolved | ImproveRouteRefused;

type RecordValue = Record<string, unknown>;
type ParsedContext =
  | { readonly kind: "repository" }
  | { readonly kind: "branch"; readonly range?: string }
  | { readonly kind: "plans" }
  | { readonly kind: "roadmap"; readonly slug?: string };

const categoryNames = [
  ...IMPROVE_CATEGORIES.standard,
  ...IMPROVE_CATEGORIES.security,
  ...Object.keys(IMPROVE_CATEGORIES.platformDesign),
] as const;
const categories = new Set<string>(categoryNames);
const standardCategories = new Set<string>(IMPROVE_CATEGORIES.standard);
const platformCategories = new Set<string>(Object.keys(IMPROVE_CATEGORIES.platformDesign));
const primaryFields = {
  default: [],
  quick: [],
  category: ["category", "designSubject"],
  branch: ["category"],
  next: [],
  ask: ["question"],
  "design-conformance": ["medium", "subject"],
  plan: ["description"],
  seed: ["finding"],
  execute: ["plan"],
  sweep: [],
} as const;

function record(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function allowedKeys(value: RecordValue, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function text(value: unknown): value is string {
  return typeof value === "string";
}

function payload(value: unknown): value is string {
  return text(value) && value.trim() === value && value.length > 0 && !/[\0\r\n]/u.test(value);
}

function positional(value: unknown): value is string {
  return payload(value) && !value.startsWith("-");
}

function dense(value: readonly unknown[]): boolean {
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) return false;
  }
  return true;
}

function refused(code: ImproveRouteRefusalCode, alternatives?: readonly string[]): ImproveRouteRefused {
  return {
    outcome: "refused",
    code,
    detail: code,
    ...(alternatives ? { alternatives } : {}),
    target: null,
    targetArguments: [],
    mutations: [],
  };
}

function selectedRoute(id: string): (typeof IMPROVE_ROUTES)[number] | undefined {
  return IMPROVE_ROUTES.find((candidate) => candidate.id === id);
}

function resolved(id: string, targetArguments: readonly string[], batch: boolean): ImproveRouteResolution {
  const selected = selectedRoute(id);
  if (!selected) return refused("malformed-invocation");
  return {
    outcome: "resolved",
    routeId: id,
    target: selected.target,
    targetArguments: batch ? [...targetArguments, "--batch"] : targetArguments,
    deepOperation: "deepOperation" in selected ? selected.deepOperation : null,
    batchEffect: batch ? selected.batchEffect : null,
    authority: selected.authority,
    mutations: [],
  };
}

function parseContext(value: unknown): ParsedContext | null {
  if (!record(value) || !Object.hasOwn(value, "kind") || !text(value.kind)) return null;
  if (value.kind === "repository" || value.kind === "plans")
    return allowedKeys(value, ["kind"]) ? { kind: value.kind } : null;
  if (value.kind === "branch") {
    if (!allowedKeys(value, ["kind", "range"])) return null;
    if (!Object.hasOwn(value, "range")) return "range" in value ? null : { kind: "branch" };
    if (!text(value.range)) return null;
    return { kind: "branch", range: value.range };
  }
  if (value.kind === "roadmap") {
    if (!allowedKeys(value, ["kind", "slug"])) return null;
    if (!Object.hasOwn(value, "slug")) return "slug" in value ? null : { kind: "roadmap" };
    if (!text(value.slug)) return null;
    return { kind: "roadmap", slug: value.slug };
  }
  return null;
}

function validPrimaryShape(
  value: unknown,
): value is RecordValue & { readonly kind: keyof typeof primaryFields } {
  if (
    !record(value) ||
    !Object.hasOwn(value, "kind") ||
    !text(value.kind) ||
    !Object.hasOwn(primaryFields, value.kind)
  )
    return false;
  const kind = value.kind as keyof typeof primaryFields;
  if (!allowedKeys(value, ["kind", ...primaryFields[kind]])) return false;
  if (primaryFields[kind].some((field) => !Object.hasOwn(value, field) && field in value)) return false;
  return Object.entries(value).every(([key, field]) => key === "kind" || field === undefined || text(field));
}

function requireContext(context: ParsedContext, kind: ParsedContext["kind"]): ImproveRouteRefused | null {
  return context.kind === kind ? null : refused("context-mismatch");
}

function resolveImproveRouteUnchecked(input: unknown): ImproveRouteResolution {
  if (
    !record(input) ||
    !allowedKeys(input, ["primaries", "modifiers", "context"]) ||
    !["primaries", "modifiers", "context"].every((key) => Object.hasOwn(input, key))
  )
    return refused("malformed-invocation");
  if (!Array.isArray(input.primaries) || !Array.isArray(input.modifiers))
    return refused("malformed-invocation");
  if (input.modifiers.length > 3) return refused("malformed-invocation");
  if (!dense(input.modifiers)) return refused("malformed-invocation");
  if (input.modifiers.some((modifier) => !text(modifier) || !["--deep", "--batch"].includes(modifier)))
    return refused("unknown-modifier");
  if (new Set(input.modifiers).size !== input.modifiers.length) return refused("duplicate-modifier");
  if (input.primaries.length > 1) return refused("multiple-primary-selectors");
  if (!dense(input.primaries)) return refused("malformed-invocation");
  const context = parseContext(input.context);
  if (!context || !input.primaries.every(validPrimaryShape)) return refused("malformed-invocation");

  const primary = input.primaries[0] ?? { kind: "default" };
  const deep = input.modifiers.includes("--deep");
  const batch = input.modifiers.includes("--batch");
  if (primary.kind === "quick" && deep)
    return refused("mutually-exclusive-depth", ["tailrocks-improve quick", "tailrocks-improve-deep"]);

  if (primary.kind === "default" || primary.kind === "quick") {
    const mismatch = requireContext(context, "repository");
    if (mismatch) return mismatch;
    if (primary.kind === "quick") return resolved("quick", ["quick"], batch);
    return deep ? resolved("whole-repository-deep", [], batch) : resolved("default", [], batch);
  }

  if (primary.kind === "category") {
    const mismatch = requireContext(context, "repository");
    if (mismatch) return mismatch;
    if (!payload(primary.category) || !categories.has(primary.category)) return refused("unknown-category");
    if (!platformCategories.has(primary.category) && primary.designSubject !== undefined)
      return refused("context-mismatch");
    if (!deep && primary.designSubject !== undefined) return refused("context-mismatch");
    if (primary.category === "security")
      return resolved(deep ? "security-deep" : "security", deep ? ["--deep"] : [], batch);
    if (!deep) return resolved("category", [primary.category], batch);
    if (standardCategories.has(primary.category)) {
      if (primary.designSubject !== undefined) return refused("context-mismatch");
      return resolved("category-deep", [primary.category], batch);
    }
    if (!positional(primary.designSubject)) return refused("missing-design-subject");
    const medium = primary.category === "ux" ? "web" : primary.category === "tui" ? "tui" : "macos";
    const args =
      medium === "macos"
        ? ["acceptance", primary.designSubject, "--deep"]
        : [primary.designSubject, "--deep"];
    return resolved(`platform-category-deep-${medium}`, args, batch);
  }

  if (primary.kind === "branch") {
    const mismatch = requireContext(context, "branch");
    if (mismatch) return mismatch;
    if (
      !payload(context.range) ||
      !/^(?:[0-9a-f]{40}\.\.\.[0-9a-f]{40}|[0-9a-f]{64}\.\.\.[0-9a-f]{64})$/u.test(context.range)
    )
      return refused("missing-branch-range");
    if (primary.category !== undefined && (!payload(primary.category) || !categories.has(primary.category)))
      return refused("unknown-category");
    return resolved(
      deep ? "branch-deep" : "branch",
      [context.range, ...(primary.category ? [primary.category] : []), ...(deep ? ["--deep"] : [])],
      batch,
    );
  }

  if (primary.kind === "next" || primary.kind === "ask" || primary.kind === "design-conformance") {
    const mismatch = requireContext(context, "repository");
    if (mismatch) return mismatch;
    if (primary.kind === "next") {
      const question =
        "What candidate product directions follow from this repository's evidence and history?";
      return resolved(deep ? "next-deep" : "next", [question, ...(deep ? ["--deep"] : [])], batch);
    }
    if (primary.kind === "ask") {
      if (!positional(primary.question)) return refused("missing-payload");
      return resolved(deep ? "ask-deep" : "ask", [primary.question, ...(deep ? ["--deep"] : [])], batch);
    }
    if (primary.medium === undefined || primary.medium === "") return refused("missing-design-medium");
    if (!text(primary.medium) || !["web", "tui", "macos"].includes(primary.medium))
      return refused("unknown-design-medium");
    if (!positional(primary.subject)) return refused("missing-design-subject");
    const args = primary.medium === "macos" ? ["acceptance", primary.subject] : [primary.subject];
    return resolved(
      `ask-design-${primary.medium}${deep ? "-deep" : ""}`,
      [...args, ...(deep ? ["--deep"] : [])],
      batch,
    );
  }

  if (primary.kind === "plan" || primary.kind === "execute") {
    const mismatch = requireContext(context, "plans");
    if (mismatch) return mismatch;
    const value = primary.kind === "plan" ? primary.description : primary.plan;
    if (!positional(value)) return refused("missing-payload");
    return resolved(`${primary.kind}${deep ? "-deep" : ""}`, [value, ...(deep ? ["--deep"] : [])], batch);
  }

  if (primary.kind === "seed") {
    const mismatch = requireContext(context, "roadmap");
    if (mismatch) return mismatch;
    if (!positional(primary.finding)) return refused("missing-payload");
    if (deep) return refused("unsupported-modifier");
    return resolved("seed", [primary.finding], batch);
  }

  if (primary.kind === "sweep") {
    if (context.kind !== "plans" && context.kind !== "roadmap") return refused("missing-sweep-context");
    if (context.kind === "plans")
      return resolved(deep ? "plans-sweep-deep" : "plans-sweep", deep ? ["--deep"] : [], batch);
    if (context.slug === undefined || context.slug === "") return refused("missing-roadmap-slug");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(context.slug)) return refused("invalid-roadmap-slug");
    return resolved(
      deep ? "roadmap-sweep-deep" : "roadmap-sweep",
      [context.slug, ...(deep ? ["--deep"] : [])],
      batch,
    );
  }

  return refused("malformed-invocation");
}

/** Resolve historical invocation intent to one direct current owner. Pure: never invokes or mutates. */
export function resolveImproveRoute(input: unknown): ImproveRouteResolution {
  try {
    return resolveImproveRouteUnchecked(input);
  } catch {
    return refused("malformed-invocation");
  }
}
