import { expect, test } from "bun:test";
import { mkdtemp, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runBoundedCommand } from "./bounded-command";

test("returns exact output for a completed command", async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "bounded-command-")));
  const result = await runBoundedCommand({ command: ["bun", "-e", "console.log('ok')"], cwd: root });
  expect(result).toEqual({ code: 0, stdout: "ok\n", stderr: "", timedOut: false, saturated: false });
});

test("spawn errors reject promptly without retaining deadline timers", async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "bounded-command-")));
  const started = performance.now();
  await expect(
    runBoundedCommand({ command: [path.join(root, "missing-command")], cwd: root }),
  ).rejects.toThrow();
  expect(performance.now() - started).toBeLessThan(2_000);
});

test("TERM-resistant child reaches SIGKILL within the hard bound", async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "bounded-command-")));
  const started = performance.now();
  const result = await runBoundedCommand({
    command: ["bun", "-e", "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000)"],
    cwd: root,
    timeoutMilliseconds: 50,
    killGraceMilliseconds: 50,
  });
  expect(result).toEqual({
    code: 124,
    stdout: "",
    stderr: "command timed out",
    timedOut: true,
    saturated: false,
  });
  expect(performance.now() - started).toBeLessThan(2_000);
});

test("output saturation kills the child and returns no partial text", async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "bounded-command-")));
  const result = await runBoundedCommand({
    command: ["bun", "-e", "console.log('x'.repeat(10000)); setInterval(() => {}, 1000)"],
    cwd: root,
    maximumOutputBytes: 100,
    killGraceMilliseconds: 50,
  });
  expect(result).toEqual({
    code: 125,
    stdout: "",
    stderr: "command output exceeded limit",
    timedOut: false,
    saturated: true,
  });
});

test("timeout proves a TERM-resistant descendant is gone before return", async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "bounded-command-")));
  const started = performance.now();
  const result = await runBoundedCommand({
    command: [
      "bun",
      "-e",
      "const c=Bun.spawn(['bun','-e',\"process.on('SIGTERM',()=>{});setInterval(()=>{},1000)\"],{stdout:'ignore',stderr:'ignore'});console.log(c.pid);setInterval(()=>{},1000)",
    ],
    cwd: root,
    timeoutMilliseconds: 50,
    killGraceMilliseconds: 50,
  });
  expect(result).toMatchObject({ code: 124, timedOut: true });
  const descendant = Number(result.stdout.trim());
  expect(() => process.kill(descendant, 0)).toThrow();
  expect(performance.now() - started).toBeLessThan(2_000);
});
