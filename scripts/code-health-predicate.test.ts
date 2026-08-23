import { expect, test } from "bun:test";
import { copyFile, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  codeHealthInputSchema,
  codeHealthPredicateSchema,
  evaluateCodeHealthPredicate,
  verifyCodeHealthEntrypoint,
} from "./code-health-predicate";

const numeric = (operation: "audit" | "establish" | "tighten", extra: Record<string, unknown>) => ({
  schema: codeHealthInputSchema,
  kind: "numeric",
  operation,
  oracle: "provider-v1",
  id: "lint-suppressions",
  measured: 6,
  ...extra,
});
const presence = (operation: "audit" | "establish" | "tighten", extra: Record<string, unknown>) => ({
  schema: codeHealthInputSchema,
  kind: "presence",
  operation,
  oracle: "provider-v1",
  measured: ["b", "a"],
  ...extra,
});

test("numeric establish freezes measurement and audit rejects growth or stale generosity", () => {
  expect(evaluateCodeHealthPredicate(numeric("establish", {}))).toMatchObject({
    outcome: "pass",
    next: { bound: 6, oracle: "provider-v1" },
  });
  expect(evaluateCodeHealthPredicate(numeric("audit", { bound: 6 })).outcome).toBe("pass");
  expect(evaluateCodeHealthPredicate(numeric("audit", { bound: 5 })).violations).toEqual([
    { id: "lint-suppressions", code: "numeric_growth" },
  ]);
  expect(evaluateCodeHealthPredicate(numeric("audit", { bound: 7 })).violations).toEqual([
    { id: "lint-suppressions", code: "numeric_stale_bound" },
  ]);
});

test("numeric tighten accepts only the exact measured lower bound", () => {
  expect(
    evaluateCodeHealthPredicate(
      numeric("tighten", { bound: 10, proposed: 6, proposedOracle: "provider-v1" }),
    ),
  ).toMatchObject({
    outcome: "pass",
    next: { bound: 6, oracle: "provider-v1" },
  });
  for (const [bound, proposed, codes] of [
    [10, 10, ["tighten_not_exact", "tighten_not_lower"]],
    [10, 11, ["tighten_not_exact", "tighten_not_lower"]],
    [10, 5, ["tighten_not_exact"]],
  ] as const)
    expect(
      evaluateCodeHealthPredicate(
        numeric("tighten", { bound, proposed, proposedOracle: "provider-v1" }),
      ).violations.map(({ code }) => code),
    ).toEqual(codes);
  expect(
    evaluateCodeHealthPredicate(numeric("tighten", { bound: 10, proposed: 6, proposedOracle: "provider-v2" }))
      .violations,
  ).toContainEqual({ id: "lint-suppressions", code: "tighten_oracle_changed" });
});

test("presence establish and audit use stable exact identity sets", () => {
  expect(evaluateCodeHealthPredicate(presence("establish", {}))).toMatchObject({
    outcome: "pass",
    next: { keys: ["a", "b"], oracle: "provider-v1" },
  });
  expect(evaluateCodeHealthPredicate(presence("audit", { listed: ["b", "a"] })).outcome).toBe("pass");
  expect(
    evaluateCodeHealthPredicate({
      ...presence("audit", { listed: ["a", "stale"] }),
      measured: ["new", "a"],
    }).violations,
  ).toEqual([
    { id: "new", code: "presence_unlisted" },
    { id: "stale", code: "presence_stale" },
  ]);
});

test("presence tighten removes resolved identities and refuses same, additions, or inexact proposals", () => {
  expect(
    evaluateCodeHealthPredicate({
      ...presence("tighten", {
        listed: ["a", "b", "c"],
        proposed: ["b", "a"],
        proposedOracle: "provider-v1",
      }),
      measured: ["a", "b"],
    }),
  ).toMatchObject({ outcome: "pass", next: { keys: ["a", "b"], oracle: "provider-v1" } });
  expect(
    evaluateCodeHealthPredicate(
      presence("tighten", {
        listed: ["a", "b"],
        proposed: ["a", "b"],
        proposedOracle: "provider-v1",
      }),
    ).violations.map(({ code }) => code),
  ).toContain("tighten_not_lower");
  expect(
    evaluateCodeHealthPredicate(
      presence("tighten", {
        listed: ["a", "b"],
        proposed: ["a", "new"],
        proposedOracle: "provider-v1",
      }),
    ).violations.map(({ code }) => code),
  ).toContain("tighten_adds_debt");
  expect(
    evaluateCodeHealthPredicate(
      presence("tighten", {
        listed: ["a", "b", "c"],
        proposed: ["a"],
        proposedOracle: "provider-v1",
      }),
    ).violations.map(({ code }) => code),
  ).toContain("tighten_not_exact");
});

