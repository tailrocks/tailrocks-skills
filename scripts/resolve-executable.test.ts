import { expect, test } from "bun:test";
import { mkdtemp, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { resolveExecutable } from "./resolve-executable";

async function command(argv: readonly string[], cwd: string): Promise<string> {
  const child = Bun.spawn(argv, { cwd, stdout: "pipe", stderr: "pipe" });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  if (code !== 0) throw new Error(stderr);
  return stdout.trim();
}

test("executables resolve from PATH with symlinks canonicalized", async () => {
  const parent = await realpath(await mkdtemp(path.join(tmpdir(), "resolve-executable-")));
  const real = path.join(parent, "real");
  const linked = path.join(parent, "linked");
  await command(["/bin/mkdir", real], parent);
  await command(["/bin/mkdir", linked], parent);
  const target = path.join(real, "gh");
  await writeFile(target, "#!/bin/sh\n");
  await command(["/bin/chmod", "755", target], parent);
  await command(["/bin/ln", "-s", target, path.join(linked, "gh")], parent);
  const saved = process.env.PATH;
  process.env.PATH = [linked, real].join(path.delimiter);
  try {
    expect(await resolveExecutable("gh")).toBe(await realpath(target));
  } finally {
    process.env.PATH = saved;
  }
});

test("PATH resolution skips non-executables and fails closed when absent", async () => {
  const parent = await realpath(await mkdtemp(path.join(tmpdir(), "resolve-executable-")));
  const plain = path.join(parent, "gh");
  await writeFile(plain, "#!/bin/sh\n");
  await command(["/bin/chmod", "644", plain], parent);
  const saved = process.env.PATH;
  process.env.PATH = parent;
  try {
    await expect(resolveExecutable("gh")).rejects.toThrow("unavailable on PATH");
    await expect(resolveExecutable("git")).rejects.toThrow("unavailable on PATH");
  } finally {
    process.env.PATH = saved;
  }
});

test("the first PATH entry with a usable executable wins", async () => {
  const parent = await realpath(await mkdtemp(path.join(tmpdir(), "resolve-executable-")));
  const first = path.join(parent, "first");
  const second = path.join(parent, "second");
  await command(["/bin/mkdir", first], parent);
  await command(["/bin/mkdir", second], parent);
  for (const directory of [first, second]) {
    const target = path.join(directory, "git");
    await writeFile(target, "#!/bin/sh\n");
    await command(["/bin/chmod", "755", target], parent);
  }
  const saved = process.env.PATH;
  process.env.PATH = [second, first].join(path.delimiter);
  try {
    expect(await resolveExecutable("git")).toBe(path.join(second, "git"));
  } finally {
    process.env.PATH = saved;
  }
});

test("invalid executable names refuse before touching the filesystem", async () => {
  await expect(resolveExecutable("")).rejects.toThrow("invalid");
  await expect(resolveExecutable("../git")).rejects.toThrow("invalid");
  await expect(resolveExecutable("git;rm")).rejects.toThrow("invalid");
});
