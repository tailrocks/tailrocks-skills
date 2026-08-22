import { expect, test } from "bun:test";
import { chmod, lstat, mkdir, mkdtemp, readFile, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  checkoutPr,
  checkoutSchema,
  type CheckoutReceipt,
  type CommandResult,
  type CommandRunner,
} from "./checkout-pr";

interface Pr {
  number: number;
  state: "OPEN" | "CLOSED" | "MERGED";
  headRefName: string;
  headRefOid: string;
  headRepository: { nameWithOwner: string };
}

const openPr = (number = 7, branch = "feature/work"): Pr => ({
  number,
  state: "OPEN",
  headRefName: branch,
  headRefOid: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  headRepository: { nameWithOwner: "owner/repository" },
});

async function repository(): Promise<string> {
  return realpath(await mkdtemp(path.join(tmpdir(), "checkout-pr-")));
}

class FakeHost {
  branch: string | null = "main";
  head = "before";
  dirty = [false, false];
  list: Pr[] = [openPr()];
  views: unknown[] = [openPr(), openPr()];
  checkoutCode = 0;
  checkoutBranch: string | undefined;
  checkoutHead: string | undefined;
  switchCode = 0;
  mutateRefOnDetach: string | undefined;
  malformedRef = false;
  readonly refs = new Map<string, string>([
    ["main", "before"],
    ["feature/work", openPr().headRefOid],
  ]);
  readonly commands: string[][] = [];

  constructor(readonly root: string) {}

