import { expect, test } from "bun:test";
import { cp, mkdir, mkdtemp, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  mergePullRequest,
  mergeRequestSchema,
  mergeReceiptSchema,
  type MergeCommandRequest,
  type MergeCommandResult,
  type MergeRequest,
} from "./merge-pr-core";

interface Fixture {
  readonly root: string;
  readonly base: string;
  readonly head: string;
}

async function execute(command: readonly string[], cwd: string): Promise<MergeCommandResult> {
  const child = Bun.spawn(command, { cwd, stdin: "ignore", stdout: "pipe", stderr: "pipe" });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  return { code, stdout, stderr };
}

async function fixture(kind: "covered" | "stale-docs" | "delivery"): Promise<Fixture> {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "merge-pr-")));
  const git = async (...args: string[]) => {
    const result = await execute(["git", ...args], root);
    if (result.code !== 0) throw new Error(result.stderr);
    return result.stdout.trim();
  };
  await git("init", "-b", "main");
  await git("config", "user.name", "Fixture");
  await git("config", "user.email", "fixture@example.test");
  await writeFile(path.join(root, "README.md"), "# Fixture\n");
  if (kind === "delivery") {
    await mkdir(path.join(root, "roadmap/item/verification"), { recursive: true });
    await mkdir(path.join(root, "roadmap/item/plan"), { recursive: true });
    await writeFile(
      path.join(root, "roadmap/README.md"),
      "| Item | Status |\n|---|---|\n| [item](item/README.md) | IN EXECUTION |\n",
    );
    await writeFile(
      path.join(root, "roadmap/item/README.md"),
      "# Item\n\n- **Status**: IN EXECUTION\n\n## Remaining\n",
    );
    await writeFile(
      path.join(root, "roadmap/item/plan/README.md"),
      "| ID | Status |\n|---|---|\n| 001 | DONE |\n",
    );
    await writeFile(path.join(root, "roadmap/item/verification/01-report.md"), "## Blocking defects\n");
  }
  await git("add", ".");
  await git("commit", "-m", "chore: base");
  const base = await git("rev-parse", "HEAD");
  if (kind === "delivery") {
    await rm(path.join(root, "roadmap"), { recursive: true });
    await mkdir(path.join(root, "delivery"));
    await writeFile(path.join(root, "delivery/item.md"), "# Delivered item\n");
    await git("add", "-A");
    await git("commit", "-m", "chore: retire delivered item");
  } else {
    await writeFile(path.join(root, "app.ts"), "export const value = 1;\n");
    await git("add", "app.ts");
    await git("commit", "-m", "feat: behavior");
    await writeFile(path.join(root, "README.md"), "# Fixture\n\nCurrent behavior.\n");
    await git("add", "README.md");
    await git("commit", "-m", "docs: cover behavior", "-m", "Tailrocks-Skill: tailrocks-document");
    if (kind === "stale-docs") {
      await writeFile(path.join(root, "README.md"), "# Fixture\n\nStale later docs.\n");
      await git("add", "README.md");
      await git("commit", "-m", "docs: stale later edit");
    } else {
      await writeFile(path.join(root, "app.test.ts"), "export {};\n");
      await git("add", "app.test.ts");
      await git("commit", "-m", "test: proof");
    }
  }
  return { root, base, head: await git("rev-parse", "HEAD") };
}

function check(bucket: "pass" | "fail" | "pending" | "cancel", name = "build") {
  return { bucket, link: "https://github.com/check/1", name, state: bucket, workflow: "ci" };
}

class MockGitHub {
  merged = false;
  mergeCalls: MergeCommandRequest[] = [];
  checks = [check("pass")];
  title = "Ship exact behavior";
  body = "## Summary\n\nExact behavior.\n";
  mergeResult?: MergeCommandResult;
  proveMerge = true;

  constructor(readonly fixture: Fixture) {}

