import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { cp, lstat, mkdir, mkdtemp, readFile, realpath, rename, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  finalizeInputSchema,
  finalizeRoadmapState,
  parseFinalizeArguments,
  selectFinalizeFrontier,
} from "./finalize-state";

const slug = "typed-finalize";
const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

function item(
  status = "SHAPING",
  overrides: { open?: string; deferred?: string; screens?: string } = {},
): string {
  return `# Typed finalize

- **Status**: ${status}
- **Slug**: ${slug}
- **Created**: 2026-08-23
- **Plan**: —

## Intent

Ship a deterministic finalizer. Done means READY is atomically published.

## Vocabulary

- **Receipt** — typed evidence.

## Decisions

- 2026-08-23 — Use the machine gate.

## Capabilities

- Publish readiness through one command.

## Screens

${overrides.screens ?? ""}
## Flows

- Read, validate, and atomically publish; failure leaves both files unchanged.

## Data & integrations

- Local roadmap item and index only.

## References

## Research

## Must not

- MUST NOT grant READY without live confirmation.

## Quality bar

- Item and index change together or neither changes.

## Open questions

${overrides.open ?? ""}
## Open research questions

## Deferred

${overrides.deferred ?? ""}
## Remaining
`;
}

function index(status = "SHAPING"): string {
  return `# Roadmap\n\n| Slug | Title | Status | Remaining |\n|---|---|---|---|\n| [${slug}](${slug}/README.md) | Typed finalize | ${status} | — |\n`;
}

async function repository(status = "SHAPING", itemBody = item(status)) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "finalize-state-")));
  await mkdir(path.join(root, "roadmap", slug), { recursive: true });
  await writeFile(path.join(root, "roadmap", slug, "README.md"), itemBody);
  await writeFile(path.join(root, "roadmap", "README.md"), index(status));
  return root;
}

function completeInput(itemBody: string, indexBody = index()) {
  const itemDigest = sha256(itemBody);
  const evidence: Record<string, string> = {
    intent_destination: "section:Intent",
    vocabulary_unambiguous: "section:Vocabulary",
    capabilities_reachable: "section:Capabilities",
    screens_complete: "section:Screens",
    design_references_blessed: "section:Screens",
    design_stage_handoff: "section:Screens",
    flows_complete: "section:Flows",
    integrations_settled: "section:Data & integrations",
    must_not_confirmed: "section:Must not",
    quality_checkable: "section:Quality bar",
    open_questions_empty: "section:Open questions",
    research_questions_valid: "section:Open research questions",
    deferred_complete: "section:Deferred",
    decisions_consistent: "section:Decisions",
    planning_dry_run: "dry-run:clean",
  };
  const node = {
    id: "Q1",
    question: "Does the item match the intended product?",
    recommendation: "Confirm only after reading the item.",
    depends_on: [],
    answer: "Yes",
    human_receipt_id: "H1",
  };
  return {
    schema: finalizeInputSchema,
    action: "publish",
    item_sha256: itemDigest,
    index_sha256: sha256(indexBody),
    checklist: [
      "intent_destination",
      "vocabulary_unambiguous",
      "capabilities_reachable",
      "screens_complete",
      "design_references_blessed",
      "design_stage_handoff",
      "flows_complete",
      "integrations_settled",
      "must_not_confirmed",
      "quality_checkable",
      "open_questions_empty",
      "research_questions_valid",
      "deferred_complete",
      "decisions_consistent",
      "planning_dry_run",
    ].map((id) => ({ id, evidence: [evidence[id]!] })),
    nodes: [node],
    human_receipts: [
      { id: "H1", node_id: "Q1", answer: "Yes", source: "live_user", item_sha256: itemDigest },
    ],
    dry_run: {
      item_sha256: itemDigest,
      reviewer: "fresh_context",
      screens: [],
      capabilities: ["Publish readiness through one command."],
      flows: ["Read, validate, and atomically publish; failure leaves both files unchanged."],
      must_nots: ["MUST NOT grant READY without live confirmation."],
      questions: [],
      inventions: [],
    },
  } as const;
}