  readonly run: CommandRunner = async (command) => {
    const args = [...command];
    this.commands.push(args);
    const key = args.join("\0");
    if (key === "git\0rev-parse\0--show-toplevel") return ok(`${this.root}\n`);
    if (key === "git\0check-ref-format\0--branch\0bad ref" || this.malformedRef) return fail("bad ref");
    if (args[0] === "git" && args[1] === "check-ref-format") return ok(`${args[3]}\n`);
    if (key === "git\0branch\0--show-current") return ok(this.branch ? `${this.branch}\n` : "");
    if (key === "git\0rev-parse\0HEAD") return ok(`${this.head}\n`);
    if (key === "git\0status\0--porcelain=v1\0-z") return ok(this.dirty.shift() ? "?? file\0" : "");
    if (args[0] === "gh" && args[1] === "pr" && args[2] === "list") return ok(JSON.stringify(this.list));
    if (args[0] === "gh" && args[1] === "pr" && args[2] === "view")
      return ok(JSON.stringify(this.views.shift()));
    if (args[0] === "gh" && args[1] === "pr" && args[2] === "checkout") {
      if (this.checkoutCode !== 0) return fail("checkout failed", this.checkoutCode);
      this.branch = this.checkoutBranch ?? openPr().headRefName;
      this.head = this.checkoutHead ?? openPr().headRefOid;
      this.refs.set(this.branch, this.head);
      return ok();
    }
    if (args[0] === "git" && args[1] === "switch") {
      if (this.switchCode !== 0) return fail("switch failed", this.switchCode);
      if (args[2] === "--detach") {
        this.branch = null;
        this.head = args[3]!;
        if (this.mutateRefOnDetach) this.refs.set("feature/work", this.mutateRefOnDetach);
      } else {
        this.branch = args[3]!;
        this.head = this.refs.get(this.branch) ?? this.head;
      }
      return ok();
    }
    if (args[0] === "git" && args[1] === "update-ref") {
      const branch = args[2]!.replace(/^refs\/heads\//, "");
      if (this.refs.get(branch) !== args[4]) return fail("compare-and-swap failed");
      this.refs.set(branch, args[3]!);
      return ok();
    }
    return fail(`unexpected: ${args.join(" ")}`);
  };
}

function ok(stdout = ""): CommandResult {
  return { code: 0, stdout, stderr: "" };
}

function fail(stderr: string, code = 1): CommandResult {
  return { code, stdout: "", stderr };
}

async function run(
  command: readonly string[],
  cwd: string,
): Promise<{ code: number; stdout: string; stderr: string }> {
  const child = Bun.spawn(command, { cwd, stdout: "pipe", stderr: "pipe" });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  return { code, stdout, stderr };
}

interface CliFixture {
  readonly root: string;
  readonly bin: string;
  readonly log: string;
  readonly realGit: string;
  readonly pr: Pr;
}

async function cliFixture(): Promise<CliFixture> {
  const root = await repository();
  const realGit = Bun.which("git");
  if (!realGit) throw new Error("git is required for checkout fixture");
  const git = async (...args: string[]) => {
    const result = await run([realGit, ...args], root);
    if (result.code !== 0) throw new Error(result.stderr || `git ${args.join(" ")} failed`);
    return result.stdout.trim();
  };
  await git("init", "-b", "main");
  await writeFile(path.join(root, "fixture.txt"), "main\n");
  await git("add", "fixture.txt");
  await git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.test", "commit", "-m", "main");
  await git("switch", "-c", "feature/work");
  await writeFile(path.join(root, "fixture.txt"), "feature\n");
  await git("add", "fixture.txt");
  await git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.test", "commit", "-m", "feature");
  const oid = await git("rev-parse", "HEAD");
  await git("switch", "main");

  const harness = await realpath(await mkdtemp(path.join(tmpdir(), "checkout-pr-mocks-")));
  const bin = path.join(harness, "bin");
  const log = path.join(harness, "commands.jsonl");
  await mkdir(bin);
  const gitMock = `#!/usr/bin/env bun
import { appendFileSync } from "node:fs";
appendFileSync(process.env.MOCK_COMMAND_LOG, JSON.stringify(["git", ...process.argv.slice(2)]) + "\\n");
const result = Bun.spawnSync([process.env.REAL_GIT, ...process.argv.slice(2)], { cwd: process.cwd(), stdout: "pipe", stderr: "pipe" });
process.stdout.write(result.stdout); process.stderr.write(result.stderr); process.exit(result.exitCode);
`;
  const ghMock = `#!/usr/bin/env bun
import { appendFileSync } from "node:fs";
const args=process.argv.slice(2), state=JSON.parse(process.env.MOCK_PR_STATE);
appendFileSync(process.env.MOCK_COMMAND_LOG, JSON.stringify(["gh", ...args]) + "\\n");
if(args[0]!=="pr") process.exit(9);
if(args[1]==="view") { process.stdout.write(JSON.stringify(state.view)); process.exit(0); }
if(args[1]==="list") { process.stdout.write(JSON.stringify(state.list)); process.exit(0); }
if(args[1]==="checkout") {
 const result=Bun.spawnSync([process.env.REAL_GIT,"switch","--",state.view.headRefName],{cwd:process.cwd(),stdout:"pipe",stderr:"pipe"});
 process.stdout.write(result.stdout); process.stderr.write(result.stderr); process.exit(result.exitCode);
}
process.exit(9);
`;
  await writeFile(path.join(bin, "git"), gitMock);
  await writeFile(path.join(bin, "gh"), ghMock);
  await Promise.all([chmod(path.join(bin, "git"), 0o755), chmod(path.join(bin, "gh"), 0o755)]);
  return { root, bin, log, realGit, pr: { ...openPr(7, "feature/work"), headRefOid: oid } };
}

async function runCheckoutCli(
  fixture: CliFixture,
  input: string,
  state: { readonly view: Pr; readonly list: readonly Pr[] } = { view: fixture.pr, list: [fixture.pr] },
): Promise<{ readonly code: number; readonly receipt: CheckoutReceipt; readonly commands: string[][] }> {
  const script = path.resolve(import.meta.dir, "checkout-pr.ts");
  const child = Bun.spawn([process.execPath, script, "--root", fixture.root, input], {
    cwd: fixture.root,
    env: {
      ...process.env,
      PATH: `${fixture.bin}${path.delimiter}${process.env.PATH ?? ""}`,
      REAL_GIT: fixture.realGit,
      MOCK_COMMAND_LOG: fixture.log,
      MOCK_PR_STATE: JSON.stringify(state),
    },
    stdout: "pipe",
    stderr: "pipe",
  });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  expect(stderr).toBe("");
  const commands = (await Bun.file(fixture.log).exists())
    ? (await readFile(fixture.log, "utf8"))
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as string[])
    : [];
  return { code, receipt: JSON.parse(stdout) as CheckoutReceipt, commands };
}