  readonly run = async (request: MergeCommandRequest): Promise<MergeCommandResult> => {
    const { command, cwd } = request;
    if (command[0] !== "gh") return execute(command, cwd);
    if (command[1] === "repo") return { code: 0, stdout: '{"nameWithOwner":"owner/repository"}', stderr: "" };
    if (command[1] === "pr" && command[2] === "checks") {
      const hasPending = this.checks.some((item) => item.bucket === "pending");
      const hasFailure = this.checks.some((item) => item.bucket === "fail" || item.bucket === "cancel");
      return {
        code: hasPending ? 8 : hasFailure ? 1 : 0,
        stdout: JSON.stringify(this.checks),
        stderr: "",
      };
    }
    if (command[1] === "api") {
      this.mergeCalls.push(request);
      if (this.mergeResult) return this.mergeResult;
      if (this.proveMerge) this.merged = true;
      return {
        code: 0,
        stdout: JSON.stringify({
          data: {
            mergePullRequest: {
              pullRequest: {
                number: 7,
                merged: true,
                mergedAt: "2026-08-23T12:00:00Z",
                headRefOid: this.fixture.head,
                baseRefOid: this.fixture.base,
                mergeCommit: { oid: "f".repeat(40) },
              },
            },
          },
        }),
        stderr: "",
      };
    }
    if (command[1] === "pr" && command[2] === "view") {
      const fields = command.at(-1);
      if (fields === "number,state,headRefOid,baseRefOid")
        return {
          code: 0,
          stdout: JSON.stringify({
            number: 7,
            state: this.merged ? "MERGED" : "OPEN",
            headRefOid: this.fixture.head,
            baseRefOid: this.fixture.base,
          }),
          stderr: "",
        };
      if (fields === "number,state,headRefOid,baseRefOid,id,title,body")
        return {
          code: 0,
          stdout: JSON.stringify({
            number: 7,
            state: "OPEN",
            headRefOid: this.fixture.head,
            baseRefOid: this.fixture.base,
            id: "PR_fixture_7",
            title: this.title,
            body: this.body,
          }),
          stderr: "",
        };
      if (fields === "number,state,headRefOid,baseRefOid,mergedAt,mergeCommit")
        return {
          code: 0,
          stdout: JSON.stringify({
            number: 7,
            state: this.merged ? "MERGED" : "OPEN",
            headRefOid: this.fixture.head,
            baseRefOid: this.fixture.base,
            mergedAt: this.merged ? "2026-08-23T12:00:00Z" : null,
            mergeCommit: this.merged ? { oid: "f".repeat(40) } : null,
          }),
          stderr: "",
        };
    }
    return { code: 127, stdout: "", stderr: `unexpected command: ${command.join(" ")}` };
  };
}

function request(fixture: Fixture, overrides: Partial<MergeRequest> = {}): MergeRequest {
  return {
    schema: mergeRequestSchema,
    root: fixture.root,
    repository: "owner/repository",
    pr: 7,
    head: fixture.head,
    base: fixture.base,
    mergeBase: fixture.base,
    method: "squash",
    expectedTitle: "Ship exact behavior",
    expectedBody: "## Summary\n\nExact behavior.\n",
    mergeSubject: "feat: ship exact behavior (#7)",
    mergeBody: "Ship exact behavior with current documentation.\n",
    blastRadius: "normal",
    highBlastRadiusConfirmed: false,
    waivers: [],
    ...overrides,
  };
}

test("real covered history and mocked hosting produce one exact merge receipt", async () => {
  const built = await fixture("covered");
  const host = new MockGitHub(built);
  const receipt = await mergePullRequest(request(built), { runner: host.run });
  expect(receipt).toMatchObject({
    schema: mergeReceiptSchema,
    outcome: "success",
    code: "merged",
    repository: "owner/repository",
    pr: 7,
    head: built.head,
    mergeAttempted: true,
    proof: {
      merged: true,
      headRefOid: built.head,
      mergeCommit: { oid: "f".repeat(40) },
      method: "squash",
      commitText: "applied",
    },
  });
  expect(receipt.titleDigest).toHaveLength(64);
  expect(receipt.prBodyDigest).toHaveLength(64);
  expect(receipt.subjectDigest).toHaveLength(64);
  expect(receipt.bodyDigest).toHaveLength(64);
  expect(host.mergeCalls).toHaveLength(1);
  expect(host.mergeCalls[0]!.command).toEqual(["gh", "api", "graphql", "--input", "-"]);
  expect(JSON.parse(host.mergeCalls[0]!.stdin!).variables.input).toEqual({
    pullRequestId: "PR_fixture_7",
    expectedHeadOid: built.head,
    mergeMethod: "SQUASH",
    commitHeadline: "feat: ship exact behavior (#7)",
    commitBody: "Ship exact behavior with current documentation.\n",
  });
});

