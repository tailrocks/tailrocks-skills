import { expect, test } from "bun:test";
import { mkdtemp, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  evaluateDelivery,
  evaluateDocumentation,
  mergePreflightSchema,
  runDocumentationCheck,
  runMergePreflight,
  type CommandResult,
  type CommandRunner,
  type CommitState,
  type DeliveryInput,
} from "./merge-preflight";

const base = "a".repeat(40);
const head = "b".repeat(40);
const mergeBase = "c".repeat(40);

async function temporary(): Promise<string> {
  return realpath(await mkdtemp(path.join(tmpdir(), "merge-preflight-")));
}

function ok(stdout = ""): CommandResult {
  return { code: 0, stdout, stderr: "" };
}

class FakeHost {
  remoteHead = head;
  state = "OPEN";
  checks: { bucket: string; link: string; name: string; state: string; workflow: string }[][] = [[]];
  checkCalls = 0;
  diffNameStatus = "";
  readonly trees = new Map<string, string>();
  readonly blobs = new Map<string, string>();
  readonly commands: string[][] = [];

  constructor(readonly root: string) {}

  readonly run: CommandRunner = async ({ command }) => {
    const args = [...command];
    this.commands.push(args);
    const key = args.join(" ");
    if (key === "git rev-parse --show-toplevel") return ok(`${this.root}\n`);
    if (key === "git rev-parse HEAD") return ok(`${head}\n`);
    if (key === "gh repo view --json nameWithOwner") return ok('{"nameWithOwner":"owner/repository"}');
    if (key.startsWith("gh pr view 7 "))
      return ok(
        JSON.stringify({ number: 7, state: this.state, headRefOid: this.remoteHead, baseRefOid: base }),
      );
    if (key === `git merge-base ${base} ${head}`) return ok(`${mergeBase}\n`);
    if (key === `git merge-base ${mergeBase} ${head}`) return ok(`${mergeBase}\n`);
    if (key === `git diff --name-status -z --no-renames ${mergeBase} ${head} --`)
      return ok(this.diffNameStatus);
    if (key === `git ls-tree -r -z ${mergeBase} -- roadmap delivery`)
      return ok(this.trees.get(mergeBase) ?? "");
    if (key === `git ls-tree -r -z ${head} -- roadmap delivery`) return ok(this.trees.get(head) ?? "");
    if (key === `git ls-tree -r -z --full-tree ${mergeBase} --`)
      return ok(`100644 blob ${"d".repeat(40)}\tdocs/app.md\0`);
    if (key === `git ls-tree -r -z --full-tree ${head} --`)
      return ok(
        `100644 blob ${"d".repeat(40)}\tdocs/app.md\0` + `100644 blob ${"e".repeat(40)}\tsrc/app.ts\0`,
      );
    if (args[0] === "git" && args[1] === "show" && args[2]?.includes(":"))
      return ok(this.blobs.get(args[2]) ?? "");
    if (key === `git rev-list --topo-order --reverse ${mergeBase}..${head}`) return ok(`${head}\n`);
    if (key === `git show -s --format=%B ${head}`)
      return ok("docs: cover behavior\n\nTailrocks-Skill: tailrocks-document\n");
    if (key === `git diff --name-only -z --no-renames ${mergeBase} ${head} --`)
      return ok("src/app.ts\0docs/app.md\0");
    if (key === `git show -s --format=%P ${head}`) return ok(`${mergeBase}\n`);
    if (key.startsWith("gh pr checks 7 ")) {
      const value = this.checks[Math.min(this.checkCalls, this.checks.length - 1)]!;
      this.checkCalls += 1;
      return {
        ...ok(JSON.stringify(value)),
        code: value.some((check) => check.bucket === "pending") ? 8 : 0,
      };
    }
    return { code: 127, stdout: "", stderr: `unexpected command: ${key}` };
  };
}

