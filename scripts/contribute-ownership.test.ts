import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const owners = [
  "tailrocks-contribute-recon",
  "tailrocks-contribute-propose",
  "tailrocks-contribute-prepare",
  "tailrocks-contribute-submit",
  "tailrocks-contribute-respond",
] as const;
async function source(skill: string, relative = "SKILL.md"): Promise<string> {
  return readFile(path.join(root, "skills", skill, relative), "utf8");
}

test("five contribution owners have exclusive stage outputs", async () => {
  const [recon, propose, prepare, submit, respond] = await Promise.all(owners.map((owner) => source(owner)));
  expect(recon).toContain("No target\nor fork mutation, proposal");
  expect(propose).toContain("No\nfork edit, branch, commit, network");
  expect(prepare).toContain("No\nnetwork, install, credential use, signoff, push");
  expect(prepare).not.toContain("network and external caches unless separately approved");
  expect(prepare).toContain("Never add or amend a legal signoff");
  expect(prepare).toContain(
    "restore each preimage only when current bytes still\n   equal this invocation's owned postimage",
  );
  expect(prepare).toContain("`PREPARED` means no partial mutation survives");
  expect(submit).toContain("Every legal or remote mutation receives\nfresh action-specific approval");
  expect(respond).toContain("one approval never carries to another");
  expect(recon).toContain("exactly one `SCANNED`, `BLOCKED`, `REFUSED`, or `FAILED` receipt");
  expect(recon).toContain("exact immutable ordered GET endpoints");
  expect(recon).toContain("run --expect-plan");
  expect(propose).toContain("exactly one `PROPOSED`, `REDIRECTED`, `BLOCKED`, or `REFUSED` receipt");
  expect(prepare).toContain("exactly one `PREPARED`, `BLOCKED`, `REFUSED`, or `RECOVERY_REQUIRED`");
  expect(submit).toContain("exactly one `SUBMITTED`, `BLOCKED`, `REFUSED`, or `RECOVERY_REQUIRED`");
  expect(respond).toContain("exactly one `UPDATED`, `DRAFTED`, `BLOCKED`, `REFUSED`, or");
});

test("shared handoff is exact and grants no next-stage authority", async () => {
  const canonical = await readFile(path.join(root, "shared/references/contribution-handoff.md"), "utf8");
  for (const owner of owners) {
    expect(await source(owner, "references/contribution-handoff.md")).toBe(canonical);
    expect(await source(owner, "references/runtime-trust.md")).toBe(
      await readFile(path.join(root, "shared/references/runtime-trust.md"), "utf8"),
    );
  }
  const compact = canonical.replace(/\s+/g, " ");
  expect(compact).toContain("Reading a predecessor proves history, not approval");
  expect(compact).toContain("expected-preimage-to-owned-postimage CAS");
  expect(compact).toContain("Never claim multi-file atomicity");
  expect(compact).toContain("preserve concurrent replacements");
});

test("outward legal and mutation boundaries require fresh exact approval", async () => {
  const submit = (await source("tailrocks-contribute-submit")).replace(/\s+/g, " ");
  const respond = (await source("tailrocks-contribute-respond")).replace(/\s+/g, " ");
  expect(submit).toContain("fresh user approval for this exact submission");
  expect(submit).toContain("separate exact human attestation");
  expect(submit).toContain("fresh push approval");
  expect(submit).toContain("fresh PR creation approval");
  expect(submit).toContain(
    "Any changed claim, ownership, policy, base, remote, or open-PR cap invalidates submission",
  );
  expect(submit).toContain("never claim rollback");
  expect(respond).toContain("require a separate fresh approval");
  expect(respond).toContain("Never batch authority across messages or endpoints");
  expect(respond).toContain("deduplicate by immutable remote ID/body hash before retry");
});

test("old public contribution owner is absent", async () => {
  for (const relative of ["SKILL.md", "agents/openai.yaml"])
    expect(await Bun.file(path.join(root, "skills/tailrocks-contribute", relative)).exists()).toBe(false);
  for (const file of ["AGENTS.md", "INSTALL.md", "README.md", "catalog.json", "invocation-registry.json"])
    expect(await readFile(path.join(root, file), "utf8")).not.toMatch(/tailrocks-contribute(?:["`\s/]|$)/);
});

test("all five owners are manual-only catalogued and generated", async () => {
  const registry = JSON.parse(await readFile(path.join(root, "invocation-registry.json"), "utf8")) as {
    owners: Array<{ skill: string; class: string }>;
  };
  const catalog = await readFile(path.join(root, "catalog.json"), "utf8");
  for (const owner of owners) {
    expect(registry.owners).toContainEqual({ skill: owner, class: "MANUAL_ONLY" });
    expect(catalog).toContain(owner);
    expect(await source(owner, "agents/openai.yaml")).toContain("allow_implicit_invocation: false");
  }
});

test("five direct stage entrypoints share one closed core without an umbrella dispatcher", async () => {
  const core = await readFile(path.join(root, "scripts/contribution-stage-core.ts"), "utf8");
  expect(core).toContain(
    'export type ContributionStage = "recon" | "propose" | "prepare" | "submit" | "respond"',
  );
  expect(core).toContain("propose: []");
  expect(core).toContain("prepare: []");
  expect(core).toContain('submit: ["PUSH", "CREATE_PR"]');
  expect(core).toContain('respond: ["GET"]');
  for (const owner of owners) {
    const stage = owner.replace("tailrocks-contribute-", "");
    const entrypoint = `scripts/contribute-${stage}.ts`;
    expect(await Bun.file(path.join(root, "skills", owner, entrypoint)).exists()).toBe(true);
    expect(await source(owner)).toContain(entrypoint);
    expect(await source(owner)).toContain("`tailrocks.contribution-stage-input/v1`");
    expect(await source(owner)).toContain("`tailrocks.contribution-stage/v1`");
  }
  expect(await Bun.file(path.join(root, "skills/tailrocks-contribute/SKILL.md")).exists()).toBe(false);
  expect(await Bun.file(path.join(root, "scripts/contribute.ts")).exists()).toBe(false);
});
