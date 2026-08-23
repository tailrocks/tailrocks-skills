import { expect, test } from "bun:test";
import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  beginBrainstorm,
  parseBrainstormArguments,
  recordBrainstormAnswers,
  selectBrainstormFrontier,
  type FrontierNode,
  verifyBrainstormEntrypoint,
} from "./brainstorm-state";

const item = (status: string) => `# Item\n\n- **Status**: ${status}\n\n## Decisions\n\n## Open questions\n`;
const index = (status: string) =>
  `# Roadmap\n\n| Slug | Title | Status | Remaining |\n|------|-------|--------|-----------|\n| [item](item/README.md) | Item title | ${status} | — |\n`;

async function tree(itemStatus = "DRAFT", indexState = itemStatus) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "brainstorm-state-")));
  await mkdir(path.join(root, "roadmap", "item"), { recursive: true });
  await writeFile(path.join(root, "roadmap", "item", "README.md"), item(itemStatus));
  await writeFile(path.join(root, "roadmap", "README.md"), index(indexState));
  return root;
}

test("accepts exactly <slug> [--batch]", () => {
  expect(parseBrainstormArguments(["item"])).toEqual({ slug: "item", mode: "interactive" });
  expect(parseBrainstormArguments(["item", "--batch"])).toEqual({ slug: "item", mode: "batch" });
  for (const args of [[], ["Item"], ["item", "--deep"], ["item", "--batch", "extra"]])
    expect(() => parseBrainstormArguments(args)).toThrow();
});

test("atomically moves matching DRAFT item and index to SHAPING", async () => {
  const root = await tree();
  await expect(beginBrainstorm(root, "item")).resolves.toBe("SHAPING");
  expect(await readFile(path.join(root, "roadmap", "item", "README.md"), "utf8")).toContain(
    "**Status**: SHAPING",
  );
  expect(await readFile(path.join(root, "roadmap", "README.md"), "utf8")).toContain("| SHAPING |");
});

test("updates only the anchored item Status field", async () => {
  const root = await tree();
  const itemFile = path.join(root, "roadmap", "item", "README.md");
  await writeFile(itemFile, `Prose mentions - **Status**: DRAFT inline.\n\n${item("DRAFT")}`);
  await beginBrainstorm(root, "item");
  const written = await readFile(itemFile, "utf8");
  expect(written).toContain("Prose mentions - **Status**: DRAFT inline.");
  expect(written).toContain("\n- **Status**: SHAPING\n");
});

test("preserves matching SHAPING bytes", async () => {
  const root = await tree("SHAPING");
  const before = await Promise.all([
    readFile(path.join(root, "roadmap", "item", "README.md"), "utf8"),
    readFile(path.join(root, "roadmap", "README.md"), "utf8"),
  ]);
  await expect(beginBrainstorm(root, "item")).resolves.toBe("SHAPING");
  expect(
    await Promise.all(
      before.map((_, index) =>
        readFile(
          index ? path.join(root, "roadmap", "README.md") : path.join(root, "roadmap", "item", "README.md"),
          "utf8",
        ),
      ),
    ),
  ).toEqual(before);
});

