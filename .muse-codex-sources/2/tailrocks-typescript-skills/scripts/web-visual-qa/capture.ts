import { createHash, randomBytes } from "node:crypto";
import {
  chmod,
  link,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runBoundedCommand } from "../bounded-command";

export const captureSchema = "tailrocks.web-visual-qa-capture/v1";
type Outcome = "captured" | "refused" | "failed";
type Code =
  | "captured"
  | "invalid_arguments"
  | "invalid_root"
  | "wrong_server"
  | "launch_failed"
  | "guard_timeout"
  | "guard_mismatch"
  | "playwright_failed"
  | "cleanup_failed";

export interface CommandResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}
export type Runner = (
  command: readonly string[],
  cwd: string,
  env?: Record<string, string>,
) => Promise<CommandResult>;
export interface ServerHandle {
  readonly pid: number;
  readonly exited: Promise<number>;
  kill(signal: "SIGTERM" | "SIGKILL"): void;
}
export interface Runtime {
  readonly run?: Runner;
  readonly spawnServer?: (
    command: readonly string[],
    cwd: string,
    env: Record<string, string>,
  ) => ServerHandle;
  readonly fetch?: typeof fetch;
  readonly sleep?: (milliseconds: number) => Promise<void>;
  readonly nonce?: () => string;
  readonly afterSnapshotPublish?: (source: string, target: string, index: number) => Promise<void>;
}
export interface CaptureReceipt {
  readonly schema: typeof captureSchema;
  readonly outcome: Outcome;
  readonly code: Code;
  readonly root?: string;
  readonly revision?: string;
  readonly port?: number;
  readonly serverPid?: number;
  readonly guardVerified: boolean;
  readonly updateSnapshots: boolean;
  readonly commands: readonly (readonly string[])[];
  readonly detail: string;
}

export async function runChild(
  command: readonly string[],
  cwd: string,
  env: Record<string, string> | undefined,
  timeoutMilliseconds: number,
  killGraceMilliseconds = 5_000,
  inheritEnvironment = true,
): Promise<CommandResult> {
  return runBoundedCommand({
    command,
    cwd,
    env,
    timeoutMilliseconds,
    killGraceMilliseconds,
    inheritEnvironment,
  });
}
const defaultRunner: Runner = (command, cwd, env) =>
  runChild(command, cwd, env, command.includes("playwright") ? 300_000 : 30_000, 5_000, false);
const defaultSpawn = (command: readonly string[], cwd: string, env: Record<string, string>): ServerHandle => {
  const child = Bun.spawn(command, {
    cwd,
    env: {
      PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
      HOME: process.env.HOME ?? "",
      USER: process.env.USER ?? "",
      LOGNAME: process.env.LOGNAME ?? "",
      TMPDIR: process.env.TMPDIR ?? tmpdir(),
      ...env,
    },
    detached: true,
    stdin: "ignore",
    stdout: "ignore",
    stderr: "ignore",
  });
  return {
    pid: child.pid,
    exited: child.exited,
    kill: (signal) => {
      try {
        process.kill(-child.pid, signal);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
      }
    },
  };
};

async function safeRoot(input: string): Promise<string> {
  const absolute = path.resolve(input);
  const info = await lstat(absolute);
  if (!info.isDirectory() || info.isSymbolicLink() || (await realpath(absolute)) !== absolute)
    throw new Error("root must be canonical real directory");
  return absolute;
}
function receipt(
  code: Code,
  outcome: Outcome,
  updateSnapshots: boolean,
  commands: readonly (readonly string[])[],
  detail: string,
): CaptureReceipt {
  return { schema: captureSchema, outcome, code, guardVerified: false, updateSnapshots, commands, detail };
}
async function boundedStop(
  server: ServerHandle,
  sleep: (milliseconds: number) => Promise<void>,
): Promise<boolean> {
  let exited = false;
  void server.exited.then(() => {
    exited = true;
  });
  server.kill("SIGTERM");
  for (let attempt = 0; attempt < 20 && !exited; attempt += 1) await sleep(100);
  if (exited) return true;
  server.kill("SIGKILL");
  for (let attempt = 0; attempt < 20 && !exited; attempt += 1) await sleep(100);
  return exited;
}
async function probe(
  fetcher: typeof fetch,
  url: string,
  nonce: string,
  timeoutMilliseconds = 500,
): Promise<Response | undefined> {
  try {
    return await fetcher(url, {
      cache: "no-store",
      redirect: "manual",
      headers: { "X-Tailrocks-Visual-Session": nonce },
      signal: AbortSignal.timeout(timeoutMilliseconds),
    });
  } catch {
    return undefined;
  }
}