test("version predicate classifies latest stable, lag, prerelease, incompatibility, vulnerability, and delay", () => {
  const receipt = evaluateCodeHealthPredicate({
    schema: codeHealthInputSchema,
    kind: "version",
    entries: [
      {
        id: "vulnerable",
        current: "1.0.0",
        latestStable: "1.4.0",
        highestFixed: "1.2.0",
        compatible: true,
        delayed: true,
      },
      {
        id: "current",
        current: "2.0.0",
        latestStable: "2.0.0",
        highestFixed: null,
        compatible: true,
        delayed: false,
      },
      {
        id: "behind",
        current: "1.0.0",
        latestStable: "1.1.0",
        highestFixed: null,
        compatible: true,
        delayed: false,
      },
      {
        id: "blocked",
        current: "1.0.0",
        latestStable: "2.0.0",
        highestFixed: null,
        compatible: false,
        delayed: false,
      },
      {
        id: "preview",
        current: "3.0.0-rc.1",
        latestStable: "2.9.0",
        highestFixed: null,
        compatible: true,
        delayed: false,
      },
    ],
  });
  expect(receipt.versions).toEqual([
    { id: "behind", state: "behind" },
    { id: "blocked", state: "blocked" },
    { id: "current", state: "current" },
    { id: "preview", state: "prerelease" },
    { id: "vulnerable", state: "vulnerable" },
  ]);
  expect(receipt.violations).toEqual([
    { id: "behind", code: "version_behind" },
    { id: "blocked", code: "version_blocked" },
    { id: "preview", code: "version_prerelease" },
    { id: "vulnerable", code: "version_delay_forbidden" },
    { id: "vulnerable", code: "version_vulnerable" },
  ]);
});

test("closed schemas reject malformed, duplicate, overflow, and unstable comparison sources", () => {
  for (const value of [
    numeric("audit", { bound: Number.MAX_SAFE_INTEGER + 1 }),
    { ...presence("audit", { listed: ["a", "a"] }), measured: ["a"] },
    {
      schema: codeHealthInputSchema,
      kind: "version",
      entries: [
        {
          id: "x",
          current: "1.0.0",
          latestStable: "2.0.0-rc.1",
          highestFixed: null,
          compatible: true,
          delayed: false,
        },
      ],
    },
    {
      schema: codeHealthInputSchema,
      kind: "version",
      entries: [
        {
          id: "x",
          current: "1.0.0",
          latestStable: "1.5.0",
          highestFixed: "2.0.0",
          compatible: true,
          delayed: false,
        },
      ],
    },
    {
      schema: codeHealthInputSchema,
      kind: "version",
      entries: [
        {
          id: "x",
          current: "1.0.0",
          latestStable: "1.0.0",
          highestFixed: null,
          compatible: true,
          delayed: false,
        },
        {
          id: "x",
          current: "1.0.0",
          latestStable: "1.0.0",
          highestFixed: null,
          compatible: true,
          delayed: false,
        },
      ],
    },
    {
      schema: codeHealthInputSchema,
      kind: "version",
      entries: [
        {
          id: "x",
          current: "1.0.0-01",
          latestStable: "1.0.0",
          highestFixed: null,
          compatible: true,
          delayed: false,
        },
      ],
    },
    {
      schema: codeHealthInputSchema,
      kind: "presence",
      operation: "audit",
      listed: [],
      measured: [],
      extra: true,
    },
  ])
    expect(evaluateCodeHealthPredicate(value)).toMatchObject({ outcome: "refused", code: "invalid_input" });
});

test("predicate is mutation-free against temporary fixture bytes", async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "code-health-predicate-")));
  const fixture = path.join(root, "ratchet.toml");
  await writeFile(fixture, "bound = 7\n");
  const before = await readFile(fixture, "utf8");
  evaluateCodeHealthPredicate(numeric("audit", { bound: 7 }));
  expect(await readFile(fixture, "utf8")).toBe(before);
});

test("installed standalone CLI emits one typed receipt with bounded input", async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "code-health-installed-")));
  const installed = path.join(root, "code-health-predicate.ts");
  await copyFile(path.resolve(import.meta.dir, "code-health-predicate.ts"), installed);
  const child = Bun.spawn([process.execPath, installed], { stdin: "pipe", stdout: "pipe", stderr: "pipe" });
  child.stdin.write(JSON.stringify(numeric("establish", {})));
  child.stdin.end();
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  expect(code).toBe(0);
  expect(stderr).toBe("");
  expect(stdout.trim().split("\n")).toHaveLength(1);
  expect(JSON.parse(stdout)).toMatchObject({ schema: codeHealthPredicateSchema, outcome: "pass" });

  const oversized = Bun.spawn([process.execPath, installed], { stdin: "pipe", stdout: "pipe" });
  oversized.stdin.write(" ".repeat(1_000_001));
  oversized.stdin.end();
  expect(await oversized.exited).toBe(2);
  expect(JSON.parse(await new Response(oversized.stdout).text())).toMatchObject({
    outcome: "refused",
    code: "invalid_input",
  });

  await rm(installed);
  await symlink(path.resolve(import.meta.dir, "code-health-predicate.ts"), installed);
  await expect(verifyCodeHealthEntrypoint(installed)).rejects.toThrow("unsafe installed code-health file");
});
