import { expect, test } from "bun:test";
import { createHash, randomUUID } from "node:crypto";
import {
  chmod,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  contributionStageInputSchema,
  contributionStageReceiptSchema,
  readBoundedContributionStdin,
  runContributionStage,
  type ContributionStage,
  verifyContributionStageEntrypoint,
} from "./contribution-stage-core";

const stages = ["recon", "propose", "prepare", "submit", "respond"] as const;
const outputs: Readonly<Record<ContributionStage, readonly string[]>> = {
  recon: ["target.json", "recon-report.md", "log.md"],
  propose: ["proposal.md", "log.md"],
  prepare: ["prepare-receipt.json", "pr_description.md", "log.md"],
  submit: ["submission.json", "log.md"],
  respond: ["response.json", "log.md"],
};
const predecessors: Readonly<Record<ContributionStage, readonly string[]>> = {
  recon: [],
  propose: ["target.json", "recon-report.md"],
  prepare: ["target.json", "recon-report.md", "proposal.md"],
  submit: ["target.json", "recon-report.md", "proposal.md", "prepare-receipt.json"],
  respond: ["target.json", "submission.json"],
};

function sha(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function git(root: string, ...args: string[]): string {
  const result = Bun.spawnSync(["git", ...args], { cwd: root, stdout: "pipe", stderr: "pipe" });
  if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  return result.stdout.toString().trim();
}

async function fixture(): Promise<{
  readonly root: string;
  readonly repo: string;
  readonly handoff: string;
  readonly base: string;
  readonly head: string;
  readonly id: string;
}> {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "contribution-stage-")));
  const repo = path.join(root, "fork");
  const handoff = path.join(root, "contrib", "owner-repo");
  await mkdir(repo);
  await mkdir(handoff, { recursive: true });
  git(repo, "init", "-q", "-b", "main");
  git(repo, "config", "user.email", "fixture@example.com");
  git(repo, "config", "user.name", "Fixture");
  git(repo, "remote", "add", "origin", "https://github.com/fixture/repo.git");
  git(repo, "remote", "add", "upstream", "https://github.com/owner/repo.git");
  await writeFile(path.join(repo, "src.txt"), "base\n");
  git(repo, "add", "src.txt");
  git(repo, "commit", "-q", "-m", "base");
  const base = git(repo, "rev-parse", "HEAD");
  await writeFile(path.join(repo, "src.txt"), "change\n");
  git(repo, "add", "src.txt");
  git(repo, "commit", "-q", "-m", "change");
  return { root, repo, handoff, base, head: git(repo, "rev-parse", "HEAD"), id: randomUUID() };
}

function actions(stage: ContributionStage) {
  const kinds =
    stage === "recon"
      ? ["GET"]
      : stage === "submit"
        ? ["PUSH", "CREATE_PR"]
        : stage === "respond"
          ? ["GET"]
          : [];
  return kinds.map((kind, index) => ({
    id: `${stage}-${index + 1}`,
    kind,
    host: "github.com",
    target: `owner/repo/${kind.toLowerCase()}`,
    actor: "fixture-user",
    credential_scope: "repo",
    purpose: `${stage} ${kind.toLowerCase()} proof`,
    payload_sha256: sha(`${stage}:${kind}:payload`),
    before_sha256: sha(`${stage}:${kind}:before`),
  }));
}

function artifact(
  stage: ContributionStage,
  fixtureState: Awaited<ReturnType<typeof fixture>>,
  actionIds: readonly string[],
): string {
  return `${JSON.stringify({
    schema: "tailrocks.contribution-artifact/v1",
    contribution_id: fixtureState.id,
    repository: "owner/repo",
    stage,
    head: fixtureState.head,
    actions: actionIds,
    approval_ids: actionIds.map((_id, index) => `approval-${stage}-${index + 1}`),
    receipt_ids: actionIds.map((_id, index) => `remote-${stage}-${index + 1}`),
    data: {},
  })}\n`;
}

function markdown(
  stage: ContributionStage,
  fixtureState: Awaited<ReturnType<typeof fixture>>,
  prior = "",
): string {
  return `${prior}${prior ? "\n" : ""}Contribution-ID: ${fixtureState.id}\nRepository: owner/repo\nStage: ${stage}\nHead: ${fixtureState.head}\n`;
}