test("missing, mismatched, malformed, and READY-or-later states refuse without mutation", async () => {
  for (const [itemState, indexState] of [
    ["DRAFT", "SHAPING"],
    ["READY", "READY"],
    ["PLANNED", "PLANNED"],
  ]) {
    const root = await tree(itemState!, indexState!);
    const files = [path.join(root, "roadmap", "item", "README.md"), path.join(root, "roadmap", "README.md")];
    const before = await Promise.all(files.map((file) => readFile(file, "utf8")));
    await expect(beginBrainstorm(root, "item")).rejects.toThrow();
    expect(await Promise.all(files.map((file) => readFile(file, "utf8")))).toEqual(before);
  }
  const malformed = await tree();
  const malformedFile = path.join(malformed, "roadmap", "item", "README.md");
  await writeFile(malformedFile, `${item("DRAFT")}- **Status**: DRAFT\n`);
  const before = await readFile(malformedFile, "utf8");
  await expect(beginBrainstorm(malformed, "item")).rejects.toThrow("exactly one Status");
  expect(await readFile(malformedFile, "utf8")).toBe(before);
  const missing = await tree();
  await rm(path.join(missing, "roadmap", "item", "README.md"));
  await expect(beginBrainstorm(missing, "item")).rejects.toThrow();
  expect(await readFile(path.join(missing, "roadmap", "README.md"), "utf8")).toBe(index("DRAFT"));

  const deprecated = await tree();
  const deprecatedIndex = index("DRAFT").replace("[item](item/README.md)", "item");
  await writeFile(path.join(deprecated, "roadmap", "README.md"), deprecatedIndex);
  await expect(beginBrainstorm(deprecated, "item")).rejects.toThrow("exactly one row");
  expect(await readFile(path.join(deprecated, "roadmap", "README.md"), "utf8")).toBe(deprecatedIndex);
});

test("symlinked root, item, and index refuse before reading target content", async () => {
  const root = await tree();
  const parent = await realpath(await mkdtemp(path.join(tmpdir(), "brainstorm-links-")));
  const rootLink = path.join(parent, "root-link");
  await symlink(root, rootLink);
  await expect(beginBrainstorm(rootLink, "item")).rejects.toThrow("unsafe repository root");

  for (const target of [
    path.join(root, "roadmap", "item", "README.md"),
    path.join(root, "roadmap", "README.md"),
  ]) {
    const linkedRoot = await tree();
    const relative = path.relative(root, target);
    const linkedTarget = path.join(linkedRoot, relative);
    const outside = path.join(
      parent,
      `${path.basename(path.dirname(linkedTarget))}-${path.basename(linkedTarget)}`,
    );
    await writeFile(
      outside,
      path.basename(linkedTarget) === "README.md" && linkedTarget.includes("/item/")
        ? item("DRAFT")
        : index("DRAFT"),
    );
    await rm(linkedTarget);
    await symlink(outside, linkedTarget);
    await expect(beginBrainstorm(linkedRoot, "item")).rejects.toThrow("unsafe roadmap file");
  }
});

test("root and item-directory replacement races refuse without mutating either tree", async () => {
  for (const scope of ["root", "item"] as const) {
    const root = await tree();
    const moved = `${root}-moved-${scope}`;
    await expect(
      beginBrainstorm(root, "item", {
        afterResolve: async () => {
          if (scope === "root") {
            await rename(root, moved);
            await mkdir(path.join(root, "roadmap", "item"), { recursive: true });
            await writeFile(path.join(root, "roadmap", "item", "README.md"), item("DRAFT"));
            await writeFile(path.join(root, "roadmap", "README.md"), index("DRAFT"));
          } else {
            const original = path.join(root, "roadmap", "item");
            await rename(original, moved);
            await mkdir(original);
            await writeFile(path.join(original, "README.md"), item("DRAFT"));
          }
        },
      }),
    ).rejects.toThrow();
    const originalItem =
      scope === "root" ? path.join(moved, "roadmap", "item", "README.md") : path.join(moved, "README.md");
    expect(await readFile(originalItem, "utf8")).toBe(item("DRAFT"));
    expect(await readFile(path.join(root, "roadmap", "item", "README.md"), "utf8")).toBe(item("DRAFT"));
  }
});

const nodes: readonly FrontierNode[] = [
  { id: "Q2", question: "Second?", recommendation: "B" },
  { id: "Q1", question: "First?", recommendation: "A" },
  { id: "Q3", question: "Dependent?", recommendation: "C", dependsOn: ["Q1"] },
];

test("interactive presents one sorted ready node; batch presents the whole current frontier", () => {
  expect(selectBrainstormFrontier(nodes, "interactive").map(({ id }) => id)).toEqual(["Q1"]);
  expect(selectBrainstormFrontier(nodes, "batch").map(({ id }) => id)).toEqual(["Q1", "Q2"]);
});