async function bytes(root: string): Promise<readonly [string, string]> {
  return Promise.all([
    readFile(path.join(root, "roadmap", slug, "README.md"), "utf8"),
    readFile(path.join(root, "roadmap", "README.md"), "utf8"),
  ]);
}

test("accepts only loader-bound slug and optional batch mode", () => {
  expect(
    parseFinalizeArguments(["--skill-file", "/plugin/skills/tailrocks-finalize/SKILL.md", slug]),
  ).toEqual({
    skillFile: "/plugin/skills/tailrocks-finalize/SKILL.md",
    slug,
    mode: "interactive",
  });
  expect(
    parseFinalizeArguments(["--skill-file", "/plugin/skills/tailrocks-finalize/SKILL.md", slug, "--batch"]),
  ).toEqual({ skillFile: "/plugin/skills/tailrocks-finalize/SKILL.md", slug, mode: "batch" });
  expect(() => parseFinalizeArguments([slug])).toThrow();
  expect(() => parseFinalizeArguments(["--skill-file", "relative", slug])).toThrow();
});

test("interactive selects one sorted frontier and batch selects the complete ready frontier", () => {
  const nodes = [
    { id: "Q2", question: "Second?", recommendation: "B", depends_on: [] },
    { id: "Q1", question: "First?", recommendation: "A", depends_on: [] },
    { id: "Q3", question: "Third?", recommendation: "C", depends_on: ["Q1"] },
  ];
  expect(selectFinalizeFrontier(nodes, "interactive").map((node) => node.id)).toEqual(["Q1"]);
  expect(selectFinalizeFrontier(nodes, "batch").map((node) => node.id)).toEqual(["Q1", "Q2"]);
  expect(() => selectFinalizeFrontier([{ ...nodes[0]!, depends_on: ["MISSING"] }], "batch")).toThrow();
});

test("DRAFT routes without mutation and READY is idempotent", async () => {
  for (const status of ["DRAFT", "READY"] as const) {
    const root = await repository(status);
    const before = await bytes(root);
    const result = await finalizeRoadmapState(root, slug, "interactive");
    expect(result.code).toBe(status === "DRAFT" ? "draft_requires_brainstorm" : "already_ready");
    expect(await bytes(root)).toEqual(before);
  }
});

test("SHAPING assessment exposes deterministic frontier and never writes", async () => {
  const body = item();
  const input = completeInput(body);
  const open = {
    ...input,
    action: "assess" as const,
    nodes: [
      { id: "Q2", question: "Second?", recommendation: "B", depends_on: [] },
      { id: "Q1", question: "First?", recommendation: "A", depends_on: [] },
    ],
    human_receipts: [],
  };
  for (const mode of ["interactive", "batch"] as const) {
    const root = await repository();
    const before = await bytes(root);
    const result = await finalizeRoadmapState(root, slug, mode, open);
    expect(result.outcome).toBe("shaping");
    expect(result.frontier.map((node) => node.id)).toEqual(mode === "interactive" ? ["Q1"] : ["Q1", "Q2"]);
    expect(await bytes(root)).toEqual(before);
  }
});

test("complete proof atomically publishes READY and changes only anchored statuses", async () => {
  const body = item();
  const root = await repository("SHAPING", body);
  const result = await finalizeRoadmapState(root, slug, "interactive", completeInput(body));
  expect(result).toMatchObject({
    outcome: "ready",
    code: "published",
    status: "READY",
    checklist_complete: 15,
  });
  const [nextItem, nextIndex] = await bytes(root);
  expect(nextItem).toBe(body.replace("- **Status**: SHAPING", "- **Status**: READY"));
  expect(nextIndex).toBe(index().replace("| SHAPING |", "| READY |"));
});