async function sourceRevision(
  root: string,
  expectedHead: string,
  run: Runner,
  commands: (readonly string[])[],
): Promise<string> {
  const headCommand = ["git", "rev-parse", "HEAD"] as const;
  commands.push(headCommand);
  const currentHead = await run(headCommand, root);
  const head = currentHead.stdout.trim();
  if (currentHead.code !== 0 || head !== expectedHead) throw new Error("Git HEAD changed during capture");
  const command = ["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard"] as const;
  commands.push(command);
  const listed = await run(command, root);
  if (listed.code !== 0 || Buffer.byteLength(listed.stdout) > 10_000_000)
    throw new Error("source inventory failed");
  const files = listed.stdout
    .split("\0")
    .filter(
      (file) =>
        file &&
        !file.startsWith("test-results/") &&
        !file.startsWith("playwright-report/") &&
        !/^tests\/visual\/.*-snapshots\/.*\.png$/.test(file),
    )
    .sort();
  if (files.length === 0 || files.length > 10_000) throw new Error("source inventory count invalid");
  const digest = createHash("sha256");
  digest.update(`tailrocks.web-source/v1\0${head}\0`);
  let bytes = 0;
  for (const relative of files) {
    if (path.isAbsolute(relative) || relative.split(/[\\/]/).includes(".."))
      throw new Error("source path escaped");
    const absolute = path.join(root, relative);
    const info = await lstat(absolute);
    if (!info.isFile() || info.isSymbolicLink() || (await realpath(absolute)) !== absolute)
      throw new Error(`source is not canonical regular file: ${relative}`);
    bytes += info.size;
    if (bytes > 200_000_000) throw new Error("source inventory bytes saturated");
    const body = await readFile(absolute);
    const after = await lstat(absolute);
    if (after.size !== info.size || after.mtimeMs !== info.mtimeMs)
      throw new Error(`source raced: ${relative}`);
    digest.update(`${relative}\0${info.mode & 0o777}\0${body.length}\0`);
    digest.update(body);
  }
  return digest.digest("hex");
}

function exactGuard(value: unknown, expected: Record<string, unknown>): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    JSON.stringify(Object.keys(record).sort()) === JSON.stringify(Object.keys(expected).sort()) &&
    Object.entries(expected).every(([key, expectedValue]) => record[key] === expectedValue)
  );
}

async function pngFiles(root: string, current = root): Promise<string[]> {
  const found: string[] = [];
  for (const entry of await readdir(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) found.push(...(await pngFiles(root, absolute)));
    else if (entry.isFile() && entry.name.endsWith(".png")) found.push(path.relative(root, absolute));
    else if (!entry.name.startsWith(".backup")) throw new Error(`unexpected staged capture: ${entry.name}`);
  }
  return found.sort();
}

