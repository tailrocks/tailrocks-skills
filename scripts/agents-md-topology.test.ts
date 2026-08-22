import { expect, test } from "bun:test";
import {
  lstat,
  mkdir,
  mkdtemp,
  opendir,
  readFile,
  readlink,
  realpath,
  rename,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  createClientLink,
  discoverTopology,
  repairClientLink,
  TopologyOperationError,
  topologyFailureReceipt,
  topologySchema,
  type TopologyIO,
} from "./agents-md-topology";

const script = path.join(import.meta.dir, "agents-md-topology.ts");

async function root(): Promise<string> {
  return realpath(await mkdtemp(path.join(tmpdir(), "agents-md-topology-")));
}

async function agents(directory: string, content = "# Instructions\n"): Promise<void> {
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "AGENTS.md"), content);
}

async function canonical(directory: string, client = "CLAUDE.md"): Promise<void> {
  await symlink("AGENTS.md", path.join(directory, client));
}

interface SnapshotEntry {
  readonly path: string;
  readonly kind: string;
  readonly value?: string;
}

async function snapshot(directory: string): Promise<SnapshotEntry[]> {
  const entries: SnapshotEntry[] = [];
  async function walk(current: string, relative: string): Promise<void> {
    const handle = await opendir(current);
    const children = [];
    for await (const child of handle) children.push(child);
    children.sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
    for (const child of children) {
      const childRelative = relative ? `${relative}/${child.name}` : child.name;
      const file = path.join(current, child.name);
      const stats = await lstat(file);
      if (stats.isDirectory()) {
        entries.push({ path: childRelative, kind: "directory" });
        await walk(file, childRelative);
      } else if (stats.isSymbolicLink()) {
        entries.push({ path: childRelative, kind: "symlink", value: await readlink(file) });
      } else if (stats.isFile()) {
        entries.push({ path: childRelative, kind: "regular", value: await readFile(file, "utf8") });
      } else entries.push({ path: childRelative, kind: "other" });
    }
  }
  await walk(directory, "");
  return entries;
}

test("discover returns sorted canonical root and nested topology without mutation", async () => {
  const directory = await root();
  await agents(directory, "root\n");
  await canonical(directory);
  await agents(path.join(directory, "zeta"), "zeta\n");
  await canonical(path.join(directory, "zeta"));
  await agents(path.join(directory, "alpha"), "alpha\n");
  await canonical(path.join(directory, "alpha"));
  await canonical(path.join(directory, "alpha"), "GEMINI.md");
  const before = await snapshot(directory);
  const receipt = await discoverTopology(directory);
  expect(receipt.schema).toBe(topologySchema);
  expect(receipt.valid).toBe(true);
  expect(receipt.directories.map((item) => item.directory)).toEqual([".", "alpha", "zeta"]);
  expect(receipt.directories[1]!.clients.map((item) => item.name)).toEqual(["CLAUDE.md", "GEMINI.md"]);
  expect(receipt.issues).toEqual([]);
  expect(receipt.mutations).toEqual([]);
  expect(await snapshot(directory)).toEqual(before);
});

test("discovery reports client-only, missing, regular, wrong, and unresolved states", async () => {
  const directory = await root();
  await mkdir(path.join(directory, "client-only"));
  await writeFile(path.join(directory, "client-only/CLAUDE.md"), "content\n");
  await agents(path.join(directory, "missing"));
  await agents(path.join(directory, "regular"));
  await writeFile(path.join(directory, "regular/CLAUDE.md"), "content\n");
  await agents(path.join(directory, "wrong"));
  await symlink("./AGENTS.md", path.join(directory, "wrong/CLAUDE.md"));
  await mkdir(path.join(directory, "broken"));
  await symlink("AGENTS.md", path.join(directory, "broken/CLAUDE.md"));
  const receipt = await discoverTopology(directory);
  expect(receipt.valid).toBe(false);
  expect(receipt.issues.map((issue) => issue.code).sort()).toEqual([
    "agents_missing",
    "agents_missing",
    "client_missing",
    "client_not_symlink",
    "client_not_symlink",
    "client_unresolved",
    "client_wrong_target",
  ]);
});

