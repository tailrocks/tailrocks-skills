import { expect, test } from "bun:test";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const templatePath = path.join(
  root,
  "skills",
  "tailrocks-tanstack-project-setup",
  "templates",
  "package.json",
);
const versionPolicyPath = path.join(
  root,
  "skills",
  "tailrocks-tanstack-project-setup",
  "references",
  "version-policy.md",
);

test("TanStack template and repository tool version sources stay synchronized", async () => {
  const [template, miseToml, miseLock, versionPolicy] = await Promise.all([
    Bun.file(templatePath).json() as Promise<{
      packageManager: string;
      devDependencies: Record<string, string>;
    }>,
    Bun.file(path.join(root, "mise.toml")).text(),
    Bun.file(path.join(root, "mise.lock")).text(),
    Bun.file(versionPolicyPath).text(),
  ]);

  const bunVersion = template.packageManager.match(/^bun@(.+)$/)?.[1];
  expect(bunVersion).toBeDefined();
  expect(miseToml.match(/^"npm:oxfmt" = "([^"]+)"$/m)?.[1]).toBe(template.devDependencies.oxfmt);
  expect(miseToml.match(/^bun = "([^"]+)"$/m)?.[1]).toBe(bunVersion);
  expect(miseLock).toContain(`[[tools.bun]]\nversion = "${bunVersion}"`);
  expect(miseLock).toContain(`[[tools."npm:oxfmt"]]\nversion = "${template.devDependencies.oxfmt}"`);
  expect(versionPolicy).toContain("is the only exact package-pin source for this family");
  expect(versionPolicy).toContain("../../tailrocks-tanstack-project-setup/templates/package.json");
  expect(versionPolicy).toContain("The repository's `mise.toml` owns its tool pins.");
  expect(versionPolicy).not.toMatch(/\b\d+\.\d+\.\d+\b/);
});
