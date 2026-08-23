import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const read = (relative: string): Promise<string> => readFile(path.join(root, relative), "utf8");

test("human blessing remains external and blocks both baseline owners", async () => {
  const [shared, mac, web] = await Promise.all([
    read("shared/references/design-pipeline.md"),
    read("skills/tailrocks-macos-visual-baseline/references/design-pipeline.md"),
    read("skills/tailrocks-web-visual-baseline/references/design-pipeline.md"),
  ]);
  expect(mac).toBe(shared);
  expect(web).toBe(shared);
  const compact = shared.replace(/\s+/g, " ");
  expect(compact).toContain("the user signs off");
  expect(compact).toContain("An agent never blesses its own output");
  expect(compact).toContain("Missing blessing blocks the freeze");
  expect(await read("skills/tailrocks-macos-visual-baseline/SKILL.md")).toContain(
    "revision-mismatched blessing is",
  );
  expect(await read("skills/tailrocks-web-visual-baseline/SKILL.md")).toContain(
    "Every screen must carry a recorded human blessing",
  );
  const signoff = await read("skills/tailrocks-macos-design/templates/SIGNOFF.md");
  for (const field of [
    "Prototype identity",
    "Git revision",
    "package-tree SHA-256",
    "Acceptance review",
    "`PASS`",
    "reviewer",
    "live session identity",
  ])
    expect(signoff).toContain(field);
  const webManifest = await read("skills/tailrocks-web-design/references/screen-package.md");
  for (const field of ["Revision", "Component hash", "Fixture hash", "Registry hash", "Blessed matrix"])
    expect(webManifest).toContain(field);
});

test("macOS capture binds exact process and window identities", async () => {
  const capture = await read("scripts/macos-visual-qa/templates/capture.sh");
  const launcher = await read("scripts/macos-visual-qa/templates/app-launcher.swift");
  const processOwner = await read("scripts/macos-visual-qa/templates/process-owner.swift");
  const window = await read("scripts/macos-visual-qa/templates/window-id.swift");
  expect(launcher).toContain("preexisting exact-owned process");
  expect(launcher).toContain("owned app launch became ambiguous");
  expect(capture).toContain('"$PROCESS_TOOL" terminate "$EXECUTABLE_REAL" "$cleanup_pid" "$cleanup_token"');
  expect(capture).toContain('screencapture -x -o -l "$WID"');
  expect(capture).toContain('"$PROCESS_TOOL" verify');
  expect(processOwner).toContain("process identity changed");
  expect(window).toContain("ambiguous windows for exact pid");
});

test("macOS appearance transaction restores the exact typed registry", async () => {
  const state = await read("scripts/macos-visual-qa/templates/state.sh");
  for (const key of [
    "increaseContrast",
    "reduceTransparency",
    "reduceMotion",
    "differentiateWithoutColor",
    "AppleInterfaceStyle",
    "AppleInterfaceStyleSwitchesAutomatically",
  ])
    expect(state).toContain(key);
  expect(state).toContain("trap cleanup EXIT INT TERM");
  expect(state).toContain('restore "$before" "$applied"');
  expect(state).toContain("restore conflict:");
});

test("web capture refuses occupied stale and replaced owned servers", async () => {
  const capture = await read("scripts/web-visual-qa/capture.ts");
  const fixture = await read("scripts/web-visual-qa/templates/tests/visual/guarded-test.ts");
  expect(capture).toContain('"wrong_server"');
  expect(capture).toContain("port ${options.port} already serves HTTP");
  expect(capture).toContain("guard identity mismatch");
  expect(capture).toContain("owned guard or source changed after capture");
  expect(fixture.match(/await verifyGuard\(\)/g)).toHaveLength(2);
});

test("macOS region-specific structural and pixel oracles survive the split", async () => {
  const [owner, baseline, regression] = await Promise.all([
    read("skills/tailrocks-macos-design/references/match-policy.md"),
    read("skills/tailrocks-macos-visual-baseline/references/match-policy.md"),
    read("skills/tailrocks-macos-visual-regression/references/match-policy.md"),
  ]);
  expect(baseline).toBe(owner);
  expect(regression).toBe(owner);
  expect(await read("skills/tailrocks-macos-visual-baseline/SKILL.md")).toContain(
    "[`match-policy.md`](references/match-policy.md)",
  );
  expect(await read("skills/tailrocks-macos-visual-regression/SKILL.md")).toContain(
    "[`match-policy.md`](references/match-policy.md)",
  );
  expect(owner).toContain("`CUSTOM` and content regions");
  expect(owner).toContain("**Pixel, budgeted.**");
  expect(owner).toContain("`NATIVE` and `NATIVE-COMPOSED`");
  expect(owner).toContain("**Structural.**");
});

test("web masks and pixel budgets remain recorded contract fields", async () => {
  const [baseline, regression] = await Promise.all([
    read("skills/tailrocks-web-visual-baseline/references/screenshot-baselines.md"),
    read("skills/tailrocks-web-visual-regression/references/screenshot-baselines.md"),
  ]);
  for (const phrase of ["screen × state × viewport × theme", "maxDiffPixels: 100", "mask", "reason"])
    expect(baseline).toContain(phrase);
  expect(regression).toContain("maxDiffPixels: 100");
  expect(regression).toContain("wrong servers");
});
