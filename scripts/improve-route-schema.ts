export const IMPROVE_ROUTE_SCHEMA_VERSION = 1 as const;

export type RouteTarget =
  | "tailrocks-improve"
  | "tailrocks-improve-deep"
  | "tailrocks-improve-security"
  | "tailrocks-review-pr"
  | "tailrocks-research"
  | "tailrocks-web-design-audit"
  | "tailrocks-tui-design-audit"
  | "tailrocks-macos-design-review"
  | "tailrocks-improve-plan"
  | "tailrocks-seed-roadmap"
  | "tailrocks-improve-execution"
  | "tailrocks-improve-reconcile"
  | "tailrocks-reconcile";

export type RouteContext = "repository" | "branch" | "plans" | "roadmap";
export type DeepOperation =
  | "every-common-lane-over-every-package-with-no-leverage-cutoff-and-fresh-refutation"
  | "security-scope-with-fresh-independent-refutation"
  | "every-platform-screen-and-state-with-fresh-independent-refutation"
  | "every-changed-package-with-independent-refutation"
  | "competing-directions-with-trade-offs"
  | "parallel-investigators-with-competing-answers-and-trade-offs"
  | "second-cold-plan-review"
  | "second-independent-diff-review"
  | "reverify-every-row";

export interface ImproveRoute {
  readonly id: string;
  readonly invocation: string;
  readonly selector: string;
  readonly context: RouteContext;
  readonly target: RouteTarget;
  readonly targetArguments: readonly string[];
  readonly optionalTargetArguments?: readonly string[];
  readonly categoryClasses?: readonly ("standard" | "security" | "platform-design")[];
  readonly designMedium?: "web" | "tui" | "macos";
  readonly designConformance?: true;
  readonly batchForward: true;
  readonly batchEffect: "non-interactive-selection";
  readonly authority: "target-only";
  readonly deepOperation?: DeepOperation;
}

type RouteInput = Omit<ImproveRoute, "batchForward" | "batchEffect" | "authority">;

const route = <const T extends RouteInput>(
  value: T,
): T & Pick<ImproveRoute, "batchForward" | "batchEffect" | "authority"> => ({
  ...value,
  batchForward: true,
  batchEffect: "non-interactive-selection",
  authority: "target-only",
});

export const IMPROVE_CATEGORIES = {
  standard: [
    "agent-legibility",
    "correctness",
    "dependencies",
    "direction",
    "docs",
    "dx",
    "perf",
    "tech-debt",
    "tests",
  ],
  security: ["security"],
  platformDesign: {
    ux: "tailrocks-web-design-audit",
    tui: "tailrocks-tui-design-audit",
    "liquid-glass": "tailrocks-macos-design-review",
  },
} as const satisfies {
  readonly standard: readonly string[];
  readonly security: readonly ["security"];
  readonly platformDesign: Readonly<Record<string, RouteTarget>>;
};

/**
 * Ordered from the most specific selector to the generic category/default
 * selectors. This is the complete current-route replacement for the retired
 * combined repository-audit surface.
 */