function check(bucket: "pass" | "fail" | "pending" | "skipping" | "cancel") {
  return { bucket, link: "https://github.com/check/1", name: "build", state: bucket, workflow: "ci" };
}

test("ready receipt proves static gates, green checks, final identity, and no mutation", async () => {
  const root = await temporary();
  const host = new FakeHost(root);
  host.checks = [[check("pass")]];
  const receipt = await runMergePreflight({ root, pr: 7, noPoll: false }, { runner: host.run });
  expect(receipt).toMatchObject({
    schema: mergePreflightSchema,
    outcome: "ready",
    code: "ready",
    repository: "owner/repository",
    pr: 7,
    head,
    base,
    mergeBase,
    checkAttempts: 1,
    delivery: { status: "not_applicable", touched: false, findings: [] },
    documentation: { status: "pass", headCovered: true, trailerCommit: head },
  });
  expect(
    host.commands.some((command) =>
      command.some((argument) =>
        /^(merge|edit|push|commit|fetch|reset|checkout|POST|PATCH|DELETE)$/.test(argument),
      ),
    ),
  ).toBe(false);
});

test("no-poll returns terminal pending after one sample", async () => {
  const root = await temporary();
  const host = new FakeHost(root);
  host.checks = [[check("pending")]];
  const receipt = await runMergePreflight({ root, pr: 7, noPoll: true }, { runner: host.run });
  expect(receipt).toMatchObject({ outcome: "pending", code: "checks_pending", checkAttempts: 1 });
});

test("permanent pending stops at 30 samples and 29 exact sleeps", async () => {
  const root = await temporary();
  const host = new FakeHost(root);
  host.checks = [[check("pending")]];
  let clock = 0;
  const sleeps: number[] = [];
  const receipt = await runMergePreflight(
    { root, pr: 7, noPoll: false },
    {
      runner: host.run,
      now: () => clock,
      sleep: async (milliseconds) => {
        sleeps.push(milliseconds);
        clock += milliseconds;
      },
    },
  );
  expect(receipt).toMatchObject({ outcome: "pending", code: "checks_pending", checkAttempts: 30 });
  expect(sleeps).toEqual(Array.from({ length: 29 }, () => 10_000));
  expect(clock).toBe(290_000);
});

test("wall-clock cap is terminal before another ten-second sleep", async () => {
  const root = await temporary();
  const host = new FakeHost(root);
  host.checks = [[check("pending")]];
  let clock = -100_000;
  const sleeps: number[] = [];
  const receipt = await runMergePreflight(
    { root, pr: 7, noPoll: false },
    {
      runner: host.run,
      now: () => (clock += 100_000),
      sleep: async (milliseconds) => void sleeps.push(milliseconds),
    },
  );
  expect(receipt).toMatchObject({ outcome: "pending", code: "checks_pending", checkAttempts: 3 });
  expect(sleeps).toEqual([10_000, 10_000]);
});

test("failed or cancelled required check blocks without sleeping", async () => {
  for (const bucket of ["fail", "cancel"] as const) {
    const root = await temporary();
    const host = new FakeHost(root);
    host.checks = [[check(bucket)]];
    let sleeps = 0;
    const receipt = await runMergePreflight(
      { root, pr: 7, noPoll: false },
      { runner: host.run, sleep: async () => void (sleeps += 1) },
    );
    expect(receipt).toMatchObject({ outcome: "blocked", code: "checks_failed", checkAttempts: 1 });
    expect(sleeps).toBe(0);
  }
});

test("head drift during polling refuses before another check sample", async () => {
  const root = await temporary();
  const host = new FakeHost(root);
  host.checks = [[check("pending")]];
  const receipt = await runMergePreflight(
    { root, pr: 7, noPoll: false },
    {
      runner: host.run,
      now: () => 0,
      sleep: async () => {
        host.remoteHead = "d".repeat(40);
      },
    },
  );
  expect(receipt).toMatchObject({ outcome: "refused", code: "head_changed", checkAttempts: 0 });
  expect(host.checkCalls).toBe(1);
});

