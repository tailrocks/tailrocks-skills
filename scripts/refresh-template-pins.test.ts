import { expect, test } from "bun:test";

import {
  applyMiseBun,
  applyMiseOxfmt,
  applyPins,
  consistencyMismatches,
  ledgerRows,
  rustConsistencyProblems,
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

test("syncs the repository's own oxfmt to the template's devDependency", () => {
  const mise = `[tools]\nbun = "1.4.0"\n"npm:oxfmt" = "0.63.0"\n`;
  expect(applyMiseOxfmt(mise, "0.65.0")).toContain(`"npm:oxfmt" = "0.65.0"`);
  // Only the oxfmt line moves; other pinned tools are not this helper's business.
  expect(applyMiseOxfmt(mise, "0.65.0")).toContain(`bun = "1.4.0"`);
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

test("consistency check is silent when the policy documents sources, not versions", () => {
  const template = `{ "packageManager": "bun@1.4.0", "devDependencies": { "vite": "8.2.2" } }`;
  // The policy's own rule is that templates/package.json is the only exact pin
  // source, so its table lists primary release sources under the same labels.
  const policy = `## Primary release sources\n\n| Component | Primary source |\n|---|---|\n| Bun | <https://bun.sh/blog> |\n| Vite | <https://vite.dev/releases> |\n`;
  expect(consistencyMismatches(template, policy)).toEqual([]);
});

test("consistency check is silent when the policy carries no version table", () => {
  const template = `{ "packageManager": "bun@1.4.0", "devDependencies": { "vite": "8.2.2" } }`;
  const policy = `# Version policy\n\nSources of truth only, no numbers.\n`;
  // A row that does not exist is not a disagreement: the template is the ledger.
  expect(consistencyMismatches(template, policy)).toEqual([]);
});

test("ledger check flags a version carried in a policy table", () => {
  const ledger = `## Verified 2026-08-21\n\n| Component | Current stable | Primary source |\n|---|---:|---|\n| Rust | 1.98.0 | <https://forge.rust-lang.org/> |\n`;
  expect(ledgerRows(ledger)).toHaveLength(1);
  expect(ledgerRows(ledger)[0]).toContain("1.98.0");
});

test("ledger check accepts a policy table that carries only sources", () => {
  const sources = `## Primary release sources\n\n| Component | Primary source |\n|---|---|\n| Rust | <https://forge.rust-lang.org/> |\n| Tokio | <https://crates.io/crates/tokio> |\n`;
  expect(ledgerRows(sources)).toEqual([]);
});

const agreeing = {
  toolchain: `[toolchain]\nchannel = "1.98.0"\n`,
  cargo: `[workspace.package]\nrust-version = "1.98.0"\n`,
  clippy: `msrv = "1.98.0"\n`,
  mise: `"cargo:cargo-dylint" = "6.0.4"\n"cargo:dylint-link" = "6.0.4"\n`,
};

test("rust consistency is silent when every copy of the pin agrees", () => {
  expect(rustConsistencyProblems(agreeing)).toEqual([]);
});

test("rust consistency catches a half-applied toolchain bump", () => {
  // Note what this does NOT catch: the drift that motivated the gate was
  // prose-only — every artifact agreed on 1.97.0 while the policy table read
  // 1.98.0 — so `ledgerRows` is what would have caught that, not this. This
  // half catches the next failure instead: someone moves the channel and
  // leaves the two files that must track it behind.
  const problems = rustConsistencyProblems({
    ...agreeing,
    cargo: `rust-version = "1.97.0"\n`,
    clippy: `msrv = "1.97.0"\n`,
  });
  expect(problems).toHaveLength(2);
  expect(problems.join(" ")).toContain("rust-version 1.97.0");
  expect(problems.join(" ")).toContain("msrv 1.97.0");
});

test("rust consistency catches a split dylint pair", () => {
  const problems = rustConsistencyProblems({
    ...agreeing,
    mise: `"cargo:cargo-dylint" = "6.0.4"\n"cargo:dylint-link" = "6.0.1"\n`,
  });
  expect(problems).toHaveLength(1);
  expect(problems[0]).toContain("dylint-link 6.0.1");
});

test("applyPins never rewrites a package name used as a script command", () => {
  // The template's scripts block has `"shadcn": "bunx --bun shadcn"`. A blind
  // key match turns that command into a version and breaks the scaffold's own
  // script — silently, in an auto-opened bump pull request.
  const template = `{
  "scripts": { "shadcn": "bunx --bun shadcn" },
  "dependencies": { "shadcn": "4.17.0" }
}`;
  const out = applyPins(template, new Map([["shadcn", "4.18.0"]]));
  expect(out).toContain(`"shadcn": "bunx --bun shadcn"`);
  expect(out).toContain(`"shadcn": "4.18.0"`);
});

test("applyPins rewrites a range-prefixed pin", () => {
  const out = applyPins(`{ "dependencies": { "vite": "^8.2.1" } }`, new Map([["vite", "8.2.2"]]));
  expect(out).toContain(`"vite": "8.2.2"`);
});