async function stageInput(stage: ContributionStage, state: Awaited<ReturnType<typeof fixture>>) {
  const boundActions = actions(stage);
  const current = new Date();
  current.setMilliseconds(0);
  const now = current.toISOString();
  const approvedAt = new Date(current.valueOf() - 60_000).toISOString();
  const expiresAt = new Date(current.valueOf() + 3 * 60_000).toISOString();
  const priorLog = (await Bun.file(path.join(state.handoff, "log.md")).exists())
    ? await readFile(path.join(state.handoff, "log.md"), "utf8")
    : null;
  const writes = await Promise.all(
    outputs[stage].map(async (name) => {
      const file = path.join(state.handoff, name);
      const before = (await Bun.file(file).exists()) ? await readFile(file, "utf8") : null;
      const content = name.endsWith(".json")
        ? artifact(
            stage,
            state,
            boundActions.map(({ id }) => id),
          )
        : markdown(stage, state, name === "log.md" ? (priorLog ?? "") : "");
      return { name, expected_sha256: before === null ? null : sha(before), content };
    }),
  );
  const predecessorRows = await Promise.all(
    predecessors[stage].map(async (name) => ({
      name,
      sha256: sha(await readFile(path.join(state.handoff, name), "utf8")),
    })),
  );
  const approvals = boundActions.map((action, index) => ({
    action_id: action.id,
    binding_sha256: sha(JSON.stringify(action)),
    approval_id: `approval-${stage}-${index + 1}`,
    approved_at: approvedAt,
    expires_at: expiresAt,
  }));
  const receipts = boundActions.map((action, index) => ({
    action_id: action.id,
    binding_sha256: sha(JSON.stringify(action)),
    outcome: "success",
    remote_id: `remote-${stage}-${index + 1}`,
    after_sha256: sha(`${stage}:${index}:after`),
  }));
  return {
    schema: contributionStageInputSchema,
    contribution_id: state.id,
    repository: "owner/repo",
    repo: {
      root: state.repo,
      base: state.base,
      head: state.head,
      changed_paths: ["src.txt"],
      fork_remote_url: "https://github.com/fixture/repo.git",
      target_remote_url: "https://github.com/owner/repo.git",
    },
    handoff_root: state.handoff,
    predecessors: predecessorRows,
    writes,
    actions: boundActions,
    approvals,
    receipts,
    now,
  };
}

test("all five installed stage CLIs transition one temporary repository through exact receipts", async () => {
  const state = await fixture();
  try {
    for (const stage of stages) {
      const input = await stageInput(stage, state);
      const script = path.join(
        import.meta.dir,
        `../skills/tailrocks-contribute-${stage}/scripts/contribute-${stage}.ts`,
      );
      const skillFile = path.join(path.dirname(path.dirname(script)), "SKILL.md");
      const child = Bun.spawnSync([process.execPath, script, "--skill-file", skillFile], {
        stdin: Buffer.from(JSON.stringify(input)),
        stdout: "pipe",
        stderr: "pipe",
      });
      expect(child.exitCode, child.stderr.toString()).toBe(0);
      expect(child.stderr.toString()).toBe("");
      const lines = child.stdout.toString().trim().split("\n");
      expect(lines).toHaveLength(1);
      const receipt = JSON.parse(lines[0]!);
      expect(receipt).toMatchObject({
        schema: contributionStageReceiptSchema,
        stage,
        outcome: "success",
        code: "transitioned",
        contribution_id: state.id,
        repository: "owner/repo",
        head: state.head,
      });
      expect(receipt.actions.map(({ action_id }: { action_id: string }) => action_id)).toEqual(
        input.actions.map(({ id }) => id),
      );
      for (const proof of receipt.actions) {
        expect(proof.binding_sha256).toMatch(/^[a-f0-9]{64}$/);
        expect(proof.receipt_id).toMatch(/^remote-/);
      }
      for (const value of Object.values(receipt.runtime)) expect(value).toMatch(/^[a-f0-9]{64}$/);
      expect(receipt.mutations.map(({ path: file }: { path: string }) => path.basename(file)).sort()).toEqual(
        [...outputs[stage]].sort(),
      );
    }
    const finalLog = await readFile(path.join(state.handoff, "log.md"), "utf8");
    for (const stage of stages) expect(finalLog).toContain(`Stage: ${stage}`);
  } finally {
    await rm(state.root, { recursive: true, force: true });
  }
});