test("CLI switches a real temporary repository through mocked Git and hosting receipts", async () => {
  const fixture = await cliFixture();
  const result = await runCheckoutCli(fixture, "7");
  expect(result.code).toBe(0);
  expect(result.receipt).toMatchObject({
    schema: checkoutSchema,
    outcome: "success",
    code: "switched",
    after: { branch: "feature/work", head: fixture.pr.headRefOid },
  });
  expect(result.commands.filter((command) => command.slice(0, 3).join(" ") === "gh pr checkout")).toEqual([
    ["gh", "pr", "checkout", "7"],
  ]);
  expect((await run([fixture.realGit, "branch", "--show-current"], fixture.root)).stdout.trim()).toBe(
    "feature/work",
  );
  expect((await run([fixture.realGit, "rev-parse", "HEAD"], fixture.root)).stdout.trim()).toBe(
    fixture.pr.headRefOid,
  );
});

test("CLI dirty-tree refusal reaches no mocked hosting and preserves real Git state", async () => {
  const fixture = await cliFixture();
  const before = (await run([fixture.realGit, "rev-parse", "HEAD"], fixture.root)).stdout.trim();
  await writeFile(path.join(fixture.root, "untracked.txt"), "dirty\n");
  const result = await runCheckoutCli(fixture, "7");
  expect(result.code).toBe(2);
  expect(result.receipt).toMatchObject({ outcome: "refused", code: "dirty_tree" });
  expect(result.commands.some((command) => command[0] === "gh")).toBe(false);
  expect((await run([fixture.realGit, "branch", "--show-current"], fixture.root)).stdout.trim()).toBe("main");
  expect((await run([fixture.realGit, "rev-parse", "HEAD"], fixture.root)).stdout.trim()).toBe(before);
});

test("CLI no-match performs no checkout and preserves a real temporary repository", async () => {
  const fixture = await cliFixture();
  const before = (await run([fixture.realGit, "rev-parse", "HEAD"], fixture.root)).stdout.trim();
  const result = await runCheckoutCli(fixture, "missing", { view: fixture.pr, list: [] });
  expect(result.code).toBe(2);
  expect(result.receipt).toMatchObject({ outcome: "refused", code: "no_match", candidates: [] });
  expect(result.commands.filter((command) => command.slice(0, 3).join(" ") === "gh pr checkout")).toEqual([]);
  expect((await run([fixture.realGit, "branch", "--show-current"], fixture.root)).stdout.trim()).toBe("main");
  expect((await run([fixture.realGit, "rev-parse", "HEAD"], fixture.root)).stdout.trim()).toBe(before);
});

test("number switches once and proves the exact branch", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  const result = await checkoutPr({ root, input: "7" }, host.run);
  expect(result).toMatchObject({ schema: checkoutSchema, outcome: "success", code: "switched" });
  expect(host.commands.filter((command) => command.slice(0, 3).join(" ") === "gh pr checkout")).toEqual([
    ["gh", "pr", "checkout", "7"],
  ]);
  expect(result.after?.branch).toBe("feature/work");
});

test("exact HTTPS URL is preserved for view and checkout", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  const url = "https://github.example/owner/repository/pull/7";
  const result = await checkoutPr({ root, input: url }, host.run);
  expect(result.code).toBe("switched");
  expect(host.commands.some((command) => command.join(" ") === `gh pr checkout ${url}`)).toBe(true);
});

test("branch resolution prefers one exact open match over closed history", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  host.list = [{ ...openPr(2), state: "CLOSED" }, openPr(9)];
  host.views = [openPr(9)];
  const result = await checkoutPr({ root, input: "feature/work" }, host.run);
  expect(result.pr?.number).toBe(9);
  expect(result.code).toBe("switched");
});

