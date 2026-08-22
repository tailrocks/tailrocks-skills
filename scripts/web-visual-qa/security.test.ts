import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const templates = path.join(import.meta.dir, "templates");

test("configuration has no reusable server and blocks service workers", async () => {
  const source = await readFile(path.join(templates, "playwright.visual.config.ts"), "utf8");
  expect(source).not.toContain("webServer");
  expect(source).not.toContain("reuseExistingServer");
  expect(source).toContain('serviceWorkers: "block"');
  expect(source).toContain("TAILROCKS_VISUAL_QA_BASE_URL");
});

test("guard is server-only, private-session gated, exact revision and pid", async () => {
  const source = await readFile(path.join(templates, "src/routes/api.tailrocks-visual-qa.ts"), "utf8");
  expect(source).toContain('process.env.TAILROCKS_VISUAL_QA !== "1"');
  expect(source).toContain("TAILROCKS_VISUAL_QA_NONCE");
  expect(source).toContain("TAILROCKS_VISUAL_QA_REVISION");
  expect(source).toContain("pid: process.pid");
  expect(source).toContain('"Cache-Control": "no-store"');
  expect(source).not.toMatch(/VITE_.*NONCE/);
});

test("every visual test proves guard before and after and checks origin", async () => {
  const fixture = await readFile(path.join(templates, "tests/visual/guarded-test.ts"), "utf8");
  expect(fixture.match(/await verifyGuard\(\)/g)).toHaveLength(2);
  expect(fixture).toContain("new URL(page.url()).origin");
  expect(fixture).toContain('redirect: "manual"');
  const spec = await readFile(path.join(templates, "tests/visual/settings.spec.ts"), "utf8");
  expect(spec).toContain('from "./guarded-test"');
  expect(spec).not.toContain('from "@playwright/test"');
});

test("supervisor uses exact Vite, strict loopback, source digest, and bounded cleanup", async () => {
  const source = await readFile(path.join(import.meta.dir, "capture.ts"), "utf8");
  expect(source).toContain("node_modules/vite/bin/vite.js");
  expect(source).toContain("node_modules/@playwright/test/cli.js");
  expect(source).toContain("realpath(process.execPath)");
  expect(source).not.toContain('"bun",\n      "x"');
  expect(source).toContain('"--strictPort"');
  expect(source).toContain('"ls-files"');
  expect(source).toContain('createHash("sha256")');
  expect(source).toContain("attempt < 100");
  expect(source).toContain("attempt < 20");
  expect(source).not.toContain("reuseExistingServer");
  expect(source).not.toContain("bun run dev");
});