test("propose and prepare reject every external action without local mutation", async () => {
  const state = await fixture();
  try {
    expect((await runContributionStage(await stageInput("recon", state), "recon")).outcome).toBe("success");
    for (const stage of ["propose", "prepare"] as const) {
      if (stage === "prepare")
        expect((await runContributionStage(await stageInput("propose", state), "propose")).outcome).toBe(
          "success",
        );
      const input = await stageInput(stage, state);
      const fake = {
        id: `${stage}-external`,
        kind: "GET",
        host: "github.com",
        target: "owner/repo",
        actor: "fixture-user",
        credential_scope: "repo",
        purpose: "forbidden local network action",
        payload_sha256: sha("payload"),
        before_sha256: sha("before"),
      };
      const receipt = await runContributionStage({ ...input, actions: [fake] }, stage);
      expect(receipt).toMatchObject({ outcome: "refused", code: "invalid_input", mutations: [] });
      for (const write of input.writes)
        expect(await Bun.file(path.join(state.handoff, write.name)).exists()).toBe(
          write.expected_sha256 !== null,
        );
    }
  } finally {
    await rm(state.root, { recursive: true, force: true });
  }
});

test("submit and respond require complete fresh action-bound approval and remote receipts", async () => {
  const state = await fixture();
  try {
    for (const stage of ["recon", "propose", "prepare"] as const)
      expect((await runContributionStage(await stageInput(stage, state), stage)).outcome).toBe("success");
    const submit = await stageInput("submit", state);
    for (const changed of [
      { ...submit, approvals: submit.approvals.slice(1) },
      { ...submit, receipts: submit.receipts.slice(0, 1) },
      {
        ...submit,
        approvals: submit.approvals.map((item, index) =>
          index ? item : { ...item, binding_sha256: sha("wrong") },
        ),
      },
      { ...submit, approvals: submit.approvals.map((item) => ({ ...item, expires_at: submit.now })) },
      {
        ...submit,
        actions: submit.actions.filter(({ kind }) => kind !== "CREATE_PR"),
        approvals: submit.approvals.slice(0, 1),
        receipts: submit.receipts.slice(0, 1),
      },
      { ...submit, actions: [...submit.actions].reverse() },
      {
        ...submit,
        actions: submit.actions.map((item, index) => (index ? item : { ...item, target: "other/repo/push" })),
      },
    ]) {
      const receipt = await runContributionStage(changed, "submit");
      expect(receipt.outcome).toBe("refused");
      expect(receipt.mutations).toEqual([]);
    }
    expect((await runContributionStage(submit, "submit")).outcome).toBe("success");
    const respond = await stageInput("respond", state);
    const mismatched = { ...respond, receipts: [{ ...respond.receipts[0]!, binding_sha256: sha("wrong") }] };
    expect((await runContributionStage(mismatched, "respond")).outcome).toBe("refused");
    expect((await runContributionStage(respond, "respond")).outcome).toBe("success");
    expect((await runContributionStage(await stageInput("prepare", state), "prepare")).detail).toContain(
      "cannot run after",
    );
    expect((await runContributionStage(respond, "respond")).detail).toContain("already consumed");
    const old = new Date(Date.now() - 60 * 60_000);
    old.setMilliseconds(0);
    const staleClock = {
      ...respond,
      now: old.toISOString(),
      approvals: respond.approvals.map((item) => ({
        ...item,
        approved_at: new Date(old.valueOf() - 60_000).toISOString(),
        expires_at: new Date(old.valueOf() + 3 * 60_000).toISOString(),
      })),
    };
    expect((await runContributionStage(staleClock, "respond")).detail).toContain("bound time is not current");
  } finally {
    await rm(state.root, { recursive: true, force: true });
  }
});