test("dirty tree refuses before any hosting lookup or mutation", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  host.dirty = [true];
  const result = await checkoutPr({ root, input: "7" }, host.run);
  expect(result.code).toBe("dirty_tree");
  expect(host.commands.some((command) => command[0] === "gh")).toBe(false);
});

test("zero and ambiguous branch matches are exact refusals", async () => {
  for (const [list, code] of [
    [[], "no_match"],
    [[openPr(7), openPr(8)], "ambiguous_match"],
  ] as const) {
    const root = await repository();
    const host = new FakeHost(root);
    host.list = [...list];
    const result = await checkoutPr({ root, input: "feature/work" }, host.run);
    expect(result.code).toBe(code);
    expect(host.commands.some((command) => command[2] === "checkout")).toBe(false);
  }
});

test("closed confirmation is required and bound to the resolved number", async () => {
  for (const confirmClosed of [undefined, 8]) {
    const root = await repository();
    const host = new FakeHost(root);
    const closed = { ...openPr(), state: "CLOSED" as const };
    host.views = [closed, closed];
    const result = await checkoutPr({ root, input: "7", confirmClosed }, host.run);
    expect(result.code).toBe("closed_confirmation_required");
  }
  const root = await repository();
  const host = new FakeHost(root);
  const merged = { ...openPr(), state: "MERGED" as const };
  host.views = [merged, merged];
  expect((await checkoutPr({ root, input: "7", confirmClosed: 7 }, host.run)).code).toBe("switched");
});

test("invalid number, URL, and branch never reach hosting", async () => {
  for (const input of ["0", "https://host/o/r/pull/7?x=1", "-branch", "bad ref", "9007199254740992"]) {
    const root = await repository();
    const host = new FakeHost(root);
    const result = await checkoutPr({ root, input }, host.run);
    expect(result.code).toBe("invalid_identifier");
    expect(host.commands.some((command) => command[0] === "gh")).toBe(false);
  }
});

test("already-current is idempotent after fresh lookup and guards", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  host.branch = "feature/work";
  host.head = openPr().headRefOid;
  const result = await checkoutPr({ root, input: "7" }, host.run);
  expect(result.code).toBe("already_current");
  expect(host.commands.some((command) => command[2] === "checkout")).toBe(false);
});

test("changed identity and concurrent dirtiness refuse before checkout", async () => {
  const root = await repository();
  const changed = new FakeHost(root);
  changed.views = [openPr(), openPr(7, "changed")];
  expect((await checkoutPr({ root, input: "7" }, changed.run)).code).toBe("lookup_changed");

  const secondRoot = await repository();
  const dirty = new FakeHost(secondRoot);
  dirty.dirty = [false, true];
  expect((await checkoutPr({ root: secondRoot, input: "7" }, dirty.run)).code).toBe("dirty_tree");
  expect(dirty.commands.some((command) => command[2] === "checkout")).toBe(false);
});

test("same branch at a stale commit is refreshed and exact commit is proved", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  host.branch = "feature/work";
  host.head = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  const result = await checkoutPr({ root, input: "7" }, host.run);
  expect(result).toMatchObject({ code: "switched", after: { head: openPr().headRefOid } });
  expect(host.commands.some((command) => command[2] === "checkout")).toBe(true);
});

test("saturated branch lookup refuses instead of selecting truncated results", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  host.list = Array.from({ length: 101 }, (_, index) => openPr(index + 1));
  const result = await checkoutPr({ root, input: "feature/work" }, host.run);
  expect(result.code).toBe("ambiguous_match");
  expect(host.commands.some((command) => command[2] === "checkout")).toBe(false);
});

test("malformed hosting data fails lookup without mutation", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  host.views = [{ number: 7, state: "UNKNOWN", headRefName: "feature/work" }];
  const result = await checkoutPr({ root, input: "7" }, host.run);
  expect(result.code).toBe("lookup_failed");
  expect(host.commands.some((command) => command[2] === "checkout")).toBe(false);
});