export const IMPROVE_ROUTES = [
  route({
    id: "ask-design-web-deep",
    invocation: "design-conformance ask (web) --deep",
    selector: "ask <web design-conformance question>",
    context: "repository",
    target: "tailrocks-web-design-audit",
    targetArguments: ["<design-route package or shipped screens>", "--deep"],
    designMedium: "web",
    designConformance: true,
    deepOperation: "every-platform-screen-and-state-with-fresh-independent-refutation",
  }),
  route({
    id: "ask-design-web",
    invocation: "design-conformance ask (web)",
    selector: "ask <web design-conformance question>",
    context: "repository",
    target: "tailrocks-web-design-audit",
    targetArguments: ["<design-route package or shipped screens>"],
    designMedium: "web",
    designConformance: true,
  }),
  route({
    id: "ask-design-tui-deep",
    invocation: "design-conformance ask (terminal) --deep",
    selector: "ask <terminal design-conformance question>",
    context: "repository",
    target: "tailrocks-tui-design-audit",
    targetArguments: ["<gallery package or shipped terminal screens>", "--deep"],
    designMedium: "tui",
    designConformance: true,
    deepOperation: "every-platform-screen-and-state-with-fresh-independent-refutation",
  }),
  route({
    id: "ask-design-tui",
    invocation: "design-conformance ask (terminal)",
    selector: "ask <terminal design-conformance question>",
    context: "repository",
    target: "tailrocks-tui-design-audit",
    targetArguments: ["<gallery package or shipped terminal screens>"],
    designMedium: "tui",
    designConformance: true,
  }),
  route({
    id: "ask-design-macos-deep",
    invocation: "design-conformance ask (macOS) --deep",
    selector: "ask <macOS design-conformance question>",
    context: "repository",
    target: "tailrocks-macos-design-review",
    targetArguments: ["acceptance", "<screen, window, or prototype package>", "--deep"],
    designMedium: "macos",
    designConformance: true,
    deepOperation: "every-platform-screen-and-state-with-fresh-independent-refutation",
  }),
  route({
    id: "ask-design-macos",
    invocation: "design-conformance ask (macOS)",
    selector: "ask <macOS design-conformance question>",
    context: "repository",
    target: "tailrocks-macos-design-review",
    targetArguments: ["acceptance", "<screen, window, or prototype package>"],
    designMedium: "macos",
    designConformance: true,
  }),
  route({
    id: "security-deep",
    invocation: "security --deep",
    selector: "security",
    context: "repository",
    target: "tailrocks-improve-security",
    targetArguments: ["--deep"],
    categoryClasses: ["security"],
    deepOperation: "security-scope-with-fresh-independent-refutation",
  }),
  route({
    id: "security",
    invocation: "security",
    selector: "security",
    context: "repository",
    target: "tailrocks-improve-security",
    targetArguments: [],
    categoryClasses: ["security"],
  }),
  route({
    id: "platform-category-deep-web",
    invocation: "ux --deep",
    selector: "ux",
    context: "repository",
    target: "tailrocks-web-design-audit",
    targetArguments: ["<design-route package or shipped screens>", "--deep"],
    categoryClasses: ["platform-design"],
    designMedium: "web",
    designConformance: true,
    deepOperation: "every-platform-screen-and-state-with-fresh-independent-refutation",
  }),
  route({
    id: "platform-category-deep-tui",
    invocation: "tui --deep",
    selector: "tui",
    context: "repository",
    target: "tailrocks-tui-design-audit",
    targetArguments: ["<gallery package or shipped terminal screens>", "--deep"],
    categoryClasses: ["platform-design"],
    designMedium: "tui",
    designConformance: true,
    deepOperation: "every-platform-screen-and-state-with-fresh-independent-refutation",
  }),
  route({
    id: "platform-category-deep-macos",
    invocation: "liquid-glass --deep",
    selector: "liquid-glass",
    context: "repository",
    target: "tailrocks-macos-design-review",
    targetArguments: ["acceptance", "<screen, window, or prototype package>", "--deep"],
    categoryClasses: ["platform-design"],
    designMedium: "macos",
    designConformance: true,
    deepOperation: "every-platform-screen-and-state-with-fresh-independent-refutation",
  }),
  route({
    id: "category-deep",
    invocation: "non-security <category> --deep",
    selector: "<non-security category>",
    context: "repository",
    target: "tailrocks-improve-deep",
    targetArguments: ["<category>"],
    categoryClasses: ["standard"],
    deepOperation: "every-common-lane-over-every-package-with-no-leverage-cutoff-and-fresh-refutation",
  }),
  route({
    id: "whole-repository-deep",
    invocation: "whole-repository --deep",
    selector: "--deep",
    context: "repository",
    target: "tailrocks-improve-deep",
    targetArguments: [],
    deepOperation: "every-common-lane-over-every-package-with-no-leverage-cutoff-and-fresh-refutation",
  }),
  route({
    id: "branch-deep",
    invocation: "branch [category] --deep",
    selector: "branch [category]",
    context: "branch",
    target: "tailrocks-review-pr",
    targetArguments: ["<resolved current-branch merge-base range>", "--deep"],
    optionalTargetArguments: ["<validated category aspect>"],
    categoryClasses: ["standard", "security", "platform-design"],
    deepOperation: "every-changed-package-with-independent-refutation",
  }),
  route({
    id: "branch",
    invocation: "branch [category]",
    selector: "branch [category]",
    context: "branch",
    target: "tailrocks-review-pr",
    targetArguments: ["<resolved current-branch merge-base range>"],
    optionalTargetArguments: ["<validated category aspect>"],
    categoryClasses: ["standard", "security", "platform-design"],
  }),
  route({
    id: "next-deep",
    invocation: "next --deep",
    selector: "next",
    context: "repository",
    target: "tailrocks-research",
    targetArguments: [
      "What candidate product directions follow from this repository's evidence and history?",
      "--deep",
    ],
    deepOperation: "competing-directions-with-trade-offs",
  }),
  route({
    id: "next",
    invocation: "next",
    selector: "next",
    context: "repository",
    target: "tailrocks-research",
    targetArguments: [
      "What candidate product directions follow from this repository's evidence and history?",
    ],
  }),
  route({
    id: "ask-deep",
    invocation: "ask <question> --deep",
    selector: "ask <question>",
    context: "repository",
    target: "tailrocks-research",
    targetArguments: ["<question>", "--deep"],
    deepOperation: "parallel-investigators-with-competing-answers-and-trade-offs",
  }),
  route({
    id: "ask",
    invocation: "ask <question>",
    selector: "ask <question>",
    context: "repository",
    target: "tailrocks-research",
    targetArguments: ["<question>"],
  }),
  route({
    id: "plan-deep",
    invocation: "plan <description> --deep",
    selector: "plan <description>",
    context: "plans",
    target: "tailrocks-improve-plan",
    targetArguments: ["<description>", "--deep"],
    deepOperation: "second-cold-plan-review",
  }),
  route({
    id: "plan",
    invocation: "plan <description>",
    selector: "plan <description>",
    context: "plans",
    target: "tailrocks-improve-plan",
    targetArguments: ["<description>"],
  }),
  route({
    id: "seed",
    invocation: "seed selected finding into delivery",
    selector: "seed <finding>",
    context: "roadmap",
    target: "tailrocks-seed-roadmap",
    targetArguments: ["<finding>"],
  }),
  route({
    id: "execute-deep",
    invocation: "execute <plan> --deep",
    selector: "execute <plan>",
    context: "plans",
    target: "tailrocks-improve-execution",
    targetArguments: ["<plan>", "--deep"],
    deepOperation: "second-independent-diff-review",
  }),
  route({
    id: "execute",
    invocation: "execute <plan>",
    selector: "execute <plan>",
    context: "plans",
    target: "tailrocks-improve-execution",
    targetArguments: ["<plan>"],
  }),
  route({
    id: "plans-sweep-deep",
    invocation: "sweep --deep over plans/",
    selector: "sweep",
    context: "plans",
    target: "tailrocks-improve-reconcile",
    targetArguments: ["--deep"],
    deepOperation: "reverify-every-row",
  }),
  route({
    id: "plans-sweep",
    invocation: "sweep over plans/",
    selector: "sweep",
    context: "plans",
    target: "tailrocks-improve-reconcile",
    targetArguments: [],
  }),
  route({
    id: "roadmap-sweep-deep",
    invocation: "sweep --deep over roadmap/<slug>/",
    selector: "sweep <slug>",
    context: "roadmap",
    target: "tailrocks-reconcile",
    targetArguments: ["<slug>", "--deep"],
    deepOperation: "reverify-every-row",
  }),
  route({
    id: "roadmap-sweep",
    invocation: "sweep over roadmap/<slug>/",
    selector: "sweep <slug>",
    context: "roadmap",
    target: "tailrocks-reconcile",
    targetArguments: ["<slug>"],
  }),
  route({
    id: "quick",
    invocation: "quick",
    selector: "quick",
    context: "repository",
    target: "tailrocks-improve",
    targetArguments: ["quick"],
  }),
  route({
    id: "category",
    invocation: "non-security <category>",
    selector: "<non-security category>",
    context: "repository",
    target: "tailrocks-improve",
    targetArguments: ["<category>"],
    categoryClasses: ["standard", "platform-design"],
  }),
  route({
    id: "default",
    invocation: "default",
    selector: "<none>",
    context: "repository",
    target: "tailrocks-improve",
    targetArguments: [],
  }),
] as const satisfies readonly ImproveRoute[];

export const IMPROVE_MODIFIERS = {
  batch: {
    token: "--batch",
    validOn: "every-valid-route",
    effect: "append-to-target-and-make-selection-non-interactive",
    authority: "no-authority-beyond-target",
  },
  deep: {
    tokens: ["--deep"],
    form: "route-specific",
    bareTarget: "whole-repository-deep",
  },
} as const;

export const IMPROVE_REFUSALS = [
  {
    id: "quick-deep",
    invocation: "quick --deep",
    reason: "mutually-exclusive-depth",
    alternatives: ["tailrocks-improve quick", "tailrocks-improve-deep"],
  },
  {
    id: "multiple-primary-selectors",
    invocation: "multiple primary modes",
    reason: "multiple-primary-selectors",
  },
  {
    id: "malformed",
    invocation: "malformed mode or arguments",
    reason: "malformed-invocation",
  },
] as const;