test("partial, stale, invented, nonhuman, and mechanically incomplete proofs stay SHAPING", async () => {
  const cases = [
    (value: ReturnType<typeof completeInput>) => ({ ...value, checklist: value.checklist.slice(1) }),
    (value: ReturnType<typeof completeInput>) => ({
      ...value,
      checklist: value.checklist.map((entry) =>
        entry.id === "quality_checkable" ? { ...entry, evidence: ["section:Intent"] } : entry,
      ),
    }),
    (value: ReturnType<typeof completeInput>) => ({ ...value, item_sha256: "0".repeat(64) }),
    (value: ReturnType<typeof completeInput>) => ({
      ...value,
      dry_run: { ...value.dry_run, inventions: ["guess"] },
    }),
    (value: ReturnType<typeof completeInput>) => ({ ...value, human_receipts: [] }),
  ];
  for (const mutate of cases) {
    const body = item();
    const root = await repository("SHAPING", body);
    const before = await bytes(root);
    const result = await finalizeRoadmapState(root, slug, "interactive", mutate(completeInput(body)));
    expect(["needs_evidence", "state_changed"]).toContain(result.code);
    expect(await bytes(root)).toEqual(before);
  }
  const openBody = item("SHAPING", { open: "- Which behavior?\n" });
  const root = await repository("SHAPING", openBody);
  const result = await finalizeRoadmapState(root, slug, "interactive", completeInput(openBody));
  expect(result).toMatchObject({ outcome: "shaping", code: "needs_evidence", status: "SHAPING" });
  expect(await bytes(root)).toEqual([openBody, index()]);

  const incompleteBody = item().replace(
    "Ship a deterministic finalizer. Done means READY is atomically published.",
    "",
  );
  const incomplete = await repository("SHAPING", incompleteBody);
  const incompleteResult = await finalizeRoadmapState(
    incomplete,
    slug,
    "interactive",
    completeInput(incompleteBody),
  );
  expect(incompleteResult).toMatchObject({ outcome: "shaping", code: "needs_evidence" });
  expect(await bytes(incomplete)).toEqual([incompleteBody, index()]);

  const completeBody = item();
  const fabricated = completeInput(completeBody);
  const fabricatedRoot = await repository("SHAPING", completeBody);
  const fabricatedResult = await finalizeRoadmapState(fabricatedRoot, slug, "interactive", {
    ...fabricated,
    dry_run: { ...fabricated.dry_run, capabilities: ["Fabricated capability"] },
  });
  expect(fabricatedResult).toMatchObject({ outcome: "shaping", code: "needs_evidence" });
  expect(await bytes(fabricatedRoot)).toEqual([completeBody, index()]);

  for (const malformedBody of [
    item("SHAPING", { deferred: "Unstructured postponement.\n" }),
    item("SHAPING").replace("## Open research questions\n", "## Open research questions\n\n1. Which fact?\n"),
    item("SHAPING").replace("## Open research questions\n", "## Open research questions\n\n-\n"),
  ]) {
    const malformedRoot = await repository("SHAPING", malformedBody);
    const malformedResult = await finalizeRoadmapState(
      malformedRoot,
      slug,
      "interactive",
      completeInput(malformedBody),
    );
    expect(malformedResult).toMatchObject({ outcome: "shaping", code: "needs_evidence" });
    expect(await bytes(malformedRoot)).toEqual([malformedBody, index()]);
  }
});

test("later, mismatched, malformed, and symlinked states refuse without mutation", async () => {
  for (const status of ["PLANNED", "IN EXECUTION", "DONE", "PARKED"]) {
    const root = await repository(status);
    const before = await bytes(root);
    expect((await finalizeRoadmapState(root, slug, "batch")).code).toBe("state_refused");
    expect(await bytes(root)).toEqual(before);
  }
  const mismatch = await repository();
  await writeFile(path.join(mismatch, "roadmap", "README.md"), index("READY"));
  expect((await finalizeRoadmapState(mismatch, slug, "batch")).code).toBe("state_refused");

  const malformedBody = item().replace("- **Status**: SHAPING", "status: SHAPING");
  const malformed = await repository("SHAPING", malformedBody);
  expect(await finalizeRoadmapState(malformed, slug, "batch")).toMatchObject({
    outcome: "refused",
    code: "state_refused",
  });

  const root = await repository();
  const target = path.join(root, "target.md");
  await writeFile(target, item());
  const file = path.join(root, "roadmap", slug, "README.md");
  await Bun.file(file).delete();
  await symlink(target, file);
  expect(await finalizeRoadmapState(root, slug, "batch")).toMatchObject({
    outcome: "refused",
    code: "state_refused",
  });
  expect((await lstat(file)).isSymbolicLink()).toBe(true);
});

