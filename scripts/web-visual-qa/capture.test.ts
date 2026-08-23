import { expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runCapture, runChild, type CommandResult, type Runner, type ServerHandle } from "./capture";

const head = "a".repeat(40);
async function project(): Promise<string> {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "web-visual-qa-capture-")));
  await writeFile(path.join(root, "app.ts"), "export const app = true;\n");
  await mkdir(path.join(root, "node_modules/vite/bin"), { recursive: true });
  await writeFile(path.join(root, "node_modules/vite/bin/vite.js"), "// vite\n");
  await mkdir(path.join(root, "node_modules/@playwright/test"), { recursive: true });
  await writeFile(path.join(root, "node_modules/@playwright/test/cli.js"), "// playwright\n");
  return root;
}
function ok(stdout = ""): CommandResult {
  return { code: 0, stdout, stderr: "" };
}
function runner(commands: string[][], root: string): Runner {
  return async (command) => {
    commands.push([...command]);
    const key = command.join(" ");
    if (key === "git rev-parse --show-toplevel") return ok(`${root}\n`);
    if (key === "git rev-parse HEAD") return ok(`${head}\n`);
    if (key === "git ls-files -z --cached --others --exclude-standard") return ok("app.ts\0");
    if (key.includes("node_modules/@playwright/test/cli.js test")) return ok();
    return { code: 127, stdout: "", stderr: `unexpected ${key}` };
  };
}
function guard(env: Record<string, string>, pid = 4242): Response {
  return Response.json(
    {
      schema: "tailrocks.web-visual-qa-guard/v1",
      revision: env.TAILROCKS_VISUAL_QA_REVISION,
      nonce: env.TAILROCKS_VISUAL_QA_NONCE,
      pid,
      designRoutes: true,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

test("exact guard runs Playwright and bounds owned cleanup", async () => {
  const root = await project();
  const commands: string[][] = [];
  let env: Record<string, string> | undefined;
  let fetches = 0;
  let stopped = false;
  let resolve!: (code: number) => void;
  const handle: ServerHandle = {
    pid: 4242,
    exited: new Promise((done) => {
      resolve = done;
    }),
    kill: () => {
      if (!stopped) {
        stopped = true;
        resolve(0);
      }
    },
  };
  const result = await runCapture(
    { root, port: 43123, updateSnapshots: false },
    {
      run: runner(commands, root),
      nonce: () => "b".repeat(64),
      spawnServer: (_command, _cwd, environment) => {
        env = environment;
        return handle;
      },
      fetch: (async () => {
        fetches += 1;
        if (fetches === 1) throw new Error("closed");
        return guard(env!);
      }) as typeof fetch,
      sleep: async () => {},
    },
  );
  expect(result).toMatchObject({
    outcome: "captured",
    code: "captured",
    guardVerified: true,
    serverPid: 4242,
  });
  expect(
    commands.some((command) => command.includes(path.join(root, "node_modules/@playwright/test/cli.js"))),
  ).toBe(true);
  expect(stopped).toBe(true);
  expect(JSON.stringify(result)).not.toContain("b".repeat(64));
});

test("live unrelated HTTP server refuses before spawn and Playwright", async () => {
  const root = await project();
  const commands: string[][] = [];
  let spawned = false;
  const http = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch: () => new Response("unrelated") });
  try {
    const result = await runCapture(
      { root, port: http.port, updateSnapshots: true },
      {
        run: runner(commands, root),
        nonce: () => "c".repeat(64),
        spawnServer: () => {
          spawned = true;
          throw new Error("must not spawn");
        },
      },
    );
    expect(result).toMatchObject({ outcome: "refused", code: "wrong_server", guardVerified: false });
    expect(spawned).toBe(false);
    expect(commands.some((command) => command.includes("playwright"))).toBe(false);
  } finally {
    http.stop(true);
  }
});

test("live stale guard refuses before spawn and Playwright", async () => {
  const root = await project();
  const commands: string[][] = [];
  let spawned = false;
  const stale = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    fetch: () =>
      Response.json(
        {
          schema: "tailrocks.web-visual-qa-guard/v1",
          revision: "stale",
          nonce: "stale",
          pid: process.pid,
          designRoutes: true,
        },
        { headers: { "Cache-Control": "no-store" } },
      ),
  });
  try {
    const result = await runCapture(
      { root, port: stale.port, updateSnapshots: false },
      {
        run: runner(commands, root),
        nonce: () => "e".repeat(64),
        spawnServer: () => {
          spawned = true;
          throw new Error("must not spawn");
        },
      },
    );
    expect(result).toMatchObject({ outcome: "refused", code: "wrong_server" });
    expect(spawned).toBe(false);
    expect(commands.some((command) => command.includes("playwright"))).toBe(false);
  } finally {
    stale.stop(true);
  }
});