test("real retirement history reaches the same guarded merge seam", async () => {
  const built = await fixture("delivery");
  const host = new MockGitHub(built);
  const receipt = await mergePullRequest(request(built), { runner: host.run });
  expect(receipt.outcome).toBe("success");
  expect(receipt.preflight?.delivery).toMatchObject({ touched: true, status: "pass", findings: [] });
  expect(host.mergeCalls).toHaveLength(1);
});

test("rebase receipt never claims GitHub applied custom merge text", async () => {
  const built = await fixture("covered");
  const host = new MockGitHub(built);
  const receipt = await mergePullRequest(request(built, { method: "rebase" }), { runner: host.run });
  expect(receipt).toMatchObject({
    outcome: "success",
    method: "rebase",
    proof: { method: "rebase", commitText: "not_applicable_for_rebase" },
  });
  expect(JSON.parse(host.mergeCalls[0]!.stdin!).variables.input).toEqual({
    pullRequestId: "PR_fixture_7",
    expectedHeadOid: built.head,
    mergeMethod: "REBASE",
  });
});

test("three non-certifying histories and receipts never reach merge", async () => {
  const pending = await fixture("covered");
  const pendingHost = new MockGitHub(pending);
  pendingHost.checks = [check("pending")];
  expect((await mergePullRequest(request(pending), { runner: pendingHost.run })).code).toBe(
    "preflight_blocked",
  );
  expect(pendingHost.mergeCalls).toHaveLength(0);

  const stale = await fixture("stale-docs");
  const staleHost = new MockGitHub(stale);
  expect((await mergePullRequest(request(stale), { runner: staleHost.run })).code).toBe("preflight_blocked");
  expect(staleHost.mergeCalls).toHaveLength(0);

  const metadata = await fixture("covered");
  const metadataHost = new MockGitHub(metadata);
  metadataHost.title = "Stale title";
  expect((await mergePullRequest(request(metadata), { runner: metadataHost.run })).code).toBe(
    "metadata_mismatch",
  );
  expect(metadataHost.mergeCalls).toHaveLength(0);
});

test("a reasoned waiver is exact to the currently blocking static gate", async () => {
  const stale = await fixture("stale-docs");
  const host = new MockGitHub(stale);
  const waived = await mergePullRequest(
    request(stale, {
      waivers: [{ gate: "documentation", reason: "User explicitly waived documentation for this PR." }],
    }),
    { runner: host.run },
  );
  expect(waived.outcome).toBe("success");
  expect(host.mergeCalls).toHaveLength(1);

  const covered = await fixture("covered");
  const coveredHost = new MockGitHub(covered);
  const unused = await mergePullRequest(
    request(covered, {
      waivers: [{ gate: "documentation", reason: "This gate is not currently blocking." }],
    }),
    { runner: coveredHost.run },
  );
  expect(unused.code).toBe("authority_missing");
  expect(coveredHost.mergeCalls).toHaveLength(0);
});

test("admin bypass is exact-name and high-confirmation bound", async () => {
  const built = await fixture("covered");
  const host = new MockGitHub(built);
  host.checks = [check("fail", "security")];
  const denied = await mergePullRequest(
    request(built, { blastRadius: "high", adminCheck: "security", highBlastRadiusConfirmed: false }),
    { runner: host.run },
  );
  expect(denied.code).toBe("authority_missing");
  expect(host.mergeCalls).toHaveLength(0);
  const wrong = await mergePullRequest(
    request(built, { blastRadius: "high", adminCheck: "build", highBlastRadiusConfirmed: true }),
    { runner: host.run },
  );
  expect(wrong.code).toBe("preflight_blocked");
  expect(host.mergeCalls).toHaveLength(0);
  const approved = await mergePullRequest(
    request(built, { blastRadius: "high", adminCheck: "security", highBlastRadiusConfirmed: true }),
    { runner: host.run },
  );
  expect(approved.outcome).toBe("success");
  expect(JSON.parse(host.mergeCalls[0]!.stdin!).variables.input).toMatchObject({
    expectedHeadOid: built.head,
    mergeMethod: "SQUASH",
  });
});

