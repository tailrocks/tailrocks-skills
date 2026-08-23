import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const markerStart = "<!-- tailrocks-code-health-audit:start -->\n";
const markerEnd = "<!-- tailrocks-code-health-audit:end -->";

async function source(skill: string, relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", skill, relative), "utf8");
}

test("code-health selectors exclusively own approved mutation and read-only audit", async () => {
  const [mutate, audit] = await Promise.all([
    source("tailrocks-code-health"),
    source("tailrocks-code-health-audit"),
  ]);
  const compactMutate = mutate.replace(/\s+/g, " ");
  expect(mutate).toContain('argument-hint: "<establish|tighten, approved debt class, metric, and paths>"');
  expect(mutate).toContain("Refuse an\n   audit-shaped request");
  expect(mutate).toContain("tailrocks-code-health-audit");
  expect(compactMutate).toContain(
    "never raises a cap, adds an exception, changes the oracle, or absorbs a regression",
  );
  expect(mutate).toContain("publish\n   the multi-file set atomically and CAS-safe");
  expect(mutate).toContain("scrubbed secrets, disabled target network");
  expect(mutate).toContain("immutable pinned and verified artifact");
  expect(mutate).toContain("read-only published-tree, owner-only external");
  expect(audit).toContain('argument-hint: "<repository path and selected debt class>"');
  expect(audit).toContain("Findings never authorize");
  expect(audit).toContain("enforceably read-only target");
  expect(audit).toContain("scrubbed secrets, disabled network");
  expect(audit).toContain("TERM then KILL");
  expect(audit).toContain("Never install, update, format-write, generate, mutate locks");
});

test("audit ledger is stable and represents provider irrelevance explicitly", async () => {
  const audit = await source("tailrocks-code-health-audit");
  const ids = [...audit.matchAll(/`CODE-HEALTH-(\d{3})`/g)].map((match) => match[1]);
  expect(ids).toEqual(Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(3, "0")));
  expect(audit).toContain("`NOT_APPLICABLE` is allowed only for a provider-specific row");
  expect(audit).toContain("irrelevance is never encoded as a false pass or gap");
});

test("five audit references are exact declared read-only projections", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "generated-references.json"), "utf8")) as {
    entries: Array<{ source: string; destinations: string[]; slice?: { start: string; end: string } }>;
  };
  for (const name of [
    "architecture-and-docs.md",
    "defects-flakes-and-reports.md",
    "ratchets-and-baselines.md",
    "verification-lanes.md",
    "versions-and-dependencies.md",
  ]) {
    const canonical = await source("tailrocks-code-health", `references/${name}`);
    const start = canonical.indexOf(markerStart) + markerStart.length;
    const end = canonical.indexOf(markerEnd);
    expect(await source("tailrocks-code-health-audit", `references/${name}`)).toBe(
      canonical.slice(start, end),
    );
    expect(manifest.entries).toContainEqual({
      source: `skills/tailrocks-code-health/references/${name}`,
      destinations: [`skills/tailrocks-code-health-audit/references/${name}`],
      slice: { start: markerStart, end: markerEnd },
    });
  }
});

test("audit owns no templates and version policy rejects delayed security fixes", async () => {
  expect(await Bun.file(path.join(root, "skills/tailrocks-code-health-audit/templates")).exists()).toBe(
    false,
  );
  const versions = await source("tailrocks-code-health", "references/versions-and-dependencies.md");
  const sharedVersion = await source("tailrocks-code-health", "references/shared-version-policy.md");
  expect(sharedVersion).toContain("minimum release age is forbidden");
  expect(sharedVersion.replace(/\s+/g, " ")).toContain("highest fixed version immediately");
  expect(versions).toContain("The shared version policy is the comparison source");
  expect(versions).toContain("advisory's highest fixed version");
  expect(await source("tailrocks-code-health", "templates/renovate.json")).toContain(
    '"vulnerabilityFixStrategy": "highest"',
  );
});

test("registry catalog and choosing expose both manual owners", async () => {
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8")) as {
    groups: Array<{ id: string; skills: string[] }>;
  };
  for (const skill of ["tailrocks-code-health", "tailrocks-code-health-audit"]) {
    expect(registry.owners).toContainEqual({ skill, class: "MANUAL_ONLY" });
    expect(catalog.groups.find((group) => group.id === "quality")?.skills).toContain(skill);
  }
  expect(await readFile(path.join(root, "docs/content/docs/choosing.mdx"), "utf8")).toContain(
    "one-off read-only debt measurement",
  );
});

test("owner hints and prompts are distinct while both consume the one machine predicate", async () => {
  const [mutate, audit, mutateAgent, auditAgent, predicate] = await Promise.all([
    source("tailrocks-code-health"),
    source("tailrocks-code-health-audit"),
    source("tailrocks-code-health", "agents/openai.yaml"),
    source("tailrocks-code-health-audit", "agents/openai.yaml"),
    readFile(path.join(root, "scripts/code-health-predicate.ts"), "utf8"),
  ]);
  expect(mutate).toContain('argument-hint: "<establish|tighten, approved debt class, metric, and paths>"');
  expect(audit).toContain('argument-hint: "<repository path and selected debt class>"');
  expect(mutateAgent).not.toBe(auditAgent);
  expect(mutateAgent).toContain("establish or tighten");
  expect(auditAgent).toContain("measure this selected debt class read-only");
  for (const owner of [mutate, audit])
    expect(owner).toContain("<installed-plugin>/scripts/code-health-predicate.ts");
  expect(mutate).toContain("Apply one transactional slice");
  expect(audit).toContain("Never install, update, format-write, generate, mutate locks");
  expect(predicate).toContain('"tailrocks.code-health-predicate-input/v1"');
});