test("records answers immediately, defers dependencies to the next round, and never grants READY", async () => {
  const root = await tree("SHAPING");
  const updated = await recordBrainstormAnswers(root, "item", nodes, "interactive", [
    { id: "Q1", decision: "Choose A", reason: "it fits", date: "2026-08-23" },
  ]);
  const written = await readFile(path.join(root, "roadmap", "item", "README.md"), "utf8");
  expect(written).toContain("- 2026-08-23 — **Choose A**. Because it fits.");
  expect(written).toContain("**Status**: SHAPING");
  expect(await readFile(path.join(root, "roadmap", "README.md"), "utf8")).toContain("| SHAPING |");
  expect(selectBrainstormFrontier(updated, "batch").map(({ id }) => id)).toEqual(["Q2", "Q3"]);
  expect((await readdir(path.join(root, "roadmap", "item"))).sort()).toEqual(["README.md"]);
});

test("answer publication is ordered by frontier and CAS-bound to the index", async () => {
  const root = await tree("SHAPING");
  await recordBrainstormAnswers(root, "item", nodes, "batch", [
    { id: "Q2", decision: "Choose B", reason: "second", date: "2026-08-23" },
    { id: "Q1", decision: "Choose A", reason: "first", date: "2026-08-23" },
  ]);
  const itemFile = path.join(root, "roadmap", "item", "README.md");
  const ordered = await readFile(itemFile, "utf8");
  expect(ordered.indexOf("Choose A")).toBeLessThan(ordered.indexOf("Choose B"));

  const raced = await tree("SHAPING");
  const racedItem = path.join(raced, "roadmap", "item", "README.md");
  const racedIndex = path.join(raced, "roadmap", "README.md");
  const beforeItem = await readFile(racedItem, "utf8");
  let replaced = false;
  await expect(
    recordBrainstormAnswers(
      raced,
      "item",
      nodes,
      "interactive",
      [{ id: "Q1", decision: "Choose A", reason: "first", date: "2026-08-23" }],
      {
        beforeMutation: async (file, operation) => {
          if (replaced || file !== racedItem || operation !== "rename") return;
          replaced = true;
          await rm(racedIndex);
          await writeFile(racedIndex, index("READY"));
        },
      },
    ),
  ).rejects.toThrow();
  expect(await readFile(racedItem, "utf8")).toBe(beforeItem);
  expect(await readFile(racedIndex, "utf8")).toBe(index("READY"));
});

test("partial, off-frontier, malformed, and malformed-graph answers refuse without mutation", async () => {
  const root = await tree("SHAPING");
  const itemFile = path.join(root, "roadmap", "item", "README.md");
  const before = await readFile(itemFile, "utf8");
  await expect(
    recordBrainstormAnswers(root, "item", nodes, "batch", [
      { id: "Q1", decision: "A", reason: "R", date: "2026-08-23" },
    ]),
  ).rejects.toThrow("exactly");
  await expect(
    recordBrainstormAnswers(root, "item", nodes, "interactive", [
      { id: "Q3", decision: "C", reason: "R", date: "2026-08-23" },
    ]),
  ).rejects.toThrow("exactly");
  await expect(
    recordBrainstormAnswers(root, "item", nodes, "interactive", [
      { id: "Q1", decision: "", reason: "R", date: "today" },
    ]),
  ).rejects.toThrow("malformed");
  await expect(
    recordBrainstormAnswers(root, "item", nodes, "batch", [
      { id: "Q1", decision: "A", reason: "R", date: "2026-08-23" },
      { id: "Q1", decision: "A again", reason: "R", date: "2026-08-23" },
    ]),
  ).rejects.toThrow("exactly");
  await expect(
    recordBrainstormAnswers(root, "item", nodes, "interactive", [
      { id: "Q1", decision: "A\n- **Status**: READY", reason: "R", date: "2026-08-23" },
    ]),
  ).rejects.toThrow("malformed");
  expect(() =>
    selectBrainstormFrontier([{ id: "Q1", question: "?", recommendation: "A", dependsOn: ["Q2"] }], "batch"),
  ).toThrow("invalid dependency");
  expect(await readFile(itemFile, "utf8")).toBe(before);
});