test("directory replacement race cannot redirect READY publication", async () => {
  const body = item();
  const root = await repository("SHAPING", body);
  const original = path.join(root, "roadmap", slug);
  const moved = path.join(root, "roadmap", `${slug}-moved`);
  const outside = path.join(root, "outside");
  await mkdir(outside);
  await writeFile(path.join(outside, "README.md"), body);
  const result = await finalizeRoadmapState(root, slug, "batch", completeInput(body), {
    beforeAnchorSpawn: async (directory) => {
      if (directory !== original || (await lstat(original)).isSymbolicLink()) return;
      await rename(original, moved);
      await symlink(outside, original);
    },
  });
  expect(result.code).toBe("transaction_failed");
  expect(await readFile(path.join(outside, "README.md"), "utf8")).toBe(body);
  expect(await readFile(path.join(moved, "README.md"), "utf8")).toBe(body);
  expect(await readFile(path.join(root, "roadmap", "README.md"), "utf8")).toBe(index());
});

test("installed CLI publishes with one typed receipt and rejects symlink lookalikes", async () => {
  const sourceRoot = path.resolve(import.meta.dir, "..");
  const root = await repository();
  await mkdir(path.join(root, "scripts"));
  await mkdir(path.join(root, "skills", "tailrocks-finalize"), { recursive: true });
  for (const name of ["finalize-state.ts", "roadmap-item-state.ts", "atomic-file-transaction.ts"])
    await cp(path.join(sourceRoot, "scripts", name), path.join(root, "scripts", name));
  await writeFile(path.join(root, "skills", "tailrocks-finalize", "SKILL.md"), "# Installed\n");
  const entrypoint = path.join(root, "scripts", "finalize-state.ts");
  const skillFile = path.join(root, "skills", "tailrocks-finalize", "SKILL.md");
  const child = Bun.spawn([process.execPath, entrypoint, "--skill-file", skillFile, slug], {
    cwd: root,
    stdin: new Blob([JSON.stringify(completeInput(item()))]),
    stdout: "pipe",
    stderr: "pipe",
  });
  const output = await new Response(child.stdout).text();
  expect(await child.exited).toBe(0);
  expect(output.trim().split("\n")).toHaveLength(1);
  expect(JSON.parse(output)).toMatchObject({ schema: "tailrocks.finalize-state/v1", code: "published" });

  const linkedRoot = await repository();
  await mkdir(path.join(linkedRoot, "scripts"));
  await mkdir(path.join(linkedRoot, "skills", "tailrocks-finalize"), { recursive: true });
  for (const name of ["roadmap-item-state.ts", "atomic-file-transaction.ts"])
    await cp(path.join(sourceRoot, "scripts", name), path.join(linkedRoot, "scripts", name));
  await symlink(
    path.join(sourceRoot, "scripts", "finalize-state.ts"),
    path.join(linkedRoot, "scripts", "finalize-state.ts"),
  );
  await writeFile(path.join(linkedRoot, "skills", "tailrocks-finalize", "SKILL.md"), "# Installed\n");
  const refused = Bun.spawn(
    [
      process.execPath,
      path.join(linkedRoot, "scripts", "finalize-state.ts"),
      "--skill-file",
      path.join(linkedRoot, "skills", "tailrocks-finalize", "SKILL.md"),
      slug,
    ],
    { cwd: linkedRoot, stdin: "ignore", stdout: "pipe", stderr: "pipe" },
  );
  expect(await refused.exited).toBe(1);
  expect(JSON.parse(await new Response(refused.stdout).text()).code).toBe("invalid_input");
});
