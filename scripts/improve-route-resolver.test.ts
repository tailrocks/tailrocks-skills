import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { resolveImproveRoute, type ImproveRouteResolution } from "./improve-route-resolver";
import { IMPROVE_CATEGORIES, IMPROVE_ROUTES } from "./improve-route-schema";

const repository = { kind: "repository" } as const;
const plans = { kind: "plans" } as const;
const branch = {
  kind: "branch",
  range: "0123456789abcdef0123456789abcdef01234567...89abcdef0123456789abcdef0123456789abcdef",
} as const;
const roadmap = { kind: "roadmap", slug: "cache-fix" } as const;
const request = (
  primary: Record<string, unknown> | null,
  context: Record<string, unknown>,
  modifiers: string[] = [],
) => ({
  primaries: primary ? [primary] : [],
  modifiers,
  context,
});

interface ExpectedRoute {
  readonly primary: Record<string, unknown> | null;
  readonly context: Record<string, unknown>;
  readonly modifiers?: readonly string[];
  readonly routeId: string;
  readonly targetArguments: readonly string[];
}

function expectResolved(actual: ImproveRouteResolution, expected: ExpectedRoute, batch: boolean): void {
  expect(actual.outcome).toBe("resolved");
  if (actual.outcome !== "resolved") return;
  const schema = IMPROVE_ROUTES.find(({ id }) => id === expected.routeId);
  expect(actual.routeId).toBe(expected.routeId);
  expect(actual.target).toBe(schema?.target);
  expect(actual.targetArguments).toEqual([...expected.targetArguments, ...(batch ? ["--batch"] : [])]);
  expect(actual.deepOperation).toBe(schema && "deepOperation" in schema ? schema.deepOperation : null);
  expect(actual.batchEffect).toBe(batch ? "non-interactive-selection" : null);
  expect(actual.authority).toBe("target-only");
  expect(actual.mutations).toEqual([]);
  expect(actual.targetArguments.some((argument) => /[<\[].*[>\]]/u.test(argument))).toBe(false);
}