test("uncertain or malformed mutation receipts never certify a competing merge", async () => {
  const unknown = await fixture("covered");
  const unknownHost = new MockGitHub(unknown);
  unknownHost.mergeResult = { code: 124, stdout: "", stderr: "command timed out", timedOut: true };
  const uncertain = await mergePullRequest(request(unknown), { runner: unknownHost.run });
  expect(uncertain).toMatchObject({ outcome: "uncertain", code: "merge_uncertain" });
  expect(unknownHost.mergeCalls).toHaveLength(1);

  const wrong = await fixture("covered");
  const wrongHost = new MockGitHub(wrong);
  wrongHost.mergeResult = {
    code: 0,
    stdout: JSON.stringify({
      data: { mergePullRequest: { pullRequest: { merged: true, method: "merge" } } },
    }),
    stderr: "",
  };
  const malformed = await mergePullRequest(request(wrong), { runner: wrongHost.run });
  expect(malformed).toMatchObject({ outcome: "uncertain", code: "merge_uncertain" });
  expect(wrongHost.mergeCalls).toHaveLength(1);
});

test("stale target and malformed request refuse before merge", async () => {
  const built = await fixture("covered");
  const host = new MockGitHub(built);
  const stale = await mergePullRequest(request(built, { head: "0".repeat(40) }), { runner: host.run });
  expect(stale.code).toBe("target_mismatch");
  expect(host.mergeCalls).toHaveLength(0);
  const malformed = await mergePullRequest({ ...request(built), extra: true }, { runner: host.run });
  expect(malformed.code).toBe("invalid_request");
  expect(host.mergeCalls).toHaveLength(0);
});

test("installed loader accepts its exact package and refuses dependency symlinks before imports", async () => {
  const plugin = await realpath(await mkdtemp(path.join(tmpdir(), "merge-pr-loader-")));
  const scripts = path.join(plugin, "scripts");
  const skillDirectory = path.join(plugin, "skills/tailrocks-merge-pr");
  await mkdir(scripts);
  await mkdir(skillDirectory, { recursive: true });
  await writeFile(path.join(skillDirectory, "SKILL.md"), "# Installed merge skill\n");
  for (const name of [
    "merge-pr.ts",
    "merge-pr-core.ts",
    "merge-preflight.ts",
    "bounded-command.ts",
    "documentation-discovery.ts",
  ])
    await cp(path.join(import.meta.dir, name), path.join(scripts, name));
  const entrypoint = path.join(scripts, "merge-pr.ts");
  const skillFile = path.join(skillDirectory, "SKILL.md");
  const accepted = Bun.spawn([process.execPath, entrypoint, "--skill-file", skillFile], {
    stdin: new Blob(["{}"]),
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(await accepted.exited).toBe(2);
  expect(JSON.parse(await new Response(accepted.stdout).text())).toMatchObject({
    code: "invalid_request",
    detail: "request has unknown or missing keys",
  });

  await rm(path.join(scripts, "merge-pr-core.ts"));
  await symlink(path.join(import.meta.dir, "merge-pr-core.ts"), path.join(scripts, "merge-pr-core.ts"));
  const refused = Bun.spawn([process.execPath, entrypoint, "--skill-file", skillFile], {
    stdin: new Blob([JSON.stringify(request(await fixture("covered")))]),
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(await refused.exited).toBe(2);
  expect(JSON.parse(await new Response(refused.stdout).text())).toMatchObject({
    code: "invalid_request",
    mergeAttempted: false,
    detail: "installed merge package is unsafe",
    commands: [],
  });

  const lookalike = path.join(plugin, "skills/lookalike/SKILL.md");
  await mkdir(path.dirname(lookalike), { recursive: true });
  await writeFile(lookalike, "# Lookalike\n");
  const wrongLoader = Bun.spawn([process.execPath, entrypoint, "--skill-file", lookalike], {
    stdin: new Blob(["{}"]),
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(await wrongLoader.exited).toBe(2);
  expect(JSON.parse(await new Response(wrongLoader.stdout).text())).toMatchObject({
    code: "invalid_request",
    mergeAttempted: false,
    detail: "loader skill does not own merge transaction",
    commands: [],
  });
});