test("static blocker samples pending checks once unless bounded continuation is requested", async () => {
  const item = "# Item\n\n- **Status**: DONE\n\n## Remaining\n";
  const index = "| Item | Status |\n|---|---|\n| [item](item/README.md) | DONE |\n";
  for (const continuePolling of [false, true]) {
    const root = await temporary();
    const host = new FakeHost(root);
    host.diffNameStatus = "M\0roadmap/item/README.md\0";
    host.trees.set(
      head,
      `100644 blob ${"1".repeat(40)}\troadmap/README.md\0` +
        `100644 blob ${"2".repeat(40)}\troadmap/item/README.md\0` +
        `100644 blob ${"3".repeat(40)}\troadmap/item/verification/01-report.md\0`,
    );
    host.blobs.set(`${head}:roadmap/README.md`, index);
    host.blobs.set(`${head}:roadmap/item/README.md`, item);
    host.blobs.set(`${head}:roadmap/item/verification/01-report.md`, "## Blocking defects\n");
    host.checks = continuePolling ? [[check("pending")], [check("pass")]] : [[check("pending")]];
    let sleeps = 0;
    const receipt = await runMergePreflight(
      { root, pr: 7, noPoll: false, pollWithStaticBlockers: continuePolling },
      {
        runner: host.run,
        now: () => 0,
        sleep: async () => void (sleeps += 1),
      },
    );
    expect(receipt).toMatchObject({ outcome: "blocked", code: "delivery_blocked" });
    expect(receipt.checkAttempts).toBe(continuePolling ? 2 : 1);
    expect(sleeps).toBe(continuePolling ? 1 : 0);
  }
});

async function fixture(name: string): Promise<{ input: DeliveryInput; expected: unknown[] }> {
  const value = (await Bun.file(
    path.join(import.meta.dir, "merge-preflight", "testdata", name, "input.json"),
  ).json()) as {
    changed: DeliveryInput["changed"];
    baseFiles: Record<string, string>;
    headFiles: Record<string, string>;
    expected: unknown[];
  };
  return {
    input: {
      changed: value.changed,
      baseFiles: new Map(Object.entries(value.baseFiles)),
      headFiles: new Map(Object.entries(value.headFiles)),
    },
    expected: value.expected,
  };
}

test("delivery fixtures cover finished, premature retirement, in-flight contradiction, and no roadmap", async () => {
  for (const name of ["finished-but-present", "retired-while-unfinished", "work-in-flight", "no-roadmap"]) {
    const loaded = await fixture(name);
    expect(evaluateDelivery(loaded.input).map((finding) => finding.case)).toEqual(loaded.expected);
  }
});

test("delivery emits all six exact contradiction classes", () => {
  const done = "# Item\n\n- **Status**: DONE\n\n## Remaining\n";
  const plan = "| ID | Status |\n|---|---|\n| 001 | DONE |\n";
  const blocked = "## Blocking defects\n\n### B1 — broken\n";
  const findings = evaluateDelivery({
    changed: [
      { status: "M", path: "roadmap/live/README.md" },
      { status: "D", path: "roadmap/old/README.md" },
    ],
    baseFiles: new Map([
      ["roadmap/old/README.md", "# Old\n\n- **Status**: DONE\n\n## Remaining\n\n- Still broken\n"],
      ["roadmap/old/verification/01-report.md", blocked],
    ]),
    headFiles: new Map([
      [
        "roadmap/README.md",
        "| Item | Status |\n|---|---|\n| [live](live/README.md) | DONE |\n| [noverify](noverify/README.md) | DONE |\n| [ghost](ghost/README.md) | DONE |\n",
      ],
      ["roadmap/live/README.md", done],
      ["roadmap/live/plan/README.md", plan],
      ["roadmap/live/verification/01-report.md", blocked],
      ["roadmap/noverify/README.md", done],
    ]),
  });
  expect(new Set(findings.map((finding) => finding.case))).toEqual(new Set([1, 2, 3, 4, 5, 6]));
});