async function publishSnapshots(
  root: string,
  staging: string,
  afterPublish?: (source: string, target: string, index: number) => Promise<void>,
  finalProof?: () => Promise<boolean>,
): Promise<number> {
  const files = await pngFiles(staging);
  if (files.length === 0 || files.length > 2_000) throw new Error("staged screenshot count invalid");
  const finalRoot = path.join(root, "tests/visual");
  await mkdir(finalRoot, { recursive: true });
  if ((await realpath(finalRoot)) !== finalRoot) throw new Error("snapshot root is unsafe");
  const backupRoot = path.join(staging, ".backups");
  await mkdir(backupRoot, { mode: 0o700 });
  const published: { target: string; dev: number; ino: number; backup?: string }[] = [];
  try {
    for (const [index, relative] of files.entries()) {
      const source = path.join(staging, relative);
      const before = await lstat(source);
      if (!before.isFile() || before.isSymbolicLink() || (await realpath(source)) !== source)
        throw new Error(`unsafe staged PNG: ${relative}`);
      const bytes = await readFile(source);
      if (bytes.length < 1_024 || bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a")
        throw new Error(`invalid staged PNG: ${relative}`);
      const sourceIdentity = await lstat(source);
      if (
        !sourceIdentity.isFile() ||
        sourceIdentity.isSymbolicLink() ||
        sourceIdentity.dev !== before.dev ||
        sourceIdentity.ino !== before.ino ||
        sourceIdentity.size !== before.size ||
        sourceIdentity.mtimeMs !== before.mtimeMs
      )
        throw new Error(`staged PNG changed during validation: ${relative}`);
      const target = path.join(finalRoot, relative);
      await mkdir(path.dirname(target), { recursive: true });
      if ((await realpath(path.dirname(target))) !== path.dirname(target))
        throw new Error("snapshot ancestor is unsafe");
      let backup: string | undefined;
      try {
        const original = await lstat(target);
        if (!original.isFile() || original.isSymbolicLink()) throw new Error("existing baseline is unsafe");
        backup = path.join(backupRoot, String(index));
        await rename(target, backup);
        const moved = await lstat(backup);
        if (moved.dev !== original.dev || moved.ino !== original.ino) {
          await link(backup, target).catch(() => undefined);
          throw new Error("baseline changed during backup");
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      try {
        await link(source, target);
      } catch (error) {
        if (backup) await link(backup, target).catch(() => undefined);
        throw error;
      }
      const publishedIdentity = await lstat(target);
      published.push({ target, dev: publishedIdentity.dev, ino: publishedIdentity.ino, backup });
      await afterPublish?.(source, target, index);
      const identity = await lstat(target);
      if (identity.dev !== sourceIdentity.dev || identity.ino !== sourceIdentity.ino)
        throw new Error("baseline changed during publication");
    }
    if (finalProof && !(await finalProof())) throw new Error("source changed after snapshot publication");
    return files.length;
  } catch (error) {
    for (const item of published.reverse()) {
      try {
        const current = await lstat(item.target);
        if (current.dev === item.dev && current.ino === item.ino) await rm(item.target);
      } catch {}
      if (item.backup) {
        try {
          await link(item.backup, item.target);
        } catch {}
      }
    }
    throw error;
  }
}

export async function runCapture(
  options: { root: string; port: number; updateSnapshots: boolean },
  runtime: Runtime = {},
): Promise<CaptureReceipt> {
  const commands: (readonly string[])[] = [];
  let root: string;
  try {
    root = await safeRoot(options.root);
  } catch (error) {
    return receipt("invalid_root", "refused", options.updateSnapshots, commands, String(error));
  }
  if (!Number.isInteger(options.port) || options.port < 1024 || options.port > 65_535)
    return {
      ...receipt(
        "invalid_arguments",
        "refused",
        options.updateSnapshots,
        commands,
        "port must be 1024..65535",
      ),
      root,
    };
  const run = runtime.run ?? defaultRunner;
  const fetcher = runtime.fetch ?? fetch;
  const sleep = runtime.sleep ?? Bun.sleep;
  const spawn = runtime.spawnServer ?? defaultSpawn;
  const topCommand = ["git", "rev-parse", "--show-toplevel"] as const;
  commands.push(topCommand);
  const top = await run(topCommand, root);
  if (top.code !== 0 || !top.stdout.trim() || (await realpath(top.stdout.trim()).catch(() => "")) !== root)
    return {
      ...receipt(
        "invalid_root",
        "refused",
        options.updateSnapshots,
        commands,
        "root is not the Git top level",
      ),
      root,
      port: options.port,
    };
  const git = ["git", "rev-parse", "HEAD"] as const;
  commands.push(git);
  const head = await run(git, root);
  const headRevision = head.stdout.trim();
  if (head.code !== 0 || !/^[0-9a-f]{40}$/.test(headRevision))
    return {
      ...receipt("invalid_root", "refused", options.updateSnapshots, commands, "Git HEAD unavailable"),
      root,
      port: options.port,
    };
  let revision: string;
  try {
    revision = await sourceRevision(root, headRevision, run, commands);
  } catch (error) {
    return {
      ...receipt("invalid_root", "refused", options.updateSnapshots, commands, String(error)),
      root,
      port: options.port,
    };
  }
  const sourceUnchanged = async (): Promise<boolean> => {
    try {
      return (await sourceRevision(root, headRevision, run, commands)) === revision;
    } catch {
      return false;
    }
  };
  const baseURL = `http://127.0.0.1:${options.port}`;
  const occupied = await probe(fetcher, `${baseURL}/api/tailrocks-visual-qa`, "preflight");
  if (occupied)
    return {
      ...receipt(
        "wrong_server",
        "refused",
        options.updateSnapshots,
        commands,
        `port ${options.port} already serves HTTP`,
      ),
      root,
      revision,
      port: options.port,
    };
  const nonce = (runtime.nonce ?? (() => randomBytes(32).toString("hex")))();
  if (!/^[0-9a-f]{64}$/.test(nonce))
    return {
      ...receipt("invalid_arguments", "refused", options.updateSnapshots, commands, "nonce source invalid"),
      root,
      revision,
      port: options.port,
    };
  const vite = path.join(root, "node_modules/vite/bin/vite.js");
  const playwright = path.join(root, "node_modules/@playwright/test/cli.js");
  let bunExecutable: string;
  try {
    const info = await lstat(vite);
    if (!info.isFile() || info.isSymbolicLink() || (await realpath(vite)) !== vite) throw new Error();
    const playwrightInfo = await lstat(playwright);
    if (
      !playwrightInfo.isFile() ||
      playwrightInfo.isSymbolicLink() ||
      (await realpath(playwright)) !== playwright
    )
      throw new Error();
    bunExecutable = await realpath(process.execPath);
    const bunInfo = await lstat(bunExecutable);
    if (!bunInfo.isFile() || bunInfo.isSymbolicLink()) throw new Error();
  } catch {
    return {
      ...receipt(
        "invalid_root",
        "refused",
        options.updateSnapshots,
        commands,
        "Bun, project-local Vite, or project-local Playwright entrypoint missing or unsafe",
      ),
      root,
      revision,
      port: options.port,
    };
  }
  const outputDirectory = await realpath(await mkdtemp(path.join(tmpdir(), "tailrocks-web-visual-output-")));
  await chmod(outputDirectory, 0o700);
  const runtimeHome = path.join(outputDirectory, "home");
  const runtimeTemp = path.join(outputDirectory, "tmp");
  const runtimeCache = path.join(outputDirectory, "cache");
  await Promise.all([
    mkdir(runtimeHome, { mode: 0o700 }),
    mkdir(runtimeTemp, { mode: 0o700 }),
    mkdir(runtimeCache, { mode: 0o700 }),
  ]);
  const environment: Record<string, string> = {
    PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
    HOME: runtimeHome,
    USER: process.env.USER ?? "",
    LOGNAME: process.env.LOGNAME ?? "",
    TMPDIR: runtimeTemp,
    XDG_CACHE_HOME: runtimeCache,
    TAILROCKS_VISUAL_QA: "1",
    TAILROCKS_VISUAL_QA_BASE_URL: baseURL,
    TAILROCKS_VISUAL_QA_REVISION: revision,
    TAILROCKS_VISUAL_QA_NONCE: nonce,
    VITE_DESIGN_ROUTES: "1",
  };
  environment.TAILROCKS_VISUAL_QA_OUTPUT_DIR = outputDirectory;
  let staging: string | undefined;
  let keepStaging = false;
  if (options.updateSnapshots) {
    staging = await realpath(await mkdtemp(path.join(tmpdir(), "tailrocks-web-visual-baseline-")));
    environment.TAILROCKS_VISUAL_QA_SNAPSHOT_STAGING = staging;
  }
  const serverCommand = [
    bunExecutable,
    vite,
    "--host",
    "127.0.0.1",
    "--port",
    String(options.port),
    "--strictPort",
  ] as const;
  commands.push(serverCommand);
  let server: ServerHandle;
  try {
    server = spawn(serverCommand, root, environment);
  } catch (error) {
    if (staging) await rm(staging, { recursive: true, force: true });
    await rm(outputDirectory, { recursive: true, force: true });
    return {
      ...receipt("launch_failed", "failed", options.updateSnapshots, commands, String(error)),
      root,
      revision,
      port: options.port,
    };
  }
  let cleanup = true;
  environment.TAILROCKS_VISUAL_QA_PID = String(server.pid);
  try {
    const expected = {
      schema: "tailrocks.web-visual-qa-guard/v1",
      revision,
      nonce,
      pid: server.pid,
      designRoutes: true,
    };
    let verified = false;
    const readinessDeadline = Date.now() + 10_000;
    for (let attempt = 0; attempt < 100 && Date.now() < readinessDeadline; attempt += 1) {
      const response = await probe(
        fetcher,
        `${baseURL}/api/tailrocks-visual-qa`,
        nonce,
        Math.max(1, Math.min(500, readinessDeadline - Date.now())),
      );
      if (response) {
        if (
          !response.ok ||
          response.status !== 200 ||
          response.redirected ||
          !response.headers.get("content-type")?.startsWith("application/json") ||
          response.headers.get("cache-control") !== "no-store"
        )
          return {
            ...receipt(
              "guard_mismatch",
              "refused",
              options.updateSnapshots,
              commands,
              `guard response invalid: ${response.status}`,
            ),
            root,
            revision,
            port: options.port,
            serverPid: server.pid,
          };
        let body: unknown;
        try {
          body = await response.json();
        } catch {
          body = undefined;
        }
        if (!exactGuard(body, expected))
          return {
            ...receipt(
              "guard_mismatch",
              "refused",
              options.updateSnapshots,
              commands,
              "guard identity mismatch",
            ),
            root,
            revision,
            port: options.port,
            serverPid: server.pid,
          };
        verified = true;
        break;
      }
      const state = await Promise.race([
        server.exited.then((code) => ({ exited: true, code })),
        sleep(Math.max(1, Math.min(100, readinessDeadline - Date.now()))).then(() => ({
          exited: false,
          code: 0,
        })),
      ]);
      if (state.exited)
        return {
          ...receipt(
            "launch_failed",
            "failed",
            options.updateSnapshots,
            commands,
            `server exited ${state.code}`,
          ),
          root,
          revision,
          port: options.port,
          serverPid: server.pid,
        };
    }
    if (!verified)
      return {
        ...receipt(
          "guard_timeout",
          "failed",
          options.updateSnapshots,
          commands,
          "guard did not become ready within 10 seconds",
        ),
        root,
        revision,
        port: options.port,
        serverPid: server.pid,
      };
    if (!(await sourceUnchanged()))
      return {
        ...receipt(
          "guard_mismatch",
          "refused",
          options.updateSnapshots,
          commands,
          "source revision changed before capture",
        ),
        root,
        revision,
        port: options.port,
        serverPid: server.pid,
        guardVerified: true,
      };
    const playwrightCommand = [
      bunExecutable,
      playwright,
      "test",
      "--config",
      "playwright.visual.config.ts",
      ...(options.updateSnapshots ? ["--update-snapshots"] : []),
    ];
    commands.push(playwrightCommand);
    const result = await run(playwrightCommand, root, environment);
    if (result.code !== 0)
      return {
        ...receipt(
          "playwright_failed",
          "failed",
          options.updateSnapshots,
          commands,
          result.stderr.trim() || "Playwright failed",
        ),
        root,
        revision,
        port: options.port,
        serverPid: server.pid,
        guardVerified: true,
      };
    const finalGuard = await probe(fetcher, `${baseURL}/api/tailrocks-visual-qa`, nonce);
    let finalBody: unknown;
    try {
      finalBody = finalGuard && (await finalGuard.json());
    } catch {
      finalBody = undefined;
    }
    if (
      !finalGuard ||
      !finalGuard.ok ||
      finalGuard.status !== 200 ||
      finalGuard.redirected ||
      finalGuard.headers.get("cache-control") !== "no-store" ||
      !finalGuard.headers.get("content-type")?.startsWith("application/json") ||
      !exactGuard(finalBody, expected) ||
      !(await sourceUnchanged())
    )
      return {
        ...receipt(
          "guard_mismatch",
          "refused",
          options.updateSnapshots,
          commands,
          "owned guard or source changed after capture",
        ),
        root,
        revision,
        port: options.port,
        serverPid: server.pid,
        guardVerified: true,
      };
    if (staging) {
      try {
        keepStaging = true;
        await publishSnapshots(root, staging, runtime.afterSnapshotPublish, sourceUnchanged);
        keepStaging = false;
      } catch (error) {
        return {
          ...receipt(
            "playwright_failed",
            "failed",
            true,
            commands,
            `snapshot publication failed; staging retained at ${staging}: ${String(error)}`,
          ),
          root,
          revision,
          port: options.port,
          serverPid: server.pid,
          guardVerified: true,
        };
      }
    }
    return {
      ...receipt("captured", "captured", options.updateSnapshots, commands, "owned revision captured"),
      root,
      revision,
      port: options.port,
      serverPid: server.pid,
      guardVerified: true,
    };
  } finally {
    cleanup = await boundedStop(server, sleep);
    if (staging && !keepStaging) await rm(staging, { recursive: true, force: true });
    await rm(outputDirectory, { recursive: true, force: true });
    if (!cleanup)
      return {
        ...receipt(
          "cleanup_failed",
          "failed",
          options.updateSnapshots,
          commands,
          "owned server cleanup failed",
        ),
        root,
        revision,
        port: options.port,
        serverPid: server.pid,
      };
  }
}

if (import.meta.main) {
  const args = Bun.argv.slice(2);
  const operation = args.shift();
  let root: string | undefined;
  let port: string | undefined;
  const updateSnapshots = operation === "baseline";
  let valid = operation === "baseline" || operation === "regress";
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if ((flag === "--root" || flag === "--port") && args[index + 1]) {
      if (flag === "--root" ? root !== undefined : port !== undefined) {
        valid = false;
        break;
      }
      if (flag === "--root") root = args[index + 1];
      else port = args[index + 1];
      index += 1;
    } else {
      valid = false;
      break;
    }
  }
  const result =
    valid && root
      ? await runCapture({
          root,
          port: Number(port ?? 40_000 + (randomBytes(2).readUInt16BE(0) % 20_000)),
          updateSnapshots,
        })
      : receipt(
          "invalid_arguments",
          "refused",
          updateSnapshots,
          [],
          "usage: bun capture.ts baseline|regress --root PATH [--port N]",
        );
  console.log(JSON.stringify(result));
  process.exit(result.outcome === "captured" ? 0 : result.outcome === "refused" ? 2 : 1);
}
