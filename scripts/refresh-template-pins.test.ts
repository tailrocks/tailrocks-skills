import { expect, test } from "bun:test";

import {
  applyMiseBun,
  applyPins,
  applyPolicy,
  consistencyMismatches,
  POLICY_ROWS,
  templateBun,
} from "./refresh-template-pins";

const latest = new Map([
  ["bun", "1.4.0"],
  ["vite", "8.2.2"],
  ["@tanstack/react-router", "1.170.31"],
]);

test("rewrites the packageManager pin and dependency pins", () => {
  const template = `{
  "packageManager": "bun@1.3.14",
  "dependencies": { "@tanstack/react-router": "1.170.29" },
  "devDependencies": { "vite": "8.2.1", "@types/bun": "1.3.14" }
}`;
  const out = applyPins(template, latest);
  expect(out).toContain(`"packageManager": "bun@1.4.0"`);
  expect(out).toContain(`"@tanstack/react-router": "1.170.31"`);
  expect(out).toContain(`"vite": "8.2.2"`);
  // A package the registry did not report keeps whatever it was pinned at.
  expect(out).toContain(`"@types/bun": "1.3.14"`);
});

test("leaves a template alone when every pin is already current", () => {
  const template = `{ "packageManager": "bun@1.4.0", "dependencies": { "vite": "8.2.2" } }`;
  expect(applyPins(template, latest)).toBe(template);
});

test("rewrites policy rows and the verification date", () => {
  const policy = `## Verified 2026-07-23

| Component | Current stable | Primary source |
|---|---:|---|
| Bun | 1.3.14 | <https://bun.sh/blog> |
| Vite | 8.1.5 | <https://vite.dev/releases> |
| Knip | 6.29.0 | <https://github.com/webpro-nl/knip/releases> |
`;
  const out = applyPolicy(policy, latest, "2026-08-21");
  expect(out).toContain("## Verified 2026-08-21");
  expect(out).toContain("| Bun | 1.4.0 |");
  expect(out).toContain("| Vite | 8.2.2 |");
  // Rows the registry did not answer for are left untouched rather than blanked.
  expect(out).toContain("| Knip | 6.29.0 |");
});

test("every policy row maps to a package the resolver can query", () => {
  expect(POLICY_ROWS.every(([label, name]) => label.length > 0 && name.length > 0)).toBeTrue();
  expect(new Set(POLICY_ROWS.map(([, name]) => name)).size).toBe(POLICY_ROWS.length);
});

test("syncs the repository's own bun to the template's packageManager", () => {
  const mise = `[tools]\nbun = "1.3.14"\n"npm:oxfmt" = "0.63.0"\n`;
  expect(applyMiseBun(mise, "1.4.0")).toContain(`bun = "1.4.0"`);
  // Only the bun line moves; other pinned tools are not this script's business.
  expect(applyMiseBun(mise, "1.4.0")).toContain(`"npm:oxfmt" = "0.63.0"`);
});

test("reads the bun version out of a template's packageManager field", () => {
  expect(templateBun(`{ "packageManager": "bun@1.4.0" }`)).toBe("1.4.0");
  expect(templateBun(`{ "name": "x" }`)).toBeNull();
});

test("consistency check reports a policy row that disagrees with the template", () => {
  const template = `{ "packageManager": "bun@1.4.0", "devDependencies": { "vite": "8.2.2" } }`;
  const policy = `## Verified 2026-08-21\n\n| Bun | 1.3.14 | <https://bun.sh/blog> |\n| Vite | 8.2.2 | <x> |\n`;
  const mismatches = consistencyMismatches(template, policy);
  expect(mismatches).toHaveLength(1);
  expect(mismatches[0]).toMatchObject({ label: "Bun", policy: "1.3.14", template: "1.4.0" });
});

test("consistency check is silent when the policy carries no version table", () => {
  const template = `{ "packageManager": "bun@1.4.0", "devDependencies": { "vite": "8.2.2" } }`;
  const policy = `# Version policy\n\nSources of truth only, no numbers.\n`;
  // A row that does not exist is not a disagreement: the template is the ledger.
  expect(consistencyMismatches(template, policy)).toEqual([]);
});
