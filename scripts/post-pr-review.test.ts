import { expect, test } from "bun:test";
import { chmod, mkdtemp, readFile, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  postPreparedReview,
  postReviewSchema,
  preparePostReview,
  reviewReportSchema,
  type ReviewRunner,
  type RunResult,
} from "./post-pr-review";

const head = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

async function temporary(prefix: string): Promise<string> {
  return realpath(await mkdtemp(path.join(tmpdir(), prefix)));
}

interface Comment {
  body: string;
  user: { login: string };
}

class FakeGitHub {
  actor = "reviewer";
  localHead = head;
  remoteHead = head;
  state = "OPEN";
  repository = "owner/repository";
  inline: Comment[] = [];
  issues: Comment[] = [];
  failPost = 0;
  malformedPost = false;
  changedResponseBody = false;
  omitStartProof = false;
  changeHeadAfterPost = false;
  readonly requests: { command: string[]; stdin?: string }[] = [];

  constructor(readonly root: string) {}

  readonly run: ReviewRunner = async ({ command, stdin }) => {
    const args = [...command];
    this.requests.push({ command: args, stdin });
    const key = args.join(" ");
    if (key === "git rev-parse --show-toplevel") return ok(`${this.root}\n`);
    if (key === "git rev-parse HEAD") return ok(`${this.localHead}\n`);
    if (key === "gh repo view --json nameWithOwner")
      return ok(JSON.stringify({ nameWithOwner: this.repository }));
    if (key === "gh api user --jq .login") return ok(`${this.actor}\n`);
    if (args[0] === "gh" && args[1] === "pr" && args[2] === "view")
      return ok(
        JSON.stringify({
          state: this.state,
          headRefOid: this.remoteHead,
          url: "https://github.com/owner/repository/pull/7",
        }),
      );
    if (args[0] === "gh" && args[1] === "api" && args.length === 3) {
      if (args[2]!.includes("/pulls/7/comments?")) return ok(JSON.stringify(this.inline));
      if (args[2]!.includes("/issues/7/comments?")) return ok(JSON.stringify(this.issues));
    }
    if (args[0] === "gh" && args[1] === "api" && args[2] === "--method") {
      if (this.failPost > 0 && --this.failPost === 0) return fail("injected post failure");
      const payload = JSON.parse(stdin!) as { body: string };
      const target = args[4]!.includes("/pulls/") ? this.inline : this.issues;
      target.push({ body: payload.body, user: { login: this.actor } });
      const id = this.inline.length + this.issues.length;
      if (this.changeHeadAfterPost) this.remoteHead = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
      if (this.malformedPost) return ok(JSON.stringify({ id }));
      const response: Record<string, unknown> = {
        id,
        html_url: `https://github.com/comment/${id}`,
        ...payload,
        ...(this.changedResponseBody ? { body: "different response body" } : {}),
      };
      if (this.omitStartProof) {
        delete response.start_line;
        delete response.start_side;
      }
      return ok(JSON.stringify(response));
    }
    return fail(`unexpected command: ${key}`);
  };
}

function ok(stdout = ""): RunResult {
  return { code: 0, stdout, stderr: "" };
}

function fail(stderr: string): RunResult {
  return { code: 1, stdout: "", stderr };
}

function report(findings = 1): Record<string, unknown> {
  return {
    schema: reviewReportSchema,
    target: { repository: "owner/repository", number: 7, headSha: head },
    verdict: "blocked",
    findings: Array.from({ length: findings }, (_, index) => ({
      id: `BUG_${index + 1}`,
      path: `src/file-${index + 1}.ts`,
      line: index + 10,
      side: "RIGHT",
      body: `Verified defect ${index + 1}.`,
    })),
  };
}

async function reportFile(directory: string, value: unknown = report()): Promise<string> {
  const file = path.join(directory, "report.json");
  await writeFile(file, JSON.stringify(value));
  return file;
}

