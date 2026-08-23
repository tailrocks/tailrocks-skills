import { expect, test } from "bun:test";

import {
  IMPROVE_CATEGORIES,
  IMPROVE_MODIFIERS,
  IMPROVE_REFUSALS,
  IMPROVE_ROUTES,
  IMPROVE_ROUTE_SCHEMA_VERSION,
} from "./improve-route-schema";

test("route schema has stable unique identities and deterministic specificity order", () => {
  expect(IMPROVE_ROUTE_SCHEMA_VERSION).toBe(1);
  const ids = IMPROVE_ROUTES.map(({ id }) => id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids.indexOf("ask-design-web")).toBeLessThan(ids.indexOf("ask"));
  expect(ids.indexOf("security-deep")).toBeLessThan(ids.indexOf("category-deep"));
  expect(ids.indexOf("category-deep")).toBeLessThan(ids.indexOf("category"));
  expect(ids.at(-1)).toBe("default");
});

test("category vocabulary is closed and each platform category has one owner", () => {
  expect([
    ...IMPROVE_CATEGORIES.standard,
    ...IMPROVE_CATEGORIES.security,
    ...Object.keys(IMPROVE_CATEGORIES.platformDesign),
  ]).toEqual([
    "agent-legibility",
    "correctness",
    "dependencies",
    "direction",
    "docs",
    "dx",
    "perf",
    "tech-debt",
    "tests",
    "security",
    "ux",
    "tui",
    "liquid-glass",
  ]);
  expect(IMPROVE_CATEGORIES.platformDesign).toEqual({
    ux: "tailrocks-web-design-audit",
    tui: "tailrocks-tui-design-audit",
    "liquid-glass": "tailrocks-macos-design-review",
  });
});

test("every invocation-table route has one exact current owner", () => {
  expect(
    IMPROVE_ROUTES.map(({ id, target, targetArguments, deepOperation }) => [
      id,
      target,
      targetArguments,
      deepOperation ?? null,
    ]),
  ).toEqual([
    [
      "ask-design-web-deep",
      "tailrocks-web-design-audit",
      ["<design-route package or shipped screens>", "--deep"],
      "every-platform-screen-and-state-with-fresh-independent-refutation",
    ],
    ["ask-design-web", "tailrocks-web-design-audit", ["<design-route package or shipped screens>"], null],
    [
      "ask-design-tui-deep",
      "tailrocks-tui-design-audit",
      ["<gallery package or shipped terminal screens>", "--deep"],
      "every-platform-screen-and-state-with-fresh-independent-refutation",
    ],
    ["ask-design-tui", "tailrocks-tui-design-audit", ["<gallery package or shipped terminal screens>"], null],
    [
      "ask-design-macos-deep",
      "tailrocks-macos-design-review",
      ["acceptance", "<screen, window, or prototype package>", "--deep"],
      "every-platform-screen-and-state-with-fresh-independent-refutation",
    ],
    [
      "ask-design-macos",
      "tailrocks-macos-design-review",
      ["acceptance", "<screen, window, or prototype package>"],
      null,
    ],
    [
      "security-deep",
      "tailrocks-improve-security",
      ["--deep"],
      "security-scope-with-fresh-independent-refutation",
    ],
    ["security", "tailrocks-improve-security", [], null],
    [
      "platform-category-deep-web",
      "tailrocks-web-design-audit",
      ["<design-route package or shipped screens>", "--deep"],
      "every-platform-screen-and-state-with-fresh-independent-refutation",
    ],
    [
      "platform-category-deep-tui",
      "tailrocks-tui-design-audit",
      ["<gallery package or shipped terminal screens>", "--deep"],
      "every-platform-screen-and-state-with-fresh-independent-refutation",
    ],
    [
      "platform-category-deep-macos",
      "tailrocks-macos-design-review",
      ["acceptance", "<screen, window, or prototype package>", "--deep"],
      "every-platform-screen-and-state-with-fresh-independent-refutation",
    ],
    [
      "category-deep",
      "tailrocks-improve-deep",
      ["<category>"],
      "every-common-lane-over-every-package-with-no-leverage-cutoff-and-fresh-refutation",
    ],
    [
      "whole-repository-deep",
      "tailrocks-improve-deep",
      [],
      "every-common-lane-over-every-package-with-no-leverage-cutoff-and-fresh-refutation",
    ],
    [
      "branch-deep",
      "tailrocks-review-pr",
      ["<resolved current-branch merge-base range>", "--deep"],
      "every-changed-package-with-independent-refutation",
    ],
    ["branch", "tailrocks-review-pr", ["<resolved current-branch merge-base range>"], null],
    [
      "next-deep",
      "tailrocks-research",
      ["What candidate product directions follow from this repository's evidence and history?", "--deep"],
      "competing-directions-with-trade-offs",
    ],
    [
      "next",
      "tailrocks-research",
      ["What candidate product directions follow from this repository's evidence and history?"],
      null,
    ],
    [
      "ask-deep",
      "tailrocks-research",
      ["<question>", "--deep"],
      "parallel-investigators-with-competing-answers-and-trade-offs",
    ],
    ["ask", "tailrocks-research", ["<question>"], null],
    ["plan-deep", "tailrocks-improve-plan", ["<description>", "--deep"], "second-cold-plan-review"],
    ["plan", "tailrocks-improve-plan", ["<description>"], null],
    ["seed", "tailrocks-seed-roadmap", ["<finding>"], null],
    ["execute-deep", "tailrocks-improve-execution", ["<plan>", "--deep"], "second-independent-diff-review"],
    ["execute", "tailrocks-improve-execution", ["<plan>"], null],
    ["plans-sweep-deep", "tailrocks-improve-reconcile", ["--deep"], "reverify-every-row"],
    ["plans-sweep", "tailrocks-improve-reconcile", [], null],
    ["roadmap-sweep-deep", "tailrocks-reconcile", ["<slug>", "--deep"], "reverify-every-row"],
    ["roadmap-sweep", "tailrocks-reconcile", ["<slug>"], null],
    ["quick", "tailrocks-improve", ["quick"], null],
    ["category", "tailrocks-improve", ["<category>"], null],
    ["default", "tailrocks-improve", [], null],
  ]);
});

