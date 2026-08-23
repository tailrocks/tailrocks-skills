import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");

test("create-pr skill delegates every remote mutation to its direct entrypoint", async () => {
  const skill = await readFile(path.join(root, "skills/tailrocks-create-pr/SKILL.md"), "utf8");
  expect(skill).toContain("scripts/create-pr.ts --skill-file");
  expect(skill).toContain("tailrocks.gate-proof/v1");
  expect(skill).toContain("Failed or vacuous");
  expect(skill).toContain("Do not call `git push`, `gh pr create`");
  expect(skill).not.toContain("**Commit and push.**");
  expect(skill).not.toContain("`gh pr edit --body-file`");
});

test("entrypoint owns exact non-force push, body file, and rendered identity proof", async () => {
  const source = await readFile(path.join(root, "scripts/create-pr.ts"), "utf8");
  expect(source).toContain('"tailrocks.create-pr-input/v1"');
  expect(source).toContain('"tailrocks.create-pr/v1"');
  expect(source).toContain('"tailrocks.gate-proof/v1"');
  expect(source).toContain('"--body-file"');
  expect(source).toContain(
    '"body,headRefName,headRefOid,baseRefName,baseRefOid,url,title,isDraft,author,state"',
  );
  expect(source).not.toContain('"--force"');
  expect(source).not.toContain('"--body"');
});

test("direct command is documented without deprecated aliases", async () => {
  const readme = await readFile(path.join(root, "scripts/create-pr/README.md"), "utf8");
  expect(readme).toContain("bun scripts/create-pr.ts --skill-file");
  expect(readme).toContain("performs no remote mutation");
  expect(readme).not.toMatch(/alias|deprecated/i);
});