test("symlink loops become typed unresolved issues instead of aborting discovery", async () => {
  const directory = await root();
  await symlink("AGENTS.md", path.join(directory, "AGENTS.md"));
  await canonical(directory);
  const receipt = await discoverTopology(directory);
  expect(receipt.valid).toBe(false);
  expect(receipt.issues.map((issue) => issue.code)).toEqual(["agents_not_regular", "client_unresolved"]);
});

test("create accepts only a missing client beside regular AGENTS.md", async () => {
  const directory = await root();
  await agents(path.join(directory, "app"));
  const receipt = await createClientLink(directory, "app", "CLAUDE.md");
  expect(receipt.valid).toBe(true);
  expect(receipt.mutations).toEqual([
    {
      operation: "create",
      path: "app/CLAUDE.md",
      before: { kind: "missing" },
      after: { kind: "symlink", target: "AGENTS.md", resolves_to_agents: true },
    },
  ]);
  expect(await readlink(path.join(directory, "app/CLAUDE.md"))).toBe("AGENTS.md");
  await expect(createClientLink(directory, "app", "CLAUDE.md")).rejects.toThrow("requires missing");

  await mkdir(path.join(directory, "no-agents"));
  await expect(createClientLink(directory, "no-agents", "CLAUDE.md")).rejects.toThrow(
    "AGENTS.md must be regular",
  );
});

test("create rolls back when a post-success hook throws", async () => {
  const directory = await root();
  await agents(directory);
  let thrown = false;
  const io: TopologyIO = {
    afterOperation: async (operation) => {
      if (!thrown && operation === "create") {
        thrown = true;
        throw new Error("after-success");
      }
    },
  };
  await expect(createClientLink(directory, ".", "CLAUDE.md", io)).rejects.toThrow("after-success");
  expect((await snapshot(directory)).map((entry) => entry.path)).toEqual(["AGENTS.md"]);
});

test("create refuses wrong links, regular files, and directories unchanged", async () => {
  for (const kind of ["wrong", "regular", "directory"] as const) {
    const directory = await root();
    await agents(directory);
    const client = path.join(directory, "CLAUDE.md");
    if (kind === "wrong") await symlink("missing.md", client);
    else if (kind === "regular") await writeFile(client, "do not delete\n");
    else await mkdir(client);
    const before = await snapshot(directory);
    await expect(createClientLink(directory, ".", "CLAUDE.md")).rejects.toThrow("create requires missing");
    expect(await snapshot(directory)).toEqual(before);
  }
});

test("repair canonicalizes wrong and broken links with exact before receipts", async () => {
  for (const target of ["./AGENTS.md", "missing.md"]) {
    const directory = await root();
    await agents(directory);
    await symlink(target, path.join(directory, "CLAUDE.md"));
    const receipt = await repairClientLink(directory, ".", "CLAUDE.md", target);
    expect(receipt.valid).toBe(true);
    expect(receipt.mutations[0]).toMatchObject({
      operation: "repair",
      path: "CLAUDE.md",
      before: { kind: "symlink", target },
      after: { kind: "symlink", target: "AGENTS.md", resolves_to_agents: true },
    });
    expect(await readlink(path.join(directory, "CLAUDE.md"))).toBe("AGENTS.md");
    expect((await snapshot(directory)).filter((entry) => entry.path.includes(".topology-"))).toEqual([]);
  }
});