test("repository HEAD dirty diff and handoff separation drift refuse before publication", async () => {
  const state = await fixture();
  try {
    const clean = await stageInput("recon", state);
    const cases = [
      { ...clean, repo: { ...clean.repo, head: sha("wrong") } },
      { ...clean, repo: { ...clean.repo, changed_paths: [] } },
      { ...clean, handoff_root: state.repo },
      {
        ...clean,
        repo: { ...clean.repo, fork_remote_url: "https://github.com/evil/repo.git" },
      },
    ];
    for (const input of cases) {
      const receipt = await runContributionStage(input, "recon");
      expect(receipt.outcome).toBe("refused");
      expect(receipt.mutations).toEqual([]);
    }
    await writeFile(path.join(state.repo, "dirty.txt"), "dirty");
    const dirty = await runContributionStage(clean, "recon");
    expect(dirty).toMatchObject({ outcome: "refused", code: "repository_drift", mutations: [] });
    await rm(path.join(state.repo, "dirty.txt"));
    await writeFile(path.join(state.repo, "AGENTS.md"), "foreign agent metadata\n");
    git(state.repo, "add", "AGENTS.md");
    git(state.repo, "commit", "-q", "-m", "agent metadata");
    const metadataHead = git(state.repo, "rev-parse", "HEAD");
    const metadata = {
      ...clean,
      repo: {
        ...clean.repo,
        head: metadataHead,
        changed_paths: ["AGENTS.md", "src.txt"],
      },
      writes: clean.writes.map((write) =>
        write.name.endsWith(".json")
          ? {
              ...write,
              content: write.content.replaceAll(state.head, metadataHead),
            }
          : { ...write, content: write.content.replaceAll(state.head, metadataHead) },
      ),
    };
    expect((await runContributionStage(metadata, "recon")).detail).toContain("agent metadata");
  } finally {
    await rm(state.root, { recursive: true, force: true });
  }
});

test("symlinked handoff and stale predecessor or write preimage preserve all bytes", async () => {
  const state = await fixture();
  try {
    expect((await runContributionStage(await stageInput("recon", state), "recon")).outcome).toBe("success");
    const propose = await stageInput("propose", state);
    const targetBefore = await readFile(path.join(state.handoff, "target.json"), "utf8");
    expect(
      (
        await runContributionStage(
          {
            ...propose,
            predecessors: propose.predecessors.map((item, index) =>
              index ? item : { ...item, sha256: sha("stale") },
            ),
          },
          "propose",
        )
      ).outcome,
    ).toBe("refused");
    expect(await readFile(path.join(state.handoff, "target.json"), "utf8")).toBe(targetBefore);
    const foreign = { ...propose, contribution_id: randomUUID() };
    expect((await runContributionStage(foreign, "propose")).detail).toContain("wrong contribution");
    const staleWrite = {
      ...propose,
      writes: propose.writes.map((item) =>
        item.name === "log.md" ? { ...item, expected_sha256: sha("stale") } : item,
      ),
    };
    expect((await runContributionStage(staleWrite, "propose")).mutations).toEqual([]);
    expect((await runContributionStage(propose, "propose")).outcome).toBe("success");
    const prepare = await stageInput("prepare", state);
    const wrongStage = markdown("recon", state);
    await writeFile(path.join(state.handoff, "proposal.md"), wrongStage);
    const backward = {
      ...prepare,
      predecessors: prepare.predecessors.map((item) =>
        item.name === "proposal.md" ? { ...item, sha256: sha(wrongStage) } : item,
      ),
    };
    expect((await runContributionStage(backward, "prepare")).detail).toContain("producer stage");
    const link = path.join(state.root, "handoff-link");
    await symlink(state.handoff, link);
    expect((await runContributionStage({ ...propose, handoff_root: link }, "propose")).outcome).toBe(
      "refused",
    );
  } finally {
    await rm(state.root, { recursive: true, force: true });
  }
});