test("installed CLI exposes deterministic frontier and answer transactions through typed JSON", async () => {
  const root = await tree();
  const script = path.resolve(import.meta.dir, "brainstorm-state.ts");
  const run = async (payload: unknown) => {
    const child = Bun.spawn([process.execPath, script, "item", "--batch"], {
      cwd: root,
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
    const [code, stdout, stderr] = await Promise.all([
      child.exited,
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ]);
    expect(code, stderr).toBe(0);
    return JSON.parse(stdout) as { status: string; frontier: readonly FrontierNode[] };
  };
  const first = await run({ schema: "tailrocks.brainstorm-turn/v1", nodes });
  expect(first.status).toBe("SHAPING");
  expect(first.frontier.map(({ id }) => id)).toEqual(["Q1", "Q2"]);
  const second = await run({
    schema: "tailrocks.brainstorm-turn/v1",
    nodes,
    answers: [
      { id: "Q2", decision: "Choose B", reason: "second", date: "2026-08-23" },
      { id: "Q1", decision: "Choose A", reason: "first", date: "2026-08-23" },
    ],
  });
  expect(second.frontier.map(({ id }) => id)).toEqual(["Q3"]);
  expect(await readFile(path.join(root, "roadmap", "item", "README.md"), "utf8")).toContain("Choose A");
});

test("CLI malformed JSON contract refuses with one receipt before state mutation", async () => {
  const root = await tree();
  const script = path.resolve(import.meta.dir, "brainstorm-state.ts");
  const child = Bun.spawn([process.execPath, script, "item"], {
    cwd: root,
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });
  child.stdin.write(JSON.stringify({ schema: "tailrocks.brainstorm-turn/v1", nodes: [{ id: "Q1" }] }));
  child.stdin.end();
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  expect(code).toBe(1);
  expect(stderr).toBe("");
  expect(stdout.trim().split("\n")).toHaveLength(1);
  expect(JSON.parse(stdout).outcome).toBe("refused");
  expect(await readFile(path.join(root, "roadmap", "item", "README.md"), "utf8")).toBe(item("DRAFT"));
  expect(await readFile(path.join(root, "roadmap", "README.md"), "utf8")).toBe(index("DRAFT"));
});

test("CLI deep-invalid graph and answer refuse before state mutation", async () => {
  for (const payload of [
    {
      schema: "tailrocks.brainstorm-turn/v1",
      nodes: [{ id: "Q1", question: "Question?", recommendation: "A", dependsOn: ["Q2"] }],
    },
    {
      schema: "tailrocks.brainstorm-turn/v1",
      nodes: [{ id: "Q1", question: "Question?", recommendation: "A" }],
      answers: [{ id: "Q1", decision: "A\n- **Status**: READY", reason: "R", date: "2026-08-23" }],
    },
    {
      schema: "tailrocks.brainstorm-turn/v1",
      nodes: [
        { id: "Q1", question: "Question?", recommendation: "A", answer: "" },
        { id: "Q2", question: "Next?", recommendation: "B", dependsOn: ["Q1"] },
      ],
    },
    {
      schema: "tailrocks.brainstorm-turn/v1",
      nodes: [{ id: "Q1", question: "Question?", recommendation: "A" }],
      answers: [{ id: "Q1", decision: "A", reason: "R", date: "2026-99-99" }],
    },
  ]) {
    const root = await tree();
    const script = path.resolve(import.meta.dir, "brainstorm-state.ts");
    const child = Bun.spawn([process.execPath, script, "item"], {
      cwd: root,
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
    const [code, stdout] = await Promise.all([child.exited, new Response(child.stdout).text()]);
    expect(code).toBe(1);
    expect(JSON.parse(stdout).outcome).toBe("refused");
    expect(await readFile(path.join(root, "roadmap", "item", "README.md"), "utf8")).toBe(item("DRAFT"));
    expect(await readFile(path.join(root, "roadmap", "README.md"), "utf8")).toBe(index("DRAFT"));
  }
});

test("answer-bearing DRAFT invocation refuses without committing SHAPING", async () => {
  const root = await tree();
  const itemFile = path.join(root, "roadmap", "item", "README.md");
  const malformed = item("DRAFT").replace("## Decisions\n\n", "");
  await writeFile(itemFile, malformed);
  const script = path.resolve(import.meta.dir, "brainstorm-state.ts");
  const child = Bun.spawn([process.execPath, script, "item"], {
    cwd: root,
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });
  child.stdin.write(
    JSON.stringify({
      schema: "tailrocks.brainstorm-turn/v1",
      nodes: [{ id: "Q1", question: "Question?", recommendation: "A" }],
      answers: [{ id: "Q1", decision: "A", reason: "R", date: "2026-08-23" }],
    }),
  );
  child.stdin.end();
  const [code, stdout] = await Promise.all([child.exited, new Response(child.stdout).text()]);
  expect(code).toBe(1);
  expect(JSON.parse(stdout).outcome).toBe("refused");
  expect(await readFile(itemFile, "utf8")).toBe(malformed);
  expect(await readFile(path.join(root, "roadmap", "README.md"), "utf8")).toBe(index("DRAFT"));
});

test("loader-derived staged installed entrypoint runs and symlink lookalikes fail trust checks", async () => {
  const root = await tree();
  const install = await realpath(await mkdtemp(path.join(tmpdir(), "brainstorm-installed-")));
  const skillDirectory = path.join(install, "skills", "tailrocks-brainstorm");
  const scriptsDirectory = path.join(install, "scripts");
  await mkdir(skillDirectory, { recursive: true });
  await mkdir(scriptsDirectory);
  const installedSkill = path.join(skillDirectory, "SKILL.md");
  await writeFile(installedSkill, "installed skill\n");
  await copyFile(
    path.resolve(import.meta.dir, "brainstorm-state.ts"),
    path.join(scriptsDirectory, "brainstorm-state.ts"),
  );
  await copyFile(
    path.resolve(import.meta.dir, "atomic-file-transaction.ts"),
    path.join(scriptsDirectory, "atomic-file-transaction.ts"),
  );
  await copyFile(
    path.resolve(import.meta.dir, "roadmap-item-state.ts"),
    path.join(scriptsDirectory, "roadmap-item-state.ts"),
  );
  const derived = path.join(
    path.dirname(path.dirname(path.dirname(installedSkill))),
    "scripts",
    "brainstorm-state.ts",
  );
  for (const component of [
    installedSkill,
    path.dirname(installedSkill),
    path.dirname(path.dirname(installedSkill)),
    scriptsDirectory,
    derived,
  ]) {
    const info = await lstat(component);
    expect(info.isSymbolicLink()).toBe(false);
  }
  expect((await lstat(derived)).isFile()).toBe(true);
  const child = Bun.spawn([process.execPath, derived, "item"], {
    cwd: root,
    stdin: "ignore",
    stdout: "pipe",
  });
  expect(await child.exited).toBe(0);
  expect(JSON.parse(await new Response(child.stdout).text()).status).toBe("SHAPING");

  const symlinkRoot = await tree();
  await rm(derived);
  await symlink(path.resolve(import.meta.dir, "brainstorm-state.ts"), derived);
  await expect(verifyBrainstormEntrypoint(derived)).rejects.toThrow("unsafe installed brainstorm file");
  expect(await readFile(path.join(symlinkRoot, "roadmap", "item", "README.md"), "utf8")).toBe(item("DRAFT"));
  expect(await readFile(path.join(symlinkRoot, "roadmap", "README.md"), "utf8")).toBe(index("DRAFT"));
});