test("repair refuses stale expectations, canonical links, and non-symlinks unchanged", async () => {
  const states = ["stale", "canonical", "regular", "directory"] as const;
  for (const kind of states) {
    const directory = await root();
    await agents(directory);
    const client = path.join(directory, "CLAUDE.md");
    if (kind === "stale") await symlink("actual.md", client);
    else if (kind === "canonical") await canonical(directory);
    else if (kind === "regular") await writeFile(client, "keep\n");
    else await mkdir(client);
    const before = await snapshot(directory);
    const expected = kind === "stale" ? "expected.md" : kind === "canonical" ? "AGENTS.md" : "anything";
    await expect(repairClientLink(directory, ".", "CLAUDE.md", expected)).rejects.toThrow();
    expect(await snapshot(directory)).toEqual(before);
  }
});

test("repair install failure restores the original link and removes owned temporary links", async () => {
  const directory = await root();
  await agents(directory);
  await symlink("old.md", path.join(directory, "CLAUDE.md"));
  let operations = 0;
  const io: TopologyIO = {
    beforeOperation: async () => {
      operations += 1;
      if (operations === 3) throw new Error("injected install failure");
    },
  };
  await expect(repairClientLink(directory, ".", "CLAUDE.md", "old.md", io)).rejects.toThrow(
    "injected install failure",
  );
  expect(await readlink(path.join(directory, "CLAUDE.md"))).toBe("old.md");
  expect((await snapshot(directory)).filter((entry) => entry.path.includes(".topology-"))).toEqual([]);
});

test("repair restores the original when a post-remove hook throws", async () => {
  const directory = await root();
  await agents(directory);
  await symlink("old.md", path.join(directory, "CLAUDE.md"));
  let removes = 0;
  const io: TopologyIO = {
    afterOperation: async (operation) => {
      if (operation === "remove" && ++removes === 1) throw new Error("after-success");
    },
  };
  await expect(repairClientLink(directory, ".", "CLAUDE.md", "old.md", io)).rejects.toThrow("after-success");
  expect(await readlink(path.join(directory, "CLAUDE.md"))).toBe("old.md");
  expect((await snapshot(directory)).filter((entry) => entry.path.includes(".topology-"))).toEqual([]);
});

test("rollback failure retains and names the recovery artifact", async () => {
  const directory = await root();
  await agents(directory);
  await symlink("old.md", path.join(directory, "CLAUDE.md"));
  let operations = 0;
  const io: TopologyIO = {
    beforeOperation: async () => {
      operations += 1;
      if (operations >= 3) throw new Error(`injected operation ${operations}`);
    },
  };
  await expect(repairClientLink(directory, ".", "CLAUDE.md", "old.md", io)).rejects.toThrow(
    "recovery artifact may remain",
  );
  const recovery = (await snapshot(directory)).filter((entry) => entry.path.endsWith(".restore"));
  expect(recovery).toHaveLength(1);
  expect(recovery[0]).toMatchObject({ kind: "symlink", value: "old.md" });
});

test("CLI failure receipt preserves partial mutations and recovery paths", () => {
  const error = new TopologyOperationError(
    [new Error("primary"), new Error("rollback")],
    "repair failed",
    ["/repo/CLAUDE.md"],
    ["/repo/CLAUDE.md.topology-id.restore"],
  );
  expect(topologyFailureReceipt(error)).toMatchObject({
    schema: topologySchema,
    outcome: "failed",
    code: "topology_operation_failed",
    mutations: ["/repo/CLAUDE.md"],
    recovery_artifacts: ["/repo/CLAUDE.md.topology-id.restore"],
    causes: ["Error: primary", "Error: rollback"],
  });
});