test("every valid base route resolves with and without batch", () => {
  const cases: ExpectedRoute[] = [
    { primary: null, context: repository, routeId: "default", targetArguments: [] },
    {
      primary: null,
      context: repository,
      modifiers: ["--deep"],
      routeId: "whole-repository-deep",
      targetArguments: [],
    },
    { primary: { kind: "quick" }, context: repository, routeId: "quick", targetArguments: ["quick"] },
  ];
  for (const category of [
    ...IMPROVE_CATEGORIES.standard,
    ...IMPROVE_CATEGORIES.security,
    ...Object.keys(IMPROVE_CATEGORIES.platformDesign),
  ]) {
    cases.push({
      primary: { kind: "category", category },
      context: repository,
      routeId: category === "security" ? "security" : "category",
      targetArguments: category === "security" ? [] : [category],
    });
    if (category === "security") {
      cases.push({
        primary: { kind: "category", category },
        context: repository,
        modifiers: ["--deep"],
        routeId: "security-deep",
        targetArguments: ["--deep"],
      });
    } else if (IMPROVE_CATEGORIES.standard.includes(category as never)) {
      cases.push({
        primary: { kind: "category", category },
        context: repository,
        modifiers: ["--deep"],
        routeId: "category-deep",
        targetArguments: [category],
      });
    } else {
      const medium = category === "ux" ? "web" : category === "tui" ? "tui" : "macos";
      const subject = `${category}-subject`;
      cases.push({
        primary: { kind: "category", category, designSubject: subject },
        context: repository,
        modifiers: ["--deep"],
        routeId: `platform-category-deep-${medium}`,
        targetArguments: medium === "macos" ? ["acceptance", subject, "--deep"] : [subject, "--deep"],
      });
    }
  }
  for (const category of [
    undefined,
    ...IMPROVE_CATEGORIES.standard,
    ...IMPROVE_CATEGORIES.security,
    ...Object.keys(IMPROVE_CATEGORIES.platformDesign),
  ]) {
    for (const deep of [false, true]) {
      cases.push({
        primary: { kind: "branch", ...(category ? { category } : {}) },
        context: branch,
        modifiers: deep ? ["--deep"] : [],
        routeId: deep ? "branch-deep" : "branch",
        targetArguments: [branch.range, ...(category ? [category] : []), ...(deep ? ["--deep"] : [])],
      });
    }
  }
  const question = "Why now?";
  const direction = "What candidate product directions follow from this repository's evidence and history?";
  for (const deep of [false, true]) {
    cases.push(
      {
        primary: { kind: "next" },
        context: repository,
        modifiers: deep ? ["--deep"] : [],
        routeId: deep ? "next-deep" : "next",
        targetArguments: [direction, ...(deep ? ["--deep"] : [])],
      },
      {
        primary: { kind: "ask", question },
        context: repository,
        modifiers: deep ? ["--deep"] : [],
        routeId: deep ? "ask-deep" : "ask",
        targetArguments: [question, ...(deep ? ["--deep"] : [])],
      },
      {
        primary: { kind: "plan", description: "Fix cache" },
        context: plans,
        modifiers: deep ? ["--deep"] : [],
        routeId: deep ? "plan-deep" : "plan",
        targetArguments: ["Fix cache", ...(deep ? ["--deep"] : [])],
      },
      {
        primary: { kind: "execute", plan: "plans/001-cache.md" },
        context: plans,
        modifiers: deep ? ["--deep"] : [],
        routeId: deep ? "execute-deep" : "execute",
        targetArguments: ["plans/001-cache.md", ...(deep ? ["--deep"] : [])],
      },
      {
        primary: { kind: "sweep" },
        context: plans,
        modifiers: deep ? ["--deep"] : [],
        routeId: deep ? "plans-sweep-deep" : "plans-sweep",
        targetArguments: deep ? ["--deep"] : [],
      },
      {
        primary: { kind: "sweep" },
        context: roadmap,
        modifiers: deep ? ["--deep"] : [],
        routeId: deep ? "roadmap-sweep-deep" : "roadmap-sweep",
        targetArguments: [roadmap.slug, ...(deep ? ["--deep"] : [])],
      },
    );
    for (const medium of ["web", "tui", "macos"] as const) {
      cases.push({
        primary: { kind: "design-conformance", medium, subject: "screen" },
        context: repository,
        modifiers: deep ? ["--deep"] : [],
        routeId: `ask-design-${medium}${deep ? "-deep" : ""}`,
        targetArguments: [
          ...(medium === "macos" ? ["acceptance"] : []),
          "screen",
          ...(deep ? ["--deep"] : []),
        ],
      });
    }
  }
  cases.push({
    primary: { kind: "seed", finding: "F-12" },
    context: roadmap,
    routeId: "seed",
    targetArguments: ["F-12"],
  });

  for (const expected of cases) {
    const baseModifiers = [...(expected.modifiers ?? [])];
    const modifierVectors = [
      { modifiers: baseModifiers, batch: false },
      { modifiers: [...baseModifiers, "--batch"], batch: true },
      ...(baseModifiers.includes("--deep") ? [{ modifiers: ["--batch", "--deep"], batch: true }] : []),
    ];
    for (const { modifiers, batch } of modifierVectors) {
      expectResolved(
        resolveImproveRoute(request(expected.primary, expected.context, modifiers)),
        expected,
        batch,
      );
    }
  }
});