test("prepare is read-only and emits a one-use head/report-bound authority", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  const result = await preparePostReview(root, await reportFile(root), {
    runner: host.run,
    authorityDirectory,
    now: () => 1_000,
  });
  expect(result).toMatchObject({
    schema: postReviewSchema,
    outcome: "prepared",
    code: "prepared",
    repository: "owner/repository",
    pr: 7,
    head,
    actor: "reviewer",
  });
  expect(result.authority).toMatch(/^[0-9a-f-]{36}\.[0-9a-f]{64}$/);
  expect(host.requests.some((request) => request.command.includes("POST"))).toBe(false);
  const challenge = JSON.parse(
    await readFile(path.join(authorityDirectory, `${result.authority!.split(".")[0]}.json`), "utf8"),
  );
  expect(challenge.reportDigest).toBe(result.reportDigest);
});

test("post consumes authority, posts exact inline payload, and replay refuses", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  const runtime = { runner: host.run, authorityDirectory, now: () => 1_000 };
  const prepared = await preparePostReview(root, await reportFile(root), runtime);
  const posted = await postPreparedReview(prepared.authority!, runtime);
  expect(posted).toMatchObject({ outcome: "success", code: "posted" });
  expect(posted.items[0]).toMatchObject({ id: "BUG_1", status: "posted", commentId: 1 });
  const request = host.requests.find((entry) => entry.command.includes("POST"))!;
  const payload = JSON.parse(request.stdin!);
  expect(payload).toMatchObject({ commit_id: head, path: "src/file-1.ts", line: 10, side: "RIGHT" });
  expect(payload.body).toContain(`/blob/${head}/src/file-1.ts#L9-L11`);
  expect((await postPreparedReview(prepared.authority!, runtime)).code).toBe("authority_missing");
});

test("multiline POST response must prove the exact requested range", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  const multiline = report();
  (multiline.findings as Record<string, unknown>[])[0] = {
    ...(multiline.findings as Record<string, unknown>[])[0],
    line: 12,
    startLine: 10,
    startSide: "RIGHT",
  };
  const runtime = { runner: host.run, authorityDirectory, now: () => 1_000 };
  const prepared = await preparePostReview(root, await reportFile(root, multiline), runtime);
  const posted = await postPreparedReview(prepared.authority!, runtime);
  expect(posted).toMatchObject({ outcome: "success", code: "posted" });
  const payload = JSON.parse(host.requests.find((entry) => entry.command.includes("POST"))!.stdin!);
  expect(payload).toMatchObject({ start_line: 10, start_side: "RIGHT", line: 12, side: "RIGHT" });
});

test("multiline POST response missing range proof is uncertain", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  host.omitStartProof = true;
  const multiline = report();
  (multiline.findings as Record<string, unknown>[])[0] = {
    ...(multiline.findings as Record<string, unknown>[])[0],
    line: 12,
    startLine: 10,
    startSide: "RIGHT",
  };
  const runtime = { runner: host.run, authorityDirectory, now: () => 1_000 };
  const prepared = await preparePostReview(root, await reportFile(root, multiline), runtime);
  const result = await postPreparedReview(prepared.authority!, runtime);
  expect(result).toMatchObject({ outcome: "failed", code: "post_uncertain" });
  expect(result.items[0]?.status).toBe("uncertain");
});

test("own markers deduplicate while another actor cannot spoof suppression", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  const runtime = { runner: host.run, authorityDirectory, now: () => 1_000 };
  const first = await preparePostReview(root, await reportFile(root), runtime);
  await postPreparedReview(first.authority!, runtime);
  expect((await preparePostReview(root, await reportFile(root), runtime)).code).toBe("already_posted");

  host.inline[0]!.user.login = "attacker";
  const prepared = await preparePostReview(root, await reportFile(root), runtime);
  expect(prepared.code).toBe("prepared");
});

test("changed local or remote head consumes authority without posting", async () => {
  for (const side of ["local", "remote"] as const) {
    const root = await temporary("post-review-root-");
    const authorityDirectory = await temporary("post-review-auth-");
    await chmod(authorityDirectory, 0o700);
    const host = new FakeGitHub(root);
    const runtime = { runner: host.run, authorityDirectory, now: () => 1_000 };
    const prepared = await preparePostReview(root, await reportFile(root), runtime);
    if (side === "local") host.localHead = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    else host.remoteHead = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const posted = await postPreparedReview(prepared.authority!, runtime);
    expect(posted.code).toBe("head_changed");
    expect(host.requests.some((request) => request.command.includes("POST"))).toBe(false);
  }
});