test("delivery avoids partial-deletion retirement and prose defect false positives", () => {
  const item = "# Item\n\n- **Status**: IN EXECUTION\n\n## Remaining\n\n- Work\n";
  expect(
    evaluateDelivery({
      changed: [{ status: "D", path: "roadmap/item/plan/old.md" }],
      baseFiles: new Map([["roadmap/item/README.md", item]]),
      headFiles: new Map([
        ["roadmap/README.md", "| Item | Status |\n|---|---|\n| [item](item/README.md) | IN EXECUTION |\n"],
        ["roadmap/item/README.md", item],
        ["roadmap/item/plan/README.md", "| ID | Status |\n|---|---|\n| 001 | DONE |\n"],
        ["roadmap/item/verification/01-report.md", "## Blocking defects\n\nNo B1 remains.\n"],
      ]),
    }),
  ).toEqual([]);
});

test("deleting an unstarted empty draft needs no delivery report", () => {
  expect(
    evaluateDelivery({
      changed: [{ status: "D", path: "roadmap/draft/README.md" }],
      baseFiles: new Map([["roadmap/draft/README.md", "# Draft\n\n- **Status**: DRAFT\n\n## Remaining\n"]]),
      headFiles: new Map(),
    }),
  ).toEqual([]);
});

test("duplicate roadmap index rows block deterministically", () => {
  const item = "# Item\n\n- **Status**: DRAFT\n\n## Remaining\n\n- Shape it\n";
  const findings = evaluateDelivery({
    changed: [{ status: "M", path: "roadmap/README.md" }],
    baseFiles: new Map(),
    headFiles: new Map([
      [
        "roadmap/README.md",
        "| Item | Status |\n|---|---|\n| [item](item/README.md) | DRAFT |\n| [item](item/README.md) | DRAFT |\n",
      ],
      ["roadmap/item/README.md", item],
    ]),
  });
  expect(findings.map((finding) => finding.case)).toEqual([5]);
});

test("plan completion never comes from another table or a partly malformed status column", () => {
  const item = "# Item\n\n- **Status**: IN EXECUTION\n\n## Remaining\n";
  const findings = evaluateDelivery({
    changed: [{ status: "M", path: "roadmap/item/plan/README.md" }],
    baseFiles: new Map(),
    headFiles: new Map([
      ["roadmap/README.md", "| Item | Status |\n|---|---|\n| [item](item/README.md) | IN EXECUTION |\n"],
      ["roadmap/item/README.md", item],
      [
        "roadmap/item/plan/README.md",
        "| Note | Result |\n|---|---|\n| unrelated | DONE |\n\n| ID | Status |\n|---|---|\n| 001 | DONE |\n| 002 | UNKNOWN |\n",
      ],
    ]),
  });
  expect(findings.map((finding) => finding.case)).toEqual(["invalid_shape"]);
});

function commit(character: string, paths: string[], message: string, parents: string[] = []): CommitState {
  return { sha: character.repeat(40), paths, message, parents };
}