test("refusal precedence is stable and every result is mutation-free", () => {
  const invalid: Array<[unknown, string]> = [
    [null, "malformed-invocation"],
    [{ primaries: [], modifiers: [], context: repository, extra: true }, "malformed-invocation"],
    [{ primaries: "default", modifiers: [], context: repository }, "malformed-invocation"],
    [request({ kind: "quick" }, repository, ["--other"]), "unknown-modifier"],
    [request({ kind: "quick" }, repository, ["--deep", "--deep"]), "duplicate-modifier"],
    [
      { primaries: [{ kind: "quick" }, { kind: "next" }], modifiers: [], context: repository },
      "multiple-primary-selectors",
    ],
    [request({ kind: "quick" }, repository, ["--deep"]), "mutually-exclusive-depth"],
    [request({ kind: "quick" }, plans), "context-mismatch"],
    [request({ kind: "branch" }, { kind: "branch" }), "missing-branch-range"],
    [request({ kind: "branch" }, { kind: "branch", range: "abc123...HEAD" }), "missing-branch-range"],
    [request({ kind: "branch" }, { kind: "branch", range: "--comment" }), "missing-branch-range"],
    [request({ kind: "category", category: "Security" }, repository), "unknown-category"],
    [request({ kind: "category", category: "ѕecurity" }, repository), "unknown-category"],
    [
      request({ kind: "category", category: "security", designSubject: "screen" }, repository, ["--deep"]),
      "context-mismatch",
    ],
    [request({ kind: "ask", question: "" }, repository), "missing-payload"],
    [request({ kind: "ask", question: "--batch" }, repository), "missing-payload"],
    [request({ kind: "plan", description: "--deep" }, plans), "missing-payload"],
    [request({ kind: "execute", plan: "--batch" }, plans), "missing-payload"],
    [request({ kind: "seed", finding: "--deep" }, roadmap), "missing-payload"],
    [request({ kind: "design-conformance", subject: "screen" }, repository), "missing-design-medium"],
    [
      request({ kind: "design-conformance", medium: "ios", subject: "screen" }, repository),
      "unknown-design-medium",
    ],
    [
      request({ kind: "design-conformance", medium: "web", subject: "" }, repository),
      "missing-design-subject",
    ],
    [
      request({ kind: "design-conformance", medium: "web", subject: "--batch" }, repository),
      "missing-design-subject",
    ],
    [request({ kind: "category", category: "ux" }, repository, ["--deep"]), "missing-design-subject"],
    [request({ kind: "sweep" }, repository), "missing-sweep-context"],
    [request({ kind: "sweep" }, { kind: "roadmap" }), "missing-roadmap-slug"],
    [request({ kind: "sweep" }, { kind: "roadmap", slug: "Bad/slug" }), "invalid-roadmap-slug"],
    [request({ kind: "seed", finding: "F-1" }, roadmap, ["--deep"]), "unsupported-modifier"],
  ];
  for (const [input, code] of invalid) {
    expect(resolveImproveRoute(input)).toMatchObject({
      outcome: "refused",
      code,
      target: null,
      targetArguments: [],
      mutations: [],
    });
  }
  expect(resolveImproveRoute(request({ kind: "quick" }, repository, ["--deep"]))).toMatchObject({
    alternatives: ["tailrocks-improve quick", "tailrocks-improve-deep"],
  });
  expect(resolveImproveRoute({ primaries: new Array(1), modifiers: [], context: repository })).toMatchObject({
    code: "malformed-invocation",
  });
  expect(resolveImproveRoute({ primaries: [], modifiers: new Array(1), context: repository })).toMatchObject({
    code: "malformed-invocation",
  });
  expect(
    resolveImproveRoute({ primaries: [{ kind: "toString" }], modifiers: [], context: repository }),
  ).toMatchObject({
    code: "malformed-invocation",
  });
  const inherited = Object.create({ kind: "quick" }) as Record<string, unknown>;
  expect(resolveImproveRoute({ primaries: [inherited], modifiers: [], context: repository })).toMatchObject({
    code: "malformed-invocation",
  });
  const revoked = Proxy.revocable({}, {});
  revoked.revoke();
  expect(resolveImproveRoute(revoked.proxy)).toMatchObject({ code: "malformed-invocation" });
  const inheritedQuestion = Object.assign(Object.create({ question: "why" }), { kind: "ask" });
  expect(resolveImproveRoute(request(inheritedQuestion, repository))).toMatchObject({
    code: "malformed-invocation",
  });
  const inheritedRange = Object.assign(Object.create({ range: branch.range }), { kind: "branch" });
  expect(resolveImproveRoute(request({ kind: "branch" }, inheritedRange))).toMatchObject({
    code: "malformed-invocation",
  });
  const inheritedSlug = Object.assign(Object.create({ slug: "cache-fix" }), { kind: "roadmap" });
  expect(resolveImproveRoute(request({ kind: "sweep" }, inheritedSlug))).toMatchObject({
    code: "malformed-invocation",
  });
  const hugePrimaries: unknown[] = [];
  hugePrimaries.length = 1_000_000_000;
  expect(resolveImproveRoute({ primaries: hugePrimaries, modifiers: [], context: repository })).toMatchObject(
    {
      code: "multiple-primary-selectors",
    },
  );
  const hugeModifiers: unknown[] = [];
  hugeModifiers.length = 1_000_000_000;
  expect(resolveImproveRoute({ primaries: [], modifiers: hugeModifiers, context: repository })).toMatchObject(
    {
      code: "malformed-invocation",
    },
  );
});

