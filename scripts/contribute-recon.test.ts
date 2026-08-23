import { expect, test } from "bun:test";
import path from "node:path";

import {
  canonicalRepository,
  digestReconPlan,
  planRecon,
  reconSchema,
  runRecon,
  type CommandResult,
  type IdentityReader,
  type ReconPlan,
  type RuntimeIdentity,
} from "../skills/tailrocks-contribute-recon/scripts/gh-recon";

const runtimeA: RuntimeIdentity = {
  entrypoint_sha256: "a".repeat(64),
  command_runner_sha256: "b".repeat(64),
};
const runtimeB: RuntimeIdentity = {
  entrypoint_sha256: "c".repeat(64),
  command_runner_sha256: "d".repeat(64),
};
const identityA: IdentityReader = async () => runtimeA;
async function approvedRun(
  args: readonly string[],
  runner: (command: readonly string[]) => Promise<CommandResult>,
  identityReader: IdentityReader = identityA,
) {
  const plan = await planRecon(args, identityReader);
  expect(plan.outcome).toBe("planned");
  return runRecon(args, plan.plan_hash, runner, identityReader);
}

const metadata = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  id: 7,
  full_name: "owner/repo",
  private: false,
  visibility: "public",
  default_branch: "main",
  ...overrides,
});
const ok = (value: unknown = {}): CommandResult => ({
  code: 0,
  stdout: JSON.stringify(value),
  stderr: "",
  timedOut: false,
  saturated: false,
});
const missing = (): CommandResult => ({
  code: 1,
  stdout: 'HTTP/2.0 404 Not Found\r\ncontent-type: application/json\r\n\r\n{"message":"not found"}',
  stderr: "untrusted diagnostic",
  timedOut: false,
  saturated: false,
});

test("repository grammar rejects credential host path and encoding ambiguity", () => {
  expect(canonicalRepository("owner/repo")).toBe("owner/repo");
  expect(canonicalRepository("https://github.com/owner/repo.git")).toBe("owner/repo");
  for (const value of [
    "owner/repo/extra",
    "owner_name/repo",
    "https://GITHUB.com/owner/repo",
    "https://user@github.com/owner/repo",
    "https://github.com:443/owner/repo",
    "https://github.com/owner/repo?x=1",
    "https://github.com/owner/repo#x",
    "https://github.com/owner%2Frepo",
    "git://github.com/owner/repo",
    "owner//repo",
    "owner/repo\nextra",
  ])
    expect(canonicalRepository(value)).toBeNull();
});

test("every request pins GET and github.com and receipt lists the approved batch", async () => {
  const commands: string[][] = [];
  const receipt = await approvedRun(["issue", "owner/repo", "7"], async (command) => {
    commands.push([...command]);
    return commands.length === 1 ? ok(metadata()) : ok({ id: 9, number: 7, body: "report" });
  });
  expect(receipt).toMatchObject({ schema: reconSchema, outcome: "success", code: "scanned" });
  expect(receipt.planned_endpoints).toEqual(["repos/owner/repo", "repos/owner/repo/issues/7"]);
  expect(commands).toEqual(
    receipt.planned_endpoints.map((endpoint) => [
      "gh",
      "api",
      "--method",
      "GET",
      "--hostname",
      "github.com",
      "--include",
      endpoint,
    ]),
  );
  expect(receipt.requests.map(({ outcome }) => outcome)).toEqual(["ok", "ok"]);
  expect(receipt.mutations).toEqual([]);
});

test("private internal and mismatched repositories refuse before subject fetch", async () => {
  for (const project of [
    metadata({ private: true }),
    metadata({ visibility: "internal" }),
    metadata({ full_name: "other/repo" }),
  ]) {
    let calls = 0;
    const receipt = await approvedRun(["issue", "owner/repo", "7"], async () => {
      calls += 1;
      return ok(project);
    });
    expect(receipt).toMatchObject({ outcome: "refused", code: "target_not_public", data: {} });
    expect(calls).toBe(1);
  }
});

test("case aliases bind the canonical public full name", async () => {
  let calls = 0;
  const receipt = await approvedRun(["issue", "Owner/Repo", "7"], async () => {
    calls += 1;
    return calls === 1 ? ok(metadata()) : ok({ id: 9, number: 7 });
  });
  expect(receipt.outcome).toBe("success");
  expect(receipt.target).toBe("owner/repo");
});

test("optional 404 is missing but 403 timeout and invalid JSON are UNKNOWN failures", async () => {
  const absent = await approvedRun(["repo-scan", "owner/repo"], async (_command) =>
    _command.at(-1) === "repos/owner/repo" ? ok(metadata()) : missing(),
  );
  expect(absent.outcome).toBe("success");
  expect((absent.data as { missing: string[] }).missing).toHaveLength(15);
  expect(absent.requests.slice(1).every(({ outcome }) => outcome === "missing")).toBe(true);

  const failures: CommandResult[] = [
    { code: 1, stdout: "", stderr: "403 secret", timedOut: false, saturated: false },
    { code: 124, stdout: "", stderr: "secret", timedOut: true, saturated: false },
    { code: 0, stdout: "not-json", stderr: "secret", timedOut: false, saturated: false },
  ];
  for (const failure of failures) {
    let calls = 0;
    const receipt = await approvedRun(["repo-scan", "owner/repo"], async () => {
      calls += 1;
      return calls === 1 ? ok(metadata()) : failure;
    });
    expect(receipt.outcome).toBe("failed");
    expect(receipt.detail).toContain("UNKNOWN");
    expect(receipt.data as object).toEqual({});
    expect(JSON.stringify(receipt)).not.toContain("secret");
  }
});