test("platform deep routes and every deep operation remain explicit", () => {
  expect(
    IMPROVE_ROUTES.filter(({ id }) => id.startsWith("platform-category-deep-")).map(({ target }) => target),
  ).toEqual(["tailrocks-web-design-audit", "tailrocks-tui-design-audit", "tailrocks-macos-design-review"]);
  expect(IMPROVE_ROUTES.filter(({ id }) => id.endsWith("-deep")).every((entry) => entry.deepOperation)).toBe(
    true,
  );
});

test("batch and refusal modifiers are total and authority preserving", () => {
  expect(IMPROVE_MODIFIERS.batch).toEqual({
    token: "--batch",
    validOn: "every-valid-route",
    effect: "append-to-target-and-make-selection-non-interactive",
    authority: "no-authority-beyond-target",
  });
  expect(IMPROVE_MODIFIERS.deep.bareTarget).toBe("whole-repository-deep");
  expect(IMPROVE_MODIFIERS.deep.tokens).toEqual(["--deep"]);
  for (const candidate of IMPROVE_ROUTES) {
    expect(candidate.batchForward).toBe(true);
    expect(candidate.batchEffect).toBe("non-interactive-selection");
    expect(candidate.authority).toBe("target-only");
    expect([...candidate.targetArguments, "--batch"].at(-1)).toBe("--batch");
  }
  expect(IMPROVE_REFUSALS).toEqual([
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
  ]);
});