test("modifier vectors preserve exact refusal precedence across semantic failures", () => {
  const validModifierVectors = [[], ["--batch"], ["--deep"], ["--deep", "--batch"], ["--batch", "--deep"]];
  const semanticCases: Array<{
    readonly primary: Record<string, unknown>;
    readonly context: Record<string, unknown>;
    readonly code: string;
  }> = [
    { primary: { kind: "unknown" }, context: repository, code: "malformed-invocation" },
    { primary: { kind: "ask", question: "why" }, context: plans, code: "context-mismatch" },
    { primary: { kind: "category", category: "Security" }, context: repository, code: "unknown-category" },
    { primary: { kind: "branch" }, context: { kind: "branch" }, code: "missing-branch-range" },
    { primary: { kind: "ask", question: "" }, context: repository, code: "missing-payload" },
    {
      primary: { kind: "design-conformance", subject: "screen" },
      context: repository,
      code: "missing-design-medium",
    },
    {
      primary: { kind: "design-conformance", medium: "ios", subject: "screen" },
      context: repository,
      code: "unknown-design-medium",
    },
    {
      primary: { kind: "design-conformance", medium: "web", subject: "" },
      context: repository,
      code: "missing-design-subject",
    },
    { primary: { kind: "sweep" }, context: repository, code: "missing-sweep-context" },
    { primary: { kind: "sweep" }, context: { kind: "roadmap" }, code: "missing-roadmap-slug" },
    {
      primary: { kind: "sweep" },
      context: { kind: "roadmap", slug: "Bad/slug" },
      code: "invalid-roadmap-slug",
    },
  ];
  for (const { primary, context, code } of semanticCases) {
    for (const modifiers of validModifierVectors) {
      expect(resolveImproveRoute(request(primary, context, modifiers))).toEqual({
        outcome: "refused",
        code,
        detail: code,
        target: null,
        targetArguments: [],
        mutations: [],
      });
    }
  }

  for (const modifiers of validModifierVectors) {
    expect(
      resolveImproveRoute({
        primaries: [{ kind: "ask", question: "why" }, { kind: "next" }],
        modifiers,
        context: repository,
      }),
    ).toMatchObject({ outcome: "refused", code: "multiple-primary-selectors", targetArguments: [] });
  }

  for (const modifiers of [["--deep"], ["--deep", "--batch"], ["--batch", "--deep"]]) {
    expect(resolveImproveRoute(request({ kind: "quick" }, repository, modifiers))).toMatchObject({
      outcome: "refused",
      code: "mutually-exclusive-depth",
      alternatives: ["tailrocks-improve quick", "tailrocks-improve-deep"],
      targetArguments: [],
    });
    expect(resolveImproveRoute(request({ kind: "seed", finding: "F-1" }, roadmap, modifiers))).toMatchObject({
      outcome: "refused",
      code: "unsupported-modifier",
      targetArguments: [],
    });
  }

  for (const modifiers of [
    ["--batch", "--batch"],
    ["--deep", "--deep"],
    ["--deep", "--batch", "--deep"],
    ["--batch", "--deep", "--batch"],
  ]) {
    expect(resolveImproveRoute(request(null, repository, modifiers))).toMatchObject({
      outcome: "refused",
      code: "duplicate-modifier",
      targetArguments: [],
    });
  }
  for (const modifiers of [
    ["--other", "--batch"],
    ["--deep", "--other"],
    ["--deep", "--other", "--deep"],
  ]) {
    expect(resolveImproveRoute(request(null, repository, modifiers))).toMatchObject({
      outcome: "refused",
      code: "unknown-modifier",
      targetArguments: [],
    });
  }
});

test("all primary pairs refuse and resolution is deterministic without input mutation", () => {
  const primaries = [
    { kind: "quick" },
    { kind: "category", category: "tests" },
    { kind: "branch" },
    { kind: "next" },
    { kind: "ask", question: "why" },
    { kind: "design-conformance", medium: "web", subject: "screen" },
    { kind: "plan", description: "fix" },
    { kind: "seed", finding: "F-1" },
    { kind: "execute", plan: "plans/001.md" },
    { kind: "sweep" },
  ];
  for (let left = 0; left < primaries.length; left += 1) {
    for (let right = left + 1; right < primaries.length; right += 1) {
      expect(
        resolveImproveRoute({
          primaries: [primaries[left], primaries[right]],
          modifiers: [],
          context: repository,
        }),
      ).toMatchObject({ code: "multiple-primary-selectors" });
    }
  }
  const input = Object.freeze({
    primaries: Object.freeze([Object.freeze({ kind: "ask", question: "why now" })]),
    modifiers: Object.freeze(["--deep", "--batch"]),
    context: Object.freeze({ kind: "repository" }),
  });
  const first = resolveImproveRoute(input);
  expect(resolveImproveRoute(input)).toEqual(first);
  expect(input).toEqual({
    primaries: [{ kind: "ask", question: "why now" }],
    modifiers: ["--deep", "--batch"],
    context: { kind: "repository" },
  });
});

test("resolver remains pure internal code with no execution dependencies", async () => {
  const source = await readFile(path.join(import.meta.dir, "improve-route-resolver.ts"), "utf8");
  expect(source).not.toMatch(/node:fs|node:child_process|Bun\.spawn|fetch\(|process\.|tailrocks-audit/);
  expect(source).toContain('from "./improve-route-schema"');
});