test("runner failures are bounded secret-safe receipts", async () => {
  let calls = 0;
  const receipt = await approvedRun(["issue", "owner/repo", "7"], async () => {
    calls += 1;
    if (calls === 1) return ok(metadata());
    return {
      code: 1,
      stdout: "",
      stderr: "credential=super-secret attacker text",
      timedOut: false,
      saturated: false,
    };
  });
  expect(receipt).toMatchObject({ outcome: "failed", code: "lookup_failed", data: {}, mutations: [] });
  expect(JSON.stringify(receipt)).not.toContain("super-secret");
});

test("successful bodies are projected and secret-shaped values are redacted", async () => {
  let calls = 0;
  const secret = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456";
  const receipt = await approvedRun(["issue", "owner/repo", "7"], async () => {
    calls += 1;
    return calls === 1
      ? ok(metadata({ token: secret, irrelevant: "drop me" }))
      : ok({ id: 9, number: 7, title: "Bug", body: `token=${secret}`, unknown: secret });
  });
  const serialized = JSON.stringify(receipt);
  expect(receipt.outcome).toBe("success");
  expect(serialized).not.toContain(secret);
  expect(serialized).not.toContain("drop me");
  expect(serialized).toContain("[REDACTED]");
});

test("aggregate response volume fails before an unbounded repository scan", async () => {
  let calls = 0;
  const huge = "x".repeat(300_000);
  const receipt = await approvedRun(["repo-scan", "owner/repo"], async () => {
    calls += 1;
    return calls === 1 ? ok(metadata()) : ok({ body: huge });
  });
  expect(receipt.outcome).toBe("failed");
  expect(receipt.errors).toContain("aggregate output limit reached");
  expect(receipt.requests.length).toBeLessThanOrEqual(16);
  expect(receipt.data).toEqual({});
});

test("zero-network plan binds canonical target endpoints and runtime identities", async () => {
  let identityReads = 0;
  const plan = await planRecon(["issue", "Owner/Repo", "7"], async () => {
    identityReads += 1;
    return runtimeA;
  });
  expect(identityReads).toBe(1);
  expect(plan).toMatchObject({
    outcome: "planned",
    target: "Owner/Repo",
    subject: "7",
    method: "GET",
    host: "github.com",
    runtime: runtimeA,
    mutations: [],
  });
  expect(plan.endpoints).toEqual(["repos/Owner/Repo", "repos/Owner/Repo/issues/7"]);
  expect(plan.plan_hash).toMatch(/^[a-f0-9]{64}$/);
});

test("stale target or subject approval refuses before any GET", async () => {
  const approved = await planRecon(["issue", "owner/repo", "7"], identityA);
  for (const changed of [
    ["issue", "other/repo", "7"],
    ["issue", "owner/repo", "8"],
  ]) {
    let calls = 0;
    const receipt = await runRecon(
      changed,
      approved.plan_hash,
      async () => {
        calls += 1;
        return ok(metadata());
      },
      identityA,
    );
    expect(receipt).toMatchObject({ outcome: "refused", code: "invalid_arguments", requests: [] });
    expect(receipt.detail).toContain("stale");
    expect(calls).toBe(0);
  }
});

test("reordered or added endpoint approval refuses before any GET", async () => {
  const approved = await planRecon(["issue", "owner/repo", "7"], identityA);
  expect(approved.outcome).toBe("planned");
  const { plan_hash: _hash, detail: _detail, ...unsigned } = approved;
  for (const endpoints of [
    [...approved.endpoints].reverse(),
    [...approved.endpoints, "repos/owner/repo/issues/8"],
  ]) {
    let calls = 0;
    const alteredHash = digestReconPlan({ ...unsigned, endpoints } as Omit<
      ReconPlan,
      "plan_hash" | "detail"
    >);
    const receipt = await runRecon(
      ["issue", "owner/repo", "7"],
      alteredHash,
      async () => {
        calls += 1;
        return ok(metadata());
      },
      identityA,
    );
    expect(receipt.outcome).toBe("refused");
    expect(calls).toBe(0);
  }
});

test("entrypoint or imported runner drift refuses immediately before GETs", async () => {
  const approved = await planRecon(["issue", "owner/repo", "7"], identityA);
  for (const drifted of [
    { ...runtimeA, entrypoint_sha256: runtimeB.entrypoint_sha256 },
    { ...runtimeA, command_runner_sha256: runtimeB.command_runner_sha256 },
  ]) {
    let identityReads = 0;
    let calls = 0;
    const receipt = await runRecon(
      ["issue", "owner/repo", "7"],
      approved.plan_hash,
      async () => {
        calls += 1;
        return ok(metadata());
      },
      async () => {
        identityReads += 1;
        return identityReads === 1 ? runtimeA : drifted;
      },
    );
    expect(identityReads).toBe(2);
    expect(receipt.outcome).toBe("refused");
    expect(receipt.detail).toContain("drifted");
    expect(calls).toBe(0);
  }
});

test("CLI refusal prints one typed receipt and exits nonzero", () => {
  const script = path.resolve(import.meta.dir, "../skills/tailrocks-contribute-recon/scripts/gh-recon.ts");
  const child = Bun.spawnSync([process.execPath, script, "issue", "owner/repo/extra", "7"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(child.exitCode).not.toBe(0);
  expect(child.stderr.toString()).toBe("");
  const lines = child.stdout.toString().trim().split("\n");
  expect(lines).toHaveLength(1);
  expect(JSON.parse(lines[0]!)).toMatchObject({
    schema: reconSchema,
    outcome: "refused",
    code: "invalid_arguments",
    requests: [],
    mutations: [],
  });
});