test("failed checkout with no state change needs no recovery mutation", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  host.checkoutCode = 1;
  const result = await checkoutPr({ root, input: "7" }, host.run);
  expect(result).toMatchObject({ code: "checkout_failed", recovery: "not_needed" });
  expect(host.commands.some((command) => command[1] === "switch")).toBe(false);
});

test("concurrent dirtiness after checkout prevents success and recovery", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  host.dirty = [false, false, true];
  const result = await checkoutPr({ root, input: "7" }, host.run);
  expect(result).toMatchObject({ outcome: "failed", code: "recovery_failed", recovery: "refused_dirty" });
});

test("runner exceptions become typed command failures", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  const throwing: CommandRunner = async (command, cwd) => {
    if (command[0] === "gh" && command[2] === "checkout") throw new Error("spawn failed");
    return host.run(command, cwd);
  };
  const result = await checkoutPr({ root, input: "7" }, throwing);
  expect(result).toMatchObject({ outcome: "failed", code: "checkout_failed" });
});

test("wrong switched branch restores the captured branch exactly", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  host.checkoutBranch = "wrong";
  const result = await checkoutPr({ root, input: "7" }, host.run);
  expect(result).toMatchObject({ code: "verification_failed", recovery: "restored" });
  expect(host.commands.some((command) => command.join(" ") === "git switch -- main")).toBe(true);
});

test("wrong checked-out commit fails proof and restores the captured branch", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  host.checkoutHead = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  const result = await checkoutPr({ root, input: "7" }, host.run);
  expect(result).toMatchObject({ code: "verification_failed", recovery: "restored" });
});

test("same-branch wrong commit uses compare-and-swap recovery", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  const stale = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  host.branch = "feature/work";
  host.head = stale;
  host.refs.set("feature/work", stale);
  host.checkoutHead = "cccccccccccccccccccccccccccccccccccccccc";
  const result = await checkoutPr({ root, input: "7" }, host.run);
  expect(result).toMatchObject({ code: "verification_failed", recovery: "restored" });
  expect(host.head).toBe(stale);
  expect(host.commands.some((command) => command[1] === "update-ref")).toBe(true);
});

test("same-branch recovery never overwrites a concurrently moved ref", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  const stale = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  const concurrent = "dddddddddddddddddddddddddddddddddddddddd";
  host.branch = "feature/work";
  host.head = stale;
  host.refs.set("feature/work", stale);
  host.checkoutHead = "cccccccccccccccccccccccccccccccccccccccc";
  host.mutateRefOnDetach = concurrent;
  const result = await checkoutPr({ root, input: "7" }, host.run);
  expect(result).toMatchObject({ code: "recovery_failed", recovery: "failed" });
  expect(host.refs.get("feature/work")).toBe(concurrent);
});

test("failed recovery is terminal and never claims the switch", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  host.checkoutBranch = "wrong";
  host.switchCode = 1;
  const result = await checkoutPr({ root, input: "7" }, host.run);
  expect(result).toMatchObject({ outcome: "failed", code: "recovery_failed", recovery: "failed" });
});

test("root must be a real repository top level", async () => {
  const root = await repository();
  const host = new FakeHost(root);
  const nested = path.join(root, "missing");
  const result = await checkoutPr({ root: nested, input: "7" }, host.run);
  expect(result.code).toBe("not_git_repo");
  expect(await lstat(root).then((stats) => stats.isDirectory())).toBe(true);
});

test("CLI argument failures emit a typed refusal receipt on stdout", async () => {
  const script = path.join(import.meta.dir, "checkout-pr.ts");
  const child = Bun.spawn([process.execPath, script], { stdout: "pipe", stderr: "pipe" });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  expect(code).toBe(2);
  expect(stderr).toBe("");
  expect(JSON.parse(stdout)).toMatchObject({
    schema: checkoutSchema,
    outcome: "refused",
    code: "invalid_arguments",
    commands: [],
  });
});