test("recon refuses takeover and predecessor races roll back owned outputs", async () => {
  const state = await fixture();
  try {
    const residue = path.join(state.handoff, ".tailrocks-recovery");
    await writeFile(residue, "recovery\n");
    expect((await runContributionStage(await stageInput("recon", state), "recon")).detail).toContain(
      "empty one-contribution handoff",
    );
    await rm(residue);
    expect((await runContributionStage(await stageInput("recon", state), "recon")).outcome).toBe("success");
    const takeoverState = { ...state, id: randomUUID() };
    const takeover = await runContributionStage(await stageInput("recon", takeoverState), "recon");
    expect(takeover.detail).toContain("empty one-contribution handoff");
    expect(takeover.mutations).toEqual([]);

    const propose = await stageInput("propose", state);
    const reconReport = path.join(state.handoff, "recon-report.md");
    const raced = await runContributionStage(propose, "propose", {
      afterPublish: async (_file, index) => {
        if (index === 0) await writeFile(reconReport, "concurrent predecessor replacement\n");
      },
    });
    expect(raced.outcome).toBe("refused");
    expect(raced.detail).toContain("read-set changed");
    expect(await Bun.file(path.join(state.handoff, "proposal.md")).exists()).toBe(false);
    expect(await readFile(reconReport, "utf8")).toBe("concurrent predecessor replacement\n");
  } finally {
    await rm(state.root, { recursive: true, force: true });
  }
});

test("rollback failure reports exact surviving concurrent state and recovery", async () => {
  const state = await fixture();
  try {
    const input = await stageInput("recon", state);
    const receipt = await runContributionStage(input, "recon", {
      afterPublish: async (file, index) => {
        if (index !== 0) return;
        await rm(file);
        await writeFile(file, "concurrent target replacement\n");
        await writeFile(path.join(state.handoff, "recon-report.md"), "concurrent blocker\n");
      },
    });
    expect(receipt.outcome).toBe("recovery_required");
    expect(receipt.recovery_artifacts.length).toBeGreaterThan(0);
    expect(receipt.mutations).toEqual([]);
    expect(receipt.partial_state).toEqual([
      {
        path: path.join(state.handoff, "target.json"),
        observed_sha256: sha("concurrent target replacement\n"),
        ownership: "concurrent_replacement",
      },
      {
        path: path.join(state.handoff, "recon-report.md"),
        observed_sha256: sha("concurrent blocker\n"),
        ownership: "concurrent_replacement",
      },
    ]);
  } finally {
    await rm(state.root, { recursive: true, force: true });
  }
});

test("stdin reader refuses oversized or stalled streams before unbounded buffering", async () => {
  const oversized = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(7));
      controller.enqueue(new Uint8Array(7));
      controller.close();
    },
  });
  await expect(readBoundedContributionStdin(oversized, 10, 1_000)).rejects.toThrow("too large");
  const stalled = new ReadableStream<Uint8Array>({ start() {} });
  await expect(readBoundedContributionStdin(stalled, 10, 10)).rejects.toThrow("deadline");
});

test("PATH-resolved Git is used, and its failure refuses the stage", async () => {
  const state = await fixture();
  const shim = path.join(state.root, "shim");
  const marker = path.join(state.root, "shim-ran");
  await mkdir(shim);
  const fakeGit = path.join(shim, "git");
  await writeFile(fakeGit, `#!/bin/sh\n/usr/bin/touch ${JSON.stringify(marker)}\nexit 99\n`);
  await chmod(fakeGit, 0o755);
  const previousPath = process.env.PATH;
  try {
    process.env.PATH = shim;
    expect((await runContributionStage(await stageInput("recon", state), "recon")).outcome).not.toBe(
      "success",
    );
    expect(await Bun.file(marker).exists()).toBe(true);
    await rm(marker, { force: true });
    await chmod(fakeGit, 0o644);
    const realGit = Bun.which("git");
    if (!realGit) throw new Error("git is required on PATH");
    process.env.PATH = [shim, path.dirname(realGit)].join(path.delimiter);
    expect((await runContributionStage(await stageInput("recon", state), "recon")).outcome).toBe("success");
    expect(await Bun.file(marker).exists()).toBe(false);
  } finally {
    if (previousPath === undefined) delete process.env.PATH;
    else process.env.PATH = previousPath;
    await rm(state.root, { recursive: true, force: true });
  }
});