test("documentation predicate uses ancestry, exact trailers, and path evidence", () => {
  const source = commit("1", ["src/app.ts"], "feat: behavior");
  const docs = commit("2", ["docs/app.md"], "docs: cover\n\nTailrocks-Skill: tailrocks-document\n", [
    source.sha,
  ]);
  const tests = commit("3", ["tests/app.test.ts"], "test: proof", [docs.sha]);
  expect(evaluateDocumentation([source, docs, tests], tests.sha)).toMatchObject({
    headCovered: true,
    trailerCommit: docs.sha,
  });

  const laterDocs = commit("4", ["docs/more.md"], "docs: stale later", [docs.sha]);
  expect(evaluateDocumentation([source, docs, laterDocs], laterDocs.sha).headCovered).toBe(false);

  const fake = commit("5", ["docs/app.md"], "mentions Tailrocks-Skill: tailrocks-document inline", [
    source.sha,
  ]);
  expect(evaluateDocumentation([source, fake], fake.sha).headCovered).toBe(false);

  const bodyLine = commit(
    "9",
    ["docs/app.md"],
    "docs: body mention\n\nTailrocks-Skill: tailrocks-document\n\nNot a trailer block.\n",
    [source.sha],
  );
  expect(evaluateDocumentation([source, bodyLine], bodyLine.sha).headCovered).toBe(false);

  const choreSource = commit("6", ["src/config.ts"], "chore: still behavior");
  expect(evaluateDocumentation([choreSource], choreSource.sha).docWorthyCommits).toEqual([choreSource.sha]);

  const siblingTrailer = commit(
    "7",
    ["docs/app.md"],
    "docs: sibling\n\nTailrocks-Skill: tailrocks-document\n",
    [],
  );
  expect(evaluateDocumentation([source, siblingTrailer], siblingTrailer.sha).headCovered).toBe(false);

  const laterSource = commit("8", ["src/later.ts"], "feat: later", [docs.sha]);
  expect(evaluateDocumentation([source, docs, laterSource], laterSource.sha).headCovered).toBe(false);

  const empty = commit("a", [], "chore: empty", [docs.sha]);
  expect(evaluateDocumentation([source, docs, empty], empty.sha).headCovered).toBe(true);
});

test("documentation history fixtures share the executable predicate", async () => {
  for (const name of ["covered", "later-docs", "tests-after", "no-doc-worthy"]) {
    const history = (await Bun.file(
      path.join(
        import.meta.dir,
        "merge-preflight",
        "testdata",
        "documentation-history",
        name,
        "history.json",
      ),
    ).json()) as { commits: CommitState[]; head: string; expected: boolean };
    expect(evaluateDocumentation(history.commits, history.head).headCovered).toBe(history.expected);
  }
});

test("documentation-only command consumes the same predicate without hosting mutation", async () => {
  const root = await temporary();
  const host = new FakeHost(root);
  const receipt = await runDocumentationCheck(root, 7, { runner: host.run });
  expect(receipt).toMatchObject({
    outcome: "ready",
    code: "ready",
    repository: "owner/repository",
    pr: 7,
    head,
    base,
    mergeBase,
  });
  expect(
    host.commands.some((command) =>
      command.some((argument) => /^(merge|edit|POST|PATCH|DELETE)$/.test(argument)),
    ),
  ).toBe(false);
});

test("malformed hosted check data fails closed", async () => {
  const root = await temporary();
  const host = new FakeHost(root);
  host.checks = [[{ ...check("pass"), bucket: "mystery" }]];
  const receipt = await runMergePreflight({ root, pr: 7, noPoll: true }, { runner: host.run });
  expect(receipt).toMatchObject({ outcome: "failed", code: "state_unmatched" });
});

test("duplicate or malformed hosted check identities fail closed", async () => {
  for (const checks of [[check("pass"), check("pass")], [{ ...check("pass"), link: "https://" }]]) {
    const root = await temporary();
    const host = new FakeHost(root);
    host.checks = [checks];
    const receipt = await runMergePreflight({ root, pr: 7, noPoll: true }, { runner: host.run });
    expect(receipt).toMatchObject({ outcome: "failed", code: "state_unmatched" });
  }
});

test("CLI malformed arguments return typed refusal", async () => {
  const child = Bun.spawn([process.execPath, path.join(import.meta.dir, "merge-preflight.ts")], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  expect(code).toBe(2);
  expect(stderr).toBe("");
  expect(JSON.parse(stdout)).toMatchObject({ schema: mergePreflightSchema, code: "invalid_arguments" });
});