test("expired authority and changed actor refuse without posting", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  const prepared = await preparePostReview(root, await reportFile(root), {
    runner: host.run,
    authorityDirectory,
    now: () => 1_000,
  });
  expect(
    (
      await postPreparedReview(prepared.authority!, {
        runner: host.run,
        authorityDirectory,
        now: () => 400_000,
      })
    ).code,
  ).toBe("authority_expired");

  const boundary = await preparePostReview(root, await reportFile(root), {
    runner: host.run,
    authorityDirectory,
    now: () => 1_000,
  });
  expect(
    (
      await postPreparedReview(boundary.authority!, {
        runner: host.run,
        authorityDirectory,
        now: () => 301_000,
      })
    ).code,
  ).toBe("authority_expired");

  const second = await preparePostReview(root, await reportFile(root), {
    runner: host.run,
    authorityDirectory,
    now: () => 1_000,
  });
  host.actor = "other-reviewer";
  expect(
    (
      await postPreparedReview(second.authority!, {
        runner: host.run,
        authorityDirectory,
        now: () => 2_000,
      })
    ).code,
  ).toBe("actor_changed");
});

test("strict report schema rejects unknown keys, markers, and contradictory verdicts", async () => {
  const cases = [
    { ...report(), extra: true },
    { ...report(), findings: [{ id: "BUG", path: "../x", line: 1, side: "RIGHT", body: "x" }] },
    {
      ...report(),
      findings: [{ id: "BUG", path: "x", line: 1, side: "RIGHT", body: "<!-- tailrocks-review:v1:" }],
    },
    { ...report(0), verdict: "no_findings" },
    {
      ...report(2),
      findings: [
        { id: "ONE", path: "x", line: 1, side: "RIGHT", body: "same" },
        { id: "TWO", path: "x", line: 1, side: "RIGHT", body: "same" },
      ],
    },
  ];
  for (const value of cases) {
    const root = await temporary("post-review-root-");
    const host = new FakeGitHub(root);
    const result = await preparePostReview(root, await reportFile(root, value), { runner: host.run });
    expect(result.code).toBe("invalid_report");
    expect(host.requests).toEqual([]);
  }
});

test("authority digest rejects persisted challenge tampering", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  const runtime = { runner: host.run, authorityDirectory, now: () => 1_000 };
  const prepared = await preparePostReview(root, await reportFile(root), runtime);
  const challengePath = path.join(authorityDirectory, `${prepared.authority!.split(".")[0]}.json`);
  await writeFile(challengePath, `${await readFile(challengePath, "utf8")} `);
  expect((await postPreparedReview(prepared.authority!, runtime)).code).toBe("authority_missing");
  expect(host.requests.some((request) => request.command.includes("POST"))).toBe(false);
});

test("local repository target mismatch refuses", async () => {
  const root = await temporary("post-review-root-");
  const host = new FakeGitHub(root);
  host.repository = "other/repository";
  expect((await preparePostReview(root, await reportFile(root), { runner: host.run })).code).toBe(
    "target_mismatch",
  );
});

test("clean report posts exactly one issue comment", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  const clean = {
    schema: reviewReportSchema,
    target: { repository: "owner/repository", number: 7, headSha: head },
    verdict: "no_findings",
    findings: [],
    cleanBody: "No findings after correctness and structural review.",
  };
  const runtime = { runner: host.run, authorityDirectory, now: () => 1_000 };
  const prepared = await preparePostReview(root, await reportFile(root, clean), runtime);
  expect((await postPreparedReview(prepared.authority!, runtime)).code).toBe("posted");
  expect(host.inline).toHaveLength(0);
  expect(host.issues).toHaveLength(1);
});