test("repair never deletes a concurrently replaced canonical destination", async () => {
  const directory = await root();
  await agents(directory);
  await symlink("old.md", path.join(directory, "CLAUDE.md"));
  let creates = 0;
  const io: TopologyIO = {
    afterOperation: async (operation) => {
      if (operation === "create") creates += 1;
      if (creates === 2 && operation === "create") {
        const client = path.join(directory, "CLAUDE.md");
        await unlink(client);
        await symlink("AGENTS.md", client);
      }
    },
  };
  await expect(repairClientLink(directory, ".", "CLAUDE.md", "old.md", io)).rejects.toThrow(
    "recovery artifact may remain",
  );
  expect(await readlink(path.join(directory, "CLAUDE.md"))).toBe("AGENTS.md");
  const recovery = (await snapshot(directory)).filter((entry) => entry.path.endsWith(".restore"));
  expect(recovery).toHaveLength(1);
  expect(recovery[0]).toMatchObject({ kind: "symlink", value: "old.md" });
});

test("repair refuses final-cleanup replacement and recreates original recovery evidence", async () => {
  const directory = await root();
  await agents(directory);
  await symlink("old.md", path.join(directory, "CLAUDE.md"));
  let removes = 0;
  const io: TopologyIO = {
    beforeOperation: async (operation) => {
      if (operation !== "remove" || ++removes !== 2) return;
      const client = path.join(directory, "CLAUDE.md");
      await unlink(client);
      await symlink("foreign.md", client);
    },
  };
  await expect(repairClientLink(directory, ".", "CLAUDE.md", "old.md", io)).rejects.toThrow(
    "recovery artifact may remain",
  );
  expect(await readlink(path.join(directory, "CLAUDE.md"))).toBe("foreign.md");
  const recovery = (await snapshot(directory)).filter((entry) => entry.path.endsWith(".restore"));
  expect(recovery).toHaveLength(1);
  expect(recovery[0]).toMatchObject({ kind: "symlink", value: "old.md" });
});

test("create refuses a swapped parent before any outside-root mutation", async () => {
  const directory = await root();
  const app = path.join(directory, "app");
  const moved = path.join(directory, "moved");
  const outside = await root();
  await agents(app);
  const io: TopologyIO = {
    beforeOperation: async () => {
      await rename(app, moved);
      await symlink(outside, app);
    },
  };
  await expect(createClientLink(directory, "app", "CLAUDE.md", io)).rejects.toThrow(
    "anchored directory identity changed",
  );
  expect((await snapshot(outside)).some((entry) => entry.path === "CLAUDE.md")).toBe(false);
});

test("absolute, traversing, symlinked, and invalid client paths are refused", async () => {
  const directory = await root();
  await agents(path.join(directory, "real"));
  await symlink("real", path.join(directory, "linked"));
  for (const bad of ["../real", "/tmp", "real\\child", "real//child"]) {
    await expect(createClientLink(directory, bad, "CLAUDE.md")).rejects.toThrow();
  }
  await expect(createClientLink(directory, "linked", "CLAUDE.md")).rejects.toThrow("contains symlink");
  for (const bad of ["AGENTS.md", "../CLAUDE.md", "sub/CLAUDE.md", "claude.md"]) {
    await expect(createClientLink(directory, "real", bad)).rejects.toThrow("invalid client");
  }
});

async function run(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  const child = Bun.spawn([process.execPath, script, ...args], {
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  return { code, stdout, stderr };
}

test("CLI emits typed receipts; verify is nonzero on issues", async () => {
  const directory = await root();
  await agents(directory);
  const discover = await run(["discover", "--root", directory]);
  expect(discover.code).toBe(0);
  expect(JSON.parse(discover.stdout)).toMatchObject({
    schema: topologySchema,
    mode: "discover",
    valid: false,
    mutations: [],
  });
  const verify = await run(["verify", "--root", directory]);
  expect(verify.code).toBe(2);
  expect(JSON.parse(verify.stdout).issues[0].code).toBe("client_missing");
  const invalid = await run(["create", "--root", directory, "--directory", ".", "--client", "bad.md"]);
  expect(invalid.code).toBe(2);
  expect(JSON.parse(invalid.stdout)).toMatchObject({
    schema: topologySchema,
    outcome: "refused",
    code: "invalid_arguments",
  });
});