test("CLI rejects malformed and symlink-lookalike entrypoints with one typed receipt", async () => {
  const state = await fixture();
  try {
    for (const stage of stages) {
      const script = path.join(
        import.meta.dir,
        `../skills/tailrocks-contribute-${stage}/scripts/contribute-${stage}.ts`,
      );
      const child = Bun.spawnSync([process.execPath, script], {
        stdin: Buffer.from("{}"),
        stdout: "pipe",
        stderr: "pipe",
      });
      expect(child.exitCode).toBe(2);
      expect(child.stderr.toString()).toBe("");
      expect(child.stdout.toString().trim().split("\n")).toHaveLength(1);
      expect(JSON.parse(child.stdout.toString())).toMatchObject({
        schema: contributionStageReceiptSchema,
        stage,
        outcome: "refused",
        code: "invalid_input",
      });
    }
    const installedRoot = path.join(state.root, "installed");
    await mkdir(path.join(installedRoot, "skills", "tailrocks-contribute-recon", "scripts"), {
      recursive: true,
    });
    await mkdir(path.join(installedRoot, "scripts"));
    const link = path.join(
      installedRoot,
      "skills",
      "tailrocks-contribute-recon",
      "scripts",
      "contribute-recon.ts",
    );
    await symlink(
      path.join(import.meta.dir, "../skills/tailrocks-contribute-recon/scripts/contribute-recon.ts"),
      link,
    );
    const child = Bun.spawnSync([process.execPath, link], {
      stdin: Buffer.from("{}"),
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(child.exitCode).toBe(2);
    expect(JSON.parse(child.stdout.toString())).toMatchObject({ code: "invalid_input" });

    const copiedRoot = path.join(state.root, "copied-lookalike");
    const copiedSkill = path.join(copiedRoot, "skills", "tailrocks-contribute-recon", "scripts");
    await mkdir(copiedSkill, { recursive: true });
    await mkdir(path.join(copiedRoot, "scripts"));
    await mkdir(path.join(copiedRoot, ".codex-plugin"));
    const copiedEntrypoint = path.join(copiedSkill, "contribute-recon.ts");
    for (const [source, destination] of [
      [
        path.join(import.meta.dir, "../skills/tailrocks-contribute-recon/scripts/contribute-recon.ts"),
        copiedEntrypoint,
      ],
      [
        path.join(import.meta.dir, "contribution-stage-core.ts"),
        path.join(copiedRoot, "scripts/contribution-stage-core.ts"),
      ],
      [path.join(import.meta.dir, "bounded-command.ts"), path.join(copiedRoot, "scripts/bounded-command.ts")],
      [
        path.join(import.meta.dir, "resolve-executable.ts"),
        path.join(copiedRoot, "scripts/resolve-executable.ts"),
      ],
      [
        path.join(import.meta.dir, "atomic-file-transaction.ts"),
        path.join(copiedRoot, "scripts/atomic-file-transaction.ts"),
      ],
      [
        path.join(import.meta.dir, "../skills/tailrocks-contribute-recon/SKILL.md"),
        path.join(copiedRoot, "skills/tailrocks-contribute-recon/SKILL.md"),
      ],
      [
        path.join(import.meta.dir, "../.codex-plugin/plugin.json"),
        path.join(copiedRoot, ".codex-plugin/plugin.json"),
      ],
    ])
      await copyFile(source, destination);
    const marker = path.join(state.root, "malicious-core-ran");
    await writeFile(
      path.join(copiedRoot, "scripts/contribution-stage-core.ts"),
      `await Bun.write(${JSON.stringify(marker)}, "ran");\n${await readFile(path.join(import.meta.dir, "contribution-stage-core.ts"), "utf8")}`,
    );
    const trustedSkill = path.join(import.meta.dir, "../skills/tailrocks-contribute-recon/SKILL.md");
    const copied = Bun.spawnSync([process.execPath, copiedEntrypoint, "--skill-file", trustedSkill], {
      stdin: Buffer.from("{}"),
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(copied.exitCode).toBe(2);
    expect(await Bun.file(marker).exists()).toBe(false);
    await expect(
      verifyContributionStageEntrypoint(copiedEntrypoint, "recon", trustedSkill),
    ).rejects.toThrow();
  } finally {
    await rm(state.root, { recursive: true, force: true });
  }
});
