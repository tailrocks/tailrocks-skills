import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

async function read(path: string): Promise<string> {
  return readFile(path, "utf8");
}

test("merge skill keeps judgment while one typed command owns irreversible mechanics", async () => {
  const skill = await read("skills/tailrocks-merge-pr/SKILL.md");
  const loader = await read("scripts/merge-pr.ts");
  const transaction = await read("scripts/merge-pr-core.ts");
  const preflight = await read("scripts/merge-preflight.ts");
  expect(skill).toContain("installed\n   merge-pr TypeScript entrypoint");
  expect(skill).not.toContain("`gh pr merge`");
  expect(transaction.match(/"merge"/g)?.length).toBeGreaterThan(0);
  expect(transaction).toContain("expectedHeadOid: request.head");
  expect(transaction).toContain("mergeMethod: request.method.toUpperCase()");
  expect(transaction).toContain('code: "merge_uncertain"');
  expect(loader.indexOf("await verifyInstalled(process.argv[1]!, args[1]!)")).toBeLessThan(
    loader.indexOf('await import("./merge-pr-core")'),
  );
  expect(preflight).not.toContain('"gh", "pr", "merge"');
});

test("merge transaction exposes one closed request and receipt route", async () => {
  const source = await read("scripts/merge-pr-core.ts");
  const tasks = await read("mise.toml");
  const registry = JSON.parse(await read("invocation-registry.json")) as {
    owners: { skill: string; class: string }[];
  };
  expect(source).toContain('"tailrocks.merge-pr-request/v1"');
  expect(source).toContain('"tailrocks.merge-pr/v1"');
  expect(source).toContain('exactKeys(input, expected, "request")');
  expect(tasks).toContain('[tasks."pr:merge"]');
  expect(registry.owners.filter((entry) => entry.skill === "tailrocks-merge-pr")).toEqual([
    { skill: "tailrocks-merge-pr", class: "MANUAL_ONLY" },
  ]);
});