test("stale guard identity refuses and never runs Playwright", async () => {
  const root = await project();
  const commands: string[][] = [];
  let env: Record<string, string> | undefined;
  let fetches = 0;
  let resolve!: (code: number) => void;
  const handle: ServerHandle = {
    pid: 4242,
    exited: new Promise((done) => {
      resolve = done;
    }),
    kill: () => resolve(0),
  };
  const result = await runCapture(
    { root, port: 43124, updateSnapshots: false },
    {
      run: runner(commands, root),
      nonce: () => "d".repeat(64),
      spawnServer: (_c, _r, value) => {
        env = value;
        return handle;
      },
      fetch: (async () => {
        fetches += 1;
        if (fetches === 1) throw new Error("closed");
        return guard(env!, 9999);
      }) as typeof fetch,
      sleep: async () => {},
    },
  );
  expect(result).toMatchObject({ outcome: "refused", code: "guard_mismatch" });
  expect(commands.some((command) => command.includes("playwright"))).toBe(false);
});

test("replaced guard after Playwright refuses before baseline publication", async () => {
  const root = await project();
  const commands: string[][] = [];
  let env: Record<string, string> | undefined;
  let fetches = 0;
  let stopped = false;
  let resolve!: (code: number) => void;
  const handle: ServerHandle = {
    pid: 4242,
    exited: new Promise((done) => {
      resolve = done;
    }),
    kill: () => {
      stopped = true;
      resolve(0);
    },
  };
  const result = await runCapture(
    { root, port: 43128, updateSnapshots: true },
    {
      run: runner(commands, root),
      nonce: () => "3".repeat(64),
      spawnServer: (_command, _cwd, environment) => {
        env = environment;
        return handle;
      },
      fetch: (async () => {
        fetches += 1;
        if (fetches === 1) throw new Error("closed");
        return guard(env!, fetches === 2 ? 4242 : 9999);
      }) as typeof fetch,
      sleep: async () => {},
    },
  );
  expect(result).toMatchObject({ outcome: "refused", code: "guard_mismatch", guardVerified: true });
  expect(
    commands.some((command) => command.includes(path.join(root, "node_modules/@playwright/test/cli.js"))),
  ).toBe(true);
  expect(await Bun.file(path.join(root, "tests/visual/settings.spec.ts-snapshots")).exists()).toBe(false);
  expect(stopped).toBe(true);
});