test("partial post is resumable through marker deduplication", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  const runtime = { runner: host.run, authorityDirectory, now: () => 1_000 };
  const file = await reportFile(root, report(2));
  const prepared = await preparePostReview(root, file, runtime);
  host.failPost = 2;
  const partial = await postPreparedReview(prepared.authority!, runtime);
  expect(partial.code).toBe("partial");
  expect(partial.items.map((item) => item.status)).toEqual(["posted", "uncertain"]);
  const resumed = await preparePostReview(root, file, runtime);
  expect(resumed.items.map((item) => item.status)).toEqual(["duplicate", "pending"]);
});

test("mid-sequence head change is partial and stops further posts", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  const runtime = { runner: host.run, authorityDirectory, now: () => 1_000 };
  const prepared = await preparePostReview(root, await reportFile(root, report(2)), runtime);
  host.changeHeadAfterPost = true;
  const result = await postPreparedReview(prepared.authority!, runtime);
  expect(result.code).toBe("partial");
  expect(result.items.map((item) => item.status)).toEqual(["posted", "not_attempted"]);
  expect(host.inline).toHaveLength(1);
});

test("mid-sequence authority expiry is partial and stops further posts", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  const prepared = await preparePostReview(root, await reportFile(root, report(2)), {
    runner: host.run,
    authorityDirectory,
    now: () => 1_000,
  });
  const times = [1_000, 1_000, 1_000, 400_000];
  const result = await postPreparedReview(prepared.authority!, {
    runner: host.run,
    authorityDirectory,
    now: () => times.shift() ?? 400_000,
  });
  expect(result.code).toBe("partial");
  expect(result.items.map((item) => item.status)).toEqual(["posted", "not_attempted"]);
  expect(host.inline).toHaveLength(1);
});

test("authority expiring during target verification stops the next POST", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  const prepared = await preparePostReview(root, await reportFile(root), {
    runner: host.run,
    authorityDirectory,
    now: () => 1_000,
  });
  const times = [1_000, 1_000, 400_000];
  const result = await postPreparedReview(prepared.authority!, {
    runner: host.run,
    authorityDirectory,
    now: () => times.shift() ?? 400_000,
  });
  expect(result.code).toBe("authority_expired");
  expect(result.items.map((item) => item.status)).toEqual(["not_attempted"]);
  expect(host.inline).toHaveLength(0);
});

test("malformed successful POST response is uncertain, never posted proof", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  host.malformedPost = true;
  const runtime = { runner: host.run, authorityDirectory, now: () => 1_000 };
  const prepared = await preparePostReview(root, await reportFile(root), runtime);
  const result = await postPreparedReview(prepared.authority!, runtime);
  expect(result).toMatchObject({ outcome: "failed", code: "post_uncertain" });
  expect(result.items[0]?.status).toBe("uncertain");
});

test("successful POST response with changed body is uncertain", async () => {
  const root = await temporary("post-review-root-");
  const authorityDirectory = await temporary("post-review-auth-");
  await chmod(authorityDirectory, 0o700);
  const host = new FakeGitHub(root);
  host.changedResponseBody = true;
  const runtime = { runner: host.run, authorityDirectory, now: () => 1_000 };
  const prepared = await preparePostReview(root, await reportFile(root), runtime);
  const result = await postPreparedReview(prepared.authority!, runtime);
  expect(result).toMatchObject({ outcome: "failed", code: "post_uncertain" });
  expect(result.items[0]?.status).toBe("uncertain");
});

test("saturated dedupe lookup refuses with zero posting", async () => {
  const root = await temporary("post-review-root-");
  const host = new FakeGitHub(root);
  host.inline = Array.from({ length: 100 }, () => ({ body: "ordinary", user: { login: "reviewer" } }));
  const result = await preparePostReview(root, await reportFile(root), { runner: host.run });
  expect(result.code).toBe("dedupe_saturated");
  expect(host.requests.some((request) => request.command.includes("POST"))).toBe(false);
});

test("CLI malformed invocation returns a typed refusal", async () => {
  const script = path.join(import.meta.dir, "post-pr-review.ts");
  const child = Bun.spawn([process.execPath, script], { stdout: "pipe", stderr: "pipe" });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  expect(code).toBe(2);
  expect(stderr).toBe("");
  expect(JSON.parse(stdout)).toMatchObject({
    schema: postReviewSchema,
    code: "invalid_arguments",
    commands: [],
  });
});