test("route partitions carry the context needed to prevent ambiguous selection", () => {
  const standardCategories = new Set(IMPROVE_CATEGORIES.standard);
  expect(standardCategories.has("security")).toBe(false);
  for (const category of Object.keys(IMPROVE_CATEGORIES.platformDesign)) {
    expect(standardCategories.has(category)).toBe(false);
  }

  for (const candidate of IMPROVE_ROUTES.filter(({ id }) => id.startsWith("ask-design-"))) {
    expect(candidate.designConformance).toBe(true);
    expect(candidate.designMedium).toBeOneOf(["web", "tui", "macos"]);
  }
  expect(IMPROVE_ROUTES.find(({ id }) => id === "branch")?.optionalTargetArguments).toEqual([
    "<validated category aspect>",
  ]);
  expect(IMPROVE_ROUTES.find(({ id }) => id === "plans-sweep")?.context).toBe("plans");
  expect(IMPROVE_ROUTES.find(({ id }) => id === "roadmap-sweep")?.context).toBe("roadmap");
  expect(IMPROVE_ROUTES.find(({ id }) => id === "roadmap-sweep")?.targetArguments).toEqual(["<slug>"]);
});

test("selection-critical route fields match the complete ordered matrix", () => {
  expect(
    IMPROVE_ROUTES.map((candidate) =>
      [
        candidate.id,
        candidate.invocation,
        candidate.selector,
        candidate.context,
        candidate.optionalTargetArguments?.join(",") ?? "-",
        candidate.categoryClasses?.join(",") ?? "-",
        candidate.designMedium ?? "-",
        candidate.designConformance ? "conformance" : "-",
      ].join("|"),
    ),
  ).toEqual([
    "ask-design-web-deep|design-conformance ask (web) --deep|ask <web design-conformance question>|repository|-|-|web|conformance",
    "ask-design-web|design-conformance ask (web)|ask <web design-conformance question>|repository|-|-|web|conformance",
    "ask-design-tui-deep|design-conformance ask (terminal) --deep|ask <terminal design-conformance question>|repository|-|-|tui|conformance",
    "ask-design-tui|design-conformance ask (terminal)|ask <terminal design-conformance question>|repository|-|-|tui|conformance",
    "ask-design-macos-deep|design-conformance ask (macOS) --deep|ask <macOS design-conformance question>|repository|-|-|macos|conformance",
    "ask-design-macos|design-conformance ask (macOS)|ask <macOS design-conformance question>|repository|-|-|macos|conformance",
    "security-deep|security --deep|security|repository|-|security|-|-",
    "security|security|security|repository|-|security|-|-",
    "platform-category-deep-web|ux --deep|ux|repository|-|platform-design|web|conformance",
    "platform-category-deep-tui|tui --deep|tui|repository|-|platform-design|tui|conformance",
    "platform-category-deep-macos|liquid-glass --deep|liquid-glass|repository|-|platform-design|macos|conformance",
    "category-deep|non-security <category> --deep|<non-security category>|repository|-|standard|-|-",
    "whole-repository-deep|whole-repository --deep|--deep|repository|-|-|-|-",
    "branch-deep|branch [category] --deep|branch [category]|branch|<validated category aspect>|standard,security,platform-design|-|-",
    "branch|branch [category]|branch [category]|branch|<validated category aspect>|standard,security,platform-design|-|-",
    "next-deep|next --deep|next|repository|-|-|-|-",
    "next|next|next|repository|-|-|-|-",
    "ask-deep|ask <question> --deep|ask <question>|repository|-|-|-|-",
    "ask|ask <question>|ask <question>|repository|-|-|-|-",
    "plan-deep|plan <description> --deep|plan <description>|plans|-|-|-|-",
    "plan|plan <description>|plan <description>|plans|-|-|-|-",
    "seed|seed selected finding into delivery|seed <finding>|roadmap|-|-|-|-",
    "execute-deep|execute <plan> --deep|execute <plan>|plans|-|-|-|-",
    "execute|execute <plan>|execute <plan>|plans|-|-|-|-",
    "plans-sweep-deep|sweep --deep over plans/|sweep|plans|-|-|-|-",
    "plans-sweep|sweep over plans/|sweep|plans|-|-|-|-",
    "roadmap-sweep-deep|sweep --deep over roadmap/<slug>/|sweep <slug>|roadmap|-|-|-|-",
    "roadmap-sweep|sweep over roadmap/<slug>/|sweep <slug>|roadmap|-|-|-|-",
    "quick|quick|quick|repository|-|-|-|-",
    "category|non-security <category>|<non-security category>|repository|-|standard,platform-design|-|-",
    "default|default|<none>|repository|-|-|-|-",
  ]);
});