test("publishes staged baselines only after final owned-revision proof", async () => {
  const root = await project();
  const commands: string[][] = [];
  let env: Record<string, string> | undefined;
  let fetches = 0;
  let resolve!: (code: number) => void;
  const handle: ServerHandle = {
    pid: 4242,
    exited: new Promise((done) => {
      resolve = done;
    }),
    kill: () => resolve(0),
  };
  const base = runner(commands, root);
  const run: Runner = async (command, cwd, environment) => {
    if (command.includes(path.join(root, "node_modules/@playwright/test/cli.js"))) {
      commands.push([...command]);
      const staging = environment?.TAILROCKS_VISUAL_QA_SNAPSHOT_STAGING;
      expect(staging).toBeTruthy();
      const directory = path.join(staging!, "settings.spec.ts-snapshots");
      await mkdir(directory, { recursive: true });
      const png = Buffer.alloc(1_024);
      Buffer.from("89504e470d0a1a0a", "hex").copy(png);
      await writeFile(path.join(directory, "settings-desktop-darwin.png"), png);
      return ok();
    }
    return base(command, cwd, environment);
  };
  const result = await runCapture(
    { root, port: 43125, updateSnapshots: true },
    {
      run,
      nonce: () => "f".repeat(64),
      spawnServer: (_command, _cwd, environment) => {
        env = environment;
        return handle;
      },
      fetch: (async () => {
        fetches += 1;
        if (fetches === 1) throw new Error("closed");
        return guard(env!);
      }) as typeof fetch,
      sleep: async () => {},
    },
  );
  expect(result).toMatchObject({ outcome: "captured", updateSnapshots: true });
  const published = await readFile(
    path.join(root, "tests/visual/settings.spec.ts-snapshots/settings-desktop-darwin.png"),
  );
  expect(published.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
});

test("snapshot publication race refuses without deleting concurrent replacement", async () => {
  const root = await project();
  const commands: string[][] = [];
  let env: Record<string, string> | undefined;
  let fetches = 0;
  let resolve!: (code: number) => void;
  const handle: ServerHandle = {
    pid: 4242,
    exited: new Promise((done) => {
      resolve = done;
    }),
    kill: () => resolve(0),
  };
  const base = runner(commands, root);
  const run: Runner = async (command, cwd, environment) => {
    if (command.includes(path.join(root, "node_modules/@playwright/test/cli.js"))) {
      commands.push([...command]);
      const directory = path.join(
        environment!.TAILROCKS_VISUAL_QA_SNAPSHOT_STAGING!,
        "settings.spec.ts-snapshots",
      );
      await mkdir(directory, { recursive: true });
      const png = Buffer.alloc(1_024);
      Buffer.from("89504e470d0a1a0a", "hex").copy(png);
      await writeFile(path.join(directory, "settings-desktop-darwin.png"), png);
      return ok();
    }
    return base(command, cwd, environment);
  };
  const replacement = Buffer.alloc(1_024, 7);
  Buffer.from("89504e470d0a1a0a", "hex").copy(replacement);
  const target = path.join(root, "tests/visual/settings.spec.ts-snapshots/settings-desktop-darwin.png");
  const result = await runCapture(
    { root, port: 43127, updateSnapshots: true },
    {
      run,
      nonce: () => "2".repeat(64),
      spawnServer: (_command, _cwd, environment) => {
        env = environment;
        return handle;
      },
      fetch: (async () => {
        fetches += 1;
        if (fetches === 1) throw new Error("closed");
        return guard(env!);
      }) as typeof fetch,
      sleep: async () => {},
      afterSnapshotPublish: async (_source, destination) => {
        await rm(destination);
        await writeFile(destination, replacement);
      },
    },
  );
  expect(result).toMatchObject({ outcome: "failed", code: "playwright_failed" });
  expect(await readFile(target)).toEqual(replacement);
});

test("HEAD drift after Playwright refuses staged publication", async () => {
  const root = await project();
  const commands: string[][] = [];
  let headReads = 0;
  let env: Record<string, string> | undefined;
  let fetches = 0;
  let resolve!: (code: number) => void;
  const handle: ServerHandle = {
    pid: 4242,
    exited: new Promise((done) => {
      resolve = done;
    }),
    kill: () => resolve(0),
  };
  const base = runner(commands, root);
  const run: Runner = async (command, cwd, environment) => {
    if (command.join(" ") === "git rev-parse HEAD") {
      commands.push([...command]);
      headReads += 1;
      return ok(`${headReads >= 4 ? "b".repeat(40) : head}\n`);
    }
    return base(command, cwd, environment);
  };
  const result = await runCapture(
    { root, port: 43126, updateSnapshots: false },
    {
      run,
      nonce: () => "1".repeat(64),
      spawnServer: (_command, _cwd, environment) => {
        env = environment;
        return handle;
      },
      fetch: (async () => {
        fetches += 1;
        if (fetches === 1) throw new Error("closed");
        return guard(env!);
      }) as typeof fetch,
      sleep: async () => {},
    },
  );
  expect(result).toMatchObject({ outcome: "refused", code: "guard_mismatch" });
  expect(
    commands.some((command) => command.includes(path.join(root, "node_modules/@playwright/test/cli.js"))),
  ).toBe(true);
});

test("bounded command runner kills a child that ignores SIGTERM", async () => {
  const root = await project();
  const started = performance.now();
  const result = await runChild(
    ["bun", "-e", "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000)"],
    root,
    undefined,
    50,
    50,
  );
  expect(result).toMatchObject({ code: 124, stderr: "command timed out" });
  expect(performance.now() - started).toBeLessThan(2_000);
});

test("capture CLI rejects unknown, duplicate, and trailing arguments with one receipt", async () => {
  for (const args of [
    ["--unknown"],
    ["freeze", "--root", "/tmp"],
    ["harness", "--root", "/tmp"],
    ["baseline", "--root", "/tmp", "--update-snapshots"],
    ["regress", "--root", "/tmp", "--root", "/tmp"],
    ["regress", "--root"],
  ]) {
    const result = await runChild(["bun", "capture.ts", ...args], import.meta.dir, undefined, 2_000, 100);
    expect(result.code).toBe(2);
    expect(result.stderr).toBe("");
    expect(result.stdout.trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(result.stdout)).toMatchObject({ outcome: "refused", code: "invalid_arguments" });
  }
});
